"use client"

import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { ClientDataChart } from "./components/ClientDataChart"
import { DataTable } from "./components/DataTable"
import { SyncButton } from "./components/SyncButton"

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

export default function DashboardPage() {
  const { data: session } = useSession()
  const [clientData, setClientData] = useState<ClientData[]>([])
  const [loading, setLoading] = useState(true)
  const [coachFilter, setCoachFilter] = useState("")
  const [coaches, setCoaches] = useState<{ id: string; name: string }[]>([])

  const fetchData = async () => {
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
          new Map(data.map((item: ClientData) => [item.coach.id, item.coach])).values()
        )
        setCoaches(uniqueCoaches)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [coachFilter])

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
          {session?.user.role === "ADMIN" && (
            <select
              value={coachFilter}
              onChange={(e) => setCoachFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="">Alle Coaches</option>
              {coaches.map((coach) => (
                <option key={coach.id} value={coach.id}>
                  {coach.name}
                </option>
              ))}
            </select>
          )}
          <SyncButton onSync={fetchData} />
        </div>
      </div>

      {clientData.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Keine Daten verfügbar</p>
        </div>
      ) : (
        <>
          <ClientDataChart data={clientData} />
          <DataTable data={clientData} />
        </>
      )}
    </div>
  )
}