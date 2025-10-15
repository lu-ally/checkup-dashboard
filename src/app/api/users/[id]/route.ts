import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { updateUserSchema, validateRequest } from '@/lib/validation'

// GET /api/users/[id] - Einzelnen User abrufen
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // User können nur ihre eigenen Daten sehen, außer ADMINs
    if (session.user.role !== 'ADMIN' && session.user.id !== id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const user = await prisma.user.findUnique({
      where: { id },
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

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/users/[id] - User bearbeiten (nur für ADMIN oder eigene Daten)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    // Validate input with Zod
    const validation = validateRequest(updateUserSchema, body)
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    const { email, password, name, role, coachId } = validation.data

    // User können nur ihre eigenen Daten bearbeiten, außer ADMINs
    // Nur ADMINs können Rollen ändern
    if (session.user.role !== 'ADMIN' && session.user.id !== id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Prüfen ob User existiert
    const existingUser = await prisma.user.findUnique({
      where: { id }
    })

    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Email-Eindeutigkeit prüfen (wenn Email geändert wird)
    if (email && email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email }
      })

      if (emailExists) {
        return NextResponse.json(
          { error: 'User with this email already exists' },
          { status: 409 }
        )
      }
    }

    // Update-Daten vorbereiten
    const updateData: Record<string, string | null> = {}

    if (name) updateData.name = name
    if (email) updateData.email = email

    // Nur ADMIN kann Rolle ändern
    if (role && session.user.role === 'ADMIN') {
      updateData.role = role
    }

    // Nur ADMIN kann coachId ändern
    if (coachId !== undefined && session.user.role === 'ADMIN') {
      updateData.coachId = coachId || null
    }

    // Passwort hashen falls vorhanden
    if (password) {
      updateData.password = await bcrypt.hash(password, 10)
    }

    // User aktualisieren
    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
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

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/users/[id] - User löschen (nur für ADMIN)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Prüfen ob User existiert
    const existingUser = await prisma.user.findUnique({
      where: { id }
    })

    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Selbstlöschung verhindern
    if (session.user.id === id) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      )
    }

    // User löschen
    await prisma.user.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'User deleted successfully' })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}