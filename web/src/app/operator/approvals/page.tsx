'use client'

import { useMemo, useState } from 'react'
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

const statusOptions = ['All', 'PENDING', 'APPROVED', 'REJECTED'] as const
const priorityOptions = ['All', 'HIGH', 'MEDIUM', 'LOW'] as const

type StatusFilter = (typeof statusOptions)[number]
type PriorityFilter = (typeof priorityOptions)[number]
type ApprovalDecision = Exclude<StatusFilter, 'All'>

function priorityTone(priority: PriorityFilter): Tone {
  if (priority === 'HIGH') return 'red'
  if (priority === 'MEDIUM') return 'amber'
  if (priority === 'LOW') return 'blue'
  return 'violet'
}

export default function OperatorApprovalsPage() {
  const [search, setSearch] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<StatusFilter>('All')
  const [selectedPriority, setSelectedPriority] = useState<PriorityFilter>('All')

  const { data: approvalsResponse, loading, error, refetch } = useApiCall('/operator/approvals')
  const { data: branchesResponse } = useApiCall('/operator/branches')

  const approvalsData = approvalsResponse?.data || approvalsResponse || []
  const branchesData = branchesResponse?.data || branchesResponse || []

  const updateStatusMutation = useApiMutation('/operator/approvals/:id/status', 'PUT')

  if (error) {
    return <APIErrorFallback error={error} onRetry={() => window.location.reload()} />
  }

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

  const updateStatus = async (id: string, status: ApprovalDecision) => {
    try {
      await updateStatusMutation.mutate({ id, status })
      refetch()
    } catch (err) {
      console.error('Failed to update status:', err)
    }
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Approvals Center"
        subtitle="Review branch-level exceptions, discount overrides, and operational requests with fast approve/reject workflows."
        actions={
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full bg-surface-container-low px-4 py-2 text-sm font-semibold text-primary"
          >
            <Download className="w-4 h-4" />
            Export Queue
          </button>
        }
      />

      <AdminPanel eyebrow="Moderation" title="Approval Requests">
        <AdminFilterBar
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search by request id, requester, or subject"
          controls={
            <>
              <select
                value={selectedStatus}
                onChange={(event) => setSelectedStatus(event.target.value as StatusFilter)}
                className="rounded-full bg-surface-container-low px-3 py-2 text-xs font-lexend font-bold uppercase tracking-[0.12em] text-primary outline-none"
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>

              <select
                value={selectedPriority}
                onChange={(event) => setSelectedPriority(event.target.value as PriorityFilter)}
                className="rounded-full bg-surface-container-low px-3 py-2 text-xs font-lexend font-bold uppercase tracking-[0.12em] text-primary outline-none"
              >
                {priorityOptions.map((priority) => (
                  <option key={priority} value={priority}>
                    {priority}
                  </option>
                ))}
              </select>
            </>
          }
        />

        <div className="mt-4">
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
                      <p className="font-bold text-primary">{request.subject || 'Unknown'}</p>
                      <p className="text-xs text-primary/60 mt-1">{request.id || 'Unknown'} • {request.type || 'Unknown'}</p>
                    </div>
                  ),
                },
                {
                  key: 'requester',
                  header: 'Requested By',
                  render: (request: any) => (
                    <div>
                      <p className="text-sm font-semibold text-primary">{request.requestedBy || 'Unknown'}</p>
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
                        className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-3 py-1.5 text-[10px] font-lexend font-bold uppercase tracking-[0.12em] text-emerald-700 disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => updateStatus(request.id, 'REJECTED')}
                        disabled={updateStatusMutation.loading}
                        className="inline-flex items-center gap-1 rounded-full bg-rose-500/15 px-3 py-1.5 text-[10px] font-lexend font-bold uppercase tracking-[0.12em] text-rose-700 disabled:opacity-50"
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
