import { AlertTriangle, Download, RefreshCw } from 'lucide-react'
import { AdminDonut } from '@/components/admin/AdminDonut'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { AdminPanel } from '@/components/admin/AdminPanel'
import { AdminStatCard } from '@/components/admin/AdminStatCard'
import { AdminStatusPill } from '@/components/admin/AdminStatusPill'
import { AdminTrendBars } from '@/components/admin/AdminTrendBars'
import {
  approvalsData,
  courtsData,
  formatEgp,
  operatorBookingsData,
  operatorMetrics,
} from '@/lib/operator/mockData'
import { statusTone } from '@/lib/admin/ui'

const utilizationVelocity = [62, 68, 71, 66, 73, 79, 76, 82, 84, 80, 86, 88]

const colorMap: Record<string, string> = {
  Padel: '#002366',
  Tennis: '#fd8b00',
  Football: '#c3f400',
  Basketball: '#4f46e5',
}

export default function OperatorDashboardPage() {
  const pendingApprovals = approvalsData.filter((item) => item.status === 'Pending')
  const todayRevenue = operatorBookingsData
    .filter((booking) => booking.status === 'Confirmed' || booking.status === 'Completed')
    .reduce((total, booking) => total + booking.amount, 0)

  const bySport = courtsData.reduce<Record<string, number>>((acc, court) => {
    acc[court.sport] = (acc[court.sport] ?? 0) + 1
    return acc
  }, {})

  const sportDistribution = Object.entries(bySport).map(([label, value]) => ({
    label,
    value,
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
              className="inline-flex items-center gap-2 rounded-full bg-primary-container px-4 py-2 text-sm font-semibold text-surface-container-lowest"
            >
              <Download className="w-4 h-4" />
              Export Summary
            </button>
          </>
        }
      />

      <section className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-4 gap-4">
        {operatorMetrics.map((metric) => (
          <AdminStatCard
            key={metric.id}
            label={metric.label}
            value={metric.value}
            delta={metric.delta}
            trend={metric.trend}
          />
        ))}
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
                {courtsData.filter((court) => court.status === 'Active').length}
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
              pendingApprovals.map((request) => (
                <article key={request.id} className="rounded-[var(--radius-default)] bg-surface-container-low px-3.5 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-primary">{request.subject}</p>
                      <p className="text-xs text-primary/60 mt-1">{request.type} • {request.requestedBy}</p>
                    </div>
                    <AdminStatusPill label={request.status} tone={statusTone(request.status)} />
                  </div>
                  <p className="text-xs text-primary/55 mt-2">Submitted {request.submittedAt}</p>
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
