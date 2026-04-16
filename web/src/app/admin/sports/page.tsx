'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Plus } from 'lucide-react'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { AdminPanel } from '@/components/admin/AdminPanel'
import { AdminStatusPill } from '@/components/admin/AdminStatusPill'
import { AdminTable } from '@/components/admin/AdminTable'
import { SkeletonTable } from '@/components/ui/SkeletonLoader'
import { useApiCall, useApiMutation } from '@/lib/api/hooks'
import { APIErrorFallback } from '@/components/ui/ErrorBoundary'
import { statusTone } from '@/lib/admin/ui'

export default function AdminSportsPage() {
  const { data: sportsResponse, loading, error, refetch } = useApiCall('/admin-workspace/sports')
  const toggleMutation = useApiMutation('/admin-workspace/sports/:id', 'PATCH')

  const sportsData = sportsResponse?.data || sportsResponse || []

  const toggleSport = async (id: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'ENABLED' ? 'DISABLED' : 'ENABLED'
      await toggleMutation.mutate({ id, status: newStatus })
      refetch()
    } catch (err) {
      console.error('Failed to toggle sport:', err)
    }
  }

  if (error) {
    return <APIErrorFallback error={error} onRetry={() => window.location.reload()} />
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
        {loading ? (
          <SkeletonTable rows={10} />
        ) : (
          <AdminTable
            items={sportsData}
            getRowKey={(row: any) => row.id}
            columns={[
              {
                key: 'sport',
                header: 'Sport',
                render: (row: any) => <p className="font-bold text-primary">{row.name || 'Unknown'}</p>,
              },
              {
                key: 'categories',
                header: 'Categories',
                render: (row: any) => <p className="text-sm text-primary/75">{row.categories || 'N/A'}</p>,
              },
              {
                key: 'listings',
                header: 'Active Listings',
                render: (row: any) => <p className="text-sm text-primary/75">{row._count?.courts || 0}</p>,
              },
              {
                key: 'status',
                header: 'Status',
                render: (row: any) => <AdminStatusPill label={row.status || 'Unknown'} tone={statusTone(row.status || 'Unknown')} />,
              },
              {
                key: 'action',
                header: 'Action',
                render: (row: any) => (
                  <button
                    type="button"
                    disabled={toggleMutation.loading}
                    onClick={() => toggleSport(row.id, row.status)}
                    className="rounded-full bg-primary/10 px-3 py-1.5 text-[10px] font-lexend font-bold uppercase tracking-[0.12em] text-primary disabled:opacity-50"
                  >
                    Toggle
                  </button>
                ),
              },
            ]}
          />
        )}
      </AdminPanel>
    </div>
  )
}
