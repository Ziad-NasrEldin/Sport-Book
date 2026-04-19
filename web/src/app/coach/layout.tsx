'use client'

import type { ReactNode } from 'react'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CoachSidebar } from '@/components/coach/CoachSidebar'
import { CoachTopbar } from '@/components/coach/CoachTopbar'
import { CoachMobileTabs } from '@/components/coach/CoachMobileTabs'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { getPostLoginRoute, normalizeRole, useSession } from '@/lib/auth/session'

export default function CoachLayout({ children }: { children: ReactNode }) {
  const router = useRouter()
  const { user, loading } = useSession()

  useEffect(() => {
    if (loading) return
    if (!user) {
      router.replace('/auth/sign-in')
      return
    }

    if (normalizeRole(user.role) !== 'COACH') {
      router.replace(getPostLoginRoute(user.role))
    }
  }, [loading, router, user])

  if (loading || !user || normalizeRole(user.role) !== 'COACH') {
    return (
      <main className="min-h-screen bg-surface-container-low flex items-center justify-center">
        <div className="flex items-center gap-3 text-primary">
          <LoadingSpinner />
          <span className="font-semibold">Loading coach workspace...</span>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-surface-container-low">
      <div className="grid lg:grid-cols-[260px_minmax(0,1fr)] min-h-screen">
        <CoachSidebar />

        <div className="min-w-0">
          <CoachTopbar />
          <CoachMobileTabs />
          <div className="px-4 md:px-6 lg:px-8 py-6 md:py-7 lg:py-8 space-y-6">{children}</div>
        </div>
      </div>
    </main>
  )
}
