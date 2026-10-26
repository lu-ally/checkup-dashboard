import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface ExtendedUser {
  id: string
  name?: string | null
  email?: string | null
  role?: string
}

interface ExtendedSession {
  user: ExtendedUser
}

export async function GET(request: NextRequest) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const session = (await getServerSession(authOptions as any)) as ExtendedSession | null

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const coachFilter = searchParams.get('coach')

    const includeDeleted = searchParams.get('includeDeleted') === 'true'

    const whereClause: { coachName?: string; inClientList?: boolean } = {}

    // Klient:innen, die nicht in der Klient:innen-Liste stehen, nur auf Wunsch
    if (!includeDeleted) {
      whereClause.inClientList = true
    }

    // Role-based access control
    if (session.user.role === 'COACH') {
      // Coaches can only see their own client data
      whereClause.coachName = session.user.name || undefined
    } else if (session.user.role === 'ADMIN' && coachFilter) {
      // Admins can filter by coach name
      whereClause.coachName = coachFilter
    }

    const clientData = await prisma.client.findMany({
      where: whereClause,
      include: {
        assessments: {
          orderBy: {
            timepoint: 'asc'
          }
        }
      },
      orderBy: {
        registrationDate: 'desc'
      }
    })

    return NextResponse.json(clientData)
  } catch (error) {
    console.error('Error fetching client data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch client data' },
      { status: 500 }
    )
  }
}