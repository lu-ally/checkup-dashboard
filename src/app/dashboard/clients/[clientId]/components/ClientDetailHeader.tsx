"use client"

import Link from 'next/link'
import { formatAssessmentDate } from '@/lib/assessmentUtils'

interface ClientDetailHeaderProps {
  clientId: string
  clientName: string
  coachName: string
  status: string
  registrationDate: string
  weeks: number
  chatLink: string
}

export function ClientDetailHeader({
  clientId,
  clientName,
  coachName,
  status,
  registrationDate,
  weeks,
  chatLink
}: ClientDetailHeaderProps) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'aktiv':
        return 'bg-green-100 text-green-800'
      case 'beendet':
        return 'bg-gray-100 text-gray-800'
      case 'gelöscht':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-yellow-100 text-yellow-800'
    }
  }

  return (
    <div className="bg-white shadow rounded-lg p-6 mb-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <Link
            href="/dashboard"
            className="text-sm text-blue-600 hover:text-blue-800 mb-2 inline-flex items-center"
          >
            ← Zurück zur Übersicht
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mt-2">{clientName}</h1>
          <p className="text-sm text-gray-500 mt-1">Klienten-ID: {clientId}</p>
        </div>
        {chatLink && (
          <a
            href={chatLink}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
          >
            Chat öffnen
          </a>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <div>
          <p className="text-sm text-gray-500">Coach</p>
          <p className="text-lg font-semibold text-gray-900">{coachName}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Status</p>
          <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(status)}`}>
            {status}
          </span>
        </div>
        <div>
          <p className="text-sm text-gray-500">Registrierung</p>
          <p className="text-lg font-semibold text-gray-900">
            {formatAssessmentDate(registrationDate)}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Wochen</p>
          <p className="text-lg font-semibold text-gray-900">{weeks}</p>
        </div>
      </div>
    </div>
  )
}
