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

const statusOptions = ['All', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'] as const

type BookingStatus = (typeof statusOptions)[number]

function formatEgp(value: number) {
  return new Intl.NumberFormat('en-EG', {
    style: 'currency',
    currency: 'EGP',
    maximumFractionDigits: 0,
  }).format(value)
}

export default function AdminBookingsPage() {
  const [search, setSearch] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<BookingStatus>('All')

  const { data: bookingsResponse, loading, error, refetch } = useApiCall('/admin-workspace/bookings')
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const bookingsData = bookingsResponse?.data || bookingsResponse || []

  const handleStatusChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedStatus(event.target.value as BookingStatus)
  }, [])

  const visibleBookings = useMemo(() => {
    const query = search.trim().toLowerCase()

    return bookingsData.filter((booking: any) => {
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
        actions={
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full bg-surface-container-low px-4 py-2 text-sm font-semibold text-primary hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Download className="w-4 h-4" />
            Export Ledger
          </button>
        }
      />

      <AdminPanel eyebrow="Operational control" title="Live Booking Feed">
        <AdminFilterBar
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search by booking id, facility, or customer"
          controls={
            <select
              value={selectedStatus}
              onChange={handleStatusChange}
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
              items={visibleBookings}
              getRowKey={(booking: any) => booking.id}
              columns={[
                {
                  key: 'booking',
                  header: 'Booking',
                  render: (booking: any) => (
                    <div>
                      <p className="font-bold text-primary">{booking.id || 'Unknown'}</p>
                      <p className="text-xs text-primary/60 mt-1">{booking.date || new Date(booking.createdAt).toLocaleDateString()}</p>
                    </div>
                  ),
                },
                {
                  key: 'customer',
                  header: 'Customer',
                  render: (booking: any) => (
                    <div>
                      <p className="text-sm font-semibold text-primary">{booking.user?.name || booking.userId || 'Unknown'}</p>
                      <p className="text-xs text-primary/55 mt-1">{booking.facility?.name || booking.facilityId || 'Unknown'}</p>
                    </div>
                  ),
                },
                {
                  key: 'amount',
                  header: 'Amount',
                  render: (booking: any) => <p className="text-sm font-semibold text-primary">{formatEgp(booking.totalPrice || 0)}</p>,
                },
                {
                  key: 'status',
                  header: 'Status',
                  render: (booking: any) => <AdminStatusPill label={booking.status || 'Unknown'} tone={statusTone(booking.status || 'Unknown')} />,
                },
                {
                  key: 'actions',
                  header: 'Action',
                  render: (booking: any) => (
                    <button
                      type="button"
                      disabled={updatingId === booking.id}
                      onClick={() => {
                        const nextStatus = booking.status === 'PENDING' ? 'CONFIRMED' : booking.status === 'CONFIRMED' ? 'COMPLETED' : booking.status
                        updateStatus(booking.id, nextStatus)
                      }}
                      className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1.5 text-[10px] font-lexend font-bold uppercase tracking-[0.12em] text-primary disabled:opacity-50"
                    >
                      <Repeat2 className="w-3.5 h-3.5" />
                      Advance
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
