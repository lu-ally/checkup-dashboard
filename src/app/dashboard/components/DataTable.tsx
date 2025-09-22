"use client"

import React, { useState } from 'react'

interface ClientData {
  id: string
  clientId: string
  clientName: string
  coachId: string
  timepoint: string
  timestamp: string
  wellbeing: number
  stress: number
  mood: number
  anxiety: number
  sleepQuality: string
  motivation: string
  socialSupport: string
  coach: {
    id: string
    name: string
    email: string
  }
}

interface DataTableProps {
  data: ClientData[]
}

export function DataTable({ data }: DataTableProps) {
  const [sortField, setSortField] = useState<keyof ClientData>('timestamp')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [filterTimepoint, setFilterTimepoint] = useState<string>('')

  const handleSort = (field: keyof ClientData) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const filteredData = data.filter(item =>
    filterTimepoint === '' || item.timepoint === filterTimepoint
  )

  const sortedData = [...filteredData].sort((a, b) => {
    const aValue = a[sortField]
    const bValue = b[sortField]

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
    return 0
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getSortIcon = (field: keyof ClientData) => {
    if (field !== sortField) return '↕️'
    return sortDirection === 'asc' ? '↑' : '↓'
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">Datentabelle</h3>
          <select
            value={filterTimepoint}
            onChange={(e) => setFilterTimepoint(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm"
          >
            <option value="">Alle Zeitpunkte</option>
            <option value="T0">T0 (Baseline)</option>
            <option value="T4">T4 (nach 4 Wochen)</option>
          </select>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                onClick={() => handleSort('clientName')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                Klient:in {getSortIcon('clientName')}
              </th>
              <th
                onClick={() => handleSort('timepoint')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                Zeitpunkt {getSortIcon('timepoint')}
              </th>
              <th
                onClick={() => handleSort('wellbeing')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                Wohlbefinden {getSortIcon('wellbeing')}
              </th>
              <th
                onClick={() => handleSort('stress')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                Stress {getSortIcon('stress')}
              </th>
              <th
                onClick={() => handleSort('mood')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                Stimmung {getSortIcon('mood')}
              </th>
              <th
                onClick={() => handleSort('anxiety')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                Angst {getSortIcon('anxiety')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Schlaf
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Motivation
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Soziale Unterstützung
              </th>
              <th
                onClick={() => handleSort('timestamp')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                Datum {getSortIcon('timestamp')}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedData.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {item.clientName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    item.timepoint === 'T0'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {item.timepoint}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {item.wellbeing}/10
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {item.stress}/10
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {item.mood}/10
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {item.anxiety}/10
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    item.sleepQuality === 'Hoch'
                      ? 'bg-green-100 text-green-800'
                      : item.sleepQuality === 'Mittel'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {item.sleepQuality}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    item.motivation === 'Hoch'
                      ? 'bg-green-100 text-green-800'
                      : item.motivation === 'Mittel'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {item.motivation}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    item.socialSupport === 'Hoch'
                      ? 'bg-green-100 text-green-800'
                      : item.socialSupport === 'Mittel'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {item.socialSupport}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(item.timestamp)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {sortedData.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          Keine Daten für die ausgewählten Filter gefunden
        </div>
      )}
    </div>
  )
}