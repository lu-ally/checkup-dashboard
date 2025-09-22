import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create sample users
  const adminPassword = await bcrypt.hash('admin123', 10)
  const coachPassword = await bcrypt.hash('coach123', 10)

  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: adminPassword,
      name: 'Administrator',
      role: 'ADMIN',
    },
  })

  const coach1 = await prisma.user.upsert({
    where: { email: 'coach1@example.com' },
    update: {},
    create: {
      email: 'coach1@example.com',
      password: coachPassword,
      name: 'Dr. Sarah Müller',
      role: 'COACH',
    },
  })

  const coach2 = await prisma.user.upsert({
    where: { email: 'coach2@example.com' },
    update: {},
    create: {
      email: 'coach2@example.com',
      password: coachPassword,
      name: 'Dr. Michael Schmidt',
      role: 'COACH',
    },
  })

  // Clear existing data
  await prisma.assessment.deleteMany()
  await prisma.client.deleteMany()
  await prisma.clientData.deleteMany() // Keep for backward compatibility

  // Create sample clients with the new schema
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

  // Create clients
  for (const clientData of clients) {
    await prisma.client.create({
      data: clientData,
    })
  }

  // Create sample assessments
  const assessments = [
    // T0 Assessments
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
      other: null,
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
      timepoint: 'T0',
      submittedAt: new Date('2024-01-20T15:00:00Z'),
      wellbeing: 3,
      stress: 'Stark',
      exhaustion: 'Stark',
      anxiety: 'Stark',
      depression: 'Mittel',
      selfDoubt: 'Stark',
      sleepProblems: 'Stark',
      tension: 'Stark',
      irritability: 'Stark',
      socialWithdrawal: 'Mittel',
      other: null,
      workArea: 2,
      privateArea: 4,
      adequateSleep: 'Selten',
      healthyEating: 'Selten',
      sufficientRest: 'Selten',
      exercise: 'Selten',
      setBoundaries: 'Selten',
      timeForBeauty: 'Selten',
      shareEmotions: 'Selten',
      liveValues: 'Selten',
    },
    {
      clientId: 'client-003',
      timepoint: 'T0',
      submittedAt: new Date('2024-01-25T09:45:00Z'),
      wellbeing: 6,
      stress: 'Mittel',
      exhaustion: 'Gering',
      anxiety: 'Gering',
      depression: 'Gering',
      selfDoubt: 'Mittel',
      sleepProblems: 'Gering',
      tension: 'Mittel',
      irritability: 'Gering',
      socialWithdrawal: 'Gering',
      other: null,
      workArea: 7,
      privateArea: 6,
      adequateSleep: 'Oft',
      healthyEating: 'Oft',
      sufficientRest: 'Mittel',
      exercise: 'Mittel',
      setBoundaries: 'Mittel',
      timeForBeauty: 'Oft',
      shareEmotions: 'Mittel',
      liveValues: 'Oft',
    },
    // T4 Assessment (only one for demonstration)
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
      other: null,
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
      // T4-specific coaching evaluation
      trust: 'Sehr gut',
      genuineInterest: 'Sehr gut',
      mutualUnderstanding: 'Gut',
      goalAlignment: 'Sehr gut',
      learningExperience: 8,
      progressAchievement: 7,
      generalSatisfaction: 8,
    }
  ]

  // Create assessments
  for (const assessmentData of assessments) {
    await prisma.assessment.create({
      data: assessmentData,
    })
  }

  console.log('Database seeded successfully!')
  console.log('Login credentials:')
  console.log('Admin: admin@example.com / admin123')
  console.log('Coach 1: coach1@example.com / coach123')
  console.log('Coach 2: coach2@example.com / coach123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })