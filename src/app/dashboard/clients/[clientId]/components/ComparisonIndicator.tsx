import { getChangeIcon, getComparisonColor } from '@/lib/assessmentUtils'

interface ComparisonIndicatorProps {
  change: number
  isPositiveMetric?: boolean
  showValue?: boolean
}

export function ComparisonIndicator({
  change,
  isPositiveMetric = true,
  showValue = true
}: ComparisonIndicatorProps) {
  const icon = getChangeIcon(change, isPositiveMetric)
  const colorClass = getComparisonColor(change, isPositiveMetric)

  if (change === 0) {
    return (
      <span className="text-gray-600 text-sm">
        {icon} Keine Änderung
      </span>
    )
  }

  return (
    <span className={`${colorClass} font-semibold text-sm flex items-center gap-1`}>
      <span className="text-lg">{icon}</span>
      {showValue && (
        <span>
          {change > 0 ? '+' : ''}{change.toFixed(1)}
        </span>
      )}
    </span>
  )
}
