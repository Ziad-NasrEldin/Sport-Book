'use client'

import Link from 'next/link'
import { useCallback, useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import { AdminFilterBar } from '@/components/admin/AdminFilterBar'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { AdminPanel } from '@/components/admin/AdminPanel'
import { AdminStatusPill } from '@/components/admin/AdminStatusPill'
import { AdminTable } from '@/components/admin/AdminTable'
import { SkeletonTable } from '@/components/ui/SkeletonLoader'
import { useApiCall, useApiMutation } from '@/lib/api/hooks'
import { APIErrorFallback } from '@/components/ui/ErrorBoundary'
import { statusTone } from '@/lib/admin/ui'

const statusOptions = ['All', 'ACTIVE', 'EXPIRED', 'DRAFT'] as const

function formatEgp(value: number) {
  return new Intl.NumberFormat('en-EG', {
    style: 'currency',
    currency: 'EGP',
    maximumFractionDigits: 0,
  }).format(value)
}

export default function AdminCouponsPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<(typeof statusOptions)[number]>('All')

  const { data: couponsResponse, loading, error, refetch } = useApiCall('/admin-workspace/coupons')
  const toggleMutation = useApiMutation('/admin-workspace/coupons/:id', 'PATCH')

  const couponsData = couponsResponse?.data || couponsResponse || []

  const handleStatusFilterChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(event.target.value as (typeof statusOptions)[number])
  }, [])

  const visibleCoupons = useMemo(() => {
    const query = search.trim().toLowerCase()

    return couponsData.filter((coupon: any) => {
      const matchesSearch =
        query.length === 0 ||
        coupon.code?.toLowerCase()?.includes(query) ||
        coupon.id?.toLowerCase()?.includes(query)
      const matchesStatus = statusFilter === 'All' || coupon.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [couponsData, search, statusFilter])

  const toggleCoupon = async (id: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'ACTIVE' ? 'DRAFT' : 'ACTIVE'
      await toggleMutation.mutate({ id, status: newStatus })
      refetch()
    } catch (err) {
      console.error('Failed to toggle coupon:', err)
    }
  }

  if (error) {
    return <APIErrorFallback error={error} onRetry={() => window.location.reload()} />
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Coupon Management"
        subtitle="Launch and monitor promotion campaigns with lifecycle controls and redemption visibility."
        actions={
          <Link
            href="/admin/coupons/create"
            className="inline-flex items-center gap-2 rounded-full bg-primary-container px-4 py-2 text-sm font-semibold text-surface-container-lowest"
          >
            <Plus className="w-4 h-4" />
            Create Coupon
          </Link>
        }
      />

      <AdminPanel eyebrow="Campaigns" title="Coupon Registry">
        <AdminFilterBar
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search by coupon code"
          controls={
            <select
              value={statusFilter}
              onChange={handleStatusFilterChange}
              className="rounded-full bg-surface-container-low px-3 py-2 text-xs font-lexend font-bold uppercase tracking-[0.12em] text-primary outline-none"
            >
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
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
              items={visibleCoupons}
              getRowKey={(coupon: any) => coupon.id}
              columns={[
                {
                  key: 'coupon',
                  header: 'Coupon',
                  render: (coupon: any) => (
                    <div>
                      <p className="font-bold text-primary">{coupon.code || 'Unknown'}</p>
                      <p className="text-xs text-primary/60 mt-1">{coupon.id || 'Unknown'}</p>
                    </div>
                  ),
                },
                {
                  key: 'discount',
                  header: 'Discount',
                  render: (coupon: any) => (
                    <p className="text-sm font-semibold text-primary">
                      {coupon.type === 'PERCENTAGE' ? `${coupon.value}%` : formatEgp(coupon.value)}
                    </p>
                  ),
                },
                {
                  key: 'usage',
                  header: 'Usage',
                  render: (coupon: any) => <p className="text-sm text-primary/75">{coupon.usesCount || 0} / {coupon.maxUses || 'Unlimited'}</p>,
                },
                {
                  key: 'expires',
                  header: 'Expires',
                  render: (coupon: any) => <p className="text-sm text-primary/75">{new Date(coupon.expiresAt).toLocaleDateString()}</p>,
                },
                {
                  key: 'status',
                  header: 'Status',
                  render: (coupon: any) => <AdminStatusPill label={coupon.status || 'Unknown'} tone={statusTone(coupon.status || 'Unknown')} />,
                },
                {
                  key: 'action',
                  header: 'Action',
                  render: (coupon: any) => (
                    <button
                      type="button"
                      disabled={toggleMutation.loading}
                      onClick={() => toggleCoupon(coupon.id, coupon.status)}
                      className="rounded-full bg-primary/10 px-3 py-1.5 text-[10px] font-lexend font-bold uppercase tracking-[0.12em] text-primary disabled:opacity-50"
                    >
                      Toggle
                    </button>
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
