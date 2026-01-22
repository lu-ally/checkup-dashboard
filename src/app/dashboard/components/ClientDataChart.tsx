"use client"

import React from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  TooltipItem,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

interface Assessment {
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

interface ClientData {
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

interface ClientDataChartProps {
  data: ClientData[]
}

interface PairedClient {
  t0: Assessment
  t4: Assessment
}

interface FieldSummary {
  label: string
  improved: number
  worsened: number
  unchanged: number
  total: number
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DatasetWithCounts = any & {
  counts?: number[]
}

// Convert category to numeric value for comparison
function getCategoryValue(value: string | null): number {
  if (!value) return 0
  const normalized = value.toLowerCase().trim()
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

// Summary Card Component
function SummaryCard({
  label,
  improved,
  worsened,
  unchanged,
  total,
  isPositiveMetric
}: FieldSummary & { isPositiveMetric: boolean }) {
  const netChange = improved - worsened
  const trend = netChange > 0 ? 'positive' : netChange < 0 ? 'negative' : 'neutral'

  // For burdens: decrease = good (down arrow green)
  // For self-care: increase = good (up arrow green)
  const trendIcon = trend === 'positive'
    ? (isPositiveMetric ? '↑' : '↓')
    : trend === 'negative'
    ? (isPositiveMetric ? '↓' : '↑')
    : '→'

  const bgColor = trend === 'positive' ? 'bg-green-50'
    : trend === 'negative' ? 'bg-red-50'
    : 'bg-gray-50'

  const textColor = trend === 'positive' ? 'text-green-600'
    : trend === 'negative' ? 'text-red-600'
    : 'text-gray-500'

  const improvedSymbol = isPositiveMetric ? '↑' : '↓'
  const worsenedSymbol = isPositiveMetric ? '↓' : '↑'

  // Calculate percentages for tooltip
  const improvedPct = total > 0 ? Math.round((improved / total) * 100) : 0
  const worsenedPct = total > 0 ? Math.round((worsened / total) * 100) : 0
  const unchangedPct = total > 0 ? Math.round((unchanged / total) * 100) : 0

  const improvementText = isPositiveMetric
    ? 'Mehr Selbstfürsorge (Selten→Mittel→Oft)'
    : 'Belastung gesunken (Stark→Mittel→Gering)'
  const worseningText = isPositiveMetric
    ? 'Weniger Selbstfürsorge (Oft→Mittel→Selten)'
    : 'Belastung gestiegen (Gering→Mittel→Stark)'

  const tooltip = `${label}

Verbessert: ${improved} von ${total} (${improvedPct}%)
→ ${improvementText}

Verschlechtert: ${worsened} von ${total} (${worsenedPct}%)
→ ${worseningText}

Unverändert: ${unchanged} von ${total} (${unchangedPct}%)

Gesamt-Trend: ${trend === 'positive' ? 'Positiv (mehr Verbesserungen)' : trend === 'negative' ? 'Negativ (mehr Verschlechterungen)' : 'Neutral (gleich viele)'}`

  return (
    <div className={`p-3 rounded-lg ${bgColor} text-center cursor-help transition-transform hover:scale-105`} title={tooltip}>
      <p className="text-xs font-medium text-gray-600 truncate">{label}</p>
      <p className={`text-2xl font-bold ${textColor}`}>{trendIcon}</p>
      <p className="text-xs text-gray-500">
        <span className="text-green-600">{improved}{improvedSymbol}</span>{' '}
        <span className="text-red-600">{worsened}{worsenedSymbol}</span>{' '}
        <span className="text-gray-400">{unchanged}→</span>
      </p>
    </div>
  )
}

export function ClientDataChart({ data }: ClientDataChartProps) {
  // Filter to clients with both T0 and T4
  const pairedClients: PairedClient[] = data
    .filter(client => {
      const hasT0 = client.assessments.some(a => a.timepoint === 'T0')
      const hasT4 = client.assessments.some(a => a.timepoint === 'T4')
      return hasT0 && hasT4
    })
    .map(client => ({
      t0: client.assessments.find(a => a.timepoint === 'T0')!,
      t4: client.assessments.find(a => a.timepoint === 'T4')!,
    }))

  // Also keep all T4 data for coaching satisfaction (separate from paired)
  const allT4Data = data.flatMap(client => client.assessments).filter(a => a.timepoint === 'T4')

  // Calculate burden field summary (lower is better)
  const calculateBurdenSummary = (
    field: keyof Pick<Assessment, 'stress' | 'exhaustion' | 'anxiety' | 'depression' | 'selfDoubt' | 'sleepProblems' | 'tension' | 'irritability' | 'socialWithdrawal' | 'other'>,
    label: string
  ): FieldSummary => {
    let improved = 0
    let worsened = 0
    let unchanged = 0

    pairedClients.forEach(pair => {
      const t0Val = getCategoryValue(pair.t0[field] as string | null)
      const t4Val = getCategoryValue(pair.t4[field] as string | null)

      if (t0Val > 0 && t4Val > 0) {
        if (t4Val < t0Val) improved++      // Less burden = improvement
        else if (t4Val > t0Val) worsened++ // More burden = worsening
        else unchanged++
      }
    })

    return { label, improved, worsened, unchanged, total: improved + worsened + unchanged }
  }

  // Calculate self-care field summary (higher is better)
  const calculateSelfCareSummary = (
    field: keyof Pick<Assessment, 'adequateSleep' | 'healthyEating' | 'sufficientRest' | 'exercise' | 'setBoundaries' | 'timeForBeauty' | 'shareEmotions' | 'liveValues'>,
    label: string
  ): FieldSummary => {
    let improved = 0
    let worsened = 0
    let unchanged = 0

    pairedClients.forEach(pair => {
      const t0Val = getCategoryValue(pair.t0[field] as string | null)
      const t4Val = getCategoryValue(pair.t4[field] as string | null)

      if (t0Val > 0 && t4Val > 0) {
        if (t4Val > t0Val) improved++      // More self-care = improvement
        else if (t4Val < t0Val) worsened++ // Less self-care = worsening
        else unchanged++
      }
    })

    return { label, improved, worsened, unchanged, total: improved + worsened + unchanged }
  }

  // Burden summaries
  const burdenSummaries: FieldSummary[] = [
    calculateBurdenSummary('stress', 'Stress'),
    calculateBurdenSummary('exhaustion', 'Erschöpfung'),
    calculateBurdenSummary('anxiety', 'Angst'),
    calculateBurdenSummary('depression', 'Depression'),
    calculateBurdenSummary('selfDoubt', 'Selbstzweifel'),
    calculateBurdenSummary('sleepProblems', 'Schlafprobl.'),
    calculateBurdenSummary('tension', 'Anspannung'),
    calculateBurdenSummary('irritability', 'Reizbarkeit'),
    calculateBurdenSummary('socialWithdrawal', 'Rückzug'),
    calculateBurdenSummary('other', 'Anderes'),
  ]

  // Self-care summaries
  const selfCareSummaries: FieldSummary[] = [
    calculateSelfCareSummary('adequateSleep', 'Schlaf'),
    calculateSelfCareSummary('healthyEating', 'Ernährung'),
    calculateSelfCareSummary('sufficientRest', 'Ruhe'),
    calculateSelfCareSummary('exercise', 'Sport'),
    calculateSelfCareSummary('setBoundaries', 'Grenzen'),
    calculateSelfCareSummary('timeForBeauty', 'Schönes'),
    calculateSelfCareSummary('shareEmotions', 'Gefühle'),
    calculateSelfCareSummary('liveValues', 'Werte'),
  ]

  // Wellbeing comparison (paired data)
  const calculateWellbeingComparison = () => {
    const fields: { field: 'wellbeing' | 'workArea' | 'privateArea'; label: string }[] = [
      { field: 'wellbeing', label: 'Wohlbefinden' },
      { field: 'workArea', label: 'Arbeit' },
      { field: 'privateArea', label: 'Privat' },
    ]

    return fields.map(({ field, label }) => {
      let sumT0 = 0, sumT4 = 0, count = 0

      pairedClients.forEach(pair => {
        const t0Val = pair.t0[field]
        const t4Val = pair.t4[field]
        if (t0Val !== null && t4Val !== null) {
          sumT0 += t0Val
          sumT4 += t4Val
          count++
        }
      })

      return {
        label,
        avgT0: count > 0 ? sumT0 / count : 0,
        avgT4: count > 0 ? sumT4 / count : 0,
        count,
      }
    })
  }

  const wellbeingData = calculateWellbeingComparison()

  const wellbeingChartData = {
    labels: wellbeingData.map(d => d.label),
    datasets: [
      {
        label: 'T0 (Baseline)',
        data: wellbeingData.map(d => d.avgT0),
        counts: wellbeingData.map(d => d.count),
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1,
      },
      {
        label: 'T4 (nach 4 Wochen)',
        data: wellbeingData.map(d => d.avgT4),
        counts: wellbeingData.map(d => d.count),
        backgroundColor: 'rgba(16, 185, 129, 0.5)',
        borderColor: 'rgb(16, 185, 129)',
        borderWidth: 1,
      },
    ],
  }

  const wellbeingOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: `Wohlbefinden & Lebensbereiche (n=${pairedClients.length} gepaart)`,
      },
      tooltip: {
        callbacks: {
          label: function(context: TooltipItem<'bar'>) {
            const label = context.dataset.label || ''
            const value = context.parsed.y
            const count = (context.dataset as DatasetWithCounts).counts?.[context.dataIndex] || 0
            return `${label}: ${value.toFixed(1)}/10 (n=${count})`
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 10,
      },
    },
  }

  // Coaching satisfaction (T4 only, all clients with T4)
  const calculateAverageWithCount = (field: 'learningExperience' | 'progressAchievement' | 'generalSatisfaction') => {
    const validValues = allT4Data.filter(item => item[field] !== null).map(item => item[field] as number)
    const count = validValues.length
    const average = count === 0 ? 0 : validValues.reduce((sum, val) => sum + val, 0) / count
    return { average, count }
  }

  const learningT4 = calculateAverageWithCount('learningExperience')
  const progressT4 = calculateAverageWithCount('progressAchievement')
  const satisfactionT4 = calculateAverageWithCount('generalSatisfaction')

  const coachingSatisfactionData = {
    labels: ['Lernerfahrung', 'Zielerreichung', 'Gesamtzufriedenheit'],
    datasets: [
      {
        label: 'T4 Bewertung',
        data: [learningT4.average, progressT4.average, satisfactionT4.average],
        counts: [learningT4.count, progressT4.count, satisfactionT4.count],
        backgroundColor: 'rgba(168, 85, 247, 0.5)',
        borderColor: 'rgb(168, 85, 247)',
        borderWidth: 1,
      },
    ],
  }

  // Total summaries
  const totalBurdenImproved = burdenSummaries.reduce((sum, s) => sum + s.improved, 0)
  const totalBurdenWorsened = burdenSummaries.reduce((sum, s) => sum + s.worsened, 0)
  const totalSelfCareImproved = selfCareSummaries.reduce((sum, s) => sum + s.improved, 0)
  const totalSelfCareWorsened = selfCareSummaries.reduce((sum, s) => sum + s.worsened, 0)

  return (
    <div className="space-y-6">
      {/* Row 1: Wellbeing + Coaching Rating */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <Bar data={wellbeingChartData} options={wellbeingOptions} />
        </div>

        {allT4Data.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow">
            <Bar
              data={coachingSatisfactionData}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'top' as const,
                  },
                  title: {
                    display: true,
                    text: `Coaching-Bewertung T4 (n=${allT4Data.length})`,
                  },
                  tooltip: {
                    callbacks: {
                      label: function(context: TooltipItem<'bar'>) {
                        const label = context.dataset.label || ''
                        const value = context.parsed.y
                        const count = (context.dataset as DatasetWithCounts).counts?.[context.dataIndex] || 0
                        return `${label}: ${value.toFixed(1)}/10 (n=${count})`
                      }
                    }
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    max: 10,
                  },
                },
              }}
            />
          </div>
        )}
      </div>

      {/* Row 2: Psychological Burdens + Self-Care */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-700 mb-1">
            Psychische Belastungen (n={pairedClients.length} gepaart)
          </h3>
          <p className="text-xs text-gray-500 mb-2">
            Wie stark sind Belastungen vorhanden? (Gering → Mittel → Stark)
          </p>
          <p className="text-xs text-gray-500 mb-3">
            {totalBurdenImproved > totalBurdenWorsened ? (
              <span className="text-green-600">Gesamt: {totalBurdenImproved} verbessert, {totalBurdenWorsened} verschlechtert</span>
            ) : totalBurdenImproved < totalBurdenWorsened ? (
              <span className="text-red-600">Gesamt: {totalBurdenImproved} verbessert, {totalBurdenWorsened} verschlechtert</span>
            ) : (
              <span className="text-gray-600">Gesamt: {totalBurdenImproved} verbessert, {totalBurdenWorsened} verschlechtert</span>
            )}
          </p>
          <div className="grid grid-cols-5 gap-2">
            {burdenSummaries.map(summary => (
              <SummaryCard key={summary.label} {...summary} isPositiveMetric={false} />
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-3 text-center">
            Verbesserung = weniger Belastung (Stark→Mittel→Gering)
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-700 mb-1">
            Selbstfürsorge (n={pairedClients.length} gepaart)
          </h3>
          <p className="text-xs text-gray-500 mb-2">
            Wie oft wird Selbstfürsorge praktiziert? (Selten → Mittel → Oft)
          </p>
          <p className="text-xs text-gray-500 mb-3">
            {totalSelfCareImproved > totalSelfCareWorsened ? (
              <span className="text-green-600">Gesamt: {totalSelfCareImproved} verbessert, {totalSelfCareWorsened} verschlechtert</span>
            ) : totalSelfCareImproved < totalSelfCareWorsened ? (
              <span className="text-red-600">Gesamt: {totalSelfCareImproved} verbessert, {totalSelfCareWorsened} verschlechtert</span>
            ) : (
              <span className="text-gray-600">Gesamt: {totalSelfCareImproved} verbessert, {totalSelfCareWorsened} verschlechtert</span>
            )}
          </p>
          <div className="grid grid-cols-4 gap-2">
            {selfCareSummaries.map(summary => (
              <SummaryCard key={summary.label} {...summary} isPositiveMetric={true} />
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-3 text-center">
            Verbesserung = mehr Selbstfürsorge (Selten→Mittel→Oft)
          </p>
        </div>
      </div>
    </div>
  )
}
