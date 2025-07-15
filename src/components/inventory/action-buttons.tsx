import { Button } from '@/components/ui/button'
import { Minus, Edit } from 'lucide-react'

interface ActionButtonsProps {
  onConsume: () => void
  onEdit: () => void
}

export function ActionButtons({ onConsume, onEdit }: ActionButtonsProps) {
  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={onConsume}
        className="text-blue-600 border-blue-200 hover:bg-blue-50"
      >
        <Minus className="h-3 w-3 mr-1" />
        Verbruik
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={onEdit}
        className="text-gray-600 border-gray-200 hover:bg-gray-50"
      >
        <Edit className="h-3 w-3 mr-1" />
        Bewerken
      </Button>
    </div>
  )
}