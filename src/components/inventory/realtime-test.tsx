'use client'

import { useInventory } from '@/lib/hooks/useInventory'

export function RealtimeTest() {
  const { items, connectionStatus, updateItem } = useInventory()

  const handleTestUpdate = async () => {
    if (items.length > 0) {
      const firstItem = items[0]
      await updateItem(firstItem.id, {
        description: `Test update at ${new Date().toISOString()}`
      })
    }
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg p-4 shadow-lg">
      <h3 className="text-sm font-medium text-gray-900 mb-2">Real-time Test</h3>
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${
            connectionStatus === 'connected' ? 'bg-green-500' : 
            connectionStatus === 'connecting' ? 'bg-yellow-500' : 'bg-red-500'
          }`} />
          <span className="text-xs text-gray-600">{connectionStatus}</span>
        </div>
        <div className="text-xs text-gray-500">
          Items: {items.length}
        </div>
        <button
          onClick={handleTestUpdate}
          className="w-full px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Test Update
        </button>
      </div>
    </div>
  )
}