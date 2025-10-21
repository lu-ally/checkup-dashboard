import {
  getCategoryValue,
  getCategoryBadgeColor,
  calculateChange,
  getComparisonBgColor
} from '@/lib/assessmentUtils'
import { ComparisonIndicator } from './ComparisonIndicator'

interface CategoryComparisonProps {
  label: string
  t0Value: string | null
  t4Value: string | null
  isPositiveMetric?: boolean
}

export function CategoryComparison({
  label,
  t0Value,
  t4Value,
  isPositiveMetric = false
}: CategoryComparisonProps) {
  const t0Numeric = getCategoryValue(t0Value)
  const t4Numeric = getCategoryValue(t4Value)
  const change = calculateChange(t0Numeric, t4Numeric)
  const bgColorClass = getComparisonBgColor(change, isPositiveMetric)

  return (
    <div className={`p-3 rounded-lg border ${bgColorClass}`}>
      <h4 className="text-sm font-medium text-gray-900 mb-3">{label}</h4>

      <div className="grid grid-cols-2 gap-3">
        {/* T0 */}
        <div className="text-center">
          <p className="text-xs text-gray-600 mb-2">T0</p>
          {t0Value ? (
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryBadgeColor(t0Value)}`}>
              {t0Value}
            </span>
          ) : (
            <span className="text-xs text-gray-400">-</span>
          )}
        </div>

        {/* T4 */}
        <div className="text-center">
          <p className="text-xs text-gray-600 mb-2">T4</p>
          {t4Value ? (
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryBadgeColor(t4Value)}`}>
              {t4Value}
            </span>
          ) : (
            <span className="text-xs text-gray-400">-</span>
          )}
        </div>
      </div>

      {/* Comparison */}
      {t0Value && t4Value && change !== 0 && (
        <div className="mt-2 pt-2 border-t border-gray-200 flex justify-center">
          <ComparisonIndicator change={change} isPositiveMetric={isPositiveMetric} showValue={false} />
        </div>
      )}
    </div>
  )
}
