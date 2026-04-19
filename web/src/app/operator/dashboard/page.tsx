'use client'

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
import { exportToCsv } from '@/lib/export'

const colorMap: Record<string, string> = {
  Padel: '#002366',
  Tennis: '#fd8b00',
  Football: '#c3f400',
  Basketball: '#4f46e5',
}

function formatEgp(value: number) {
  return new Intl.NumberFormat('en-EG', {
    style: 'currency',
    currency: 'EGP',
    maximumFractionDigits: 0,
  }).format(value)
}

export default function OperatorDashboardPage() {
  const { data: dashboardResponse, loading, error } = useApiCall('/operator/dashboard')
  const dashboardData = dashboardResponse?.data || dashboardResponse || {}

  if (error) {
    return <APIErrorFallback error={error} onRetry={() => window.location.reload()} />
  }

  const operatorMetrics = dashboardData.metrics || []
  const approvalsData = dashboardData.approvals || []
  const courtsData = dashboardData.courts || []
  const operatorBookingsData = dashboardData.bookings || []
  const utilizationVelocity = dashboardData.utilizationVelocity || []

  const pendingApprovals = approvalsData.filter((item: any) => item.status === 'PENDING')
  const todayRevenue = operatorBookingsData
    .filter((booking: any) => booking.status === 'CONFIRMED' || booking.status === 'COMPLETED')
    .reduce((total: number, booking: any) => total + (booking.amount || 0), 0)

  const bySport = courtsData.reduce((acc: Record<string, number>, court: any) => {
    const sportName = typeof court.sport === 'string' ? court.sport : (court.sport?.displayName || court.sport?.name || '')
    acc[sportName] = (acc[sportName] ?? 0) + 1
    return acc
  }, {} as Record<string, number>)

  const sportDistribution = Object.entries(bySport).map(([label, value]) => ({
    label,
    value: value as number,
    color: colorMap[label] ?? '#64748b',
  }))

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Operator Dashboard"
        subtitle="Run every facility from one command center covering occupancy, booking momentum, approvals, and branch-level risks."
        actions={
          <>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full bg-surface-container-low px-4 py-2 text-sm font-semibold text-primary"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh Feed
            </button>
            <button
              type="button"
              onClick={() => {
                const headers = ['ID', 'Label', 'Value', 'Delta', 'Trend']
                const rows = operatorMetrics.map((m: any) => [m.id || '', m.label || '', String(m.value || ''), String(m.delta || ''), m.trend || ''])
                exportToCsv('dashboard-summary.csv', headers, rows)
              }}
              className="inline-flex items-center gap-2 rounded-full bg-primary-container px-4 py-2 text-sm font-semibold text-surface-container-lowest"
            >
              <Download className="w-4 h-4" />
              Export Summary
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
          operatorMetrics.map((metric: any) => (
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
          eyebrow="Operations"
          title="Utilization Velocity"
          actions={<span className="text-xs font-lexend uppercase tracking-[0.14em] text-primary/55">Last 12 days</span>}
        >
          <AdminTrendBars values={utilizationVelocity} colorClassName="bg-secondary-container" />
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2.5">
            <div className="rounded-[var(--radius-default)] bg-surface-container-low px-3 py-2.5">
              <p className="text-[10px] uppercase tracking-[0.14em] font-lexend text-primary/50">Pending Approvals</p>
              <p className="mt-1 text-lg font-extrabold text-primary">{pendingApprovals.length}</p>
            </div>
            <div className="rounded-[var(--radius-default)] bg-surface-container-low px-3 py-2.5">
              <p className="text-[10px] uppercase tracking-[0.14em] font-lexend text-primary/50">Live Courts</p>
              <p className="mt-1 text-lg font-extrabold text-primary">
                {courtsData.filter((court: any) => court.status === 'ACTIVE').length}
              </p>
            </div>
            <div className="rounded-[var(--radius-default)] bg-surface-container-low px-3 py-2.5">
              <p className="text-[10px] uppercase tracking-[0.14em] font-lexend text-primary/50">Revenue Today</p>
              <p className="mt-1 text-lg font-extrabold text-primary">{formatEgp(todayRevenue)}</p>
            </div>
            <div className="rounded-[var(--radius-default)] bg-surface-container-low px-3 py-2.5">
              <p className="text-[10px] uppercase tracking-[0.14em] font-lexend text-primary/50">Cancellation Ratio</p>
              <p className="mt-1 text-lg font-extrabold text-primary">4.8%</p>
            </div>
          </div>
        </AdminPanel>

        <AdminPanel eyebrow="Court mix" title="Sport Distribution">
          <AdminDonut segments={sportDistribution} />
        </AdminPanel>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-[1.2fr_1fr] gap-4">
        <AdminPanel eyebrow="Approvals queue" title="Latest Requests">
          <div className="space-y-3">
            {pendingApprovals.length === 0 ? (
              <article className="rounded-[var(--radius-default)] bg-surface-container-low px-3.5 py-3">
                <p className="text-sm font-semibold text-primary">No pending approvals right now.</p>
              </article>
            ) : (
              pendingApprovals.map((request: any) => (
                <article key={request.id} className="rounded-[var(--radius-default)] bg-surface-container-low px-3.5 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-primary">{request.subject || 'Unknown'}</p>
                      <p className="text-xs text-primary/60 mt-1">{request.type || 'Unknown'} • {request.requestedBy || 'Unknown'}</p>
                    </div>
                    <AdminStatusPill label={request.status || 'Unknown'} tone={statusTone(request.status || 'Unknown')} />
                  </div>
                  <p className="text-xs text-primary/55 mt-2">Submitted {new Date(request.submittedAt).toLocaleString()}</p>
                </article>
              ))
            )}
          </div>
        </AdminPanel>

        <AdminPanel eyebrow="Risk watch" title="Attention Needed">
          <div className="space-y-3">
            {[
              'Football Field C1 is blocked for urgent maintenance and needs reassignment plan.',
              'Alex Seaview branch setup is still pending compliance checklist completion.',
              'Two high-priority discount overrides are awaiting manager approval.',
            ].map((message) => (
              <article key={message} className="rounded-[var(--radius-default)] bg-surface-container-low px-3.5 py-3">
                <p className="inline-flex items-center gap-2 text-xs font-lexend uppercase tracking-[0.14em] text-amber-800">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Attention
                </p>
                <p className="mt-2 text-sm font-semibold text-primary">{message}</p>
              </article>
            ))}
          </div>
        </AdminPanel>
      </section>
    </div>
  )
}
