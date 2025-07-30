import { InventoryItem } from '@/lib/types'
import { StatusBadge } from './status-badge'
import { StockBar } from './stock-bar'
import { ActionButtons } from './action-buttons'

interface InventoryRowProps {
  item: InventoryItem
  onConsume: (id: string) => void
  onEdit: (id: string) => void
  onRowClick: (id: string) => void
}

export function InventoryRow({ item, onConsume, onEdit, onRowClick }: InventoryRowProps) {
  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer" onClick={() => onRowClick(item.id)}>
      {/* RAL Code with color box */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div
            className="w-6 h-6 rounded border border-gray-300"
            style={{ backgroundColor: item.color }}
          />
          <span className="font-medium text-gray-900">{item.ralCode}</span>
        </div>
      </td>

      {/* Brand/Product */}
      <td className="px-6 py-4">
        <div>
          <div className="font-medium text-gray-900">{item.productCode}</div>
          <div className="text-sm text-gray-500">{item.brand}</div>
        </div>
      </td>

      {/* Afwerking */}
      <td className="px-6 py-4">
        <span className="text-gray-900">{item.description}</span>
      </td>

      {/* Status */}
      <td className="px-6 py-4">
        <StatusBadge status={item.status} />
      </td>

      {/* Stock Bar */}
      <td className="px-6 py-4">
        <div className="w-32">
          <StockBar
            current={item.currentStock}
            max={item.maxStock}
            status={item.status}
            unit={item.unit}
          />
        </div>
      </td>

      {/* Location */}
      <td className="px-6 py-4 text-gray-900">{item.location}</td>

      {/* Actions */}
      <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
        <ActionButtons
          onConsume={() => onConsume(item.id)}
          onEdit={() => onEdit(item.id)}
        />
      </td>
    </tr>
  )
}