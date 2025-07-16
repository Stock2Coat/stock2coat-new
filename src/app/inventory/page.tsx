'use client'

import { useState } from 'react'
import { InventoryTable } from '@/components/inventory/inventory-table'
import { InventoryDetails } from '@/components/inventory/inventory-details'
import { EditInventoryModal } from '@/components/inventory/edit-inventory-modal'
import { VerbruikModal } from '@/components/inventory/verbruik-modal'
import { RouteGuard } from '@/components/auth/route-guard'
import { useInventory } from '@/lib/hooks/useInventory'
import { InventoryItem } from '@/lib/types'

export default function InventoryPage() {
  const { 
    items, 
    loading, 
    error, 
    connectionStatus,
    updateItem, 
    consumeItem
  } = useInventory()
  
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [editItem, setEditItem] = useState<InventoryItem | null>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [consumeItemVar, setConsumeItem] = useState<InventoryItem | null>(null)
  const [consumeOpen, setConsumeOpen] = useState(false)

  const handleConsume = async (id: string) => {
    const item = items.find(item => item.id === id)
    if (item) {
      setConsumeItem(item)
      setConsumeOpen(true)
    }
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

  const handleConsumeClose = () => {
    setConsumeOpen(false)
    setConsumeItem(null)
  }

  const handleConsumeSubmit = async (
    itemId: string,
    quantity: number,
    projectOrder?: string,
    notes?: string
  ) => {
    return await consumeItem(itemId, quantity, projectOrder, notes)
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
    <RouteGuard requireAuth={true}>
      <div className="space-y-6">
      {/* Connection status indicator - hidden for cleaner UI */}
      {/* {connectionStatus !== 'connected' && (
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
      )} */}

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

      <VerbruikModal
        item={consumeItemVar}
        open={consumeOpen}
        onClose={handleConsumeClose}
        onConsume={handleConsumeSubmit}
      />
      
      {/* Real-time test component for development - temporarily hidden */}
      {/* {process.env.NODE_ENV === 'development' && <RealtimeTest />} */}
      </div>
    </RouteGuard>
  )
}