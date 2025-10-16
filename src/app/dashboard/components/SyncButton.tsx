"use client"

import { useState } from 'react'

interface SyncButtonProps {
  onSync: () => void
}

export function SyncButton({ onSync }: SyncButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSync = async () => {
    setIsLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/sync-detailed-data', {
        method: 'POST',
      })

      if (response.ok) {
        const result = await response.json()
        setMessage(`✅ ${result.clientsCreated} Klienten und ${result.assessmentsCreated} Bewertungen synchronisiert`)

        // Small delay to ensure database commits are complete
        await new Promise(resolve => setTimeout(resolve, 500))

        // Refresh the data in parent component
        await onSync()
      } else {
        throw new Error('Sync failed')
      }
    } catch {
      setMessage('❌ Synchronisation fehlgeschlagen')
    } finally {
      setIsLoading(false)
      setTimeout(() => setMessage(''), 3000)
    }
  }

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={handleSync}
        disabled={isLoading}
        className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
      >
        {isLoading ? 'Synchronisiere...' : 'Daten synchronisieren'}
      </button>
      {message && (
        <span className="text-sm text-gray-600">{message}</span>
      )}
    </div>
  )
}