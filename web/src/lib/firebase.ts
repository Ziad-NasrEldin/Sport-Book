"use client"

import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app'
import {
  FacebookAuthProvider,
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  type AuthProvider,
} from 'firebase/auth'

export type SocialProvider = 'google' | 'facebook'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

export function hasFirebaseConfig(): boolean {
  return Object.values(firebaseConfig).every(Boolean)
}

function getFirebaseApp(): FirebaseApp {
  if (!hasFirebaseConfig()) {
    throw new Error('Firebase authentication is not configured')
  }

  return getApps().length > 0 ? getApp() : initializeApp(firebaseConfig)
}

function getProvider(provider: SocialProvider): AuthProvider {
  if (provider === 'facebook') {
    return new FacebookAuthProvider()
  }

  const googleProvider = new GoogleAuthProvider()
  googleProvider.setCustomParameters({ prompt: 'select_account' })
  return googleProvider
}

export async function getSocialIdToken(provider: SocialProvider): Promise<string> {
  const auth = getAuth(getFirebaseApp())
  const result = await signInWithPopup(auth, getProvider(provider))
  return result.user.getIdToken()
}
