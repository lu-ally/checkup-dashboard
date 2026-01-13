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
  TooltipItem,
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DatasetWithCounts = any & {
  counts?: number[]
}

export function ClientDataChart({ data }: ClientDataChartProps) {
  // Flatten assessments and separate by timepoint
  const allAssessments = data.flatMap(client => client.assessments)
  const t0Data = allAssessments.filter(assessment => assessment.timepoint === 'T0')
  const t4Data = allAssessments.filter(assessment => assessment.timepoint === 'T4')

  const calculateAverageWithCount = (dataset: Assessment[], field: 'wellbeing' | 'workArea' | 'privateArea' | 'learningExperience' | 'progressAchievement' | 'generalSatisfaction') => {
    const validValues = dataset.filter(item => item[field] !== null).map(item => item[field] as number)
    const count = validValues.length
    const average = count === 0 ? 0 : validValues.reduce((sum, val) => sum + val, 0) / count
    return { average, count }
  }

  const calculateCategoricalPercentages = (dataset: Assessment[], field: keyof Pick<Assessment, 'stress' | 'exhaustion' | 'anxiety' | 'depression'>) => {
    const counts = { Gering: 0, Mittel: 0, Stark: 0 }
    let total = 0

    dataset.forEach(item => {
      const value = item[field] as keyof typeof counts
      if (value && value in counts) {
        counts[value]++
        total++
      }
    })

    return {
      percentages: {
        Gering: total > 0 ? (counts.Gering / total) * 100 : 0,
        Mittel: total > 0 ? (counts.Mittel / total) * 100 : 0,
        Stark: total > 0 ? (counts.Stark / total) * 100 : 0,
      },
      counts,
      total,
    }
  }

  const calculateSelfCarePercentages = (dataset: Assessment[], field: keyof Pick<Assessment, 'adequateSleep' | 'healthyEating' | 'sufficientRest' | 'exercise' | 'setBoundaries' | 'timeForBeauty' | 'shareEmotions' | 'liveValues'>) => {
    const counts = { Selten: 0, Mittel: 0, Oft: 0 }
    let total = 0

    dataset.forEach(item => {
      const value = item[field] as keyof typeof counts
      if (value && value in counts) {
        counts[value]++
        total++
      }
    })

    return {
      percentages: {
        Selten: total > 0 ? (counts.Selten / total) * 100 : 0,
        Mittel: total > 0 ? (counts.Mittel / total) * 100 : 0,
        Oft: total > 0 ? (counts.Oft / total) * 100 : 0,
      },
      counts,
      total,
    }
  }

  // Wellbeing and Life Areas Chart - Calculate with counts
  const wellbeingT0 = calculateAverageWithCount(t0Data, 'wellbeing')
  const workT0 = calculateAverageWithCount(t0Data, 'workArea')
  const privateT0 = calculateAverageWithCount(t0Data, 'privateArea')

  const wellbeingT4 = calculateAverageWithCount(t4Data, 'wellbeing')
  const workT4 = calculateAverageWithCount(t4Data, 'workArea')
  const privateT4 = calculateAverageWithCount(t4Data, 'privateArea')

  const wellbeingChartData = {
    labels: ['Wohlbefinden', 'Arbeit', 'Privat'],
    datasets: [
      {
        label: 'T0 (Baseline)',
        data: [
          wellbeingT0.average,
          workT0.average,
          privateT0.average,
        ],
        counts: [
          wellbeingT0.count,
          workT0.count,
          privateT0.count,
        ],
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1,
      },
      {
        label: 'T4 (nach 4 Wochen)',
        data: [
          wellbeingT4.average,
          workT4.average,
          privateT4.average,
        ],
        counts: [
          wellbeingT4.count,
          workT4.count,
          privateT4.count,
        ],
        backgroundColor: 'rgba(16, 185, 129, 0.5)',
        borderColor: 'rgb(16, 185, 129)',
        borderWidth: 1,
      },
    ],
  }

  // Psychological Burdens Chart - Calculate percentages for all metrics
  const stressT0 = calculateCategoricalPercentages(t0Data, 'stress')
  const exhaustionT0 = calculateCategoricalPercentages(t0Data, 'exhaustion')
  const anxietyT0 = calculateCategoricalPercentages(t0Data, 'anxiety')
  const depressionT0 = calculateCategoricalPercentages(t0Data, 'depression')

  const stressT4 = calculateCategoricalPercentages(t4Data, 'stress')
  const exhaustionT4 = calculateCategoricalPercentages(t4Data, 'exhaustion')
  const anxietyT4 = calculateCategoricalPercentages(t4Data, 'anxiety')
  const depressionT4 = calculateCategoricalPercentages(t4Data, 'depression')

  const burdensChartData = {
    labels: ['Stress', 'Erschöpfung', 'Angst', 'Depression'],
    datasets: [
      {
        label: 'Gering (T0)',
        data: [
          stressT0.percentages.Gering,
          exhaustionT0.percentages.Gering,
          anxietyT0.percentages.Gering,
          depressionT0.percentages.Gering,
        ],
        counts: [
          stressT0.counts.Gering,
          exhaustionT0.counts.Gering,
          anxietyT0.counts.Gering,
          depressionT0.counts.Gering,
        ],
        backgroundColor: 'rgba(34, 197, 94, 0.5)',
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 1,
      },
      {
        label: 'Mittel (T0)',
        data: [
          stressT0.percentages.Mittel,
          exhaustionT0.percentages.Mittel,
          anxietyT0.percentages.Mittel,
          depressionT0.percentages.Mittel,
        ],
        counts: [
          stressT0.counts.Mittel,
          exhaustionT0.counts.Mittel,
          anxietyT0.counts.Mittel,
          depressionT0.counts.Mittel,
        ],
        backgroundColor: 'rgba(245, 158, 11, 0.5)',
        borderColor: 'rgb(245, 158, 11)',
        borderWidth: 1,
      },
      {
        label: 'Stark (T0)',
        data: [
          stressT0.percentages.Stark,
          exhaustionT0.percentages.Stark,
          anxietyT0.percentages.Stark,
          depressionT0.percentages.Stark,
        ],
        counts: [
          stressT0.counts.Stark,
          exhaustionT0.counts.Stark,
          anxietyT0.counts.Stark,
          depressionT0.counts.Stark,
        ],
        backgroundColor: 'rgba(239, 68, 68, 0.5)',
        borderColor: 'rgb(239, 68, 68)',
        borderWidth: 1,
      },
      {
        label: 'Gering (T4)',
        data: [
          stressT4.percentages.Gering,
          exhaustionT4.percentages.Gering,
          anxietyT4.percentages.Gering,
          depressionT4.percentages.Gering,
        ],
        counts: [
          stressT4.counts.Gering,
          exhaustionT4.counts.Gering,
          anxietyT4.counts.Gering,
          depressionT4.counts.Gering,
        ],
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 1,
      },
      {
        label: 'Mittel (T4)',
        data: [
          stressT4.percentages.Mittel,
          exhaustionT4.percentages.Mittel,
          anxietyT4.percentages.Mittel,
          depressionT4.percentages.Mittel,
        ],
        counts: [
          stressT4.counts.Mittel,
          exhaustionT4.counts.Mittel,
          anxietyT4.counts.Mittel,
          depressionT4.counts.Mittel,
        ],
        backgroundColor: 'rgba(245, 158, 11, 0.8)',
        borderColor: 'rgb(245, 158, 11)',
        borderWidth: 1,
      },
      {
        label: 'Stark (T4)',
        data: [
          stressT4.percentages.Stark,
          exhaustionT4.percentages.Stark,
          anxietyT4.percentages.Stark,
          depressionT4.percentages.Stark,
        ],
        counts: [
          stressT4.counts.Stark,
          exhaustionT4.counts.Stark,
          anxietyT4.counts.Stark,
          depressionT4.counts.Stark,
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

  const burdensOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Psychische Belastungen (in %)',
      },
      tooltip: {
        callbacks: {
          label: function(context: TooltipItem<'bar'>) {
            const label = context.dataset.label || ''
            const percentage = context.parsed.y
            const count = (context.dataset as DatasetWithCounts).counts?.[context.dataIndex] || 0
            return `${label}: ${percentage.toFixed(1)}% (n=${count})`
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

  // Coaching Satisfaction Chart (T4 only) - Calculate with counts
  const learningT4 = calculateAverageWithCount(t4Data, 'learningExperience')
  const progressT4 = calculateAverageWithCount(t4Data, 'progressAchievement')
  const satisfactionT4 = calculateAverageWithCount(t4Data, 'generalSatisfaction')

  const coachingSatisfactionData = {
    labels: ['Lernerfahrung', 'Zielerreichung', 'Gesamtzufriedenheit'],
    datasets: [
      {
        label: 'T4 Bewertung',
        data: [
          learningT4.average,
          progressT4.average,
          satisfactionT4.average,
        ],
        counts: [
          learningT4.count,
          progressT4.count,
          satisfactionT4.count,
        ],
        backgroundColor: 'rgba(168, 85, 247, 0.5)',
        borderColor: 'rgb(168, 85, 247)',
        borderWidth: 1,
      },
    ],
  }

  // Self-care Chart - Calculate percentages for all metrics
  const sleepT0 = calculateSelfCarePercentages(t0Data, 'adequateSleep')
  const eatingT0 = calculateSelfCarePercentages(t0Data, 'healthyEating')
  const restT0 = calculateSelfCarePercentages(t0Data, 'sufficientRest')
  const exerciseT0 = calculateSelfCarePercentages(t0Data, 'exercise')

  const sleepT4 = calculateSelfCarePercentages(t4Data, 'adequateSleep')
  const eatingT4 = calculateSelfCarePercentages(t4Data, 'healthyEating')
  const restT4 = calculateSelfCarePercentages(t4Data, 'sufficientRest')
  const exerciseT4 = calculateSelfCarePercentages(t4Data, 'exercise')

  const selfCareData = {
    labels: ['Ausreichend Schlaf', 'Gesunde Ernährung', 'Ausreichend Ruhe', 'Sport'],
    datasets: [
      {
        label: 'Selten (T0)',
        data: [
          sleepT0.percentages.Selten,
          eatingT0.percentages.Selten,
          restT0.percentages.Selten,
          exerciseT0.percentages.Selten,
        ],
        counts: [
          sleepT0.counts.Selten,
          eatingT0.counts.Selten,
          restT0.counts.Selten,
          exerciseT0.counts.Selten,
        ],
        backgroundColor: 'rgba(239, 68, 68, 0.5)',
        borderColor: 'rgb(239, 68, 68)',
        borderWidth: 1,
      },
      {
        label: 'Mittel (T0)',
        data: [
          sleepT0.percentages.Mittel,
          eatingT0.percentages.Mittel,
          restT0.percentages.Mittel,
          exerciseT0.percentages.Mittel,
        ],
        counts: [
          sleepT0.counts.Mittel,
          eatingT0.counts.Mittel,
          restT0.counts.Mittel,
          exerciseT0.counts.Mittel,
        ],
        backgroundColor: 'rgba(245, 158, 11, 0.5)',
        borderColor: 'rgb(245, 158, 11)',
        borderWidth: 1,
      },
      {
        label: 'Oft (T0)',
        data: [
          sleepT0.percentages.Oft,
          eatingT0.percentages.Oft,
          restT0.percentages.Oft,
          exerciseT0.percentages.Oft,
        ],
        counts: [
          sleepT0.counts.Oft,
          eatingT0.counts.Oft,
          restT0.counts.Oft,
          exerciseT0.counts.Oft,
        ],
        backgroundColor: 'rgba(34, 197, 94, 0.5)',
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 1,
      },
      {
        label: 'Selten (T4)',
        data: [
          sleepT4.percentages.Selten,
          eatingT4.percentages.Selten,
          restT4.percentages.Selten,
          exerciseT4.percentages.Selten,
        ],
        counts: [
          sleepT4.counts.Selten,
          eatingT4.counts.Selten,
          restT4.counts.Selten,
          exerciseT4.counts.Selten,
        ],
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        borderColor: 'rgb(239, 68, 68)',
        borderWidth: 1,
      },
      {
        label: 'Mittel (T4)',
        data: [
          sleepT4.percentages.Mittel,
          eatingT4.percentages.Mittel,
          restT4.percentages.Mittel,
          exerciseT4.percentages.Mittel,
        ],
        counts: [
          sleepT4.counts.Mittel,
          eatingT4.counts.Mittel,
          restT4.counts.Mittel,
          exerciseT4.counts.Mittel,
        ],
        backgroundColor: 'rgba(245, 158, 11, 0.8)',
        borderColor: 'rgb(245, 158, 11)',
        borderWidth: 1,
      },
      {
        label: 'Oft (T4)',
        data: [
          sleepT4.percentages.Oft,
          eatingT4.percentages.Oft,
          restT4.percentages.Oft,
          exerciseT4.percentages.Oft,
        ],
        counts: [
          sleepT4.counts.Oft,
          eatingT4.counts.Oft,
          restT4.counts.Oft,
          exerciseT4.counts.Oft,
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
                  text: 'Selbstfürsorge (in %)',
                },
                tooltip: {
                  callbacks: {
                    label: function(context: TooltipItem<'bar'>) {
                      const label = context.dataset.label || ''
                      const percentage = context.parsed.y
                      const count = (context.dataset as DatasetWithCounts).counts?.[context.dataIndex] || 0
                      return `${label}: ${percentage.toFixed(1)}% (n=${count})`
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
    </div>
  )
}