'use client'

import { useMemo, useState } from 'react'
import { Download, UserPlus } from 'lucide-react'
import { AdminFilterBar } from '@/components/admin/AdminFilterBar'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { AdminPanel } from '@/components/admin/AdminPanel'
import { AdminStatusPill } from '@/components/admin/AdminStatusPill'
import { AdminTable } from '@/components/admin/AdminTable'
import { SkeletonTable } from '@/components/ui/SkeletonLoader'
import { useApiCall } from '@/lib/api/hooks'
import { APIErrorFallback } from '@/components/ui/ErrorBoundary'
import { statusTone } from '@/lib/admin/ui'

function extractStringValue(value: any): string {
  if (typeof value === 'object' && value !== null) {
    return value.name || value.id || value.label || JSON.stringify(value)
  }
  return value || ''
}

export default function AdminCoachesPage() {
  const [search, setSearch] = useState('')
  const [sportFilter, setSportFilter] = useState<string>('All')

  const { data: coachesResponse, loading, error } = useApiCall('/admin-workspace/coaches')
  const coachesData = coachesResponse?.data || coachesResponse || []

  const sportOptions = ['All', ...new Set(coachesData.map((item: any) => extractStringValue(item.sport)).filter(Boolean))]

  if (error) {
    return <APIErrorFallback error={error} onRetry={() => window.location.reload()} />
  }

  const filteredCoaches = useMemo(() => {
    const query = search.trim().toLowerCase()

    return coachesData.filter((coach: any) => {
      const matchesSearch =
        query.length === 0 ||
        coach.name?.toLowerCase()?.includes(query) ||
        coach.id?.toLowerCase()?.includes(query)
      const matchesSport = sportFilter === 'All' || extractStringValue(coach.sport) === sportFilter

      return matchesSearch && matchesSport
    })
  }, [search, sportFilter, coachesData])

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Coach Management"
        subtitle="Review coach performance, control commission settings, and maintain listing quality across all sports."
        actions={
          <>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full bg-surface-container-low px-4 py-2 text-sm font-semibold text-primary"
            >
              <Download className="w-4 h-4" />
              Export Coaches
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full bg-primary-container px-4 py-2 text-sm font-semibold text-surface-container-lowest"
            >
              <UserPlus className="w-4 h-4" />
              Invite Coach
            </button>
          </>
        }
      />

      <AdminPanel eyebrow="Quality and growth" title="Coach Directory">
        <AdminFilterBar
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search by coach id or name"
          controls={
            <select
              value={sportFilter}
              onChange={(event) => setSportFilter(event.target.value)}
              className="rounded-full bg-surface-container-low px-3 py-2 text-xs font-lexend font-bold uppercase tracking-[0.12em] text-primary outline-none"
            >
              {sportOptions.map((sport: any) => (
                <option key={sport} value={sport}>
                  {sport}
                </option>
              ))}
            </select>
          }
        />

        <div className="mt-4">
          {loading ? (
            <SkeletonTable rows={10} />
          ) : (
            <AdminTable
              items={filteredCoaches}
              getRowKey={(coach: any) => coach.id}
              columns={[
                {
                  key: 'coach',
                  header: 'Coach',
                  render: (coach: any) => (
                    <div>
                      <p className="font-bold text-primary">{coach.name || 'Unknown'}</p>
                      <p className="text-xs text-primary/60 mt-1">{coach.id || 'Unknown'}</p>
                    </div>
                  ),
                },
                {
                  key: 'sport',
                  header: 'Sport',
                  render: (coach: any) => <p className="text-sm text-primary/75">{extractStringValue(coach.sport) || 'Unknown'}</p>,
                },
                {
                  key: 'sessions',
                  header: 'Sessions (month)',
                  render: (coach: any) => <p className="text-sm font-semibold text-primary">{coach.sessionsThisMonth || 0}</p>,
                },
                {
                  key: 'commission',
                  header: 'Commission',
                  render: (coach: any) => <p className="text-sm text-primary/75">{coach.commissionRate || 0}%</p>,
                },
                {
                  key: 'rating',
                  header: 'Rating',
                  render: (coach: any) => <p className="text-sm font-semibold text-primary">{(coach.rating || 0).toFixed(1)}</p>,
                },
                {
                  key: 'status',
                  header: 'Status',
                  render: (coach: any) => <AdminStatusPill label={coach.status || 'Unknown'} tone={statusTone(coach.status || 'Unknown')} />,
                },
              ]}
            />
          )}
        </div>
      </AdminPanel>
    </div>
  )
}
