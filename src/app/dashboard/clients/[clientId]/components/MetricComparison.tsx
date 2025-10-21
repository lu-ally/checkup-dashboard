import { calculateChange, getComparisonBgColor } from '@/lib/assessmentUtils'
import { ComparisonIndicator } from './ComparisonIndicator'

interface MetricComparisonProps {
  label: string
  t0Value: number | null
  t4Value: number | null
  isPositiveMetric?: boolean
  maxValue?: number
}

export function MetricComparison({
  label,
  t0Value,
  t4Value,
  isPositiveMetric = true,
  maxValue = 10
}: MetricComparisonProps) {
  const change = calculateChange(t0Value, t4Value)
  const bgColorClass = getComparisonBgColor(change, isPositiveMetric)

  const getBarWidth = (value: number | null) => {
    if (value === null) return 0
    return (value / maxValue) * 100
  }

  return (
    <div className={`p-4 rounded-lg border ${bgColorClass}`}>
      <h4 className="text-sm font-semibold text-gray-900 mb-3">{label}</h4>

      <div className="grid grid-cols-2 gap-4">
        {/* T0 */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-600 font-medium">T0 (Baseline)</span>
            <span className="text-sm font-bold text-gray-900">
              {t0Value !== null ? `${t0Value}/${maxValue}` : '-'}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-blue-500 h-3 rounded-full transition-all"
              style={{ width: `${getBarWidth(t0Value)}%` }}
            />
          </div>
        </div>

        {/* T4 */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-600 font-medium">T4 (nach 4 Wochen)</span>
            <span className="text-sm font-bold text-gray-900">
              {t4Value !== null ? `${t4Value}/${maxValue}` : '-'}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-green-500 h-3 rounded-full transition-all"
              style={{ width: `${getBarWidth(t4Value)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Comparison */}
      {t0Value !== null && t4Value !== null && (
        <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between">
          <span className="text-xs text-gray-600">Veränderung:</span>
          <ComparisonIndicator change={change} isPositiveMetric={isPositiveMetric} />
        </div>
      )}
    </div>
  )
}
