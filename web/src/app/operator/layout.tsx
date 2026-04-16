import type { ReactNode } from 'react'
import { OperatorMobileTabs } from '@/components/operator/OperatorMobileTabs'
import { OperatorSidebar } from '@/components/operator/OperatorSidebar'
import { OperatorTopbar } from '@/components/operator/OperatorTopbar'

export default function OperatorLayout({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-surface-container-low">
      <div className="grid lg:grid-cols-[260px_minmax(0,1fr)] min-h-screen">
        <OperatorSidebar />

        <div className="min-w-0">
          <OperatorTopbar />
          <OperatorMobileTabs />
          <div className="px-4 md:px-6 lg:px-8 py-6 md:py-7 lg:py-8 space-y-6">{children}</div>
        </div>
      </div>
    </main>
  )
}
