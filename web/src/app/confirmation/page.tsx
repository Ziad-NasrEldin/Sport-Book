'use client'

import { Suspense, useCallback } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Check, MapPin, Calendar, QrCode, CalendarPlus, Share2 } from 'lucide-react'
import { useApiCall } from '@/lib/api/hooks'
import { APIErrorFallback } from '@/components/ui/ErrorBoundary'
import type { BookingResponse } from '@/lib/court/types'
import { formatHour } from '@/lib/court/types'
import { FloatingNav } from '@/components/layout/FloatingNav'

function generateICS(booking: BookingResponse) {
  const date = booking.date.replace(/-/g, '')
  const startHourStr = String(booking.startHour).padStart(2, '0')
  const endHourStr = String(booking.endHour).padStart(2, '0')
  const location = [booking.court?.name, booking.court?.branch?.name, booking.court?.branch?.facility?.name].filter(Boolean).join(' - ')

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//SportBook//EN',
    'BEGIN:VEVENT',
    `DTSTART:${date}T${startHourStr}0000`,
    `DTEND:${date}T${endHourStr}0000`,
    `SUMMARY:Court Booking - ${booking.court?.name ?? 'Tennis Court'}`,
    `LOCATION:${location}`,
    `DESCRIPTION:Court booking for ${booking.date} from ${formatHour(booking.startHour)} to ${formatHour(booking.endHour)}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')

  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', `booking-${booking.id}.ics`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

function handleShare(booking: BookingResponse) {
  const location = [booking.court?.name, booking.court?.branch?.name, booking.court?.branch?.facility?.name].filter(Boolean).join(' - ')
  const shareData = {
    title: 'Court Booking Confirmation',
    text: `I booked ${booking.court?.name ?? 'a court'} at ${location} on ${new Date(booking.date).toLocaleDateString()}, ${formatHour(booking.startHour)} - ${formatHour(booking.endHour)}. Book yours at SportBook!`,
  }

  if (navigator.share) {
    navigator.share(shareData).catch(() => {})
  } else {
    navigator.clipboard.writeText(shareData.text).catch(() => {})
  }
}

function ConfirmationPageContent() {
  const searchParams = useSearchParams()
  const bookingId = searchParams.get('bookingId') ?? ''
  const paymentMethod = searchParams.get('payment') ?? ''

  const { data: booking, error, refetch } = useApiCall<BookingResponse>(
    bookingId ? `/bookings/${bookingId}` : '',
    { immediate: !!bookingId },
  )

  const paymentLabel = paymentMethod === 'wallet'
    ? 'Wallet Balance'
    : paymentMethod === 'card'
      ? 'Credit / Debit Card'
      : 'Pay At Venue'

  const handleAddToCalendar = useCallback(() => {
    if (booking) generateICS(booking)
  }, [booking])

  const handleShareClick = useCallback(() => {
    if (booking) handleShare(booking)
  }, [booking])

  if (!bookingId) {
    return (
      <main className="w-full bg-surface min-h-screen flex items-center justify-center px-5">
        <div className="text-center">
          <p className="text-lg font-bold text-primary">No booking found</p>
          <Link href="/" className="mt-4 inline-block px-6 py-3 rounded-full bg-primary-container text-surface-container-lowest font-bold">
            Go to Home
          </Link>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="w-full bg-surface min-h-screen flex items-center justify-center px-5">
        <APIErrorFallback error={error} onRetry={refetch} />
      </main>
    )
  }

  if (!booking) {
    return (
      <main className="w-full bg-surface min-h-screen flex items-center justify-center px-5">
        <p className="text-lg font-bold text-primary">Loading confirmation...</p>
      </main>
    )
  }

  const location = [booking.court?.branch?.name, booking.court?.branch?.facility?.name].filter(Boolean).join(' - ')
  const isPaid = booking.paymentStatus === 'COMPLETED' || paymentMethod === 'card' || paymentMethod === 'wallet'

  return (
    <main className="w-full bg-surface min-h-screen relative pb-[calc(8.5rem+env(safe-area-inset-bottom))] md:pb-[11rem] font-sans">
      <header className="flex justify-between items-center w-full px-5 py-4 sticky top-0 z-50 bg-surface/80 backdrop-blur-xl md:px-10 lg:px-14">
        <div className="flex items-center justify-between w-full">
          <Link
            href="/"
            className="w-10 h-10 flex items-center justify-center rounded-full bg-transparent hover:bg-black/5 transition-colors active:scale-95 duration-200 shrink-0"
            aria-label="Go to home"
          >
            <span className="text-primary font-extrabold text-lg">✕</span>
          </Link>
          <h1 className="text-primary font-extrabold tracking-tight text-xl mx-auto flex-1 text-center">
            Court Booking
          </h1>
        </div>
      </header>

      <div className="px-5 md:max-w-xl md:mx-auto md:px-0 flex flex-col items-center mt-6">
        <div className="w-24 h-24 rounded-full bg-secondary-container/20 flex items-center justify-center mb-6 shadow-ambient">
          <div className="w-14 h-14 rounded-full bg-[#8c4a00] flex items-center justify-center">
            <Check className="w-6 h-6 text-white stroke-[3.5]" />
          </div>
        </div>

        <h2 className="text-3xl font-extrabold text-primary tracking-tight mb-2">Your court is ready!</h2>
        <p className="text-primary/70 text-center mb-10 text-[15px] font-medium px-4 leading-relaxed">
          Get your rackets ready for a great match at the club.
        </p>

        <div className="w-full bg-surface-container-lowest rounded-[2rem] shadow-ambient overflow-hidden flex flex-col font-sans relative">
          <div className="p-7 relative z-10">
            <div className="flex justify-between items-start mb-2">
              <span className="text-[10px] font-lexend font-bold uppercase tracking-widest text-primary/50">
                Booking Reference
              </span>
              <span className={`text-[10px] font-lexend font-extrabold px-3 py-1 rounded-full tracking-widest shadow-sm ${isPaid ? 'bg-tertiary-fixed text-[#0a1631]' : 'bg-surface-container-high text-primary/70'}`}>
                {isPaid ? 'PAID' : 'PENDING'}
              </span>
            </div>
            <h3 className="text-[22px] font-extrabold tracking-wide text-primary mb-10 font-lexend">
              #{booking.id.slice(-8).toUpperCase()}
            </h3>

            <div className="flex flex-col gap-6">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-full bg-surface text-primary flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 fill-primary/10" strokeWidth={2.5} />
                </div>
                <div className="pt-0.5">
                  <span className="text-[10px] font-lexend font-bold uppercase tracking-widest text-primary/50 block mb-1">Location</span>
                  <span className="font-bold text-primary block leading-tight text-base mb-1">{booking.court?.name ?? 'Court'}</span>
                  <span className="text-[13px] text-primary/60 font-medium">{location || 'SportBook Club'}</span>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-full bg-surface text-primary flex items-center justify-center shrink-0">
                  <Calendar className="w-5 h-5 fill-primary/10" strokeWidth={2.5} />
                </div>
                <div className="pt-0.5">
                  <span className="text-[10px] font-lexend font-bold uppercase tracking-widest text-primary/50 block mb-1">Date & Time</span>
                  <span className="font-bold text-primary block leading-tight text-base mb-1">{new Date(booking.date).toLocaleDateString()}</span>
                  <span className="text-[13px] text-primary/60 font-medium">{formatHour(booking.startHour)} - {formatHour(booking.endHour)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#17244a] p-7 pt-8 relative overflow-hidden flex flex-col items-center">
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
              <div className="absolute top-[48%] left-0 right-0 h-[1.5px] bg-white" />
              <div className="absolute left-[48%] top-0 bottom-0 w-[1.5px] bg-white" />
            </div>

            <div className="relative z-10 w-full flex flex-col items-center">
              <h4 className="text-[9px] text-center font-lexend font-bold uppercase tracking-[0.2em] text-white/80 mb-7">
                Scan at the venue gate for entry
              </h4>

              <div className="bg-white rounded-[1.5rem] p-6 w-[200px] h-[200px] flex items-center justify-center mb-8 shadow-xl">
                <QrCode className="w-full h-full text-[#0f1935] stroke-[1.5]" />
              </div>

              <div className="grid grid-cols-2 gap-3 w-full">
                <button
                  type="button"
                  onClick={handleAddToCalendar}
                  className="bg-white/10 hover:bg-white/20 transition-colors rounded-[1rem] py-3.5 px-2 flex items-center justify-center gap-2 border border-white/5 active:scale-95"
                >
                  <CalendarPlus className="w-[18px] h-[18px] text-white stroke-[2]" />
                  <span className="text-white text-[13px] font-bold tracking-tight">Add to Calendar</span>
                </button>
                <button
                  type="button"
                  onClick={handleShareClick}
                  className="bg-white/10 hover:bg-white/20 transition-colors rounded-[1rem] py-3.5 px-2 flex items-center justify-center gap-2 border border-white/5 active:scale-95"
                >
                  <Share2 className="w-[18px] h-[18px] text-white stroke-[2]" />
                  <span className="text-white text-[13px] font-bold tracking-tight">Share with Friends</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full relative z-20 mt-6 mb-12">
          <Link href="/" className="w-full block">
            <button className="w-full bg-[#d67200] hover:bg-[#c26700] text-white font-extrabold tracking-wide py-[18px] rounded-full shadow-[0_12px_24px_-8px_rgba(214,114,0,0.5)] active:scale-[0.98] transition-transform text-lg">
              Go to Home
            </button>
          </Link>
          <Link href="/profile/bookings" className="w-full block mt-3">
            <button className="w-full bg-surface-container-high hover:bg-surface-container-low text-primary font-bold tracking-wide py-4 rounded-full active:scale-[0.98] transition-transform text-base">
              View My Bookings
            </button>
          </Link>
        </div>
      </div>

      <FloatingNav />
    </main>
  )
}

export default function ConfirmationPage() {
  return (
    <Suspense
      fallback={
        <main className="w-full min-h-screen bg-surface px-5 py-12">
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-lg font-bold text-primary">Loading confirmation...</p>
          </div>
        </main>
      }
    >
      <ConfirmationPageContent />
    </Suspense>
  )
}