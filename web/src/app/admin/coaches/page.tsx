'use client'

import { useMemo, useState } from 'react'
import { Download, UserPlus } from 'lucide-react'
import { AdminFilterBar } from '@/components/admin/AdminFilterBar'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { AdminPanel } from '@/components/admin/AdminPanel'
import { AdminStatusPill } from '@/components/admin/AdminStatusPill'
import { AdminTable } from '@/components/admin/AdminTable'
import { coachesData } from '@/lib/admin/mockData'
import { statusTone } from '@/lib/admin/ui'

const sportOptions = ['All', ...new Set(coachesData.map((item) => item.sport))] as const

export default function AdminCoachesPage() {
  const [search, setSearch] = useState('')
  const [sportFilter, setSportFilter] = useState<(typeof sportOptions)[number]>('All')

  const filteredCoaches = useMemo(() => {
    const query = search.trim().toLowerCase()

    return coachesData.filter((coach) => {
      const matchesSearch =
        query.length === 0 ||
        coach.name.toLowerCase().includes(query) ||
        coach.id.toLowerCase().includes(query)
      const matchesSport = sportFilter === 'All' || coach.sport === sportFilter

      return matchesSearch && matchesSport
    })
  }, [search, sportFilter])

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
              onChange={(event) => setSportFilter(event.target.value as (typeof sportOptions)[number])}
              className="rounded-full bg-surface-container-low px-3 py-2 text-xs font-lexend font-bold uppercase tracking-[0.12em] text-primary outline-none"
            >
              {sportOptions.map((sport) => (
                <option key={sport} value={sport}>
                  {sport}
                </option>
              ))}
            </select>
          }
        />

        <div className="mt-4">
          <AdminTable
            items={filteredCoaches}
            getRowKey={(coach) => coach.id}
            columns={[
              {
                key: 'coach',
                header: 'Coach',
                render: (coach) => (
                  <div>
                    <p className="font-bold text-primary">{coach.name}</p>
                    <p className="text-xs text-primary/60 mt-1">{coach.id}</p>
                  </div>
                ),
              },
              {
                key: 'sport',
                header: 'Sport',
                render: (coach) => <p className="text-sm text-primary/75">{coach.sport}</p>,
              },
              {
                key: 'sessions',
                header: 'Sessions (month)',
                render: (coach) => <p className="text-sm font-semibold text-primary">{coach.sessionsThisMonth}</p>,
              },
              {
                key: 'commission',
                header: 'Commission',
                render: (coach) => <p className="text-sm text-primary/75">{coach.commissionRate}%</p>,
              },
              {
                key: 'rating',
                header: 'Rating',
                render: (coach) => <p className="text-sm font-semibold text-primary">{coach.rating.toFixed(1)}</p>,
              },
              {
                key: 'status',
                header: 'Status',
                render: (coach) => <AdminStatusPill label={coach.status} tone={statusTone(coach.status)} />,
              },
            ]}
          />
        </div>
      </AdminPanel>
    </div>
  )
}
