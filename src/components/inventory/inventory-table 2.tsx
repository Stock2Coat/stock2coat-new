'use client'

import { useState } from 'react'
import { Search, Filter, ChevronDown } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { InventoryItem, InventoryStatus } from '@/lib/types'
import { InventoryRow } from './inventory-row'

interface InventoryTableProps {
  data: InventoryItem[]
  onConsume: (id: string) => void
  onEdit: (id: string) => void
  onRowClick: (id: string) => void
}

export function InventoryTable({ data, onConsume, onEdit, onRowClick }: InventoryTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter] = useState<InventoryStatus | 'ALL'>('ALL')

  const filteredData = data.filter(item => {
    const matchesSearch = item.ralCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.productCode.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const totalItems = filteredData.length
  const displayedItems = Math.min(totalItems, 50)

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Stock2Coat Poeder Inventaris</h1>
            <p className="text-gray-600 mt-1">Beheer van poedercoating voorraad en status</p>
          </div>
          <div className="text-sm text-gray-500">
            {displayedItems} van {totalItems} items
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Zoek RAL code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Status
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                RAL Code
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Merk/Product
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Voorraad
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Locatie
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Laatst Bijgewerkt
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acties
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredData.map((item) => (
              <InventoryRow
                key={item.id}
                item={item}
                onConsume={onConsume}
                onEdit={onEdit}
                onRowClick={onRowClick}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {filteredData.length === 0 && (
        <div className="px-6 py-12 text-center">
          <div className="text-gray-500">
            <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">Geen items gevonden</p>
            <p className="text-sm mt-1">Probeer een andere zoekopdracht</p>
          </div>
        </div>
      )}
    </div>
  )
}