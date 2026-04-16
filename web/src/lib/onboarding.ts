export const ONBOARDING_COMPLETED_STORAGE_KEY = 'kinetic:onboarding-completed'

export function hasCompletedOnboarding(): boolean {
  if (typeof window === 'undefined') return false

  try {
    return window.localStorage.getItem(ONBOARDING_COMPLETED_STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

export function markOnboardingCompleted() {
  if (typeof window === 'undefined') return

  try {
    window.localStorage.setItem(ONBOARDING_COMPLETED_STORAGE_KEY, '1')
  } catch {
    // no-op: localStorage may be unavailable in privacy-restricted contexts
  }
}

export function resetOnboardingCompleted() {
  if (typeof window === 'undefined') return

  try {
    window.localStorage.removeItem(ONBOARDING_COMPLETED_STORAGE_KEY)
  } catch {
    // no-op: localStorage may be unavailable in privacy-restricted contexts
  }
}