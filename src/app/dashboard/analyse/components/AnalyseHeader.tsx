"use client"

interface AnalyseHeaderProps {
  totalClients: number
  pairedClients: number
  overallImprovement: number
}

export function AnalyseHeader({
  totalClients,
  pairedClients,
  overallImprovement,
}: AnalyseHeaderProps) {
  const completionRate = totalClients > 0 ? (pairedClients / totalClients) * 100 : 0
  const isPositive = overallImprovement > 0

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Paired Clients */}
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-600 font-medium">Vollständige Daten</p>
          <p className="text-3xl font-bold text-blue-900 mt-1">
            {pairedClients} <span className="text-lg font-normal text-blue-600">von {totalClients}</span>
          </p>
          <p className="text-sm text-blue-600 mt-1">
            Klient:innen mit T0 und T4
          </p>
        </div>

        {/* Completion Rate */}
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 font-medium">Abschlussrate</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">
            {completionRate.toFixed(0)}%
          </p>
          <p className="text-sm text-gray-600 mt-1">
            haben T4 abgeschlossen
          </p>
        </div>

        {/* Overall Improvement */}
        <div className={`text-center p-4 rounded-lg ${isPositive ? 'bg-green-50' : overallImprovement < 0 ? 'bg-red-50' : 'bg-gray-50'}`}>
          <p className={`text-sm font-medium ${isPositive ? 'text-green-600' : overallImprovement < 0 ? 'text-red-600' : 'text-gray-600'}`}>
            Durchschnittliche Verbesserung
          </p>
          <p className={`text-3xl font-bold mt-1 ${isPositive ? 'text-green-900' : overallImprovement < 0 ? 'text-red-900' : 'text-gray-900'}`}>
            {isPositive ? '+' : ''}{overallImprovement.toFixed(1)}%
          </p>
          <p className={`text-sm mt-1 ${isPositive ? 'text-green-600' : overallImprovement < 0 ? 'text-red-600' : 'text-gray-600'}`}>
            über alle Metriken
          </p>
        </div>
      </div>
    </div>
  )
}
