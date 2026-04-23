'use client'

import { useCallback, useMemo, useState } from 'react'
import { Download, Repeat2 } from 'lucide-react'
import { AdminFilterBar } from '@/components/admin/AdminFilterBar'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { AdminPanel } from '@/components/admin/AdminPanel'
import { AdminStatusPill } from '@/components/admin/AdminStatusPill'
import { AdminTable } from '@/components/admin/AdminTable'
import { SkeletonTable } from '@/components/ui/SkeletonLoader'
import { useApiCall, useApiMutation } from '@/lib/api/hooks'
import { APIErrorFallback } from '@/components/ui/ErrorBoundary'
import { statusTone } from '@/lib/admin/ui'
import { exportToCsv } from '@/lib/export'
import type { OperatorBookingRecord, OperatorBookingStatus } from '@/lib/operator/mockData'
import { AppSelect } from '@/components/ui/AppSelect'

const statusOptions = ['All', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'] as const

type BookingStatusFilter = (typeof statusOptions)[number]
type BookingStatus = Exclude<BookingStatusFilter, 'All'>

function formatEgp(value: number) {
  return new Intl.NumberFormat('en-EG', {
    style: 'currency',
    currency: 'EGP',
    maximumFractionDigits: 0,
  }).format(value)
}

export default function OperatorBookingsPage() {
  const [search, setSearch] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<BookingStatusFilter>('All')
  const [selectedBranch, setSelectedBranch] = useState<string>('All')

  const { data: bookingsResponse, loading, error, refetch } = useApiCall('/operator/bookings')
  const { data: branchesResponse } = useApiCall('/operator/branches')
  const { data: courtsResponse } = useApiCall('/operator/courts')

  const handleBranchChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedBranch(event.target.value as (typeof branchOptions)[number])
  }, [])

  const handleStatusChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedStatus(event.target.value as BookingStatusFilter)
  }, [])

  const operatorBookingsData = bookingsResponse?.data || bookingsResponse || []
  const branchesData = branchesResponse?.data || branchesResponse || []
  const courtsData = courtsResponse?.data || courtsResponse || []

  const branchOptions = ['All', ...branchesData.map((branch: any) => branch.id)]

  const advanceStatusMutation = useApiMutation('/operator/bookings/:id/status', 'PUT')

  const getBranchNameById = (branchId: string) => {
    const found = branchesData.find((b: any) => b.id === branchId)
    return found?.name || 'Unknown Branch'
  }

  const getCourtNameById = (courtId: string) => {
    const found = courtsData.find((c: any) => c.id === courtId)
    return found?.name || 'Unknown Court'
  }

  const visibleBookings = useMemo(() => {
    const query = search.trim().toLowerCase()

    return operatorBookingsData.filter((booking: OperatorBookingRecord) => {
      const matchesSearch =
        query.length === 0 ||
        booking.id?.toLowerCase()?.includes(query) ||
        booking.customer?.toLowerCase()?.includes(query) ||
        (booking as any).user?.name?.toLowerCase()?.includes(query) ||
        getCourtNameById(booking.courtId).toLowerCase().includes(query)

      const matchesStatus = selectedStatus === 'All' || (booking.status as string).toUpperCase() === selectedStatus
      const matchesBranch = selectedBranch === 'All' || booking.branchId === selectedBranch

      return matchesSearch && matchesStatus && matchesBranch
    })
  }, [operatorBookingsData, search, selectedStatus, selectedBranch, branchesData, courtsData])

  if (error) {
    return <APIErrorFallback error={error} onRetry={() => window.location.reload()} />
  }

  const advanceStatus = async (id: string, status: BookingStatus) => {
    const nextStatus: BookingStatus =
      status === 'PENDING' ? 'CONFIRMED' : status === 'CONFIRMED' ? 'COMPLETED' : status

    try {
      await advanceStatusMutation.mutate({ id, status: nextStatus })
      refetch()
    } catch (err) {
      console.error('Failed to advance status:', err)
    }
  }

  return (
    <div className="space-y-6 motion-safe:animate-[var(--animate-fade-in)]">
      <AdminPageHeader
        title="Bookings Operations"
        subtitle="Supervise booking lifecycle, resolve branch incidents, and progress statuses in real time."
        className="motion-safe:animate-[var(--animate-soft-drop)]"
        actions={
          <button
            type="button"
            onClick={() => {
              const headers = ['ID', 'Customer', 'Date', 'Slot', 'Court', 'Branch', 'Amount', 'Status']
              const rows = visibleBookings.map((b: any) => [
                b.id || '',
                b.customer || b.user?.name || '',
                b.date || '',
                b.slot || '',
                getCourtNameById(b.courtId),
                getBranchNameById(b.branchId),
                String(b.amount || 0),
                b.status || '',
              ])
              exportToCsv('bookings.csv', headers, rows)
            }}
className="inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-surface-container-low to-surface-container-high px-4 py-2 text-sm font-bold text-primary shadow-[0_8px_24px_-12px_rgba(0,17,58,0.6)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_32px_-14px_rgba(0,17,58,0.85)] active:translate-y-0 motion-safe:hover:scale-[1.03] motion-safe:active:scale-[0.97]"
          >
            <Download className="w-4 h-4" />
            Export Bookings
          </button>
        }
      />

      <AdminPanel eyebrow="Live feed" title="Booking Ledger" className="motion-safe:animate-[var(--animate-soft-rise)] animation-delay-100">
        <AdminFilterBar
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search by booking id, customer, or court"
          controls={
            <>
              <AppSelect
                value={selectedBranch}
                onChange={handleBranchChange}
                className="rounded-full bg-gradient-to-br from-surface-container-low to-surface-container-high px-3 py-2 text-xs font-lexend font-black uppercase tracking-[0.12em] text-primary outline-none shadow-[0_4px_12px_-8px_rgba(0,17,58,0.3)] transition-colors hover:shadow-[0_8px_16px_-10px_rgba(0,17,58,0.4)]"
              >
                {branchOptions.map((branchId) => (
                  <option key={branchId} value={branchId}>
                    {branchId === 'All' ? 'All Branches' : getBranchNameById(branchId)}
                  </option>
                ))}
              </AppSelect>

              <AppSelect
                value={selectedStatus}
                onChange={handleStatusChange}
                className="rounded-full bg-gradient-to-br from-surface-container-low to-surface-container-high px-3 py-2 text-xs font-lexend font-black uppercase tracking-[0.12em] text-primary outline-none shadow-[0_4px_12px_-8px_rgba(0,17,58,0.3)] transition-colors hover:shadow-[0_8px_16px_-10px_rgba(0,17,58,0.4)]"
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

        <div className="mt-4 motion-safe:animate-[var(--animate-fade-in)] animation-delay-150">
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
                      <p className="font-black text-primary">{booking.id || 'Unknown'}</p>
                      <p className="text-xs text-primary/60 mt-1">{booking.customer || booking.user?.name || 'Unknown'}</p>
                    </div>
                  ),
                },
                {
                  key: 'schedule',
                  header: 'Schedule',
                  render: (booking: any) => (
                    <div>
                      <p className="text-sm font-bold text-primary">{new Date(booking.date).toLocaleDateString()} • {booking.slot || 'TBD'}</p>
                      <p className="text-xs text-primary/55 mt-1">{getCourtNameById(booking.courtId)}</p>
                    </div>
                  ),
                },
                {
                  key: 'branch',
                  header: 'Branch',
                  render: (booking: any) => <p className="text-sm text-primary/75">{getBranchNameById(booking.branchId)}</p>,
                },
                {
                  key: 'payment',
                  header: 'Payment',
                  render: (booking: any) => (
                    <div>
                      <p className="text-sm font-bold text-primary">{formatEgp(booking.amount || 0)}</p>
                      <p className="text-xs text-primary/55 mt-1">{booking.paymentMethod || 'Unknown'}</p>
                    </div>
                  ),
                },
                {
                  key: 'status',
                  header: 'Status',
                  render: (booking: any) => <AdminStatusPill label={booking.status || 'Unknown'} tone={statusTone(booking.status || 'Unknown')} />,
                },
                {
                  key: 'action',
                  header: 'Action',
                  render: (booking: any) => (
                    <button
                      type="button"
                      onClick={() => advanceStatus(booking.id, booking.status)}
                      disabled={advanceStatusMutation.loading}
                      className="inline-flex items-center gap-1 rounded-full bg-gradient-to-br from-primary/10 to-primary/16 px-3 py-1.5 text-[10px] font-lexend font-black uppercase tracking-[0.12em] text-primary shadow-[0_6px_16px_-10px_rgba(0,17,58,0.5)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_24px_-12px_rgba(0,17,58,0.7)] disabled:opacity-50 disabled:hover:translate-y-0 motion-safe:hover:scale-[1.03]"
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


