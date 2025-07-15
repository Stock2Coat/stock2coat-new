export type InventoryStatus = 'OK' | 'GEM' | 'LAAG'
export type TransactionType = 'IN' | 'OUT' | 'ADJUSTMENT'

export interface Transaction {
  id: string
  date: string
  type: TransactionType
  quantity: number
  unit: string
  user: string
  description: string
  reference?: string
}

export interface InventoryItem {
  id: string
  ralCode: string
  color: string
  brand: string
  productCode: string
  status: InventoryStatus
  currentStock: number
  maxStock: number
  minStock: number
  location: string
  lastUpdated: string
  unit: string
  supplier: string
  weight: number
  costPerUnit: number
  description: string
  transactions: Transaction[]
}