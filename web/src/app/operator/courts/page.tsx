'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { Download, Grid2x2 } from 'lucide-react'
import { AdminFilterBar } from '@/components/admin/AdminFilterBar'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { AdminPanel } from '@/components/admin/AdminPanel'
import { AdminStatusPill } from '@/components/admin/AdminStatusPill'
import { AdminTable } from '@/components/admin/AdminTable'
import { SkeletonTable } from '@/components/ui/SkeletonLoader'
import { useApiCall } from '@/lib/api/hooks'
import { APIErrorFallback } from '@/components/ui/ErrorBoundary'
import { statusTone } from '@/lib/admin/ui'

const statusOptions = ['All', 'ACTIVE', 'MAINTENANCE', 'PAUSED'] as const

function formatEgp(value: number) {
  return new Intl.NumberFormat('en-EG', {
    style: 'currency',
    currency: 'EGP',
    maximumFractionDigits: 0,
  }).format(value)
}

export default function OperatorCourtsPage() {
  const [search, setSearch] = useState('')
  const [selectedBranch, setSelectedBranch] = useState<string>('All')
  const [selectedSport, setSelectedSport] = useState<string>('All')
  const [selectedStatus, setSelectedStatus] = useState<(typeof statusOptions)[number]>('All')

  const { data: courtsResponse, loading, error } = useApiCall('/operator/courts')
  const { data: branchesResponse } = useApiCall('/operator/branches')

  const courtsData = courtsResponse?.data || courtsResponse || []
  const branchesData = branchesResponse?.data || branchesResponse || []

  const branchOptions = ['All', ...branchesData.map((branch: any) => branch.id)]
  const sportOptions = ['All', ...new Set(courtsData.map((court: any) => court.sport))]

  if (error) {
    return <APIErrorFallback error={error} onRetry={() => window.location.reload()} />
  }

  const getBranchNameById = (id: string) => {
    const branch = branchesData.find((b: any) => b.id === id)
    return branch?.name || 'Unknown'
  }

  const filteredCourts = useMemo(() => {
    const query = search.trim().toLowerCase()

    return courtsData.filter((court: any) => {
      const matchesSearch =
        query.length === 0 ||
        court.name?.toLowerCase()?.includes(query) ||
        court.id?.toLowerCase()?.includes(query) ||
        getBranchNameById(court.branchId).toLowerCase().includes(query)

      const matchesBranch = selectedBranch === 'All' || court.branchId === selectedBranch
      const matchesSport = selectedSport === 'All' || court.sport === selectedSport
      const matchesStatus = selectedStatus === 'All' || court.status === selectedStatus

      return matchesSearch && matchesBranch && matchesSport && matchesStatus
    })
  }, [courtsData, search, selectedBranch, selectedSport, selectedStatus, branchesData])

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Court Management"
        subtitle="Configure courts, pricing, and maintenance schedules for every branch from one table."
        actions={
          <>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full bg-surface-container-low px-4 py-2 text-sm font-semibold text-primary"
            >
              <Download className="w-4 h-4" />
              Export Courts
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full bg-primary-container px-4 py-2 text-sm font-semibold text-surface-container-lowest"
            >
              <Grid2x2 className="w-4 h-4" />
              Add Court
            </button>
          </>
        }
      />

      <AdminPanel eyebrow="Inventory" title="Court Directory">
        <AdminFilterBar
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search by court id, branch, or court name"
          controls={
            <>
              <select
                value={selectedBranch}
                onChange={(event) => setSelectedBranch(event.target.value)}
                className="rounded-full bg-surface-container-low px-3 py-2 text-xs font-lexend font-bold uppercase tracking-[0.12em] text-primary outline-none"
              >
                {branchOptions.map((branchId: any) => (
                  <option key={branchId} value={branchId}>
                    {branchId === 'All' ? 'All Branches' : getBranchNameById(branchId)}
                  </option>
                ))}
              </select>

              <select
                value={selectedSport}
                onChange={(event) => setSelectedSport(event.target.value)}
                className="rounded-full bg-surface-container-low px-3 py-2 text-xs font-lexend font-bold uppercase tracking-[0.12em] text-primary outline-none"
              >
                {sportOptions.map((sport: any) => (
                  <option key={sport} value={sport}>
                    {sport}
                  </option>
                ))}
              </select>

              <select
                value={selectedStatus}
                onChange={(event) => setSelectedStatus(event.target.value as (typeof statusOptions)[number])}
                className="rounded-full bg-surface-container-low px-3 py-2 text-xs font-lexend font-bold uppercase tracking-[0.12em] text-primary outline-none"
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </>
          }
        />

        <div className="mt-4">
          {loading ? (
            <SkeletonTable rows={10} />
          ) : (
            <AdminTable
              items={filteredCourts}
              getRowKey={(court: any) => court.id}
              columns={[
                {
                  key: 'court',
                  header: 'Court',
                  render: (court: any) => (
                    <div>
                      <p className="font-bold text-primary">{court.name || 'Unknown'}</p>
                      <p className="text-xs text-primary/60 mt-1">{court.id || 'Unknown'}</p>
                    </div>
                  ),
                },
                {
                  key: 'branch',
                  header: 'Branch',
                  render: (court: any) => <p className="text-sm font-semibold text-primary">{getBranchNameById(court.branchId)}</p>,
                },
                {
                  key: 'sport',
                  header: 'Sport & Surface',
                  render: (court: any) => (
                    <div>
                      <p className="text-sm font-semibold text-primary">{court.sport || 'Unknown'}</p>
                      <p className="text-xs text-primary/55 mt-1">{court.surface || 'Unknown'}</p>
                    </div>
                  ),
                },
                {
                  key: 'pricing',
                  header: 'Price / Hour',
                  render: (court: any) => <p className="text-sm font-semibold text-primary">{formatEgp(court.pricePerHour || 0)}</p>,
                },
                {
                  key: 'status',
                  header: 'Status',
                  render: (court: any) => <AdminStatusPill label={court.status || 'Unknown'} tone={statusTone(court.status || 'Unknown')} />,
                },
                {
                  key: 'maintenance',
                  header: 'Maintenance',
                  render: (court: any) => <p className="text-sm text-primary/70">{court.nextMaintenance || 'TBD'}</p>,
                },
                {
                  key: 'action',
                  header: 'Edit',
                  render: (court: any) => (
                    <Link
                      href={`/operator/courts/${court.id}`}
                      className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1.5 text-[10px] font-lexend font-bold uppercase tracking-[0.12em] text-primary"
                    >
                      Configure
                    </Link>
                  ),
                },
              ]}
            />
          )}
        </div>
      </AdminPanel>
    </div>
  )
}
