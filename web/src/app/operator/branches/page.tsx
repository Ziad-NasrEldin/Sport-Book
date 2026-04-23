'use client'

import Link from 'next/link'
import { useCallback, useMemo, useState } from 'react'
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
import type { BranchRecord, BranchStatus } from '@/lib/operator/mockData'
import { AppSelect } from '@/components/ui/AppSelect'

const statusOptions = ['All', 'ACTIVE', 'PENDING_SETUP', 'MAINTENANCE', 'PAUSED'] as const

function formatEgp(value: number) {
  return new Intl.NumberFormat('en-EG', {
    style: 'currency',
    currency: 'EGP',
    maximumFractionDigits: 0,
  }).format(value)
}

export default function OperatorBranchesPage() {
  const [search, setSearch] = useState('')
  const [selectedCity, setSelectedCity] = useState<string>('All')
  const [selectedStatus, setSelectedStatus] = useState<(typeof statusOptions)[number]>('All')

  const { data: branchesResponse, loading, error } = useApiCall('/operator/branches')
  const branchesData = branchesResponse?.data || branchesResponse || []

  const handleCityChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCity(event.target.value)
  }, [])

  const handleStatusChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedStatus(event.target.value as (typeof statusOptions)[number])
  }, [])

  const cityOptions = ['All', ...new Set(branchesData.map((branch: BranchRecord) => branch.city))]

  if (error) {
    return <APIErrorFallback error={error} onRetry={() => window.location.reload()} />
  }

  const filteredBranches = useMemo(() => {
    const query = search.trim().toLowerCase()

    return branchesData.filter((branch: BranchRecord) => {
      const matchesSearch =
        query.length === 0 ||
        branch.name?.toLowerCase()?.includes(query) ||
        branch.id?.toLowerCase()?.includes(query) ||
        branch.manager?.toLowerCase()?.includes(query)

      const matchesCity = selectedCity === 'All' || branch.city === selectedCity
      const matchesStatus = selectedStatus === 'All' || (branch.status as string).toUpperCase() === selectedStatus

      return matchesSearch && matchesCity && matchesStatus
    })
  }, [branchesData, search, selectedCity, selectedStatus])

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Branch Management"
        subtitle="Manage every facility branch, monitor performance, and jump into branch-level operations with one click."
        actions={
          <>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full bg-surface-container-low px-4 py-2 text-sm font-semibold text-primary"
            >
              <Download className="w-4 h-4" />
              Export Branches
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full bg-primary-container px-4 py-2 text-sm font-semibold text-surface-container-lowest"
            >
              <Building2 className="w-4 h-4" />
              Add Branch
            </button>
          </>
        }
      />

      <AdminPanel eyebrow="Network" title="Branch Directory">
        <AdminFilterBar
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search by branch id, manager, or branch name"
          controls={
            <>
              <AppSelect
                value={selectedCity}
                onChange={handleCityChange}
                className="rounded-full bg-surface-container-low px-3 py-2 text-xs font-lexend font-bold uppercase tracking-[0.12em] text-primary outline-none"
              >
                {cityOptions.map((city: any) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </AppSelect>
              <AppSelect
                value={selectedStatus}
                onChange={handleStatusChange}
                className="rounded-full bg-surface-container-low px-3 py-2 text-xs font-lexend font-bold uppercase tracking-[0.12em] text-primary outline-none"
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

        <div className="mt-4">
          {loading ? (
            <SkeletonTable rows={10} />
          ) : (
            <AdminTable
              items={filteredBranches}
              getRowKey={(branch: any) => branch.id}
              columns={[
                {
                  key: 'branch',
                  header: 'Branch',
                  render: (branch: any) => (
                    <div>
                      <Link href={`/operator/branches/${branch.id}`} className="font-bold text-primary hover:text-secondary transition-colors">
                        {branch.name || 'Unknown'}
                      </Link>
                      <p className="text-xs text-primary/60 mt-1">{branch.id || 'Unknown'}</p>
                    </div>
                  ),
                },
                {
                  key: 'manager',
                  header: 'Manager',
                  render: (branch: any) => (
                    <div>
                      <p className="text-sm font-semibold text-primary">{branch.manager || 'Unknown'}</p>
                      <p className="text-xs text-primary/55 mt-1">{branch.city || 'Unknown'}</p>
                    </div>
                  ),
                },
                {
                  key: 'capacity',
                  header: 'Courts',
                  render: (branch: any) => <p className="text-sm font-semibold text-primary">{branch.courts || 0}</p>,
                },
                {
                  key: 'utilization',
                  header: 'Utilization',
                  render: (branch: any) => (
                    <div className="min-w-[120px]">
                      <p className="text-sm font-semibold text-primary">{branch.utilization || 0}%</p>
                      <div className="mt-1 h-1.5 rounded-full bg-primary/10 overflow-hidden">
                        <div className="h-full rounded-full bg-secondary-container" style={{ width: `${branch.utilization || 0}%` }} />
                      </div>
                    </div>
                  ),
                },
                {
                  key: 'revenue',
                  header: 'Revenue',
                  render: (branch: any) => <p className="text-sm font-semibold text-primary">{formatEgp(branch.monthlyRevenue || 0)}</p>,
                },
                {
                  key: 'status',
                  header: 'Status',
                  render: (branch: any) => <AdminStatusPill label={branch.status || 'Unknown'} tone={statusTone(branch.status || 'Unknown')} />,
                },
                {
                  key: 'action',
                  header: 'Action',
                  render: (branch: any) => (
                    <Link
                      href={`/operator/branches/${branch.id}`}
                      className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1.5 text-[10px] font-lexend font-bold uppercase tracking-[0.12em] text-primary"
                    >
                      Open
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


