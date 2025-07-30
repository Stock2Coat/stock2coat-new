'use client'

import { Transaction, TransactionType } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { ArrowUp, ArrowDown, RotateCcw } from "lucide-react"

interface TransactionsTableProps {
  transactions: Transaction[]
}

const getTransactionIcon = (type: TransactionType) => {
  switch (type) {
    case 'IN':
      return <ArrowUp className="h-4 w-4 text-green-600" />
    case 'OUT':
      return <ArrowDown className="h-4 w-4 text-red-600" />
    case 'ADJUSTMENT':
      return <RotateCcw className="h-4 w-4 text-blue-600" />
    default:
      return null
  }
}

const getTransactionColor = (type: TransactionType) => {
  switch (type) {
    case 'IN':
      return 'text-green-600'
    case 'OUT':
      return 'text-red-600'
    case 'ADJUSTMENT':
      return 'text-blue-600'
    default:
      return 'text-gray-600'
  }
}

export default function TransactionsTable({ transactions }: TransactionsTableProps) {
  if (transactions.length === 0) {
    return (
      <div className="bg-gray-50 rounded-xl p-8 text-center text-gray-500">
        <p>Geen transacties gevonden</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="space-y-0">
        {transactions.map((transaction, index) => (
          <div
            key={transaction.id}
            className={`flex items-center justify-between p-4 hover:bg-gray-50 transition-colors ${
              index !== transactions.length - 1 ? 'border-b border-gray-100' : ''
            }`}
          >
            <div className="flex items-center gap-3">
              {getTransactionIcon(transaction.type)}
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900">{transaction.description}</span>
                  {transaction.reference && (
                    <Badge variant="outline" className="text-xs">
                      {transaction.reference}
                    </Badge>
                  )}
                </div>
                <div className="text-sm text-gray-500">
                  {transaction.user} • {transaction.date}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className={`font-medium ${getTransactionColor(transaction.type)}`}>
                {transaction.type === 'OUT' ? '-' : '+'}
                {transaction.quantity} {transaction.unit}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}