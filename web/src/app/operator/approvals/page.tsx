'use client'

import { useCallback, useMemo, useState } from 'react'
import { CheckCircle2, Download, XCircle } from 'lucide-react'
import { AdminFilterBar } from '@/components/admin/AdminFilterBar'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { AdminPanel } from '@/components/admin/AdminPanel'
import { AdminStatusPill, type Tone } from '@/components/admin/AdminStatusPill'
import { AdminTable } from '@/components/admin/AdminTable'
import { SkeletonTable } from '@/components/ui/SkeletonLoader'
import { useApiCall, useApiMutation } from '@/lib/api/hooks'
import { APIErrorFallback } from '@/components/ui/ErrorBoundary'
import { statusTone } from '@/lib/admin/ui'
import { exportToCsv } from '@/lib/export'
import type { ApprovalRecord, ApprovalPriority, ApprovalStatus } from '@/lib/operator/mockData'
import { AppSelect } from '@/components/ui/AppSelect'

const statusOptions = ['All', 'Pending', 'Approved', 'Rejected'] as const
const priorityOptions = ['All', 'Low', 'Medium', 'High'] as const

type StatusFilter = (typeof statusOptions)[number]
type PriorityFilter = (typeof priorityOptions)[number]
type ApprovalDecision = Exclude<StatusFilter, 'All'>

function priorityTone(priority: string): Tone {
  if (priority === 'High' || priority === 'HIGH') return 'red'
  if (priority === 'Medium' || priority === 'MEDIUM') return 'amber'
  if (priority === 'Low' || priority === 'LOW') return 'blue'
  return 'violet'
}

export default function OperatorApprovalsPage() {
  const [search, setSearch] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<StatusFilter>('All')
  const [selectedPriority, setSelectedPriority] = useState<PriorityFilter>('All')

  const { data: approvalsResponse, loading, error, refetch } = useApiCall('/operator/approvals')
  const { data: branchesResponse } = useApiCall('/operator/branches')

  const handleStatusChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedStatus(event.target.value as StatusFilter)
  }, [])

  const handlePriorityChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedPriority(event.target.value as PriorityFilter)
  }, [])

  const approvalsData = approvalsResponse?.data || approvalsResponse || []
  const branchesData = branchesResponse?.data || branchesResponse || []

  const updateStatusMutation = useApiMutation('/operator/approvals/:id/status', 'PUT')

  const getBranchNameById = (id: string) => {
    const branch = branchesData.find((b: any) => b.id === id)
    return branch?.name || 'Unknown'
  }

  const visibleRequests = useMemo(() => {
    const query = search.trim().toLowerCase()

    return approvalsData.filter((request: any) => {
      const matchesSearch =
        query.length === 0 ||
        request.id?.toLowerCase()?.includes(query) ||
        request.subject?.toLowerCase()?.includes(query) ||
        request.requestedBy?.toLowerCase()?.includes(query)

      const matchesStatus = selectedStatus === 'All' || request.status === selectedStatus
      const matchesPriority = selectedPriority === 'All' || request.priority === selectedPriority

      return matchesSearch && matchesStatus && matchesPriority
    })
  }, [approvalsData, search, selectedStatus, selectedPriority])

  if (error) {
    return <APIErrorFallback error={error} onRetry={() => window.location.reload()} />
  }

  const updateStatus = async (id: string, status: string) => {
    try {
      await updateStatusMutation.mutate({ id, status })
      refetch()
    } catch (err) {
      console.error('Failed to update status:', err)
    }
  }

  return (
    <div className="space-y-6 motion-safe:animate-[var(--animate-fade-in)]">
      <AdminPageHeader
        title="Approvals Center"
        subtitle="Review branch-level exceptions, discount overrides, and operational requests with fast approve/reject workflows."
        className="motion-safe:animate-[var(--animate-soft-drop)]"
        actions={
          <button
            type="button"
            onClick={() => {
              const headers = ['ID', 'Subject', 'Type', 'Requested By', 'Branch', 'Priority', 'Status', 'Submitted At']
              const rows = visibleRequests.map((r: any) => [
                r.id || '',
                r.subject || '',
                r.type || '',
                r.requestedBy || '',
                getBranchNameById(r.branchId),
                r.priority || '',
                r.status || '',
                r.submittedAt ? new Date(r.submittedAt).toLocaleString() : '',
              ])
              exportToCsv('approvals-queue.csv', headers, rows)
            }}
className="inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-surface-container-low to-surface-container-high px-4 py-2 text-sm font-bold text-primary shadow-[0_8px_24px_-12px_rgba(0,17,58,0.6)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_32px_-14px_rgba(0,17,58,0.85)] active:translate-y-0 motion-safe:hover:scale-[1.03] motion-safe:active:scale-[0.97]"
          >
            <Download className="w-4 h-4" />
            Export Queue
          </button>
        }
      />

      <AdminPanel eyebrow="Moderation" title="Approval Requests" className="motion-safe:animate-[var(--animate-soft-rise)] animation-delay-100">
        <AdminFilterBar
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search by request id, requester, or subject"
          controls={
            <>
              <AppSelect
                value={selectedStatus}
                onChange={handleStatusChange}
                className="rounded-full bg-gradient-to-br from-surface-container-low to-surface-container-high px-3 py-2 text-xs font-lexend font-black uppercase tracking-[0.12em] text-primary outline-none shadow-[0_4px_12px_-8px_rgba(0,17,58,0.3)] transition-colors hover:shadow-[0_8px_16px_-10px_rgba(0,17,58,0.4)]"
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </AppSelect>

              <AppSelect
                value={selectedPriority}
                onChange={handlePriorityChange}
                className="rounded-full bg-gradient-to-br from-surface-container-low to-surface-container-high px-3 py-2 text-xs font-lexend font-black uppercase tracking-[0.12em] text-primary outline-none shadow-[0_4px_12px_-8px_rgba(0,17,58,0.3)] transition-colors hover:shadow-[0_8px_16px_-10px_rgba(0,17,58,0.4)]"
              >
                {priorityOptions.map((priority) => (
                  <option key={priority} value={priority}>
                    {priority}
                  </option>
                ))}
              </AppSelect>
            </>
          }
        />

        <div className="mt-4 motion-safe:animate-[var(--animate-fade-in)] animation-delay-150">
          {loading ? (
            <SkeletonTable rows={10} />
          ) : (
            <AdminTable
              items={visibleRequests}
              getRowKey={(request: any) => request.id}
              columns={[
                {
                  key: 'request',
                  header: 'Request',
                  render: (request: any) => (
                    <div>
                      <p className="font-black text-primary">{request.subject || 'Unknown'}</p>
                      <p className="text-xs text-primary/60 mt-1">{request.id || 'Unknown'} • {request.type || 'Unknown'}</p>
                    </div>
                  ),
                },
                {
                  key: 'requester',
                  header: 'Requested By',
                  render: (request: any) => (
                    <div>
                      <p className="text-sm font-bold text-primary">{request.requestedBy || 'Unknown'}</p>
                      <p className="text-xs text-primary/55 mt-1">{new Date(request.submittedAt).toLocaleString()}</p>
                    </div>
                  ),
                },
                {
                  key: 'branch',
                  header: 'Branch',
                  render: (request: any) => <p className="text-sm text-primary/75">{getBranchNameById(request.branchId)}</p>,
                },
                {
                  key: 'priority',
                  header: 'Priority',
                  render: (request: any) => <AdminStatusPill label={request.priority || 'Unknown'} tone={priorityTone(request.priority || 'Low')} />,
                },
                {
                  key: 'status',
                  header: 'Status',
                  render: (request: any) => <AdminStatusPill label={request.status || 'Unknown'} tone={statusTone(request.status || 'Unknown')} />,
                },
                {
                  key: 'action',
                  header: 'Action',
                  render: (request: any) => (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => updateStatus(request.id, 'APPROVED')}
                        disabled={updateStatusMutation.loading}
                        className="inline-flex items-center gap-1 rounded-full bg-gradient-to-br from-emerald-500/15 to-emerald-500/22 px-3 py-1.5 text-[10px] font-lexend font-black uppercase tracking-[0.12em] text-emerald-700 shadow-[0_6px_16px_-10px_rgba(16,185,129,0.5)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_24px_-12px_rgba(16,185,129,0.7)] disabled:opacity-50 disabled:hover:translate-y-0 motion-safe:hover:scale-[1.03]"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => updateStatus(request.id, 'REJECTED')}
                        disabled={updateStatusMutation.loading}
                        className="inline-flex items-center gap-1 rounded-full bg-gradient-to-br from-rose-500/15 to-rose-500/22 px-3 py-1.5 text-[10px] font-lexend font-black uppercase tracking-[0.12em] text-rose-700 shadow-[0_6px_16px_-10px_rgba(244,63,94,0.5)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_24px_-12px_rgba(244,63,94,0.7)] disabled:opacity-50 disabled:hover:translate-y-0 motion-safe:hover:scale-[1.03]"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Reject
                      </button>
                    </div>
                  ),
                },
              ]}
            />
          )}
        </div>
      </AdminPanel>
    </div>
  )
}


