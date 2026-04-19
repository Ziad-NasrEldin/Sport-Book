'use client'

import { Suspense } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Check, CalendarDays, Clock3, MapPin, UserRound, CreditCard } from 'lucide-react'
import { useApiCall } from '@/lib/api/hooks'
import { APIErrorFallback } from '@/components/ui/ErrorBoundary'

type BookingResponse = {
  id: string
  date: string
  startHour: number
  endHour: number
  duration: number
  playerCount: number
  paymentMethod: string | null
  totalPrice: number
  coach: {
    user: {
      name: string
      avatar: string | null
    }
    sport: {
      displayName: string
    }
  } | null
}

function CoachConfirmationPageContent() {
  const searchParams = useSearchParams()
  const bookingId = searchParams.get('bookingId') ?? ''

  const { data: booking, error, refetch } = useApiCall<BookingResponse>(`/bookings/${bookingId}`)

  if (error) {
    return <APIErrorFallback error={error} onRetry={refetch} />
  }

  if (!booking) return null

  const paymentLabel = booking.paymentMethod === 'WALLET'
    ? 'Wallet Balance'
    : booking.paymentMethod === 'PAYMOB_CARD'
      ? 'Credit / Debit Card'
      : 'Pay At Venue'

  return (
    <main className="w-full min-h-screen bg-surface px-5 py-8 md:px-10 lg:px-14 md:py-12">
      <div className="max-w-2xl mx-auto">
        <div className="bg-surface-container-lowest rounded-[var(--radius-xl)] p-6 md:p-8 shadow-ambient text-center">
          <div className="w-20 h-20 rounded-full bg-[#d8f7e8] mx-auto flex items-center justify-center mb-5">
            <div className="w-12 h-12 rounded-full bg-[#0d7a44] text-white flex items-center justify-center">
              <Check className="w-6 h-6 stroke-[3]" />
            </div>
          </div>

          <h1 className="text-3xl md:text-4xl font-extrabold text-primary tracking-tight">Session Confirmed</h1>
          <p className="text-primary/70 mt-2">Your coach session has been successfully booked.</p>

          <div className="mt-6 bg-surface-container-high rounded-[var(--radius-lg)] p-4 text-left space-y-3">
            <div className="flex items-start gap-3">
              <div className="relative w-14 h-14 rounded-[var(--radius-default)] overflow-hidden shrink-0 mt-0.5">
                <Image src={booking.coach?.user.avatar ?? '/favicon.ico'} alt={booking.coach?.user.name ?? 'Coach'} fill className="object-cover" />
              </div>
              <div>
                <p className="text-sm font-bold text-primary">{booking.coach?.user.name ?? 'Coach Session'}</p>
                <p className="text-xs text-primary/70 mt-1">{booking.coach?.sport.displayName ?? 'Sport'} coaching</p>
              </div>
            </div>

            <p className="text-sm text-primary/75 inline-flex items-center gap-2">
              <CalendarDays className="w-4 h-4" />
              <span><span className="font-bold text-primary">Date:</span> {new Date(booking.date).toLocaleDateString()}</span>
            </p>
            <p className="text-sm text-primary/75 inline-flex items-center gap-2">
              <Clock3 className="w-4 h-4" />
              <span><span className="font-bold text-primary">Time:</span> {formatHour(booking.startHour)} - {formatHour(booking.endHour)}</span>
            </p>
            <p className="text-sm text-primary/75 inline-flex items-center gap-2">
              <UserRound className="w-4 h-4" />
              <span><span className="font-bold text-primary">Participants:</span> {booking.playerCount}</span>
            </p>
            <p className="text-sm text-primary/75 inline-flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span><span className="font-bold text-primary">Location:</span> SportBook Club - Main Arena</span>
            </p>
            <p className="text-sm text-primary/75 inline-flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              <span><span className="font-bold text-primary">Payment:</span> {paymentLabel}</span>
            </p>
            <p className="text-sm text-primary/75">
              <span className="font-bold text-primary">Total Paid:</span> {booking.totalPrice} EGP
            </p>
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link
              href="/coaches"
              className="inline-flex items-center justify-center py-3 px-5 rounded-full bg-primary-container text-surface-container-lowest font-bold"
            >
              Book Another Coach
            </Link>

            <Link
              href="/profile/bookings"
              className="inline-flex items-center justify-center py-3 px-5 rounded-full bg-secondary-container text-on-secondary-container font-bold"
            >
              View My Bookings
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}

export default function CoachConfirmationPage() {
  return (
    <Suspense
      fallback={
        <main className="w-full min-h-screen bg-surface px-5 py-8 md:px-10 lg:px-14 md:py-12">
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-lg font-bold text-primary">Loading confirmation...</p>
          </div>
        </main>
      }
    >
      <CoachConfirmationPageContent />
    </Suspense>
  )
}

function formatHour(hour: number) {
  const suffix = hour >= 12 ? 'PM' : 'AM'
  const normalized = hour % 12 === 0 ? 12 : hour % 12
  return `${normalized}:00 ${suffix}`
}
