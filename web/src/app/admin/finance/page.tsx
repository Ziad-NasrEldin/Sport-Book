import { Download } from 'lucide-react'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { AdminPanel } from '@/components/admin/AdminPanel'
import { AdminStatusPill } from '@/components/admin/AdminStatusPill'
import { AdminTable } from '@/components/admin/AdminTable'
import { AdminTrendBars } from '@/components/admin/AdminTrendBars'
import { formatEgp, transactionsData } from '@/lib/admin/mockData'
import { statusTone } from '@/lib/admin/ui'

const financeBars = [22, 24, 27, 30, 29, 31, 33, 37, 36, 40, 39, 43]

export default function AdminFinancePage() {
  const totalSettled = transactionsData
    .filter((item) => item.status === 'Settled')
    .reduce((sum, item) => sum + item.amount, 0)

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
          <AdminTrendBars values={financeBars} colorClassName="bg-primary-container" />
          <div className="mt-4 grid grid-cols-2 gap-3">
            <article className="rounded-[var(--radius-default)] bg-surface-container-low p-3.5">
              <p className="text-xs font-lexend uppercase tracking-[0.14em] text-primary/55">Settled amount</p>
              <p className="mt-1 text-xl font-extrabold text-primary">{formatEgp(totalSettled)}</p>
            </article>
            <article className="rounded-[var(--radius-default)] bg-surface-container-low p-3.5">
              <p className="text-xs font-lexend uppercase tracking-[0.14em] text-primary/55">Payout due tomorrow</p>
              <p className="mt-1 text-xl font-extrabold text-primary">{formatEgp(118000)}</p>
            </article>
          </div>
        </AdminPanel>

        <AdminPanel eyebrow="Risk snapshot" title="Payment Reliability">
          <div className="space-y-3">
            <article className="rounded-[var(--radius-default)] bg-surface-container-low p-3.5">
              <p className="text-sm font-bold text-primary">Failed Transactions</p>
              <p className="text-xs text-primary/60 mt-1">2 detected today, both flagged for manual retry checks.</p>
            </article>
            <article className="rounded-[var(--radius-default)] bg-surface-container-low p-3.5">
              <p className="text-sm font-bold text-primary">Chargeback Index</p>
              <p className="text-xs text-primary/60 mt-1">0.22%, under the warning threshold of 0.35%.</p>
            </article>
            <article className="rounded-[var(--radius-default)] bg-surface-container-low p-3.5">
              <p className="text-sm font-bold text-primary">Settlement Delay</p>
              <p className="text-xs text-primary/60 mt-1">Median settlement time remains at 2.1 days.</p>
            </article>
          </div>
        </AdminPanel>
      </section>

      <AdminPanel eyebrow="Ledger" title="Recent Transactions">
        <AdminTable
          items={transactionsData}
          getRowKey={(row) => row.id}
          columns={[
            {
              key: 'id',
              header: 'Transaction',
              render: (row) => (
                <div>
                  <p className="font-bold text-primary">{row.id}</p>
                  <p className="text-xs text-primary/60 mt-1">{row.source}</p>
                </div>
              ),
            },
            {
              key: 'type',
              header: 'Type',
              render: (row) => <p className="text-sm text-primary/75">{row.type}</p>,
            },
            {
              key: 'amount',
              header: 'Amount',
              render: (row) => <p className="text-sm font-semibold text-primary">{formatEgp(row.amount)}</p>,
            },
            {
              key: 'method',
              header: 'Method',
              render: (row) => <p className="text-sm text-primary/75">{row.method}</p>,
            },
            {
              key: 'status',
              header: 'Status',
              render: (row) => <AdminStatusPill label={row.status} tone={statusTone(row.status)} />,
            },
            {
              key: 'time',
              header: 'Timestamp',
              render: (row) => <p className="text-sm text-primary/70">{row.createdAt}</p>,
            },
          ]}
        />
      </AdminPanel>
    </div>
  )
}
