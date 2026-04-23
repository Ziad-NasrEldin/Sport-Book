'use client'

import { Bell, Search, Command, SlidersHorizontal, LogOut, X } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useState, useEffect } from 'react'
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

function isActive(pathname: string, href: string) {
  if (pathname === href) return true
  return pathname.startsWith(href + '/')
}

export function AdminTopbar() {
  const pathname = usePathname()
  const router = useRouter()
  const title = getTitle(pathname)
  const [navMounted, setNavMounted] = useState(false)
  const [navVisible, setNavVisible] = useState(false)

  const openNav = () => {
    setNavMounted(true)
    requestAnimationFrame(() => requestAnimationFrame(() => setNavVisible(true)))
  }

  const closeNav = () => setNavVisible(false)

  // Prevent body scroll when sheet is open
  useEffect(() => {
    document.body.style.overflow = navMounted ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [navMounted])

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
    // On mobile/tablet: open nav sheet; on desktop: focus search
    if (window.innerWidth < 1024) {
      openNav()
    } else {
      const input = document.querySelector<HTMLInputElement>('input[type="text"]:not([aria-label])')
      if (input) {
        input.focus()
        input.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }
  }

  const handleBell = () => {
    router.push('/admin/audit')
  }

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-primary/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(250,248,255,0.82))] backdrop-blur-xl shadow-[0_24px_44px_-34px_rgba(0,17,58,0.58)]">
        <div className="px-4 md:px-6 lg:px-8 py-3.5 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="min-w-0 flex flex-col gap-1">
            <p className="text-xs uppercase tracking-[0.2em] font-lexend text-primary/55">Admin Console</p>
            <div className="flex items-center gap-2.5">
              <h1 className="truncate text-[2rem] font-extrabold text-primary leading-none">{title}</h1>
              <span className="hidden 2xl:inline-flex h-8 items-center rounded-full border border-primary/10 bg-primary/5 px-3 text-[10px] font-lexend font-bold uppercase tracking-[0.16em] text-primary/68">
                Control Center
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 md:gap-2.5 xl:flex-nowrap xl:justify-end">
            <label className="hidden 2xl:flex h-11 items-center gap-2.5 px-3.5 rounded-[var(--radius-default)] border border-primary/10 bg-white min-w-[320px] shadow-[0_18px_34px_-28px_rgba(0,17,58,0.45)]">
              <Search className="w-4 h-4 text-primary/45" />
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
              className="inline-flex items-center gap-2 h-11 px-3.5 rounded-[var(--radius-default)] border border-secondary-container/45 bg-[linear-gradient(135deg,rgba(253,139,0,0.94),rgba(255,184,102,0.94))] text-primary text-sm font-extrabold whitespace-nowrap hover:brightness-105 transition-all shadow-[0_18px_34px_-22px_rgba(253,139,0,0.85)]"
            >
              <Command className="w-4 h-4" />
              <span className="2xl:hidden">Actions</span>
              <span className="hidden 2xl:inline">Quick Actions</span>
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-2 h-11 px-3.5 rounded-[var(--radius-default)] border border-primary/12 bg-white/85 text-primary text-sm font-semibold whitespace-nowrap hover:bg-white transition-colors"
              aria-label="Log out"
            >
              <LogOut className="w-4 h-4" />
              Log Out
            </button>

            <button
              type="button"
              onClick={handleFilters}
              className="w-11 h-11 rounded-[var(--radius-default)] border border-primary/10 bg-white text-primary grid place-items-center hover:bg-surface-container-low transition-colors lg:hidden"
              aria-label="Open navigation"
            >
              <SlidersHorizontal className="w-4.5 h-4.5" />
            </button>

            <button
              type="button"
              onClick={handleFilters}
              className="w-11 h-11 rounded-[var(--radius-default)] border border-primary/10 bg-white text-primary hidden lg:grid place-items-center hover:bg-surface-container-low transition-colors"
              aria-label="Focus search filters"
            >
              <SlidersHorizontal className="w-4.5 h-4.5" />
            </button>

            <button
              type="button"
              onClick={handleBell}
              className="w-11 h-11 rounded-[var(--radius-default)] border border-primary/25 bg-primary-container text-surface-container-lowest grid place-items-center hover:opacity-90 transition-opacity shadow-[0_16px_30px_-22px_rgba(0,35,102,0.95)]"
              aria-label="Go to audit log"
            >
              <Bell className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile nav sheet — only renders below lg */}
      {navMounted && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end">
          {/* Backdrop */}
          <div
            className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${navVisible ? 'opacity-100' : 'opacity-0'}`}
            onClick={closeNav}
          />

          {/* Sheet */}
          <div
            className={`relative rounded-t-2xl border-t border-white/12 bg-[linear-gradient(165deg,rgba(0,35,102,0.98)_0%,rgba(0,17,58,1)_66%,rgba(0,9,36,1)_100%)] max-h-[80dvh] flex flex-col shadow-2xl transition-transform duration-[420ms] [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] ${navVisible ? 'translate-y-0' : 'translate-y-full'}`}
            onTransitionEnd={(e) => {
              if (e.propertyName === 'transform' && !navVisible) setNavMounted(false)
            }}
          >
            {/* Handle + header */}
            <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-white/12">
              <div className="flex items-center gap-3">
                <div className="w-9 h-1 rounded-full bg-white/30 mx-auto absolute left-1/2 -translate-x-1/2 top-2" />
                <p className="text-xs uppercase tracking-[0.18em] font-lexend font-bold text-white/70 mt-1">Navigate</p>
              </div>
              <button
                type="button"
                onClick={closeNav}
                className="w-8 h-8 rounded-full border border-white/12 bg-white/8 grid place-items-center text-white/70 hover:text-white transition-colors"
                aria-label="Close navigation"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Nav grid */}
            <nav className="overflow-y-auto p-4">
              <div className="grid grid-cols-2 gap-2">
                {adminNavItems.map((item, i) => {
                  const active = isActive(pathname, item.href)
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={closeNav}
                      style={{
                        opacity: navVisible ? 1 : 0,
                        transform: navVisible ? 'translateY(0)' : 'translateY(12px)',
                        transition: `opacity 280ms cubic-bezier(0.22,1,0.36,1) ${80 + i * 28}ms, transform 280ms cubic-bezier(0.22,1,0.36,1) ${80 + i * 28}ms`,
                      }}
                      className={`px-4 py-3 rounded-[var(--radius-default)] border text-sm font-semibold transition-colors ${
                        active
                          ? 'border-white/25 bg-[linear-gradient(135deg,rgba(253,139,0,0.95),rgba(255,184,102,0.94))] text-primary'
                          : 'border-white/12 bg-white/8 text-white/75 hover:bg-white/14 hover:text-white'
                      }`}
                    >
                      {item.label}
                    </Link>
                  )
                })}
              </div>
            </nav>
          </div>
        </div>
      )}
    </>
  )
}
