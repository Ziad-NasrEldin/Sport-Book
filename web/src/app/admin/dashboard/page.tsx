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

const bookingVelocity = [41, 56, 62, 58, 71, 68, 79, 87, 91, 85, 98, 102]

const revenueShare = [
  { label: 'Facilities', value: 52, color: '#002366' },
  { label: 'Coaching', value: 31, color: '#fd8b00' },
  { label: 'Marketplace', value: 17, color: '#c3f400' },
]

function formatEgp(value: number) {
  return new Intl.NumberFormat('en-EG', {
    style: 'currency',
    currency: 'EGP',
    maximumFractionDigits: 0,
  }).format(value)
}

export default function AdminDashboardPage() {
  const { data: dashboardData, loading: dashboardLoading, error: dashboardError } = useApiCall('/admin-workspace/dashboard')
  const { data: roleUpgrades, loading: upgradesLoading, error: upgradesError } = useApiCall('/admin-workspace/role-upgrades')
  const { data: bookings, loading: bookingsLoading } = useApiCall('/admin-workspace/bookings')
  const { data: transactions, loading: transactionsLoading } = useApiCall('/admin-workspace/finance')

  const dashboardMetrics = dashboardData?.metrics || []
  const pendingRefunds = transactions?.filter?.((item: any) => item.type === 'Refund')?.length || 0
  const pendingBookings = bookings?.filter?.((item: any) => item.status === 'PENDING')?.length || 0

  if (dashboardError) {
    return <APIErrorFallback error={dashboardError} onRetry={() => window.location.reload()} />
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Platform Dashboard"
        subtitle="Track operational health across users, verification flow, booking momentum, and financial stability in one command center."
        actions={
          <>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full bg-surface-container-low px-4 py-2 text-sm font-semibold text-primary"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh KPIs
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full bg-primary-container px-4 py-2 text-sm font-semibold text-surface-container-lowest"
            >
              <Download className="w-4 h-4" />
              Export Snapshot
            </button>
          </>
        }
      />

      <section className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-4 gap-4">
        {dashboardLoading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonStat key={i} />)
        ) : (
          dashboardMetrics.map((metric: any) => (
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
          eyebrow="Weekly trend"
          title="Booking Velocity"
          actions={<span className="text-xs font-lexend uppercase tracking-[0.14em] text-primary/55">Last 12 days</span>}
        >
          <AdminTrendBars values={bookingVelocity} colorClassName="bg-secondary-container" />
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2.5">
            <div className="rounded-[var(--radius-default)] bg-surface-container-low px-3 py-2.5">
              <p className="text-[10px] uppercase tracking-[0.14em] font-lexend text-primary/50">Pending Bookings</p>
              <p className="mt-1 text-lg font-extrabold text-primary">{pendingBookings}</p>
            </div>
            <div className="rounded-[var(--radius-default)] bg-surface-container-low px-3 py-2.5">
              <p className="text-[10px] uppercase tracking-[0.14em] font-lexend text-primary/50">Pending Refunds</p>
              <p className="mt-1 text-lg font-extrabold text-primary">{pendingRefunds}</p>
            </div>
            <div className="rounded-[var(--radius-default)] bg-surface-container-low px-3 py-2.5">
              <p className="text-[10px] uppercase tracking-[0.14em] font-lexend text-primary/50">Average Order</p>
              <p className="mt-1 text-lg font-extrabold text-primary">{formatEgp(580)}</p>
            </div>
            <div className="rounded-[var(--radius-default)] bg-surface-container-low px-3 py-2.5">
              <p className="text-[10px] uppercase tracking-[0.14em] font-lexend text-primary/50">Success Rate</p>
              <p className="mt-1 text-lg font-extrabold text-primary">96.4%</p>
            </div>
          </div>
        </AdminPanel>

        <AdminPanel eyebrow="Revenue mix" title="Channel Distribution">
          <AdminDonut segments={revenueShare} />
        </AdminPanel>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-[1.2fr_1fr] gap-4">
        <AdminPanel eyebrow="Action required" title="Verification Queue">
          {upgradesLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-20 bg-surface-container-low rounded-lg animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {roleUpgrades?.map((item: any) => (
                <article key={item.id} className="rounded-[var(--radius-default)] bg-surface-container-low px-3.5 py-3">
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

        <AdminPanel eyebrow="Live alerts" title="Operational Risks">
          <div className="space-y-3">
            {[
              'Two payout batches are waiting secondary approval from finance.',
              'One suspicious payment pattern detected in Apple Pay transactions.',
              'Three facilities exceeded cancellation ratio threshold this week.',
            ].map((message) => (
              <article key={message} className="rounded-[var(--radius-default)] bg-surface-container-low px-3.5 py-3">
                <p className="inline-flex items-center gap-2 text-xs font-lexend uppercase tracking-[0.14em] text-amber-800">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Attention
                </p>
                <p className="mt-2 text-sm font-semibold text-primary">{message}</p>
              </article>
            ))}

            <div className="rounded-[var(--radius-default)] bg-surface-container-low px-3.5 py-3">
              <p className="text-xs font-lexend uppercase tracking-[0.14em] text-primary/55">System status</p>
              <div className="mt-2 flex items-center gap-2">
                <AdminStatusPill label="Healthy" tone={statusTone('Healthy')} />
                <span className="text-sm text-primary/70">No critical downtime reported in last 24h</span>
              </div>
            </div>
          </div>
        </AdminPanel>
      </section>
    </div>
  )
}
