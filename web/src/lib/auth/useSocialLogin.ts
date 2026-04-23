"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { api, setAccessToken } from '@/lib/api/client'
import { getPostLoginRoute, type SessionUser } from '@/lib/auth/session'
import { getSocialIdToken, hasFirebaseConfig, type SocialProvider } from '@/lib/firebase'

type SocialLoginResponse = {
  user: SessionUser
  accessToken: string
}

export function useSocialLogin() {
  const router = useRouter()
  const [providerLoading, setProviderLoading] = useState<SocialProvider | null>(null)

  const signInWithSocialProvider = async (provider: SocialProvider) => {
    if (!hasFirebaseConfig()) {
      throw new Error('Firebase authentication is not configured')
    }

    setProviderLoading(provider)

    try {
      const idToken = await getSocialIdToken(provider)
      const result = await api.post<SocialLoginResponse>('/auth/social-login', {
        provider,
        idToken,
      })

      setAccessToken(result.accessToken)
      router.push(getPostLoginRoute(result.user.role))
      router.refresh()
    } finally {
      setProviderLoading(null)
    }
  }

  return {
    firebaseConfigured: hasFirebaseConfig(),
    providerLoading,
    signInWithSocialProvider,
  }
}
