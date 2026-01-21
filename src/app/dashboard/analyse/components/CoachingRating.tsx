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
  calculateCoachingRatingNumeric,
  calculateCoachingRatingCategory,
} from '@/lib/analyseCalculations'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

interface CoachingRatingProps {
  pairedAssessments: PairedAssessment[]
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DatasetWithCounts = any & {
  counts?: number[]
}

const RELATIONSHIP_CATEGORIES = ['Gering', 'Mittel', 'Stark']

export function CoachingRating({ pairedAssessments }: CoachingRatingProps) {
  // Numeric ratings (0-10)
  const learningExperience = calculateCoachingRatingNumeric(
    pairedAssessments,
    'learningExperience' as keyof Assessment,
    'Lernerfahrung'
  )
  const progressAchievement = calculateCoachingRatingNumeric(
    pairedAssessments,
    'progressAchievement' as keyof Assessment,
    'Zielerreichung'
  )
  const generalSatisfaction = calculateCoachingRatingNumeric(
    pairedAssessments,
    'generalSatisfaction' as keyof Assessment,
    'Zufriedenheit'
  )

  // Categorical ratings (relationship quality)
  const trust = calculateCoachingRatingCategory(
    pairedAssessments,
    'trust' as keyof Assessment,
    'Vertrauen',
    RELATIONSHIP_CATEGORIES
  )
  const genuineInterest = calculateCoachingRatingCategory(
    pairedAssessments,
    'genuineInterest' as keyof Assessment,
    'Echtes Interesse',
    RELATIONSHIP_CATEGORIES
  )
  const mutualUnderstanding = calculateCoachingRatingCategory(
    pairedAssessments,
    'mutualUnderstanding' as keyof Assessment,
    'Verständnis',
    RELATIONSHIP_CATEGORIES
  )
  const goalAlignment = calculateCoachingRatingCategory(
    pairedAssessments,
    'goalAlignment' as keyof Assessment,
    'Zielabstimmung',
    RELATIONSHIP_CATEGORIES
  )

  const numericMetrics = [learningExperience, progressAchievement, generalSatisfaction]
  const categoryMetrics = [trust, genuineInterest, mutualUnderstanding, goalAlignment]

  // Chart for numeric ratings
  const numericChartData = {
    labels: numericMetrics.map(m => m.label),
    datasets: [
      {
        label: 'Durchschnitt (T4)',
        data: numericMetrics.map(m => m.average),
        counts: numericMetrics.map(m => m.count),
        backgroundColor: 'rgba(168, 85, 247, 0.5)',
        borderColor: 'rgb(168, 85, 247)',
        borderWidth: 1,
      },
    ],
  }

  const numericOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Coaching-Bewertung (nur T4)',
      },
      tooltip: {
        callbacks: {
          label: function(context: TooltipItem<'bar'>) {
            const value = context.parsed.y
            const count = (context.dataset as DatasetWithCounts).counts?.[context.dataIndex] || 0
            return `Durchschnitt: ${value.toFixed(1)}/10 (n=${count})`
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

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <Bar data={numericChartData} options={numericOptions} />

      {/* Relationship Quality */}
      <div className="mt-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Beziehungsqualität zum Coach</h4>
        <div className="grid grid-cols-2 gap-3">
          {categoryMetrics.map(metric => {
            const starkPercent = metric.distribution?.find(d => d.category === 'Stark')?.percent || 0
            return (
              <div key={metric.label} className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-700">{metric.label}</p>
                <div className="flex items-center mt-1">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${starkPercent}%` }}
                    />
                  </div>
                  <span className="ml-2 text-sm font-medium text-green-600">
                    {starkPercent.toFixed(0)}%
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  bewerten mit &quot;Stark&quot; (n={metric.count})
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
