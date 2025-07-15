import { Badge } from '@/components/ui/badge'
import { InventoryStatus } from '@/lib/types'
import { cn } from '@/lib/utils'

interface StatusBadgeProps {
  status: InventoryStatus
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const variants = {
    OK: 'bg-green-100 text-green-800 hover:bg-green-100',
    GEM: 'bg-orange-100 text-orange-800 hover:bg-orange-100', 
    LAAG: 'bg-red-100 text-red-800 hover:bg-red-100'
  }

  return (
    <Badge
      variant="secondary"
      className={cn(
        'text-xs font-medium px-2 py-1',
        variants[status]
      )}
    >
      {status}
    </Badge>
  )
}