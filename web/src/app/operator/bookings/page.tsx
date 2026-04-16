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
import type { OperatorBookingRecord, OperatorBookingStatus } from '@/lib/operator/mockData'

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

  if (error) {
    return <APIErrorFallback error={error} onRetry={() => window.location.reload()} />
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
    <div className="space-y-6">
      <AdminPageHeader
        title="Bookings Operations"
        subtitle="Supervise booking lifecycle, resolve branch incidents, and progress statuses in real time."
        actions={
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full bg-surface-container-low px-4 py-2 text-sm font-semibold text-primary"
          >
            <Download className="w-4 h-4" />
            Export Bookings
          </button>
        }
      />

      <AdminPanel eyebrow="Live feed" title="Booking Ledger">
        <AdminFilterBar
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search by booking id, customer, or court"
          controls={
            <>
              <select
                value={selectedBranch}
                onChange={handleBranchChange}
                className="rounded-full bg-surface-container-low px-3 py-2 text-xs font-lexend font-bold uppercase tracking-[0.12em] text-primary outline-none"
              >
                {branchOptions.map((branchId) => (
                  <option key={branchId} value={branchId}>
                    {branchId === 'All' ? 'All Branches' : getBranchNameById(branchId)}
                  </option>
                ))}
              </select>

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
            </>
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
                      <p className="text-xs text-primary/60 mt-1">{booking.customer || booking.user?.name || 'Unknown'}</p>
                    </div>
                  ),
                },
                {
                  key: 'schedule',
                  header: 'Schedule',
                  render: (booking: any) => (
                    <div>
                      <p className="text-sm font-semibold text-primary">{new Date(booking.date).toLocaleDateString()} • {booking.slot || 'TBD'}</p>
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
                      <p className="text-sm font-semibold text-primary">{formatEgp(booking.amount || 0)}</p>
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
