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
  LineElement,
  PointElement,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
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

export function ClientDataChart({ data }: ClientDataChartProps) {
  // Flatten assessments and separate by timepoint
  const allAssessments = data.flatMap(client => client.assessments)
  const t0Data = allAssessments.filter(assessment => assessment.timepoint === 'T0')
  const t4Data = allAssessments.filter(assessment => assessment.timepoint === 'T4')

  const calculateAverage = (dataset: Assessment[], field: 'wellbeing' | 'workArea' | 'privateArea' | 'learningExperience' | 'progressAchievement' | 'generalSatisfaction') => {
    const validValues = dataset.filter(item => item[field] !== null).map(item => item[field] as number)
    if (validValues.length === 0) return 0
    return validValues.reduce((sum, val) => sum + val, 0) / validValues.length
  }

  const calculateCategoricalCounts = (dataset: Assessment[], field: keyof Pick<Assessment, 'stress' | 'exhaustion' | 'anxiety' | 'depression'>) => {
    const counts = { Gering: 0, Mittel: 0, Stark: 0 }
    dataset.forEach(item => {
      const value = item[field] as keyof typeof counts
      if (value && value in counts) {
        counts[value]++
      }
    })
    return counts
  }

  const calculateSelfCareCounts = (dataset: Assessment[], field: keyof Pick<Assessment, 'adequateSleep' | 'healthyEating' | 'sufficientRest' | 'exercise' | 'setBoundaries' | 'timeForBeauty' | 'shareEmotions' | 'liveValues'>) => {
    const counts = { Selten: 0, Mittel: 0, Oft: 0 }
    dataset.forEach(item => {
      const value = item[field] as keyof typeof counts
      if (value && value in counts) {
        counts[value]++
      }
    })
    return counts
  }

  // Wellbeing and Life Areas Chart
  const wellbeingChartData = {
    labels: ['Wohlbefinden', 'Arbeit', 'Privat'],
    datasets: [
      {
        label: 'T0 (Baseline)',
        data: [
          calculateAverage(t0Data, 'wellbeing'),
          calculateAverage(t0Data, 'workArea'),
          calculateAverage(t0Data, 'privateArea'),
        ],
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1,
      },
      {
        label: 'T4 (nach 4 Wochen)',
        data: [
          calculateAverage(t4Data, 'wellbeing'),
          calculateAverage(t4Data, 'workArea'),
          calculateAverage(t4Data, 'privateArea'),
        ],
        backgroundColor: 'rgba(16, 185, 129, 0.5)',
        borderColor: 'rgb(16, 185, 129)',
        borderWidth: 1,
      },
    ],
  }

  // Psychological Burdens Chart
  const burdensChartData = {
    labels: ['Stress', 'Erschöpfung', 'Angst', 'Depression'],
    datasets: [
      {
        label: 'Gering (T0)',
        data: [
          calculateCategoricalCounts(t0Data, 'stress').Gering,
          calculateCategoricalCounts(t0Data, 'exhaustion').Gering,
          calculateCategoricalCounts(t0Data, 'anxiety').Gering,
          calculateCategoricalCounts(t0Data, 'depression').Gering,
        ],
        backgroundColor: 'rgba(34, 197, 94, 0.5)',
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 1,
      },
      {
        label: 'Mittel (T0)',
        data: [
          calculateCategoricalCounts(t0Data, 'stress').Mittel,
          calculateCategoricalCounts(t0Data, 'exhaustion').Mittel,
          calculateCategoricalCounts(t0Data, 'anxiety').Mittel,
          calculateCategoricalCounts(t0Data, 'depression').Mittel,
        ],
        backgroundColor: 'rgba(245, 158, 11, 0.5)',
        borderColor: 'rgb(245, 158, 11)',
        borderWidth: 1,
      },
      {
        label: 'Stark (T0)',
        data: [
          calculateCategoricalCounts(t0Data, 'stress').Stark,
          calculateCategoricalCounts(t0Data, 'exhaustion').Stark,
          calculateCategoricalCounts(t0Data, 'anxiety').Stark,
          calculateCategoricalCounts(t0Data, 'depression').Stark,
        ],
        backgroundColor: 'rgba(239, 68, 68, 0.5)',
        borderColor: 'rgb(239, 68, 68)',
        borderWidth: 1,
      },
      {
        label: 'Gering (T4)',
        data: [
          calculateCategoricalCounts(t4Data, 'stress').Gering,
          calculateCategoricalCounts(t4Data, 'exhaustion').Gering,
          calculateCategoricalCounts(t4Data, 'anxiety').Gering,
          calculateCategoricalCounts(t4Data, 'depression').Gering,
        ],
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 1,
      },
      {
        label: 'Mittel (T4)',
        data: [
          calculateCategoricalCounts(t4Data, 'stress').Mittel,
          calculateCategoricalCounts(t4Data, 'exhaustion').Mittel,
          calculateCategoricalCounts(t4Data, 'anxiety').Mittel,
          calculateCategoricalCounts(t4Data, 'depression').Mittel,
        ],
        backgroundColor: 'rgba(245, 158, 11, 0.8)',
        borderColor: 'rgb(245, 158, 11)',
        borderWidth: 1,
      },
      {
        label: 'Stark (T4)',
        data: [
          calculateCategoricalCounts(t4Data, 'stress').Stark,
          calculateCategoricalCounts(t4Data, 'exhaustion').Stark,
          calculateCategoricalCounts(t4Data, 'anxiety').Stark,
          calculateCategoricalCounts(t4Data, 'depression').Stark,
        ],
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        borderColor: 'rgb(239, 68, 68)',
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
        text: 'Durchschnittliche Werte (0-10 Skala)',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 10,
      },
    },
  }

  const burdensOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Psychische Belastungen (Anzahl)',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  }

  // Coaching Satisfaction Chart (T4 only)
  const coachingSatisfactionData = {
    labels: ['Lernerfahrung', 'Zielerreichung', 'Gesamtzufriedenheit'],
    datasets: [
      {
        label: 'T4 Bewertung',
        data: [
          calculateAverage(t4Data, 'learningExperience'),
          calculateAverage(t4Data, 'progressAchievement'),
          calculateAverage(t4Data, 'generalSatisfaction'),
        ],
        backgroundColor: 'rgba(168, 85, 247, 0.5)',
        borderColor: 'rgb(168, 85, 247)',
        borderWidth: 1,
      },
    ],
  }

  // Self-care Chart
  const selfCareData = {
    labels: ['Ausreichend Schlaf', 'Gesunde Ernährung', 'Ausreichend Ruhe', 'Sport'],
    datasets: [
      {
        label: 'Selten (T0)',
        data: [
          calculateSelfCareCounts(t0Data, 'adequateSleep').Selten,
          calculateSelfCareCounts(t0Data, 'healthyEating').Selten,
          calculateSelfCareCounts(t0Data, 'sufficientRest').Selten,
          calculateSelfCareCounts(t0Data, 'exercise').Selten,
        ],
        backgroundColor: 'rgba(239, 68, 68, 0.5)',
        borderColor: 'rgb(239, 68, 68)',
        borderWidth: 1,
      },
      {
        label: 'Mittel (T0)',
        data: [
          calculateSelfCareCounts(t0Data, 'adequateSleep').Mittel,
          calculateSelfCareCounts(t0Data, 'healthyEating').Mittel,
          calculateSelfCareCounts(t0Data, 'sufficientRest').Mittel,
          calculateSelfCareCounts(t0Data, 'exercise').Mittel,
        ],
        backgroundColor: 'rgba(245, 158, 11, 0.5)',
        borderColor: 'rgb(245, 158, 11)',
        borderWidth: 1,
      },
      {
        label: 'Oft (T0)',
        data: [
          calculateSelfCareCounts(t0Data, 'adequateSleep').Oft,
          calculateSelfCareCounts(t0Data, 'healthyEating').Oft,
          calculateSelfCareCounts(t0Data, 'sufficientRest').Oft,
          calculateSelfCareCounts(t0Data, 'exercise').Oft,
        ],
        backgroundColor: 'rgba(34, 197, 94, 0.5)',
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 1,
      },
      {
        label: 'Selten (T4)',
        data: [
          calculateSelfCareCounts(t4Data, 'adequateSleep').Selten,
          calculateSelfCareCounts(t4Data, 'healthyEating').Selten,
          calculateSelfCareCounts(t4Data, 'sufficientRest').Selten,
          calculateSelfCareCounts(t4Data, 'exercise').Selten,
        ],
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        borderColor: 'rgb(239, 68, 68)',
        borderWidth: 1,
      },
      {
        label: 'Mittel (T4)',
        data: [
          calculateSelfCareCounts(t4Data, 'adequateSleep').Mittel,
          calculateSelfCareCounts(t4Data, 'healthyEating').Mittel,
          calculateSelfCareCounts(t4Data, 'sufficientRest').Mittel,
          calculateSelfCareCounts(t4Data, 'exercise').Mittel,
        ],
        backgroundColor: 'rgba(245, 158, 11, 0.8)',
        borderColor: 'rgb(245, 158, 11)',
        borderWidth: 1,
      },
      {
        label: 'Oft (T4)',
        data: [
          calculateSelfCareCounts(t4Data, 'adequateSleep').Oft,
          calculateSelfCareCounts(t4Data, 'healthyEating').Oft,
          calculateSelfCareCounts(t4Data, 'sufficientRest').Oft,
          calculateSelfCareCounts(t4Data, 'exercise').Oft,
        ],
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 1,
      },
    ],
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <Bar data={wellbeingChartData} options={wellbeingOptions} />
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <Bar data={burdensChartData} options={burdensOptions} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <Bar
            data={selfCareData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'top' as const,
                },
                title: {
                  display: true,
                  text: 'Selbstfürsorge (Anzahl)',
                },
              },
            }}
          />
        </div>
        {t4Data.length > 0 && (
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
                    text: 'Coaching-Bewertung T4 (0-10 Skala)',
                  },
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
    </div>
  )
}