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

const upcomingSessions = [
  {
    id: 'UP-001',
    venue: 'Downtown Tennis Club',
    court: 'Court 4 • Clay',
    date: 'Thu, Apr 16',
    time: '18:00 - 20:00',
    amount: '120 EGP',
    image:
      'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'UP-002',
    venue: 'Prime Padel House',
    court: 'Court 2 • Panorama',
    date: 'Sat, Apr 18',
    time: '10:00 - 11:30',
    amount: '150 EGP',
    image:
      'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=900&q=80',
  },
]

const historySessions = [
  {
    id: 'HS-918',
    status: 'Completed',
  },
  {
    id: 'HS-901',
    status: 'Completed',
  },
  {
    id: 'HS-876',
    status: 'Canceled',
  },
]

export function ProfileBookingsSection() {
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
          <p className="text-xl md:text-4xl font-black tracking-tight text-primary leading-none">{upcomingSessions.length}</p>
        </article>

        <article className="bg-surface-container-lowest rounded-[var(--radius-md)] p-3 md:p-5 shadow-ambient h-[min(17svh,5.75rem)] md:h-auto max-h-[25svh]">
          <div className="flex items-center justify-between mb-2 md:mb-6">
            <span className="text-[9px] md:text-[10px] font-lexend font-bold uppercase tracking-[0.15em] md:tracking-[0.18em] text-primary/50">
              Played
            </span>
            <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-primary-container" />
          </div>
          <p className="text-xl md:text-4xl font-black tracking-tight text-primary leading-none">
            {historySessions.filter((session) => session.status === 'Completed').length}
          </p>
        </article>

        <article className="bg-surface-container-lowest rounded-[var(--radius-md)] p-3 md:p-5 shadow-ambient h-[min(17svh,5.75rem)] md:h-auto max-h-[25svh]">
          <div className="flex items-center justify-between mb-2 md:mb-6">
            <span className="text-[9px] md:text-[10px] font-lexend font-bold uppercase tracking-[0.15em] md:tracking-[0.18em] text-primary/50">
              This Month
            </span>
            <Wallet className="w-4 h-4 md:w-5 md:h-5 text-primary-container" />
          </div>
          <p className="text-xl md:text-4xl font-black tracking-tight text-primary leading-none">580</p>
          <p className="text-[10px] md:text-xs text-primary/55 font-lexend mt-1 leading-none">EGP spend</p>
        </article>
      </div>

      <div className="space-y-3">
        {upcomingSessions.map((session) => (
          <article
            key={session.id}
            className="bg-surface-container-lowest rounded-[var(--radius-md)] p-2.5 md:p-4 shadow-ambient h-[min(19svh,8.25rem)] max-h-[25svh]"
          >
            <div className="flex items-center gap-2.5 md:gap-4 h-full min-w-0">
              <div className="relative h-full w-16 sm:w-24 md:w-36 rounded-[var(--radius-default)] overflow-hidden shrink-0">
                <Image src={session.image} alt={session.venue} fill className="object-cover" />
                <div className="absolute inset-x-0 bottom-0 p-1.5 md:p-2 bg-gradient-to-t from-primary/75 to-transparent">
                  <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-white">{session.id}</span>
                </div>
              </div>

              <div className="flex-1 min-w-0 h-full flex flex-col justify-between">
                <div className="min-w-0">
                  <h3 className="text-sm md:text-lg font-bold text-primary leading-tight truncate">{session.venue}</h3>
                  <p className="text-[11px] md:text-sm text-primary/65 mt-0.5 truncate">{session.court}</p>
                </div>

                <div className="flex flex-wrap gap-1.5 mt-1.5 md:mt-2">
                  <span className="inline-flex items-center gap-1 px-1.5 md:px-2 py-1 rounded-full bg-surface-container-low text-[9px] md:text-xs font-lexend font-bold uppercase tracking-wide text-primary/75">
                    <CalendarClock className="w-3 h-3 md:w-3.5 md:h-3.5" />
                    {session.date}
                  </span>
                  <span className="inline-flex items-center gap-1 px-1.5 md:px-2 py-1 rounded-full bg-surface-container-low text-[9px] md:text-xs font-lexend font-bold uppercase tracking-wide text-primary/75">
                    <Clock3 className="w-3 h-3 md:w-3.5 md:h-3.5" />
                    {session.time}
                  </span>
                </div>
              </div>

              <div className="text-right h-full flex flex-col items-end justify-between shrink-0">
                <div>
                  <p className="text-[9px] md:text-[10px] font-lexend uppercase tracking-widest text-primary/45 mb-0.5">Amount</p>
                  <p className="text-sm md:text-xl font-black text-primary leading-none">{session.amount}</p>
                </div>

                <button className="inline-flex items-center gap-1 text-[11px] md:text-sm font-bold text-secondary-container hover:text-secondary transition-colors">
                  Details <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

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