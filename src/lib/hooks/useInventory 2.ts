import { useState, useEffect } from 'react'
import { InventoryItem } from '@/lib/types'
import { InventoryService } from '@/lib/services/inventory'

const inventoryService = new InventoryService()

export function useInventory() {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchItems = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await inventoryService.getAllItems()
      setItems(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch items')
    } finally {
      setLoading(false)
    }
  }

  const updateItem = async (id: string, updates: Partial<InventoryItem>) => {
    try {
      const updatedItem = await inventoryService.updateItem(id, updates)
      if (updatedItem) {
        setItems(prev => prev.map(item => 
          item.id === id ? updatedItem : item
        ))
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update item')
    }
  }

  const addTransaction = async (
    itemId: string,
    type: string,
    quantity: number,
    userName: string,
    orderNumber?: string
  ) => {
    try {
      await inventoryService.addTransaction(
        itemId,
        type,
        quantity,
        userName,
        orderNumber
      )
      // Refresh items to get updated stock
      await fetchItems()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add transaction')
    }
  }

  useEffect(() => {
    fetchItems()
  }, [])

  return {
    items,
    loading,
    error,
    updateItem,
    addTransaction,
    refreshItems: fetchItems
  }
}