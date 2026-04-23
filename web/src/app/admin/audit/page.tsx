'use client'

import { useCallback, useMemo, useState } from 'react'
import { Download } from 'lucide-react'
import { AdminFilterBar } from '@/components/admin/AdminFilterBar'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { AdminPanel } from '@/components/admin/AdminPanel'
import { AdminStatusPill } from '@/components/admin/AdminStatusPill'
import { AdminTable } from '@/components/admin/AdminTable'
import { SkeletonTable } from '@/components/ui/SkeletonLoader'
import { useApiCall } from '@/lib/api/hooks'
import { APIErrorFallback } from '@/components/ui/ErrorBoundary'
import { statusTone } from '@/lib/admin/ui'
import { AppSelect } from '@/components/ui/AppSelect'

const severityOptions = ['All', 'INFO', 'WARNING', 'CRITICAL'] as const

export default function AdminAuditPage() {
  const [search, setSearch] = useState('')
  const [severity, setSeverity] = useState<(typeof severityOptions)[number]>('All')

  const { data: auditResponse, loading, error } = useApiCall('/admin-workspace/audit-logs')
  const auditData = auditResponse?.data || auditResponse || []

  const handleSeverityChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
    setSeverity(event.target.value as (typeof severityOptions)[number])
  }, [])

  const visibleRows = useMemo(() => {
    const query = search.trim().toLowerCase()

    return auditData.filter((row: any) => {
      const matchesSearch =
        query.length === 0 ||
        row.actor?.toLowerCase()?.includes(query) ||
        row.action?.toLowerCase()?.includes(query) ||
        row.id?.toLowerCase()?.includes(query)
      const matchesSeverity = severity === 'All' || row.severity === severity

      return matchesSearch && matchesSeverity
    })
  }, [auditData, search, severity])

  if (error) {
    return <APIErrorFallback error={error} onRetry={() => window.location.reload()} />
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Audit Logs"
        subtitle="Trace administrative actions, system interventions, and security events with full event context."
        actions={
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full bg-primary-container px-4 py-2 text-sm font-semibold text-surface-container-lowest hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        }
      />

      <AdminPanel eyebrow="Compliance" title="Activity Timeline">
        <AdminFilterBar
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search by actor, action, or event id"
          controls={
            <AppSelect
              value={severity}
              onChange={handleSeverityChange}
              className="rounded-full bg-surface-container-low px-3 py-2 text-xs font-lexend font-bold uppercase tracking-[0.12em] text-primary outline-none"
            >
              {severityOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </AppSelect>
          }
        />

        <div className="mt-4">
          {loading ? (
            <SkeletonTable rows={10} />
          ) : (
            <AdminTable
              items={visibleRows}
              getRowKey={(row: any) => row.id}
              columns={[
                {
                  key: 'event',
                  header: 'Event',
                  render: (row: any) => (
                    <div>
                      <p className="font-bold text-primary">{row.action || 'Unknown'}</p>
                      <p className="text-xs text-primary/60 mt-1">{row.id || 'Unknown'}</p>
                    </div>
                  ),
                },
                {
                  key: 'actor',
                  header: 'Actor',
                  render: (row: any) => (
                    <div>
                      <p className="text-sm text-primary/75">{row.actor || 'Unknown'}</p>
                      <p className="text-xs text-primary/55 mt-1">{row.ip || 'Unknown'}</p>
                    </div>
                  ),
                },
                {
                  key: 'object',
                  header: 'Object',
                  render: (row: any) => <p className="text-sm text-primary/75">{row.object || 'Unknown'}</p>,
                },
                {
                  key: 'severity',
                  header: 'Severity',
                  render: (row: any) => <AdminStatusPill label={row.severity || 'Unknown'} tone={statusTone(row.severity || 'Unknown')} />,
                },
                {
                  key: 'timestamp',
                  header: 'Timestamp',
                  render: (row: any) => <p className="text-sm text-primary/70">{new Date(row.createdAt).toLocaleString()}</p>,
                },
              ]}
            />
          )}
        </div>
      </AdminPanel>
    </div>
  )
}


