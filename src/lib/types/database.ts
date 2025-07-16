export interface Database {
  public: {
    Tables: {
      inventory_items: {
        Row: {
          id: string
          ral_code: string
          color: string
          brand: string
          product_code: string
          status: 'OK' | 'GEM' | 'LAAG' | 'UIT'
          current_stock: number
          max_stock: number
          min_stock: number
          location: string
          unit: string
          supplier: string
          weight: number
          cost_per_unit: number
          description: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          ral_code: string
          color: string
          brand: string
          product_code: string
          status: 'OK' | 'GEM' | 'LAAG' | 'UIT'
          current_stock: number
          max_stock: number
          min_stock: number
          location: string
          unit?: string
          supplier: string
          weight: number
          cost_per_unit: number
          description?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          ral_code?: string
          color?: string
          brand?: string
          product_code?: string
          status?: 'OK' | 'GEM' | 'LAAG'
          current_stock?: number
          max_stock?: number
          min_stock?: number
          location?: string
          unit?: string
          supplier?: string
          weight?: number
          cost_per_unit?: number
          description?: string
          created_at?: string
          updated_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          inventory_item_id: string
          type: string
          quantity: number
          user_name: string
          order_number: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          inventory_item_id: string
          type: string
          quantity: number
          user_name: string
          order_number?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          inventory_item_id?: string
          type?: string
          quantity?: number
          user_name?: string
          order_number?: string | null
          notes?: string | null
          created_at?: string
        }
      }
    }
  }
}

// Real-time subscription payload types
export interface RealtimePayload<T = Record<string, unknown>> {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE'
  new: T
  old: T
  errors: unknown[]
  schema: string
  table: string
  commit_timestamp: string
}

export type InventoryRealtimePayload = RealtimePayload<Database['public']['Tables']['inventory_items']['Row']>