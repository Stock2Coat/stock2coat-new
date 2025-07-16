export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

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
          status: 'OK' | 'GEM' | 'LAAG'
          current_stock: number
          max_stock: number
          min_stock: number
          location: string
          unit: string
          supplier: string
          weight: number
          cost_per_unit: number
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          ral_code: string
          color: string
          brand: string
          product_code: string
          status: 'OK' | 'GEM' | 'LAAG'
          current_stock?: number
          max_stock: number
          min_stock: number
          location: string
          unit?: string
          supplier: string
          weight: number
          cost_per_unit: number
          description?: string | null
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
          description?: string | null
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
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}