'use client'

import type { ReactNode } from 'react'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { AdminTopbar } from '@/components/admin/AdminTopbar'
import { AdminMobileTabs } from '@/components/admin/AdminMobileTabs'
import { useAdminAuth } from '@/lib/admin/authCheck'

export default function AdminLayout({ children }: { children: ReactNode }) {
  const isAdmin = useAdminAuth()

  if (!isAdmin) {
    return (
      <main className="min-h-screen bg-surface-container-low flex items-center justify-center">
        <p className="text-primary">Loading...</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-surface-container-low">
      <div className="grid lg:grid-cols-[260px_minmax(0,1fr)] min-h-screen">
        <AdminSidebar />

        <div className="min-w-0">
          <AdminTopbar />
          <AdminMobileTabs />
          <div className="px-4 md:px-6 lg:px-8 py-6 md:py-7 lg:py-8 space-y-6">{children}</div>
        </div>
      </div>
    </main>
  )
}
