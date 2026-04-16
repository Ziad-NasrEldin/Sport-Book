'use client'

import { Download, Filter } from 'lucide-react'
import { AdminDonut } from '@/components/admin/AdminDonut'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { AdminPanel } from '@/components/admin/AdminPanel'
import { AdminStatCard } from '@/components/admin/AdminStatCard'
import { AdminTable } from '@/components/admin/AdminTable'
import { AdminTrendBars } from '@/components/admin/AdminTrendBars'
import { SkeletonStat } from '@/components/ui/SkeletonLoader'
import { useApiCall } from '@/lib/api/hooks'
import { APIErrorFallback } from '@/components/ui/ErrorBoundary'

function formatEgp(value: number) {
  return new Intl.NumberFormat('en-EG', {
    style: 'currency',
    currency: 'EGP',
    maximumFractionDigits: 0,
  }).format(value)
}

export default function CoachReportsPage() {
  const { data: reportsResponse, loading, error } = useApiCall('/coach/reports')
  const reportsData = reportsResponse?.data || reportsResponse || {}

  if (error) {
    return <APIErrorFallback error={error} onRetry={() => window.location.reload()} />
  }

  const coachBookings = reportsData.bookings || []
  const coachRevenueTrend = reportsData.revenueTrend || []
  const coachSessionMix = reportsData.sessionMix || []
  const monthSnapshots = reportsData.monthSnapshots || []

  const completedSessions = coachBookings.filter((booking: any) => booking.status === 'COMPLETED').length
  const pendingSessions = coachBookings.filter((booking: any) => booking.status === 'PENDING').length
  const estimatedPayout = coachBookings.reduce((sum: number, booking: any) => sum + (booking.payout || 0), 0)

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Reports"
        subtitle="Analyze earnings, utilization, and delivery quality to optimize weekly coaching capacity."
        actions={
          <>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full bg-surface-container-low px-4 py-2 text-sm font-semibold text-primary"
            >
              <Filter className="w-4 h-4" />
              Last 30 Days
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full bg-primary-container px-4 py-2 text-sm font-semibold text-surface-container-lowest"
            >
              <Download className="w-4 h-4" />
              Export Report
            </button>
          </>
        }
      />

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {loading ? (
          <>
            <SkeletonStat />
            <SkeletonStat />
            <SkeletonStat />
          </>
        ) : (
          <>
            <AdminStatCard label="Estimated Payout" value={formatEgp(estimatedPayout)} delta="Net after fees" trend="up" />
            <AdminStatCard label="Completed Sessions" value={String(completedSessions)} delta="Execution quality stable" trend="flat" />
            <AdminStatCard label="Pending Sessions" value={String(pendingSessions)} delta="Needs follow-up by EOD" trend="down" />
          </>
        )}
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-[1.3fr_1fr] gap-4">
        <AdminPanel eyebrow="Revenue trend" title="Earnings Trajectory">
          <AdminTrendBars values={coachRevenueTrend} colorClassName="bg-secondary-container" />
        </AdminPanel>

        <AdminPanel eyebrow="Session mix" title="Program Balance">
          <AdminDonut segments={coachSessionMix} />
        </AdminPanel>
      </section>

      <AdminPanel eyebrow="Monthly snapshots" title="Performance Ledger">
        <AdminTable
          items={monthSnapshots}
          getRowKey={(row: any) => row.id}
          columns={[
            {
              key: 'month',
              header: 'Month',
              render: (row: any) => <span className="font-bold text-primary">{row.month || 'Unknown'}</span>,
            },
            {
              key: 'sessions',
              header: 'Sessions',
              render: (row: any) => <span className="font-semibold text-primary">{row.sessions || 0}</span>,
            },
            {
              key: 'gross',
              header: 'Gross Earnings',
              render: (row: any) => <span className="font-bold text-primary">{formatEgp(row.gross || 0)}</span>,
            },
            {
              key: 'rating',
              header: 'Average Rating',
              render: (row: any) => <span className="font-semibold text-primary">{(row.avgRating || 0).toFixed(1)}</span>,
            },
          ]}
        />
      </AdminPanel>
    </div>
  )
}
