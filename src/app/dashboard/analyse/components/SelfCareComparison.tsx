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

  const trendText = trend === 'positive' ? 'Positiv' : trend === 'negative' ? 'Negativ' : 'Neutral'

  return (
    <div className={`relative p-3 rounded-lg ${bgColor} text-center cursor-help transition-transform hover:scale-105 group`}>
      <p className="text-xs font-medium text-gray-600 truncate">{label}</p>
      <p className={`text-2xl font-bold ${textColor}`}>{trendIcon}</p>
      <p className="text-xs text-gray-500">
        <span className="text-green-600">{improved}↑</span>{' '}
        <span className="text-red-600">{worsened}↓</span>{' '}
        <span className="text-gray-400">{unchanged}→</span>
      </p>
      {/* Custom Tooltip */}
      <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity duration-150 w-56 text-left pointer-events-none">
        <p className="font-semibold mb-1">{label}</p>
        <p className="text-green-400">Verbessert: {improved} ({improvedPct}%)</p>
        <p className="text-gray-400 text-[10px] mb-1">→ Mehr Selbstfürsorge</p>
        <p className="text-red-400">Verschlechtert: {worsened} ({worsenedPct}%)</p>
        <p className="text-gray-400 text-[10px] mb-1">→ Weniger Selbstfürsorge</p>
        <p className="text-gray-300">Unverändert: {unchanged} ({unchangedPct}%)</p>
        <p className="mt-1 pt-1 border-t border-gray-700">Trend: {trendText}</p>
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
      </div>
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
