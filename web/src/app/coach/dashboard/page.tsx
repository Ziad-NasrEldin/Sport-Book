'use client'

import { Download, Plus, RefreshCw } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { AdminDonut } from '@/components/admin/AdminDonut'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { AdminPanel } from '@/components/admin/AdminPanel'
import { AdminStatCard } from '@/components/admin/AdminStatCard'
import { AdminStatusPill } from '@/components/admin/AdminStatusPill'
import { AdminTrendBars } from '@/components/admin/AdminTrendBars'
import { SkeletonStat } from '@/components/ui/SkeletonLoader'
import { useApiCall } from '@/lib/api/hooks'
import { APIErrorFallback } from '@/components/ui/ErrorBoundary'
import { statusTone } from '@/lib/admin/ui'
import { downloadCsv, type CoachDashboardData } from '@/lib/coach/types'

const DONUT_COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#14b8a6']

function formatEgp(value: number) {
  return new Intl.NumberFormat('en-EG', {
    style: 'currency',
    currency: 'EGP',
    maximumFractionDigits: 0,
  }).format(value)
}

export default function CoachDashboardPage() {
  const router = useRouter()
  const { data: dashboardData, loading, error, refetch } = useApiCall<CoachDashboardData>('/coach/dashboard')

  if (error) {
    return <APIErrorFallback error={error} onRetry={refetch} />
  }

  const coachMetrics = dashboardData?.metrics ?? []
  const coachRevenueTrend = dashboardData?.revenueTrend ?? []
  const coachSessionMix = dashboardData?.sessionMix ?? []
  const coachBookings = dashboardData?.bookings ?? []

  const pendingRequests = coachBookings.filter((booking) => booking.status === 'PENDING').length
  const confirmedToday = coachBookings.filter((booking) => booking.status === 'CONFIRMED').length

  const handleExport = () => {
    downloadCsv(
      'coach-dashboard-snapshot.csv',
      ['Athlete', 'Session Type', 'Status', 'Start', 'Duration Minutes', 'Payout'],
      coachBookings.map((booking) => [
        booking.athlete,
        booking.sessionType,
        booking.status,
        new Date(booking.dateTime).toISOString(),
        booking.duration,
        booking.payout,
      ]),
    )
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Coach Dashboard"
        subtitle="Run your coaching operation from one command center: revenue, schedule quality, service performance, and booking readiness."
        actions={
          <>
            <button
              type="button"
              onClick={() => void refetch()}
              className="inline-flex items-center gap-2 rounded-full bg-surface-container-low px-4 py-2 text-sm font-semibold text-primary"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh Snapshot
            </button>
            <button
              type="button"
              onClick={() => router.push('/coach/services?create=session-type')}
              className="inline-flex items-center gap-2 rounded-full bg-primary-container px-4 py-2 text-sm font-semibold text-surface-container-lowest"
            >
              <Plus className="w-4 h-4" />
              Add Session Type
            </button>
          </>
        }
      />

      <section className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-4 gap-4">
        {loading ? (
          <>
            <SkeletonStat />
            <SkeletonStat />
            <SkeletonStat />
            <SkeletonStat />
          </>
        ) : (
          coachMetrics.map((metric) => (
            <AdminStatCard
              key={metric.id}
              label={metric.label}
              value={metric.value}
              delta={metric.delta}
              trend={metric.trend}
            />
          ))
        )}
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-[1.3fr_1fr] gap-4">
        <AdminPanel
          eyebrow="Revenue pulse"
          title="Earnings Momentum"
          actions={<span className="text-xs font-lexend uppercase tracking-[0.14em] text-primary/55">Last 6 months</span>}
        >
          <AdminTrendBars values={coachRevenueTrend.map((p: { value: number }) => p.value)} colorClassName="bg-secondary-container" />

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div className="rounded-[var(--radius-default)] bg-surface-container-low px-3 py-2.5">
              <p className="text-[10px] uppercase tracking-[0.14em] font-lexend text-primary/50">Pending requests</p>
              <p className="mt-1 text-lg font-extrabold text-primary">{pendingRequests}</p>
            </div>
            <div className="rounded-[var(--radius-default)] bg-surface-container-low px-3 py-2.5">
              <p className="text-[10px] uppercase tracking-[0.14em] font-lexend text-primary/50">Confirmed today</p>
              <p className="mt-1 text-lg font-extrabold text-primary">{confirmedToday}</p>
            </div>
            <div className="rounded-[var(--radius-default)] bg-surface-container-low px-3 py-2.5">
              <p className="text-[10px] uppercase tracking-[0.14em] font-lexend text-primary/50">Avg payout / session</p>
              <p className="mt-1 text-lg font-extrabold text-primary">
                {formatEgp(
                  coachBookings.length > 0
                    ? Math.round(coachBookings.reduce((sum, booking) => sum + booking.payout, 0) / coachBookings.length)
                    : 0,
                )}
              </p>
            </div>
          </div>
        </AdminPanel>

        <AdminPanel
          eyebrow="Session mix"
          title="Coaching Distribution"
          actions={
            <button
              type="button"
              onClick={handleExport}
              className="inline-flex items-center gap-1.5 rounded-full bg-surface-container-low px-3 py-1.5 text-xs font-bold text-primary"
            >
              <Download className="w-3.5 h-3.5" />
              Export
            </button>
          }
        >
          <AdminDonut segments={coachSessionMix.map((s: { label: string; value: number }, i: number) => ({ label: s.label, value: s.value, color: DONUT_COLORS[i % DONUT_COLORS.length] }))} />
        </AdminPanel>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-[1.2fr_1fr] gap-4">
        <AdminPanel eyebrow="Today" title="Session Pipeline">
          <div className="space-y-3">
            {coachBookings.map((booking) => (
              <article key={booking.id} className="rounded-[var(--radius-default)] bg-surface-container-low px-3.5 py-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-primary">{booking.athlete}</p>
                    <p className="text-xs text-primary/60 mt-1">{booking.sessionType} • {booking.duration} min</p>
                  </div>
                  <AdminStatusPill label={booking.status} tone={statusTone(booking.status)} />
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-primary/60">
                  <span>{new Date(booking.dateTime).toLocaleString()}</span>
                  <span>•</span>
                  <span>{booking.location}</span>
                  <span>•</span>
                  <span className="font-bold text-primary">{formatEgp(booking.payout)}</span>
                </div>
              </article>
            ))}
          </div>
        </AdminPanel>

        <AdminPanel eyebrow="Quick actions" title="Control Center">
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => router.push('/coach/availability')}
              className="w-full rounded-[var(--radius-default)] bg-surface-container-low px-3.5 py-3 text-left"
            >
              <p className="text-sm font-semibold text-primary">Open availability editor for next week blocks.</p>
            </button>
            <button
              type="button"
              onClick={() => router.push('/coach/services')}
              className="w-full rounded-[var(--radius-default)] bg-surface-container-low px-3.5 py-3 text-left"
            >
              <p className="text-sm font-semibold text-primary">Publish latest service pricing to booking pages.</p>
            </button>
            <button
              type="button"
              onClick={() => router.push('/coach/bookings')}
              className="w-full rounded-[var(--radius-default)] bg-surface-container-low px-3.5 py-3 text-left"
            >
              <p className="text-sm font-semibold text-primary">Review pending athlete requests before 6 PM.</p>
            </button>
          </div>
        </AdminPanel>
      </section>
    </div>
  )
}
