"use client"

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
import {
  PairedAssessment,
  Assessment,
  calculateAggregatedCategory,
} from '@/lib/analyseCalculations'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

interface SelfCareComparisonProps {
  pairedAssessments: PairedAssessment[]
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DatasetWithCounts = any & {
  counts?: number[]
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

export function SelfCareComparison({ pairedAssessments }: SelfCareComparisonProps) {
  // Calculate metrics for each self-care field
  const metrics = SELFCARE_FIELDS.map(({ field, label }) =>
    calculateAggregatedCategory(pairedAssessments, field, label, SELFCARE_CATEGORIES, true)
  )

  // Create chart data - show T0 vs T4 distribution for "Oft"
  // (more "Oft" = improvement for self-care)
  const chartData = {
    labels: SELFCARE_FIELDS.map(f => f.label),
    datasets: [
      {
        label: 'Oft (T0)',
        data: metrics.map(m => m.t0Distribution.find(d => d.category === 'Oft')?.percent || 0),
        counts: metrics.map(m => m.t0Distribution.find(d => d.category === 'Oft')?.count || 0),
        backgroundColor: 'rgba(34, 197, 94, 0.5)',
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 1,
      },
      {
        label: 'Oft (T4)',
        data: metrics.map(m => m.t4Distribution.find(d => d.category === 'Oft')?.percent || 0),
        counts: metrics.map(m => m.t4Distribution.find(d => d.category === 'Oft')?.count || 0),
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 1,
      },
      {
        label: 'Selten (T0)',
        data: metrics.map(m => m.t0Distribution.find(d => d.category === 'Selten')?.percent || 0),
        counts: metrics.map(m => m.t0Distribution.find(d => d.category === 'Selten')?.count || 0),
        backgroundColor: 'rgba(239, 68, 68, 0.5)',
        borderColor: 'rgb(239, 68, 68)',
        borderWidth: 1,
      },
      {
        label: 'Selten (T4)',
        data: metrics.map(m => m.t4Distribution.find(d => d.category === 'Selten')?.percent || 0),
        counts: metrics.map(m => m.t4Distribution.find(d => d.category === 'Selten')?.count || 0),
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        borderColor: 'rgb(239, 68, 68)',
        borderWidth: 1,
      },
    ],
  }

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Selbstfürsorge (Verteilung in %)',
      },
      tooltip: {
        callbacks: {
          label: function(context: TooltipItem<'bar'>) {
            const label = context.dataset.label || ''
            const percent = context.parsed.y
            const count = (context.dataset as DatasetWithCounts).counts?.[context.dataIndex] || 0
            return `${label}: ${percent.toFixed(1)}% (n=${count})`
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: function(value: string | number) {
            return value + '%'
          }
        }
      },
    },
  }

  // Calculate total improvements
  const totalImproved = metrics.reduce((sum, m) => sum + m.improved, 0)
  const totalWorsened = metrics.reduce((sum, m) => sum + m.worsened, 0)
  const totalUnchanged = metrics.reduce((sum, m) => sum + m.unchanged, 0)

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <Bar data={chartData} options={options} />

      {/* Summary */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600 text-center">
          <span className="font-medium text-green-600">{totalImproved}</span> Verbesserungen,{' '}
          <span className="font-medium text-red-600">{totalWorsened}</span> Verschlechterungen,{' '}
          <span className="font-medium text-gray-600">{totalUnchanged}</span> unverändert
        </p>
        <p className="text-xs text-gray-500 text-center mt-1">
          Mehr &quot;Oft&quot; / Weniger &quot;Selten&quot; = Verbesserung
        </p>
      </div>
    </div>
  )
}
