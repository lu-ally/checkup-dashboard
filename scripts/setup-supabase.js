#!/usr/bin/env node

/**
 * Setup script for Supabase PostgreSQL database
 * Erstellt Schema und Seed-Daten für die Produktion
 */

const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

async function setupSupabase() {
  console.log('🚀 Setting up Supabase database...')

  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL environment variable is required')
    console.error('Set it to your Supabase PostgreSQL connection string')
    process.exit(1)
  }

  if (!process.env.DATABASE_URL.includes('supabase.com')) {
    console.warn('⚠️  Warning: DATABASE_URL does not appear to be a Supabase URL')
  }

  const prisma = new PrismaClient()

  try {
    console.log('📊 Pushing database schema...')

    // Note: In production, use `npx prisma db push` instead
    // This script focuses on seeding data

    console.log('👤 Creating admin and coach users...')

    // Hash passwords
    const adminPassword = await bcrypt.hash('admin123', 10)
    const coachPassword = await bcrypt.hash('coach123', 10)

    // Clear existing users (be careful in production!)
    console.log('🧹 Clearing existing data...')
    await prisma.assessment.deleteMany()
    await prisma.client.deleteMany()
    await prisma.clientData.deleteMany()
    await prisma.user.deleteMany()

    // Create users
    const admin = await prisma.user.create({
      data: {
        email: 'admin@example.com',
        password: adminPassword,
        name: 'Administrator',
        role: 'ADMIN',
      }
    })

    const coach1 = await prisma.user.create({
      data: {
        email: 'coach1@example.com',
        password: coachPassword,
        name: 'Dr. Sarah Müller',
        role: 'COACH',
      }
    })

    const coach2 = await prisma.user.create({
      data: {
        email: 'coach2@example.com',
        password: coachPassword,
        name: 'Dr. Michael Schmidt',
        role: 'COACH',
      }
    })

    console.log('✅ Users created:')
    console.log(`- Admin: ${admin.email}`)
    console.log(`- Coach 1: ${coach1.email}`)
    console.log(`- Coach 2: ${coach2.email}`)

    // Create sample clients
    console.log('👥 Creating sample clients...')

    const clients = [
      {
        clientId: 'client-001',
        clientName: 'Klient client-001',
        coachName: coach1.name,
        wellbeingT0Basic: 4,
        wellbeingT4Basic: 7,
        status: 'Aktiv',
        registrationDate: new Date('2024-01-15T10:00:00Z'),
        weeks: 4.0,
        chatLink: 'https://coaching.allywell.de/admin/coaching-tool/chat/app-user/client-001',
      },
      {
        clientId: 'client-002',
        clientName: 'Klient client-002',
        coachName: coach1.name,
        wellbeingT0Basic: 3,
        wellbeingT4Basic: 6,
        status: 'Beendet',
        registrationDate: new Date('2024-01-20T14:30:00Z'),
        weeks: 5.2,
        chatLink: 'https://coaching.allywell.de/admin/coaching-tool/chat/app-user/client-002',
      },
      {
        clientId: 'client-003',
        clientName: 'Klient client-003',
        coachName: coach2.name,
        wellbeingT0Basic: 6,
        wellbeingT4Basic: 8,
        status: 'Aktiv',
        registrationDate: new Date('2024-01-25T09:15:00Z'),
        weeks: 3.5,
        chatLink: 'https://coaching.allywell.de/admin/coaching-tool/chat/app-user/client-003',
      }
    ]

    for (const clientData of clients) {
      await prisma.client.create({
        data: clientData,
      })
    }

    console.log(`✅ Created ${clients.length} sample clients`)

    // Create sample assessments
    console.log('📋 Creating sample assessments...')

    const assessments = [
      {
        clientId: 'client-001',
        timepoint: 'T0',
        submittedAt: new Date('2024-01-15T10:30:00Z'),
        wellbeing: 4,
        stress: 'Stark',
        exhaustion: 'Mittel',
        anxiety: 'Mittel',
        depression: 'Gering',
        selfDoubt: 'Stark',
        sleepProblems: 'Mittel',
        tension: 'Stark',
        irritability: 'Mittel',
        socialWithdrawal: 'Gering',
        workArea: 3,
        privateArea: 5,
        adequateSleep: 'Selten',
        healthyEating: 'Mittel',
        sufficientRest: 'Selten',
        exercise: 'Selten',
        setBoundaries: 'Selten',
        timeForBeauty: 'Mittel',
        shareEmotions: 'Mittel',
        liveValues: 'Selten',
      },
      {
        clientId: 'client-002',
        timepoint: 'T4',
        submittedAt: new Date('2024-02-25T16:00:00Z'),
        wellbeing: 6,
        stress: 'Mittel',
        exhaustion: 'Mittel',
        anxiety: 'Mittel',
        depression: 'Gering',
        selfDoubt: 'Mittel',
        sleepProblems: 'Gering',
        tension: 'Mittel',
        irritability: 'Gering',
        socialWithdrawal: 'Gering',
        workArea: 5,
        privateArea: 7,
        adequateSleep: 'Mittel',
        healthyEating: 'Oft',
        sufficientRest: 'Mittel',
        exercise: 'Mittel',
        setBoundaries: 'Oft',
        timeForBeauty: 'Oft',
        shareEmotions: 'Oft',
        liveValues: 'Oft',
        trust: 'Sehr gut',
        genuineInterest: 'Sehr gut',
        mutualUnderstanding: 'Gut',
        goalAlignment: 'Sehr gut',
        learningExperience: 8,
        progressAchievement: 7,
        generalSatisfaction: 8,
      }
    ]

    for (const assessmentData of assessments) {
      await prisma.assessment.create({
        data: assessmentData,
      })
    }

    console.log(`✅ Created ${assessments.length} sample assessments`)

    console.log('\n🎉 Supabase setup completed successfully!')
    console.log('\n📋 Login credentials:')
    console.log('Admin: admin@example.com / admin123')
    console.log('Coach 1: coach1@example.com / coach123')
    console.log('Coach 2: coach2@example.com / coach123')
    console.log('\n🔗 Your app should now be ready at your Vercel URL!')

  } catch (error) {
    console.error('❌ Setup failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

setupSupabase().catch(console.error)