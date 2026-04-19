'use client'

import { useCallback, useEffect, useState } from 'react'

type ToastItem = {
  id: number
  message: string
  type: 'info' | 'success' | 'error'
}

let nextId = 0

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const handleToast = useCallback((event: Event) => {
    const { message, type } = (event as CustomEvent).detail
    const id = nextId++
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3000)
  }, [])

  useEffect(() => {
    window.addEventListener('sportbook:toast', handleToast)
    return () => window.removeEventListener('sportbook:toast', handleToast)
  }, [handleToast])

  const typeStyles: Record<string, string> = {
    info: 'bg-surface-container-lowest text-primary',
    success: 'bg-[#d8f7e8] text-[#0d7a44]',
    error: 'bg-red-50 text-red-600',
  }

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] flex flex-col items-center gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto px-5 py-3 rounded-[var(--radius-lg)] shadow-ambient text-sm font-semibold animate-in fade-in slide-in-from-bottom-4 ${typeStyles[toast.type] || typeStyles.info}`}
        >
          {toast.message}
        </div>
      ))}
    </div>
  )
}