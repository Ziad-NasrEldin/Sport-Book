'use client'

import { Bell, Search, Command, SlidersHorizontal } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { coachNavItems } from '@/components/coach/coachNavigation'

function getTitle(pathname: string) {
  const exact = coachNavItems.find((item) => item.href === pathname)
  if (exact) return exact.label

  const segment = pathname.split('/').filter(Boolean).at(-1)
  if (!segment) return 'Dashboard'

  return segment.charAt(0).toUpperCase() + segment.slice(1)
}

export function CoachTopbar() {
  const pathname = usePathname()
  const title = getTitle(pathname)

  return (
    <header className="sticky top-0 z-40 border-b border-primary/5 bg-surface/85 backdrop-blur-xl">
      <div className="px-4 md:px-6 lg:px-8 py-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] font-lexend text-primary/55">Coach Console</p>
          <h1 className="text-2xl font-extrabold text-primary leading-tight">{title}</h1>
        </div>

        <div className="flex items-center gap-2.5">
          <label className="hidden xl:flex items-center gap-2 px-3 py-2.5 rounded-[var(--radius-default)] bg-surface-container-low min-w-[280px]">
            <Search className="w-4 h-4 text-primary/50" />
            <input
              type="text"
              placeholder="Search athletes, services, sessions"
              className="w-full bg-transparent text-sm font-medium text-primary placeholder:text-primary/45 outline-none"
            />
          </label>

          <button
            type="button"
            className="inline-flex items-center gap-2 px-3 py-2.5 rounded-[var(--radius-default)] bg-surface-container-low text-primary text-sm font-semibold"
          >
            <Command className="w-4 h-4" />
            Quick Actions
          </button>

          <button
            type="button"
            className="w-10 h-10 rounded-[var(--radius-default)] bg-surface-container-low text-primary grid place-items-center"
            aria-label="Open filters"
          >
            <SlidersHorizontal className="w-4.5 h-4.5" />
          </button>

          <button
            type="button"
            className="w-10 h-10 rounded-[var(--radius-default)] bg-primary-container text-surface-container-lowest grid place-items-center"
            aria-label="Open alerts"
          >
            <Bell className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>
    </header>
  )
}
