"use client"

import { useSession } from "next-auth/react"
import { useCallback, useEffect, useState } from "react"
import { ClientDataChart } from "./components/ClientDataChart"
import { DataTable } from "./components/DataTable"
import { SyncButton } from "./components/SyncButton"

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

export default function DashboardPage() {
  const { data: session } = useSession()
  const [clientData, setClientData] = useState<ClientData[]>([])
  const [loading, setLoading] = useState(true)
  const [coachFilter, setCoachFilter] = useState("")
  const [showDeleted, setShowDeleted] = useState(false)
  const [coaches, setCoaches] = useState<{ id: string; name: string }[]>([])

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const url = new URL("/api/client-data", window.location.origin)
      if (coachFilter) {
        url.searchParams.set("coach", coachFilter)
      }

      const response = await fetch(url.toString())
      if (response.ok) {
        const data = await response.json()
        setClientData(data)

        // Extract unique coaches for admin filter
        const uniqueCoaches = Array.from(
          new Set(data.map((item: ClientData) => item.coachName))
        ).map((name) => ({ id: name as string, name: name as string }))
        setCoaches(uniqueCoaches)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }, [coachFilter])

  useEffect(() => {
    fetchData()
  }, [coachFilter, fetchData])

  // Filter data based on showDeleted toggle
  const filteredData = showDeleted
    ? clientData
    : clientData.filter(client => client.status.toLowerCase() !== 'gelöscht')

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Daten werden geladen...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">
          Klient:innen Daten
        </h2>
        <div className="flex items-center space-x-4">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {session?.user && (session.user as any).role === "ADMIN" && (
            <>
              <select
                value={coachFilter}
                onChange={(e) => setCoachFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                <option value="">Alle Coaches</option>
                {coaches.map((coach) => (
                  <option key={coach.name} value={coach.name}>
                    {coach.name}
                  </option>
                ))}
              </select>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showDeleted}
                  onChange={(e) => setShowDeleted(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Gelöscht anzeigen</span>
              </label>
            </>
          )}
          <SyncButton onSync={fetchData} />
        </div>
      </div>

      {filteredData.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Keine Daten verfügbar</p>
        </div>
      ) : (
        <>
          <ClientDataChart data={filteredData} />
          <DataTable data={filteredData} />
        </>
      )}
    </div>
  )
}