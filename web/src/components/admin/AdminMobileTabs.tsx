'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { adminNavItems } from '@/components/admin/adminNavigation'

function isActive(pathname: string, href: string) {
  if (pathname === href) return true
  return pathname.startsWith(href + '/')
}

export function AdminMobileTabs() {
  const pathname = usePathname()

  return (
    <nav className="lg:hidden px-4 md:px-6 pb-4 border-b border-primary/5 overflow-x-auto hide-scrollbar">
      <div className="flex items-center gap-2 min-w-max">
        {adminNavItems.map((item) => {
          const active = isActive(pathname, item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              aria-label={item.label}
              className={`px-3 py-2 rounded-full text-xs font-lexend font-bold uppercase tracking-[0.14em] whitespace-nowrap ${
                active
                  ? 'bg-primary-container text-surface-container-lowest'
                  : 'bg-surface-container-low text-primary/70'
              }`}
            >
              {item.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
