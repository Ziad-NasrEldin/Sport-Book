'use client'

import { Suspense, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  UserRound,
  MapPin,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react'
import { useApiCall } from '@/lib/api/hooks'
import { APIErrorFallback } from '@/components/ui/ErrorBoundary'
import type { PublicCoachDetail } from '@/lib/coach/types'

type PriceCheckResponse = {
  basePrice: number
  duration: number
  discount: number
  totalPrice: number
  currency: string
}

function CoachConfirmBookingPageContent() {
  const router = useRouter()
  const params = useParams<{ slug: string | string[] }>()
  const searchParams = useSearchParams()

  const slugParam = params.slug
  const slug = Array.isArray(slugParam) ? slugParam[0] : (slugParam ?? '')
  const serviceId = searchParams.get('serviceId') ?? ''
  const coachId = searchParams.get('coachId') ?? ''
  const date = searchParams.get('date') ?? new Date().toISOString().slice(0, 10)
  const startHour = Number(searchParams.get('startHour') ?? '9')
  const endHour = Number(searchParams.get('endHour') ?? '10')

  const { data: coach, error: coachError, refetch: refetchCoach } = useApiCall<PublicCoachDetail>(`/coaches/${slug}`)
  const { data: priceCheck, error: priceError, refetch: refetchPrice } = useApiCall<PriceCheckResponse>(
    `/bookings/price-check`,
    { immediate: false },
  )

  const selectedService = useMemo(
    () => coach?.services.find((service) => service.id === serviceId),
    [coach, serviceId],
  )

  if (coachError) {
    return <APIErrorFallback error={coachError} onRetry={refetchCoach} />
  }
  if (priceError) {
    return <APIErrorFallback error={priceError} onRetry={refetchPrice} />
  }

  const participants = 1
  const platformFee = selectedService?.price ? Math.round(selectedService.price * 0.05) : 20
  const sessionSubtotal = selectedService?.price ?? 0
  const total = sessionSubtotal + platformFee

  const checkoutHref = `/coaches/${slug}/checkout?${new URLSearchParams({
    coachId,
    serviceId,
    date,
    startHour: String(startHour),
    endHour: String(endHour),
  }).toString()}`

  return (
    <main className="w-full min-h-screen bg-surface-container-low pb-36 md:pb-40 relative">
      <header className="sticky top-0 z-40 bg-surface-container-low/90 backdrop-blur-xl px-5 py-4 md:px-10 lg:px-14 md:py-5">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => {
              if (window.history.length > 1) {
                router.back()
                return
              }

              router.push(`/coaches/${slug}`)
            }}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-container-high hover:bg-surface-container-lowest transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5 text-primary" />
          </button>
          <div>
            <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-primary">Confirm Booking</h1>
            <p className="text-sm text-primary/60 mt-0.5">Review your coach session details before checkout</p>
          </div>
        </div>
      </header>

      {coach && selectedService ? (
        <section className="px-5 md:px-10 lg:px-14 md:max-w-5xl md:mx-auto grid grid-cols-1 lg:grid-cols-[1.15fr,0.85fr] gap-5 md:gap-6 mt-5">
          <div className="space-y-5">
            <article className="bg-surface-container-lowest rounded-[var(--radius-lg)] p-4 md:p-5 shadow-ambient">
              <h2 className="text-lg md:text-xl font-bold text-primary mb-4">Coach Details</h2>
              <div className="flex items-start gap-4">
                <div className="relative w-24 h-24 rounded-[var(--radius-default)] overflow-hidden shrink-0">
                  <Image src={coach.user.avatar ?? '/favicon.ico'} alt={coach.user.name} fill className="object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-lexend uppercase tracking-[0.18em] text-secondary">{coach.sport.displayName} Coaching</p>
                  <h3 className="text-lg font-extrabold text-primary mt-1">{coach.user.name}</h3>
                  <p className="text-sm text-primary/65 mt-1">{coach.bio}</p>
                  <p className="text-sm font-bold text-secondary mt-2">{selectedService.price} EGP</p>
                </div>
              </div>
            </article>

            <article className="bg-surface-container-lowest rounded-[var(--radius-lg)] p-4 md:p-5 shadow-ambient space-y-4">
              <h2 className="text-lg md:text-xl font-bold text-primary">Session Setup</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div className="rounded-[var(--radius-md)] bg-surface-container-high px-4 py-3 text-primary/80 inline-flex items-center gap-2">
                  <CalendarDays className="w-4 h-4" />
                  {new Date(date).toLocaleDateString()}
                </div>
                <div className="rounded-[var(--radius-md)] bg-surface-container-high px-4 py-3 text-primary/80 inline-flex items-center gap-2">
                  <Clock3 className="w-4 h-4" />
                  {formatHour(startHour)} - {formatHour(endHour)}
                </div>
                <div className="rounded-[var(--radius-md)] bg-surface-container-high px-4 py-3 text-primary/80 inline-flex items-center gap-2 sm:col-span-2">
                  <MapPin className="w-4 h-4" />
                  {coach?.city ? `${coach.city} — Session location will be confirmed by coach` : 'Session location will be confirmed by coach'}
                </div>
              </div>

              <div className="rounded-[var(--radius-md)] bg-surface-container-high px-4 py-3">
                <p className="font-bold text-primary">{selectedService.name}</p>
                <p className="text-xs text-primary/60 mt-1">{selectedService.description}</p>
              </div>
            </article>
          </div>

          <aside className="space-y-4">
            <article className="bg-surface-container-lowest rounded-[var(--radius-lg)] p-4 md:p-5 shadow-ambient space-y-4 lg:sticky lg:top-28">
              <h2 className="text-lg md:text-xl font-bold text-primary">Booking Summary</h2>

              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-primary/70 inline-flex items-center gap-2"><UserRound className="w-4 h-4" /> Participants</span>
                  <span className="font-lexend font-bold text-primary">{participants}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-primary/70">Session Subtotal</span>
                  <span className="font-lexend font-bold text-primary">{sessionSubtotal} EGP</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-primary/70">Platform Fee</span>
                  <span className="font-lexend font-bold text-primary">{platformFee} EGP</span>
                </div>
                <div className="h-4 w-[110%] -ml-[5%] border-b-[2px] border-dashed border-primary/10" />
                <div className="flex items-center justify-between">
                  <span className="text-xl font-extrabold text-primary">Estimated Total</span>
                  <span className="text-xl font-black font-lexend text-primary">{total} EGP</span>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <p className="inline-flex items-center gap-2 text-[#0d7a44]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Free reschedule up to 12 hours before session start.
                </p>
              </div>
            </article>
          </aside>
        </section>
      ) : null}

      <div className="fixed bottom-0 left-0 right-0 p-5 md:p-8 bg-surface/80 backdrop-blur-xl z-50">
        <div className="w-full max-w-5xl mx-auto">
          <Link
            href={checkoutHref}
            className="w-full inline-flex items-center justify-center gap-2 py-4 px-6 rounded-full bg-gradient-to-br from-secondary to-secondary-container text-white font-extrabold text-lg"
          >
            Continue To Checkout
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </main>
  )
}

export default function CoachConfirmBookingPage() {
  return (
    <Suspense
      fallback={
        <main className="w-full min-h-screen bg-surface px-5 md:px-10 lg:px-14 py-12">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-lg font-bold text-primary">Loading booking details...</p>
          </div>
        </main>
      }
    >
      <CoachConfirmBookingPageContent />
    </Suspense>
  )
}

function formatHour(hour: number) {
  const suffix = hour >= 12 ? 'PM' : 'AM'
  const normalized = hour % 12 === 0 ? 12 : hour % 12
  return `${normalized}:00 ${suffix}`
}
