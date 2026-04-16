'use client'

import { useMemo, useState } from 'react'
import { Download, Repeat2 } from 'lucide-react'
import { AdminFilterBar } from '@/components/admin/AdminFilterBar'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { AdminPanel } from '@/components/admin/AdminPanel'
import { AdminStatusPill } from '@/components/admin/AdminStatusPill'
import { AdminTable } from '@/components/admin/AdminTable'
import {
  branchesData,
  formatEgp,
  getBranchNameById,
  getCourtNameById,
  operatorBookingsData,
} from '@/lib/operator/mockData'
import { statusTone } from '@/lib/admin/ui'

const statusOptions = ['All', 'Pending', 'Confirmed', 'Completed', 'Cancelled'] as const
const branchOptions = ['All', ...branchesData.map((branch) => branch.id)] as const

type BookingStatusFilter = (typeof statusOptions)[number]
type BookingStatus = Exclude<BookingStatusFilter, 'All'>

type BookingOverride = {
  id: string
  status: BookingStatus
}

export default function OperatorBookingsPage() {
  const [search, setSearch] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<BookingStatusFilter>('All')
  const [selectedBranch, setSelectedBranch] = useState<(typeof branchOptions)[number]>('All')
  const [overrides, setOverrides] = useState<BookingOverride[]>([])

  const withStatus = useMemo(() => {
    return operatorBookingsData.map((booking) => {
      const override = overrides.find((entry) => entry.id === booking.id)
      if (!override) return booking

      return {
        ...booking,
        status: override.status,
      }
    })
  }, [overrides])

  const visibleBookings = useMemo(() => {
    const query = search.trim().toLowerCase()

    return withStatus.filter((booking) => {
      const matchesSearch =
        query.length === 0 ||
        booking.id.toLowerCase().includes(query) ||
        booking.customer.toLowerCase().includes(query) ||
        getCourtNameById(booking.courtId).toLowerCase().includes(query)

      const matchesStatus = selectedStatus === 'All' || booking.status === selectedStatus
      const matchesBranch = selectedBranch === 'All' || booking.branchId === selectedBranch

      return matchesSearch && matchesStatus && matchesBranch
    })
  }, [search, selectedStatus, selectedBranch, withStatus])

  const advanceStatus = (id: string, status: BookingStatus) => {
    const nextStatus: BookingStatus =
      status === 'Pending' ? 'Confirmed' : status === 'Confirmed' ? 'Completed' : status

    setOverrides((prev) => {
      const existing = prev.find((entry) => entry.id === id)
      if (existing) {
        return prev.map((entry) => (entry.id === id ? { ...entry, status: nextStatus } : entry))
      }
      return [...prev, { id, status: nextStatus }]
    })
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
                onChange={(event) => setSelectedBranch(event.target.value as (typeof branchOptions)[number])}
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
                onChange={(event) => setSelectedStatus(event.target.value as BookingStatusFilter)}
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
            items={visibleBookings}
            getRowKey={(booking) => booking.id}
            columns={[
              {
                key: 'booking',
                header: 'Booking',
                render: (booking) => (
                  <div>
                    <p className="font-bold text-primary">{booking.id}</p>
                    <p className="text-xs text-primary/60 mt-1">{booking.customer}</p>
                  </div>
                ),
              },
              {
                key: 'schedule',
                header: 'Schedule',
                render: (booking) => (
                  <div>
                    <p className="text-sm font-semibold text-primary">{booking.date} • {booking.slot}</p>
                    <p className="text-xs text-primary/55 mt-1">{getCourtNameById(booking.courtId)}</p>
                  </div>
                ),
              },
              {
                key: 'branch',
                header: 'Branch',
                render: (booking) => <p className="text-sm text-primary/75">{getBranchNameById(booking.branchId)}</p>,
              },
              {
                key: 'payment',
                header: 'Payment',
                render: (booking) => (
                  <div>
                    <p className="text-sm font-semibold text-primary">{formatEgp(booking.amount)}</p>
                    <p className="text-xs text-primary/55 mt-1">{booking.paymentMethod}</p>
                  </div>
                ),
              },
              {
                key: 'status',
                header: 'Status',
                render: (booking) => <AdminStatusPill label={booking.status} tone={statusTone(booking.status)} />,
              },
              {
                key: 'action',
                header: 'Action',
                render: (booking) => (
                  <button
                    type="button"
                    onClick={() => advanceStatus(booking.id, booking.status)}
                    className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1.5 text-[10px] font-lexend font-bold uppercase tracking-[0.12em] text-primary"
                  >
                    <Repeat2 className="w-3.5 h-3.5" />
                    Advance
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
