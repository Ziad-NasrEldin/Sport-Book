'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft, CalendarClock, Clock3, MapPin, Repeat2 } from 'lucide-react'
import { FloatingNav } from '@/components/layout/FloatingNav'
import { useApiCall } from '@/lib/api/hooks'
import { stringValue } from '@/lib/api/extract'
import { APIErrorFallback } from '@/components/ui/ErrorBoundary'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { useInView } from '@/lib/useInView'

const statusMap: Record<string, { label: string; className: string }> = {
  COMPLETED: { label: 'Completed', className: 'bg-tertiary-fixed text-primary' },
  CANCELLED: { label: 'Canceled', className: 'bg-primary/10 text-primary' },
  NO_SHOW: { label: 'No Show', className: 'bg-primary/10 text-primary' },
}

export default function ProfileBookingHistoryPage() {
  return (
    <AuthGuard>
      <ProfileBookingHistoryPageContent />
    </AuthGuard>
  )
}

function ProfileBookingHistoryPageContent() {
  const router = useRouter()
  const { data: bookingsData, loading, error, refetch } = useApiCall<any>('/users/me/bookings?status=COMPLETED,CANCELLED,NO_SHOW')
  const cardsReveal = useInView({ once: true })

  const bookings = Array.isArray(bookingsData) ? bookingsData : (Array.isArray(bookingsData?.data) ? bookingsData.data : [])

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back()
      return
    }
    router.push('/profile/bookings')
  }

  if (error) {
    return (
      <main className="w-full min-h-screen bg-surface-container-low pb-32 font-sans flex items-center justify-center">
        <APIErrorFallback error={error as any} onRetry={refetch} />
      </main>
    )
  }

  return (
    <main className="w-full min-h-screen bg-surface-container-low pb-32 font-sans">
      {/* HERO */}
      <section className="relative w-full h-[35vh] md:h-[42vh] flex flex-col justify-end overflow-hidden rounded-b-[3rem] md:rounded-b-[4rem]">
        <div className="absolute inset-0 bg-primary" />
        <div 
          className="absolute inset-0 opacity-[0.08] mix-blend-overlay pointer-events-none" 
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")` }} 
        />

        <div className="relative z-10 w-full max-w-5xl mx-auto px-4 md:px-8 pb-8 md:pb-12">
          <div className="flex items-end gap-4 md:gap-5">
            <button
              type="button"
              onClick={handleBack}
              aria-label="Go back"
              className="w-12 h-12 rounded-[1rem] bg-tertiary-fixed text-primary flex items-center justify-center flex-shrink-0 hover:bg-white transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="text-white">
              <h1 className="font-display text-4xl md:text-6xl uppercase font-bold tracking-tighter leading-[0.85]">Booking History</h1>
              <p className="text-sm md:text-base font-sans font-medium text-white/70 mt-2">All previous sessions in one place</p>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 px-4 md:px-8 pt-10 md:pt-16 md:max-w-5xl md:mx-auto flex flex-col gap-4 md:gap-5" ref={cardsReveal.ref}>
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-surface-container-lowest rounded-[2.5rem] p-6 md:p-8 animate-pulse h-40 shadow-[0_8px_40px_-12px_rgba(0,17,58,0.12)]" />
          ))
        ) : !Array.isArray(bookings) || bookings.length === 0 ? (
          <div className="text-center py-20 animate-fade-in">
            <div className="inline-block mb-4 animate-empty-bob">
              <div className="w-16 h-16 rounded-[1rem] bg-primary/5 flex items-center justify-center mx-auto">
                <CalendarClock className="w-8 h-8 text-primary/20" />
              </div>
            </div>
            <p className="font-display text-2xl uppercase font-bold text-primary">No booking history yet</p>
            <p className="text-primary/50 text-sm mt-2 font-sans">Your past bookings will appear here</p>
          </div>
        ) : (
          bookings.map((booking: any, i: number) => {
            const statusInfo = statusMap[booking.status] || { label: booking.status, className: 'bg-primary/10 text-primary' }

            return (
              <article
                key={booking.id}
                className="bg-surface-container-lowest rounded-[2.5rem] p-6 md:p-8 shadow-[0_8px_40px_-12px_rgba(0,17,58,0.12)]"
                style={{
                  animation: cardsReveal.inView ? `card-stagger 0.45s cubic-bezier(0.22, 1, 0.36, 1) both` : 'none',
                  animationDelay: cardsReveal.inView ? `${i * 80}ms` : '0ms',
                }}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 min-w-0">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h3 className="font-display text-xl md:text-2xl uppercase font-bold text-primary tracking-tight truncate">{booking.courtName || booking.facilityName || 'Court'}</h3>
                      <span
                        className={`text-[10px] font-sans font-bold uppercase tracking-wider px-3 py-1.5 rounded-full animate-badge-pop ${statusInfo.className}`}
                        style={{ animationDelay: `${i * 80 + 200}ms` }}
                      >
                        {statusInfo.label}
                      </span>
                    </div>
                    <p className="text-sm text-primary/65 font-sans truncate">{stringValue(booking.courtDetails || booking.court)}</p>

                    <div className="mt-3 flex flex-wrap gap-3 text-xs font-sans text-primary/70">
                      {booking.date && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container-low">
                          <CalendarClock className="w-3.5 h-3.5" />
                          {booking.date}
                        </span>
                      )}
                      {booking.time && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container-low">
                          <Clock3 className="w-3.5 h-3.5" />
                          {booking.time}
                        </span>
                      )}
                      {booking.courtId && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container-low">
                          <MapPin className="w-3.5 h-3.5" />
                          {booking.courtId}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <p className="font-display text-2xl md:text-3xl font-bold text-primary tracking-tight">{booking.amount || booking.total || ''}</p>
                    {booking.courtId && (
                      <button
                        onClick={() => router.push(`/book?courtId=${booking.courtId}`)}
                        className="inline-flex items-center gap-1 px-5 py-2.5 rounded-[2rem] bg-tertiary-fixed text-primary font-sans font-bold text-xs uppercase tracking-widest shadow-[0_4px_0_0_#00113a] hover:shadow-[0_2px_0_0_#00113a] hover:translate-y-[2px] transition-all active:shadow-none active:translate-y-[4px]"
                      >
                        Rebook <Repeat2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </article>
            )
          })
        )}
      </section>

      <FloatingNav />
    </main>
  )
}
