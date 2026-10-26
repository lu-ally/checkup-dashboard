import { googleSheetsService } from './googleSheets'
import { prisma } from './prisma'
import type { ClientData } from './googleSheets'

export interface SyncResult {
  success: boolean
  clientsCreated: number
  clientsUpdated: number
  clientsDeleted: number
  assessmentsCreated: number
  assessmentsUpdated: number
  assessmentsDeleted: number
  totalClients: number
  totalAssessments: number
  duration: number
  error?: string
}

export interface SyncStats {
  fetchDuration: number
  diffDuration: number
  writeDuration: number
  totalDuration: number
}

type ClientRow = ReturnType<typeof prepareBatchData>['clientsToCreate'][number]
type AssessmentRow = ReturnType<typeof prepareBatchData>['assessmentsToCreate'][number]

const emptyCounts = {
  clientsCreated: 0,
  clientsUpdated: 0,
  clientsDeleted: 0,
  assessmentsCreated: 0,
  assessmentsUpdated: 0,
  assessmentsDeleted: 0,
}

/**
 * Optimierte Synchronisations-Funktion für Google Sheets Daten
 *
 * Performance-Optimierungen:
 * - Diff-Sync: nur neue, geänderte und entfernte Zeilen werden geschrieben
 *   (spart Disk IO gegenüber komplettem Löschen und Neuschreiben)
 * - Batch-Inserts für neue Zeilen
 * - Transaktionssicherheit
 * - Detailliertes Performance-Logging
 */
export async function syncClientDataFromSheets(): Promise<SyncResult> {
  const startTime = Date.now()
  const stats: SyncStats = {
    fetchDuration: 0,
    diffDuration: 0,
    writeDuration: 0,
    totalDuration: 0
  }

  try {
    // Step 1: Fetch data from Google Sheets
    console.log('📥 Fetching data from Google Sheets...')
    const fetchStart = Date.now()
    const clientData = await googleSheetsService.fetchClientDataFromMultipleTabs()
    stats.fetchDuration = Date.now() - fetchStart
    console.log(`✅ Fetched ${clientData.length} clients in ${stats.fetchDuration}ms`)

    if (clientData.length === 0) {
      return {
        success: true,
        ...emptyCounts,
        totalClients: 0,
        totalAssessments: 0,
        duration: Date.now() - startTime
      }
    }

    // Step 2: Prepare batch data
    console.log('🔄 Preparing batch data...')
    const prepareStart = Date.now()
    const { clientsToCreate, assessmentsToCreate } = prepareBatchData(clientData)
    const prepareDuration = Date.now() - prepareStart
    console.log(`✅ Prepared ${clientsToCreate.length} clients and ${assessmentsToCreate.length} assessments in ${prepareDuration}ms`)

    // Step 3: Diff against database and write only changes
    console.log('💾 Starting database transaction...')
    const dbStart = Date.now()

    const result = await prisma.$transaction(async (tx) => {
      const diffStart = Date.now()
      const [existingClients, existingAssessments] = await Promise.all([
        tx.client.findMany(),
        tx.assessment.findMany()
      ])

      const clientDiff = diffRows(
        existingClients,
        clientsToCreate,
        (row) => row.clientId
      )
      const assessmentDiff = diffRows(
        existingAssessments,
        assessmentsToCreate,
        (row) => `${row.clientId}:${row.timepoint}`
      )

      // Assessments of removed clients must go before the clients (FK)
      const removedClientIds = new Set(clientDiff.toDelete.map((row) => row.clientId))
      const assessmentIdsToDelete = new Set(assessmentDiff.toDelete.map((row) => row.id))
      for (const assessment of existingAssessments) {
        if (removedClientIds.has(assessment.clientId)) {
          assessmentIdsToDelete.add(assessment.id)
        }
      }
      stats.diffDuration = Date.now() - diffStart
      console.log(`🔍 Diff: clients +${clientDiff.toCreate.length} ~${clientDiff.toUpdate.length} -${clientDiff.toDelete.length}, assessments +${assessmentDiff.toCreate.length} ~${assessmentDiff.toUpdate.length} -${assessmentIdsToDelete.size}`)

      const writeStart = Date.now()

      if (assessmentIdsToDelete.size > 0) {
        await tx.assessment.deleteMany({
          where: { id: { in: [...assessmentIdsToDelete] } }
        })
      }
      if (clientDiff.toDelete.length > 0) {
        await tx.client.deleteMany({
          where: { id: { in: clientDiff.toDelete.map((row) => row.id) } }
        })
      }

      for (const { id, data } of clientDiff.toUpdate) {
        await tx.client.update({ where: { id }, data })
      }
      if (clientDiff.toCreate.length > 0) {
        await tx.client.createMany({ data: clientDiff.toCreate })
      }

      for (const { id, data } of assessmentDiff.toUpdate) {
        await tx.assessment.update({ where: { id }, data })
      }
      if (assessmentDiff.toCreate.length > 0) {
        await tx.assessment.createMany({ data: assessmentDiff.toCreate })
      }

      stats.writeDuration = Date.now() - writeStart

      return {
        clientsCreated: clientDiff.toCreate.length,
        clientsUpdated: clientDiff.toUpdate.length,
        clientsDeleted: clientDiff.toDelete.length,
        assessmentsCreated: assessmentDiff.toCreate.length,
        assessmentsUpdated: assessmentDiff.toUpdate.length,
        assessmentsDeleted: assessmentIdsToDelete.size
      }
    }, {
      // Large first-time diffs may need many single updates
      timeout: 60_000
    })

    const dbDuration = Date.now() - dbStart
    stats.totalDuration = Date.now() - startTime

    console.log(`✅ Transaction completed in ${dbDuration}ms`)
    console.log(`📊 Total sync duration: ${stats.totalDuration}ms`)
    console.log(`   - Fetch: ${stats.fetchDuration}ms`)
    console.log(`   - Diff: ${stats.diffDuration}ms`)
    console.log(`   - Write: ${stats.writeDuration}ms`)

    return {
      success: true,
      ...result,
      totalClients: clientsToCreate.length,
      totalAssessments: assessmentsToCreate.length,
      duration: stats.totalDuration
    }

  } catch (error) {
    const duration = Date.now() - startTime
    console.error(`❌ Sync failed after ${duration}ms:`, error)

    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    return {
      success: false,
      ...emptyCounts,
      totalClients: 0,
      totalAssessments: 0,
      duration,
      error: errorMessage
    }
  }
}

/**
 * Vergleicht bestehende DB-Zeilen mit den Sheet-Daten anhand eines Schlüssels.
 * Nur Felder aus den Sheet-Daten werden verglichen (undefined zählt als null).
 */
function diffRows<
  TExisting extends { id: string; clientId: string },
  TIncoming extends ClientRow | AssessmentRow
>(
  existing: TExisting[],
  incoming: TIncoming[],
  keyOf: (row: { clientId: string; timepoint?: string }) => string
) {
  const existingByKey = new Map(existing.map((row) => [keyOf(row), row]))
  const incomingKeys = new Set<string>()

  const toCreate: TIncoming[] = []
  const toUpdate: Array<{ id: string; data: TIncoming }> = []

  for (const row of incoming) {
    const key = keyOf(row)
    incomingKeys.add(key)
    const current = existingByKey.get(key)
    if (!current) {
      toCreate.push(row)
    } else if (hasChanges(current as Record<string, unknown>, row as Record<string, unknown>)) {
      toUpdate.push({ id: current.id, data: row })
    }
  }

  const toDelete = existing.filter((row) => !incomingKeys.has(keyOf(row)))

  return { toCreate, toUpdate, toDelete }
}

function hasChanges(current: Record<string, unknown>, incoming: Record<string, unknown>) {
  return Object.keys(incoming).some((field) => !sameValue(current[field], incoming[field]))
}

function sameValue(a: unknown, b: unknown) {
  if (a instanceof Date || b instanceof Date) {
    return a instanceof Date && b instanceof Date && a.getTime() === b.getTime()
  }
  return (a ?? null) === (b ?? null)
}

/**
 * Bereitet Daten für Batch-Insert vor
 */
function prepareBatchData(clientData: ClientData[]) {
  const clientsToCreate: Array<{
    clientId: string
    clientName: string
    coachName: string
    status: string
    registrationDate: Date
    weeks: number
    chatLink: string
    wellbeingT0Basic: number | null
    wellbeingT4Basic: number | null
    inClientList: boolean
  }> = []

  const assessmentsToCreate: Array<{
    clientId: string
    timepoint: string
    submittedAt: Date
    wellbeing: number | null
    stress: string | null
    exhaustion: string | null
    anxiety: string | null
    depression: string | null
    selfDoubt: string | null
    sleepProblems: string | null
    tension: string | null
    irritability: string | null
    socialWithdrawal: string | null
    other: string | null
    workArea: number | null
    privateArea: number | null
    adequateSleep: string | null
    healthyEating: string | null
    sufficientRest: string | null
    exercise: string | null
    setBoundaries: string | null
    timeForBeauty: string | null
    shareEmotions: string | null
    liveValues: string | null
    trust?: string | null
    genuineInterest?: string | null
    mutualUnderstanding?: string | null
    goalAlignment?: string | null
    learningExperience?: number | null
    progressAchievement?: number | null
    generalSatisfaction?: number | null
  }> = []

  for (const client of clientData) {
    // Add client
    clientsToCreate.push({
      clientId: client.overview.clientId,
      clientName: client.overview.clientName,
      coachName: client.overview.coachName,
      status: client.overview.status,
      registrationDate: client.overview.registrationDate,
      weeks: client.overview.weeks,
      chatLink: client.overview.chatLink,
      wellbeingT0Basic: client.overview.wellbeingT0Basic,
      wellbeingT4Basic: client.overview.wellbeingT4Basic,
      inClientList: client.overview.inClientList,
    })

    // Add T0 assessment if available
    if (client.assessmentT0) {
      assessmentsToCreate.push({
        clientId: client.assessmentT0.clientId,
        timepoint: client.assessmentT0.timepoint,
        submittedAt: client.assessmentT0.submittedAt,
        wellbeing: client.assessmentT0.wellbeing,
        stress: client.assessmentT0.stress,
        exhaustion: client.assessmentT0.exhaustion,
        anxiety: client.assessmentT0.anxiety,
        depression: client.assessmentT0.depression,
        selfDoubt: client.assessmentT0.selfDoubt,
        sleepProblems: client.assessmentT0.sleepProblems,
        tension: client.assessmentT0.tension,
        irritability: client.assessmentT0.irritability,
        socialWithdrawal: client.assessmentT0.socialWithdrawal,
        other: client.assessmentT0.other,
        workArea: client.assessmentT0.workArea,
        privateArea: client.assessmentT0.privateArea,
        adequateSleep: client.assessmentT0.adequateSleep,
        healthyEating: client.assessmentT0.healthyEating,
        sufficientRest: client.assessmentT0.sufficientRest,
        exercise: client.assessmentT0.exercise,
        setBoundaries: client.assessmentT0.setBoundaries,
        timeForBeauty: client.assessmentT0.timeForBeauty,
        shareEmotions: client.assessmentT0.shareEmotions,
        liveValues: client.assessmentT0.liveValues,
      })
    }

    // Add T4 assessment if available
    if (client.assessmentT4) {
      assessmentsToCreate.push({
        clientId: client.assessmentT4.clientId,
        timepoint: client.assessmentT4.timepoint,
        submittedAt: client.assessmentT4.submittedAt,
        wellbeing: client.assessmentT4.wellbeing,
        stress: client.assessmentT4.stress,
        exhaustion: client.assessmentT4.exhaustion,
        anxiety: client.assessmentT4.anxiety,
        depression: client.assessmentT4.depression,
        selfDoubt: client.assessmentT4.selfDoubt,
        sleepProblems: client.assessmentT4.sleepProblems,
        tension: client.assessmentT4.tension,
        irritability: client.assessmentT4.irritability,
        socialWithdrawal: client.assessmentT4.socialWithdrawal,
        other: client.assessmentT4.other,
        workArea: client.assessmentT4.workArea,
        privateArea: client.assessmentT4.privateArea,
        adequateSleep: client.assessmentT4.adequateSleep,
        healthyEating: client.assessmentT4.healthyEating,
        sufficientRest: client.assessmentT4.sufficientRest,
        exercise: client.assessmentT4.exercise,
        setBoundaries: client.assessmentT4.setBoundaries,
        timeForBeauty: client.assessmentT4.timeForBeauty,
        shareEmotions: client.assessmentT4.shareEmotions,
        liveValues: client.assessmentT4.liveValues,
        trust: client.assessmentT4.trust,
        genuineInterest: client.assessmentT4.genuineInterest,
        mutualUnderstanding: client.assessmentT4.mutualUnderstanding,
        goalAlignment: client.assessmentT4.goalAlignment,
        learningExperience: client.assessmentT4.learningExperience,
        progressAchievement: client.assessmentT4.progressAchievement,
        generalSatisfaction: client.assessmentT4.generalSatisfaction,
      })
    }
  }

  return { clientsToCreate, assessmentsToCreate }
}
