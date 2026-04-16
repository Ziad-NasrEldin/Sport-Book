'use client'

import { useMemo, useState } from 'react'
import { Building2, Download } from 'lucide-react'
import { AdminFilterBar } from '@/components/admin/AdminFilterBar'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { AdminPanel } from '@/components/admin/AdminPanel'
import { AdminStatusPill } from '@/components/admin/AdminStatusPill'
import { AdminTable } from '@/components/admin/AdminTable'
import { facilitiesData, formatEgp } from '@/lib/admin/mockData'
import { statusTone } from '@/lib/admin/ui'

const cityOptions = ['All', ...new Set(facilitiesData.map((item) => item.city))] as const

export default function AdminFacilitiesPage() {
  const [search, setSearch] = useState('')
  const [cityFilter, setCityFilter] = useState<(typeof cityOptions)[number]>('All')

  const filteredFacilities = useMemo(() => {
    const query = search.trim().toLowerCase()

    return facilitiesData.filter((facility) => {
      const matchesSearch =
        query.length === 0 ||
        facility.name.toLowerCase().includes(query) ||
        facility.id.toLowerCase().includes(query)
      const matchesCity = cityFilter === 'All' || facility.city === cityFilter

      return matchesSearch && matchesCity
    })
  }, [cityFilter, search])

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Facility Management"
        subtitle="Control partner facilities, monitor branch utilization, and quickly identify underperforming operations."
        actions={
          <>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full bg-surface-container-low px-4 py-2 text-sm font-semibold text-primary"
            >
              <Download className="w-4 h-4" />
              Export Facilities
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full bg-primary-container px-4 py-2 text-sm font-semibold text-surface-container-lowest"
            >
              <Building2 className="w-4 h-4" />
              Add Facility
            </button>
          </>
        }
      />

      <AdminPanel eyebrow="Operations" title="Facility Directory">
        <AdminFilterBar
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search by facility name or id"
          controls={
            <select
              value={cityFilter}
              onChange={(event) => setCityFilter(event.target.value as (typeof cityOptions)[number])}
              className="rounded-full bg-surface-container-low px-3 py-2 text-xs font-lexend font-bold uppercase tracking-[0.12em] text-primary outline-none"
            >
              {cityOptions.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          }
        />

        <div className="mt-4">
          <AdminTable
            items={filteredFacilities}
            getRowKey={(facility) => facility.id}
            columns={[
              {
                key: 'facility',
                header: 'Facility',
                render: (facility) => (
                  <div>
                    <p className="font-bold text-primary">{facility.name}</p>
                    <p className="text-xs text-primary/60 mt-1">{facility.id}</p>
                  </div>
                ),
              },
              {
                key: 'branches',
                header: 'Branches',
                render: (facility) => <p className="text-sm font-semibold text-primary">{facility.branches}</p>,
              },
              {
                key: 'utilization',
                header: 'Utilization',
                render: (facility) => <p className="text-sm text-primary/75">{facility.utilization}%</p>,
              },
              {
                key: 'revenue',
                header: 'Monthly Revenue',
                render: (facility) => <p className="text-sm font-semibold text-primary">{formatEgp(facility.monthlyRevenue)}</p>,
              },
              {
                key: 'status',
                header: 'Status',
                render: (facility) => <AdminStatusPill label={facility.status} tone={statusTone(facility.status)} />,
              },
            ]}
          />
        </div>
      </AdminPanel>
    </div>
  )
}
