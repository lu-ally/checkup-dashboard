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
import { Bar, Line } from 'react-chartjs-2'

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

interface ClientData {
  id: string
  clientId: string
  clientName: string
  timepoint: string
  wellbeing: number
  stress: number
  mood: number
  anxiety: number
  sleepQuality: string
  motivation: string
  socialSupport: string
  timestamp: string
}

interface ClientDataChartProps {
  data: ClientData[]
}

export function ClientDataChart({ data }: ClientDataChartProps) {
  // Calculate averages for T0 and T4
  const t0Data = data.filter(d => d.timepoint === 'T0')
  const t4Data = data.filter(d => d.timepoint === 'T4')

  const calculateAverage = (dataset: ClientData[], field: keyof Pick<ClientData, 'wellbeing' | 'stress' | 'mood' | 'anxiety'>) => {
    if (dataset.length === 0) return 0
    return dataset.reduce((sum, item) => sum + item[field], 0) / dataset.length
  }

  const chartData = {
    labels: ['Wohlbefinden', 'Stress', 'Stimmung', 'Angst'],
    datasets: [
      {
        label: 'T0 (Baseline)',
        data: [
          calculateAverage(t0Data, 'wellbeing'),
          calculateAverage(t0Data, 'stress'),
          calculateAverage(t0Data, 'mood'),
          calculateAverage(t0Data, 'anxiety'),
        ],
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1,
      },
      {
        label: 'T4 (nach 4 Wochen)',
        data: [
          calculateAverage(t4Data, 'wellbeing'),
          calculateAverage(t4Data, 'stress'),
          calculateAverage(t4Data, 'mood'),
          calculateAverage(t4Data, 'anxiety'),
        ],
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

  // Categorical data chart
  const categoricalData = ['sleepQuality', 'motivation', 'socialSupport'] as const
  const categoricalLabels = ['Schlafqualität', 'Motivation', 'Soziale Unterstützung']

  const getCategoricalCounts = (dataset: ClientData[], field: typeof categoricalData[number]) => {
    const counts = { Niedrig: 0, Mittel: 0, Hoch: 0 }
    dataset.forEach(item => {
      const value = item[field] as keyof typeof counts
      if (value in counts) {
        counts[value]++
      }
    })
    return counts
  }

  const categoricalChartData = {
    labels: categoricalLabels,
    datasets: [
      {
        label: 'Niedrig (T0)',
        data: categoricalData.map(field => getCategoricalCounts(t0Data, field).Niedrig),
        backgroundColor: 'rgba(239, 68, 68, 0.5)',
        borderColor: 'rgb(239, 68, 68)',
        borderWidth: 1,
      },
      {
        label: 'Mittel (T0)',
        data: categoricalData.map(field => getCategoricalCounts(t0Data, field).Mittel),
        backgroundColor: 'rgba(245, 158, 11, 0.5)',
        borderColor: 'rgb(245, 158, 11)',
        borderWidth: 1,
      },
      {
        label: 'Hoch (T0)',
        data: categoricalData.map(field => getCategoricalCounts(t0Data, field).Hoch),
        backgroundColor: 'rgba(34, 197, 94, 0.5)',
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 1,
      },
      {
        label: 'Niedrig (T4)',
        data: categoricalData.map(field => getCategoricalCounts(t4Data, field).Niedrig),
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        borderColor: 'rgb(239, 68, 68)',
        borderWidth: 1,
      },
      {
        label: 'Mittel (T4)',
        data: categoricalData.map(field => getCategoricalCounts(t4Data, field).Mittel),
        backgroundColor: 'rgba(245, 158, 11, 0.8)',
        borderColor: 'rgb(245, 158, 11)',
        borderWidth: 1,
      },
      {
        label: 'Hoch (T4)',
        data: categoricalData.map(field => getCategoricalCounts(t4Data, field).Hoch),
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 1,
      },
    ],
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <Bar data={chartData} options={options} />
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <Bar
          data={categoricalChartData}
          options={{
            responsive: true,
            plugins: {
              legend: {
                position: 'top' as const,
              },
              title: {
                display: true,
                text: 'Kategorische Bewertungen (Anzahl)',
              },
            },
          }}
        />
      </div>
    </div>
  )
}