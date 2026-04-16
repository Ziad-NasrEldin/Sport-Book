'use client'

import { Bell, Search, Command, SlidersHorizontal, LogOut } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { adminNavItems } from '@/components/admin/adminNavigation'
import { api, clearTokens } from '@/lib/api/client'

function getTitle(pathname: string) {
  const exact = adminNavItems.find((item) => item.href === pathname)
  if (exact) return exact.label

  const segment = pathname.split('/').filter(Boolean).at(-1)
  if (!segment) return 'Dashboard'

  return segment.charAt(0).toUpperCase() + segment.slice(1)
}

const QUICK_ACTION_ROUTES: Record<string, string> = {
  '/admin/users': '/admin/verification',
  '/admin/bookings': '/admin/finance',
  '/admin/verification': '/admin/verification',
  '/admin/reports': '/admin/finance',
}

function getQuickActionRoute(pathname: string): string {
  return QUICK_ACTION_ROUTES[pathname] ?? '/admin/verification'
}

export function AdminTopbar() {
  const pathname = usePathname()
  const router = useRouter()
  const title = getTitle(pathname)

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout')
    } catch {
      // best-effort
    }
    clearTokens()
    router.push('/auth/sign-in')
  }

  const handleQuickActions = () => {
    router.push(getQuickActionRoute(pathname))
  }

  const handleFilters = () => {
    const input = document.querySelector<HTMLInputElement>('input[type="text"]:not([aria-label])')
    if (input) {
      input.focus()
      input.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  const handleBell = () => {
    router.push('/admin/audit')
  }

  return (
    <header className="sticky top-0 z-40 border-b border-primary/5 bg-surface/85 backdrop-blur-xl">
      <div className="px-4 md:px-6 lg:px-8 py-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] font-lexend text-primary/55">Admin Console</p>
          <h1 className="text-2xl font-extrabold text-primary leading-tight">{title}</h1>
        </div>

        <div className="flex items-center gap-2.5">
          <label className="hidden xl:flex items-center gap-2 px-3 py-2.5 rounded-[var(--radius-default)] bg-surface-container-low min-w-[280px]">
            <Search className="w-4 h-4 text-primary/50" />
            <input
              type="text"
              placeholder="Search users, facilities, reports"
              aria-label="Search users, facilities, reports"
              className="w-full bg-transparent text-sm font-medium text-primary placeholder:text-primary/45 outline-none"
            />
          </label>

          <button
            type="button"
            onClick={handleQuickActions}
            className="inline-flex items-center gap-2 px-3 py-2.5 rounded-[var(--radius-default)] bg-surface-container-low text-primary text-sm font-semibold hover:bg-surface-container-high transition-colors"
          >
            <Command className="w-4 h-4" />
            Quick Actions
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-2 px-3 py-2.5 rounded-[var(--radius-default)] bg-surface-container-low text-primary text-sm font-semibold hover:bg-surface-container-high transition-colors"
            aria-label="Log out"
          >
            <LogOut className="w-4 h-4" />
            Log Out
          </button>

          <button
            type="button"
            onClick={handleFilters}
            className="w-10 h-10 rounded-[var(--radius-default)] bg-surface-container-low text-primary grid place-items-center hover:bg-surface-container-high transition-colors"
            aria-label="Focus search filters"
          >
            <SlidersHorizontal className="w-4.5 h-4.5" />
          </button>

          <button
            type="button"
            onClick={handleBell}
            className="w-10 h-10 rounded-[var(--radius-default)] bg-primary-container text-surface-container-lowest grid place-items-center hover:opacity-90 transition-opacity"
            aria-label="Go to audit log"
          >
            <Bell className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>
    </header>
  )
}
