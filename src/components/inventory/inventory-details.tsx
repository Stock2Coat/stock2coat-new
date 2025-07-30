'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { InventoryItem } from "@/lib/types"
import StockInfo from "./StockInfo"
import ProductInfo from "./ProductInfo"
import TransactionsTable from "./TransactionsTable"

interface InventoryDetailsProps {
  item: InventoryItem | null
  open: boolean
  onClose: () => void
}

export function InventoryDetails({ item, open, onClose }: InventoryDetailsProps) {
  if (!item) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-3xl lg:max-w-5xl w-full px-6 py-8 overflow-hidden rounded-2xl shadow-xl">
        <DialogHeader className="mb-6">
          <DialogTitle className="text-2xl font-semibold tracking-tight">
            {item.ralCode} – {item.brand} {item.productCode}
          </DialogTitle>
        </DialogHeader>

        {/* Scrollable body, nooit hoger dan 90 vh */}
        <ScrollArea className="h-[calc(90vh-6rem)] pr-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <StockInfo item={item} />
            <ProductInfo item={item} />
          </div>

          <section className="mt-10">
            <h2 className="text-lg font-medium mb-4">Recente Transacties</h2>
            <TransactionsTable transactions={item.transactions} />
          </section>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}