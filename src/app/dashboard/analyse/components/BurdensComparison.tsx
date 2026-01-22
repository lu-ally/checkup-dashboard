"use client"

import {
  PairedAssessment,
  Assessment,
  calculateAggregatedCategory,
} from '@/lib/analyseCalculations'

interface BurdensComparisonProps {
  pairedAssessments: PairedAssessment[]
}

interface FieldSummary {
  label: string
  improved: number
  worsened: number
  unchanged: number
  total: number
}

const BURDEN_CATEGORIES = ['Gering', 'Mittel', 'Stark']
const BURDEN_FIELDS: { field: keyof Assessment; label: string }[] = [
  { field: 'stress', label: 'Stress' },
  { field: 'exhaustion', label: 'Erschöpfung' },
  { field: 'anxiety', label: 'Angst' },
  { field: 'depression', label: 'Depression' },
  { field: 'selfDoubt', label: 'Selbstzweifel' },
  { field: 'sleepProblems', label: 'Schlafprobl.' },
  { field: 'tension', label: 'Anspannung' },
  { field: 'irritability', label: 'Reizbarkeit' },
  { field: 'socialWithdrawal', label: 'Rückzug' },
  { field: 'other', label: 'Anderes' },
]

// Summary Card Component
function SummaryCard({ label, improved, worsened, unchanged, total }: FieldSummary) {
  const netChange = improved - worsened
  const trend = netChange > 0 ? 'positive' : netChange < 0 ? 'negative' : 'neutral'

  // For burdens: decrease = good (down arrow green)
  const trendIcon = trend === 'positive' ? '↓' : trend === 'negative' ? '↑' : '→'

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
→ Belastung gesunken (Stark→Mittel→Gering)

Verschlechtert: ${worsened} von ${total} (${worsenedPct}%)
→ Belastung gestiegen (Gering→Mittel→Stark)

Unverändert: ${unchanged} von ${total} (${unchangedPct}%)

Gesamt-Trend: ${trend === 'positive' ? 'Positiv (mehr Verbesserungen)' : trend === 'negative' ? 'Negativ (mehr Verschlechterungen)' : 'Neutral (gleich viele)'}`

  return (
    <div className={`p-3 rounded-lg ${bgColor} text-center cursor-help transition-transform hover:scale-105`} title={tooltip}>
      <p className="text-xs font-medium text-gray-600 truncate">{label}</p>
      <p className={`text-2xl font-bold ${textColor}`}>{trendIcon}</p>
      <p className="text-xs text-gray-500">
        <span className="text-green-600">{improved}↓</span>{' '}
        <span className="text-red-600">{worsened}↑</span>{' '}
        <span className="text-gray-400">{unchanged}→</span>
      </p>
    </div>
  )
}

export function BurdensComparison({ pairedAssessments }: BurdensComparisonProps) {
  // Calculate metrics for each burden field
  const metrics = BURDEN_FIELDS.map(({ field, label }) =>
    calculateAggregatedCategory(pairedAssessments, field, label, BURDEN_CATEGORIES, false)
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
        Psychische Belastungen (n={pairedAssessments.length} gepaart)
      </h3>
      <p className="text-xs text-gray-500 mb-2">
        Wie stark sind Belastungen vorhanden? (Gering → Mittel → Stark)
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

      <div className="grid grid-cols-5 gap-2">
        {summaries.map(summary => (
          <SummaryCard key={summary.label} {...summary} />
        ))}
      </div>

      <p className="text-xs text-gray-400 mt-3 text-center">
        Verbesserung = weniger Belastung (Stark→Mittel→Gering)
      </p>
    </div>
  )
}
