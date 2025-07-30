'use client'

import { InventoryItem } from "@/lib/types"
import { Badge } from "@/components/ui/badge"

interface StockInfoProps {
  item: InventoryItem
}

// Helper function to determine stock level and color
const getStockLevelInfo = (current: number, minimum: number, maximum: number) => {
  const percentage = (current / maximum) * 100
  
  if (current === 0) {
    return { level: 'empty', color: 'bg-red-500', textColor: 'text-red-600', percentage: 0 }
  } else if (current <= minimum) {
    return { level: 'low', color: 'bg-orange-500', textColor: 'text-orange-600', percentage }
  } else if (current <= (minimum * 1.5)) {
    return { level: 'medium', color: 'bg-yellow-500', textColor: 'text-yellow-600', percentage }
  } else {
    return { level: 'good', color: 'bg-green-500', textColor: 'text-green-600', percentage }
  }
}

// Helper function to format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

export default function StockInfo({ item }: StockInfoProps) {
  const stockInfo = getStockLevelInfo(item.currentStock, item.minStock, item.maxStock)
  const totalValue = item.currentStock * item.costPerUnit

  return (
    <div className="bg-gray-50 rounded-xl p-6 space-y-6">
      {/* Header with RAL code and status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div 
            className="w-12 h-12 rounded-lg border-2 border-gray-300 flex-shrink-0"
            style={{ backgroundColor: item.color }}
          />
          <div>
            <h3 className="text-xl font-semibold text-gray-900">RAL {item.ralCode}</h3>
            <p className="text-sm text-gray-600">{item.description}</p>
          </div>
        </div>
        <Badge 
          className={`px-3 py-1 text-sm font-medium ${
            item.status === 'OK' ? 'bg-green-100 text-green-800' :
            item.status === 'LAAG' ? 'bg-red-100 text-red-800' :
            item.status === 'GEM' ? 'bg-orange-100 text-orange-800' :
            'bg-gray-100 text-gray-800'
          }`}
        >
          {item.status}
        </Badge>
      </div>

      {/* Stock Level Indicator */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Voorraad Niveau</span>
          <span className={`text-sm font-medium ${stockInfo.textColor}`}>
            {Math.round(stockInfo.percentage)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className={`h-3 rounded-full transition-all duration-500 ${stockInfo.color}`}
            style={{ width: `${Math.min(stockInfo.percentage, 100)}%` }}
          />
        </div>
        <div className="text-sm">
          {stockInfo.level === 'empty' && (
            <span className="text-red-600 font-medium">⚠️ Voorraad is leeg</span>
          )}
          {stockInfo.level === 'low' && (
            <span className="text-orange-600 font-medium">⚠️ Lage voorraad - bestellen aanbevolen</span>
          )}
          {stockInfo.level === 'medium' && (
            <span className="text-yellow-600 font-medium">⚡ Voorraad wordt laag</span>
          )}
          {stockInfo.level === 'good' && (
            <span className="text-green-600 font-medium">✅ Voorraad niveau is goed</span>
          )}
        </div>
      </div>

      {/* Stock Data */}
      <dl className="space-y-3">
        <div className="flex justify-between items-center">
          <dt className="text-sm text-gray-600">Huidige voorraad:</dt>
          <dd className="text-sm font-medium text-gray-900">
            {item.currentStock} kg
          </dd>
        </div>
        <div className="flex justify-between items-center">
          <dt className="text-sm text-gray-600">Maximum voorraad:</dt>
          <dd className="text-sm font-medium text-gray-900">
            {item.maxStock} kg
          </dd>
        </div>
        <div className="flex justify-between items-center">
          <dt className="text-sm text-gray-600">Minimum voorraad:</dt>
          <dd className="text-sm font-medium text-gray-900">
            {item.minStock} kg
          </dd>
        </div>
      </dl>
    </div>
  )
}