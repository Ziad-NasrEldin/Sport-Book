'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft, CalendarClock, Clock3, MapPin, Repeat2 } from 'lucide-react'
import { FloatingNav } from '@/components/layout/FloatingNav'

const historySessions = [
  {
    id: 'HS-918',
    venue: 'The Regent Park Courts',
    court: 'Court 1 • Hard',
    date: 'Mon, Apr 07',
    time: '19:00 - 20:00',
    amount: '90 EGP',
    status: 'Completed',
  },
  {
    id: 'HS-901',
    venue: 'Elite Club Arena',
    court: 'Court 3 • Indoor',
    date: 'Fri, Apr 04',
    time: '17:00 - 18:30',
    amount: '140 EGP',
    status: 'Completed',
  },
  {
    id: 'HS-876',
    venue: 'City Sports Hub',
    court: 'Court 7 • Clay',
    date: 'Tue, Apr 01',
    time: '20:00 - 21:00',
    amount: '80 EGP',
    status: 'Canceled',
  },
]

export default function ProfileBookingHistoryPage() {
  const router = useRouter()

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back()
      return
    }

    router.push('/profile/bookings')
  }

  return (
    <main className="w-full min-h-screen bg-surface pb-[calc(8.5rem+env(safe-area-inset-bottom))] md:pb-[11rem]">
      <header className="sticky top-0 z-40 bg-surface/80 backdrop-blur-xl px-5 pt-6 pb-4 md:px-10 lg:px-14 md:pt-8 md:pb-5">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handleBack}
            aria-label="Go back"
            className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-container-high hover:bg-surface-container-low transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-primary stroke-[2.5]" />
          </button>
          <div>
            <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-primary">Booking History</h1>
            <p className="text-sm md:text-base text-primary/60">All previous sessions in one place</p>
          </div>
        </div>
      </header>

      <section className="px-5 md:px-10 lg:px-14 md:max-w-5xl md:mx-auto space-y-3 md:space-y-4">
        {historySessions.map((session) => (
          <article
            key={session.id}
            className="bg-surface-container-lowest rounded-[var(--radius-md)] p-3.5 md:p-4 shadow-ambient h-[min(25svh,11rem)] max-h-[25svh]"
          >
            <div className="h-full flex items-center justify-between gap-3 min-w-0">
              <div className="flex-1 min-w-0 h-full flex flex-col justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <h3 className="text-sm md:text-base font-bold text-primary truncate">{session.venue}</h3>
                    <span
                      className={`text-[10px] font-lexend font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                        session.status === 'Completed' ? 'bg-tertiary-fixed text-primary' : 'bg-primary/10 text-primary'
                      }`}
                    >
                      {session.status}
                    </span>
                  </div>
                  <p className="text-xs md:text-sm text-primary/65 truncate">{session.court}</p>
                </div>

                <div className="mt-2 flex flex-wrap gap-2 text-[10px] md:text-xs text-primary/70">
                  <span className="inline-flex items-center gap-1">
                    <CalendarClock className="w-3.5 h-3.5" />
                    {session.date}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Clock3 className="w-3.5 h-3.5" />
                    {session.time}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {session.id}
                  </span>
                </div>
              </div>

              <div className="text-right h-full flex flex-col items-end justify-between shrink-0">
                <p className="text-base md:text-lg font-black text-primary leading-none">{session.amount}</p>
                <button className="inline-flex items-center gap-1 text-xs md:text-sm font-bold text-primary-container hover:text-primary transition-colors">
                  Rebook <Repeat2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </article>
        ))}
      </section>

      <FloatingNav />
    </main>
  )
}