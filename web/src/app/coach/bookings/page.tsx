'use client'

import { useMemo, useState, useEffect } from 'react'
import { AdminFilterBar } from '@/components/admin/AdminFilterBar'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { AdminPanel } from '@/components/admin/AdminPanel'
import { AdminStatusPill } from '@/components/admin/AdminStatusPill'
import { AdminTable } from '@/components/admin/AdminTable'
import { SkeletonTable } from '@/components/ui/SkeletonLoader'
import { APIErrorFallback } from '@/components/ui/ErrorBoundary'
import { statusTone } from '@/lib/admin/ui'
import { useApiCall } from '@/lib/api/hooks'
import type { CoachDashboardBooking } from '@/lib/coach/types'

function formatEgp(value: number) {
  return new Intl.NumberFormat('en-EG', {
    style: 'currency',
    currency: 'EGP',
    maximumFractionDigits: 0,
  }).format(value)
}

export default function CoachBookingsPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'>('all')
  const [isLoaded, setIsLoaded] = useState(false)

  const { data: coachBookings, loading, error, refetch } = useApiCall<CoachDashboardBooking[]>('/coach/bookings')

  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => setIsLoaded(true), 50)
      return () => clearTimeout(timer)
    }
  }, [loading])

  const filteredBookings = useMemo(() => {
    const query = search.trim().toLowerCase()

    return (coachBookings ?? []).filter((booking) => {
      const matchesStatus = statusFilter === 'all' || booking.status === statusFilter
      const matchesSearch =
        query.length === 0 ||
        booking.athlete.toLowerCase().includes(query) ||
        booking.sessionType.toLowerCase().includes(query) ||
        booking.location.toLowerCase().includes(query)

      return matchesStatus && matchesSearch
    })
  }, [coachBookings, search, statusFilter])

  if (error) {
    return <APIErrorFallback error={error} onRetry={refetch} />
  }

  return (
    <div className={`space-y-8 transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
      <AdminPageHeader
        title="Bookings"
        subtitle="Track your full booking lifecycle, prioritize high-intent athletes, and keep payouts predictable."
      />

      <section className={`grid grid-cols-1 xl:grid-cols-[1.3fr_0.9fr] gap-6 transition-all duration-500 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
        <AdminPanel eyebrow="Pipeline" title="Session Requests & Confirmations">
          <AdminFilterBar
            searchValue={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search athlete, session type, or venue"
            controls={
              ['all', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].map((status) => {
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

          <div className="mt-6">
            {loading ? (
              <SkeletonTable rows={10} />
            ) : (
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
                        <p className="font-semibold text-primary">{new Date(booking.dateTime).toLocaleString()}</p>
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
            )}
          </div>
        </AdminPanel>

        <AdminPanel eyebrow="Today" title="Operational Notes">
          <div className="space-y-4">
            <article className="rounded-[var(--radius-md)] bg-surface-container-low px-5 py-4 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
              <p className="text-base font-bold text-primary">
                {(coachBookings ?? []).filter((booking) => booking.status === 'PENDING').length} pending confirmations should be reviewed today.
              </p>
            </article>
            <article className="rounded-[var(--radius-md)] bg-surface-container-low px-5 py-4 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
              <p className="text-base font-bold text-primary">Travel buffer is reflected by your current availability windows.</p>
            </article>
            <article className="rounded-[var(--radius-md)] bg-surface-container-low px-5 py-4 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
              <p className="text-base font-bold text-primary">Completed sessions automatically feed the reports page payout totals.</p>
            </article>
          </div>
        </AdminPanel>
      </section>
    </div>
  )
}
