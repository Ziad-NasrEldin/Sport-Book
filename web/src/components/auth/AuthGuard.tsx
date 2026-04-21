'use client'

import { useEffect } from 'react'
import { useAuth } from '@/lib/auth/useAuth'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading, requireAuth } = useAuth()

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      requireAuth()
    }
  }, [loading, isAuthenticated, requireAuth])

  if (loading) {
    return (
      <main className="w-full min-h-screen bg-surface flex items-center justify-center">
        <LoadingSpinner />
      </main>
    )
  }

  if (!isAuthenticated) {
    return (
      <main className="w-full min-h-screen bg-surface flex items-center justify-center">
        <LoadingSpinner />
      </main>
    )
  }

  return <>{children}</>
}