'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { InventoryItem, TransactionType } from "@/lib/types"
import { StatusBadge } from "./status-badge"
import { StockBar } from "./stock-bar"
import { 
  Package, 
  MapPin, 
  Truck, 
  Euro, 
  Weight, 
  Calendar,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  X
} from "lucide-react"

interface InventoryDetailsProps {
  item: InventoryItem | null
  open: boolean
  onClose: () => void
}

export function InventoryDetails({ item, open, onClose }: InventoryDetailsProps) {
  if (!item) return null

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

  const totalValue = item.currentStock * item.costPerUnit

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold">
              Product Details
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Info */}
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <div
              className="w-16 h-16 rounded-lg border-2 border-gray-300 flex-shrink-0"
              style={{ backgroundColor: item.color }}
            />
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-xl font-semibold">RAL {item.ralCode}</h3>
                <StatusBadge status={item.status} />
              </div>
              <p className="text-gray-600">{item.description}</p>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Package className="h-4 w-4" />
                  {item.brand} - {item.productCode}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {item.location}
                </span>
              </div>
            </div>
          </div>

          {/* Stock Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <h4 className="font-semibold text-lg">Voorraad Informatie</h4>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Huidige voorraad:</span>
                  <span className="font-medium">{item.currentStock} {item.unit}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Maximum voorraad:</span>
                  <span className="font-medium">{item.maxStock} {item.unit}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Minimum voorraad:</span>
                  <span className="font-medium">{item.minStock} {item.unit}</span>
                </div>
                <div className="mt-4">
                  <StockBar
                    current={item.currentStock}
                    max={item.maxStock}
                    status={item.status}
                    unit={item.unit}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-lg">Product Informatie</h4>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 flex items-center gap-1">
                    <Truck className="h-4 w-4" />
                    Leverancier:
                  </span>
                  <span className="font-medium">{item.supplier}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 flex items-center gap-1">
                    <Weight className="h-4 w-4" />
                    Verpakking:
                  </span>
                  <span className="font-medium">{item.weight} {item.unit}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 flex items-center gap-1">
                    <Euro className="h-4 w-4" />
                    Prijs per {item.unit}:
                  </span>
                  <span className="font-medium">€{item.costPerUnit.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Totale waarde:</span>
                  <span className="font-medium text-green-600">€{totalValue.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Laatst bijgewerkt:
                  </span>
                  <span className="font-medium">{item.lastUpdated}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Transaction History */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Recente Transacties</h4>
            
            {item.transactions.length > 0 ? (
              <div className="space-y-2">
                {item.transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {getTransactionIcon(transaction.type)}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{transaction.description}</span>
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
            ) : (
              <p className="text-gray-500 text-center py-4">
                Geen transacties gevonden
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <Button className="flex-1">
              Verbruik Registreren
            </Button>
            <Button variant="outline" className="flex-1">
              Bewerken
            </Button>
            <Button variant="outline" className="flex-1">
              Bestelling Plaatsen
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}