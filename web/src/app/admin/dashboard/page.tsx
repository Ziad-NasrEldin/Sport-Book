import { AlertTriangle, Download, RefreshCw } from 'lucide-react'
import { AdminDonut } from '@/components/admin/AdminDonut'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { AdminPanel } from '@/components/admin/AdminPanel'
import { AdminStatCard } from '@/components/admin/AdminStatCard'
import { AdminStatusPill } from '@/components/admin/AdminStatusPill'
import { AdminTrendBars } from '@/components/admin/AdminTrendBars'
import {
  bookingsData,
  dashboardMetrics,
  formatEgp,
  transactionsData,
  verificationQueue,
} from '@/lib/admin/mockData'
import { riskTone, statusTone } from '@/lib/admin/ui'

const bookingVelocity = [41, 56, 62, 58, 71, 68, 79, 87, 91, 85, 98, 102]

const revenueShare = [
  { label: 'Facilities', value: 52, color: '#002366' },
  { label: 'Coaching', value: 31, color: '#fd8b00' },
  { label: 'Marketplace', value: 17, color: '#c3f400' },
]

export default function AdminDashboardPage() {
  const pendingRefunds = transactionsData.filter((item) => item.type === 'Refund').length
  const pendingBookings = bookingsData.filter((item) => item.status === 'Pending').length

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
        {dashboardMetrics.map((metric) => (
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
          <div className="space-y-3">
            {verificationQueue.map((item) => (
              <article key={item.id} className="rounded-[var(--radius-default)] bg-surface-container-low px-3.5 py-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-primary">{item.entity}</p>
                    <p className="text-xs text-primary/60 mt-1">{item.type} • {item.region}</p>
                  </div>
                  <AdminStatusPill label={item.riskLevel} tone={riskTone(item.riskLevel)} />
                </div>
                <p className="text-xs text-primary/55 mt-2">Submitted {item.submittedAt}</p>
              </article>
            ))}
          </div>
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
