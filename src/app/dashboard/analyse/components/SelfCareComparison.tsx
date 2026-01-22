"use client"

import {
  PairedAssessment,
  Assessment,
  calculateAggregatedCategory,
} from '@/lib/analyseCalculations'

interface SelfCareComparisonProps {
  pairedAssessments: PairedAssessment[]
}

interface FieldSummary {
  label: string
  improved: number
  worsened: number
  unchanged: number
  total: number
}

const SELFCARE_CATEGORIES = ['Selten', 'Mittel', 'Oft']
const SELFCARE_FIELDS: { field: keyof Assessment; label: string }[] = [
  { field: 'adequateSleep', label: 'Schlaf' },
  { field: 'healthyEating', label: 'Ernährung' },
  { field: 'sufficientRest', label: 'Ruhe' },
  { field: 'exercise', label: 'Sport' },
  { field: 'setBoundaries', label: 'Grenzen' },
  { field: 'timeForBeauty', label: 'Schönes' },
  { field: 'shareEmotions', label: 'Gefühle' },
  { field: 'liveValues', label: 'Werte' },
]

// Summary Card Component
function SummaryCard({ label, improved, worsened, unchanged, total }: FieldSummary) {
  const netChange = improved - worsened
  const trend = netChange > 0 ? 'positive' : netChange < 0 ? 'negative' : 'neutral'

  // For self-care: increase = good (up arrow green)
  const trendIcon = trend === 'positive' ? '↑' : trend === 'negative' ? '↓' : '→'

  const bgColor = trend === 'positive' ? 'bg-green-50'
    : trend === 'negative' ? 'bg-red-50'
    : 'bg-gray-50'

  const textColor = trend === 'positive' ? 'text-green-600'
    : trend === 'negative' ? 'text-red-600'
    : 'text-gray-500'

  // Calculate percentages for tooltip
  const improvedPct = total > 0 ? Math.round((improved / total) * 100) : 0
  const worsenedPct = total > 0 ? Math.round((worsened / total) * 100) : 0
  const unchangedPct = total > 0 ? Math.round((unchanged / total) * 100) : 0

  const tooltip = `${label}

Verbessert: ${improved} von ${total} (${improvedPct}%)
→ Mehr Selbstfürsorge (Selten→Mittel→Oft)

Verschlechtert: ${worsened} von ${total} (${worsenedPct}%)
→ Weniger Selbstfürsorge (Oft→Mittel→Selten)

Unverändert: ${unchanged} von ${total} (${unchangedPct}%)

Gesamt-Trend: ${trend === 'positive' ? 'Positiv (mehr Verbesserungen)' : trend === 'negative' ? 'Negativ (mehr Verschlechterungen)' : 'Neutral (gleich viele)'}`

  return (
    <div className={`p-3 rounded-lg ${bgColor} text-center cursor-help transition-transform hover:scale-105`} title={tooltip}>
      <p className="text-xs font-medium text-gray-600 truncate">{label}</p>
      <p className={`text-2xl font-bold ${textColor}`}>{trendIcon}</p>
      <p className="text-xs text-gray-500">
        <span className="text-green-600">{improved}↑</span>{' '}
        <span className="text-red-600">{worsened}↓</span>{' '}
        <span className="text-gray-400">{unchanged}→</span>
      </p>
    </div>
  )
}

export function SelfCareComparison({ pairedAssessments }: SelfCareComparisonProps) {
  // Calculate metrics for each self-care field
  const metrics = SELFCARE_FIELDS.map(({ field, label }) =>
    calculateAggregatedCategory(pairedAssessments, field, label, SELFCARE_CATEGORIES, true)
  )

  // Convert to FieldSummary format
  const summaries: FieldSummary[] = metrics.map(m => ({
    label: m.label,
    improved: m.improved,
    worsened: m.worsened,
    unchanged: m.unchanged,
    total: m.total,
  }))

  // Calculate totals
  const totalImproved = summaries.reduce((sum, s) => sum + s.improved, 0)
  const totalWorsened = summaries.reduce((sum, s) => sum + s.worsened, 0)
  const totalUnchanged = summaries.reduce((sum, s) => sum + s.unchanged, 0)

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-sm font-medium text-gray-700 mb-1">
        Selbstfürsorge (n={pairedAssessments.length} gepaart)
      </h3>
      <p className="text-xs text-gray-500 mb-2">
        Wie oft wird Selbstfürsorge praktiziert? (Selten → Mittel → Oft)
      </p>
      <p className="text-xs text-gray-500 mb-3">
        {totalImproved > totalWorsened ? (
          <span className="text-green-600">
            Gesamt: {totalImproved} verbessert, {totalWorsened} verschlechtert, {totalUnchanged} unverändert
          </span>
        ) : totalImproved < totalWorsened ? (
          <span className="text-red-600">
            Gesamt: {totalImproved} verbessert, {totalWorsened} verschlechtert, {totalUnchanged} unverändert
          </span>
        ) : (
          <span className="text-gray-600">
            Gesamt: {totalImproved} verbessert, {totalWorsened} verschlechtert, {totalUnchanged} unverändert
          </span>
        )}
      </p>

      <div className="grid grid-cols-4 gap-2">
        {summaries.map(summary => (
          <SummaryCard key={summary.label} {...summary} />
        ))}
      </div>

      <p className="text-xs text-gray-400 mt-3 text-center">
        Verbesserung = mehr Selbstfürsorge (Selten→Mittel→Oft)
      </p>
    </div>
  )
}
