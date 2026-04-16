'use client'

import { useMemo, useState } from 'react'
import { CheckCircle2, Download, XCircle } from 'lucide-react'
import { AdminFilterBar } from '@/components/admin/AdminFilterBar'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { AdminPanel } from '@/components/admin/AdminPanel'
import { AdminStatusPill, type Tone } from '@/components/admin/AdminStatusPill'
import { AdminTable } from '@/components/admin/AdminTable'
import { approvalsData, getBranchNameById } from '@/lib/operator/mockData'
import { statusTone } from '@/lib/admin/ui'

const statusOptions = ['All', 'Pending', 'Approved', 'Rejected'] as const
const priorityOptions = ['All', 'High', 'Medium', 'Low'] as const

type StatusFilter = (typeof statusOptions)[number]
type PriorityFilter = (typeof priorityOptions)[number]
type ApprovalDecision = Exclude<StatusFilter, 'All'>

function priorityTone(priority: PriorityFilter): Tone {
  if (priority === 'High') return 'red'
  if (priority === 'Medium') return 'amber'
  if (priority === 'Low') return 'blue'
  return 'violet'
}

type ApprovalOverride = {
  id: string
  status: ApprovalDecision
}

export default function OperatorApprovalsPage() {
  const [search, setSearch] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<StatusFilter>('All')
  const [selectedPriority, setSelectedPriority] = useState<PriorityFilter>('All')
  const [overrides, setOverrides] = useState<ApprovalOverride[]>([])

  const withStatus = useMemo(() => {
    return approvalsData.map((request) => {
      const override = overrides.find((entry) => entry.id === request.id)
      if (!override) return request
      return {
        ...request,
        status: override.status,
      }
    })
  }, [overrides])

  const visibleRequests = useMemo(() => {
    const query = search.trim().toLowerCase()

    return withStatus.filter((request) => {
      const matchesSearch =
        query.length === 0 ||
        request.id.toLowerCase().includes(query) ||
        request.subject.toLowerCase().includes(query) ||
        request.requestedBy.toLowerCase().includes(query)

      const matchesStatus = selectedStatus === 'All' || request.status === selectedStatus
      const matchesPriority = selectedPriority === 'All' || request.priority === selectedPriority

      return matchesSearch && matchesStatus && matchesPriority
    })
  }, [search, selectedStatus, selectedPriority, withStatus])

  const updateStatus = (id: string, status: ApprovalDecision) => {
    setOverrides((prev) => {
      const existing = prev.find((entry) => entry.id === id)
      if (existing) {
        return prev.map((entry) => (entry.id === id ? { ...entry, status } : entry))
      }
      return [...prev, { id, status }]
    })
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
          <AdminTable
            items={visibleRequests}
            getRowKey={(request) => request.id}
            columns={[
              {
                key: 'request',
                header: 'Request',
                render: (request) => (
                  <div>
                    <p className="font-bold text-primary">{request.subject}</p>
                    <p className="text-xs text-primary/60 mt-1">{request.id} • {request.type}</p>
                  </div>
                ),
              },
              {
                key: 'requester',
                header: 'Requested By',
                render: (request) => (
                  <div>
                    <p className="text-sm font-semibold text-primary">{request.requestedBy}</p>
                    <p className="text-xs text-primary/55 mt-1">{request.submittedAt}</p>
                  </div>
                ),
              },
              {
                key: 'branch',
                header: 'Branch',
                render: (request) => <p className="text-sm text-primary/75">{getBranchNameById(request.branchId)}</p>,
              },
              {
                key: 'priority',
                header: 'Priority',
                render: (request) => <AdminStatusPill label={request.priority} tone={priorityTone(request.priority)} />,
              },
              {
                key: 'status',
                header: 'Status',
                render: (request) => <AdminStatusPill label={request.status} tone={statusTone(request.status)} />,
              },
              {
                key: 'action',
                header: 'Action',
                render: (request) => (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => updateStatus(request.id, 'Approved')}
                      className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-3 py-1.5 text-[10px] font-lexend font-bold uppercase tracking-[0.12em] text-emerald-700"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => updateStatus(request.id, 'Rejected')}
                      className="inline-flex items-center gap-1 rounded-full bg-rose-500/15 px-3 py-1.5 text-[10px] font-lexend font-bold uppercase tracking-[0.12em] text-rose-700"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Reject
                    </button>
                  </div>
                ),
              },
            ]}
          />
        </div>
      </AdminPanel>
    </div>
  )
}
