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
  calculateAggregatedNumeric,
} from '@/lib/analyseCalculations'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

interface WellbeingComparisonProps {
  pairedAssessments: PairedAssessment[]
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DatasetWithCounts = any & {
  counts?: number[]
}

export function WellbeingComparison({ pairedAssessments }: WellbeingComparisonProps) {
  // Calculate metrics
  const wellbeing = calculateAggregatedNumeric(pairedAssessments, 'wellbeing' as keyof Assessment, 'Wohlbefinden')
  const workArea = calculateAggregatedNumeric(pairedAssessments, 'workArea' as keyof Assessment, 'Arbeitsbereich')
  const privateArea = calculateAggregatedNumeric(pairedAssessments, 'privateArea' as keyof Assessment, 'Privatbereich')

  const chartData = {
    labels: ['Wohlbefinden', 'Arbeitsbereich', 'Privatbereich'],
    datasets: [
      {
        label: 'T0 (Baseline)',
        data: [wellbeing.avgT0, workArea.avgT0, privateArea.avgT0],
        counts: [wellbeing.t0Count, workArea.t0Count, privateArea.t0Count],
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1,
      },
      {
        label: 'T4 (nach 4 Wochen)',
        data: [wellbeing.avgT4, workArea.avgT4, privateArea.avgT4],
        counts: [wellbeing.t4Count, workArea.t4Count, privateArea.t4Count],
        backgroundColor: 'rgba(16, 185, 129, 0.5)',
        borderColor: 'rgb(16, 185, 129)',
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
        text: 'Wohlbefinden & Lebensbereiche (Durchschnitt)',
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

  // Summary statistics
  const metrics = [wellbeing, workArea, privateArea]

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <Bar data={chartData} options={options} />

      {/* Improvement Summary */}
      <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
        {metrics.map(metric => (
          <div key={metric.label} className="text-center p-2 bg-gray-50 rounded">
            <p className="font-medium text-gray-700">{metric.label}</p>
            <p className={`text-lg font-bold ${metric.avgChange > 0 ? 'text-green-600' : metric.avgChange < 0 ? 'text-red-600' : 'text-gray-600'}`}>
              {metric.avgChange > 0 ? '+' : ''}{metric.avgChange.toFixed(1)}
            </p>
            <p className="text-xs text-gray-500">
              {metric.improved} verbessert, {metric.worsened} verschlechtert
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
