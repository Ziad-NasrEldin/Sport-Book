'use client'

import Link from 'next/link'
import { useCallback, useMemo, useState } from 'react'
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
import { exportToCsv } from '@/lib/export'
import type { CourtRecord, CourtStatus, BranchRecord } from '@/lib/operator/mockData'
import { AppSelect } from '@/components/ui/AppSelect'

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

  const handleBranchChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedBranch(event.target.value)
  }, [])

  const handleSportChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSport(event.target.value)
  }, [])

  const handleStatusChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedStatus(event.target.value as (typeof statusOptions)[number])
  }, [])

  const sportLabel = (sport: any): string => typeof sport === 'string' ? sport : (sport?.displayName || sport?.name || '')

  const courtsData = courtsResponse?.data || courtsResponse || []
  const branchesData = branchesResponse?.data || branchesResponse || []

  const branchOptions = ['All', ...branchesData.map((branch: BranchRecord) => branch.id)]
  const sportOptions = ['All', ...new Set(courtsData.map((court: CourtRecord) => sportLabel((court as any).sport)))]

  const getBranchNameById = (branchId: string) => {
    const found = branchesData.find((b: BranchRecord) => b.id === branchId)
    return found?.name || 'Unknown Branch'
  }

  const getCourtNameById = (courtId: string) => {
    const found = courtsData.find((c: CourtRecord) => c.id === courtId)
    return found?.name || 'Unknown Court'
  }

  const filteredCourts = useMemo(() => {
    const query = search.trim().toLowerCase()

    return courtsData.filter((court: CourtRecord) => {
      const matchesSearch =
        query.length === 0 ||
        court.name?.toLowerCase()?.includes(query) ||
        court.id?.toLowerCase()?.includes(query) ||
        getBranchNameById(court.branchId).toLowerCase().includes(query)

      const matchesBranch = selectedBranch === 'All' || court.branchId === selectedBranch
      const matchesSport = selectedSport === 'All' || sportLabel((court as any).sport) === selectedSport
      const matchesStatus = selectedStatus === 'All' || (court.status as string).toUpperCase() === selectedStatus

      return matchesSearch && matchesBranch && matchesSport && matchesStatus
    })
  }, [courtsData, search, selectedBranch, selectedSport, selectedStatus, branchesData])

  if (error) {
    return <APIErrorFallback error={error} onRetry={() => window.location.reload()} />
  }

  return (
    <div className="space-y-6 motion-safe:animate-[var(--animate-fade-in)]">
      <AdminPageHeader
        title="Court Management"
        subtitle="Configure courts, pricing, and maintenance schedules for every branch from one table."
        className="motion-safe:animate-[var(--animate-soft-drop)]"
        actions={
          <>
            <button
              type="button"
              onClick={() => {
                const headers = ['ID', 'Name', 'Branch', 'Sport', 'Surface', 'Price/Hour', 'Status', 'Next Maintenance']
                const rows = filteredCourts.map((court: any) => [
                  court.id || '',
                  court.name || '',
                  getBranchNameById(court.branchId),
                  sportLabel(court.sport),
                  court.surface || '',
                  String(court.pricePerHour || 0),
                  court.status || '',
                  court.nextMaintenance || 'TBD',
                ])
                exportToCsv('courts.csv', headers, rows)
              }}
              className="inline-flex items-center gap-2 rounded-full bg-surface-container-low px-4 py-2 text-sm font-semibold text-primary transition-all duration-200 hover:-translate-y-0.5 hover:bg-surface-container-high hover:shadow-[0_10px_20px_-14px_rgba(0,17,58,0.8)] active:translate-y-0 motion-safe:hover:scale-[1.02] motion-safe:active:scale-[0.98]"
            >
              <Download className="w-4 h-4" />
              Export Courts
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full bg-primary-container px-4 py-2 text-sm font-semibold text-surface-container-lowest shadow-[0_16px_32px_-22px_rgba(0,35,102,0.9)] transition-all duration-200 hover:-translate-y-0.5 hover:opacity-95 hover:shadow-[0_22px_38px_-20px_rgba(0,35,102,0.95)] active:translate-y-0 motion-safe:hover:scale-[1.02] motion-safe:active:scale-[0.98]"
            >
              <Grid2x2 className="w-4 h-4" />
              Add Court
            </button>
          </>
        }
      />

      <AdminPanel eyebrow="Inventory" title="Court Directory" className="motion-safe:animate-[var(--animate-soft-rise)] animation-delay-100">
        <AdminFilterBar
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search by court id, branch, or court name"
          controls={
            <>
              <AppSelect
                value={selectedBranch}
                onChange={handleBranchChange}
                className="rounded-full bg-surface-container-low px-3 py-2 text-xs font-lexend font-bold uppercase tracking-[0.12em] text-primary outline-none transition-colors hover:bg-surface-container-medium"
              >
                {branchOptions.map((branchId: any) => (
                  <option key={branchId} value={branchId}>
                    {branchId === 'All' ? 'All Branches' : getBranchNameById(branchId)}
                  </option>
                ))}
              </AppSelect>

              <AppSelect
                value={selectedSport}
                onChange={handleSportChange}
                className="rounded-full bg-surface-container-low px-3 py-2 text-xs font-lexend font-bold uppercase tracking-[0.12em] text-primary outline-none transition-colors hover:bg-surface-container-medium"
              >
                {sportOptions.map((sport: any) => (
                  <option key={sport} value={sport}>
                    {sport}
                  </option>
                ))}
              </AppSelect>

              <AppSelect
                value={selectedStatus}
                onChange={handleStatusChange}
                className="rounded-full bg-surface-container-low px-3 py-2 text-xs font-lexend font-bold uppercase tracking-[0.12em] text-primary outline-none transition-colors hover:bg-surface-container-medium"
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </AppSelect>
            </>
          }
        />

        <div className="mt-4 motion-safe:animate-[var(--animate-fade-in)] animation-delay-150">
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
                      <p className="text-sm font-semibold text-primary">{sportLabel(court.sport) || 'Unknown'}</p>
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
                      className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1.5 text-[10px] font-lexend font-bold uppercase tracking-[0.12em] text-primary transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary/16 hover:shadow-[0_8px_16px_-14px_rgba(0,17,58,0.9)] motion-safe:hover:scale-[1.02]"
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


