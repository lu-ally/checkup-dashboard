import { NextResponse } from 'next/server'
import { googleSheetsService } from '@/lib/googleSheets'
import { prisma } from '@/lib/prisma'

/**
 * @deprecated This endpoint is deprecated. Use /api/sync-detailed-data instead.
 * This endpoint only syncs basic client data without detailed assessments.
 */
export async function POST() {
  try {
    console.log('⚠️  [DEPRECATED] Starting basic data synchronization...')
    console.log('⚠️  This endpoint is deprecated. Use /api/sync-detailed-data for full functionality.')

    // Fetch data from Google Sheets
    const clientData = await googleSheetsService.fetchClientData()
    console.log(`Fetched ${clientData.length} records from Google Sheets`)

    // Clear existing data and insert new data
    await prisma.clientData.deleteMany()
    console.log('Cleared existing data')

    // Validate and sanitize data before insertion
    const insertData = clientData
      .filter(data => data.clientId) // Only include records with client IDs
      .map(data => {
        // Ensure all required fields are present
        return {
          clientId: data.clientId,
          clientName: data.clientName || `Klient ${data.clientId.substring(0, 8)}`,
          coachName: data.coachName || 'Unbekannter Coach',
          wellbeingT0: data.wellbeingT0, // Can be null
          wellbeingT4: data.wellbeingT4, // Can be null
          status: data.status || 'Unbekannt',
          registrationDate: data.registrationDate,
          weeks: isNaN(data.weeks) ? 0 : data.weeks,
          chatLink: data.chatLink || '',
        }
      })

    console.log(`Inserting ${insertData.length} validated records`)

    if (insertData.length === 0) {
      return NextResponse.json({
        message: 'No valid data to synchronize',
        count: 0
      })
    }

    // Insert records one by one to avoid batch validation issues
    for (const record of insertData) {
      await prisma.clientData.create({
        data: record
      })
    }

    console.log('Data synchronization completed successfully')

    return NextResponse.json({
      message: 'Data synchronized successfully',
      count: insertData.length
    })
  } catch (error) {
    console.error('Sync error:', error)

    // Provide more detailed error information
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    return NextResponse.json(
      {
        error: 'Failed to sync data',
        details: errorMessage
      },
      { status: 500 }
    )
  }
}