#!/usr/bin/env node

/**
 * Migration script to move from SQLite to PostgreSQL
 * Usage: node scripts/migrate-to-postgres.js
 */

const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

async function migrateData() {
  console.log('🚀 Starting database migration from SQLite to PostgreSQL...')

  // SQLite client (source)
  const sqliteClient = new PrismaClient({
    datasources: {
      db: {
        url: "file:./dev.db"
      }
    }
  })

  // PostgreSQL client (destination)
  const postgresClient = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    }
  })

  try {
    console.log('📊 Fetching data from SQLite...')

    // Fetch all data from SQLite
    const users = await sqliteClient.user.findMany()
    const clients = await sqliteClient.client.findMany()
    const assessments = await sqliteClient.assessment.findMany()
    const clientData = await sqliteClient.clientData.findMany()

    console.log(`Found:`)
    console.log(`- ${users.length} users`)
    console.log(`- ${clients.length} clients`)
    console.log(`- ${assessments.length} assessments`)
    console.log(`- ${clientData.length} client data records`)

    console.log('🗃️ Migrating to PostgreSQL...')

    // Clear PostgreSQL tables first
    await postgresClient.assessment.deleteMany()
    await postgresClient.client.deleteMany()
    await postgresClient.clientData.deleteMany()
    await postgresClient.user.deleteMany()

    // Migrate users
    for (const user of users) {
      await postgresClient.user.create({
        data: user
      })
    }
    console.log('✅ Users migrated')

    // Migrate clients
    for (const client of clients) {
      await postgresClient.client.create({
        data: client
      })
    }
    console.log('✅ Clients migrated')

    // Migrate assessments
    for (const assessment of assessments) {
      await postgresClient.assessment.create({
        data: assessment
      })
    }
    console.log('✅ Assessments migrated')

    // Migrate client data (for backward compatibility)
    for (const data of clientData) {
      await postgresClient.clientData.create({
        data: data
      })
    }
    console.log('✅ Client data migrated')

    console.log('🎉 Migration completed successfully!')

  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  } finally {
    await sqliteClient.$disconnect()
    await postgresClient.$disconnect()
  }
}

// Check if DATABASE_URL is set for PostgreSQL
if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes('file:')) {
  console.error('❌ Please set DATABASE_URL environment variable for PostgreSQL')
  console.error('Example: DATABASE_URL="postgresql://user:password@localhost:5432/dbname"')
  process.exit(1)
}

migrateData().catch(console.error)