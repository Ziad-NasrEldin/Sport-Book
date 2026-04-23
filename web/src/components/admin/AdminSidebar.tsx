'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ShieldCheck, Sparkles } from 'lucide-react'
import { adminNavItems } from '@/components/admin/adminNavigation'
import { LogoutButton } from '@/components/auth/LogoutButton'

function isActiveRoute(pathname: string, href: string) {
  if (pathname === href) return true
  return pathname.startsWith(href + '/')
}

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="relative hidden lg:flex lg:h-screen lg:max-h-screen lg:sticky lg:top-0 lg:flex-col lg:overflow-hidden border-r border-white/10 bg-[linear-gradient(160deg,rgba(0,35,102,0.98)_0%,rgba(0,17,58,1)_62%,rgba(0,9,36,1)_100%)] p-5 xl:p-6 shadow-[0_40px_80px_-44px_rgba(0,17,58,0.95)]">
      <div className="pointer-events-none absolute -top-16 -left-20 h-48 w-48 rounded-full bg-secondary-container/35 blur-3xl" />
      <div className="pointer-events-none absolute top-44 -right-24 h-52 w-52 rounded-full bg-white/12 blur-3xl" />

      <div className="relative z-10 flex items-center gap-3.5 px-1">
        <span className="grid h-12 w-12 place-items-center rounded-[var(--radius-default)] border border-white/20 bg-[linear-gradient(140deg,rgba(253,139,0,0.95),rgba(255,184,102,0.92))] text-primary shadow-[0_18px_34px_-22px_rgba(253,139,0,0.95)]">
          <ShieldCheck className="h-5 w-5" />
        </span>
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] font-lexend text-white/60">SportBook</p>
          <p className="text-xl font-extrabold text-white leading-none">Admin Suite</p>
        </div>
      </div>

      <nav className="relative z-10 mt-7 flex-1 min-h-0 space-y-2 overflow-y-auto overscroll-contain pr-1 pb-1">
        {adminNavItems.map((item) => {
          const active = isActiveRoute(pathname, item.href)
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              aria-label={item.label}
              className={`group flex items-center gap-3.5 rounded-[var(--radius-default)] border px-3.5 py-3 text-sm font-bold transition-all ${
                active
                  ? 'border-white/20 bg-[linear-gradient(135deg,rgba(253,139,0,0.96),rgba(255,181,88,0.94))] text-primary shadow-[0_20px_34px_-24px_rgba(253,139,0,0.95)]'
                  : 'border-white/10 bg-white/5 text-white/78 hover:border-white/18 hover:bg-white/10 hover:text-white'
              }`}
            >
              <span
                className={`grid h-8 w-8 place-items-center rounded-xl transition-colors ${
                  active
                    ? 'bg-primary/12 text-primary'
                    : 'bg-white/10 text-white/75 group-hover:bg-white/16 group-hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4" />
              </span>
              <span className="leading-none">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="relative z-10 mt-5 shrink-0 space-y-3 pt-2">
        <LogoutButton
          className="w-full inline-flex items-center justify-center gap-2 rounded-[var(--radius-default)] border border-white/14 px-3.5 py-3 text-sm font-bold bg-white/8 text-white/82 hover:bg-white/16 hover:text-white transition-colors"
        />

        <div className="rounded-[var(--radius-md)] border border-white/14 bg-[linear-gradient(150deg,rgba(253,139,0,0.26),rgba(253,139,0,0.08)_45%,rgba(255,255,255,0.05)_100%)] p-4 shadow-[0_24px_40px_-32px_rgba(253,139,0,0.85)]">
          <p className="text-[11px] uppercase tracking-[0.18em] font-lexend text-white/64">Highlights</p>
          <p className="mt-2 text-sm font-semibold text-white">11 approvals are pending and need review today.</p>
          <p className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-secondary-container">
            <Sparkles className="w-3.5 h-3.5" />
            Risk alerts enabled
          </p>
        </div>
      </div>
    </aside>
  )
}
