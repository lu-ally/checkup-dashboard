import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create sample users
  const adminPassword = await bcrypt.hash('admin123', 10)
  const coachPassword = await bcrypt.hash('coach123', 10)

  const admin = await prisma.user.upsert({
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

  // Create sample client data
  const sampleData = [
    // Client 1 - Coach 1
    {
      clientId: 'client-001',
      clientName: 'Max Mustermann',
      coachId: coach1.id,
      timepoint: 'T0',
      timestamp: new Date('2024-01-15T10:00:00Z'),
      wellbeing: 4,
      stress: 7,
      mood: 5,
      anxiety: 6,
      sleepQuality: 'Niedrig',
      motivation: 'Mittel',
      socialSupport: 'Hoch',
    },
    {
      clientId: 'client-001',
      clientName: 'Max Mustermann',
      coachId: coach1.id,
      timepoint: 'T4',
      timestamp: new Date('2024-02-15T10:00:00Z'),
      wellbeing: 7,
      stress: 4,
      mood: 7,
      anxiety: 3,
      sleepQuality: 'Mittel',
      motivation: 'Hoch',
      socialSupport: 'Hoch',
    },
    // Client 2 - Coach 1
    {
      clientId: 'client-002',
      clientName: 'Anna Beispiel',
      coachId: coach1.id,
      timepoint: 'T0',
      timestamp: new Date('2024-01-20T14:30:00Z'),
      wellbeing: 3,
      stress: 8,
      mood: 4,
      anxiety: 7,
      sleepQuality: 'Niedrig',
      motivation: 'Niedrig',
      socialSupport: 'Mittel',
    },
    {
      clientId: 'client-002',
      clientName: 'Anna Beispiel',
      coachId: coach1.id,
      timepoint: 'T4',
      timestamp: new Date('2024-02-20T14:30:00Z'),
      wellbeing: 6,
      stress: 5,
      mood: 6,
      anxiety: 4,
      sleepQuality: 'Mittel',
      motivation: 'Mittel',
      socialSupport: 'Hoch',
    },
    // Client 3 - Coach 2
    {
      clientId: 'client-003',
      clientName: 'Peter Test',
      coachId: coach2.id,
      timepoint: 'T0',
      timestamp: new Date('2024-01-25T09:15:00Z'),
      wellbeing: 6,
      stress: 5,
      mood: 6,
      anxiety: 4,
      sleepQuality: 'Mittel',
      motivation: 'Hoch',
      socialSupport: 'Mittel',
    },
    {
      clientId: 'client-003',
      clientName: 'Peter Test',
      coachId: coach2.id,
      timepoint: 'T4',
      timestamp: new Date('2024-02-25T09:15:00Z'),
      wellbeing: 8,
      stress: 3,
      mood: 8,
      anxiety: 2,
      sleepQuality: 'Hoch',
      motivation: 'Hoch',
      socialSupport: 'Hoch',
    }
  ]

  // Delete existing client data
  await prisma.clientData.deleteMany()

  // Insert sample data
  for (const data of sampleData) {
    await prisma.clientData.create({
      data,
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