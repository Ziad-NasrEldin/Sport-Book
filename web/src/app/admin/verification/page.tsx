'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { Check, FileSearch, X } from 'lucide-react'
import { AdminFilterBar } from '@/components/admin/AdminFilterBar'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { AdminPanel } from '@/components/admin/AdminPanel'
import { AdminStatusPill } from '@/components/admin/AdminStatusPill'
import { SkeletonList } from '@/components/ui/SkeletonLoader'
import { useApiCall, useApiMutation } from '@/lib/api/hooks'
import { APIErrorFallback } from '@/components/ui/ErrorBoundary'
import { statusTone } from '@/lib/admin/ui'

type Decision = 'APPROVED' | 'REJECTED' | null

const statusFilters = ['All', 'PENDING', 'APPROVED', 'REJECTED'] as const

function getRiskLevel(requestedRole: string): 'Low' | 'Medium' | 'High' {
  // Simple risk assessment based on role type
  if (requestedRole === 'COACH') return 'Low'
  if (requestedRole === 'OPERATOR') return 'Medium'
  return 'Medium'
}

function getRiskTone(risk: 'Low' | 'Medium' | 'High'): 'green' | 'amber' | 'red' {
  if (risk === 'Low') return 'green'
  if (risk === 'Medium') return 'amber'
  return 'red'
}

export default function AdminVerificationPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<(typeof statusFilters)[number]>('All')
  const [feedback, setFeedback] = useState('')

  const { data: roleUpgrades, loading, error, refetch } = useApiCall('/admin-workspace/role-upgrades')
  const respondMutation = useApiMutation('/admin-workspace/role-upgrades/:id/respond', 'POST')

  const roleUpgradeRequests = roleUpgrades?.data || roleUpgrades || []

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase()

    return roleUpgradeRequests.filter((item: any) => {
      const matchesSearch =
        query.length === 0 ||
        item.userId?.toLowerCase()?.includes(query) ||
        item.requestedRole?.toLowerCase()?.includes(query) ||
        item.id?.toLowerCase()?.includes(query)
      const matchesStatus = statusFilter === 'All' || item.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [roleUpgradeRequests, statusFilter, search])

  const handleDecision = async (item: any, decision: 'APPROVED' | 'REJECTED') => {
    try {
      await respondMutation.mutate({ id: item.id, status: decision })
      setFeedback(`Decision saved for ${item.userId}: ${decision}.`)
      refetch()
    } catch (err) {
      setFeedback('Failed to save decision. Please try again.')
    }
  }

  if (error) {
    return <APIErrorFallback error={error} onRetry={() => window.location.reload()} />
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
            {roleUpgradeRequests.length} role upgrade request{roleUpgradeRequests.length > 1 ? 's' : ''} pending review.
          </p>
        ) : null}

        <AdminFilterBar
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search by user id, role, or request id"
          controls={
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as (typeof statusFilters)[number])}
              className="rounded-full bg-surface-container-low px-3 py-2 text-xs font-lexend font-bold uppercase tracking-[0.12em] text-primary outline-none"
            >
              {statusFilters.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          }
        />

        <div className="mt-4 grid grid-cols-1 xl:grid-cols-2 gap-3">
          {loading ? (
            <SkeletonList items={6} />
          ) : filteredItems.length === 0 ? (
            <div className="col-span-full text-center py-8 text-sm text-primary/60">
              No verification requests found.
            </div>
          ) : (
            filteredItems.map((item: any) => {
              const riskLevel = getRiskLevel(item.requestedRole)

              return (
                <article key={item.id} className="rounded-[var(--radius-md)] bg-surface-container-low p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-lg font-extrabold text-primary">{item.userId}</p>
                      <p className="text-sm text-primary/65 mt-1">{item.requestedRole}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <AdminStatusPill label={riskLevel} tone={getRiskTone(riskLevel)} />
                      <AdminStatusPill label={item.status} tone={statusTone(item.status)} />
                    </div>
                  </div>

                  <div className="mt-3 text-xs text-primary/60 space-y-1">
                    <p>Request ID: {item.id}</p>
                    <p>Submitted: {new Date(item.createdAt).toLocaleString()}</p>
                  </div>

                  {item.status === 'PENDING' && (
                    <div className="mt-4 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        disabled={respondMutation.loading}
                        className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-2 text-xs font-lexend font-bold uppercase tracking-[0.12em] text-emerald-700 disabled:opacity-50"
                        onClick={() => handleDecision(item, 'APPROVED')}
                      >
                        <Check className="w-3.5 h-3.5" />
                        Approve
                      </button>
                      <button
                        type="button"
                        disabled={respondMutation.loading}
                        className="inline-flex items-center gap-1.5 rounded-full bg-red-500/15 px-3 py-2 text-xs font-lexend font-bold uppercase tracking-[0.12em] text-red-700 disabled:opacity-50"
                        onClick={() => handleDecision(item, 'REJECTED')}
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
                  )}
                </article>
              )
            })
          )}
        </div>
      </AdminPanel>
    </div>
  )
}
