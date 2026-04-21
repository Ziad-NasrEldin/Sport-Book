'use client'

import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from './session'

const REDIRECT_URL_KEY = 'sportbook-redirect-url'

export function saveRedirectUrl(url?: string) {
  if (typeof window === 'undefined') return
  const target = url || window.location.pathname + window.location.search
  window.sessionStorage.setItem(REDIRECT_URL_KEY, target)
}

export function getRedirectUrl(): string | null {
  if (typeof window === 'undefined') return null
  return window.sessionStorage.getItem(REDIRECT_URL_KEY)
}

export function consumeRedirectUrl(): string | null {
  const url = getRedirectUrl()
  if (url) {
    window.sessionStorage.removeItem(REDIRECT_URL_KEY)
  }
  return url
}

export function useAuth() {
  const { user, loading } = useSession()
  const router = useRouter()

  const isAuthenticated = !!user
  const requireAuth = useCallback(() => {
    saveRedirectUrl()
    router.push('/auth/sign-in')
  }, [router])

  return { user, loading, isAuthenticated, requireAuth }
}