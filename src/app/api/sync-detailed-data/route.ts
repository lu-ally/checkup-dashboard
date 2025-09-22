import { NextResponse } from 'next/server'
import { googleSheetsService } from '@/lib/googleSheets'
import { prisma } from '@/lib/prisma'

export async function POST() {
  try {
    console.log('Starting detailed multi-tab data synchronization...')

    // Fetch data from all tabs
    const clientData = await googleSheetsService.fetchClientDataFromMultipleTabs()
    console.log(`Fetched detailed data for ${clientData.length} clients`)

    // Clear existing data
    await prisma.assessment.deleteMany()
    await prisma.client.deleteMany()
    console.log('Cleared existing detailed data')

    let clientsCreated = 0
    let assessmentsCreated = 0

    for (const client of clientData) {
      try {
        // Create client overview
        await prisma.client.create({
          data: {
            clientId: client.overview.clientId,
            clientName: client.overview.clientName,
            coachName: client.overview.coachName,
            status: client.overview.status,
            registrationDate: client.overview.registrationDate,
            weeks: client.overview.weeks,
            chatLink: client.overview.chatLink,
            wellbeingT0Basic: client.overview.wellbeingT0Basic,
            wellbeingT4Basic: client.overview.wellbeingT4Basic,
          }
        })
        clientsCreated++

        // Create T0 assessment if available
        if (client.assessmentT0) {
          await prisma.assessment.create({
            data: {
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
            }
          })
          assessmentsCreated++
        }

        // Create T4 assessment if available
        if (client.assessmentT4) {
          await prisma.assessment.create({
            data: {
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
              // T4-specific fields
              trust: client.assessmentT4.trust,
              genuineInterest: client.assessmentT4.genuineInterest,
              mutualUnderstanding: client.assessmentT4.mutualUnderstanding,
              goalAlignment: client.assessmentT4.goalAlignment,
              learningExperience: client.assessmentT4.learningExperience,
              progressAchievement: client.assessmentT4.progressAchievement,
              generalSatisfaction: client.assessmentT4.generalSatisfaction,
            }
          })
          assessmentsCreated++
        }

      } catch (error) {
        console.error(`Error processing client ${client.overview.clientId}:`, error)
      }
    }

    console.log('Detailed data synchronization completed successfully')

    return NextResponse.json({
      message: 'Detailed data synchronized successfully',
      clientsCreated,
      assessmentsCreated,
      totalClients: clientData.length
    })

  } catch (error) {
    console.error('Detailed sync error:', error)

    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    return NextResponse.json(
      {
        error: 'Failed to sync detailed data',
        details: errorMessage
      },
      { status: 500 }
    )
  }
}