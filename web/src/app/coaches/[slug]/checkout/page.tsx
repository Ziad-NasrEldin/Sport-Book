'use client'

import { Suspense, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import {
  ArrowLeft,
  Circle,
  CheckCircle2,
  CreditCard,
  Wallet,
  Banknote,
  ShieldCheck,
  Percent,
} from 'lucide-react'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { useApiCall } from '@/lib/api/hooks'
import { APIErrorFallback } from '@/components/ui/ErrorBoundary'
import { api, APIError } from '@/lib/api/client'
import type { PublicCoachDetail } from '@/lib/coach/types'

type PaymentMethod = 'card' | 'wallet' | 'cash'

function CoachCheckoutPageContent() {
  const router = useRouter()
  const params = useParams<{ slug: string | string[] }>()
  const searchParams = useSearchParams()

  const slugParam = params.slug
  const slug = Array.isArray(slugParam) ? slugParam[0] : (slugParam ?? '')
  const coachId = searchParams.get('coachId') ?? ''
  const serviceId = searchParams.get('serviceId') ?? ''
  const sessionDate = searchParams.get('date') ?? new Date().toISOString().slice(0, 10)
  const startHour = Number(searchParams.get('startHour') ?? '9')
  const endHour = Number(searchParams.get('endHour') ?? '10')

  const { data: coach, error, refetch } = useApiCall<PublicCoachDetail>(`/coaches/${slug}`)
  const selectedService = useMemo(() => coach?.services.find((service) => service.id === serviceId), [coach, serviceId])
  const sessionLocation = coach?.city ? `${coach.city} — Session venue` : 'Session venue TBD'

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card')
  const [promoCode, setPromoCode] = useState('')
  const [isPromoApplied, setIsPromoApplied] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  if (error) {
    return <APIErrorFallback error={error} onRetry={refetch} />
  }

  if (!coach || !selectedService) {
    return null
  }

  const sessionSubtotal = selectedService.price
  const bookingFee = Math.round(sessionSubtotal * 0.05) || 20
  const vatRate = 0.14
  const vat = Math.round(sessionSubtotal * vatRate)
  const promoDiscount = isPromoApplied ? Math.round(sessionSubtotal * 0.1) : 0
  const total = sessionSubtotal + bookingFee + vat - promoDiscount

  const handleCheckout = async () => {
    setSubmitting(true)
    setSubmitError(null)

    try {
      const booking = await api.post<{
        id: string
        paymentStatus: string
      }>('/bookings', {
        type: 'COACH',
        coachId,
        coachServiceId: serviceId,
        date: sessionDate,
        startHour,
        endHour,
        playerCount: 1,
        couponCode: isPromoApplied ? 'COACH10' : undefined,
      })

      if (paymentMethod === 'wallet') {
        await api.post('/payments/wallet', { bookingId: booking.id })
      } else if (paymentMethod === 'card') {
        const intent = await api.post<{ paymentIntent: { id: string } }>('/payments/intent', {
          bookingId: booking.id,
          paymentMethod: 'PAYMOB_CARD',
        })
        await api.post('/payments/process', {
          paymentIntentId: intent.paymentIntent.id,
          paymentRef: `mock-card-${Date.now()}`,
        })
      }

      router.push(
        `/coaches/${slug}/confirmation?${new URLSearchParams({
          bookingId: booking.id,
          payment: paymentMethod,
        }).toString()}`,
      )
    } catch (caught) {
      const apiError = caught as APIError
      setSubmitError(apiError.message || 'Failed to complete checkout.')
    } finally {
      setSubmitting(false)
    }
  }

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

              router.push(`/coaches/${coach.slug}/confirm-booking`)
            }}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-container-high hover:bg-surface-container-lowest transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5 text-primary" />
          </button>
          <div>
            <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-primary">Coach Checkout</h1>
            <p className="text-sm text-primary/60 mt-0.5">Secure your coaching session</p>
          </div>
        </div>
      </header>

      <section className="px-5 md:px-10 lg:px-14 md:max-w-5xl md:mx-auto grid grid-cols-1 lg:grid-cols-[1.15fr,0.85fr] gap-5 md:gap-6 mt-5">
        <div className="space-y-5">
          <article className="bg-surface-container-lowest rounded-[var(--radius-lg)] p-4 md:p-5 shadow-ambient">
            <h2 className="text-lg md:text-xl font-bold text-primary mb-4">Session Details</h2>
            <div className="flex items-start gap-4">
              <div className="relative w-24 h-24 rounded-[var(--radius-default)] overflow-hidden shrink-0">
                <Image src={coach.user.avatar ?? '/favicon.ico'} alt={coach.user.name} fill className="object-cover" />
              </div>
              <div className="flex-1 min-w-0 space-y-1.5 text-sm">
                <p className="text-[10px] font-lexend uppercase tracking-[0.18em] text-secondary">{coach.sport.displayName} Coach</p>
                <h3 className="text-lg font-extrabold text-primary">{coach.user.name}</h3>
                <p className="text-primary/75">{new Date(sessionDate).toLocaleDateString()} • {formatHour(startHour)}</p>
                <p className="text-primary/75">{selectedService.duration} minutes • {selectedService.name}</p>
                <p className="text-primary/60">{sessionLocation}</p>
              </div>
            </div>
          </article>

          <article className="bg-surface-container-lowest rounded-[var(--radius-lg)] p-4 md:p-5 shadow-ambient space-y-4">
            <h2 className="text-lg md:text-xl font-bold text-primary">Payment Method</h2>
            <div className="space-y-3">
              {[
                { id: 'card', label: 'Credit / Debit Card', icon: CreditCard },
                { id: 'wallet', label: 'Wallet Balance', icon: Wallet },
                { id: 'cash', label: 'Pay At Venue', icon: Banknote },
              ].map((option) => {
                const Icon = option.icon
                const active = paymentMethod === option.id
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setPaymentMethod(option.id as PaymentMethod)}
                    className={`w-full flex items-center justify-between rounded-[var(--radius-md)] px-4 py-3 transition-colors ${
                      active ? 'bg-tertiary-fixed text-primary' : 'bg-surface-container-high text-primary/80'
                    }`}
                  >
                    <span className="inline-flex items-center gap-2 font-semibold">
                      <Icon className="w-4 h-4" />
                      {option.label}
                    </span>
                    {active ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                  </button>
                )
              })}
            </div>
          </article>
        </div>

        <aside className="space-y-4">
          <article className="bg-surface-container-lowest rounded-[var(--radius-lg)] p-4 md:p-5 shadow-ambient space-y-4 lg:sticky lg:top-28">
            <h2 className="text-lg md:text-xl font-bold text-primary">Order Summary</h2>

            <div className="flex items-center gap-2 bg-surface-container-high rounded-[var(--radius-md)] px-3 py-2.5">
              <Percent className="w-4 h-4 text-primary/60" />
              <input
                value={promoCode}
                onChange={(event) => setPromoCode(event.target.value)}
                placeholder="Promo code"
                className="flex-1 bg-transparent outline-none text-sm text-primary placeholder:text-primary/45"
              />
              <button
                type="button"
                onClick={() => setIsPromoApplied(promoCode.trim().toUpperCase() === 'COACH10')}
                className="px-3 py-1.5 rounded-full bg-primary text-white text-xs font-bold"
              >
                Apply
              </button>
            </div>

            {promoCode.length > 0 && (
              <p className={`text-xs ${isPromoApplied ? 'text-[#0d7a44]' : 'text-secondary'}`}>
                {isPromoApplied ? 'Promo applied: 10% discount.' : 'Use code COACH10 for 10% off.'}
              </p>
            )}

            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-primary/70">Session Subtotal</span>
                <span className="font-lexend font-bold text-primary">{sessionSubtotal} EGP</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-primary/70">Booking Fee</span>
                <span className="font-lexend font-bold text-primary">{bookingFee} EGP</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-primary/70">VAT {Math.round(vatRate * 100)}%</span>
                <span className="font-lexend font-bold text-primary">{vat} EGP</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-primary/70">Discount</span>
                <span className="font-lexend font-bold text-[#0d7a44]">-{promoDiscount} EGP</span>
              </div>
              <div className="h-4 w-[110%] -ml-[5%] border-b-[2px] border-dashed border-primary/10" />
              <div className="flex items-center justify-between">
                <span className="text-xl font-extrabold text-primary">Total</span>
                <span className="text-xl font-black font-lexend text-primary">{total} EGP</span>
              </div>
            </div>

            {submitError ? <p className="text-sm text-secondary">{submitError}</p> : null}

            <div className="inline-flex items-center gap-2 text-xs text-primary/70 bg-surface-container-high rounded-full px-3 py-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              SSL encrypted checkout session
            </div>
          </article>
        </aside>
      </section>

      <div className="fixed bottom-0 left-0 right-0 p-5 md:p-8 bg-surface/80 backdrop-blur-xl z-50">
        <div className="w-full max-w-5xl mx-auto">
          <button
            type="button"
            onClick={() => void handleCheckout()}
            disabled={submitting}
            className="w-full inline-flex items-center justify-center py-4 px-6 rounded-full bg-gradient-to-br from-secondary to-secondary-container text-white font-extrabold text-lg disabled:opacity-60"
          >
            {submitting ? 'Processing...' : 'Pay Now'}
          </button>
        </div>
      </div>
    </main>
  )
}

export default function CoachCheckoutPage() {
  return (
    <AuthGuard>
      <Suspense
        fallback={
          <main className="w-full min-h-screen bg-surface px-5 md:px-10 lg:px-14 py-12">
            <div className="max-w-3xl mx-auto text-center">
              <p className="text-lg font-bold text-primary">Loading checkout...</p>
            </div>
          </main>
        }
      >
        <CoachCheckoutPageContent />
      </Suspense>
    </AuthGuard>
  )
}

function formatHour(hour: number) {
  const suffix = hour >= 12 ? 'PM' : 'AM'
  const normalized = hour % 12 === 0 ? 12 : hour % 12
  return `${normalized}:00 ${suffix}`
}
