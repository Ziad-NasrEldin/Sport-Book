'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api/client'

export function useAdminAuth() {
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    api
      .get<{ role: string }>('/users/me')
      .then((user) => {
        if ((user.role as string).toUpperCase() === 'ADMIN') {
          setIsAdmin(true)
        } else {
          router.push('/auth/sign-in')
        }
      })
      .catch(() => router.push('/auth/sign-in'))
  }, [router])

  return isAdmin
}
