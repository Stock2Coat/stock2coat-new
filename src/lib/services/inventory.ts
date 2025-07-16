import { createClient } from '@/lib/supabase/client'
import { Database } from '@/lib/types/database'
import { InventoryItem, Transaction, TransactionType } from '@/lib/types'

type DBInventoryItem = Database['public']['Tables']['inventory_items']['Row']
type DBTransaction = Database['public']['Tables']['transactions']['Row']

export class InventoryService {
  private supabase = createClient()
  
  private isSupabaseConfigured() {
    return process.env.NEXT_PUBLIC_SUPABASE_URL && 
           process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
           process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co'
  }

  // Convert database item to app format
  private toInventoryItem(dbItem: DBInventoryItem, transactions: DBTransaction[] = []): InventoryItem {
    return {
      id: dbItem.id,
      ralCode: dbItem.ral_code,
      color: dbItem.color,
      brand: dbItem.brand,
      productCode: dbItem.product_code,
      status: dbItem.status,
      currentStock: dbItem.current_stock,
      maxStock: dbItem.max_stock,
      minStock: dbItem.min_stock,
      location: dbItem.location,
      unit: dbItem.unit,
      supplier: dbItem.supplier,
      weight: dbItem.weight,
      costPerUnit: dbItem.cost_per_unit,
      description: dbItem.description,
      lastUpdated: dbItem.updated_at,
      transactions: transactions.map(this.toTransaction)
    }
  }

  // Convert database transaction to app format
  private toTransaction(dbTransaction: DBTransaction): Transaction {
    return {
      id: dbTransaction.id,
      type: dbTransaction.type as TransactionType,
      quantity: dbTransaction.quantity,
      unit: 'kg', // Default unit since it's not stored in transactions table
      date: dbTransaction.created_at,
      user: dbTransaction.user_name,
      description: dbTransaction.notes || '',
      reference: dbTransaction.order_number || undefined
    }
  }

  // Get all inventory items
  async getAllItems(): Promise<InventoryItem[]> {
    const { data: items, error } = await this.supabase
      .from('inventory_items')
      .select(`*, transactions (*)`)
      .order('ral_code', { ascending: true })

    if (error) {
      console.error('Error fetching inventory items:', error)
      throw new Error('Failed to fetch inventory items')
    }

    return items.map(item => this.toInventoryItem(item, item.transactions || []))
  }

  // Get single inventory item
  async getItem(id: string): Promise<InventoryItem | null> {
    const { data, error } = await this.supabase
      .from('inventory_items')
      .select(`*, transactions (*)`)
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching inventory item:', error)
      return null
    }

    return this.toInventoryItem(data, data.transactions || [])
  }

  // Update inventory item
  async updateItem(id: string, updates: Partial<InventoryItem>): Promise<InventoryItem | null> {
    const dbUpdates: Partial<DBInventoryItem> = {}
    
    if (updates.ralCode !== undefined) dbUpdates.ral_code = updates.ralCode
    if (updates.color !== undefined) dbUpdates.color = updates.color
    if (updates.brand !== undefined) dbUpdates.brand = updates.brand
    if (updates.productCode !== undefined) dbUpdates.product_code = updates.productCode
    if (updates.status !== undefined) dbUpdates.status = updates.status
    if (updates.currentStock !== undefined) dbUpdates.current_stock = updates.currentStock
    if (updates.maxStock !== undefined) dbUpdates.max_stock = updates.maxStock
    if (updates.minStock !== undefined) dbUpdates.min_stock = updates.minStock
    if (updates.location !== undefined) dbUpdates.location = updates.location
    if (updates.unit !== undefined) dbUpdates.unit = updates.unit
    if (updates.supplier !== undefined) dbUpdates.supplier = updates.supplier
    if (updates.weight !== undefined) dbUpdates.weight = updates.weight
    if (updates.costPerUnit !== undefined) dbUpdates.cost_per_unit = updates.costPerUnit
    if (updates.description !== undefined) dbUpdates.description = updates.description

    const { data, error } = await this.supabase
      .from('inventory_items')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating inventory item:', error)
      return null
    }

    return this.toInventoryItem(data)
  }

  // Delete inventory item
  async deleteItem(id: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('inventory_items')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting inventory item:', error)
      return false
    }

    return true
  }

  // Add transaction
  async addTransaction(
    itemId: string,
    type: string,
    quantity: number,
    userName: string,
    orderNumber?: string
  ): Promise<Transaction | null> {
    const { data, error } = await this.supabase
      .from('transactions')
      .insert({
        inventory_item_id: itemId,
        type,
        quantity,
        user_name: userName,
        order_number: orderNumber || null,
        notes: null
      })
      .select()
      .single()

    if (error) {
      console.error('Error adding transaction:', error)
      return null
    }

    return this.toTransaction(data)
  }

  // Subscribe to real-time changes
  subscribeToChanges(callback: (payload: unknown) => void) {
    return this.supabase
      .channel('inventory_changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'inventory_items' 
      }, (payload) => callback(payload))
      .subscribe()
  }
}

export const inventoryService = new InventoryService()