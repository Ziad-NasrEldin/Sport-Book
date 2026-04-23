'use client'

import { useCallback, useMemo, useState } from 'react'
import { Download, Repeat2 } from 'lucide-react'
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
const statusOptions = ['All', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'] as const

type BookingStatus = (typeof statusOptions)[number]
type BookingLifecycleStatus = Exclude<BookingStatus, 'All'>

interface Booking {
  id: string
  date?: string
  createdAt?: string
  userId?: string
  facilityId?: string
  totalPrice?: number
  status?: string
  user?: {
    name?: string
  }
  facility?: {
    name?: string
  }
}

function formatEgp(value: number) {
  return new Intl.NumberFormat('en-EG', {
    style: 'currency',
    currency: 'EGP',
    maximumFractionDigits: 0,
  }).format(value)
}

function getNextBookingStatus(status: string): BookingLifecycleStatus {
  if (status === 'PENDING') return 'CONFIRMED'
  if (status === 'CONFIRMED') return 'COMPLETED'
  if (status === 'CANCELLED') return 'CANCELLED'
  return 'COMPLETED'
}

export default function AdminBookingsPage() {
  const [search, setSearch] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<BookingStatus>('All')

  const { data: bookingsResponse, loading, error, refetch } = useApiCall('/admin-workspace/bookings')
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const bookingsData = useMemo<Booking[]>(() => {
    const payload =
      bookingsResponse && typeof bookingsResponse === 'object' && 'data' in bookingsResponse
        ? (bookingsResponse as { data?: unknown }).data
        : bookingsResponse
    return Array.isArray(payload) ? (payload as Booking[]) : []
  }, [bookingsResponse])

  const handleStatusChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedStatus(event.target.value as BookingStatus)
  }, [])

  const visibleBookings = useMemo(() => {
    const query = search.trim().toLowerCase()

    return bookingsData.filter((booking) => {
      const customerName = booking.user?.name || booking.userId || ''
      const facilityName = booking.facility?.name || booking.facilityId || ''
      const matchSearch =
        query.length === 0 ||
        booking.id?.toLowerCase()?.includes(query) ||
        customerName.toLowerCase().includes(query) ||
        facilityName.toLowerCase().includes(query)
      const matchStatus = selectedStatus === 'All' || booking.status === selectedStatus

      return matchSearch && matchStatus
    })
  }, [search, selectedStatus, bookingsData])

  const bookingStats = useMemo(() => {
    return bookingsData.reduce(
      (acc: { total: number; pending: number; confirmed: number; completed: number; revenue: number }, booking) => {
        const status = booking.status || ''
        acc.total += 1
        if (status === 'PENDING') acc.pending += 1
        if (status === 'CONFIRMED') acc.confirmed += 1
        if (status === 'COMPLETED') acc.completed += 1
        acc.revenue += Number(booking.totalPrice || 0)
        return acc
      },
      { total: 0, pending: 0, confirmed: 0, completed: 0, revenue: 0 }
    )
  }, [bookingsData])

  if (error) {
    return <APIErrorFallback error={error} onRetry={() => window.location.reload()} />
  }

  const updateStatus = async (id: string, status: string) => {
    try {
      setUpdatingId(id)
      await api.patch(`/admin-workspace/bookings/${id}/status`, { status })
      await refetch()
    } catch (err) {
      console.error('Failed to update booking status:', err)
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Booking Management"
        subtitle="Oversee booking lifecycle, resolve conflicts quickly, and apply operational status updates in real time."
        className="px-4 py-5 md:px-6"
        actions={
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-surface-container-highest px-4 py-2 text-sm font-semibold text-primary shadow-[0_10px_26px_-20px_rgba(0,17,58,0.65)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-surface-container-lowest hover:shadow-[0_18px_30px_-20px_rgba(0,17,58,0.65)] active:translate-y-0"
          >
            <Download className="w-4 h-4" />
            Export Ledger
          </button>
        }
      />

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-[1.35rem] border border-primary/10 bg-surface-container-lowest p-4 shadow-[0_20px_45px_-34px_rgba(0,17,58,0.75)] animate-[var(--animate-soft-rise)]">
          <p className="text-[10px] uppercase tracking-[0.14em] font-lexend text-primary/60">Total Bookings</p>
          <p className="mt-2 text-3xl font-extrabold text-primary">{bookingStats.total}</p>
        </article>
        <article className="rounded-[1.35rem] border border-primary/10 bg-gradient-to-br from-primary to-primary-container p-4 shadow-[0_22px_46px_-28px_rgba(0,17,58,0.95)] animate-[var(--animate-soft-rise)] animation-delay-100">
          <p className="text-[10px] uppercase tracking-[0.14em] font-lexend text-surface-container-lowest/75">Confirmed + Completed</p>
          <p className="mt-2 text-3xl font-extrabold text-surface-container-lowest">{bookingStats.confirmed + bookingStats.completed}</p>
        </article>
        <article className="rounded-[1.35rem] border border-[#fd8b00]/35 bg-gradient-to-br from-[#fff3e5] to-[#ffe2bf] p-4 shadow-[0_22px_46px_-28px_rgba(253,139,0,0.7)] animate-[var(--animate-soft-rise)] animation-delay-200">
          <p className="text-[10px] uppercase tracking-[0.14em] font-lexend text-[#8a4300]">Pending Queue</p>
          <p className="mt-2 text-3xl font-extrabold text-[#603100]">{bookingStats.pending}</p>
        </article>
        <article className="rounded-[1.35rem] border border-primary/15 bg-gradient-to-br from-[#e8f0ff] to-[#d4e2ff] p-4 shadow-[0_22px_46px_-28px_rgba(0,35,102,0.7)] animate-[var(--animate-soft-rise)] animation-delay-300">
          <p className="text-[10px] uppercase tracking-[0.14em] font-lexend text-primary/70">Gross Value</p>
          <p className="mt-2 text-3xl font-extrabold text-primary">{formatEgp(bookingStats.revenue)}</p>
        </article>
      </section>

      <AdminPanel
        eyebrow="Operational control"
        title="Live Booking Feed"
        className="border border-primary/10 bg-surface-container-lowest/95 shadow-[0_26px_54px_-36px_rgba(0,17,58,0.85)]"
      >
        <AdminFilterBar
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search by booking id, facility, or customer"
          controls={
            <AppSelect
              value={selectedStatus}
              onChange={handleStatusChange}
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
          <div className="mb-2 flex items-center justify-between px-2 py-1">
            <p className="text-[10px] font-lexend uppercase tracking-[0.14em] text-primary/55">Live Operations Snapshot</p>
            <p className="rounded-full bg-primary/[0.08] px-2.5 py-1 text-[10px] font-lexend font-bold uppercase tracking-[0.12em] text-primary">
              {visibleBookings.length} Visible
            </p>
          </div>
          {loading ? (
            <SkeletonTable rows={10} />
          ) : (
            <AdminTable
              items={visibleBookings}
              getRowKey={(booking) => booking.id}
              columns={[
                {
                  key: 'booking',
                  header: 'Booking',
                  render: (booking) => (
                    <div>
                      <p className="font-bold text-primary">{booking.id || 'Unknown'}</p>
                      <p className="text-xs text-primary/60 mt-1">{booking.date || (booking.createdAt ? new Date(booking.createdAt).toLocaleDateString() : 'Unknown')}</p>
                    </div>
                  ),
                },
                {
                  key: 'customer',
                  header: 'Customer',
                  render: (booking) => (
                    <div>
                      <p className="text-sm font-semibold text-primary">{booking.user?.name || booking.userId || 'Unknown'}</p>
                      <p className="text-xs text-primary/55 mt-1">{booking.facility?.name || booking.facilityId || 'Unknown'}</p>
                    </div>
                  ),
                },
                {
                  key: 'amount',
                  header: 'Amount',
                  render: (booking) => <p className="text-sm font-semibold text-primary">{formatEgp(booking.totalPrice || 0)}</p>,
                },
                {
                  key: 'status',
                  header: 'Status',
                  render: (booking) => <AdminStatusPill label={booking.status || 'Unknown'} tone={statusTone(booking.status || 'Unknown')} />,
                },
                {
                  key: 'actions',
                  header: 'Action',
                  render: (booking) => (
                    <button
                      type="button"
                      disabled={updatingId === booking.id || getNextBookingStatus(booking.status || '') === booking.status}
                      onClick={() => {
                        const nextStatus = getNextBookingStatus(booking.status || '')
                        updateStatus(booking.id, nextStatus)
                      }}
                      className="inline-flex items-center gap-1 rounded-full border border-primary/15 bg-gradient-to-r from-primary/15 to-primary-container/20 px-3 py-1.5 text-[10px] font-lexend font-bold uppercase tracking-[0.12em] text-primary transition-all duration-200 hover:-translate-y-0.5 hover:from-primary/20 hover:to-primary-container/30 disabled:opacity-45 disabled:hover:translate-y-0"
                    >
                      <Repeat2 className="w-3.5 h-3.5" />
                      {getNextBookingStatus(booking.status || '') === booking.status ? 'Locked' : 'Advance'}
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

