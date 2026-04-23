'use client'

import Link from 'next/link'
import { useCallback, useMemo, useState } from 'react'
import { Clock3, Plus, Ticket, Zap } from 'lucide-react'
import { AdminFilterBar } from '@/components/admin/AdminFilterBar'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { AdminPanel } from '@/components/admin/AdminPanel'
import { AdminStatusPill } from '@/components/admin/AdminStatusPill'
import { AdminTable } from '@/components/admin/AdminTable'
import { SkeletonTable } from '@/components/ui/SkeletonLoader'
import { useApiCall } from '@/lib/api/hooks'
import { api } from '@/lib/api/client'
import { APIErrorFallback } from '@/components/ui/ErrorBoundary'
import { statusTone } from '@/lib/admin/ui'

import { AppSelect } from '@/components/ui/AppSelect'
const statusOptions = ['All', 'ACTIVE', 'EXPIRED', 'DRAFT'] as const

type CouponRecord = {
  id: string
  code?: string | null
  type?: 'PERCENTAGE' | string | null
  value?: number | null
  usesCount?: number | null
  maxUses?: number | null
  expiresAt?: string | null
  status?: string | null
}

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
  const [optimisticStatuses, setOptimisticStatuses] = useState<Record<string, string>>({})

  const { data: couponsResponse, loading, error, refetch } = useApiCall('/admin-workspace/coupons')
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const couponsData = useMemo<CouponRecord[]>(() => {
    const payload =
      couponsResponse && typeof couponsResponse === 'object' && 'data' in couponsResponse
        ? couponsResponse.data
        : couponsResponse

    if (!Array.isArray(payload)) return []

    return (payload as CouponRecord[]).map((coupon) => {
      const optimisticStatus = optimisticStatuses[coupon.id]
      if (!optimisticStatus) return coupon
      return { ...coupon, status: optimisticStatus }
    })
  }, [couponsResponse, optimisticStatuses])

  const handleStatusFilterChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(event.target.value as (typeof statusOptions)[number])
  }, [])

  const visibleCoupons = useMemo(() => {
    const query = search.trim().toLowerCase()

    return couponsData.filter((coupon) => {
      const matchesSearch =
        query.length === 0 ||
        coupon.code?.toLowerCase()?.includes(query) ||
        coupon.id?.toLowerCase()?.includes(query)
      const matchesStatus = statusFilter === 'All' || coupon.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [couponsData, search, statusFilter])

  const couponStats = useMemo(() => {
    const now = Date.now()
    const soonWindow = now + 1000 * 60 * 60 * 24 * 7

    return couponsData.reduce(
      (acc, coupon) => {
        acc.total += 1
        if (coupon.status === 'ACTIVE') acc.active += 1
        if (coupon.status === 'DRAFT') acc.draft += 1

        const expiresAtTs = coupon.expiresAt ? new Date(coupon.expiresAt).getTime() : Number.NaN
        const hasExpiry = Number.isFinite(expiresAtTs)
        const dateExpired = hasExpiry && expiresAtTs < now

        if (coupon.status === 'EXPIRED' || dateExpired) acc.expired += 1
        if (coupon.status === 'ACTIVE' && hasExpiry && expiresAtTs >= now && expiresAtTs <= soonWindow) {
          acc.expiringSoon += 1
        }

        return acc
      },
      { total: 0, active: 0, draft: 0, expired: 0, expiringSoon: 0 }
    )
  }, [couponsData])

  const toggleCoupon = async (id: string, currentStatus: string) => {
    const previousStatus = currentStatus || 'DRAFT'
    const newStatus = previousStatus === 'ACTIVE' ? 'DRAFT' : 'ACTIVE'

    try {
      setUpdatingId(id)
      setOptimisticStatuses((prev) => ({ ...prev, [id]: newStatus }))
      await api.patch(`/admin-workspace/coupons/${id}`, { status: newStatus })
      await refetch()
      setOptimisticStatuses((prev) => {
        const next = { ...prev }
        delete next[id]
        return next
      })
    } catch (err) {
      setOptimisticStatuses((prev) => {
        const next = { ...prev }
        delete next[id]
        return next
      })
      console.error('Failed to toggle coupon:', err)
    } finally {
      setUpdatingId(null)
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
        className="px-4 py-5 md:px-6"
        actions={
          <Link
            href="/admin/coupons/create"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-primary-container px-4 py-2 text-sm font-semibold text-surface-container-lowest shadow-[0_16px_30px_-18px_rgba(0,17,58,0.75)] transition-all duration-200 hover:-translate-y-0.5 hover:brightness-110 active:translate-y-0"
          >
            <Plus className="w-4 h-4" />
            Create Coupon
          </Link>
        }
      />

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-[1.35rem] border border-primary/10 bg-surface-container-lowest p-4 shadow-[0_20px_45px_-34px_rgba(0,17,58,0.75)] animate-[var(--animate-soft-rise)]">
          <p className="text-[10px] uppercase tracking-[0.14em] font-lexend text-primary/60">Total Coupons</p>
          <p className="mt-2 text-3xl font-extrabold text-primary">{couponStats.total}</p>
        </article>
        <article className="rounded-[1.35rem] border border-primary/10 bg-gradient-to-br from-primary to-primary-container p-4 shadow-[0_22px_46px_-28px_rgba(0,17,58,0.95)] animate-[var(--animate-soft-rise)] animation-delay-100">
          <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em] font-lexend text-surface-container-lowest/80">
            <Zap className="h-3 w-3" />
            Active
          </p>
          <p className="mt-2 text-3xl font-extrabold text-surface-container-lowest">{couponStats.active}</p>
        </article>
        <article className="rounded-[1.35rem] border border-[#fd8b00]/35 bg-gradient-to-br from-[#fff3e5] to-[#ffe2bf] p-4 shadow-[0_22px_46px_-28px_rgba(253,139,0,0.7)] animate-[var(--animate-soft-rise)] animation-delay-200">
          <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em] font-lexend text-[#8a4300]">
            <Clock3 className="h-3 w-3" />
            Expiring Soon
          </p>
          <p className="mt-2 text-3xl font-extrabold text-[#603100]">{couponStats.expiringSoon}</p>
        </article>
        <article className="rounded-[1.35rem] border border-[#c91919]/20 bg-gradient-to-br from-[#fff3f3] to-[#ffe4e4] p-4 shadow-[0_22px_46px_-28px_rgba(201,25,25,0.6)] animate-[var(--animate-soft-rise)] animation-delay-300">
          <p className="text-[10px] uppercase tracking-[0.14em] font-lexend text-[#9b1c1c]">Expired / Draft</p>
          <p className="mt-2 text-3xl font-extrabold text-[#7a1616]">
            {couponStats.expired + couponStats.draft}
          </p>
        </article>
      </section>

      <AdminPanel
        eyebrow="Campaigns"
        title="Coupon Registry"
        className="border border-primary/10 bg-surface-container-lowest/95 shadow-[0_26px_54px_-36px_rgba(0,17,58,0.85)]"
      >
        <AdminFilterBar
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search by coupon code"
          controls={
            <AppSelect
              value={statusFilter}
              onChange={handleStatusFilterChange}
              className="rounded-full border border-primary/10 bg-surface-container-low px-3 py-2 text-xs font-lexend font-bold uppercase tracking-[0.12em] text-primary outline-none transition-colors hover:bg-surface-container-medium"
            >
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </AppSelect>
          }
        />

        <div className="mt-4 rounded-[1.25rem] border border-primary/8 bg-surface-container-lowest p-2">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2 px-2 py-1">
            <p className="text-[10px] font-lexend uppercase tracking-[0.14em] text-primary/55">Campaign Pulse</p>
            <div className="flex items-center gap-2">
              <p className="rounded-full bg-primary/[0.08] px-2.5 py-1 text-[10px] font-lexend font-bold uppercase tracking-[0.12em] text-primary">
                {visibleCoupons.length} Visible
              </p>
              <p className="inline-flex items-center gap-1 rounded-full bg-[#fd8b00]/16 px-2.5 py-1 text-[10px] font-lexend font-bold uppercase tracking-[0.12em] text-[#8a4300]">
                <Ticket className="h-3 w-3" />
                {couponStats.expiringSoon} Closing in 7d
              </p>
            </div>
          </div>
          {loading && couponsData.length === 0 ? (
            <SkeletonTable rows={10} />
          ) : (
            <AdminTable
              items={visibleCoupons}
              getRowKey={(coupon) => coupon.id}
              columns={[
                {
                  key: 'coupon',
                  header: 'Coupon',
                  render: (coupon) => (
                    <div>
                      <p className="font-bold text-primary">{coupon.code || 'Unknown'}</p>
                      <p className="text-xs text-primary/60 mt-1">{coupon.id || 'Unknown'}</p>
                    </div>
                  ),
                },
                {
                  key: 'discount',
                  header: 'Discount',
                  render: (coupon) => (
                    <p className="text-sm font-semibold text-primary">
                      {coupon.type === 'PERCENTAGE'
                        ? `${coupon.value ?? 0}%`
                        : formatEgp(typeof coupon.value === 'number' ? coupon.value : 0)}
                    </p>
                  ),
                },
                {
                  key: 'usage',
                  header: 'Usage',
                  render: (coupon) => (
                    <p className="text-sm text-primary/75">
                      {coupon.usesCount || 0} / {coupon.maxUses || 'Unlimited'}
                    </p>
                  ),
                },
                {
                  key: 'expires',
                  header: 'Expires',
                  render: (coupon) => (
                    <p className="text-sm text-primary/75">
                      {coupon.expiresAt ? new Date(coupon.expiresAt).toLocaleDateString() : 'No expiry'}
                    </p>
                  ),
                },
                {
                  key: 'status',
                  header: 'Status',
                  render: (coupon) => (
                    <AdminStatusPill label={coupon.status || 'Unknown'} tone={statusTone(coupon.status || 'Unknown')} />
                  ),
                },
                {
                  key: 'action',
                  header: 'Action',
                  render: (coupon) => (
                    <button
                      type="button"
                      disabled={updatingId === coupon.id}
                      onClick={() => toggleCoupon(coupon.id, coupon.status || 'DRAFT')}
                      className="inline-flex items-center gap-1 rounded-full border border-primary/15 bg-gradient-to-r from-primary/15 to-primary-container/20 px-3 py-1.5 text-[10px] font-lexend font-bold uppercase tracking-[0.12em] text-primary transition-all duration-200 hover:-translate-y-0.5 hover:from-primary/20 hover:to-primary-container/30 disabled:opacity-45 disabled:hover:translate-y-0"
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

