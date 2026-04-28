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
import { useInView } from '@/lib/useInView'

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
  const cardsReveal = useInView({ once: true })
  const historyReveal = useInView({ once: true })

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
    <section id="my-bookings" className="space-y-5 md:space-y-8">
      <div className="flex items-center justify-between animate-soft-rise">
        <h2 className="font-display text-2xl md:text-4xl uppercase font-bold tracking-tight text-primary">My Bookings</h2>
        <Link
          href="/profile/bookings-history"
          className="inline-flex items-center gap-1.5 text-[10px] md:text-xs font-sans font-bold uppercase tracking-widest text-secondary-container hover:text-secondary transition-colors group"
        >
          History <History className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 md:gap-5">
        {[
          { label: 'Upcoming', icon: CalendarClock, value: upcoming.length, suffix: '' },
          { label: 'Played', icon: CheckCircle2, value: completedCount, suffix: '' },
          { label: 'This Month', icon: Wallet, value: monthlySpend, suffix: 'EGP spend' },
        ].map((stat, i) => (
          <article
            key={stat.label}
            className="bg-surface-container-lowest rounded-[2rem] p-4 md:p-6 shadow-[0_4px_20px_-8px_rgba(0,17,58,0.08)] card-lift animate-stagger-pop"
            style={{ animationDelay: `${i * 100 + 150}ms` }}
          >
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <span className="text-[9px] md:text-[10px] font-sans font-bold uppercase tracking-[0.15em] md:tracking-[0.18em] text-primary/50">
                {stat.label}
              </span>
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-[1rem] bg-primary/5 flex items-center justify-center">
                <stat.icon className="w-5 h-5 md:w-6 md:h-6 text-tertiary-fixed" />
              </div>
            </div>
            {loading ? (
              <div className="h-8 md:h-10 bg-surface-container-low rounded-[1rem] animate-pulse" />
            ) : (
              <div className={loading ? '' : 'animate-number-pop'} style={!loading ? { animationDelay: `${i * 100 + 300}ms` } : undefined}>
                <p className="font-display text-2xl md:text-4xl font-bold text-primary tracking-tight leading-none">{stat.value}</p>
                {stat.suffix && <p className="text-[10px] md:text-xs text-primary/55 font-sans mt-1 leading-none uppercase tracking-wider">{stat.suffix}</p>}
              </div>
            )}
          </article>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4" ref={cardsReveal.ref}>
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="bg-surface-container-lowest rounded-[2.5rem] p-4 md:p-6 animate-pulse h-32 shadow-[0_8px_40px_-12px_rgba(0,17,58,0.12)]" />
          ))}
        </div>
      ) : upcoming.length === 0 ? (
        <div className="bg-surface-container-lowest rounded-[2.5rem] p-8 md:p-10 shadow-[0_8px_40px_-12px_rgba(0,17,58,0.12)] text-center animate-fade-in">
          <div className="inline-block mb-5 animate-empty-bob">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-[1.5rem] bg-primary/5 flex items-center justify-center mx-auto">
              <CalendarClock className="w-8 h-8 md:w-10 md:h-10 text-tertiary-fixed" />
            </div>
          </div>
          <p className="font-display text-2xl uppercase font-bold text-primary tracking-tight">No upcoming bookings</p>
          <p className="text-sm text-primary/60 mt-1.5 font-sans font-medium">Your confirmed and pending bookings will appear here</p>
        </div>
      ) : (
        <div className="space-y-4" ref={cardsReveal.ref}>
          {upcoming.map((session, i) => {
            const sessionVenue = session.venue || session.courtName || session.coachName || 'Court Booking'
            const sessionCourt = session.court || session.courtName || ''
            const sessionDate = session.date || ''
            const sessionTime = session.time || (session.startTime && session.endTime ? `${session.startTime} - ${session.endTime}` : '')
            const sessionAmount = session.amount || (session.totalPrice ? `${session.totalPrice} EGP` : '')
            const sessionImage = session.image || 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&w=900&q=80'

            return (
              <article
                key={session.id}
                className="bg-surface-container-lowest rounded-[2.5rem] p-4 md:p-6 shadow-[0_8px_40px_-12px_rgba(0,17,58,0.12)]"
                style={{
                  animation: cardsReveal.inView ? `card-stagger 0.45s cubic-bezier(0.22, 1, 0.36, 1) both` : 'none',
                  animationDelay: cardsReveal.inView ? `${i * 80}ms` : '0ms',
                }}
              >
                <div className="flex items-center gap-3 md:gap-5 h-full min-w-0">
                  <div className="relative h-24 w-20 sm:w-28 md:w-36 rounded-[1.5rem] overflow-hidden shrink-0">
                    <Image src={sessionImage} alt={sessionVenue} fill className="object-cover" />
                    <div className="absolute inset-x-0 bottom-0 p-2 md:p-3 bg-gradient-to-t from-primary/75 to-transparent">
                      <span className="text-[9px] md:text-[10px] font-sans font-bold uppercase tracking-widest text-white">{session.id}</span>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0 h-full flex flex-col justify-between py-1">
                    <div className="min-w-0">
                      <h3 className="font-display text-lg md:text-xl uppercase font-bold text-primary tracking-tight truncate">{sessionVenue}</h3>
                      {sessionCourt && <p className="text-xs md:text-sm text-primary/65 mt-0.5 truncate font-sans">{sessionCourt}</p>}
                    </div>

                    <div className="flex flex-wrap gap-2 mt-2 md:mt-3">
                      {sessionDate && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 md:px-3 py-1 rounded-full bg-surface-container-low text-[10px] md:text-xs font-sans font-bold uppercase tracking-wide text-primary/75">
                          <CalendarClock className="w-3 h-3 md:w-3.5 md:h-3.5" />
                          {sessionDate}
                        </span>
                      )}
                      {sessionTime && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 md:px-3 py-1 rounded-full bg-surface-container-low text-[10px] md:text-xs font-sans font-bold uppercase tracking-wide text-primary/75">
                          <Clock3 className="w-3 h-3 md:w-3.5 md:h-3.5" />
                          {sessionTime}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right h-full flex flex-col items-end justify-between py-1 shrink-0">
                    {sessionAmount && (
                      <div>
                        <p className="text-[9px] md:text-[10px] font-sans uppercase tracking-widest text-primary/45 mb-0.5">Amount</p>
                        <p className="font-display text-lg md:text-xl font-bold text-primary tracking-tight">{sessionAmount}</p>
                      </div>
                    )}

                    <button className="px-5 py-2 mt-auto bg-tertiary-fixed text-primary font-sans font-bold uppercase tracking-widest text-[10px] md:text-[11px] rounded-[2rem] shadow-[0_3px_0_0_#00113a] hover:shadow-[0_1px_0_0_#00113a] hover:translate-y-[2px] transition-all active:shadow-none active:translate-y-[3px]">
                      Details
                    </button>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}

      <div ref={historyReveal.ref}>
        <Link
          href="/profile/bookings-history"
          className="flex items-center justify-between px-6 py-6 bg-surface-container-lowest rounded-[2rem] shadow-[0_4px_20px_-8px_rgba(0,17,58,0.08)] group hover:bg-primary transition-all duration-200 card-lift"
          style={{
            animation: historyReveal.inView ? 'slide-in-right 0.35s cubic-bezier(0.22, 1, 0.36, 1) both' : 'none',
            animationDelay: '200ms',
          }}
        >
          <div>
            <p className="text-[10px] md:text-[11px] font-sans font-bold uppercase tracking-[0.18em] text-primary/50 group-hover:text-white/60 transition-colors">Booking History</p>
            <h3 className="font-display text-xl md:text-2xl uppercase font-bold text-primary tracking-tight mt-1 group-hover:text-white transition-colors">Open full history page</h3>
          </div>
          <div className="w-12 h-12 rounded-[1rem] bg-primary/5 flex items-center justify-center group-hover:bg-white/10 transition-colors shrink-0">
            <ArrowUpRight className="w-6 h-6 text-tertiary-fixed transition-transform duration-200 group-hover:translate-x-1 group-hover:-translate-y-1" />
          </div>
        </Link>
      </div>
    </section>
  )
}
