'use client'

import { useEffect, useState } from 'react'
import { Home, Users, Store, Medal, User, LogIn } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  ACTIVE_USER_UPDATED_EVENT,
  TEAM_POSTS_UPDATED_EVENT,
  getActiveUserId,
  getTeamPosts,
} from '@/lib/teams'
import { useAuth } from '@/lib/auth/useAuth'

export function FloatingNav() {
  const pathname = usePathname()
  const { isAuthenticated, loading: authLoading, requireAuth } = useAuth()
  const [pendingTeamRequestsCount, setPendingTeamRequestsCount] = useState(0)

  useEffect(() => {
    const refreshPendingRequestCount = () => {
      const activeUserId = getActiveUserId()
      const posts = getTeamPosts()

      const nextCount = posts.reduce((count, post) => {
        if (post.createdByUserId !== activeUserId) return count
        return count + post.requestedUserIds.length
      }, 0)

      setPendingTeamRequestsCount(nextCount)
    }

    refreshPendingRequestCount()
    window.addEventListener(TEAM_POSTS_UPDATED_EVENT, refreshPendingRequestCount)
    window.addEventListener(ACTIVE_USER_UPDATED_EVENT, refreshPendingRequestCount)

    return () => {
      window.removeEventListener(TEAM_POSTS_UPDATED_EVENT, refreshPendingRequestCount)
      window.removeEventListener(ACTIVE_USER_UPDATED_EVENT, refreshPendingRequestCount)
    }
  }, [])

  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/'
    }

    return pathname === path || pathname.startsWith(`${path}/`)
  }

  const authNavItem = isAuthenticated ? (
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
  ) : (
    <button
      type="button"
      onClick={requireAuth}
      className={`flex flex-col items-center justify-center gap-1 w-16 h-16 rounded-full transition-transform md:w-20 md:h-20 ${
        pathname === '/auth/sign-in' || pathname === '/auth/sign-up'
          ? 'bg-tertiary-fixed text-primary'
          : 'text-primary/60 hover:text-primary transition-colors'
      }`}
    >
      <LogIn className={`w-5 h-5 ${(pathname === '/auth/sign-in' || pathname === '/auth/sign-up') ? 'stroke-[2.5]' : 'stroke-[2]'}`} />
      <span className="text-[10px] font-bold uppercase tracking-wider md:text-xs">Sign In</span>
    </button>
  )

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
        className={`relative flex flex-col items-center justify-center gap-1 w-16 h-16 rounded-full transition-transform md:w-20 md:h-20 ${
          isActive('/teams')
            ? 'bg-tertiary-fixed text-primary'
            : 'text-primary/60 hover:text-primary transition-colors'
        }`}
      >
        <Users className={`w-5 h-5 ${isActive('/teams') ? 'stroke-[2.5]' : 'stroke-[2]'}`} />
        <span className="text-[10px] font-bold uppercase tracking-wider md:text-xs">Teams</span>
        {pendingTeamRequestsCount > 0 && (
          <span className="absolute -top-0.5 right-0 min-w-5 h-5 px-1 rounded-full bg-secondary-container text-white text-[10px] font-extrabold leading-none inline-flex items-center justify-center shadow-sm">
            {pendingTeamRequestsCount > 9 ? '9+' : pendingTeamRequestsCount}
          </span>
        )}
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

      {authNavItem}
    </nav>
  )
}
