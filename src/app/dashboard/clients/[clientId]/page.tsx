"use client"

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { ClientDetailHeader } from './components/ClientDetailHeader'
import { AssessmentSummary } from './components/AssessmentSummary'
import { AssessmentSection } from './components/AssessmentSection'
import { MetricComparison } from './components/MetricComparison'
import { CategoryComparison } from './components/CategoryComparison'

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

interface ClientDetail {
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

export default function ClientDetailPage() {
  const params = useParams()
  const clientId = params.clientId as string

  const [client, setClient] = useState<ClientDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchClientDetails() {
      try {
        setLoading(true)
        const response = await fetch(`/api/clients/${clientId}`)

        if (!response.ok) {
          if (response.status === 404) {
            setError('Klient nicht gefunden')
          } else if (response.status === 403) {
            setError('Zugriff verweigert')
          } else {
            setError('Fehler beim Laden der Daten')
          }
          return
        }

        const data = await response.json()
        setClient(data)
      } catch (err) {
        console.error('Error fetching client details:', err)
        setError('Fehler beim Laden der Daten')
      } finally {
        setLoading(false)
      }
    }

    if (clientId) {
      fetchClientDetails()
    }
  }, [clientId])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Daten werden geladen...</div>
      </div>
    )
  }

  if (error || !client) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-lg text-red-600 mb-4">{error || 'Klient nicht gefunden'}</p>
          <a href="/dashboard" className="text-blue-600 hover:text-blue-800">
            ← Zurück zur Übersicht
          </a>
        </div>
      </div>
    )
  }

  // Find T0 and T4 assessments
  const t0Assessment = client.assessments.find(a => a.timepoint === 'T0') || null
  const t4Assessment = client.assessments.find(a => a.timepoint === 'T4') || null

  return (
    <div className="space-y-6">
      <ClientDetailHeader
        clientId={client.clientId}
        clientName={client.clientName}
        coachName={client.coachName}
        status={client.status}
        registrationDate={client.registrationDate}
        weeks={client.weeks}
        chatLink={client.chatLink}
      />

      {/* Assessment Summary with T0/T4 Comparison */}
      <AssessmentSummary
        t0Assessment={t0Assessment as Record<string, unknown> | null}
        t4Assessment={t4Assessment as Record<string, unknown> | null}
      />

      {/* No assessment data available */}
      {!t0Assessment && !t4Assessment && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <p className="text-yellow-800">
            Für diesen Klienten sind noch keine Assessment-Daten verfügbar.
          </p>
        </div>
      )}

      {/* Wohlbefinden */}
      {(t0Assessment || t4Assessment) && (
        <AssessmentSection
          title="Wohlbefinden"
          description="Allgemeines Wohlbefinden auf einer Skala von 0-10"
        >
          <MetricComparison
            label="Wohlbefinden"
            t0Value={t0Assessment?.wellbeing || null}
            t4Value={t4Assessment?.wellbeing || null}
            isPositiveMetric={true}
            maxValue={10}
          />
        </AssessmentSection>
      )}

      {/* Psychologische Belastungen */}
      {(t0Assessment || t4Assessment) && (
        <AssessmentSection
          title="Psychologische Belastungen"
          description="Belastungsfaktoren: Gering, Mittel oder Stark (Verbesserung = Abnahme der Belastung)"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <CategoryComparison
              label="Stress"
              t0Value={t0Assessment?.stress || null}
              t4Value={t4Assessment?.stress || null}
              isPositiveMetric={false}
            />
            <CategoryComparison
              label="Erschöpfung"
              t0Value={t0Assessment?.exhaustion || null}
              t4Value={t4Assessment?.exhaustion || null}
              isPositiveMetric={false}
            />
            <CategoryComparison
              label="Angst"
              t0Value={t0Assessment?.anxiety || null}
              t4Value={t4Assessment?.anxiety || null}
              isPositiveMetric={false}
            />
            <CategoryComparison
              label="Depression"
              t0Value={t0Assessment?.depression || null}
              t4Value={t4Assessment?.depression || null}
              isPositiveMetric={false}
            />
            <CategoryComparison
              label="Selbstzweifel"
              t0Value={t0Assessment?.selfDoubt || null}
              t4Value={t4Assessment?.selfDoubt || null}
              isPositiveMetric={false}
            />
            <CategoryComparison
              label="Schlafprobleme"
              t0Value={t0Assessment?.sleepProblems || null}
              t4Value={t4Assessment?.sleepProblems || null}
              isPositiveMetric={false}
            />
            <CategoryComparison
              label="Anspannung"
              t0Value={t0Assessment?.tension || null}
              t4Value={t4Assessment?.tension || null}
              isPositiveMetric={false}
            />
            <CategoryComparison
              label="Reizbarkeit"
              t0Value={t0Assessment?.irritability || null}
              t4Value={t4Assessment?.irritability || null}
              isPositiveMetric={false}
            />
            <CategoryComparison
              label="Sozialer Rückzug"
              t0Value={t0Assessment?.socialWithdrawal || null}
              t4Value={t4Assessment?.socialWithdrawal || null}
              isPositiveMetric={false}
            />
            <CategoryComparison
              label="Sonstiges"
              t0Value={t0Assessment?.other || null}
              t4Value={t4Assessment?.other || null}
              isPositiveMetric={false}
            />
          </div>
        </AssessmentSection>
      )}

      {/* Lebensbereiche */}
      {(t0Assessment || t4Assessment) && (
        <AssessmentSection
          title="Lebensbereiche"
          description="Zufriedenheit in verschiedenen Lebensbereichen (0-10)"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <MetricComparison
              label="Arbeitsbereich"
              t0Value={t0Assessment?.workArea || null}
              t4Value={t4Assessment?.workArea || null}
              isPositiveMetric={true}
              maxValue={10}
            />
            <MetricComparison
              label="Privatbereich"
              t0Value={t0Assessment?.privateArea || null}
              t4Value={t4Assessment?.privateArea || null}
              isPositiveMetric={true}
              maxValue={10}
            />
          </div>
        </AssessmentSection>
      )}

      {/* Selbstfürsorge */}
      {(t0Assessment || t4Assessment) && (
        <AssessmentSection
          title="Selbstfürsorge"
          description="Häufigkeit von Selbstfürsorge-Aktivitäten: Selten, Mittel oder Oft"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <CategoryComparison
              label="Ausreichend Schlaf"
              t0Value={t0Assessment?.adequateSleep || null}
              t4Value={t4Assessment?.adequateSleep || null}
              isPositiveMetric={true}
            />
            <CategoryComparison
              label="Gesunde Ernährung"
              t0Value={t0Assessment?.healthyEating || null}
              t4Value={t4Assessment?.healthyEating || null}
              isPositiveMetric={true}
            />
            <CategoryComparison
              label="Ausreichend Erholung"
              t0Value={t0Assessment?.sufficientRest || null}
              t4Value={t4Assessment?.sufficientRest || null}
              isPositiveMetric={true}
            />
            <CategoryComparison
              label="Bewegung"
              t0Value={t0Assessment?.exercise || null}
              t4Value={t4Assessment?.exercise || null}
              isPositiveMetric={true}
            />
            <CategoryComparison
              label="Grenzen setzen"
              t0Value={t0Assessment?.setBoundaries || null}
              t4Value={t4Assessment?.setBoundaries || null}
              isPositiveMetric={true}
            />
            <CategoryComparison
              label="Zeit für Schönes"
              t0Value={t0Assessment?.timeForBeauty || null}
              t4Value={t4Assessment?.timeForBeauty || null}
              isPositiveMetric={true}
            />
            <CategoryComparison
              label="Emotionen teilen"
              t0Value={t0Assessment?.shareEmotions || null}
              t4Value={t4Assessment?.shareEmotions || null}
              isPositiveMetric={true}
            />
            <CategoryComparison
              label="Nach Werten leben"
              t0Value={t0Assessment?.liveValues || null}
              t4Value={t4Assessment?.liveValues || null}
              isPositiveMetric={true}
            />
          </div>
        </AssessmentSection>
      )}

      {/* Coaching-Bewertung (nur T4) */}
      {t4Assessment && (
        <AssessmentSection
          title="Coaching-Bewertung"
          description="Bewertung des Coachings nach 4 Wochen (nur bei T4)"
        >
          <div className="space-y-4">
            {/* Kategoriale Bewertungen */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {t4Assessment.trust && (
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm font-medium text-gray-900 mb-2">Vertrauen</p>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    t4Assessment.trust === 'Stark' ? 'bg-green-100 text-green-800' :
                    t4Assessment.trust === 'Mittel' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {t4Assessment.trust}
                  </span>
                </div>
              )}
              {t4Assessment.genuineInterest && (
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm font-medium text-gray-900 mb-2">Echtes Interesse</p>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    t4Assessment.genuineInterest === 'Stark' ? 'bg-green-100 text-green-800' :
                    t4Assessment.genuineInterest === 'Mittel' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {t4Assessment.genuineInterest}
                  </span>
                </div>
              )}
              {t4Assessment.mutualUnderstanding && (
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm font-medium text-gray-900 mb-2">Gegenseitiges Verständnis</p>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    t4Assessment.mutualUnderstanding === 'Stark' ? 'bg-green-100 text-green-800' :
                    t4Assessment.mutualUnderstanding === 'Mittel' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {t4Assessment.mutualUnderstanding}
                  </span>
                </div>
              )}
              {t4Assessment.goalAlignment && (
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm font-medium text-gray-900 mb-2">Zielabstimmung</p>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    t4Assessment.goalAlignment === 'Stark' ? 'bg-green-100 text-green-800' :
                    t4Assessment.goalAlignment === 'Mittel' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {t4Assessment.goalAlignment}
                  </span>
                </div>
              )}
            </div>

            {/* Numerische Bewertungen */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              {t4Assessment.learningExperience !== null && t4Assessment.learningExperience !== undefined && (
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm font-medium text-gray-900 mb-2">Lernerfahrung</p>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-green-700">{t4Assessment.learningExperience}</span>
                    <span className="text-sm text-gray-600">/10</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${(t4Assessment.learningExperience / 10) * 100}%` }}
                    />
                  </div>
                </div>
              )}
              {t4Assessment.progressAchievement !== null && t4Assessment.progressAchievement !== undefined && (
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm font-medium text-gray-900 mb-2">Fortschritt</p>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-green-700">{t4Assessment.progressAchievement}</span>
                    <span className="text-sm text-gray-600">/10</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${(t4Assessment.progressAchievement / 10) * 100}%` }}
                    />
                  </div>
                </div>
              )}
              {t4Assessment.generalSatisfaction !== null && t4Assessment.generalSatisfaction !== undefined && (
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm font-medium text-gray-900 mb-2">Allgemeine Zufriedenheit</p>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-green-700">{t4Assessment.generalSatisfaction}</span>
                    <span className="text-sm text-gray-600">/10</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${(t4Assessment.generalSatisfaction / 10) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </AssessmentSection>
      )}
    </div>
  )
}
