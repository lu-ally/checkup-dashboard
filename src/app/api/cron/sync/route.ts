import { NextRequest, NextResponse } from 'next/server'
import { syncClientDataFromSheets } from '@/lib/syncService'

/**
 * Vercel Cron Job für tägliche Daten-Synchronisation
 *
 * Security:
 * - Nur von Vercel Cron erlaubt (Authorization Header prüfung)
 * - Läuft täglich um 02:00 UTC (03:00 MEZ / 04:00 MESZ)
 *
 * Konfiguration in vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/sync",
 *     "schedule": "0 2 * * *"
 *   }]
 * }
 */
export async function GET(request: NextRequest) {
  try {
    // Vercel Cron Security Check
    const authHeader = request.headers.get('authorization')

    // In production: Prüfe Vercel Cron Secret
    if (process.env.NODE_ENV === 'production') {
      const cronSecret = process.env.CRON_SECRET

      if (!cronSecret) {
        console.error('❌ CRON_SECRET not configured')
        return NextResponse.json(
          { error: 'Cron secret not configured' },
          { status: 500 }
        )
      }

      if (authHeader !== `Bearer ${cronSecret}`) {
        console.warn('⚠️  Unauthorized cron attempt')
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        )
      }
    }

    console.log('🕐 Starting scheduled sync job...')

    // Use optimized sync service
    const result = await syncClientDataFromSheets()

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Scheduled sync failed',
          details: result.error,
          timestamp: new Date().toISOString()
        },
        { status: 500 }
      )
    }

    console.log(`✅ Scheduled sync completed successfully`)
    console.log(`   Duration: ${result.duration}ms`)
    console.log(`   Clients: ${result.clientsCreated}`)
    console.log(`   Assessments: ${result.assessmentsCreated}`)

    return NextResponse.json({
      success: true,
      message: 'Scheduled sync completed',
      stats: {
        clientsCreated: result.clientsCreated,
        assessmentsCreated: result.assessmentsCreated,
        totalClients: result.totalClients,
        duration: `${result.duration}ms`
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Scheduled sync error:', error)

    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    return NextResponse.json(
      {
        success: false,
        error: 'Scheduled sync failed',
        details: errorMessage,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}
