'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { Check, FileSearch, X } from 'lucide-react'
import { AdminFilterBar } from '@/components/admin/AdminFilterBar'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { AdminPanel } from '@/components/admin/AdminPanel'
import { AdminStatusPill } from '@/components/admin/AdminStatusPill'
import { verificationQueue } from '@/lib/admin/mockData'
import { riskTone, statusTone } from '@/lib/admin/ui'
import {
  getRoleUpgradeRequests,
  roleRequestCaseIdFromRequestId,
  ROLE_UPGRADE_REQUESTS_UPDATED_EVENT,
  RoleUpgradeRequest,
  RoleUpgradeRequestStatus,
  setRoleUpgradeRequestStatus,
} from '@/lib/roleUpgradeRequests'

type Decision = 'Approved' | 'Rejected' | null

type QueueState = {
  id: string
  decision: Decision
}

type VerificationQueueItem = (typeof verificationQueue)[number] & {
  source: 'mock' | 'role-request'
  roleRequestId?: string
  roleRequestStatus?: RoleUpgradeRequestStatus
}

const riskFilters = ['All', 'Low', 'Medium', 'High'] as const

function roleRequestStatusToDecision(status: RoleUpgradeRequestStatus): Decision {
  if (status === 'approved') return 'Approved'
  if (status === 'rejected') return 'Rejected'
  return null
}

function roleRequestStatusToLabel(status: RoleUpgradeRequestStatus): string {
  if (status === 'approved') return 'Approved'
  if (status === 'rejected') return 'Rejected'
  if (status === 'needs-info') return 'Needs Info'
  return 'Pending Review'
}

function decisionToRoleRequestStatus(decision: Decision): RoleUpgradeRequestStatus | null {
  if (decision === 'Approved') return 'approved'
  if (decision === 'Rejected') return 'rejected'
  return null
}

function mapRoleRequestToVerificationItem(request: RoleUpgradeRequest): VerificationQueueItem {
  return {
    id: roleRequestCaseIdFromRequestId(request.id),
    entity: request.requestedRole === 'facility' ? request.facilityName || request.fullName : request.fullName,
    type: request.requestedRole === 'coach' ? 'Coach ID' : 'Business Registration',
    submittedAt: new Date(request.submittedAt).toLocaleString(),
    riskLevel: 'Medium',
    region: request.city,
    source: 'role-request',
    roleRequestId: request.id,
    roleRequestStatus: request.status,
  }
}

export default function AdminVerificationPage() {
  const [search, setSearch] = useState('')
  const [riskFilter, setRiskFilter] = useState<(typeof riskFilters)[number]>('All')
  const [decisionMap, setDecisionMap] = useState<QueueState[]>([])
  const [feedback, setFeedback] = useState('')
  const [roleUpgradeRequests, setRoleUpgradeRequests] = useState<RoleUpgradeRequest[]>([])

  useEffect(() => {
    const syncRoleRequests = () => {
      setRoleUpgradeRequests(getRoleUpgradeRequests())
    }

    syncRoleRequests()
    window.addEventListener(ROLE_UPGRADE_REQUESTS_UPDATED_EVENT, syncRoleRequests)
    window.addEventListener('storage', syncRoleRequests)

    return () => {
      window.removeEventListener(ROLE_UPGRADE_REQUESTS_UPDATED_EVENT, syncRoleRequests)
      window.removeEventListener('storage', syncRoleRequests)
    }
  }, [])

  const allVerificationItems = useMemo<VerificationQueueItem[]>(() => {
    const roleRequestItems = roleUpgradeRequests.map(mapRoleRequestToVerificationItem)
    const staticItems = verificationQueue.map((item) => ({ ...item, source: 'mock' as const }))

    return [...roleRequestItems, ...staticItems]
  }, [roleUpgradeRequests])

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase()

    return allVerificationItems.filter((item) => {
      const matchesSearch =
        query.length === 0 ||
        item.entity.toLowerCase().includes(query) ||
        item.type.toLowerCase().includes(query) ||
        item.id.toLowerCase().includes(query)
      const matchesRisk = riskFilter === 'All' || item.riskLevel === riskFilter

      return matchesSearch && matchesRisk
    })
  }, [allVerificationItems, riskFilter, search])

  const getDecision = (item: VerificationQueueItem): Decision => {
    if (item.source === 'role-request' && item.roleRequestStatus) {
      return roleRequestStatusToDecision(item.roleRequestStatus)
    }

    return decisionMap.find((entry) => entry.id === item.id)?.decision ?? null
  }

  const setDecision = (item: VerificationQueueItem, decision: Decision) => {
    if (item.source === 'role-request' && item.roleRequestId) {
      const nextStatus = decisionToRoleRequestStatus(decision)

      if (!nextStatus) {
        setFeedback('Could not apply this decision.')
        return
      }

      const result = setRoleUpgradeRequestStatus(item.roleRequestId, nextStatus)
      if (!result.ok) {
        setFeedback(result.error)
        return
      }

      setFeedback(`Decision saved for ${item.entity}: ${decision}.`)
      return
    }

    setDecisionMap((prev) => {
      const existing = prev.find((entry) => entry.id === item.id)
      if (existing) {
        return prev.map((entry) => (entry.id === item.id ? { ...entry, decision } : entry))
      }

      return [...prev, { id: item.id, decision }]
    })

    setFeedback(`Decision recorded for ${item.entity}: ${decision}.`)
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Verification Queue"
        subtitle="Review legal documents, identity records, and account ownership details before enabling account privileges."
      />

      <AdminPanel eyebrow="Risk pipeline" title="Verification Cases">
        {feedback ? (
          <div className="mb-3 rounded-[var(--radius-default)] bg-tertiary-fixed px-3.5 py-2.5 text-sm font-semibold text-primary">
            {feedback}
          </div>
        ) : null}

        {roleUpgradeRequests.length > 0 ? (
          <p className="mb-3 text-xs text-primary/60">
            Includes {roleUpgradeRequests.length} coach/facility request
            {roleUpgradeRequests.length > 1 ? 's' : ''} from auth submissions.
          </p>
        ) : null}

        <AdminFilterBar
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search by queue id, entity, or document type"
          controls={
            <select
              value={riskFilter}
              onChange={(event) => setRiskFilter(event.target.value as (typeof riskFilters)[number])}
              className="rounded-full bg-surface-container-low px-3 py-2 text-xs font-lexend font-bold uppercase tracking-[0.12em] text-primary outline-none"
            >
              {riskFilters.map((risk) => (
                <option key={risk} value={risk}>
                  {risk} risk
                </option>
              ))}
            </select>
          }
        />

        <div className="mt-4 grid grid-cols-1 xl:grid-cols-2 gap-3">
          {filteredItems.map((item) => {
            const decision = getDecision(item)

            return (
              <article key={item.id} className="rounded-[var(--radius-md)] bg-surface-container-low p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-extrabold text-primary">{item.entity}</p>
                    <p className="text-sm text-primary/65 mt-1">{item.type}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <AdminStatusPill label={item.riskLevel} tone={riskTone(item.riskLevel)} />
                    {item.source === 'role-request' && item.roleRequestStatus ? (
                      <AdminStatusPill
                        label={roleRequestStatusToLabel(item.roleRequestStatus)}
                        tone={statusTone(roleRequestStatusToLabel(item.roleRequestStatus))}
                      />
                    ) : null}
                  </div>
                </div>

                <div className="mt-3 text-xs text-primary/60 space-y-1">
                  <p>Queue ID: {item.id}</p>
                  <p>Region: {item.region}</p>
                  <p>Submitted: {item.submittedAt}</p>
                </div>

                <div className="mt-4 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-2 text-xs font-lexend font-bold uppercase tracking-[0.12em] text-emerald-700"
                    onClick={() => setDecision(item, 'Approved')}
                  >
                    <Check className="w-3.5 h-3.5" />
                    Approve
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 rounded-full bg-red-500/15 px-3 py-2 text-xs font-lexend font-bold uppercase tracking-[0.12em] text-red-700"
                    onClick={() => setDecision(item, 'Rejected')}
                  >
                    <X className="w-3.5 h-3.5" />
                    Reject
                  </button>
                  <Link
                    href={`/admin/verification/${encodeURIComponent(item.id)}`}
                    className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-2 text-xs font-lexend font-bold uppercase tracking-[0.12em] text-primary"
                  >
                    <FileSearch className="w-3.5 h-3.5" />
                    Preview
                  </Link>
                </div>

                {decision ? (
                  <p className="mt-3 text-xs font-semibold text-primary/75">Decision recorded: {decision}</p>
                ) : null}
              </article>
            )
          })}
        </div>
      </AdminPanel>
    </div>
  )
}
