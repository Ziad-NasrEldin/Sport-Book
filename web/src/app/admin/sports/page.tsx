'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Plus } from 'lucide-react'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { AdminPanel } from '@/components/admin/AdminPanel'
import { AdminStatusPill } from '@/components/admin/AdminStatusPill'
import { AdminTable } from '@/components/admin/AdminTable'
import { sportsData, type SportRecord } from '@/lib/admin/mockData'
import { statusTone } from '@/lib/admin/ui'

export default function AdminSportsPage() {
  const [rows, setRows] = useState<SportRecord[]>(sportsData)

  const toggleSport = (id: string) => {
    setRows((prev) =>
      prev.map((sport) => {
        if (sport.id !== id) return sport
        return {
          ...sport,
          status: sport.status === 'Enabled' ? 'Disabled' : 'Enabled',
        }
      }),
    )
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Supported Sports"
        subtitle="Manage sports catalog, listing activation, and category coverage for the discovery engine."
        actions={
          <Link
            href="/admin/sports/create"
            className="inline-flex items-center gap-2 rounded-full bg-primary-container px-4 py-2 text-sm font-semibold text-surface-container-lowest"
          >
            <Plus className="w-4 h-4" />
            Add Sport
          </Link>
        }
      />

      <AdminPanel eyebrow="Catalog" title="Sports and Categories">
        <AdminTable
          items={rows}
          getRowKey={(row) => row.id}
          columns={[
            {
              key: 'sport',
              header: 'Sport',
              render: (row) => <p className="font-bold text-primary">{row.name}</p>,
            },
            {
              key: 'categories',
              header: 'Categories',
              render: (row) => <p className="text-sm text-primary/75">{row.categories}</p>,
            },
            {
              key: 'listings',
              header: 'Active Listings',
              render: (row) => <p className="text-sm text-primary/75">{row.activeListings}</p>,
            },
            {
              key: 'status',
              header: 'Status',
              render: (row) => <AdminStatusPill label={row.status} tone={statusTone(row.status)} />,
            },
            {
              key: 'action',
              header: 'Action',
              render: (row) => (
                <button
                  type="button"
                  onClick={() => toggleSport(row.id)}
                  className="rounded-full bg-primary/10 px-3 py-1.5 text-[10px] font-lexend font-bold uppercase tracking-[0.12em] text-primary"
                >
                  Toggle
                </button>
              ),
            },
          ]}
        />
      </AdminPanel>
    </div>
  )
}
