'use client'

import Image from 'next/image'
import Link from 'next/link'
import {
  CalendarClock,
  Clock3,
  Wallet,
  CheckCircle2,
  ArrowUpRight,
  History,
} from 'lucide-react'
import { useApiCall } from '@/lib/api/hooks'
import { APIErrorFallback } from '@/components/ui/ErrorBoundary'

interface Booking {
  id: string
  venue?: string
  court?: string
  coach?: string
  date?: string
  time?: string
  amount?: number | string
  image?: string
  status?: string
  courtName?: string
  coachName?: string
  startTime?: string
  endTime?: string
  totalPrice?: number
}

interface BookingsResponse {
  data?: Booking[]
  bookings?: Booking[]
  upcoming?: Booking[]
  history?: Booking[]
  completedCount?: number
  monthlySpend?: number
}

export function ProfileBookingsSection() {
  const { data: response, loading, error, refetch } = useApiCall<BookingsResponse>('/users/me/bookings?status=CONFIRMED,PENDING')

  const bookingsData = (() => {
      if (Array.isArray(response)) return response
      if (Array.isArray(response?.data)) return response.data
      if (Array.isArray(response?.bookings)) return response.bookings
      if (Array.isArray(response?.upcoming)) return response.upcoming
      return []
    })()
    const upcoming: Booking[] = bookingsData
  const completedCount = response?.completedCount ?? 0
  const monthlySpend = response?.monthlySpend ?? 0

  if (error) {
    return (
      <section id="my-bookings" className="space-y-4 md:space-y-5">
        <APIErrorFallback error={error as any} onRetry={refetch} />
      </section>
    )
  }

  return (
    <section id="my-bookings" className="space-y-4 md:space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl md:text-3xl font-extrabold tracking-tight text-primary">My Bookings</h2>
        <Link
          href="/profile/bookings-history"
          className="inline-flex items-center gap-1.5 text-[11px] md:text-xs font-lexend font-bold uppercase tracking-widest text-secondary-container hover:text-secondary transition-colors"
        >
          History <History className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-2.5 md:gap-5">
        <article className="bg-surface-container-lowest rounded-[var(--radius-md)] p-3 md:p-5 shadow-ambient h-[min(17svh,5.75rem)] md:h-auto max-h-[25svh]">
          <div className="flex items-center justify-between mb-2 md:mb-6">
            <span className="text-[9px] md:text-[10px] font-lexend font-bold uppercase tracking-[0.15em] md:tracking-[0.18em] text-primary/50">
              Upcoming
            </span>
            <CalendarClock className="w-4 h-4 md:w-5 md:h-5 text-primary-container" />
          </div>
          {loading ? (
            <div className="h-8 md:h-10 bg-surface-container-low rounded animate-pulse" />
          ) : (
            <p className="text-xl md:text-4xl font-black tracking-tight text-primary leading-none">{upcoming.length}</p>
          )}
        </article>

        <article className="bg-surface-container-lowest rounded-[var(--radius-md)] p-3 md:p-5 shadow-ambient h-[min(17svh,5.75rem)] md:h-auto max-h-[25svh]">
          <div className="flex items-center justify-between mb-2 md:mb-6">
            <span className="text-[9px] md:text-[10px] font-lexend font-bold uppercase tracking-[0.15em] md:tracking-[0.18em] text-primary/50">
              Played
            </span>
            <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-primary-container" />
          </div>
          {loading ? (
            <div className="h-8 md:h-10 bg-surface-container-low rounded animate-pulse" />
          ) : (
            <p className="text-xl md:text-4xl font-black tracking-tight text-primary leading-none">{completedCount}</p>
          )}
        </article>

        <article className="bg-surface-container-lowest rounded-[var(--radius-md)] p-3 md:p-5 shadow-ambient h-[min(17svh,5.75rem)] md:h-auto max-h-[25svh]">
          <div className="flex items-center justify-between mb-2 md:mb-6">
            <span className="text-[9px] md:text-[10px] font-lexend font-bold uppercase tracking-[0.15em] md:tracking-[0.18em] text-primary/50">
              This Month
            </span>
            <Wallet className="w-4 h-4 md:w-5 md:h-5 text-primary-container" />
          </div>
          {loading ? (
            <div className="h-8 md:h-10 bg-surface-container-low rounded animate-pulse" />
          ) : (
            <>
              <p className="text-xl md:text-4xl font-black tracking-tight text-primary leading-none">{monthlySpend}</p>
              <p className="text-[10px] md:text-xs text-primary/55 font-lexend mt-1 leading-none">EGP spend</p>
            </>
          )}
        </article>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="bg-surface-container-lowest rounded-[var(--radius-md)] p-2.5 md:p-4 shadow-ambient h-[min(19svh,8.25rem)] max-h-[25svh] animate-pulse" />
          ))}
        </div>
      ) : upcoming.length === 0 ? (
        <div className="bg-surface-container-lowest rounded-[var(--radius-md)] p-6 md:p-8 shadow-ambient text-center">
          <p className="text-base font-bold text-primary">No upcoming bookings</p>
          <p className="text-sm text-primary/60 mt-1">Your confirmed and pending bookings will appear here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {upcoming.map((session) => {
            const sessionVenue = session.venue || session.courtName || session.coachName || 'Court Booking'
            const sessionCourt = session.court || session.courtName || ''
            const sessionDate = session.date || ''
            const sessionTime = session.time || (session.startTime && session.endTime ? `${session.startTime} - ${session.endTime}` : '')
            const sessionAmount = session.amount || (session.totalPrice ? `${session.totalPrice} EGP` : '')
            const sessionImage = session.image || 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&w=900&q=80'

            return (
              <article
                key={session.id}
                className="bg-surface-container-lowest rounded-[var(--radius-md)] p-2.5 md:p-4 shadow-ambient h-[min(19svh,8.25rem)] max-h-[25svh]"
              >
                <div className="flex items-center gap-2.5 md:gap-4 h-full min-w-0">
                  <div className="relative h-full w-16 sm:w-24 md:w-36 rounded-[var(--radius-default)] overflow-hidden shrink-0">
                    <Image src={sessionImage} alt={sessionVenue} fill className="object-cover" />
                    <div className="absolute inset-x-0 bottom-0 p-1.5 md:p-2 bg-gradient-to-t from-primary/75 to-transparent">
                      <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-white">{session.id}</span>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0 h-full flex flex-col justify-between">
                    <div className="min-w-0">
                      <h3 className="text-sm md:text-lg font-bold text-primary leading-tight truncate">{sessionVenue}</h3>
                      {sessionCourt && <p className="text-[11px] md:text-sm text-primary/65 mt-0.5 truncate">{sessionCourt}</p>}
                    </div>

                    <div className="flex flex-wrap gap-1.5 mt-1.5 md:mt-2">
                      {sessionDate && (
                        <span className="inline-flex items-center gap-1 px-1.5 md:px-2 py-1 rounded-full bg-surface-container-low text-[9px] md:text-xs font-lexend font-bold uppercase tracking-wide text-primary/75">
                          <CalendarClock className="w-3 h-3 md:w-3.5 md:h-3.5" />
                          {sessionDate}
                        </span>
                      )}
                      {sessionTime && (
                        <span className="inline-flex items-center gap-1 px-1.5 md:px-2 py-1 rounded-full bg-surface-container-low text-[9px] md:text-xs font-lexend font-bold uppercase tracking-wide text-primary/75">
                          <Clock3 className="w-3 h-3 md:w-3.5 md:h-3.5" />
                          {sessionTime}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right h-full flex flex-col items-end justify-between shrink-0">
                    {sessionAmount && (
                      <div>
                        <p className="text-[9px] md:text-[10px] font-lexend uppercase tracking-widest text-primary/45 mb-0.5">Amount</p>
                        <p className="text-sm md:text-xl font-black text-primary leading-none">{sessionAmount}</p>
                      </div>
                    )}

                    <button className="inline-flex items-center gap-1 text-[11px] md:text-sm font-bold text-secondary-container hover:text-secondary transition-colors">
                      Details <ArrowUpRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}

      <Link
        href="/profile/bookings-history"
        className="w-full bg-surface-container-lowest rounded-[var(--radius-md)] p-4 md:p-5 shadow-ambient inline-flex items-center justify-between hover:bg-surface-container-high transition-colors"
      >
        <div>
          <p className="text-[10px] md:text-xs font-lexend font-bold uppercase tracking-[0.18em] text-primary/50">Booking History</p>
          <p className="text-base md:text-lg font-bold text-primary mt-1">Open full history page</p>
        </div>
        <ArrowUpRight className="w-5 h-5 text-secondary-container" />
      </Link>
    </section>
  )
}