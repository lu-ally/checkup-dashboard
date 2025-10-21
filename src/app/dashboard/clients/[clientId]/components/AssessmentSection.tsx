interface AssessmentSectionProps {
  title: string
  description?: string
  children: React.ReactNode
}

export function AssessmentSection({
  title,
  description,
  children
}: AssessmentSectionProps) {
  return (
    <div className="bg-white shadow rounded-lg p-6 mb-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
        {description && (
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        )}
      </div>
      <div>
        {children}
      </div>
    </div>
  )
}
