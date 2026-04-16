import type { ReactNode } from 'react'
import { CoachSidebar } from '@/components/coach/CoachSidebar'
import { CoachTopbar } from '@/components/coach/CoachTopbar'
import { CoachMobileTabs } from '@/components/coach/CoachMobileTabs'

export default function CoachLayout({ children }: { children: ReactNode }) {
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
