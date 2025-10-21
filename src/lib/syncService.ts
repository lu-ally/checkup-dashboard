import { googleSheetsService } from './googleSheets'
import { prisma } from './prisma'
import type { ClientData } from './googleSheets'

export interface SyncResult {
  success: boolean
  clientsCreated: number
  assessmentsCreated: number
  totalClients: number
  duration: number
  error?: string
}

export interface SyncStats {
  fetchDuration: number
  deleteDuration: number
  insertDuration: number
  totalDuration: number
}

/**
 * Optimierte Synchronisations-Funktion für Google Sheets Daten
 *
 * Performance-Optimierungen:
 * - Batch-Inserts statt sequenzieller Operationen
 * - Transaktionssicherheit
 * - Detailliertes Performance-Logging
 */
export async function syncClientDataFromSheets(): Promise<SyncResult> {
  const startTime = Date.now()
  const stats: SyncStats = {
    fetchDuration: 0,
    deleteDuration: 0,
    insertDuration: 0,
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
        clientsCreated: 0,
        assessmentsCreated: 0,
        totalClients: 0,
        duration: Date.now() - startTime
      }
    }

    // Step 2: Prepare batch data
    console.log('🔄 Preparing batch data...')
    const prepareStart = Date.now()
    const { clientsToCreate, assessmentsToCreate } = prepareBatchData(clientData)
    const prepareDuration = Date.now() - prepareStart
    console.log(`✅ Prepared ${clientsToCreate.length} clients and ${assessmentsToCreate.length} assessments in ${prepareDuration}ms`)

    // Step 3: Execute database operations in transaction
    console.log('💾 Starting database transaction...')
    const dbStart = Date.now()

    const result = await prisma.$transaction(async (tx) => {
      // Delete existing data
      const deleteStart = Date.now()
      await tx.assessment.deleteMany()
      await tx.client.deleteMany()
      stats.deleteDuration = Date.now() - deleteStart
      console.log(`🗑️  Cleared existing data in ${stats.deleteDuration}ms`)

      // Insert clients in batch
      const insertStart = Date.now()
      const clientResult = await tx.client.createMany({
        data: clientsToCreate
      })
      console.log(`✅ Created ${clientResult.count} clients`)

      // Insert assessments in batch
      const assessmentResult = await tx.assessment.createMany({
        data: assessmentsToCreate
      })
      console.log(`✅ Created ${assessmentResult.count} assessments`)

      stats.insertDuration = Date.now() - insertStart

      return {
        clientsCreated: clientResult.count,
        assessmentsCreated: assessmentResult.count
      }
    })

    const dbDuration = Date.now() - dbStart
    stats.totalDuration = Date.now() - startTime

    console.log(`✅ Transaction completed in ${dbDuration}ms`)
    console.log(`📊 Total sync duration: ${stats.totalDuration}ms`)
    console.log(`   - Fetch: ${stats.fetchDuration}ms`)
    console.log(`   - Delete: ${stats.deleteDuration}ms`)
    console.log(`   - Insert: ${stats.insertDuration}ms`)

    return {
      success: true,
      clientsCreated: result.clientsCreated,
      assessmentsCreated: result.assessmentsCreated,
      totalClients: clientData.length,
      duration: stats.totalDuration
    }

  } catch (error) {
    const duration = Date.now() - startTime
    console.error(`❌ Sync failed after ${duration}ms:`, error)

    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    return {
      success: false,
      clientsCreated: 0,
      assessmentsCreated: 0,
      totalClients: 0,
      duration,
      error: errorMessage
    }
  }
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
