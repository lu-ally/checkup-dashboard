"use client"

import {
  calculateOverallImprovement,
  calculateWellbeingSummary,
  calculateBurdensSummary,
  calculateLifeAreasSummary,
  calculateSelfCareSummary,
  prepareRadarChartData,
  CategorySummary
} from '@/lib/summaryCalculations'
import { RadarChart } from './RadarChart'

type AssessmentData = Record<string, unknown> & {
  wellbeing?: number | null
  stress?: string | null
  exhaustion?: string | null
  anxiety?: string | null
  depression?: string | null
  selfDoubt?: string | null
  sleepProblems?: string | null
  tension?: string | null
  irritability?: string | null
  socialWithdrawal?: string | null
  other?: string | null
  workArea?: number | null
  privateArea?: number | null
  adequateSleep?: string | null
  healthyEating?: string | null
  sufficientRest?: string | null
  exercise?: string | null
  setBoundaries?: string | null
  timeForBeauty?: string | null
  shareEmotions?: string | null
  liveValues?: string | null
}

interface AssessmentSummaryProps {
  t0Assessment: AssessmentData | null
  t4Assessment: AssessmentData | null
}

function SummaryCard({
  title,
  icon,
  summary,
  showDetails = true
}: {
  title: string
  icon: string
  summary: CategorySummary
  showDetails?: boolean
}) {
  const { avgChange, improved, worsened, total } = summary
  const isPositive = avgChange >= 1
  const isNegative = avgChange <= -1

  const colorClass = isPositive
    ? 'text-green-600 bg-green-50'
    : isNegative
    ? 'text-red-600 bg-red-50'
    : 'text-gray-600 bg-gray-50'

  const iconArrow = isPositive ? '↑' : isNegative ? '↓' : '→'

  return (
    <div className={`p-4 rounded-lg border-2 ${colorClass} border-opacity-20`}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-2xl">{icon}</span>
        <h4 className="text-sm font-semibold text-gray-900">{title}</h4>
      </div>

      <div className="flex items-baseline gap-2 mb-1">
        <span className={`text-3xl font-bold ${colorClass.split(' ')[0]}`}>
          {iconArrow} {Math.abs(avgChange).toFixed(0)}%
        </span>
      </div>

      {showDetails && total > 0 && (
        <div className="text-xs text-gray-600 mt-2">
          {improved > 0 && <span className="text-green-600">{improved} verbessert</span>}
          {improved > 0 && (worsened > 0 || total - improved - worsened > 0) && <span> · </span>}
          {worsened > 0 && <span className="text-red-600">{worsened} verschlechtert</span>}
          {worsened > 0 && total - improved - worsened > 0 && <span> · </span>}
          {total - improved - worsened > 0 && <span className="text-gray-500">{total - improved - worsened} unverändert</span>}
        </div>
      )}
    </div>
  )
}

export function AssessmentSummary({
  t0Assessment,
  t4Assessment
}: AssessmentSummaryProps) {
  // Wenn nur T0 vorhanden ist
  if (t0Assessment && !t4Assessment) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-3">
          <span className="text-2xl">⏳</span>
          <div>
            <p className="text-sm font-medium text-blue-900">
              Baseline-Daten erfasst
            </p>
            <p className="text-xs text-blue-700 mt-1">
              T4-Bewertung steht noch aus. Vergleich wird verfügbar sein nach der 4-Wochen-Bewertung.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Wenn nur T4 vorhanden ist
  if (!t0Assessment && t4Assessment) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <p className="text-sm font-medium text-yellow-900">
              Keine Baseline-Daten verfügbar
            </p>
            <p className="text-xs text-yellow-700 mt-1">
              T0-Bewertung fehlt. Vergleich nicht möglich.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Wenn keine Daten vorhanden
  if (!t0Assessment && !t4Assessment) {
    return null
  }

  // Berechnungen
  const overallImprovement = calculateOverallImprovement(t0Assessment, t4Assessment)
  const wellbeingSummary = calculateWellbeingSummary(
    t0Assessment?.wellbeing || null,
    t4Assessment?.wellbeing || null
  )
  const burdensSummary = calculateBurdensSummary(t0Assessment, t4Assessment)
  const lifeAreasSummary = calculateLifeAreasSummary(t0Assessment, t4Assessment)
  const selfCareSummary = calculateSelfCareSummary(t0Assessment, t4Assessment)

  // Radar-Chart-Daten
  const radarData = prepareRadarChartData(t0Assessment, t4Assessment)

  return (
    <div className="bg-white shadow rounded-lg p-6 mb-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">Zusammenfassung der Entwicklung</h2>
        <p className="text-sm text-gray-600 mt-1">
          Vergleich der Assessment-Ergebnisse zwischen T0 und T4
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Linke Spalte: Statistiken */}
        <div className="space-y-4">
          {/* Gesamtverbesserung */}
          <div className={`p-6 rounded-lg border-2 ${
            overallImprovement >= 1
              ? 'bg-green-50 text-green-600 border-green-200'
              : overallImprovement <= -1
              ? 'bg-red-50 text-red-600 border-red-200'
              : 'bg-gray-50 text-gray-600 border-gray-200'
          }`}>
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Durchschnittliche Gesamtverbesserung
            </h3>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold">
                {overallImprovement >= 1 ? '↑' : overallImprovement <= -1 ? '↓' : '→'}
              </span>
              <span className="text-4xl font-bold">
                {Math.abs(overallImprovement).toFixed(0)}%
              </span>
            </div>
            <p className="text-xs mt-2 text-gray-600">
              {overallImprovement >= 1
                ? 'Positive Entwicklung über alle Bereiche'
                : overallImprovement <= -1
                ? 'Negative Entwicklung über alle Bereiche'
                : 'Stabile Entwicklung über alle Bereiche'}
            </p>
          </div>

          {/* Bereichs-Übersicht */}
          <div className="grid grid-cols-2 gap-3">
            <SummaryCard
              title="Wohlbefinden"
              icon="😊"
              summary={wellbeingSummary}
              showDetails={false}
            />
            <SummaryCard
              title="Belastungen"
              icon="🧠"
              summary={burdensSummary}
            />
            <SummaryCard
              title="Lebensbereiche"
              icon="🏡"
              summary={lifeAreasSummary}
            />
            <SummaryCard
              title="Selbstfürsorge"
              icon="💆"
              summary={selfCareSummary}
            />
          </div>
        </div>

        {/* Rechte Spalte: Radar-Chart */}
        <div className="flex items-center justify-center bg-gray-50 rounded-lg p-4">
          <RadarChart
            labels={radarData.labels}
            t0Data={radarData.t0Data}
            t4Data={radarData.t4Data}
          />
        </div>
      </div>
    </div>
  )
}
