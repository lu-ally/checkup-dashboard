import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const coachFilter = searchParams.get('coach')

    let whereClause: any = {}

    // Role-based access control
    if (session.user.role === 'COACH') {
      // Coaches can only see their own client data
      whereClause.coachId = session.user.id
    } else if (session.user.role === 'ADMIN' && coachFilter) {
      // Admins can filter by coach
      whereClause.coachId = coachFilter
    }

    const clientData = await prisma.clientData.findMany({
      where: whereClause,
      include: {
        coach: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        timestamp: 'desc'
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