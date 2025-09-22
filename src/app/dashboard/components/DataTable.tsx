"use client"

import React, { useState } from 'react'

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

interface DataTableProps {
  data: ClientData[]
}

export function DataTable({ data }: DataTableProps) {
  const [sortField, setSortField] = useState<string>('registrationDate')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [filterTimepoint, setFilterTimepoint] = useState<string>('')
  const [showView, setShowView] = useState<'overview' | 'assessments'>('overview')

  const handleSort = (field: string) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  // Flatten assessments for assessment view
  const assessmentData = data.flatMap(client =>
    client.assessments.map(assessment => ({
      ...assessment,
      clientName: client.clientName,
      coachName: client.coachName,
      status: client.status
    }))
  )

  const filteredAssessments = assessmentData.filter(item =>
    filterTimepoint === '' || item.timepoint === filterTimepoint
  )

  const sortedData = showView === 'overview'
    ? [...data].sort((a, b) => {
        const aValue = a[sortField as keyof ClientData]
        const bValue = b[sortField as keyof ClientData]

        // Handle null/undefined values
        if (aValue == null && bValue == null) return 0
        if (aValue == null) return sortDirection === 'asc' ? -1 : 1
        if (bValue == null) return sortDirection === 'asc' ? 1 : -1

        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
        return 0
      })
    : [...filteredAssessments].sort((a, b) => {
        const aValue = a[sortField as keyof (Assessment & { clientName: string; coachName: string; status: string })]
        const bValue = b[sortField as keyof (Assessment & { clientName: string; coachName: string; status: string })]

        // Handle null/undefined values
        if (aValue == null && bValue == null) return 0
        if (aValue == null) return sortDirection === 'asc' ? -1 : 1
        if (bValue == null) return sortDirection === 'asc' ? 1 : -1

        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
        return 0
      })

  const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
  }

  const getCategoryColor = (value: string | null) => {
    if (!value) return 'bg-gray-100 text-gray-800'
    switch (value.toLowerCase()) {
      case 'gering':
      case 'selten':
        return 'bg-green-100 text-green-800'
      case 'mittel':
        return 'bg-yellow-100 text-yellow-800'
      case 'stark':
      case 'oft':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getSortIcon = (field: string) => {
    if (field !== sortField) return '↕️'
    return sortDirection === 'asc' ? '↑' : '↓'
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">Datentabelle</h3>
          <div className="flex items-center space-x-4">
            <div className="flex border border-gray-300 rounded-md">
              <button
                onClick={() => setShowView('overview')}
                className={`px-3 py-1 text-sm ${
                  showView === 'overview'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Übersicht
              </button>
              <button
                onClick={() => setShowView('assessments')}
                className={`px-3 py-1 text-sm ${
                  showView === 'assessments'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Bewertungen
              </button>
            </div>
            {showView === 'assessments' && (
              <select
                value={filterTimepoint}
                onChange={(e) => setFilterTimepoint(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm"
              >
                <option value="">Alle Zeitpunkte</option>
                <option value="T0">T0 (Baseline)</option>
                <option value="T4">T4 (nach 4 Wochen)</option>
              </select>
            )}
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        {showView === 'overview' ? (
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
                  onClick={() => handleSort('coachName')}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  Coach {getSortIcon('coachName')}
                </th>
                <th
                  onClick={() => handleSort('status')}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  Status {getSortIcon('status')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Wohlbefinden T0
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Wohlbefinden T4
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bewertungen
                </th>
                <th
                  onClick={() => handleSort('weeks')}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  Wochen {getSortIcon('weeks')}
                </th>
                <th
                  onClick={() => handleSort('registrationDate')}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  Registrierung {getSortIcon('registrationDate')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {(sortedData as ClientData[]).map((client) => (
                <tr key={client.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {client.clientName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {client.coachName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      client.status === 'Aktiv'
                        ? 'bg-green-100 text-green-800'
                        : client.status === 'Beendet'
                        ? 'bg-gray-100 text-gray-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {client.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {client.wellbeingT0Basic ? `${client.wellbeingT0Basic}/10` : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {client.wellbeingT4Basic ? `${client.wellbeingT4Basic}/10` : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {client.assessments.length > 0 ? (
                      <div className="flex space-x-1">
                        {client.assessments.map(assessment => (
                          <span key={assessment.id} className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            assessment.timepoint === 'T0'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {assessment.timepoint}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-400">Keine</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {client.weeks}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(client.registrationDate)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Erschöpfung
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Angst
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Depression
                </th>
                <th
                  onClick={() => handleSort('workArea')}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  Arbeit {getSortIcon('workArea')}
                </th>
                <th
                  onClick={() => handleSort('privateArea')}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  Privat {getSortIcon('privateArea')}
                </th>
                <th
                  onClick={() => handleSort('submittedAt')}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  Eingereicht {getSortIcon('submittedAt')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {(sortedData as (Assessment & { clientName: string; coachName: string; status: string })[]).map((assessment) => (
                <tr key={assessment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {assessment.clientName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      assessment.timepoint === 'T0'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {assessment.timepoint}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {assessment.wellbeing ? `${assessment.wellbeing}/10` : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {assessment.stress ? (
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(assessment.stress)}`}>
                        {assessment.stress}
                      </span>
                    ) : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {assessment.exhaustion ? (
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(assessment.exhaustion)}`}>
                        {assessment.exhaustion}
                      </span>
                    ) : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {assessment.anxiety ? (
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(assessment.anxiety)}`}>
                        {assessment.anxiety}
                      </span>
                    ) : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {assessment.depression ? (
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(assessment.depression)}`}>
                        {assessment.depression}
                      </span>
                    ) : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {assessment.workArea ? `${assessment.workArea}/10` : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {assessment.privateArea ? `${assessment.privateArea}/10` : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(assessment.submittedAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {sortedData.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          Keine Daten für die ausgewählten Filter gefunden
        </div>
      )}
    </div>
  )
}