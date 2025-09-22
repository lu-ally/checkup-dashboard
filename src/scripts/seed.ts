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

  // Create sample client data matching the new schema
  const sampleData = [
    {
      clientId: 'client-001',
      clientName: 'Max Mustermann',
      coachName: coach1.name,
      wellbeingT0: 4,
      wellbeingT4: 7,
      status: 'aktiv',
      registrationDate: new Date('2024-01-15T10:00:00Z'),
      weeks: 4.0,
      chatLink: 'https://coaching.allywell.de/admin/coaching-tool/chat/app-user/client-001',
    },
    {
      clientId: 'client-002',
      clientName: 'Anna Beispiel',
      coachName: coach1.name,
      wellbeingT0: 3,
      wellbeingT4: 6,
      status: 'abgeschlossen',
      registrationDate: new Date('2024-01-20T14:30:00Z'),
      weeks: 5.2,
      chatLink: 'https://coaching.allywell.de/admin/coaching-tool/chat/app-user/client-002',
    },
    {
      clientId: 'client-003',
      clientName: 'Peter Test',
      coachName: coach2.name,
      wellbeingT0: 6,
      wellbeingT4: 8,
      status: 'aktiv',
      registrationDate: new Date('2024-01-25T09:15:00Z'),
      weeks: 3.5,
      chatLink: 'https://coaching.allywell.de/admin/coaching-tool/chat/app-user/client-003',
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