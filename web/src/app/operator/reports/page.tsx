'use client'

import { useCallback, useMemo, useState } from 'react'
import { CalendarRange, Download } from 'lucide-react'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { AdminPanel } from '@/components/admin/AdminPanel'
import { AdminStatCard } from '@/components/admin/AdminStatCard'
import { AdminStatusPill } from '@/components/admin/AdminStatusPill'
import { AdminTable } from '@/components/admin/AdminTable'
import { SkeletonTable } from '@/components/ui/SkeletonLoader'
import { SkeletonStat } from '@/components/ui/SkeletonLoader'
import { useApiCall } from '@/lib/api/hooks'
import { APIErrorFallback } from '@/components/ui/ErrorBoundary'
import { statusTone } from '@/lib/admin/ui'
import type { ReportJob, BranchRecord } from '@/lib/operator/mockData'
import { AppSelect } from '@/components/ui/AppSelect'

const presetOptions = ['Revenue Heatmap', 'Utilization by Court', 'Cancellation Analysis', 'Staff Coverage'] as const

export default function OperatorReportsPage() {
  const [selectedBranch, setSelectedBranch] = useState<string>('All')
  const [selectedPreset, setSelectedPreset] = useState<(typeof presetOptions)[number]>('Revenue Heatmap')
  const [dateRange, setDateRange] = useState('Last 30 days')

  const { data: reportsResponse, loading, error } = useApiCall('/operator/reports')
  const { data: branchesResponse } = useApiCall('/operator/branches')

  const handleBranchChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedBranch(event.target.value)
  }, [])

  const handlePresetChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedPreset(event.target.value as (typeof presetOptions)[number])
  }, [])

  const handleDateRangeChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setDateRange(event.target.value)
  }, [])

  const reportsData = (() => {
    if (!reportsResponse) return {}
    if (typeof reportsResponse === 'object' && !Array.isArray(reportsResponse) && reportsResponse.data && typeof reportsResponse.data === 'object') return reportsResponse.data
    return reportsResponse
  })()
  const branchesData = Array.isArray(branchesResponse) ? branchesResponse : (Array.isArray(branchesResponse?.data) ? branchesResponse.data : [])
  const reportJobs = reportsData.reportJobs || []
  const metrics = reportsData.metrics || []

  const branchOptions = ['All', ...branchesData.map((branch: BranchRecord) => branch.id)]

  const getBranchNameById = (id: string) => {
    const branch = branchesData.find((b: BranchRecord) => b.id === id)
    return branch?.name || 'Unknown'
  }

  const visibleJobs = useMemo(() => {
    if (selectedBranch === 'All') return reportJobs
    return reportJobs.filter((job: ReportJob) => job.branchId === selectedBranch)
  }, [reportJobs, selectedBranch])

  if (error) {
    return <APIErrorFallback error={error} onRetry={() => window.location.reload()} />
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Operator Reports"
        subtitle="Generate branch-level performance reports, automate exports, and keep stakeholders updated with scheduled jobs."
      />

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {loading ? (
          <>
            <SkeletonStat />
            <SkeletonStat />
            <SkeletonStat />
          </>
        ) : (
          <>
            <AdminStatCard label="Healthy Jobs" value={String(reportJobs.filter((job: any) => job.status === 'HEALTHY').length)} delta="automations running" trend="up" />
            <AdminStatCard label="Needs Review" value={String(reportJobs.filter((job: any) => job.status === 'NEEDS_REVIEW').length)} delta="requires intervention" trend="down" />
            <AdminStatCard label="Delivery SLA" value="97.9%" delta="on-time report generation" trend="up" />
          </>
        )}
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-[1fr_1.2fr] gap-4">
        <AdminPanel eyebrow="Builder" title="Create Report">
          <div className="space-y-3">
            <label className="block rounded-[var(--radius-default)] bg-surface-container-low p-3.5">
              <span className="text-xs font-lexend uppercase tracking-[0.14em] text-primary/55">Preset</span>
              <AppSelect
                value={selectedPreset}
                onChange={handlePresetChange}
                className="mt-2 w-full bg-transparent text-lg font-bold text-primary outline-none"
              >
                {presetOptions.map((preset) => (
                  <option key={preset} value={preset}>
                    {preset}
                  </option>
                ))}
              </AppSelect>
            </label>

            <label className="block rounded-[var(--radius-default)] bg-surface-container-low p-3.5">
              <span className="text-xs font-lexend uppercase tracking-[0.14em] text-primary/55">Branch scope</span>
              <AppSelect
                value={selectedBranch}
                onChange={handleBranchChange}
                className="mt-2 w-full bg-transparent text-lg font-bold text-primary outline-none"
              >
                {branchOptions.map((branchId: any) => (
                  <option key={branchId} value={branchId}>
                    {branchId === 'All' ? 'All Branches' : getBranchNameById(branchId)}
                  </option>
                ))}
              </AppSelect>
            </label>

            <label className="block rounded-[var(--radius-default)] bg-surface-container-low p-3.5">
              <span className="text-xs font-lexend uppercase tracking-[0.14em] text-primary/55">Date range</span>
              <input
                value={dateRange}
                onChange={handleDateRangeChange}
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
          {loading ? (
            <SkeletonTable rows={10} />
          ) : (
            <AdminTable
              items={visibleJobs}
              getRowKey={(job: any) => job.id}
              columns={[
                {
                  key: 'name',
                  header: 'Report',
                  render: (job: any) => (
                    <div>
                      <p className="font-bold text-primary">{job.name || 'Unknown'}</p>
                      <p className="text-xs text-primary/60 mt-1">Owner: {job.owner || 'Unknown'}</p>
                    </div>
                  ),
                },
                {
                  key: 'branch',
                  header: 'Branch',
                  render: (job: any) => <p className="text-sm text-primary/75">{getBranchNameById(job.branchId)}</p>,
                },
                {
                  key: 'frequency',
                  header: 'Frequency',
                  render: (job: any) => <p className="text-sm text-primary/75">{job.frequency || 'Unknown'}</p>,
                },
                {
                  key: 'format',
                  header: 'Format',
                  render: (job: any) => <p className="text-sm text-primary/75">{job.format || 'Unknown'}</p>,
                },
                {
                  key: 'status',
                  header: 'Status',
                  render: (job: any) => <AdminStatusPill label={job.status || 'Unknown'} tone={statusTone(job.status || 'Unknown')} />,
                },
                {
                  key: 'lastRun',
                  header: 'Last Run',
                  render: (job: any) => <p className="text-sm text-primary/70">{job.lastRun || 'Never'}</p>,
                },
              ]}
            />
          )}
        </AdminPanel>
      </section>
    </div>
  )
}


