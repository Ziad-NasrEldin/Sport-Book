'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getActiveAccountType, AccountType } from '@/lib/accountType'

export function useAdminAuth() {
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(() => {
    if (typeof window === 'undefined') return false
    return getActiveAccountType() === 'admin'
  })

  useEffect(() => {
    const currentAccountType = getActiveAccountType()
    const isUserAdmin = currentAccountType === 'admin'
    setIsAdmin(isUserAdmin)

    if (!isUserAdmin) {
      router.push('/auth/sign-in')
    }
  }, [router])

  return isAdmin
}
