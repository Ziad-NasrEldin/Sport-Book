'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowLeft, PencilLine, UserPlus } from 'lucide-react'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { AdminPanel } from '@/components/admin/AdminPanel'
import { AdminStatCard } from '@/components/admin/AdminStatCard'
import { AdminStatusPill } from '@/components/admin/AdminStatusPill'
import { AdminTable } from '@/components/admin/AdminTable'
import { useApiCall } from '@/lib/api/hooks'
import { APIErrorFallback } from '@/components/ui/ErrorBoundary'
import { SkeletonStat } from '@/components/ui/SkeletonLoader'
import { statusTone } from '@/lib/admin/ui'

export default function OperatorBranchDetailsPage() {
  const params = useParams<{ id: string }>()
  const branchId = Array.isArray(params.id) ? params.id[0] : params.id

  const { data: branchResponse, loading, error } = useApiCall(`/operator/branches/${branchId}`)
  const { data: courtsResponse } = useApiCall('/operator/courts')
  const { data: staffResponse } = useApiCall('/operator/staff')
  const { data: approvalsResponse } = useApiCall('/operator/approvals')
  const { data: bookingsResponse } = useApiCall('/operator/bookings')

  const branch = branchResponse?.data || branchResponse
  const courtsData = courtsResponse?.data || courtsResponse || []
  const staffData = staffResponse?.data || staffResponse || []
  const approvalsData = approvalsResponse?.data || approvalsResponse || []
  const bookingsData = bookingsResponse?.data || bookingsResponse || []

  if (error) {
    return <APIErrorFallback error={error} onRetry={() => window.location.reload()} />
  }

  if (loading) {
    return <SkeletonStat />
  }

  if (!branch) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-extrabold text-primary">Branch not found</h2>
        <Link
          href="/operator/branches"
          className="inline-flex items-center rounded-full bg-primary-container px-4 py-2 text-sm font-semibold text-surface-container-lowest"
        >
          Back to Branches
        </Link>
      </div>
    )
  }

  const branchCourts = courtsData.filter((court: any) => court.branchId === branch.id)
  const branchStaff = staffData.filter((member: any) => member.branchId === branch.id)
  const pendingApprovals = approvalsData.filter(
    (approval: any) => approval.branchId === branch.id && approval.status === 'Pending',
  )

  const branchBookings = bookingsData.filter((booking: any) => booking.branchId === branch.id)
  const branchRevenue = branchBookings.reduce((total: number, booking: any) => total + (booking.amount || 0), 0)

  const formatEgp = (value: number) => {
    return `${value.toLocaleString()} EGP`
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={branch.name}
        subtitle={`${branch.address} • Managed by ${branch.manager}. Track branch health, staff coverage, and court-level performance.`}
        actions={
          <>
            <Link
              href="/operator/branches"
              className="inline-flex items-center gap-2 rounded-full bg-surface-container-low px-4 py-2 text-sm font-semibold text-primary"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Branches
            </Link>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full bg-primary-container px-4 py-2 text-sm font-semibold text-surface-container-lowest"
            >
              <PencilLine className="w-4 h-4" />
              Edit Branch
            </button>
          </>
        }
      />

      <section className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-4 gap-4">
        <AdminStatCard label="Courts" value={String(branchCourts.length)} delta="current inventory" trend="flat" />
        <AdminStatCard label="Monthly Revenue" value={formatEgp(branch.monthlyRevenue)} delta="branch estimate" trend="up" />
        <AdminStatCard label="Utilization" value={`${branch.utilization}%`} delta="this week" trend="up" />
        <AdminStatCard
          label="Pending Approvals"
          value={String(pendingApprovals.length)}
          delta="awaiting operator decision"
          trend={pendingApprovals.length > 0 ? 'down' : 'flat'}
        />
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-[1.1fr_1fr] gap-4">
        <AdminPanel eyebrow="Branch profile" title="Operational Details">
          <div className="space-y-3">
            <article className="rounded-[var(--radius-default)] bg-surface-container-low p-3.5">
              <p className="text-xs font-lexend uppercase tracking-[0.14em] text-primary/55">Branch ID</p>
              <p className="mt-1 text-sm font-bold text-primary">{branch.id}</p>
            </article>
            <article className="rounded-[var(--radius-default)] bg-surface-container-low p-3.5">
              <p className="text-xs font-lexend uppercase tracking-[0.14em] text-primary/55">Manager</p>
              <p className="mt-1 text-sm font-bold text-primary">{branch.manager}</p>
              <p className="text-xs text-primary/60 mt-1">{branch.managerEmail}</p>
            </article>
            <article className="rounded-[var(--radius-default)] bg-surface-container-low p-3.5">
              <p className="text-xs font-lexend uppercase tracking-[0.14em] text-primary/55">Current Status</p>
              <div className="mt-2">
                <AdminStatusPill label={branch.status} tone={statusTone(branch.status)} />
              </div>
            </article>
          </div>
        </AdminPanel>

        <AdminPanel eyebrow="Workload" title="Activity Summary">
          <div className="space-y-3">
            <article className="rounded-[var(--radius-default)] bg-surface-container-low p-3.5">
              <p className="text-xs font-lexend uppercase tracking-[0.14em] text-primary/55">Recent bookings</p>
              <p className="mt-1 text-2xl font-extrabold text-primary">{branchBookings.length}</p>
            </article>
            <article className="rounded-[var(--radius-default)] bg-surface-container-low p-3.5">
              <p className="text-xs font-lexend uppercase tracking-[0.14em] text-primary/55">Revenue from bookings</p>
              <p className="mt-1 text-2xl font-extrabold text-primary">{formatEgp(branchRevenue)}</p>
            </article>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full bg-secondary-container px-4 py-2 text-sm font-semibold text-on-secondary-container"
            >
              <UserPlus className="w-4 h-4" />
              Add Staff Member
            </button>
          </div>
        </AdminPanel>
      </section>

      <AdminPanel eyebrow="Court inventory" title="Branch Courts">
        <AdminTable
          items={branchCourts}
          getRowKey={(court: any) => court.id}
          columns={[
            {
              key: 'court',
              header: 'Court',
              render: (court: any) => (
                <div>
                  <p className="font-bold text-primary">{court.name}</p>
                  <p className="text-xs text-primary/60 mt-1">{court.id}</p>
                </div>
              ),
            },
            {
              key: 'sport',
              header: 'Sport',
              render: (court: any) => <p className="text-sm font-semibold text-primary">{court.sport}</p>,
            },
            {
              key: 'pricing',
              header: 'Price / Hour',
              render: (court: any) => <p className="text-sm text-primary/75">{formatEgp(court.pricePerHour)}</p>,
            },
            {
              key: 'status',
              header: 'Status',
              render: (court: any) => <AdminStatusPill label={court.status} tone={statusTone(court.status)} />,
            },
            {
              key: 'edit',
              header: 'Edit',
              render: (court: any) => (
                <Link
                  href={`/operator/courts/${court.id}`}
                  className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1.5 text-[10px] font-lexend font-bold uppercase tracking-[0.12em] text-primary"
                >
                  Open Court
                </Link>
              ),
            },
          ]}
        />
      </AdminPanel>

      <section className="grid grid-cols-1 xl:grid-cols-[1.1fr_1fr] gap-4">
        <AdminPanel eyebrow="Staff" title="Assigned Team">
          <div className="space-y-3">
            {branchStaff.map((member: any) => (
              <article key={member.id} className="rounded-[var(--radius-default)] bg-surface-container-low p-3.5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-primary">{member.name}</p>
                    <p className="text-xs text-primary/60 mt-1">{member.role} • {member.shift}</p>
                    <p className="text-xs text-primary/55 mt-1">{member.email}</p>
                  </div>
                  <AdminStatusPill label={member.status} tone={statusTone(member.status)} />
                </div>
              </article>
            ))}
          </div>
        </AdminPanel>

        <AdminPanel eyebrow="Approvals" title="Pending at This Branch">
          <div className="space-y-3">
            {pendingApprovals.length === 0 ? (
              <article className="rounded-[var(--radius-default)] bg-surface-container-low p-3.5">
                <p className="text-sm font-semibold text-primary">No pending approvals for this branch.</p>
              </article>
            ) : (
              pendingApprovals.map((request: any) => (
                <article key={request.id} className="rounded-[var(--radius-default)] bg-surface-container-low p-3.5">
                  <p className="text-sm font-bold text-primary">{request.subject}</p>
                  <p className="text-xs text-primary/60 mt-1">{request.type} • {request.requestedBy}</p>
                  <p className="text-xs text-primary/55 mt-2">{request.submittedAt}</p>
                </article>
              ))
            )}
          </div>
        </AdminPanel>
      </section>
    </div>
  )
}
