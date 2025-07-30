'use client'

import { Transaction } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { ChevronRight, Package, User, Calendar } from "lucide-react"

interface TransactionsTableProps {
  transactions: Transaction[]
}

// Helper function to format date
const formatDate = (dateString: string) => {
  return new Intl.DateTimeFormat('nl-NL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(dateString))
}

// Helper function to get transaction type styling
const getTransactionTypeStyle = (type: string) => {
  switch (type) {
    case 'IN':
      return 'bg-green-100 text-green-800'
    case 'OUT':
      return 'bg-red-100 text-red-800'
    case 'ADJUSTMENT':
      return 'bg-blue-100 text-blue-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export default function TransactionsTable({ transactions }: TransactionsTableProps) {
  if (!transactions || transactions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
        <p>Geen recente transacties beschikbaar</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {transactions.slice(0, 5).map((transaction, index) => (
        <div
          key={transaction.id || index}
          className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors group"
          onClick={() => {
            // Handle transaction click - could open detailed view
            console.log('Transaction clicked:', transaction)
          }}
        >
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <Badge className={`px-2 py-1 text-xs font-medium ${getTransactionTypeStyle(transaction.type)}`}>
                {transaction.type}
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <User className="w-4 h-4" />
              <span>{transaction.user}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(transaction.date)}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className={`text-sm font-medium ${
                transaction.type === 'IN' ? 'text-green-600' : 
                transaction.type === 'OUT' ? 'text-red-600' : 
                'text-blue-600'
              }`}>
                {transaction.type === 'IN' ? '+' : transaction.type === 'OUT' ? '-' : ''}
                {transaction.quantity} kg
              </span>
              {transaction.reference && (
                <div className="text-xs text-gray-500">
                  {transaction.reference}
                </div>
              )}
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
          </div>
        </div>
      ))}
    </div>
  )
}