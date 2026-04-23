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
import { downloadCsv, type CoachReportsData } from '@/lib/coach/types'

const DONUT_COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#14b8a6']

function formatEgp(value: number) {
  return new Intl.NumberFormat('en-EG', {
    style: 'currency',
    currency: 'EGP',
    maximumFractionDigits: 0,
  }).format(value)
}

export default function CoachReportsPage() {
  const { data: reportsData, loading, error, refetch } = useApiCall<CoachReportsData>('/coach/reports')

  if (error) {
    return <APIErrorFallback error={error} onRetry={refetch} />
  }

  const coachBookings = reportsData?.bookings ?? []
  const coachRevenueTrend = reportsData?.revenueTrend ?? []
  const coachSessionMix = reportsData?.sessionMix ?? []
  const monthSnapshots = reportsData?.monthSnapshots ?? []

  const completedSessions = coachBookings.filter((booking) => booking.status === 'COMPLETED').length
  const pendingSessions = coachBookings.filter((booking) => booking.status === 'PENDING').length
  const estimatedPayout = coachBookings.reduce((sum, booking) => sum + (typeof booking.payout === 'number' ? booking.payout : 0), 0)

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Reports"
        subtitle="Analyze earnings, utilization, and delivery quality to optimize weekly coaching capacity."
        actions={
          <>
            <button
              type="button"
              onClick={() => void refetch()}
              className="inline-flex items-center gap-2 rounded-full bg-surface-container-low px-4 py-2 text-sm font-semibold text-primary"
            >
              <Filter className="w-4 h-4" />
              Refresh Data
            </button>
            <button
              type="button"
              onClick={() =>
                downloadCsv(
                  'coach-report.csv',
                  ['Month', 'Sessions', 'Gross', 'Average Rating'],
                  monthSnapshots.map((row) => [row.month, row.sessions, row.gross, row.avgRating.toFixed(1)]),
                )
              }
              className="inline-flex items-center gap-2 rounded-full bg-primary-container px-4 py-2 text-sm font-semibold text-surface-container-lowest"
            >
              <Download className="w-4 h-4" />
              Export Report
            </button>
          </>
        }
      />

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

      <section className="grid grid-cols-1 xl:grid-cols-[1.3fr_1fr] gap-6">
        <AdminPanel eyebrow="Revenue trend" title="Earnings Trajectory">
          <AdminTrendBars values={coachRevenueTrend.map((p: { value: number }) => p.value)} colorClassName="bg-secondary-container" />
        </AdminPanel>

        <AdminPanel eyebrow="Session mix" title="Program Balance">
          <AdminDonut segments={coachSessionMix.map((s: { label: string; value: number }, i: number) => ({ label: s.label, value: s.value, color: DONUT_COLORS[i % DONUT_COLORS.length] }))} />
        </AdminPanel>
      </section>

      <AdminPanel eyebrow="Monthly snapshots" title="Performance Ledger">
        <AdminTable
          items={monthSnapshots}
          getRowKey={(row) => row.id}
          columns={[
            {
              key: 'month',
              header: 'Month',
              render: (row) => <span className="font-bold text-primary">{row.month}</span>,
            },
            {
              key: 'sessions',
              header: 'Sessions',
              render: (row) => <span className="font-semibold text-primary">{row.sessions}</span>,
            },
            {
              key: 'gross',
              header: 'Gross Earnings',
              render: (row) => <span className="font-bold text-primary">{formatEgp(row.gross)}</span>,
            },
            {
              key: 'rating',
              header: 'Average Rating',
              render: (row) => <span className="font-semibold text-primary">{(row.avgRating != null && typeof row.avgRating === 'number') ? row.avgRating.toFixed(1) : '—'}</span>,
            },
          ]}
        />
      </AdminPanel>
    </div>
  )
}
