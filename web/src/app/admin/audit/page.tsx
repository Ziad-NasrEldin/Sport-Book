'use client'

import { useMemo, useState } from 'react'
import { Download } from 'lucide-react'
import { AdminFilterBar } from '@/components/admin/AdminFilterBar'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { AdminPanel } from '@/components/admin/AdminPanel'
import { AdminStatusPill } from '@/components/admin/AdminStatusPill'
import { AdminTable } from '@/components/admin/AdminTable'
import { auditData } from '@/lib/admin/mockData'
import { statusTone } from '@/lib/admin/ui'

const severityOptions = ['All', 'Info', 'Warning', 'Critical'] as const

export default function AdminAuditPage() {
  const [search, setSearch] = useState('')
  const [severity, setSeverity] = useState<(typeof severityOptions)[number]>('All')

  const visibleRows = useMemo(() => {
    const query = search.trim().toLowerCase()

    return auditData.filter((row) => {
      const matchesSearch =
        query.length === 0 ||
        row.actor.toLowerCase().includes(query) ||
        row.action.toLowerCase().includes(query) ||
        row.id.toLowerCase().includes(query)
      const matchesSeverity = severity === 'All' || row.severity === severity

      return matchesSearch && matchesSeverity
    })
  }, [search, severity])

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Audit Logs"
        subtitle="Trace administrative actions, system interventions, and security events with full event context."
        actions={
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full bg-primary-container px-4 py-2 text-sm font-semibold text-surface-container-lowest"
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
            <select
              value={severity}
              onChange={(event) => setSeverity(event.target.value as (typeof severityOptions)[number])}
              className="rounded-full bg-surface-container-low px-3 py-2 text-xs font-lexend font-bold uppercase tracking-[0.12em] text-primary outline-none"
            >
              {severityOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          }
        />

        <div className="mt-4">
          <AdminTable
            items={visibleRows}
            getRowKey={(row) => row.id}
            columns={[
              {
                key: 'event',
                header: 'Event',
                render: (row) => (
                  <div>
                    <p className="font-bold text-primary">{row.action}</p>
                    <p className="text-xs text-primary/60 mt-1">{row.id}</p>
                  </div>
                ),
              },
              {
                key: 'actor',
                header: 'Actor',
                render: (row) => (
                  <div>
                    <p className="text-sm text-primary/75">{row.actor}</p>
                    <p className="text-xs text-primary/55 mt-1">{row.ip}</p>
                  </div>
                ),
              },
              {
                key: 'object',
                header: 'Object',
                render: (row) => <p className="text-sm text-primary/75">{row.object}</p>,
              },
              {
                key: 'severity',
                header: 'Severity',
                render: (row) => <AdminStatusPill label={row.severity} tone={statusTone(row.severity)} />,
              },
              {
                key: 'timestamp',
                header: 'Timestamp',
                render: (row) => <p className="text-sm text-primary/70">{row.createdAt}</p>,
              },
            ]}
          />
        </div>
      </AdminPanel>
    </div>
  )
}
