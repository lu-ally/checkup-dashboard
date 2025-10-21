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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const session = (await getServerSession(authOptions as any)) as ExtendedSession | null

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { clientId } = await params

    // Fetch client data with assessments
    const client = await prisma.client.findUnique({
      where: {
        clientId: clientId
      },
      include: {
        assessments: {
          orderBy: {
            timepoint: 'asc'
          }
        }
      }
    })

    if (!client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      )
    }

    // Role-based access control
    if (session.user.role === 'COACH') {
      // Coaches can only see their own clients
      if (client.coachName !== session.user.name) {
        return NextResponse.json(
          { error: 'Access denied' },
          { status: 403 }
        )
      }
    }

    // Admins can see all clients
    return NextResponse.json(client)

  } catch (error) {
    console.error('Error fetching client details:', error)
    return NextResponse.json(
      { error: 'Failed to fetch client details' },
      { status: 500 }
    )
  }
}
