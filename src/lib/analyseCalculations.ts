/**
 * Utility functions for aggregated T0/T4 analysis
 */

import { getCategoryValue } from './assessmentUtils'

// Types
export interface Assessment {
  id: string
  clientId: string
  timepoint: string
  submittedAt: Date
  wellbeing: number | null
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
  workArea: number | null
  privateArea: number | null
  adequateSleep: string | null
  healthyEating: string | null
  sufficientRest: string | null
  exercise: string | null
  setBoundaries: string | null
  timeForBeauty: string | null
  shareEmotions: string | null
  liveValues: string | null
  trust?: string | null
  genuineInterest?: string | null
  mutualUnderstanding?: string | null
  goalAlignment?: string | null
  learningExperience?: number | null
  progressAchievement?: number | null
  generalSatisfaction?: number | null
}

export interface ClientData {
  id: string
  clientId: string
  clientName: string
  coachName: string
  status: string
  registrationDate: string
  weeks: number
  chatLink: string
  wellbeingT0Basic: number | null
  wellbeingT4Basic: number | null
  assessments: Assessment[]
}

export interface PairedAssessment {
  clientId: string
  clientName: string
  coachName: string
  t0: Assessment
  t4: Assessment
}

export interface AggregatedNumericMetric {
  label: string
  avgT0: number
  avgT4: number
  avgChange: number
  avgChangePercent: number
  improved: number
  worsened: number
  unchanged: number
  total: number
  t0Count: number
  t4Count: number
}

export interface CategoryDistribution {
  category: string
  count: number
  percent: number
}

export interface AggregatedCategoryMetric {
  label: string
  t0Distribution: CategoryDistribution[]
  t4Distribution: CategoryDistribution[]
  improved: number
  worsened: number
  unchanged: number
  total: number
}

export interface CoachingRatingMetric {
  label: string
  average: number
  count: number
  distribution?: CategoryDistribution[]
}

// Filter clients that have both T0 and T4 assessments
export function filterClientsWithBothAssessments(clients: ClientData[]): PairedAssessment[] {
  return clients
    .filter(client => {
      const hasT0 = client.assessments.some(a => a.timepoint === 'T0')
      const hasT4 = client.assessments.some(a => a.timepoint === 'T4')
      return hasT0 && hasT4
    })
    .map(client => ({
      clientId: client.clientId,
      clientName: client.clientName,
      coachName: client.coachName,
      t0: client.assessments.find(a => a.timepoint === 'T0')!,
      t4: client.assessments.find(a => a.timepoint === 'T4')!,
    }))
}

// Calculate aggregated numeric metrics (wellbeing, workArea, privateArea)
export function calculateAggregatedNumeric(
  pairs: PairedAssessment[],
  field: keyof Assessment,
  label: string
): AggregatedNumericMetric {
  let sumT0 = 0
  let sumT4 = 0
  let t0Count = 0
  let t4Count = 0
  let improved = 0
  let worsened = 0
  let unchanged = 0

  pairs.forEach(pair => {
    const t0Value = pair.t0[field] as number | null
    const t4Value = pair.t4[field] as number | null

    if (t0Value !== null) {
      sumT0 += t0Value
      t0Count++
    }
    if (t4Value !== null) {
      sumT4 += t4Value
      t4Count++
    }

    if (t0Value !== null && t4Value !== null) {
      if (t4Value > t0Value) improved++
      else if (t4Value < t0Value) worsened++
      else unchanged++
    }
  })

  const avgT0 = t0Count > 0 ? sumT0 / t0Count : 0
  const avgT4 = t4Count > 0 ? sumT4 / t4Count : 0
  const avgChange = avgT4 - avgT0
  const avgChangePercent = avgT0 > 0 ? ((avgT4 - avgT0) / avgT0) * 100 : 0

  return {
    label,
    avgT0,
    avgT4,
    avgChange,
    avgChangePercent,
    improved,
    worsened,
    unchanged,
    total: pairs.length,
    t0Count,
    t4Count,
  }
}

// Calculate aggregated category metrics (burdens, self-care)
export function calculateAggregatedCategory(
  pairs: PairedAssessment[],
  field: keyof Assessment,
  label: string,
  categories: string[],
  isPositiveMetric: boolean = false
): AggregatedCategoryMetric {
  const t0Counts: Record<string, number> = {}
  const t4Counts: Record<string, number> = {}

  categories.forEach(cat => {
    t0Counts[cat] = 0
    t4Counts[cat] = 0
  })

  let improved = 0
  let worsened = 0
  let unchanged = 0
  let validPairs = 0

  pairs.forEach(pair => {
    const t0Value = pair.t0[field] as string | null
    const t4Value = pair.t4[field] as string | null

    if (t0Value && categories.includes(t0Value)) {
      t0Counts[t0Value]++
    }
    if (t4Value && categories.includes(t4Value)) {
      t4Counts[t4Value]++
    }

    if (t0Value && t4Value) {
      validPairs++
      const t0Num = getCategoryValue(t0Value)
      const t4Num = getCategoryValue(t4Value)

      if (isPositiveMetric) {
        // For self-care: higher is better
        if (t4Num > t0Num) improved++
        else if (t4Num < t0Num) worsened++
        else unchanged++
      } else {
        // For burdens: lower is better
        if (t4Num < t0Num) improved++
        else if (t4Num > t0Num) worsened++
        else unchanged++
      }
    }
  })

  const t0Total = Object.values(t0Counts).reduce((a, b) => a + b, 0)
  const t4Total = Object.values(t4Counts).reduce((a, b) => a + b, 0)

  const t0Distribution = categories.map(cat => ({
    category: cat,
    count: t0Counts[cat],
    percent: t0Total > 0 ? (t0Counts[cat] / t0Total) * 100 : 0,
  }))

  const t4Distribution = categories.map(cat => ({
    category: cat,
    count: t4Counts[cat],
    percent: t4Total > 0 ? (t4Counts[cat] / t4Total) * 100 : 0,
  }))

  return {
    label,
    t0Distribution,
    t4Distribution,
    improved,
    worsened,
    unchanged,
    total: validPairs,
  }
}

// Calculate T4-only coaching ratings (numeric)
export function calculateCoachingRatingNumeric(
  pairs: PairedAssessment[],
  field: keyof Assessment,
  label: string
): CoachingRatingMetric {
  let sum = 0
  let count = 0

  pairs.forEach(pair => {
    const value = pair.t4[field] as number | null
    if (value !== null) {
      sum += value
      count++
    }
  })

  return {
    label,
    average: count > 0 ? sum / count : 0,
    count,
  }
}

// Calculate T4-only coaching ratings (categorical)
export function calculateCoachingRatingCategory(
  pairs: PairedAssessment[],
  field: keyof Assessment,
  label: string,
  categories: string[]
): CoachingRatingMetric {
  const counts: Record<string, number> = {}
  categories.forEach(cat => {
    counts[cat] = 0
  })

  let total = 0

  pairs.forEach(pair => {
    const value = pair.t4[field] as string | null
    if (value && categories.includes(value)) {
      counts[value]++
      total++
    }
  })

  const distribution = categories.map(cat => ({
    category: cat,
    count: counts[cat],
    percent: total > 0 ? (counts[cat] / total) * 100 : 0,
  }))

  // Calculate average as numeric value
  let sum = 0
  distribution.forEach(d => {
    sum += getCategoryValue(d.category) * d.count
  })

  return {
    label,
    average: total > 0 ? sum / total : 0,
    count: total,
    distribution,
  }
}

// Calculate overall improvement percentage
export function calculateOverallImprovement(pairs: PairedAssessment[]): number {
  if (pairs.length === 0) return 0

  let totalImprovement = 0
  let totalMetrics = 0

  // Numeric metrics (wellbeing, workArea, privateArea) - higher is better
  const numericFields: (keyof Assessment)[] = ['wellbeing', 'workArea', 'privateArea']
  numericFields.forEach(field => {
    pairs.forEach(pair => {
      const t0 = pair.t0[field] as number | null
      const t4 = pair.t4[field] as number | null
      if (t0 !== null && t4 !== null && t0 > 0) {
        totalImprovement += ((t4 - t0) / t0) * 100
        totalMetrics++
      }
    })
  })

  // Burden metrics - lower is better (so we invert)
  const burdenFields: (keyof Assessment)[] = [
    'stress', 'exhaustion', 'anxiety', 'depression',
    'selfDoubt', 'sleepProblems', 'tension', 'irritability', 'socialWithdrawal', 'other'
  ]
  burdenFields.forEach(field => {
    pairs.forEach(pair => {
      const t0 = getCategoryValue(pair.t0[field] as string | null)
      const t4 = getCategoryValue(pair.t4[field] as string | null)
      if (t0 > 0 && t4 > 0) {
        // Invert: decrease in burden = improvement
        totalImprovement += ((t0 - t4) / t0) * 100
        totalMetrics++
      }
    })
  })

  // Self-care metrics - higher is better
  const selfCareFields: (keyof Assessment)[] = [
    'adequateSleep', 'healthyEating', 'sufficientRest', 'exercise',
    'setBoundaries', 'timeForBeauty', 'shareEmotions', 'liveValues'
  ]
  selfCareFields.forEach(field => {
    pairs.forEach(pair => {
      const t0 = getCategoryValue(pair.t0[field] as string | null)
      const t4 = getCategoryValue(pair.t4[field] as string | null)
      if (t0 > 0 && t4 > 0) {
        totalImprovement += ((t4 - t0) / t0) * 100
        totalMetrics++
      }
    })
  })

  return totalMetrics > 0 ? totalImprovement / totalMetrics : 0
}
