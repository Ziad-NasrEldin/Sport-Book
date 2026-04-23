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
  const cancellationRatio = dashboardData.cancellationRatio ?? '0%'
  const attentionItems: Array<{ message: string; severity: string }> = dashboardData.attentionItems || []

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
    <div className="space-y-6 motion-safe:animate-[var(--animate-fade-in)]">
      <AdminPageHeader
        title="Operator Dashboard"
        subtitle="Run every facility from one command center covering occupancy, booking momentum, approvals, and branch-level risks."
        className="motion-safe:animate-[var(--animate-soft-drop)]"
        actions={
          <>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-surface-container-low to-surface-container-high px-4 py-2 text-sm font-bold text-primary shadow-[0_8px_24px_-12px_rgba(0,17,58,0.6)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_32px_-14px_rgba(0,17,58,0.85)] active:translate-y-0 motion-safe:hover:scale-[1.03] motion-safe:active:scale-[0.97]"
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
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-primary to-primary-container px-4 py-2 text-sm font-bold text-surface-container-lowest shadow-[0_20px_40px_-20px_rgba(0,35,102,1)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_28px_48px_-18px_rgba(0,35,102,1.1)] active:translate-y-0 motion-safe:hover:scale-[1.03] motion-safe:active:scale-[0.97]"
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
          operatorMetrics.map((metric: any, index: number) => (
            <div key={metric.id} className="motion-safe:animate-[var(--animate-card-stagger)]" style={{ animationDelay: `${index * 80}ms` }}>
              <AdminStatCard
                label={metric.label}
                value={metric.value}
                delta={metric.delta}
                trend={metric.trend}
              />
            </div>
          ))
        )}
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-[1.3fr_1fr] gap-4">
        <AdminPanel
          eyebrow="Operations"
          title="Utilization Velocity"
          actions={<span className="text-xs font-lexend uppercase tracking-[0.14em] text-primary/55">Last 12 days</span>}
          className="motion-safe:animate-[var(--animate-soft-rise)] animation-delay-100"
        >
          <AdminTrendBars values={utilizationVelocity} colorClassName="bg-secondary-container" />
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2.5">
            <div className="rounded-[var(--radius-default)] bg-gradient-to-br from-surface-container-low to-surface-container-high px-3 py-2.5 shadow-[0_8px_20px_-12px_rgba(0,17,58,0.4)] motion-safe:animate-[var(--animate-card-stagger)]" style={{ animationDelay: '120ms' }}>
              <p className="text-[10px] uppercase tracking-[0.14em] font-lexend text-primary/60">Pending Approvals</p>
              <p className="mt-1 text-xl font-black text-primary">{pendingApprovals.length}</p>
            </div>
            <div className="rounded-[var(--radius-default)] bg-gradient-to-br from-surface-container-low to-surface-container-high px-3 py-2.5 shadow-[0_8px_20px_-12px_rgba(0,17,58,0.4)] motion-safe:animate-[var(--animate-card-stagger)]" style={{ animationDelay: '150ms' }}>
              <p className="text-[10px] uppercase tracking-[0.14em] font-lexend text-primary/60">Live Courts</p>
              <p className="mt-1 text-xl font-black text-primary">
                {courtsData.filter((court: any) => court.status === 'ACTIVE').length}
              </p>
            </div>
            <div className="rounded-[var(--radius-default)] bg-gradient-to-br from-surface-container-low to-surface-container-high px-3 py-2.5 shadow-[0_8px_20px_-12px_rgba(0,17,58,0.4)] motion-safe:animate-[var(--animate-card-stagger)]" style={{ animationDelay: '180ms' }}>
              <p className="text-[10px] uppercase tracking-[0.14em] font-lexend text-primary/60">Revenue Today</p>
              <p className="mt-1 text-xl font-black text-primary">{formatEgp(todayRevenue)}</p>
            </div>
            <div className="rounded-[var(--radius-default)] bg-gradient-to-br from-surface-container-low to-surface-container-high px-3 py-2.5 shadow-[0_8px_20px_-12px_rgba(0,17,58,0.4)] motion-safe:animate-[var(--animate-card-stagger)]" style={{ animationDelay: '210ms' }}>
              <p className="text-[10px] uppercase tracking-[0.14em] font-lexend text-primary/60">Cancellation Ratio</p>
              <p className="mt-1 text-xl font-black text-primary">{cancellationRatio}</p>
            </div>
          </div>
        </AdminPanel>

        <AdminPanel eyebrow="Court mix" title="Sport Distribution" className="motion-safe:animate-[var(--animate-soft-rise)] animation-delay-150">
          <AdminDonut segments={sportDistribution} />
        </AdminPanel>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-[1.2fr_1fr] gap-4">
        <AdminPanel eyebrow="Approvals queue" title="Latest Requests" className="motion-safe:animate-[var(--animate-soft-rise)] animation-delay-200">
          <div className="space-y-3">
            {pendingApprovals.length === 0 ? (
              <article className="rounded-[var(--radius-default)] bg-gradient-to-br from-surface-container-low to-surface-container-high px-3.5 py-3 shadow-[0_8px_20px_-12px_rgba(0,17,58,0.3)] motion-safe:animate-[var(--animate-empty-bob)]">
                <p className="text-sm font-bold text-primary">No pending approvals right now.</p>
              </article>
            ) : (
              pendingApprovals.map((request: any, index: number) => (
                <article key={request.id} className="rounded-[var(--radius-default)] bg-gradient-to-br from-surface-container-low to-surface-container-high px-3.5 py-3 shadow-[0_8px_20px_-12px_rgba(0,17,58,0.3)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_32px_-14px_rgba(0,17,58,0.5)] motion-safe:animate-[var(--animate-stagger-pop)]" style={{ animationDelay: `${220 + index * 50}ms` }}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-black text-primary">{request.subject || 'Unknown'}</p>
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

        <AdminPanel eyebrow="Risk watch" title="Attention Needed" className="motion-safe:animate-[var(--animate-soft-rise)] animation-delay-250">
          <div className="space-y-3">
            {attentionItems.map((item, index: number) => (
              <article key={item.message} className="rounded-[var(--radius-default)] bg-gradient-to-br from-surface-container-low to-surface-container-high px-3.5 py-3 shadow-[0_8px_20px_-12px_rgba(0,17,58,0.3)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_32px_-14px_rgba(0,17,58,0.5)] motion-safe:animate-[var(--animate-stagger-pop)]" style={{ animationDelay: `${270 + index * 50}ms` }}>
                <p className="inline-flex items-center gap-2 text-xs font-lexend uppercase tracking-[0.14em] text-amber-600 font-bold">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Attention
                </p>
                <p className="mt-2 text-sm font-black text-primary">{item.message}</p>
              </article>
            ))}
          </div>
        </AdminPanel>
      </section>
    </div>
  )
}
