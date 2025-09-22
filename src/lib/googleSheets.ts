import { google } from 'googleapis'

export interface ClientDataRow {
  clientId: string
  clientName: string
  coachId: string
  timepoint: 'T0' | 'T4'
  timestamp: Date
  wellbeing: number
  stress: number
  mood: number
  anxiety: number
  sleepQuality: 'Niedrig' | 'Mittel' | 'Hoch'
  motivation: 'Niedrig' | 'Mittel' | 'Hoch'
  socialSupport: 'Niedrig' | 'Mittel' | 'Hoch'
}

class GoogleSheetsService {
  private sheets: any

  constructor() {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    })

    this.sheets = google.sheets({ version: 'v4', auth })
  }

  async fetchClientData(): Promise<ClientDataRow[]> {
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
        range: 'A2:M', // Assuming headers in row 1, data starts from row 2
      })

      const rows = response.data.values || []

      return rows.map((row: string[]) => ({
        clientId: row[0] || '',
        clientName: row[1] || '',
        coachId: row[2] || '',
        timepoint: row[3] as 'T0' | 'T4' || 'T0',
        timestamp: new Date(row[4] || Date.now()),
        wellbeing: parseInt(row[5]) || 0,
        stress: parseInt(row[6]) || 0,
        mood: parseInt(row[7]) || 0,
        anxiety: parseInt(row[8]) || 0,
        sleepQuality: row[9] as 'Niedrig' | 'Mittel' | 'Hoch' || 'Niedrig',
        motivation: row[10] as 'Niedrig' | 'Mittel' | 'Hoch' || 'Niedrig',
        socialSupport: row[11] as 'Niedrig' | 'Mittel' | 'Hoch' || 'Niedrig',
      }))
    } catch (error) {
      console.error('Error fetching data from Google Sheets:', error)
      throw new Error('Failed to fetch data from Google Sheets')
    }
  }
}

export const googleSheetsService = new GoogleSheetsService()