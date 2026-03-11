import { TrendingUp, TrendingDown, Wallet } from 'lucide-react'

interface MetricCardProps {
  title: string
  value: string
  change?: string
  changeLabel?: string
  trend?: 'up' | 'down'
  isHighlighted?: boolean
  icon?: React.ReactNode
}

export default function MetricCard({
  title,
  value,
  change,
  changeLabel,
  trend,
  isHighlighted = false,
  icon,
}: MetricCardProps) {
  const bgColor = isHighlighted ? 'bg-primary' : 'bg-white'
  const textColor = isHighlighted ? 'text-white' : 'text-gray-900'
  const changeColor =
    trend === 'up'
      ? 'bg-green-100 text-green-700'
      : trend === 'down'
      ? 'bg-orange-100 text-orange-700'
      : 'bg-gray-100 text-gray-700'

  return (
    <div className={`${bgColor} rounded-lg shadow-md p-6 relative overflow-hidden`}>
      {icon && (
        <div className="absolute top-4 right-4 opacity-20">
          {icon}
        </div>
      )}
      <h3 className={`text-sm font-medium mb-2 ${isHighlighted ? 'text-white' : 'text-gray-600'}`}>
        {title}
      </h3>
      <p className={`text-3xl font-bold mb-2 ${textColor}`}>{value}</p>
      {change && (
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 rounded text-xs font-medium ${changeColor}`}>
            {change}
          </span>
          {changeLabel && (
            <span className={`text-xs ${isHighlighted ? 'text-white/80' : 'text-gray-500'}`}>
              {changeLabel}
            </span>
          )}
        </div>
      )}
      {trend && (
        <div className="absolute top-4 right-4">
          {trend === 'up' ? (
            <TrendingUp className={`w-5 h-5 ${isHighlighted ? 'text-white' : 'text-green-500'}`} />
          ) : (
            <TrendingDown className={`w-5 h-5 ${isHighlighted ? 'text-white' : 'text-orange-500'}`} />
          )}
        </div>
      )}
    </div>
  )
}
