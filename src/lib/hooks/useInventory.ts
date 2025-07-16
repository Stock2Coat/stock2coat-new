import { useState, useEffect, useCallback } from 'react'
import { RealtimeChannel } from '@supabase/supabase-js'
import { inventoryService } from '@/lib/services/inventory'
import { InventoryItem } from '@/lib/types'
import { InventoryRealtimePayload } from '@/lib/types/database'

interface UseInventoryReturn {
  items: InventoryItem[]
  loading: boolean
  error: string | null
  connectionStatus: 'connected' | 'disconnected' | 'connecting'
  updateItem: (id: string, updates: Partial<InventoryItem>) => Promise<void>
  deleteItem: (id: string) => Promise<void>
  addTransaction: (
    itemId: string,
    type: string,
    quantity: number,
    userName: string,
    orderNumber?: string
  ) => Promise<void>
  consumeItem: (
    itemId: string,
    quantity: number,
    projectOrder?: string,
    notes?: string
  ) => Promise<{ success: boolean; error?: string }>
  refreshItems: () => Promise<void>
}

export function useInventory(): UseInventoryReturn {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('connecting')
  const [, setRealtimeChannel] = useState<RealtimeChannel | null>(null)

  // Fetch initial data
  const fetchItems = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      console.log('Fetching inventory items from database...')
      
      const data = await inventoryService.getAllItems()
      setItems(data)
      console.log(`Successfully fetched ${data.length} inventory items`)
    } catch (err) {
      console.error('Error fetching inventory items:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch inventory items')
    } finally {
      setLoading(false)
    }
  }, [])

  // Handle real-time updates
  const handleRealtimeUpdate = useCallback((payload: unknown) => {
    console.log('🔄 REAL-TIME UPDATE RECEIVED!')
    console.log('📊 Payload:', payload)
    console.log('🔄 Action: Updating UI with database changes')
    console.log('- Expected: Inventory stock levels will sync with database')
    console.log('- Verification: Check if optimistic updates match real data')
    
    // Type guard to ensure payload is the expected format
    if (!payload || typeof payload !== 'object') {
      console.warn('Invalid payload received:', payload)
      return
    }
    
    const realtimePayload = payload as InventoryRealtimePayload

    setItems(prevItems => {
      switch (realtimePayload.eventType) {
        case 'INSERT':
          // Convert database item to app format and add to items
          const newItem: InventoryItem = {
            id: realtimePayload.new.id,
            ralCode: realtimePayload.new.ral_code,
            color: realtimePayload.new.color,
            brand: realtimePayload.new.brand,
            productCode: realtimePayload.new.product_code,
            status: realtimePayload.new.status,
            currentStock: realtimePayload.new.current_stock,
            maxStock: realtimePayload.new.max_stock,
            minStock: realtimePayload.new.min_stock,
            location: realtimePayload.new.location,
            unit: realtimePayload.new.unit,
            supplier: realtimePayload.new.supplier,
            weight: realtimePayload.new.weight,
            costPerUnit: realtimePayload.new.cost_per_unit,
            description: realtimePayload.new.description,
            lastUpdated: realtimePayload.new.updated_at,
            transactions: []
          }
          return [...prevItems, newItem]

        case 'UPDATE':
          return prevItems.map(item => 
            item.id === realtimePayload.new.id 
              ? {
                  ...item,
                  ralCode: realtimePayload.new.ral_code,
                  color: realtimePayload.new.color,
                  brand: realtimePayload.new.brand,
                  productCode: realtimePayload.new.product_code,
                  status: realtimePayload.new.status,
                  currentStock: realtimePayload.new.current_stock,
                  maxStock: realtimePayload.new.max_stock,
                  minStock: realtimePayload.new.min_stock,
                  location: realtimePayload.new.location,
                  unit: realtimePayload.new.unit,
                  supplier: realtimePayload.new.supplier,
                  weight: realtimePayload.new.weight,
                  costPerUnit: realtimePayload.new.cost_per_unit,
                  description: realtimePayload.new.description,
                  lastUpdated: realtimePayload.new.updated_at
                }
              : item
          )

        case 'DELETE':
          return prevItems.filter(item => item.id !== realtimePayload.old.id)

        default:
          console.warn('Unknown real-time event type:', realtimePayload.eventType)
          return prevItems
      }
    })
  }, [])

  // Set up real-time subscription
  useEffect(() => {
    let channel: RealtimeChannel | null = null

    const setupRealtimeSubscription = async () => {
      try {
        setConnectionStatus('connecting')
        console.log('Setting up real-time subscription for inventory items...')

        // Create channel and subscribe to changes
        channel = inventoryService.subscribeToChanges(handleRealtimeUpdate)
        setRealtimeChannel(channel)

        // Listen for subscription status changes
        channel.on('system', {}, (payload) => {
          console.log('Subscription status:', payload)
          if (payload.status === 'SUBSCRIBED') {
            setConnectionStatus('connected')
          } else if (payload.status === 'CHANNEL_ERROR') {
            setConnectionStatus('disconnected')
            setError('Real-time connection failed')
          }
        })

        console.log('Real-time subscription established')
      } catch (err) {
        console.error('Failed to set up real-time subscription:', err)
        setConnectionStatus('disconnected')
        setError('Failed to establish real-time connection')
      }
    }

    setupRealtimeSubscription()

    // Cleanup function
    return () => {
      if (channel) {
        console.log('Cleaning up real-time subscription...')
        channel.unsubscribe()
        setRealtimeChannel(null)
        setConnectionStatus('disconnected')
      }
    }
  }, [handleRealtimeUpdate])

  // Load initial data
  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  // Update item function
  const updateItem = useCallback(async (id: string, updates: Partial<InventoryItem>) => {
    try {
      console.log('Updating inventory item:', id, updates)
      
      const updatedItem = await inventoryService.updateItem(id, updates)
      
      if (updatedItem) {
        // Optimistically update local state
        setItems(prevItems => 
          prevItems.map(item => 
            item.id === id ? updatedItem : item
          )
        )
        console.log('Item updated successfully')
      } else {
        throw new Error('Failed to update item')
      }
    } catch (err) {
      console.error('Error updating item:', err)
      setError(err instanceof Error ? err.message : 'Failed to update item')
    }
  }, [])

  // Delete item function
  const deleteItem = useCallback(async (id: string) => {
    try {
      console.log('Deleting inventory item:', id)
      
      const success = await inventoryService.deleteItem(id)
      
      if (success) {
        // Optimistically update local state
        setItems(prevItems => prevItems.filter(item => item.id !== id))
        console.log('Item deleted successfully')
      } else {
        throw new Error('Failed to delete item')
      }
    } catch (err) {
      console.error('Error deleting item:', err)
      setError(err instanceof Error ? err.message : 'Failed to delete item')
    }
  }, [])

  // Add transaction function
  const addTransaction = useCallback(async (
    itemId: string,
    type: string,
    quantity: number,
    userName: string,
    orderNumber?: string
  ) => {
    try {
      console.log('Adding transaction:', { itemId, type, quantity, userName, orderNumber })
      
      const transaction = await inventoryService.addTransaction(
        itemId,
        type,
        quantity,
        userName,
        orderNumber
      )
      
      if (transaction) {
        // Refresh items to get updated stock and transactions
        await fetchItems()
        console.log('Transaction added successfully')
      } else {
        throw new Error('Failed to add transaction')
      }
    } catch (err) {
      console.error('Error adding transaction:', err)
      setError(err instanceof Error ? err.message : 'Failed to add transaction')
    }
  }, [fetchItems])

  // Optimistic consumption with atomic RPC call
  const consumeItem = useCallback(async (
    itemId: string,
    quantity: number,
    projectOrder?: string,
    notes?: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log('Starting optimistic consumption:', { itemId, quantity, projectOrder, notes })
      
      // Validate input parameters
      if (!itemId || typeof itemId !== 'string') {
        return { success: false, error: 'Invalid item ID' }
      }
      
      if (!quantity || quantity <= 0) {
        return { success: false, error: 'Quantity must be greater than 0' }
      }
      
      // Find the item for optimistic update
      const item = items.find(i => i.id === itemId)
      if (!item) {
        return { success: false, error: 'Item not found in inventory' }
      }
      
      // Check if there's sufficient stock
      if (quantity > item.currentStock) {
        return { success: false, error: `Insufficient stock. Available: ${item.currentStock} kg, Requested: ${quantity} kg` }
      }

      // Store original state for rollback
      const originalItem = { ...item }
      
      // Calculate new stock and status for optimistic update
      const newStock = item.currentStock - quantity
      let newStatus = item.status
      
      if (newStock <= 0) {
        newStatus = 'UIT'
      } else if (newStock <= item.minStock) {
        newStatus = 'LAAG'
      } else if (newStock <= (item.minStock * 2)) {
        newStatus = 'GEM'
      } else {
        newStatus = 'OK'
      }

      // Optimistic UI update - immediately update the UI
      setItems(prevItems =>
        prevItems.map(prevItem =>
          prevItem.id === itemId
            ? {
                ...prevItem,
                currentStock: newStock,
                status: newStatus,
                lastUpdated: new Date().toISOString()
              }
            : prevItem
        )
      )

      // Call the atomic RPC function
      const result = await inventoryService.consumeItem(
        itemId,
        quantity,
        projectOrder,
        notes
      )

      if (result.success) {
        console.log('✅ CONSUMPTION HOOK SUCCESS!')
        console.log('📊 Service response:', result)
        console.log('🔄 UI UPDATE STATUS:')
        console.log('- Optimistic update: Already applied')
        console.log('- Real-time subscription: Will confirm changes')
        console.log('- Expected: Inventory table shows updated stock')
        
        // Log the current state for verification
        const updatedItem = items.find(i => i.id === itemId)
        if (updatedItem) {
          console.log('📋 CURRENT ITEM STATE:')
          console.log(`- Item: ${updatedItem.ralCode}`)
          console.log(`- Current stock: ${updatedItem.currentStock} kg`)
          console.log(`- Status: ${updatedItem.status}`)
        }
        
        // Success - the real-time subscription will confirm the update
        return { success: true }
      } else {
        console.error('Consumption failed:', {
          error: result.error,
          fullResult: JSON.stringify(result, null, 2),
          itemId,
          quantity
        })
        console.error('Consumption failed full object:', result)
        
        // Rollback optimistic update on failure
        setItems(prevItems =>
          prevItems.map(prevItem =>
            prevItem.id === itemId ? originalItem : prevItem
          )
        )
        
        // Enhanced error handling based on error type
        let userFriendlyError = result.error || 'Failed to register consumption'
        
        if (result.error?.includes('function') && result.error?.includes('does not exist')) {
          userFriendlyError = 'Database function niet gevonden. Neem contact op met de beheerder.'
        } else if (result.error?.includes('INSUFFICIENT_STOCK')) {
          userFriendlyError = 'Onvoldoende voorraad beschikbaar.'
        } else if (result.error?.includes('INVALID_QUANTITY')) {
          userFriendlyError = 'Ongeldige hoeveelheid ingevoerd.'
        } else if (result.error?.includes('ITEM_NOT_FOUND')) {
          userFriendlyError = 'Artikel niet gevonden in voorraad.'
        }
        
        return { 
          success: false, 
          error: userFriendlyError
        }
      }
    } catch (err) {
      console.error('Error in consumeItem:', {
        error: err,
        message: err instanceof Error ? err.message : 'Unknown error',
        stack: err instanceof Error ? err.stack : undefined,
        itemId,
        quantity
      })
      
      // Rollback optimistic update on error
      const currentOriginalItem = items.find(i => i.id === itemId)
      if (currentOriginalItem) {
        setItems(prevItems =>
          prevItems.map(prevItem =>
            prevItem.id === itemId ? currentOriginalItem : prevItem
          )
        )
      } else {
        // If item not found in current state, force refresh
        console.warn('Item not found for rollback, forcing refresh')
        fetchItems()
      }
      
      // Enhanced error handling for different error types
      let userFriendlyError = 'Er is een onverwachte fout opgetreden'
      
      if (err instanceof Error) {
        if (err.message.includes('User not authenticated')) {
          userFriendlyError = 'U bent niet ingelogd. Ververs de pagina en probeer opnieuw.'
        } else if (err.message.includes('network') || err.message.includes('fetch')) {
          userFriendlyError = 'Netwerkfout. Controleer uw internetverbinding.'
        } else if (err.message.includes('timeout')) {
          userFriendlyError = 'Verzoek duurde te lang. Probeer het opnieuw.'
        } else {
          userFriendlyError = `Fout: ${err.message}`
        }
      }
      
      return { 
        success: false, 
        error: userFriendlyError
      }
    }
  }, [items])

  return {
    items,
    loading,
    error,
    connectionStatus,
    updateItem,
    deleteItem,
    addTransaction,
    consumeItem,
    refreshItems: fetchItems
  }
}