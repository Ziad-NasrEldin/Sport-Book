'use client'

import { useMemo, useState } from 'react'
import { Building2, Download } from 'lucide-react'
import { AdminFilterBar } from '@/components/admin/AdminFilterBar'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { AdminPanel } from '@/components/admin/AdminPanel'
import { AdminStatusPill } from '@/components/admin/AdminStatusPill'
import { AdminTable } from '@/components/admin/AdminTable'
import { SkeletonTable } from '@/components/ui/SkeletonLoader'
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

export default function AdminFacilitiesPage() {
  const [search, setSearch] = useState('')
  const [cityFilter, setCityFilter] = useState<string>('All')

  const { data: facilitiesResponse, loading, error } = useApiCall('/admin-workspace/facilities')
  const facilitiesData = facilitiesResponse?.data || facilitiesResponse || []

  const cityOptions = ['All', ...new Set(facilitiesData.map((item: any) => item.city).filter(Boolean))]

  if (error) {
    return <APIErrorFallback error={error} onRetry={() => window.location.reload()} />
  }

  const filteredFacilities = useMemo(() => {
    const query = search.trim().toLowerCase()

    return facilitiesData.filter((facility: any) => {
      const matchesSearch =
        query.length === 0 ||
        facility.name?.toLowerCase()?.includes(query) ||
        facility.id?.toLowerCase()?.includes(query)
      const matchesCity = cityFilter === 'All' || facility.city === cityFilter

      return matchesSearch && matchesCity
    })
  }, [cityFilter, search, facilitiesData])

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
              onChange={(event) => setCityFilter(event.target.value)}
              className="rounded-full bg-surface-container-low px-3 py-2 text-xs font-lexend font-bold uppercase tracking-[0.12em] text-primary outline-none"
            >
              {cityOptions.map((city: any) => (
                <option key={city} value={city}>
                  {city}
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
              items={filteredFacilities}
              getRowKey={(facility: any) => facility.id}
              columns={[
                {
                  key: 'facility',
                  header: 'Facility',
                  render: (facility: any) => (
                    <div>
                      <p className="font-bold text-primary">{facility.name || 'Unknown'}</p>
                      <p className="text-xs text-primary/60 mt-1">{facility.id || 'Unknown'}</p>
                    </div>
                  ),
                },
                {
                  key: 'branches',
                  header: 'Branches',
                  render: (facility: any) => <p className="text-sm font-semibold text-primary">{facility._count?.branches || 0}</p>,
                },
                {
                  key: 'utilization',
                  header: 'Utilization',
                  render: (facility: any) => <p className="text-sm text-primary/75">{facility.utilization || 0}%</p>,
                },
                {
                  key: 'revenue',
                  header: 'Monthly Revenue',
                  render: (facility: any) => <p className="text-sm font-semibold text-primary">{formatEgp(facility.monthlyRevenue || 0)}</p>,
                },
                {
                  key: 'status',
                  header: 'Status',
                  render: (facility: any) => <AdminStatusPill label={facility.status || 'Unknown'} tone={statusTone(facility.status || 'Unknown')} />,
                },
              ]}
            />
          )}
        </div>
      </AdminPanel>
    </div>
  )
}
