import { google } from 'googleapis'

// Overview data from "Auswertung" tab
export interface ClientOverview {
  clientId: string
  clientName: string
  coachName: string
  status: string
  registrationDate: Date
  weeks: number
  chatLink: string
  wellbeingT0Basic: number | null // Basic wellbeing from overview
  wellbeingT4Basic: number | null
}

// Detailed assessment data from T0/T4 tabs
export interface Assessment {
  clientId: string
  timepoint: 'T0' | 'T4'
  submittedAt: Date

  // Core wellbeing (0-10)
  wellbeing: number | null

  // Psychological burdens (Gering/Mittel/Stark)
  stress: string | null
  exhaustion: string | null
  anxiety: string | null
  depression: string | null
  selfDoubt: string | null
  sleepProblems: string | null
  tension: string | null
  irritability: string | null
  socialWithdrawal: string | null
  other: string | null

  // Life areas (0-10)
  workArea: number | null
  privateArea: number | null

  // Self-care (Selten/Mittel/Oft)
  adequateSleep: string | null
  healthyEating: string | null
  sufficientRest: string | null
  exercise: string | null
  setBoundaries: string | null
  timeForBeauty: string | null
  shareEmotions: string | null
  liveValues: string | null

  // T4-specific coaching evaluation (only for T4)
  trust?: string | null
  genuineInterest?: string | null
  mutualUnderstanding?: string | null
  goalAlignment?: string | null
  learningExperience?: number | null
  progressAchievement?: number | null
  generalSatisfaction?: number | null
}

// Combined client data
export interface ClientData {
  overview: ClientOverview
  assessmentT0: Assessment | null
  assessmentT4: Assessment | null
}

class GoogleSheetsService {
  private sheets: ReturnType<typeof google.sheets>

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

  async fetchClientDataFromMultipleTabs(): Promise<ClientData[]> {
    try {
      console.log('Fetching data from multiple tabs...')

      // Fetch data from all three tabs in parallel
      const [overviewResponse, t0Response, t4Response] = await Promise.all([
        this.sheets.spreadsheets.values.get({
          spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
          range: 'Auswertung!A2:H',
        }),
        this.sheets.spreadsheets.values.get({
          spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
          range: 'InApp_AllyTime Checkup T0!A2:X',
        }),
        this.sheets.spreadsheets.values.get({
          spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
          range: 'InApp_AllyTime Checkup T4!A2:AN', // Up to column AN (39 columns)
        }),
      ])

      console.log(`Fetched ${overviewResponse.data.values?.length || 0} overview records`)
      console.log(`Fetched ${t0Response.data.values?.length || 0} T0 assessment records`)
      console.log(`Fetched ${t4Response.data.values?.length || 0} T4 assessment records`)

      // Parse overview data
      const overviewData = this.parseOverviewData(overviewResponse.data.values || [])

      // Parse assessment data
      const t0Assessments = this.parseAssessmentData(t0Response.data.values || [], 'T0')
      const t4Assessments = this.parseAssessmentData(t4Response.data.values || [], 'T4')

      // Combine data by client ID
      return this.combineClientData(overviewData, t0Assessments, t4Assessments)

    } catch (error) {
      console.error('Error fetching data from Google Sheets:', error)
      throw new Error('Failed to fetch data from Google Sheets')
    }
  }

  private parseOverviewData(rows: string[][]): Map<string, ClientOverview> {
    const overviewMap = new Map<string, ClientOverview>()

    rows.forEach(row => {
      const clientId = row[0]
      if (!clientId) return

      // Parse registration date
      const registrationDateStr = row[6] || ''
      let registrationDate = new Date()
      if (registrationDateStr && registrationDateStr !== '#N/A') {
        try {
          const [day, month, year] = registrationDateStr.split('.')
          if (day && month && year) {
            const parsedDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
            if (!isNaN(parsedDate.getTime())) {
              registrationDate = parsedDate
            }
          }
        } catch {
          console.warn('Invalid date format:', registrationDateStr)
        }
      }

      // Parse weeks
      const weeksStr = row[7] || '0'
      let weeks = 0
      if (weeksStr && weeksStr !== '#N/A') {
        weeks = parseFloat(weeksStr.replace(',', '.')) || 0
      }

      // Parse basic wellbeing values
      const parseWellbeing = (value: string): number | null => {
        if (!value || value.trim() === '' || value === '#N/A') return null
        const parsed = parseInt(value.trim())
        return isNaN(parsed) ? null : parsed
      }

      const clientName = `Klient ${clientId.substring(0, 8)}`

      overviewMap.set(clientId, {
        clientId,
        clientName,
        coachName: (row[4] && row[4] !== '#N/A') ? row[4] : 'Unbekannter Coach',
        status: (row[5] && row[5] !== '#N/A') ? row[5] : 'Unbekannt',
        registrationDate,
        weeks,
        chatLink: row[1] || '',
        wellbeingT0Basic: parseWellbeing(row[2]),
        wellbeingT4Basic: parseWellbeing(row[3]),
      })
    })

    return overviewMap
  }

  private parseAssessmentData(rows: string[][], timepoint: 'T0' | 'T4'): Map<string, Assessment> {
    const assessmentMap = new Map<string, Assessment>()

    rows.forEach(row => {
      // Get client ID from user_id column (V=21 for T0, ]=28 for T4)
      const clientId = timepoint === 'T0' ? row[21] : row[28] // user_id column
      if (!clientId) return

      // Parse submitted date
      const submittedStr = timepoint === 'T0' ? row[22] : row[29] // Submitted At column
      let submittedAt = new Date()
      if (submittedStr) {
        try {
          // Format: DD.MM.YYYY HH:MM:SS
          const [datePart] = submittedStr.split(' ')
          if (datePart) {
            const [day, month, year] = datePart.split('.')
            if (day && month && year) {
              submittedAt = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
            }
          }
        } catch {
          console.warn('Invalid submitted date format:', submittedStr)
        }
      }

      // Helper functions
      const parseNumber = (value: string): number | null => {
        if (!value || value.trim() === '' || value === '#N/A') return null
        const parsed = parseInt(value.trim())
        return isNaN(parsed) ? null : parsed
      }

      const parseString = (value: string): string | null => {
        if (!value || value.trim() === '' || value === '#N/A') return null
        return value.trim()
      }

      const assessment: Assessment = {
        clientId,
        timepoint,
        submittedAt,
        wellbeing: parseNumber(row[0]),
        stress: parseString(row[1]),
        exhaustion: parseString(row[2]),
        anxiety: parseString(row[3]),
        depression: parseString(row[4]),
        selfDoubt: parseString(row[5]),
        sleepProblems: parseString(row[6]),
        tension: parseString(row[7]),
        irritability: parseString(row[8]),
        socialWithdrawal: parseString(row[9]),
        other: parseString(row[10]),
        workArea: parseNumber(row[11]),
        privateArea: parseNumber(row[12]),
        adequateSleep: parseString(row[13]),
        healthyEating: parseString(row[14]),
        sufficientRest: parseString(row[15]),
        exercise: parseString(row[16]),
        setBoundaries: parseString(row[17]),
        timeForBeauty: parseString(row[18]),
        shareEmotions: parseString(row[19]),
        liveValues: parseString(row[20]),
      }

      // Add T4-specific fields
      if (timepoint === 'T4') {
        assessment.trust = parseString(row[21])
        assessment.genuineInterest = parseString(row[22])
        assessment.mutualUnderstanding = parseString(row[23])
        assessment.goalAlignment = parseString(row[24])
        assessment.learningExperience = parseNumber(row[25])
        assessment.progressAchievement = parseNumber(row[26])
        assessment.generalSatisfaction = parseNumber(row[27])
      }

      assessmentMap.set(clientId, assessment)
    })

    return assessmentMap
  }

  private combineClientData(
    overviewData: Map<string, ClientOverview>,
    t0Assessments: Map<string, Assessment>,
    t4Assessments: Map<string, Assessment>
  ): ClientData[] {
    const combinedData: ClientData[] = []

    // Start with overview data and add assessments
    overviewData.forEach((overview, clientId) => {
      const assessmentT0 = t0Assessments.get(clientId) || null
      const assessmentT4 = t4Assessments.get(clientId) || null

      combinedData.push({
        overview,
        assessmentT0,
        assessmentT4,
      })
    })

    console.log(`Combined data for ${combinedData.length} clients`)
    return combinedData
  }

  // Keep old method for backward compatibility
  async fetchClientData() {
    const multiTabData = await this.fetchClientDataFromMultipleTabs()

    // Convert to old format for existing code
    return multiTabData.map(client => ({
      clientId: client.overview.clientId,
      clientName: client.overview.clientName,
      coachName: client.overview.coachName,
      wellbeingT0: client.overview.wellbeingT0Basic,
      wellbeingT4: client.overview.wellbeingT4Basic,
      status: client.overview.status,
      registrationDate: client.overview.registrationDate,
      weeks: client.overview.weeks,
      chatLink: client.overview.chatLink,
    }))
  }
}

export const googleSheetsService = new GoogleSheetsService()