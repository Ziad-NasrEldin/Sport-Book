'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Sparkles, Trophy } from 'lucide-react'
import { coachNavItems } from '@/components/coach/coachNavigation'
import { LogoutButton } from '@/components/auth/LogoutButton'

function isActiveRoute(pathname: string, href: string) {
  if (pathname === href) return true
  return pathname.startsWith(href + '/')
}

export function CoachSidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden lg:flex lg:h-screen lg:max-h-screen lg:sticky lg:top-0 lg:flex-col lg:overflow-hidden bg-surface-container-lowest p-5 xl:p-6 shadow-ambient">
      <div className="flex items-center gap-3 px-2">
        <span className="w-10 h-10 rounded-[var(--radius-default)] bg-primary-container text-surface-container-lowest grid place-items-center">
          <Trophy className="w-5 h-5" />
        </span>
        <div>
          <p className="text-xs uppercase tracking-[0.16em] font-lexend text-primary/55">SportBook</p>
          <p className="text-lg font-extrabold text-primary leading-none">Coach Suite</p>
        </div>
      </div>

      <nav className="mt-6 flex-1 min-h-0 space-y-1.5 overflow-y-auto overscroll-contain pr-1 pb-1">
        {coachNavItems.map((item) => {
          const active = isActiveRoute(pathname, item.href)
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-[var(--radius-default)] px-3.5 py-3 text-sm font-bold transition-colors ${
                active
                  ? 'bg-primary-container text-surface-container-lowest'
                  : 'bg-surface-container-low text-primary/75 hover:bg-surface-container-high hover:text-primary'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="mt-4 shrink-0 space-y-3 pt-2">
        <LogoutButton
          className="w-full inline-flex items-center justify-center gap-2 rounded-[var(--radius-default)] px-3.5 py-3 text-sm font-bold bg-surface-container-low text-primary/75 hover:bg-surface-container-high hover:text-primary transition-colors"
        />

        <div className="rounded-[var(--radius-md)] bg-secondary-container/20 p-4">
          <p className="text-xs uppercase tracking-[0.16em] font-lexend text-primary/60">Highlights</p>
          <p className="mt-2 text-sm font-semibold text-primary">4 session requests are waiting approval this week.</p>
          <p className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-secondary">
            <Sparkles className="w-3.5 h-3.5" />
            Peak hours are optimized
          </p>
        </div>
      </div>
    </aside>
  )
}
