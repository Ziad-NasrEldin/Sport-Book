import { env } from '@config/env'
import { ApiError, UnauthorizedError } from '@common/errors'
import { cert, getApps, initializeApp, type App } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'

const PROVIDER_TO_FIREBASE_ID = {
  google: 'google.com',
  facebook: 'facebook.com',
} as const

export type SocialProvider = keyof typeof PROVIDER_TO_FIREBASE_ID

export interface VerifiedSocialIdentity {
  uid: string
  email: string | null
  emailVerified: boolean
  name: string | null
  picture: string | null
}

function getFirebaseAdminApp(): App {
  const existingApp = getApps()[0]
  if (existingApp) {
    return existingApp
  }

  const { FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY } = env
  if (!FIREBASE_PROJECT_ID || !FIREBASE_CLIENT_EMAIL || !FIREBASE_PRIVATE_KEY) {
    throw new ApiError('Social authentication is not configured', 'SOCIAL_AUTH_NOT_CONFIGURED', 503)
  }

  return initializeApp({
    credential: cert({
      projectId: FIREBASE_PROJECT_ID,
      clientEmail: FIREBASE_CLIENT_EMAIL,
      privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
  })
}

export async function verifyFirebaseSocialIdToken(
  provider: SocialProvider,
  idToken: string
): Promise<VerifiedSocialIdentity> {
  const app = getFirebaseAdminApp()
  const decodedToken = await getAuth(app).verifyIdToken(idToken)

  const firebaseProvider = decodedToken.firebase?.sign_in_provider
  const expectedProvider = PROVIDER_TO_FIREBASE_ID[provider]

  if (firebaseProvider !== expectedProvider) {
    throw new UnauthorizedError('Social provider does not match token provider')
  }

  return {
    uid: decodedToken.uid,
    email: decodedToken.email ?? null,
    emailVerified: decodedToken.email_verified ?? false,
    name: decodedToken.name ?? null,
    picture: decodedToken.picture ?? null,
  }
}
