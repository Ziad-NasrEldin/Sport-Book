'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api/client'
import { setActiveAccountType, type AccountType } from '@/lib/accountType'

export interface SessionUser {
  id: string
  email: string
  name: string
  role: string
}

type SupportedRole = 'PLAYER' | 'COACH' | 'OPERATOR' | 'FACILITY' | 'ADMIN'

function normalizeRole(role: string): SupportedRole {
  const upper = role.toUpperCase()

  if (upper === 'ADMIN') return 'ADMIN'
  if (upper === 'COACH') return 'COACH'
  if (upper === 'OPERATOR' || upper === 'FACILITY') return 'OPERATOR'
  return 'PLAYER'
}

function getAccountTypeForRole(role: SupportedRole): AccountType {
  if (role === 'ADMIN') return 'admin'
  if (role === 'COACH') return 'coach'
  if (role === 'OPERATOR') return 'operator'
  return 'player'
}

export function getPostLoginRoute(role: string): string {
  const normalizedRole = normalizeRole(role)

  if (typeof window !== 'undefined') {
    setActiveAccountType(getAccountTypeForRole(normalizedRole))
  }

  if (normalizedRole === 'ADMIN') return '/admin/dashboard'
  if (normalizedRole === 'COACH') return '/coach/dashboard'
  if (normalizedRole === 'OPERATOR') return '/operator/dashboard'
  return '/'
}

export function useSession() {
  const [user, setUser] = useState<SessionUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get<SessionUser>('/users/me')
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  return { user, loading }
}
