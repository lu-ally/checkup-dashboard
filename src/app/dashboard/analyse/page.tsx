"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import {
  ClientData,
  PairedAssessment,
  filterClientsWithBothAssessments,
  calculateOverallImprovement,
} from "@/lib/analyseCalculations"
import { AnalyseHeader } from "./components/AnalyseHeader"
import { WellbeingComparison } from "./components/WellbeingComparison"
import { BurdensComparison } from "./components/BurdensComparison"
import { SelfCareComparison } from "./components/SelfCareComparison"
import { CoachingRating } from "./components/CoachingRating"

export default function AnalysePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [clientData, setClientData] = useState<ClientData[]>([])
  const [pairedAssessments, setPairedAssessments] = useState<PairedAssessment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Check if user is ADMIN
  useEffect(() => {
    if (status === "loading") return

    if (!session?.user) {
      router.push("/login")
      return
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((session.user as any).role !== "ADMIN") {
      router.push("/dashboard")
      return
    }
  }, [session, status, router])

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/client-data")
        if (!response.ok) {
          throw new Error("Fehler beim Laden der Daten")
        }
        const data: ClientData[] = await response.json()
        setClientData(data)

        // Filter to clients with both T0 and T4
        const paired = filterClientsWithBothAssessments(data)
        setPairedAssessments(paired)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unbekannter Fehler")
      } finally {
        setLoading(false)
      }
    }

    if (session?.user) {
      fetchData()
    }
  }, [session])

  // Loading state
  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Lade Analyse-Daten...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-600">{error}</p>
      </div>
    )
  }

  // Calculate overall improvement
  const overallImprovement = calculateOverallImprovement(pairedAssessments)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">T0/T4 Analyse</h1>

      {/* Header with statistics */}
      <AnalyseHeader
        totalClients={clientData.length}
        pairedClients={pairedAssessments.length}
        overallImprovement={overallImprovement}
      />

      {pairedAssessments.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <p className="text-yellow-800">
            Noch keine Klient:innen mit vollständigen Daten (T0 und T4) vorhanden.
          </p>
        </div>
      ) : (
        <>
          {/* Wellbeing & Life Areas Comparison */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <WellbeingComparison pairedAssessments={pairedAssessments} />
            <BurdensComparison pairedAssessments={pairedAssessments} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SelfCareComparison pairedAssessments={pairedAssessments} />
            <CoachingRating pairedAssessments={pairedAssessments} />
          </div>
        </>
      )}
    </div>
  )
}
