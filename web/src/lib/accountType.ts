export type AccountType = 'player' | 'coach' | 'facility' | 'operator' | 'admin'

export const ACCOUNT_TYPE_STORAGE_KEY = 'sportbook-account-type-v1'

export const accountTypeOptions: Array<{ value: AccountType; label: string }> = [
  { value: 'player', label: 'Player' },
  { value: 'coach', label: 'Coach' },
  { value: 'facility', label: 'Facility' },
  { value: 'operator', label: 'Operator' },
  { value: 'admin', label: 'Admin' },
]

function canUseStorage() {
  return typeof window !== 'undefined'
}

function isAccountType(value: string): value is AccountType {
  return value === 'player' || value === 'coach' || value === 'facility' || value === 'operator' || value === 'admin'
}

export function getActiveAccountType(): AccountType {
  if (!canUseStorage()) return 'player'

  const raw = window.localStorage.getItem(ACCOUNT_TYPE_STORAGE_KEY)
  if (!raw) {
    window.localStorage.setItem(ACCOUNT_TYPE_STORAGE_KEY, 'player')
    return 'player'
  }

  if (isAccountType(raw)) return raw

  window.localStorage.setItem(ACCOUNT_TYPE_STORAGE_KEY, 'player')
  return 'player'
}

export function setActiveAccountType(value: AccountType) {
  if (!canUseStorage()) return

  window.localStorage.setItem(ACCOUNT_TYPE_STORAGE_KEY, value)
}

export function getPostLoginRouteForAccountType(value: AccountType) {
  if (value === 'admin') return '/admin/dashboard'
  if (value === 'coach') return '/coach/dashboard'
  if (value === 'operator') return '/operator/dashboard'
  if (value === 'facility') return '/dashboard/facility'
  return '/'
}
