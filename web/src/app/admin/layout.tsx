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
    <main className="h-screen overflow-hidden bg-surface-container-low">
      <div className="flex h-full">
        <div className="hidden lg:flex lg:flex-col lg:w-[292px] lg:flex-shrink-0 lg:fixed lg:left-0 lg:top-0 lg:h-screen lg:z-30">
          <AdminSidebar />
        </div>

        <div className="flex flex-col min-w-0 flex-1 lg:ml-[292px] h-full overflow-hidden">
          <AdminTopbar />
          <AdminMobileTabs />
          <div className="flex-1 overflow-y-auto px-4 md:px-6 lg:px-8 py-6 md:py-7 lg:py-8 space-y-6">{children}</div>
        </div>
      </div>
    </main>
  )
}
