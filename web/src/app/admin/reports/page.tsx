'use client'

import { useState } from 'react'
import { CalendarRange, Download } from 'lucide-react'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { AdminPanel } from '@/components/admin/AdminPanel'
import { AdminStatusPill } from '@/components/admin/AdminStatusPill'
import { AdminTable } from '@/components/admin/AdminTable'
import { SkeletonTable } from '@/components/ui/SkeletonLoader'
import { useApiCall } from '@/lib/api/hooks'
import { api } from '@/lib/api/client'
import { APIErrorFallback } from '@/components/ui/ErrorBoundary'
import { statusTone } from '@/lib/admin/ui'

const presets = ['Revenue', 'User Growth', 'Peak Hours', 'Sports Popularity'] as const

export default function AdminReportsPage() {
  const [selectedPreset, setSelectedPreset] = useState<(typeof presets)[number]>('Revenue')
  const [dateRange, setDateRange] = useState('Last 30 days')
  const [savingAction, setSavingAction] = useState<'generate' | 'schedule' | null>(null)
  const [banner, setBanner] = useState('')

  const { data: reportsResponse, loading, error, refetch } = useApiCall('/admin-workspace/reports')
  const reportsData = reportsResponse?.data || reportsResponse || []

  const handleReportAction = async (mode: 'generate' | 'schedule') => {
    setSavingAction(mode)
    setBanner('')

    try {
      await api.post('/admin-workspace/reports', {
        preset: selectedPreset,
        dateRange,
        action: mode === 'generate' ? 'GENERATE' : 'SCHEDULE',
      })
      setBanner(`${mode === 'generate' ? 'Generated' : 'Scheduled'} ${selectedPreset.toLowerCase()} report.`)
      await refetch()
    } catch {
      setBanner('Failed to submit report request. Please try again.')
    } finally {
      setSavingAction(null)
    }
  }

  if (error) {
    return <APIErrorFallback error={error} onRetry={() => window.location.reload()} />
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Global Reports"
        subtitle="Build recurring reports for finance, growth, and operations teams with export and scheduling controls."
      />

      <section className="grid grid-cols-1 xl:grid-cols-[1fr_1.2fr] gap-4">
        <AdminPanel eyebrow="Builder" title="Report Generator">
          {banner ? (
            <div className="mb-3 rounded-[var(--radius-default)] bg-tertiary-fixed px-3.5 py-2.5 text-sm font-semibold text-primary">
              {banner}
            </div>
          ) : null}
          <div className="space-y-3">
            <label className="block rounded-[var(--radius-default)] bg-surface-container-low p-3.5">
              <span className="text-xs font-lexend uppercase tracking-[0.14em] text-primary/55">Preset</span>
              <select
                value={selectedPreset}
                onChange={(event) => setSelectedPreset(event.target.value as (typeof presets)[number])}
                className="mt-2 w-full bg-transparent text-lg font-bold text-primary outline-none"
              >
                {presets.map((preset) => (
                  <option key={preset} value={preset}>
                    {preset}
                  </option>
                ))}
              </select>
            </label>

            <label className="block rounded-[var(--radius-default)] bg-surface-container-low p-3.5">
              <span className="text-xs font-lexend uppercase tracking-[0.14em] text-primary/55">Date Range</span>
              <input
                value={dateRange}
                onChange={(event) => setDateRange(event.target.value)}
                className="mt-2 w-full bg-transparent text-lg font-bold text-primary outline-none"
              />
            </label>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleReportAction('schedule')}
                disabled={savingAction !== null}
                className="inline-flex items-center gap-2 rounded-full bg-primary-container px-4 py-2 text-sm font-semibold text-surface-container-lowest"
              >
                <CalendarRange className="w-4 h-4" />
                {savingAction === 'schedule' ? 'Scheduling...' : 'Schedule Report'}
              </button>
              <button
                type="button"
                onClick={() => handleReportAction('generate')}
                disabled={savingAction !== null}
                className="inline-flex items-center gap-2 rounded-full bg-surface-container-low px-4 py-2 text-sm font-semibold text-primary"
              >
                <Download className="w-4 h-4" />
                {savingAction === 'generate' ? 'Generating...' : 'Generate Now'}
              </button>
            </div>
          </div>
        </AdminPanel>

        <AdminPanel eyebrow="Automation" title="Saved Report Jobs">
          {loading ? (
            <SkeletonTable rows={10} />
          ) : (
            <AdminTable
              items={reportsData}
              getRowKey={(row: any) => row.id}
              columns={[
                {
                  key: 'name',
                  header: 'Report',
                  render: (row: any) => (
                    <div>
                      <p className="font-bold text-primary">{row.name || 'Unknown'}</p>
                      <p className="text-xs text-primary/60 mt-1">Owner: {row.owner || 'Unknown'}</p>
                    </div>
                  ),
                },
                {
                  key: 'frequency',
                  header: 'Frequency',
                  render: (row: any) => <p className="text-sm text-primary/75">{row.frequency || 'Unknown'}</p>,
                },
                {
                  key: 'format',
                  header: 'Format',
                  render: (row: any) => <p className="text-sm text-primary/75">{row.format || 'Unknown'}</p>,
                },
                {
                  key: 'status',
                  header: 'Status',
                  render: (row: any) => <AdminStatusPill label={row.status || 'Unknown'} tone={statusTone(row.status || 'Unknown')} />,
                },
                {
                  key: 'lastRun',
                  header: 'Last Run',
                  render: (row: any) => (
                    <p className="text-sm text-primary/70">
                      {row.lastRun ? new Date(row.lastRun).toLocaleString() : '--'}
                    </p>
                  ),
                },
              ]}
            />
          )}
        </AdminPanel>
      </section>
    </div>
  )
}
