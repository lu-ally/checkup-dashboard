"use client"

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
  learningExperience?: number | null
  progressAchievement?: number | null
  generalSatisfaction?: number | null
}

interface T4SummaryProps {
  assessments: Assessment[]
}

const BURDEN_FIELDS: { field: keyof Assessment; label: string }[] = [
  { field: 'stress', label: 'Stress' },
  { field: 'exhaustion', label: 'Erschöpfung' },
  { field: 'anxiety', label: 'Angst' },
  { field: 'depression', label: 'Depression' },
  { field: 'selfDoubt', label: 'Selbstzweifel' },
  { field: 'sleepProblems', label: 'Schlafprobl.' },
  { field: 'tension', label: 'Anspannung' },
  { field: 'irritability', label: 'Reizbarkeit' },
  { field: 'socialWithdrawal', label: 'Rückzug' },
  { field: 'other', label: 'Anderes' },
]

const SELFCARE_FIELDS: { field: keyof Assessment; label: string }[] = [
  { field: 'adequateSleep', label: 'Schlaf' },
  { field: 'healthyEating', label: 'Ernährung' },
  { field: 'sufficientRest', label: 'Ruhe' },
  { field: 'exercise', label: 'Sport' },
  { field: 'setBoundaries', label: 'Grenzen' },
  { field: 'timeForBeauty', label: 'Schönes' },
  { field: 'shareEmotions', label: 'Gefühle' },
  { field: 'liveValues', label: 'Werte' },
]

function calculateAverage(values: (number | null | undefined)[]): number {
  const valid = values.filter((v): v is number => v !== null && v !== undefined)
  return valid.length > 0 ? valid.reduce((a, b) => a + b, 0) / valid.length : 0
}

function calculateDistribution(values: (string | null)[], categories: string[]): { category: string; count: number; percent: number }[] {
  const counts: Record<string, number> = {}
  categories.forEach(cat => { counts[cat] = 0 })

  let total = 0
  values.forEach(v => {
    if (v && categories.includes(v)) {
      counts[v]++
      total++
    }
  })

  return categories.map(cat => ({
    category: cat,
    count: counts[cat],
    percent: total > 0 ? Math.round((counts[cat] / total) * 100) : 0
  }))
}

function DistributionBar({ distribution, colorMap }: {
  distribution: { category: string; count: number; percent: number }[]
  colorMap: Record<string, string>
}) {
  return (
    <div className="flex h-4 rounded overflow-hidden bg-gray-100">
      {distribution.map(d => (
        d.percent > 0 && (
          <div
            key={d.category}
            className={`${colorMap[d.category]} flex items-center justify-center text-[10px] text-white font-medium`}
            style={{ width: `${d.percent}%` }}
            title={`${d.category}: ${d.count} (${d.percent}%)`}
          >
            {d.percent >= 15 && `${d.percent}%`}
          </div>
        )
      ))}
    </div>
  )
}

export function T4Summary({ assessments }: T4SummaryProps) {
  if (assessments.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow text-center text-gray-500">
        Keine T4-Daten vorhanden
      </div>
    )
  }

  // Calculate wellbeing average
  const wellbeingAvg = calculateAverage(assessments.map(a => a.wellbeing))
  const workAreaAvg = calculateAverage(assessments.map(a => a.workArea))
  const privateAreaAvg = calculateAverage(assessments.map(a => a.privateArea))

  // Calculate coaching ratings average
  const learningAvg = calculateAverage(assessments.map(a => a.learningExperience))
  const progressAvg = calculateAverage(assessments.map(a => a.progressAchievement))
  const satisfactionAvg = calculateAverage(assessments.map(a => a.generalSatisfaction))

  // Burden color map (Gering = good/green, Stark = bad/red)
  const burdenColors: Record<string, string> = {
    'Gering': 'bg-green-500',
    'Mittel': 'bg-yellow-500',
    'Stark': 'bg-red-500'
  }

  // Self-care color map (Oft = good/green, Selten = bad/red)
  const selfCareColors: Record<string, string> = {
    'Selten': 'bg-red-500',
    'Mittel': 'bg-yellow-500',
    'Oft': 'bg-green-500'
  }

  return (
    <div className="space-y-4">
      {/* Wellbeing Section */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Wohlbefinden & Lebensbereiche</h4>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-green-600">{wellbeingAvg.toFixed(1)}</p>
            <p className="text-xs text-gray-500">Wohlbefinden</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-600">{workAreaAvg.toFixed(1)}</p>
            <p className="text-xs text-gray-500">Arbeit</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-600">{privateAreaAvg.toFixed(1)}</p>
            <p className="text-xs text-gray-500">Privat</p>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-2 text-center">Durchschnitt (Skala 1-10)</p>
      </div>

      {/* Coaching Rating Section */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Coaching-Bewertung</h4>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-purple-600">{learningAvg.toFixed(1)}</p>
            <p className="text-xs text-gray-500">Lernerfahrung</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-purple-600">{progressAvg.toFixed(1)}</p>
            <p className="text-xs text-gray-500">Zielerreichung</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-purple-600">{satisfactionAvg.toFixed(1)}</p>
            <p className="text-xs text-gray-500">Zufriedenheit</p>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-2 text-center">Durchschnitt (Skala 1-10)</p>
      </div>

      {/* Burdens Section */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Psychische Belastungen</h4>
        <div className="space-y-2">
          {BURDEN_FIELDS.map(({ field, label }) => {
            const values = assessments.map(a => a[field] as string | null)
            const dist = calculateDistribution(values, ['Gering', 'Mittel', 'Stark'])
            return (
              <div key={field} className="flex items-center gap-2">
                <span className="text-xs text-gray-600 w-20 truncate" title={label}>{label}</span>
                <div className="flex-1">
                  <DistributionBar distribution={dist} colorMap={burdenColors} />
                </div>
              </div>
            )
          })}
        </div>
        <div className="flex justify-center gap-4 mt-3 text-xs">
          <span className="flex items-center gap-1"><span className="w-3 h-3 bg-green-500 rounded"></span> Gering</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 bg-yellow-500 rounded"></span> Mittel</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 bg-red-500 rounded"></span> Stark</span>
        </div>
      </div>

      {/* Self-Care Section */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Selbstfürsorge</h4>
        <div className="space-y-2">
          {SELFCARE_FIELDS.map(({ field, label }) => {
            const values = assessments.map(a => a[field] as string | null)
            const dist = calculateDistribution(values, ['Selten', 'Mittel', 'Oft'])
            return (
              <div key={field} className="flex items-center gap-2">
                <span className="text-xs text-gray-600 w-20 truncate" title={label}>{label}</span>
                <div className="flex-1">
                  <DistributionBar distribution={dist} colorMap={selfCareColors} />
                </div>
              </div>
            )
          })}
        </div>
        <div className="flex justify-center gap-4 mt-3 text-xs">
          <span className="flex items-center gap-1"><span className="w-3 h-3 bg-red-500 rounded"></span> Selten</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 bg-yellow-500 rounded"></span> Mittel</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 bg-green-500 rounded"></span> Oft</span>
        </div>
      </div>
    </div>
  )
}
