'use client'

import { useMemo, useState } from 'react'
import { Download, Repeat2 } from 'lucide-react'
import { AdminFilterBar } from '@/components/admin/AdminFilterBar'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { AdminPanel } from '@/components/admin/AdminPanel'
import { AdminStatusPill } from '@/components/admin/AdminStatusPill'
import { AdminTable } from '@/components/admin/AdminTable'
import { bookingsData, formatEgp } from '@/lib/admin/mockData'
import { statusTone } from '@/lib/admin/ui'

const statusOptions = ['All', 'Pending', 'Confirmed', 'Completed', 'Cancelled'] as const

type BookingStatus = (typeof statusOptions)[number]

type BookingState = {
  id: string
  status: BookingStatus
}

export default function AdminBookingsPage() {
  const [search, setSearch] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<BookingStatus>('All')
  const [statusOverrides, setStatusOverrides] = useState<BookingState[]>([])

  const withStatus = useMemo(() => {
    return bookingsData.map((booking) => {
      const override = statusOverrides.find((entry) => entry.id === booking.id)

      if (!override || override.status === 'All') {
        return booking
      }

      return {
        ...booking,
        status: override.status,
      }
    })
  }, [statusOverrides])

  const visibleBookings = useMemo(() => {
    const query = search.trim().toLowerCase()

    return withStatus.filter((booking) => {
      const matchSearch =
        query.length === 0 ||
        booking.id.toLowerCase().includes(query) ||
        booking.customer.toLowerCase().includes(query) ||
        booking.facility.toLowerCase().includes(query)
      const matchStatus = selectedStatus === 'All' || booking.status === selectedStatus

      return matchSearch && matchStatus
    })
  }, [search, selectedStatus, withStatus])

  const updateStatus = (id: string, status: BookingStatus) => {
    setStatusOverrides((prev) => {
      const existing = prev.find((entry) => entry.id === id)
      if (existing) {
        return prev.map((entry) => (entry.id === id ? { ...entry, status } : entry))
      }

      return [...prev, { id, status }]
    })
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Booking Management"
        subtitle="Oversee booking lifecycle, resolve conflicts quickly, and apply operational status updates in real time."
        actions={
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full bg-surface-container-low px-4 py-2 text-sm font-semibold text-primary"
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
              onChange={(event) => setSelectedStatus(event.target.value as BookingStatus)}
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
            items={visibleBookings}
            getRowKey={(booking) => booking.id}
            columns={[
              {
                key: 'booking',
                header: 'Booking',
                render: (booking) => (
                  <div>
                    <p className="font-bold text-primary">{booking.id}</p>
                    <p className="text-xs text-primary/60 mt-1">{booking.date}</p>
                  </div>
                ),
              },
              {
                key: 'customer',
                header: 'Customer',
                render: (booking) => (
                  <div>
                    <p className="text-sm font-semibold text-primary">{booking.customer}</p>
                    <p className="text-xs text-primary/55 mt-1">{booking.facility}</p>
                  </div>
                ),
              },
              {
                key: 'amount',
                header: 'Amount',
                render: (booking) => <p className="text-sm font-semibold text-primary">{formatEgp(booking.amount)}</p>,
              },
              {
                key: 'status',
                header: 'Status',
                render: (booking) => <AdminStatusPill label={booking.status} tone={statusTone(booking.status)} />,
              },
              {
                key: 'actions',
                header: 'Action',
                render: (booking) => (
                  <button
                    type="button"
                    onClick={() =>
                      updateStatus(
                        booking.id,
                        booking.status === 'Pending'
                          ? 'Confirmed'
                          : booking.status === 'Confirmed'
                            ? 'Completed'
                            : booking.status,
                      )
                    }
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
