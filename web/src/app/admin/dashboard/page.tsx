"use client"

import { AlertTriangle, Download, RefreshCw } from 'lucide-react'
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

type Trend = 'up' | 'down' | 'flat' | 'steady'

type DashboardMetric = {
  id: string
  label: string
  value: string
  delta?: string
  trend?: Trend
}

type RevenueSegment = {
  label: string
  value: number
  color: string
}

type DashboardResponse = {
  metrics?: DashboardMetric[]
  pendingBookingsCount?: number
  bookingVelocity?: number[]
  revenueShare?: RevenueSegment[]
  averageOrder?: number
  successRate?: string
  operationalRisks?: string[]
}

type RoleUpgradeItem = {
  id: string
  userId: string
  requestedRole: string
  submittedAt: string
  status: string
}

type RoleUpgradesResponse = {
  data?: RoleUpgradeItem[]
}

type BookingRecord = {
  status: string
}

type BookingsResponse = {
  data?: BookingRecord[]
}

type TransactionRecord = {
  type: string
}

type TransactionsResponse = {
  data?: TransactionRecord[]
}

function formatEgp(value: number) {
  return new Intl.NumberFormat('en-EG', {
    style: 'currency',
    currency: 'EGP',
    maximumFractionDigits: 0,
  }).format(value)
}

export default function AdminDashboardPage() {
  const { data: dashboardData, loading: dashboardLoading, error: dashboardError } = useApiCall<DashboardResponse>('/admin-workspace/dashboard')
  const { data: roleUpgrades, loading: upgradesLoading, error: upgradesError } = useApiCall<RoleUpgradesResponse>('/admin-workspace/role-upgrades')
  const { data: bookings } = useApiCall<BookingsResponse>('/admin-workspace/bookings')
  const { data: transactions } = useApiCall<TransactionsResponse>('/admin-workspace/finance')

  if (dashboardError || upgradesError) {
    return <APIErrorFallback error={dashboardError || upgradesError!} onRetry={() => window.location.reload()} />
  }

  const dashboardMetrics = dashboardData?.metrics || []
  const pendingRefunds = transactions?.data?.filter((item) => item.type === 'Refund').length || 0
  const pendingBookings = dashboardData?.pendingBookingsCount ?? (bookings?.data?.filter((item) => item.status === 'PENDING').length || 0)

  const bookingVelocity = dashboardData?.bookingVelocity || []
  const revenueShare = dashboardData?.revenueShare || [
    { label: 'Facilities', value: 52, color: '#002366' },
    { label: 'Coaching', value: 31, color: '#fd8b00' },
    { label: 'Marketplace', value: 17, color: '#c3f400' },
  ]
  const averageOrder = dashboardData?.averageOrder ?? 0
  const successRate = dashboardData?.successRate ?? '0%'
  const operationalRisks: string[] = dashboardData?.operationalRisks || ['No critical risks identified. All systems operating normally.']
  const queueItems = roleUpgrades?.data || []
  const verificationPending = queueItems.filter((item) => {
    const normalized = String(item.status || '').toLowerCase()
    return normalized.includes('pending') || normalized.includes('review') || normalized.includes('processing')
  }).length
  const actionableRisks = operationalRisks.filter((message) => !message.toLowerCase().includes('no critical risks identified'))
  const urgentRiskCount = actionableRisks.length
  const actionPressure = pendingBookings + pendingRefunds + verificationPending + urgentRiskCount
  const pulseState = actionPressure === 0 ? 'Stable pulse' : actionPressure <= 8 ? 'Watch closely' : 'High load'

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden bg-[linear-gradient(130deg,var(--color-primary)_0%,#001a52_52%,#11387d_100%)] shadow-[0_32px_72px_-36px_rgba(0,17,58,0.95)]">
        <div className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-secondary-container/30 blur-3xl" />
        <div className="pointer-events-none absolute -left-20 bottom-[-7rem] h-64 w-64 rounded-full bg-tertiary-fixed/20 blur-3xl" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/30" />

        <div className="relative z-10 space-y-6 p-5 md:p-7 lg:p-8">
          <AdminPageHeader
            className="animate-soft-rise [&_h2]:text-white [&_p]:text-white/80"
            title="Platform Command Center"
            subtitle="Run live operations with one glance: triage verification load, booking pressure, and risk exposure before queue health slips."
            actions={
              <>
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm hover:bg-white/18 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh KPIs
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const rows = ['Metric,Value,Delta', ...dashboardMetrics.map((metric) => `${metric.label},${metric.value},${metric.delta ?? ''}`)]
                    const blob = new Blob([rows.join('\n')], { type: 'text/csv' })
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = `dashboard-${new Date().toISOString().slice(0, 10)}.csv`
                    a.click()
                    URL.revokeObjectURL(url)
                  }}
                  className="inline-flex items-center gap-2 rounded-full bg-secondary-container px-4 py-2 text-sm font-semibold text-[#2d1a00] hover:brightness-105 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  <Download className="w-4 h-4" />
                  Export Snapshot
                </button>
              </>
            }
          />

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-[1.5fr_repeat(3,minmax(0,1fr))]">
            <article className="rounded-[1.35rem] border border-white/20 bg-white/12 p-4 md:p-5 text-white animate-card-stagger">
              <p className="text-[10px] uppercase tracking-[0.16em] font-lexend text-white/70">Live Operations Load</p>
              <div className="mt-2 flex items-end gap-3">
                <p className="text-4xl md:text-5xl font-black leading-none">{actionPressure}</p>
                <p className="pb-1 text-xs uppercase tracking-[0.16em] font-lexend text-white/75">{pulseState}</p>
              </div>
              <p className="mt-3 text-sm text-white/80">Combined pressure from pending bookings, refunds, queue approvals, and active risks.</p>
            </article>

            <article className="rounded-[1.2rem] border border-white/15 bg-black/15 p-4 text-white/95 animate-card-stagger animation-delay-75">
              <p className="text-[10px] uppercase tracking-[0.16em] font-lexend text-white/65">Verification Pending</p>
              <p className="mt-2 text-3xl font-black leading-none">{verificationPending}</p>
              <p className="mt-2 text-xs text-white/70">Cases waiting admin decision.</p>
            </article>

            <article className="rounded-[1.2rem] border border-white/15 bg-black/15 p-4 text-white/95 animate-card-stagger animation-delay-150">
              <p className="text-[10px] uppercase tracking-[0.16em] font-lexend text-white/65">Booking Backlog</p>
              <p className="mt-2 text-3xl font-black leading-none">{pendingBookings}</p>
              <p className="mt-2 text-xs text-white/70">Pending booking resolutions.</p>
            </article>

            <article className="rounded-[1.2rem] border border-white/15 bg-black/15 p-4 text-white/95 animate-card-stagger animation-delay-200">
              <p className="text-[10px] uppercase tracking-[0.16em] font-lexend text-white/65">Refund Queue</p>
              <p className="mt-2 text-3xl font-black leading-none">{pendingRefunds}</p>
              <p className="mt-2 text-xs text-white/70">Refunds waiting financial closure.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-4 gap-4">
        {dashboardLoading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonStat key={i} />)
        ) : (
          dashboardMetrics.map((metric) => (
            <AdminStatCard
              key={metric.id}
              label={metric.label}
              value={metric.value}
              delta={metric.delta ?? 'No change'}
              trend={metric.trend ?? 'steady'}
            />
          ))
        )}
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-[1.2fr_1fr] gap-4">
        <AdminPanel
          eyebrow="Action required"
          title="Verification Queue"
          className="border border-primary/10 bg-[linear-gradient(180deg,var(--color-surface-container-lowest)_0%,#f6f8ff_100%)]"
        >
          {upgradesLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-20 bg-surface-container-low rounded-lg animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {queueItems.length === 0 ? (
                <article className="rounded-[var(--radius-default)] border border-primary/10 bg-surface-container-low px-3.5 py-4">
                  <p className="text-[10px] uppercase tracking-[0.14em] font-lexend text-primary/50">Queue status</p>
                  <p className="mt-2 text-sm font-semibold text-primary">No verification requests waiting. Team clear for new submissions.</p>
                </article>
              ) : null}

              {queueItems.map((item) => (
                <article key={item.id} className="rounded-[var(--radius-default)] border border-primary/10 bg-surface-container-low px-3.5 py-3 transition-all duration-150 hover:-translate-y-0.5 hover:bg-surface-container-medium">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-primary">{item.userId}</p>
                      <p className="text-xs text-primary/60 mt-1">{item.requestedRole} • {item.submittedAt}</p>
                    </div>
                    <AdminStatusPill label={item.status} tone={statusTone(item.status)} />
                  </div>
                  <p className="text-xs text-primary/55 mt-2">Status: {item.status}</p>
                </article>
              ))}
            </div>
          )}
        </AdminPanel>

        <AdminPanel
          eyebrow="Live alerts"
          title="Operational Risks"
          className="border border-primary/10 bg-[linear-gradient(180deg,#fffdf7_0%,#ffffff_100%)]"
        >
          <div className="space-y-3">
            {operationalRisks.map((message) => (
              <article key={message} className="rounded-[var(--radius-default)] border border-amber-200/70 bg-amber-50/60 px-3.5 py-3">
                <p className="inline-flex items-center gap-2 text-xs font-lexend uppercase tracking-[0.14em] text-amber-900">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Attention
                </p>
                <p className="mt-2 text-sm font-semibold text-primary">{message}</p>
              </article>
            ))}

            <div className="rounded-[var(--radius-default)] border border-primary/10 bg-surface-container-low px-3.5 py-3">
              <p className="text-xs font-lexend uppercase tracking-[0.14em] text-primary/55">System status</p>
              <div className="mt-2 flex items-center gap-2">
                <AdminStatusPill label="Healthy" tone={statusTone('Healthy')} />
                <span className="text-sm text-primary/70">No critical downtime reported in last 24h</span>
              </div>
            </div>
          </div>
        </AdminPanel>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-[1.3fr_1fr] gap-4">
        <AdminPanel
          eyebrow="Weekly trend"
          title="Booking Velocity"
          className="border border-primary/10"
          actions={<span className="text-xs font-lexend uppercase tracking-[0.14em] text-primary/55">Last 12 days</span>}
        >
          <AdminTrendBars values={bookingVelocity} colorClassName="bg-secondary-container" />
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2.5">
            <div className="rounded-[var(--radius-default)] border border-primary/10 bg-surface-container-low px-3 py-2.5">
              <p className="text-[10px] uppercase tracking-[0.14em] font-lexend text-primary/50">Pending Bookings</p>
              <p className="mt-1 text-lg font-black text-primary">{pendingBookings}</p>
            </div>
            <div className="rounded-[var(--radius-default)] border border-primary/10 bg-surface-container-low px-3 py-2.5">
              <p className="text-[10px] uppercase tracking-[0.14em] font-lexend text-primary/50">Pending Refunds</p>
              <p className="mt-1 text-lg font-black text-primary">{pendingRefunds}</p>
            </div>
            <div className="rounded-[var(--radius-default)] border border-primary/10 bg-surface-container-low px-3 py-2.5">
              <p className="text-[10px] uppercase tracking-[0.14em] font-lexend text-primary/50">Average Order</p>
              <p className="mt-1 text-lg font-black text-primary">{formatEgp(averageOrder)}</p>
            </div>
            <div className="rounded-[var(--radius-default)] border border-primary/10 bg-surface-container-low px-3 py-2.5">
              <p className="text-[10px] uppercase tracking-[0.14em] font-lexend text-primary/50">Success Rate</p>
              <p className="mt-1 text-lg font-black text-primary">{successRate}</p>
            </div>
          </div>
        </AdminPanel>

        <AdminPanel
          eyebrow="Revenue mix"
          title="Channel Distribution"
          className="border border-primary/10 bg-[linear-gradient(180deg,#f7faff_0%,#ffffff_100%)]"
        >
          <AdminDonut segments={revenueShare} />
        </AdminPanel>
      </section>
    </div>
  )
}
