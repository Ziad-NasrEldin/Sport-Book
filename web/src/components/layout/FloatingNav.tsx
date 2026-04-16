'use client';

import { Home, Users, Store, Medal, User } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function FloatingNav() {
  const pathname = usePathname()

  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/'
    }

    return pathname === path || pathname.startsWith(`${path}/`)
  }

  return (
    <nav
      className="fixed left-1/2 -translate-x-1/2 w-[calc(100%-3rem)] max-w-[420px] bg-surface-container-highest/90 backdrop-blur-[20px] shadow-ambient rounded-full px-2 py-2 flex items-center justify-between z-50 md:w-[min(720px,calc(100%-4rem))] md:max-w-none md:px-3 md:py-3"
      style={{ bottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
    >
      <Link 
        href="/"
        className={`flex flex-col items-center justify-center gap-1 w-16 h-16 rounded-full transition-transform md:w-20 md:h-20 ${
          isActive('/') 
            ? 'bg-tertiary-fixed text-primary' 
            : 'text-primary/60 hover:text-primary transition-colors'
        }`}
      >
        <Home className={`w-5 h-5 ${isActive('/') ? 'stroke-[2.5]' : 'stroke-[2]'}`} />
        <span className="text-[10px] font-bold uppercase tracking-wider md:text-xs">Home</span>
      </Link>

      <Link
        href="/teams"
        className={`flex flex-col items-center justify-center gap-1 w-16 h-16 rounded-full transition-transform md:w-20 md:h-20 ${
          isActive('/teams')
            ? 'bg-tertiary-fixed text-primary'
            : 'text-primary/60 hover:text-primary transition-colors'
        }`}
      >
        <Users className={`w-5 h-5 ${isActive('/teams') ? 'stroke-[2.5]' : 'stroke-[2]'}`} />
        <span className="text-[10px] font-bold uppercase tracking-wider md:text-xs">Teams</span>
      </Link>

      <Link 
        href="/store"
        className={`flex flex-col items-center justify-center gap-1 w-16 h-16 rounded-full transition-transform md:w-20 md:h-20 ${
          isActive('/store') 
            ? 'bg-tertiary-fixed text-primary' 
            : 'text-primary/60 hover:text-primary transition-colors'
        }`}
      >
        <Store className={`w-5 h-5 ${isActive('/store') ? 'stroke-[2.5]' : 'stroke-[2]'}`} />
        <span className="text-[10px] font-bold uppercase tracking-wider md:text-xs">Store</span>
      </Link>

      <Link
        href="/coaches"
        className={`flex flex-col items-center justify-center gap-1 w-16 h-16 rounded-full transition-transform md:w-20 md:h-20 ${
          isActive('/coaches')
            ? 'bg-tertiary-fixed text-primary'
            : 'text-primary/60 hover:text-primary transition-colors'
        }`}
      >
        <Medal className={`w-5 h-5 ${isActive('/coaches') ? 'stroke-[2.5]' : 'stroke-[2]'}`} />
        <span className="text-[10px] font-bold uppercase tracking-wider md:text-xs">Coaches</span>
      </Link>

      <Link 
        href="/profile"
        className={`flex flex-col items-center justify-center gap-1 w-16 h-16 rounded-full transition-transform md:w-20 md:h-20 ${
          isActive('/profile') 
            ? 'bg-tertiary-fixed text-primary' 
            : 'text-primary/60 hover:text-primary transition-colors'
        }`}
      >
        <User className={`w-5 h-5 ${isActive('/profile') ? 'stroke-[2.5]' : 'stroke-[2]'}`} />
        <span className="text-[10px] font-bold uppercase tracking-wider md:text-xs">Profile</span>
      </Link>
    </nav>
  )
}
