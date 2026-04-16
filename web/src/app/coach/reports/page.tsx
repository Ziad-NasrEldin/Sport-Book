import { Download, Filter } from 'lucide-react'
import { AdminDonut } from '@/components/admin/AdminDonut'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { AdminPanel } from '@/components/admin/AdminPanel'
import { AdminStatCard } from '@/components/admin/AdminStatCard'
import { AdminTable } from '@/components/admin/AdminTable'
import { AdminTrendBars } from '@/components/admin/AdminTrendBars'
import {
  coachBookings,
  coachRevenueTrend,
  coachSessionMix,
  formatEgp,
} from '@/lib/coach/mockData'

const monthSnapshots = [
  { id: 'jan', month: 'Jan 2026', sessions: 62, gross: 31200, avgRating: 4.8 },
  { id: 'feb', month: 'Feb 2026', sessions: 71, gross: 36600, avgRating: 4.8 },
  { id: 'mar', month: 'Mar 2026', sessions: 79, gross: 41200, avgRating: 4.9 },
  { id: 'apr', month: 'Apr 2026', sessions: 86, gross: 48600, avgRating: 4.9 },
]

export default function CoachReportsPage() {
  const completedSessions = coachBookings.filter((booking) => booking.status === 'Completed').length
  const pendingSessions = coachBookings.filter((booking) => booking.status === 'Pending').length
  const estimatedPayout = coachBookings.reduce((sum, booking) => sum + booking.payout, 0)

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
        <AdminStatCard label="Estimated Payout" value={formatEgp(estimatedPayout)} delta="Net after fees" trend="up" />
        <AdminStatCard label="Completed Sessions" value={String(completedSessions)} delta="Execution quality stable" trend="flat" />
        <AdminStatCard label="Pending Sessions" value={String(pendingSessions)} delta="Needs follow-up by EOD" trend="down" />
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
              render: (row) => <span className="font-semibold text-primary">{row.avgRating.toFixed(1)}</span>,
            },
          ]}
        />
      </AdminPanel>
    </div>
  )
}
