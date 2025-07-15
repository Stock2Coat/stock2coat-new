import { InventoryStatus } from '@/lib/types'
import { cn } from '@/lib/utils'

interface StockBarProps {
  current: number
  max: number
  status: InventoryStatus
  unit: string
}

export function StockBar({ current, max, status, unit }: StockBarProps) {
  const percentage = Math.min((current / max) * 100, 100)
  
  const getBarColor = (status: InventoryStatus) => {
    switch (status) {
      case 'OK':
        return 'bg-green-500'
      case 'GEM':
        return 'bg-orange-500'
      case 'LAAG':
        return 'bg-red-500'
      default:
        return 'bg-gray-300'
    }
  }

  const getTextColor = (status: InventoryStatus) => {
    switch (status) {
      case 'OK':
        return 'text-green-700'
      case 'GEM':
        return 'text-orange-700'
      case 'LAAG':
        return 'text-red-700'
      default:
        return 'text-gray-700'
    }
  }

  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <span className={cn('text-sm font-medium', getTextColor(status))}>
          {current} {unit}
        </span>
        <span className="text-sm text-gray-500">
          {max} {unit}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={cn('h-2 rounded-full transition-all', getBarColor(status))}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}