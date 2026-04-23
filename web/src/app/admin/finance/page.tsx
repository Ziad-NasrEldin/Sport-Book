'use client'

import { Download } from 'lucide-react'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { AdminPanel } from '@/components/admin/AdminPanel'
import { AdminStatusPill } from '@/components/admin/AdminStatusPill'
import { AdminTable } from '@/components/admin/AdminTable'
import { AdminTrendBars } from '@/components/admin/AdminTrendBars'
import { SkeletonTable } from '@/components/ui/SkeletonLoader'
import { SkeletonStat } from '@/components/ui/SkeletonLoader'
import { useApiCall } from '@/lib/api/hooks'
import { APIErrorFallback } from '@/components/ui/ErrorBoundary'
import { statusTone } from '@/lib/admin/ui'

function formatEgp(value: number) {
  return new Intl.NumberFormat('en-EG', {
    style: 'currency',
    currency: 'EGP',
    maximumFractionDigits: 0,
  }).format(value)
}

type RiskIndicator = {
  title: string
  description: string
  severity: 'low' | 'medium' | 'high'
}

export default function AdminFinancePage() {
  const { data: transactionsResponse, loading, error } = useApiCall('/admin-workspace/finance')
  const { data: summaryData, loading: summaryLoading } = useApiCall('/admin-workspace/finance/summary')
  const transactionsData = transactionsResponse?.data || transactionsResponse || []

  const settledTotal = summaryData?.settledTotal ?? 0
  const payoutDue = summaryData?.payoutDue ?? 0
  const revenueTrend: number[] = summaryData?.revenueTrend ?? []
  const riskIndicators: RiskIndicator[] = summaryData?.riskIndicators ?? []

  if (error) {
    return <APIErrorFallback error={error} onRetry={() => window.location.reload()} />
  }

  const severityTone = (severity: string) => {
    if (severity === 'high') return statusTone('Rejected')
    if (severity === 'medium') return statusTone('Pending')
    return statusTone('Healthy')
  }

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Finance and Transactions"
        subtitle="Track settlements, payouts, refunds, and suspicious payment flows from one financial control center."
        actions={
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full bg-primary-container px-5 py-2.5 text-sm font-bold text-surface-container-lowest hover:opacity-90 hover:scale-[1.03] active:scale-[0.97] transition-all shadow-lg shadow-primary-container/20"
          >
            <Download className="w-4 h-4" />
            Download Statement
          </button>
        }
      />

      <section className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-6">
        <AdminPanel eyebrow="Monthly net trend" title="Revenue Momentum" className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-container/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          {summaryLoading ? (
            <SkeletonStat />
          ) : (
            <AdminTrendBars values={revenueTrend} colorClassName="bg-primary-container" />
          )}
          <div className="mt-6 grid grid-cols-2 gap-4 relative">
            <article className="rounded-2xl bg-gradient-to-br from-surface-container-low to-surface-container p-5 border border-primary/10 shadow-lg">
              <p className="text-[10px] font-lexend uppercase tracking-[0.2em] text-primary/50 mb-2">Settled amount</p>
              <p className="text-4xl font-black text-primary tracking-tight leading-none">{formatEgp(settledTotal)}</p>
            </article>
            <article className="rounded-2xl bg-gradient-to-br from-surface-container-low to-surface-container p-5 border border-primary/10 shadow-lg">
              <p className="text-[10px] font-lexend uppercase tracking-[0.2em] text-primary/50 mb-2">Payout due tomorrow</p>
              <p className="text-4xl font-black text-primary tracking-tight leading-none">{formatEgp(payoutDue)}</p>
            </article>
          </div>
        </AdminPanel>

        <AdminPanel eyebrow="Risk snapshot" title="Payment Reliability">
          <div className="space-y-3">
            {riskIndicators.map((risk) => (
              <article 
                key={risk.title} 
                className="rounded-xl bg-gradient-to-br from-surface-container-low to-surface-container p-4 border border-primary/10 shadow-sm relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-[var(--color-amber-500)]" />
                <p className="text-sm font-bold text-primary pl-3">{risk.title}</p>
                <p className="text-xs text-primary/60 mt-1 pl-3">{risk.description}</p>
              </article>
            ))}
            {riskIndicators.length === 0 && (
              <article className="rounded-xl bg-surface-container-low p-4">
                <p className="text-sm font-semibold text-primary">No risk indicators available yet.</p>
              </article>
            )}
          </div>
        </AdminPanel>
      </section>

      <AdminPanel eyebrow="Ledger" title="Recent Transactions">
        {loading ? (
          <SkeletonTable rows={10} />
        ) : (
          <AdminTable
            items={transactionsData}
            getRowKey={(row: any) => row.id}
            columns={[
              {
                key: 'id',
                header: 'Transaction',
                render: (row: any) => (
                  <div>
                    <p className="font-bold text-primary">{row.id || 'Unknown'}</p>
                    <p className="text-xs text-primary/60 mt-1">{row.source || row.bookingId || 'Unknown'}</p>
                  </div>
                ),
              },
              {
                key: 'type',
                header: 'Type',
                render: (row: any) => <p className="text-sm text-primary/75">{row.type || 'Unknown'}</p>,
              },
              {
                key: 'amount',
                header: 'Amount',
                render: (row: any) => <p className="text-sm font-bold text-primary">{formatEgp(row.amount || 0)}</p>,
              },
              {
                key: 'method',
                header: 'Method',
                render: (row: any) => <p className="text-sm text-primary/75">{row.method || 'Unknown'}</p>,
              },
              {
                key: 'status',
                header: 'Status',
                render: (row: any) => <AdminStatusPill label={row.status || 'Unknown'} tone={statusTone(row.status || 'Unknown')} />,
              },
              {
                key: 'time',
                header: 'Timestamp',
                render: (row: any) => <p className="text-sm text-primary/70">{new Date(row.createdAt).toLocaleString()}</p>,
              },
            ]}
          />
        )}
      </AdminPanel>
    </div>
  )
}
