import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { rateLimit, getClientIp } from '@/lib/rate-limit'
import { syncClientDataFromSheets } from '@/lib/syncService'

export async function POST(request: NextRequest) {
  try {
    // Authentication check
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Rate limiting: 3 sync operations per hour
    const clientIp = getClientIp(request)
    const rateLimitResult = rateLimit(
      `sync:${session.user.id}:${clientIp}`,
      3,
      60 * 60 * 1000 // 1 hour
    )

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: rateLimitResult.error },
        {
          status: 429,
          headers: rateLimitResult.headers
        }
      )
    }

    console.log('🚀 Starting optimized data synchronization...')

    // Use optimized sync service
    const result = await syncClientDataFromSheets()

    if (!result.success) {
      return NextResponse.json(
        {
          error: 'Failed to sync detailed data',
          details: result.error
        },
        { status: 500 }
      )
    }

    console.log(`✅ Sync completed successfully in ${result.duration}ms`)

    return NextResponse.json({
      message: 'Detailed data synchronized successfully',
      clientsCreated: result.clientsCreated,
      assessmentsCreated: result.assessmentsCreated,
      totalClients: result.totalClients,
      duration: `${result.duration}ms`
    })

  } catch (error) {
    console.error('❌ Detailed sync error:', error)

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