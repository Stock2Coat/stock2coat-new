'use client'

import { InventoryItem } from "@/lib/types"
import { MapPin } from "lucide-react"

interface ProductInfoProps {
  item: InventoryItem
}

// Helper function to format date
const formatDate = (dateString: string) => {
  return new Intl.DateTimeFormat('nl-NL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(dateString))
}

export default function ProductInfo({ item }: ProductInfoProps) {
  return (
    <div className="bg-gray-50 rounded-xl p-6 space-y-6">
      <h3 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-3">
        Product Informatie
      </h3>
      
      <dl className="space-y-4">
        <div className="flex justify-between items-center">
          <dt className="text-sm text-gray-600">Merk:</dt>
          <dd className="text-sm font-medium text-gray-900 text-right max-w-[200px] truncate" title={item.brand}>
            {item.brand}
          </dd>
        </div>
        
        <div className="flex justify-between items-center">
          <dt className="text-sm text-gray-600">Product code:</dt>
          <dd className="text-sm font-medium text-gray-900 text-right max-w-[200px] truncate" title={item.productCode}>
            {item.productCode}
          </dd>
        </div>
        
        <div className="flex justify-between items-center">
          <dt className="text-sm text-gray-600">Locatie:</dt>
          <dd className="text-sm font-medium text-gray-900 flex items-center justify-end" title={item.location}>
            <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
            {item.location}
          </dd>
        </div>
        
        <div className="flex justify-between items-center">
          <dt className="text-sm text-gray-600">Verpakking gewicht:</dt>
          <dd className="text-sm font-medium text-gray-900">{item.weight} kg</dd>
        </div>
        
        <div className="flex justify-between items-center">
          <dt className="text-sm text-gray-600">Laatst bijgewerkt:</dt>
          <dd className="text-sm font-medium text-gray-900">{formatDate(item.lastUpdated)}</dd>
        </div>
      </dl>
    </div>
  )
}