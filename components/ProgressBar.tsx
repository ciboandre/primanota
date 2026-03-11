interface ProgressBarProps {
  value: number
  maxValue: number
  color: 'green' | 'orange'
  showPercentage?: boolean
}

export default function ProgressBar({
  value,
  maxValue,
  color,
  showPercentage = true,
}: ProgressBarProps) {
  const percentage = (value / maxValue) * 100
  const bgColor = color === 'green' ? 'bg-green-500' : 'bg-orange-500'

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium text-gray-700">
          € {value.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
        {showPercentage && (
          <span className="text-sm text-gray-500">({Math.round(percentage)}%)</span>
        )}
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`${bgColor} h-2 rounded-full transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  )
}
