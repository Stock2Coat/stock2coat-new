'use client'

import { useState } from 'react'
import { InventoryTable } from '@/components/inventory/inventory-table'
import { InventoryDetails } from '@/components/inventory/inventory-details'
import { EditInventoryModal } from '@/components/inventory/edit-inventory-modal'
import { mockInventoryData } from '@/lib/mock-data'
import { InventoryItem } from '@/lib/types'

export default function InventoryPage() {
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [editItem, setEditItem] = useState<InventoryItem | null>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [inventoryData, setInventoryData] = useState(mockInventoryData)

  const handleConsume = (id: string) => {
    console.log('Consume item:', id)
    // TODO: Implement consume logic
  }

  const handleEdit = (id: string) => {
    const item = inventoryData.find(item => item.id === id)
    if (item) {
      setEditItem(item)
      setEditOpen(true)
    }
  }

  const handleRowClick = (id: string) => {
    const item = inventoryData.find(item => item.id === id)
    if (item) {
      setSelectedItem(item)
      setDetailsOpen(true)
    }
  }

  const handleDetailsClose = () => {
    setDetailsOpen(false)
    setSelectedItem(null)
  }

  const handleEditClose = () => {
    setEditOpen(false)
    setEditItem(null)
  }

  const handleSaveEdit = (values: Partial<InventoryItem>) => {
    if (editItem) {
      const updatedData = inventoryData.map(item => 
        item.id === editItem.id 
          ? { ...item, ...values, lastUpdated: new Date().toLocaleDateString('nl-NL') }
          : item
      )
      setInventoryData(updatedData)
      console.log('Item updated:', values)
    }
  }

  return (
    <div className="space-y-6">
      <InventoryTable
        data={inventoryData}
        onConsume={handleConsume}
        onEdit={handleEdit}
        onRowClick={handleRowClick}
      />
      
      <InventoryDetails
        item={selectedItem}
        open={detailsOpen}
        onClose={handleDetailsClose}
      />

      <EditInventoryModal
        item={editItem}
        open={editOpen}
        onClose={handleEditClose}
        onSave={handleSaveEdit}
      />
    </div>
  )
}