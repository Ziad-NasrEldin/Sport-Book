'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { Building2, Download } from 'lucide-react'
import { AdminFilterBar } from '@/components/admin/AdminFilterBar'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { AdminPanel } from '@/components/admin/AdminPanel'
import { AdminStatusPill } from '@/components/admin/AdminStatusPill'
import { AdminTable } from '@/components/admin/AdminTable'
import { branchesData, formatEgp } from '@/lib/operator/mockData'
import { statusTone } from '@/lib/admin/ui'

const cityOptions = ['All', ...new Set(branchesData.map((branch) => branch.city))] as const
const statusOptions = ['All', 'Active', 'Pending Setup', 'Maintenance', 'Paused'] as const

export default function OperatorBranchesPage() {
  const [search, setSearch] = useState('')
  const [selectedCity, setSelectedCity] = useState<(typeof cityOptions)[number]>('All')
  const [selectedStatus, setSelectedStatus] = useState<(typeof statusOptions)[number]>('All')

  const filteredBranches = useMemo(() => {
    const query = search.trim().toLowerCase()

    return branchesData.filter((branch) => {
      const matchesSearch =
        query.length === 0 ||
        branch.name.toLowerCase().includes(query) ||
        branch.id.toLowerCase().includes(query) ||
        branch.manager.toLowerCase().includes(query)

      const matchesCity = selectedCity === 'All' || branch.city === selectedCity
      const matchesStatus = selectedStatus === 'All' || branch.status === selectedStatus

      return matchesSearch && matchesCity && matchesStatus
    })
  }, [search, selectedCity, selectedStatus])

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
              <select
                value={selectedCity}
                onChange={(event) => setSelectedCity(event.target.value as (typeof cityOptions)[number])}
                className="rounded-full bg-surface-container-low px-3 py-2 text-xs font-lexend font-bold uppercase tracking-[0.12em] text-primary outline-none"
              >
                {cityOptions.map((city) => (
                  <option key={city} value={city}>
                    {city}
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
            items={filteredBranches}
            getRowKey={(branch) => branch.id}
            columns={[
              {
                key: 'branch',
                header: 'Branch',
                render: (branch) => (
                  <div>
                    <Link href={`/operator/branches/${branch.id}`} className="font-bold text-primary hover:text-secondary transition-colors">
                      {branch.name}
                    </Link>
                    <p className="text-xs text-primary/60 mt-1">{branch.id}</p>
                  </div>
                ),
              },
              {
                key: 'manager',
                header: 'Manager',
                render: (branch) => (
                  <div>
                    <p className="text-sm font-semibold text-primary">{branch.manager}</p>
                    <p className="text-xs text-primary/55 mt-1">{branch.city}</p>
                  </div>
                ),
              },
              {
                key: 'capacity',
                header: 'Courts',
                render: (branch) => <p className="text-sm font-semibold text-primary">{branch.courts}</p>,
              },
              {
                key: 'utilization',
                header: 'Utilization',
                render: (branch) => (
                  <div className="min-w-[120px]">
                    <p className="text-sm font-semibold text-primary">{branch.utilization}%</p>
                    <div className="mt-1 h-1.5 rounded-full bg-primary/10 overflow-hidden">
                      <div className="h-full rounded-full bg-secondary-container" style={{ width: `${branch.utilization}%` }} />
                    </div>
                  </div>
                ),
              },
              {
                key: 'revenue',
                header: 'Revenue',
                render: (branch) => <p className="text-sm font-semibold text-primary">{formatEgp(branch.monthlyRevenue)}</p>,
              },
              {
                key: 'status',
                header: 'Status',
                render: (branch) => <AdminStatusPill label={branch.status} tone={statusTone(branch.status)} />,
              },
              {
                key: 'action',
                header: 'Action',
                render: (branch) => (
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
        </div>
      </AdminPanel>
    </div>
  )
}
