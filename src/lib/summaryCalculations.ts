import { getCategoryValue } from './assessmentUtils'

export interface CategorySummary {
  avgChange: number // Prozentuale Änderung
  improved: number // Anzahl verbesserter Werte
  worsened: number // Anzahl verschlechterter Werte
  unchanged: number // Anzahl unveränderter Werte
  total: number // Gesamtanzahl Werte
}

/**
 * Berechnet die prozentuale Änderung für numerische Werte (0-10)
 */
export function calculateNumericChange(
  t0: number | null,
  t4: number | null
): number | null {
  if (t0 === null || t4 === null) return null
  if (t0 === 0) return t4 === 0 ? 0 : 100 // Avoid division by zero
  return ((t4 - t0) / t0) * 100
}

/**
 * Berechnet die prozentuale Änderung für kategoriale Werte
 * Konvertiert Gering/Mittel/Stark zu numerischen Werten
 */
export function calculateCategoricalChange(
  t0: string | null,
  t4: string | null,
  isPositiveMetric: boolean = true
): number | null {
  if (!t0 || !t4) return null

  const t0Value = getCategoryValue(t0)
  const t4Value = getCategoryValue(t4)

  if (t0Value === 0 || t4Value === 0) return null

  const change = ((t4Value - t0Value) / t0Value) * 100

  // Für Belastungen (negative Metriken) invertieren wir das Vorzeichen
  // damit eine Abnahme als positive Verbesserung angezeigt wird
  return isPositiveMetric ? change : -change
}

/**
 * Berechnet die durchschnittliche Änderung einer Kategorie
 */
export function calculateCategoryAverage(
  values: Array<{
    t0: number | string | null
    t4: number | string | null
    isPositiveMetric?: boolean
  }>
): CategorySummary {
  const changes: number[] = []
  let improved = 0
  let worsened = 0
  let unchanged = 0

  for (const value of values) {
    let change: number | null = null

    // Numerische Werte
    if (typeof value.t0 === 'number' && typeof value.t4 === 'number') {
      change = calculateNumericChange(value.t0, value.t4)
    }
    // Kategoriale Werte
    else if (typeof value.t0 === 'string' && typeof value.t4 === 'string') {
      change = calculateCategoricalChange(
        value.t0,
        value.t4,
        value.isPositiveMetric ?? true
      )
    }

    if (change !== null) {
      changes.push(change)

      if (change > 1) improved++
      else if (change < -1) worsened++
      else unchanged++
    }
  }

  const avgChange = changes.length > 0
    ? changes.reduce((sum, val) => sum + val, 0) / changes.length
    : 0

  return {
    avgChange,
    improved,
    worsened,
    unchanged,
    total: changes.length
  }
}

/**
 * Berechnet die Wohlbefindens-Änderung
 */
export function calculateWellbeingSummary(
  t0Wellbeing: number | null,
  t4Wellbeing: number | null
): CategorySummary {
  const change = calculateNumericChange(t0Wellbeing, t4Wellbeing)

  return {
    avgChange: change ?? 0,
    improved: change !== null && change > 1 ? 1 : 0,
    worsened: change !== null && change < -1 ? 1 : 0,
    unchanged: change !== null && Math.abs(change) <= 1 ? 1 : 0,
    total: change !== null ? 1 : 0
  }
}

/**
 * Berechnet die Zusammenfassung psychologischer Belastungen
 */
export function calculateBurdensSummary(
  t0: Record<string, unknown> | null,
  t4: Record<string, unknown> | null
): CategorySummary {
  const burdens = [
    { t0: t0?.stress as string | null, t4: t4?.stress as string | null, isPositiveMetric: false },
    { t0: t0?.exhaustion as string | null, t4: t4?.exhaustion as string | null, isPositiveMetric: false },
    { t0: t0?.anxiety as string | null, t4: t4?.anxiety as string | null, isPositiveMetric: false },
    { t0: t0?.depression as string | null, t4: t4?.depression as string | null, isPositiveMetric: false },
    { t0: t0?.selfDoubt as string | null, t4: t4?.selfDoubt as string | null, isPositiveMetric: false },
    { t0: t0?.sleepProblems as string | null, t4: t4?.sleepProblems as string | null, isPositiveMetric: false },
    { t0: t0?.tension as string | null, t4: t4?.tension as string | null, isPositiveMetric: false },
    { t0: t0?.irritability as string | null, t4: t4?.irritability as string | null, isPositiveMetric: false },
    { t0: t0?.socialWithdrawal as string | null, t4: t4?.socialWithdrawal as string | null, isPositiveMetric: false },
    { t0: t0?.other as string | null, t4: t4?.other as string | null, isPositiveMetric: false },
  ]

  return calculateCategoryAverage(burdens)
}

/**
 * Berechnet die Zusammenfassung der Lebensbereiche
 */
export function calculateLifeAreasSummary(
  t0: Record<string, unknown> | null,
  t4: Record<string, unknown> | null
): CategorySummary {
  const areas = [
    { t0: t0?.workArea as number | null, t4: t4?.workArea as number | null, isPositiveMetric: true },
    { t0: t0?.privateArea as number | null, t4: t4?.privateArea as number | null, isPositiveMetric: true },
  ]

  return calculateCategoryAverage(areas)
}

/**
 * Berechnet die Zusammenfassung der Selbstfürsorge
 */
export function calculateSelfCareSummary(
  t0: Record<string, unknown> | null,
  t4: Record<string, unknown> | null
): CategorySummary {
  const selfCare = [
    { t0: t0?.adequateSleep as string | null, t4: t4?.adequateSleep as string | null, isPositiveMetric: true },
    { t0: t0?.healthyEating as string | null, t4: t4?.healthyEating as string | null, isPositiveMetric: true },
    { t0: t0?.sufficientRest as string | null, t4: t4?.sufficientRest as string | null, isPositiveMetric: true },
    { t0: t0?.exercise as string | null, t4: t4?.exercise as string | null, isPositiveMetric: true },
    { t0: t0?.setBoundaries as string | null, t4: t4?.setBoundaries as string | null, isPositiveMetric: true },
    { t0: t0?.timeForBeauty as string | null, t4: t4?.timeForBeauty as string | null, isPositiveMetric: true },
    { t0: t0?.shareEmotions as string | null, t4: t4?.shareEmotions as string | null, isPositiveMetric: true },
    { t0: t0?.liveValues as string | null, t4: t4?.liveValues as string | null, isPositiveMetric: true },
  ]

  return calculateCategoryAverage(selfCare)
}

/**
 * Berechnet die Gesamtverbesserung über alle Bereiche
 */
export function calculateOverallImprovement(
  t0: Record<string, unknown> | null,
  t4: Record<string, unknown> | null
): number {
  if (!t0 || !t4) return 0

  const wellbeing = calculateWellbeingSummary(t0.wellbeing as number | null, t4.wellbeing as number | null)
  const burdens = calculateBurdensSummary(t0, t4)
  const lifeAreas = calculateLifeAreasSummary(t0, t4)
  const selfCare = calculateSelfCareSummary(t0, t4)

  // Gewichteter Durchschnitt (alle Bereiche gleich gewichtet)
  const totalWeight = 4
  const weightedSum =
    wellbeing.avgChange * 1 +
    burdens.avgChange * 1 +
    lifeAreas.avgChange * 1 +
    selfCare.avgChange * 1

  return weightedSum / totalWeight
}

/**
 * Normalisiert Werte für Radar-Chart (0-10 Skala)
 */
export function normalizeForRadar(
  value: number | string | null,
  isPositiveMetric: boolean = true
): number {
  if (value === null) return 0

  // Numerische Werte (0-10)
  if (typeof value === 'number') {
    return value
  }

  // Kategoriale Werte konvertieren
  const numValue = getCategoryValue(value as string)

  // Für Belastungen: invertieren, damit "Gering" = hoch auf Chart erscheint
  if (!isPositiveMetric) {
    // Gering(1) -> 10, Mittel(2) -> 5, Stark(3) -> 0
    return 10 - ((numValue - 1) * 5)
  }

  // Für positive Metriken: Selten(1) -> 3.3, Mittel(2) -> 6.6, Oft(3) -> 10
  return (numValue / 3) * 10
}

/**
 * Bereitet Daten für Radar-Chart vor
 */
export function prepareRadarChartData(
  t0: Record<string, unknown> | null,
  t4: Record<string, unknown> | null
): {
  labels: string[]
  t0Data: number[]
  t4Data: number[]
} {
  if (!t0 && !t4) {
    return { labels: [], t0Data: [], t4Data: [] }
  }

  const labels = [
    'Wohlbefinden',
    'Stress (↓)',
    'Erschöpfung (↓)',
    'Angst (↓)',
    'Depression (↓)',
    'Arbeitsbereich',
    'Privatbereich',
    'Selbstfürsorge'
  ]

  // Berechne durchschnittliche Selbstfürsorge
  const t0SelfCareAvg = t0 ? [
    normalizeForRadar(t0.adequateSleep as string | null, true),
    normalizeForRadar(t0.healthyEating as string | null, true),
    normalizeForRadar(t0.sufficientRest as string | null, true),
    normalizeForRadar(t0.exercise as string | null, true),
    normalizeForRadar(t0.setBoundaries as string | null, true),
    normalizeForRadar(t0.timeForBeauty as string | null, true),
    normalizeForRadar(t0.shareEmotions as string | null, true),
    normalizeForRadar(t0.liveValues as string | null, true),
  ].reduce((sum, val) => sum + val, 0) / 8 : 0

  const t4SelfCareAvg = t4 ? [
    normalizeForRadar(t4.adequateSleep as string | null, true),
    normalizeForRadar(t4.healthyEating as string | null, true),
    normalizeForRadar(t4.sufficientRest as string | null, true),
    normalizeForRadar(t4.exercise as string | null, true),
    normalizeForRadar(t4.setBoundaries as string | null, true),
    normalizeForRadar(t4.timeForBeauty as string | null, true),
    normalizeForRadar(t4.shareEmotions as string | null, true),
    normalizeForRadar(t4.liveValues as string | null, true),
  ].reduce((sum, val) => sum + val, 0) / 8 : 0

  const t0Data = t0 ? [
    normalizeForRadar(t0.wellbeing as number | null, true),
    normalizeForRadar(t0.stress as string | null, false),
    normalizeForRadar(t0.exhaustion as string | null, false),
    normalizeForRadar(t0.anxiety as string | null, false),
    normalizeForRadar(t0.depression as string | null, false),
    normalizeForRadar(t0.workArea as number | null, true),
    normalizeForRadar(t0.privateArea as number | null, true),
    t0SelfCareAvg
  ] : [0, 0, 0, 0, 0, 0, 0, 0]

  const t4Data = t4 ? [
    normalizeForRadar(t4.wellbeing as number | null, true),
    normalizeForRadar(t4.stress as string | null, false),
    normalizeForRadar(t4.exhaustion as string | null, false),
    normalizeForRadar(t4.anxiety as string | null, false),
    normalizeForRadar(t4.depression as string | null, false),
    normalizeForRadar(t4.workArea as number | null, true),
    normalizeForRadar(t4.privateArea as number | null, true),
    t4SelfCareAvg
  ] : [0, 0, 0, 0, 0, 0, 0, 0]

  return { labels, t0Data, t4Data }
}
