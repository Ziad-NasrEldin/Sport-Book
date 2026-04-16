'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api/client'

export function useOperatorAuth() {
  const router = useRouter()

  useEffect(() => {
    api
      .get<{ role: string }>('/users/me')
      .then((user) => {
        if ((user.role as string).toUpperCase() !== 'OPERATOR') {
          router.push('/auth/sign-in')
        }
      })
      .catch(() => router.push('/auth/sign-in'))
  }, [router])
}
