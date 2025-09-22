import { NextRequest, NextResponse } from 'next/server'
import { googleSheetsService } from '@/lib/googleSheets'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    // Fetch data from Google Sheets
    const clientData = await googleSheetsService.fetchClientData()

    // Clear existing data and insert new data
    await prisma.clientData.deleteMany()

    const insertData = clientData.map(data => ({
      clientId: data.clientId,
      clientName: data.clientName,
      coachId: data.coachId,
      timepoint: data.timepoint,
      timestamp: data.timestamp,
      wellbeing: data.wellbeing,
      stress: data.stress,
      mood: data.mood,
      anxiety: data.anxiety,
      sleepQuality: data.sleepQuality,
      motivation: data.motivation,
      socialSupport: data.socialSupport,
    }))

    await prisma.clientData.createMany({
      data: insertData
    })

    return NextResponse.json({
      message: 'Data synchronized successfully',
      count: insertData.length
    })
  } catch (error) {
    console.error('Sync error:', error)
    return NextResponse.json(
      { error: 'Failed to sync data' },
      { status: 500 }
    )
  }
}