'use client'

import { useMemo, useState } from 'react'
import { AdminFilterBar } from '@/components/admin/AdminFilterBar'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { AdminPanel } from '@/components/admin/AdminPanel'
import { AdminStatusPill } from '@/components/admin/AdminStatusPill'
import { AdminTable } from '@/components/admin/AdminTable'
import { coachBookings, formatEgp } from '@/lib/coach/mockData'
import { statusTone } from '@/lib/admin/ui'

export default function CoachBookingsPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled'>('all')

  const filteredBookings = useMemo(() => {
    const query = search.trim().toLowerCase()

    return coachBookings.filter((booking) => {
      const matchesStatus = statusFilter === 'all' || booking.status === statusFilter
      const matchesSearch =
        query.length === 0 ||
        booking.athlete.toLowerCase().includes(query) ||
        booking.sessionType.toLowerCase().includes(query) ||
        booking.location.toLowerCase().includes(query)

      return matchesStatus && matchesSearch
    })
  }, [search, statusFilter])

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Bookings"
        subtitle="Track your full booking lifecycle, prioritize high-intent athletes, and keep payouts predictable."
      />

      <section className="grid grid-cols-1 xl:grid-cols-[1.3fr_0.9fr] gap-4">
        <AdminPanel eyebrow="Pipeline" title="Session Requests & Confirmations">
          <AdminFilterBar
            searchValue={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search athlete, session type, or venue"
            controls={
              ['all', 'Pending', 'Confirmed', 'Completed', 'Cancelled'].map((status) => {
                const isActive = statusFilter === status

                return (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setStatusFilter(status as typeof statusFilter)}
                    className={`px-3 py-2 rounded-full text-xs font-lexend font-bold uppercase tracking-[0.14em] ${
                      isActive
                        ? 'bg-primary-container text-surface-container-lowest'
                        : 'bg-surface-container-low text-primary/70'
                    }`}
                  >
                    {status}
                  </button>
                )
              })
            }
          />

          <div className="mt-4">
            <AdminTable
              items={filteredBookings}
              getRowKey={(booking) => booking.id}
              columns={[
                {
                  key: 'athlete',
                  header: 'Athlete',
                  render: (booking) => (
                    <div>
                      <p className="font-bold text-primary">{booking.athlete}</p>
                      <p className="text-xs text-primary/60 mt-1">{booking.id}</p>
                    </div>
                  ),
                },
                {
                  key: 'sessionType',
                  header: 'Session Type',
                  render: (booking) => <span className="font-semibold text-primary">{booking.sessionType}</span>,
                },
                {
                  key: 'schedule',
                  header: 'Schedule',
                  render: (booking) => (
                    <div>
                      <p className="font-semibold text-primary">{booking.dateTime}</p>
                      <p className="text-xs text-primary/60 mt-1">{booking.duration} min • {booking.location}</p>
                    </div>
                  ),
                },
                {
                  key: 'payout',
                  header: 'Payout',
                  render: (booking) => <span className="font-bold text-primary">{formatEgp(booking.payout)}</span>,
                },
                {
                  key: 'status',
                  header: 'Status',
                  render: (booking) => <AdminStatusPill label={booking.status} tone={statusTone(booking.status)} />,
                },
              ]}
            />
          </div>
        </AdminPanel>

        <AdminPanel eyebrow="Today" title="Operational Notes">
          <div className="space-y-3">
            {[
              '2 pending confirmations should be finalized before 17:00.',
              'Travel buffer enabled between back-to-back sessions.',
              'One cancellation request requires your approval.',
            ].map((note) => (
              <article key={note} className="rounded-[var(--radius-default)] bg-surface-container-low px-3.5 py-3">
                <p className="text-sm font-semibold text-primary">{note}</p>
              </article>
            ))}
          </div>
        </AdminPanel>
      </section>
    </div>
  )
}
