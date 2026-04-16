export type RequestedRole = 'coach' | 'facility'
export type RoleUpgradeRequestStatus = 'pending' | 'approved' | 'rejected' | 'needs-info'

export type RoleUpgradeRequest = {
  id: string
  requestedRole: RequestedRole
  fullName: string
  email: string
  phone: string
  city: string
  experienceYears?: number
  specialization?: string
  certifications?: string
  facilityName?: string
  registrationNumber?: string
  facilityAddress?: string
  requestMessage: string
  status: RoleUpgradeRequestStatus
  submittedAt: string
  reviewedAt?: string
}

const STORAGE_KEY = 'sportbook-role-upgrade-requests-v1'
export const ROLE_UPGRADE_REQUESTS_UPDATED_EVENT = 'sportbook-role-upgrade-requests-updated'
const ROLE_REQUEST_CASE_PREFIX = 'RQ-'

function canUseStorage() {
  return typeof window !== 'undefined'
}

function createId() {
  return `req-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function normalizeRoleUpgradeRequest(raw: RoleUpgradeRequest): RoleUpgradeRequest {
  return {
    ...raw,
    status: raw.status ?? 'pending',
  }
}

function saveRoleUpgradeRequests(requests: RoleUpgradeRequest[]) {
  if (!canUseStorage()) return

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(requests))
  window.dispatchEvent(new Event(ROLE_UPGRADE_REQUESTS_UPDATED_EVENT))
}

export function roleRequestCaseIdFromRequestId(requestId: string) {
  return `${ROLE_REQUEST_CASE_PREFIX}${requestId}`
}

export function roleRequestIdFromCaseId(caseId: string) {
  if (!caseId.startsWith(ROLE_REQUEST_CASE_PREFIX)) return null

  const requestId = caseId.slice(ROLE_REQUEST_CASE_PREFIX.length)
  return requestId.length > 0 ? requestId : null
}

export function getRoleUpgradeRequests(): RoleUpgradeRequest[] {
  if (!canUseStorage()) return []

  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) return []

  try {
    const parsed = JSON.parse(raw) as RoleUpgradeRequest[]
    if (!Array.isArray(parsed)) return []
    return parsed.map(normalizeRoleUpgradeRequest)
  } catch {
    return []
  }
}

export function addRoleUpgradeRequest(
  payload: Omit<RoleUpgradeRequest, 'id' | 'submittedAt' | 'status' | 'reviewedAt'>,
): RoleUpgradeRequest {
  const nextRequest: RoleUpgradeRequest = {
    ...payload,
    id: createId(),
    status: 'pending',
    submittedAt: new Date().toISOString(),
  }

  if (!canUseStorage()) {
    return nextRequest
  }

  const current = getRoleUpgradeRequests()
  const next = [nextRequest, ...current]
  saveRoleUpgradeRequests(next)

  return nextRequest
}

export function setRoleUpgradeRequestStatus(
  requestId: string,
  status: RoleUpgradeRequestStatus,
): { ok: true } | { ok: false; error: string } {
  if (!canUseStorage()) {
    return { ok: false, error: 'Storage is unavailable in this environment.' }
  }

  const current = getRoleUpgradeRequests()
  const target = current.find((entry) => entry.id === requestId)

  if (!target) {
    return { ok: false, error: 'Request not found.' }
  }

  const next = current.map((entry) => {
    if (entry.id !== requestId) return entry

    return {
      ...entry,
      status,
      reviewedAt: status === 'pending' ? undefined : new Date().toISOString(),
    }
  })

  saveRoleUpgradeRequests(next)
  return { ok: true }
}
