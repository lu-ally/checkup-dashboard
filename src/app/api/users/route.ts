import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

// GET /api/users - Liste aller User (nur für ADMIN)
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        coachId: true,
        createdAt: true,
        updatedAt: true,
        // Passwort nicht zurückgeben
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(users)
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/users - Neuen User erstellen (nur für ADMIN)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { email, password, name, role, coachId } = body

    // Validation
    if (!email || !password || !name || !role) {
      return NextResponse.json(
        { error: 'Email, password, name and role are required' },
        { status: 400 }
      )
    }

    if (!['ADMIN', 'COACH'].includes(role)) {
      return NextResponse.json(
        { error: 'Role must be ADMIN or COACH' },
        { status: 400 }
      )
    }

    // Prüfen ob Email bereits existiert
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      )
    }

    // Passwort hashen
    const hashedPassword = await bcrypt.hash(password, 10)

    // User erstellen
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role,
        coachId: coachId || null
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        coachId: true,
        createdAt: true,
        updatedAt: true,
      }
    })

    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}