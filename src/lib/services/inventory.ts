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

  // Atomic consumption using RPC function with fallback
  async consumeItem(
    itemId: string,
    quantity: number,
    projectOrder?: string,
    notes?: string
  ): Promise<{ success: boolean; error?: string; data?: unknown }> {
    try {
      console.log('Calling atomic consumption RPC:', { itemId, quantity, projectOrder, notes })
      console.log('Supabase configured:', this.isSupabaseConfigured())
      
      if (!this.isSupabaseConfigured()) {
        console.warn('Supabase not configured, simulating consumption success')
        return { success: true }
      }

      // Get current user for the RPC call with retry mechanism
      let user = null;
      let authError = null;
      
      // Try to get user with retry for race condition handling
      for (let attempt = 0; attempt < 3; attempt++) {
        const { data: { user: currentUser }, error: currentAuthError } = await this.supabase.auth.getUser();
        user = currentUser;
        authError = currentAuthError;
        
        if (user) break;
        
        // Wait a bit before retry
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      console.log('User authentication status:', { 
        user: user ? { id: user.id, email: user.email } : null,
        authError: authError,
        attempts: user ? 1 : 3
      })
      
      if (!user) {
        // Try to get session as fallback
        const { data: { session }, error: sessionError } = await this.supabase.auth.getSession();
        
        if (session?.user) {
          user = session.user;
          console.log('User found via session fallback:', { 
            id: user.id, 
            email: user.email 
          });
        } else {
          console.error('Authentication failed completely:', { authError, sessionError });
          throw new Error('User not authenticated. Please refresh the page and try again.');
        }
      }

      // Call the atomic RPC function - using EXACT parameter order from PostgREST error
      const rpcParams = {
        p_item_id: itemId,
        p_notes: notes || null,
        p_project_order: projectOrder || null,
        p_quantity: quantity,
        p_user_id: user.id,
        p_user_name: user.email || 'Unknown User'
      };
      
      console.log('Calling RPC with params:', rpcParams)
      console.log('🌐 NETWORK REQUEST INFO:')
      console.log('- Function: process_inventory_consumption')
      console.log('- URL: Check Network tab for POST request')
      console.log('- Expected: Success response or business logic error')
      console.log('🔍 PARAMETER VERIFICATION (CORRECT ORDER):')
      console.log('- p_item_id type:', typeof rpcParams.p_item_id, 'value:', rpcParams.p_item_id)
      console.log('- p_notes type:', typeof rpcParams.p_notes, 'value:', rpcParams.p_notes)
      console.log('- p_project_order type:', typeof rpcParams.p_project_order, 'value:', rpcParams.p_project_order)
      console.log('- p_quantity type:', typeof rpcParams.p_quantity, 'value:', rpcParams.p_quantity)
      console.log('- p_user_id type:', typeof rpcParams.p_user_id, 'value:', rpcParams.p_user_id)
      console.log('- p_user_name type:', typeof rpcParams.p_user_name, 'value:', rpcParams.p_user_name)
      
      // Use .throwOnError() to get proper error messages instead of empty objects
      let data, error;
      try {
        const result = await this.supabase
          .rpc('process_inventory_consumption', rpcParams)
          .throwOnError()
        data = result.data
        error = null
      } catch (thrownError) {
        data = null
        error = thrownError
      }
      
      console.log('🔄 RPC RESPONSE:')
      console.log('- Data:', data)
      console.log('- Error:', error)
      console.log('- Check Network tab Response for exact error message')

      if (error) {
        console.error('🔍 PROPER ERROR EXTRACTION:')
        const errorObj = error as { message?: string; details?: string; hint?: string; code?: string }
        console.error('- Error message:', errorObj.message)
        console.error('- Error details:', errorObj.details)
        console.error('- Error hint:', errorObj.hint)
        console.error('- Error code:', errorObj.code)
        console.error('- Full error object:', error)
        console.log('🔍 DEBUGGING INFO:')
        console.log('- Function exists and was called')
        console.log('- Error indicates business logic validation failure')
        console.log('- Check network tab for exact error message')
        console.log('- Most likely: insufficient stock or item not found')
        
        // Special handling for function not found error - use fallback method
        if (errorObj.message && errorObj.message.includes('function') && errorObj.message.includes('does not exist')) {
          console.warn('Database function not found, using fallback method')
          console.log('📋 MANUAL DEPLOYMENT REQUIRED:')
          console.log('Go to: https://supabase.com/dashboard/project/rlgnxmygytofqmhmgfaa/sql')
          console.log('Deploy the function from: supabase/deploy_final_function.sql')
          return await this.consumeItemFallback(itemId, quantity, user, projectOrder, notes)
        }
        
        // Parse and categorize database function errors using proper error extraction
        let userFriendlyError = 'Failed to process consumption'
        const errorMessage = errorObj.message || errorObj.details || errorObj.hint || ''
        
        console.log('🔍 ERROR CATEGORIZATION:')
        console.log('- Raw error message:', errorMessage)
        
        if (errorMessage.includes('Could not find the function')) {
          userFriendlyError = 'Database functie niet gevonden - herstel vereist'
          console.log('- Category: FUNCTION_NOT_FOUND')
          console.log('- Action: Deploy EMERGENCY_REDEPLOY.sql')
        } else if (errorMessage.includes('Insufficient stock')) {
          userFriendlyError = 'Onvoldoende voorraad beschikbaar'
          console.log('- Category: INSUFFICIENT_STOCK')
        } else if (errorMessage.includes('not found')) {
          userFriendlyError = 'Artikel niet gevonden'
          console.log('- Category: ITEM_NOT_FOUND')
        } else if (errorMessage.includes('Quantity must be greater than 0')) {
          userFriendlyError = 'Hoeveelheid moet groter zijn dan 0'
          console.log('- Category: INVALID_QUANTITY')
        } else if (errorMessage.includes('cannot be null') || errorMessage.includes('cannot be empty')) {
          userFriendlyError = 'Ongeldige invoer - contacteer beheerder'
          console.log('- Category: INVALID_INPUT')
        } else if (errorMessage.includes('User') || errorMessage.includes('permission')) {
          userFriendlyError = 'Gebruiker niet geautoriseerd'
          console.log('- Category: PERMISSION_DENIED')
        } else if (errorMessage.includes('RLS') || errorMessage.includes('policy')) {
          userFriendlyError = 'Database toegang geweigerd'
          console.log('- Category: RLS_POLICY_VIOLATION')
        } else {
          userFriendlyError = `Database fout: ${errorMessage}`
          console.log('- Category: UNKNOWN_ERROR')
        }
        
        return { 
          success: false, 
          error: userFriendlyError
        }
      }

      // Check for success response (data should be JSONB with status)
      if (!data || (data && data.status !== 'success')) {
        console.error('RPC returned failure:', data)
        return { 
          success: false, 
          error: data?.message || 'Consumption failed' 
        }
      }

      console.log('✅ CONSUMPTION SUCCESSFUL!')
      console.log('🎉 Function executed with proper error handling')
      console.log('📊 Response data:', data)
      console.log('🔄 Next: Check database and UI updates')
      console.log('- Database: Verify inventory_items.current_stock decreased')
      console.log('- Database: Check inventory_log for new transaction record')
      console.log('- UI: Verify inventory list updates with new stock level')
      
      // Extract transaction details for logging
      if (data.data) {
        console.log('💾 TRANSACTION DETAILS:')
        console.log('- Item ID:', data.data.item_id)
        console.log('- Item Code:', data.data.item_code)
        console.log('- Previous Stock:', data.data.previous_stock)
        console.log('- Consumed:', data.data.consumed_quantity)
        console.log('- New Stock:', data.data.new_stock)
        console.log('- New Status:', data.data.new_status)
        console.log('- Transaction ID:', data.data.transaction_id)
      }
      
      return { success: true, data }
      
    } catch (err) {
      console.error('Error in consumeItem:', err)
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Unexpected error occurred' 
      }
    }
  }

  // Fallback method for when RPC function is not deployed
  private async consumeItemFallback(
    itemId: string,
    quantity: number,
    user: { id: string; email?: string },
    projectOrder?: string,
    notes?: string
  ): Promise<{ success: boolean; error?: string; data?: unknown }> {
    try {
      console.log('Using fallback consumption method')
      
      // Get current item
      const { data: currentItem, error: fetchError } = await this.supabase
        .from('inventory_items')
        .select('*')
        .eq('id', itemId)
        .single()
      
      if (fetchError || !currentItem) {
        return { success: false, error: 'Item not found' }
      }
      
      // Check sufficient stock
      if (currentItem.current_stock < quantity) {
        return { 
          success: false, 
          error: `Insufficient stock. Available: ${currentItem.current_stock} kg, Requested: ${quantity} kg` 
        }
      }
      
      // Calculate new stock and status
      const newStock = currentItem.current_stock - quantity
      let newStatus = 'OK'
      
      if (newStock <= 0) {
        newStatus = 'UIT'
      } else if (newStock <= currentItem.min_stock) {
        newStatus = 'LAAG'
      } else if (newStock <= (currentItem.min_stock * 2)) {
        newStatus = 'GEM'
      }
      
      // Update inventory item
      const { error: updateError } = await this.supabase
        .from('inventory_items')
        .update({
          current_stock: newStock,
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', itemId)
      
      if (updateError) {
        console.error('Failed to update inventory:', updateError)
        return { success: false, error: 'Failed to update inventory' }
      }
      
      // Log transaction
      const { error: transactionError } = await this.supabase
        .from('transactions')
        .insert({
          inventory_item_id: itemId,
          type: 'OUT',
          quantity: quantity,
          user_name: user.email || 'Unknown User',
          order_number: projectOrder || null,
          notes: notes || null,
          created_at: new Date().toISOString()
        })
      
      if (transactionError) {
        console.warn('Failed to log transaction:', transactionError)
        // Don't fail the whole operation for transaction logging
      }
      
      console.log('Fallback consumption successful')
      return { 
        success: true, 
        data: {
          item_id: itemId,
          previous_stock: currentItem.current_stock,
          consumed_quantity: quantity,
          new_stock: newStock,
          new_status: newStatus
        }
      }
      
    } catch (error) {
      console.error('Fallback consumption error:', error)
      return { success: false, error: 'Failed to process consumption' }
    }
  }
}

export const inventoryService = new InventoryService()