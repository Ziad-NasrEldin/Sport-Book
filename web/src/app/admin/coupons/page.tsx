'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import { AdminFilterBar } from '@/components/admin/AdminFilterBar'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { AdminPanel } from '@/components/admin/AdminPanel'
import { AdminStatusPill } from '@/components/admin/AdminStatusPill'
import { AdminTable } from '@/components/admin/AdminTable'
import { couponsData, type CouponRecord } from '@/lib/admin/mockData'
import { statusTone } from '@/lib/admin/ui'

const statusOptions = ['All', 'Active', 'Expired', 'Draft'] as const

export default function AdminCouponsPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<(typeof statusOptions)[number]>('All')
  const [rows, setRows] = useState<CouponRecord[]>(couponsData)

  const visibleCoupons = useMemo(() => {
    const query = search.trim().toLowerCase()

    return rows.filter((coupon) => {
      const matchesSearch =
        query.length === 0 ||
        coupon.code.toLowerCase().includes(query) ||
        coupon.id.toLowerCase().includes(query)
      const matchesStatus = statusFilter === 'All' || coupon.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [rows, search, statusFilter])

  const toggleCoupon = (id: string) => {
    setRows((prev) =>
      prev.map((coupon) => {
        if (coupon.id !== id) return coupon

        if (coupon.status === 'Active') {
          return { ...coupon, status: 'Draft' }
        }

        return { ...coupon, status: 'Active' }
      }),
    )
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
              onChange={(event) => setStatusFilter(event.target.value as (typeof statusOptions)[number])}
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
          <AdminTable
            items={visibleCoupons}
            getRowKey={(coupon) => coupon.id}
            columns={[
              {
                key: 'coupon',
                header: 'Coupon',
                render: (coupon) => (
                  <div>
                    <p className="font-bold text-primary">{coupon.code}</p>
                    <p className="text-xs text-primary/60 mt-1">{coupon.id}</p>
                  </div>
                ),
              },
              {
                key: 'discount',
                header: 'Discount',
                render: (coupon) => <p className="text-sm font-semibold text-primary">{coupon.discount}</p>,
              },
              {
                key: 'usage',
                header: 'Usage',
                render: (coupon) => <p className="text-sm text-primary/75">{coupon.usage}</p>,
              },
              {
                key: 'expires',
                header: 'Expires',
                render: (coupon) => <p className="text-sm text-primary/75">{coupon.expiresAt}</p>,
              },
              {
                key: 'status',
                header: 'Status',
                render: (coupon) => <AdminStatusPill label={coupon.status} tone={statusTone(coupon.status)} />,
              },
              {
                key: 'action',
                header: 'Action',
                render: (coupon) => (
                  <button
                    type="button"
                    onClick={() => toggleCoupon(coupon.id)}
                    className="rounded-full bg-primary/10 px-3 py-1.5 text-[10px] font-lexend font-bold uppercase tracking-[0.12em] text-primary"
                  >
                    Toggle
                  </button>
                ),
              },
            ]}
          />
        </div>
      </AdminPanel>
    </div>
  )
}
