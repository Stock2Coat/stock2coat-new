'use client'

import { useState } from 'react'
import { InventoryTable } from '@/components/inventory/inventory-table'
import { InventoryDetails } from '@/components/inventory/inventory-details'
import { EditInventoryModal } from '@/components/inventory/edit-inventory-modal'
import { useInventory } from '@/lib/hooks/useInventory'
import { InventoryItem } from '@/lib/types'

export default function InventoryPage() {
  const { items, loading, error, updateItem, addTransaction } = useInventory()
  
  console.log('InventoryPage render - items:', items.length, 'loading:', loading, 'error:', error)
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [editItem, setEditItem] = useState<InventoryItem | null>(null)
  const [editOpen, setEditOpen] = useState(false)

  const handleConsume = async (id: string) => {
    // TODO: Add proper consume dialog
    const quantity = 1 // This should come from a dialog
    await addTransaction(id, 'Verbruik', quantity, 'Current User')
  }

  const handleEdit = (id: string) => {
    const item = items.find(item => item.id === id)
    if (item) {
      setEditItem(item)
      setEditOpen(true)
    }
  }

  const handleRowClick = (id: string) => {
    const item = items.find(item => item.id === id)
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

  const handleSaveEdit = async (values: Partial<InventoryItem>) => {
    if (editItem) {
      await updateItem(editItem.id, values)
      setEditOpen(false)
      setEditItem(null)
    }
  }

  if (error) {
    return (
      <div className="text-red-500 text-center p-8">
        Error loading inventory: {error}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <InventoryTable
        data={items}
        loading={loading}
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