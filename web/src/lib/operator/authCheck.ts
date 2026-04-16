'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getActiveAccountType } from '@/lib/accountType'

const ACCOUNT_TYPE_KEY = 'sportbook-account-type-v1'

export function useOperatorAuth() {
  const router = useRouter()

  useEffect(() => {
    const accountType = getActiveAccountType()

    if (accountType !== 'operator') {
      router.push('/auth/sign-in')
    }
  }, [router])
}
