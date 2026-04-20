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
    <div className="space-y-6">
      <AdminPageHeader
        title="Finance and Transactions"
        subtitle="Track settlements, payouts, refunds, and suspicious payment flows from one financial control center."
        actions={
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full bg-primary-container px-4 py-2 text-sm font-semibold text-surface-container-lowest"
          >
            <Download className="w-4 h-4" />
            Download Statement
          </button>
        }
      />

      <section className="grid grid-cols-1 xl:grid-cols-[1.1fr_1fr] gap-4">
        <AdminPanel eyebrow="Monthly net trend" title="Revenue Momentum">
          {summaryLoading ? (
            <SkeletonStat />
          ) : (
            <AdminTrendBars values={revenueTrend} colorClassName="bg-primary-container" />
          )}
          <div className="mt-4 grid grid-cols-2 gap-3">
            <article className="rounded-[var(--radius-default)] bg-surface-container-low p-3.5">
              <p className="text-xs font-lexend uppercase tracking-[0.14em] text-primary/55">Settled amount</p>
              <p className="mt-1 text-xl font-extrabold text-primary">{formatEgp(settledTotal)}</p>
            </article>
            <article className="rounded-[var(--radius-default)] bg-surface-container-low p-3.5">
              <p className="text-xs font-lexend uppercase tracking-[0.14em] text-primary/55">Payout due tomorrow</p>
              <p className="mt-1 text-xl font-extrabold text-primary">{formatEgp(payoutDue)}</p>
            </article>
          </div>
        </AdminPanel>

        <AdminPanel eyebrow="Risk snapshot" title="Payment Reliability">
          <div className="space-y-3">
            {riskIndicators.map((risk) => (
              <article key={risk.title} className="rounded-[var(--radius-default)] bg-surface-container-low p-3.5">
                <p className="text-sm font-bold text-primary">{risk.title}</p>
                <p className="text-xs text-primary/60 mt-1">{risk.description}</p>
              </article>
            ))}
            {riskIndicators.length === 0 && (
              <article className="rounded-[var(--radius-default)] bg-surface-container-low p-3.5">
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
                render: (row: any) => <p className="text-sm font-semibold text-primary">{formatEgp(row.amount || 0)}</p>,
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
