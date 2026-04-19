'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft, CalendarClock, Clock3, MapPin, Repeat2 } from 'lucide-react'
import { FloatingNav } from '@/components/layout/FloatingNav'
import { useApiCall } from '@/lib/api/hooks'
import { stringValue } from '@/lib/api/extract'
import { APIErrorFallback } from '@/components/ui/ErrorBoundary'

const statusMap: Record<string, { label: string; className: string }> = {
  COMPLETED: { label: 'Completed', className: 'bg-tertiary-fixed text-primary' },
  CANCELLED: { label: 'Canceled', className: 'bg-primary/10 text-primary' },
  NO_SHOW: { label: 'No Show', className: 'bg-primary/10 text-primary' },
}

export default function ProfileBookingHistoryPage() {
  const router = useRouter()
  const { data: bookingsData, loading, error, refetch } = useApiCall<any>('/users/me/bookings?status=COMPLETED,CANCELLED,NO_SHOW')

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
      <main className="w-full min-h-screen bg-surface pb-[calc(8.5rem+env(safe-area-inset-bottom))] md:pb-[11rem] flex items-center justify-center">
        <APIErrorFallback error={error} onRetry={refetch} />
      </main>
    )
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
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-surface-container-lowest rounded-[var(--radius-md)] p-3.5 md:p-4 shadow-ambient animate-pulse h-32" />
          ))
        ) : !Array.isArray(bookings) || bookings.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-primary/60 text-lg font-semibold">No booking history yet</p>
            <p className="text-primary/40 text-sm mt-2">Your past bookings will appear here</p>
          </div>
        ) : (
          bookings.map((booking: any) => {
            const statusInfo = statusMap[booking.status] || { label: booking.status, className: 'bg-primary/10 text-primary' }

            return (
              <article
                key={booking.id}
                className="bg-surface-container-lowest rounded-[var(--radius-md)] p-3.5 md:p-4 shadow-ambient h-[min(25svh,11rem)] max-h-[25svh]"
              >
                <div className="h-full flex items-center justify-between gap-3 min-w-0">
                  <div className="flex-1 min-w-0 h-full flex flex-col justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <h3 className="text-sm md:text-base font-bold text-primary truncate">{booking.courtName || booking.facilityName || 'Court'}</h3>
                        <span
                          className={`text-[10px] font-lexend font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${statusInfo.className}`}
                        >
                          {statusInfo.label}
                        </span>
                      </div>
                      <p className="text-xs md:text-sm text-primary/65 truncate">{stringValue(booking.courtDetails || booking.court)}</p>
                    </div>

                    <div className="mt-2 flex flex-wrap gap-2 text-[10px] md:text-xs text-primary/70">
                      {booking.date && (
                        <span className="inline-flex items-center gap-1">
                          <CalendarClock className="w-3.5 h-3.5" />
                          {booking.date}
                        </span>
                      )}
                      {booking.time && (
                        <span className="inline-flex items-center gap-1">
                          <Clock3 className="w-3.5 h-3.5" />
                          {booking.time}
                        </span>
                      )}
                      {booking.courtId && (
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {booking.courtId}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right h-full flex flex-col items-end justify-between shrink-0">
                    <p className="text-base md:text-lg font-black text-primary leading-none">{booking.amount || booking.total || ''}</p>
                    {booking.courtId && (
                      <button
                        onClick={() => router.push(`/book?courtId=${booking.courtId}`)}
                        className="inline-flex items-center gap-1 text-xs md:text-sm font-bold text-primary-container hover:text-primary transition-colors"
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