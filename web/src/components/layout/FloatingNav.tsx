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

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/teams', label: 'Teams', icon: Users, badge: pendingTeamRequestsCount },
    { path: '/store', label: 'Store', icon: Store },
    { path: '/coaches', label: 'Coaches', icon: Medal },
  ]

  return (
    <>
      {/* MOBILE: Floating bottom nav */}
      <nav
        className="md:hidden fixed left-1/2 -translate-x-1/2 w-[calc(100%-3rem)] max-w-[420px] bg-[#0a1631]/95 backdrop-blur-[20px] rounded-full px-2 py-2 flex items-center justify-between z-50"
        style={{ bottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
      >
        {navItems.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className={`relative flex flex-col items-center justify-center gap-1 w-16 h-16 rounded-full transition-all duration-200 ${
              isActive(item.path)
                ? 'bg-[#c3f400] text-[#0a1631]'
                : 'text-white/60 hover:text-white hover:bg-white/10'
            }`}
          >
            <item.icon className={`w-5 h-5 ${isActive(item.path) ? 'stroke-[2.5]' : 'stroke-[2]'}`} />
            <span className="text-[10px] font-black uppercase tracking-wider">{item.label}</span>
            {item.badge ? (
              <span className="absolute -top-1 right-0 min-w-5 h-5 px-1 bg-[#c3f400] text-[#0a1631] text-[10px] font-black leading-none inline-flex items-center justify-center rounded-full">
                {item.badge > 9 ? '9+' : item.badge}
              </span>
            ) : null}
          </Link>
        ))}

        {isAuthenticated ? (
          <Link
            href="/profile"
            className={`flex flex-col items-center justify-center gap-1 w-16 h-16 rounded-full transition-all duration-200 ${
              isActive('/profile')
                ? 'bg-[#c3f400] text-[#0a1631]'
                : 'text-white/60 hover:text-white hover:bg-white/10'
            }`}
          >
            <User className={`w-5 h-5 ${isActive('/profile') ? 'stroke-[2.5]' : 'stroke-[2]'}`} />
            <span className="text-[10px] font-black uppercase tracking-wider">Profile</span>
          </Link>
        ) : (
          <button
            type="button"
            onClick={requireAuth}
            className={`flex flex-col items-center justify-center gap-1 w-16 h-16 rounded-full transition-all duration-200 ${
              pathname === '/auth/sign-in' || pathname === '/auth/sign-up'
                ? 'bg-[#c3f400] text-[#0a1631]'
                : 'text-white/60 hover:text-white hover:bg-white/10'
            }`}
          >
            <LogIn className={`w-5 h-5 ${(pathname === '/auth/sign-in' || pathname === '/auth/sign-up') ? 'stroke-[2.5]' : 'stroke-[2]'}`} />
            <span className="text-[10px] font-black uppercase tracking-wider">Sign In</span>
          </button>
        )}
      </nav>

      {/* DESKTOP: Floating top nav pill */}
      <div className="hidden md:block h-20" />
      <nav className="hidden md:flex fixed top-6 left-1/2 -translate-x-1/2 bg-[#0a1631]/95 backdrop-blur-[20px] rounded-full px-3 py-2 items-center z-50 border border-white/10 shadow-2xl">
        <div className="flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`relative inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-black uppercase tracking-wide transition-all duration-200 ${
                isActive(item.path)
                  ? 'bg-[#c3f400] text-[#0a1631]'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <item.icon className={`w-4 h-4 ${isActive(item.path) ? 'stroke-[2.5]' : 'stroke-[2]'}`} />
              {item.label}
              {item.badge ? (
                <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 bg-[#c3f400] text-[#0a1631] text-[10px] font-black leading-none inline-flex items-center justify-center rounded-full">
                  {item.badge > 9 ? '9+' : item.badge}
                </span>
              ) : null}
            </Link>
          ))}

          {isAuthenticated ? (
            <Link
              href="/profile"
              className={`relative inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-black uppercase tracking-wide transition-all duration-200 ml-1 ${
                isActive('/profile')
                  ? 'bg-[#c3f400] text-[#0a1631]'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <User className={`w-4 h-4 ${isActive('/profile') ? 'stroke-[2.5]' : 'stroke-[2]'}`} />
              Profile
            </Link>
          ) : (
            <button
              type="button"
              onClick={requireAuth}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-black uppercase tracking-wide transition-all duration-200 ml-1 ${
                pathname === '/auth/sign-in' || pathname === '/auth/sign-up'
                  ? 'bg-[#c3f400] text-[#0a1631]'
                  : 'bg-white/10 text-white hover:bg-[#c3f400] hover:text-[#0a1631]'
              }`}
            >
              <LogIn className={`w-4 h-4 ${(pathname === '/auth/sign-in' || pathname === '/auth/sign-up') ? 'stroke-[2.5]' : 'stroke-[2]'}`} />
              Sign In
            </button>
          )}
        </div>
      </nav>
    </>
  )
}
