'use client'

import { useMemo, useState } from 'react'
import { CalendarRange, Download } from 'lucide-react'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { AdminPanel } from '@/components/admin/AdminPanel'
import { AdminStatCard } from '@/components/admin/AdminStatCard'
import { AdminStatusPill } from '@/components/admin/AdminStatusPill'
import { AdminTable } from '@/components/admin/AdminTable'
import { branchesData, getBranchNameById, reportJobs } from '@/lib/operator/mockData'
import { statusTone } from '@/lib/admin/ui'

const branchOptions = ['All', ...branchesData.map((branch) => branch.id)] as const
const presetOptions = ['Revenue Heatmap', 'Utilization by Court', 'Cancellation Analysis', 'Staff Coverage'] as const

export default function OperatorReportsPage() {
  const [selectedBranch, setSelectedBranch] = useState<(typeof branchOptions)[number]>('All')
  const [selectedPreset, setSelectedPreset] = useState<(typeof presetOptions)[number]>('Revenue Heatmap')
  const [dateRange, setDateRange] = useState('Last 30 days')

  const visibleJobs = useMemo(() => {
    if (selectedBranch === 'All') return reportJobs
    return reportJobs.filter((job) => job.branchId === selectedBranch)
  }, [selectedBranch])

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Operator Reports"
        subtitle="Generate branch-level performance reports, automate exports, and keep stakeholders updated with scheduled jobs."
      />

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <AdminStatCard label="Healthy Jobs" value={String(reportJobs.filter((job) => job.status === 'Healthy').length)} delta="automations running" trend="up" />
        <AdminStatCard label="Needs Review" value={String(reportJobs.filter((job) => job.status === 'Needs Review').length)} delta="requires intervention" trend="down" />
        <AdminStatCard label="Delivery SLA" value="97.9%" delta="on-time report generation" trend="up" />
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-[1fr_1.2fr] gap-4">
        <AdminPanel eyebrow="Builder" title="Create Report">
          <div className="space-y-3">
            <label className="block rounded-[var(--radius-default)] bg-surface-container-low p-3.5">
              <span className="text-xs font-lexend uppercase tracking-[0.14em] text-primary/55">Preset</span>
              <select
                value={selectedPreset}
                onChange={(event) => setSelectedPreset(event.target.value as (typeof presetOptions)[number])}
                className="mt-2 w-full bg-transparent text-lg font-bold text-primary outline-none"
              >
                {presetOptions.map((preset) => (
                  <option key={preset} value={preset}>
                    {preset}
                  </option>
                ))}
              </select>
            </label>

            <label className="block rounded-[var(--radius-default)] bg-surface-container-low p-3.5">
              <span className="text-xs font-lexend uppercase tracking-[0.14em] text-primary/55">Branch scope</span>
              <select
                value={selectedBranch}
                onChange={(event) => setSelectedBranch(event.target.value as (typeof branchOptions)[number])}
                className="mt-2 w-full bg-transparent text-lg font-bold text-primary outline-none"
              >
                {branchOptions.map((branchId) => (
                  <option key={branchId} value={branchId}>
                    {branchId === 'All' ? 'All Branches' : getBranchNameById(branchId)}
                  </option>
                ))}
              </select>
            </label>

            <label className="block rounded-[var(--radius-default)] bg-surface-container-low p-3.5">
              <span className="text-xs font-lexend uppercase tracking-[0.14em] text-primary/55">Date range</span>
              <input
                value={dateRange}
                onChange={(event) => setDateRange(event.target.value)}
                className="mt-2 w-full bg-transparent text-lg font-bold text-primary outline-none"
              />
            </label>

            <div className="flex items-center gap-2">
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full bg-primary-container px-4 py-2 text-sm font-semibold text-surface-container-lowest"
              >
                <CalendarRange className="w-4 h-4" />
                Schedule
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full bg-surface-container-low px-4 py-2 text-sm font-semibold text-primary"
              >
                <Download className="w-4 h-4" />
                Generate Now
              </button>
            </div>
          </div>
        </AdminPanel>

        <AdminPanel eyebrow="Automation" title="Scheduled Jobs">
          <AdminTable
            items={visibleJobs}
            getRowKey={(job) => job.id}
            columns={[
              {
                key: 'name',
                header: 'Report',
                render: (job) => (
                  <div>
                    <p className="font-bold text-primary">{job.name}</p>
                    <p className="text-xs text-primary/60 mt-1">Owner: {job.owner}</p>
                  </div>
                ),
              },
              {
                key: 'branch',
                header: 'Branch',
                render: (job) => <p className="text-sm text-primary/75">{getBranchNameById(job.branchId)}</p>,
              },
              {
                key: 'frequency',
                header: 'Frequency',
                render: (job) => <p className="text-sm text-primary/75">{job.frequency}</p>,
              },
              {
                key: 'format',
                header: 'Format',
                render: (job) => <p className="text-sm text-primary/75">{job.format}</p>,
              },
              {
                key: 'status',
                header: 'Status',
                render: (job) => <AdminStatusPill label={job.status} tone={statusTone(job.status)} />,
              },
              {
                key: 'lastRun',
                header: 'Last Run',
                render: (job) => <p className="text-sm text-primary/70">{job.lastRun}</p>,
              },
            ]}
          />
        </AdminPanel>
      </section>
    </div>
  )
}
