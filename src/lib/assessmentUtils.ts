/**
 * Utility functions for comparing assessments between T0 and T4
 */

// Convert categorical values to numeric for comparison
export function getCategoryValue(category: string | null): number {
  if (!category) return 0

  const normalized = category.toLowerCase().trim()

  switch (normalized) {
    case 'gering':
    case 'selten':
      return 1
    case 'mittel':
      return 2
    case 'stark':
    case 'oft':
      return 3
    default:
      return 0
  }
}

// Get category label from numeric value
export function getCategoryLabel(value: number): string {
  switch (value) {
    case 1:
      return 'Gering/Selten'
    case 2:
      return 'Mittel'
    case 3:
      return 'Stark/Oft'
    default:
      return 'Keine Angabe'
  }
}

// Calculate change between two numeric values
export function calculateChange(t0: number | null, t4: number | null): number {
  if (t0 === null || t4 === null) return 0
  return t4 - t0
}

// Calculate percentage change
export function calculatePercentageChange(t0: number | null, t4: number | null): number | null {
  if (t0 === null || t4 === null || t0 === 0) return null
  return ((t4 - t0) / t0) * 100
}

// Get change icon based on value change
// For wellbeing and positive metrics: ↑ is good, ↓ is bad
// For burden metrics (stress, etc.): ↓ is good, ↑ is bad
export function getChangeIcon(change: number, isPositiveMetric: boolean = true): string {
  if (change === 0) return '→'

  if (isPositiveMetric) {
    return change > 0 ? '↑' : '↓'
  } else {
    return change > 0 ? '↑' : '↓'
  }
}

// Get color class for comparison based on change
// isPositiveMetric: true for wellbeing (increase is good)
// isPositiveMetric: false for burdens (decrease is good)
export function getComparisonColor(
  change: number,
  isPositiveMetric: boolean = true
): string {
  if (change === 0) return 'text-gray-600'

  const isImprovement = isPositiveMetric ? change > 0 : change < 0

  return isImprovement ? 'text-green-600' : 'text-red-600'
}

// Get background color class for comparison
export function getComparisonBgColor(
  change: number,
  isPositiveMetric: boolean = true
): string {
  if (change === 0) return 'bg-gray-50'

  const isImprovement = isPositiveMetric ? change > 0 : change < 0

  return isImprovement ? 'bg-green-50' : 'bg-red-50'
}

// Get badge color for categorical values
export function getCategoryBadgeColor(category: string | null): string {
  if (!category) return 'bg-gray-100 text-gray-800'

  const normalized = category.toLowerCase().trim()

  switch (normalized) {
    case 'gering':
    case 'selten':
      return 'bg-green-100 text-green-800'
    case 'mittel':
      return 'bg-yellow-100 text-yellow-800'
    case 'stark':
    case 'oft':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

// Format date for display
export function formatAssessmentDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('de-DE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// Check if assessment data is available
export function hasAssessmentData(assessment: unknown): boolean {
  return assessment !== null && assessment !== undefined
}

// Get comparison summary text
export function getComparisonSummary(
  t0Value: number | null,
  t4Value: number | null,
  isPositiveMetric: boolean = true
): string {
  if (t0Value === null && t4Value === null) {
    return 'Keine Daten verfügbar'
  }
  if (t0Value === null) {
    return 'Nur T4 Daten verfügbar'
  }
  if (t4Value === null) {
    return 'Nur T0 Daten verfügbar'
  }

  const change = calculateChange(t0Value, t4Value)

  if (change === 0) {
    return 'Keine Veränderung'
  }

  const isImprovement = isPositiveMetric ? change > 0 : change < 0
  const changeText = Math.abs(change).toFixed(1)

  if (isImprovement) {
    return `Verbesserung um ${changeText}`
  } else {
    return `Verschlechterung um ${changeText}`
  }
}
