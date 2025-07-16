'use client'

import { useState } from 'react'
import { InventoryTable } from '@/components/inventory/inventory-table'
import { InventoryDetails } from '@/components/inventory/inventory-details'
import { EditInventoryModal } from '@/components/inventory/edit-inventory-modal'
import { RealtimeTest } from '@/components/inventory/realtime-test'
import { useInventory } from '@/lib/hooks/useInventory'
import { InventoryItem } from '@/lib/types'

export default function InventoryPage() {
  const { 
    items, 
    loading, 
    error, 
    connectionStatus,
    updateItem, 
    addTransaction 
  } = useInventory()
  
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [editItem, setEditItem] = useState<InventoryItem | null>(null)
  const [editOpen, setEditOpen] = useState(false)

  const handleConsume = async (id: string) => {
    // TODO: Add proper consume dialog
    const quantity = 1 // This should come from a dialog
    await addTransaction(id, 'OUT', quantity, 'Current User')
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

  // Show error state
  if (error) {
    return (
      <div className="text-red-500 text-center p-8">
        <h2 className="text-xl font-bold mb-2">Error loading inventory</h2>
        <p>{error}</p>
        <div className="mt-4 text-sm">
          Connection status: <span className="font-medium">{connectionStatus}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Connection status indicator */}
      {connectionStatus !== 'connected' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className={`w-3 h-3 rounded-full ${
                connectionStatus === 'connecting' ? 'bg-yellow-500 animate-pulse' : 'bg-red-500'
              }`} />
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-800">
                Real-time connection: {connectionStatus}
                {connectionStatus === 'connecting' && ' - establishing connection...'}
                {connectionStatus === 'disconnected' && ' - reconnecting...'}
              </p>
            </div>
          </div>
        </div>
      )}

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
      
      {/* Real-time test component for development */}
      {process.env.NODE_ENV === 'development' && <RealtimeTest />}
    </div>
  )
}