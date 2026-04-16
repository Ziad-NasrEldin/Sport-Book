'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { Download, Grid2x2 } from 'lucide-react'
import { AdminFilterBar } from '@/components/admin/AdminFilterBar'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { AdminPanel } from '@/components/admin/AdminPanel'
import { AdminStatusPill } from '@/components/admin/AdminStatusPill'
import { AdminTable } from '@/components/admin/AdminTable'
import { branchesData, courtsData, formatEgp, getBranchNameById } from '@/lib/operator/mockData'
import { statusTone } from '@/lib/admin/ui'

const branchOptions = ['All', ...branchesData.map((branch) => branch.id)] as const
const sportOptions = ['All', ...new Set(courtsData.map((court) => court.sport))] as const
const statusOptions = ['All', 'Active', 'Maintenance', 'Paused'] as const

export default function OperatorCourtsPage() {
  const [search, setSearch] = useState('')
  const [selectedBranch, setSelectedBranch] = useState<(typeof branchOptions)[number]>('All')
  const [selectedSport, setSelectedSport] = useState<(typeof sportOptions)[number]>('All')
  const [selectedStatus, setSelectedStatus] = useState<(typeof statusOptions)[number]>('All')

  const filteredCourts = useMemo(() => {
    const query = search.trim().toLowerCase()

    return courtsData.filter((court) => {
      const matchesSearch =
        query.length === 0 ||
        court.name.toLowerCase().includes(query) ||
        court.id.toLowerCase().includes(query) ||
        getBranchNameById(court.branchId).toLowerCase().includes(query)

      const matchesBranch = selectedBranch === 'All' || court.branchId === selectedBranch
      const matchesSport = selectedSport === 'All' || court.sport === selectedSport
      const matchesStatus = selectedStatus === 'All' || court.status === selectedStatus

      return matchesSearch && matchesBranch && matchesSport && matchesStatus
    })
  }, [search, selectedBranch, selectedSport, selectedStatus])

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
                onChange={(event) => setSelectedBranch(event.target.value as (typeof branchOptions)[number])}
                className="rounded-full bg-surface-container-low px-3 py-2 text-xs font-lexend font-bold uppercase tracking-[0.12em] text-primary outline-none"
              >
                {branchOptions.map((branchId) => (
                  <option key={branchId} value={branchId}>
                    {branchId === 'All' ? 'All Branches' : getBranchNameById(branchId)}
                  </option>
                ))}
              </select>

              <select
                value={selectedSport}
                onChange={(event) => setSelectedSport(event.target.value as (typeof sportOptions)[number])}
                className="rounded-full bg-surface-container-low px-3 py-2 text-xs font-lexend font-bold uppercase tracking-[0.12em] text-primary outline-none"
              >
                {sportOptions.map((sport) => (
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
          <AdminTable
            items={filteredCourts}
            getRowKey={(court) => court.id}
            columns={[
              {
                key: 'court',
                header: 'Court',
                render: (court) => (
                  <div>
                    <p className="font-bold text-primary">{court.name}</p>
                    <p className="text-xs text-primary/60 mt-1">{court.id}</p>
                  </div>
                ),
              },
              {
                key: 'branch',
                header: 'Branch',
                render: (court) => <p className="text-sm font-semibold text-primary">{getBranchNameById(court.branchId)}</p>,
              },
              {
                key: 'sport',
                header: 'Sport & Surface',
                render: (court) => (
                  <div>
                    <p className="text-sm font-semibold text-primary">{court.sport}</p>
                    <p className="text-xs text-primary/55 mt-1">{court.surface}</p>
                  </div>
                ),
              },
              {
                key: 'pricing',
                header: 'Price / Hour',
                render: (court) => <p className="text-sm font-semibold text-primary">{formatEgp(court.pricePerHour)}</p>,
              },
              {
                key: 'status',
                header: 'Status',
                render: (court) => <AdminStatusPill label={court.status} tone={statusTone(court.status)} />,
              },
              {
                key: 'maintenance',
                header: 'Maintenance',
                render: (court) => <p className="text-sm text-primary/70">{court.nextMaintenance}</p>,
              },
              {
                key: 'action',
                header: 'Edit',
                render: (court) => (
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
        </div>
      </AdminPanel>
    </div>
  )
}
