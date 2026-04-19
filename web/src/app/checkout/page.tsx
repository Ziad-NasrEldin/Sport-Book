'use client'

import { Suspense, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
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
import { useApiCall } from '@/lib/api/hooks'
import { APIErrorFallback } from '@/components/ui/ErrorBoundary'
import { api, APIError } from '@/lib/api/client'
import type { CourtDetail, WalletResponse } from '@/lib/court/types'
import { formatHour } from '@/lib/court/types'

type PaymentMethod = 'card' | 'wallet' | 'cash'

function CheckoutPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const courtId = searchParams.get('courtId') ?? ''
  const dateParam = searchParams.get('date') ?? new Date().toISOString().slice(0, 10)
  const startHour = Number(searchParams.get('startHour') ?? '9')
  const endHour = Number(searchParams.get('endHour') ?? '10')

  const { data: court, error: courtError, refetch: refetchCourt } = useApiCall<CourtDetail>(
    courtId ? `/courts/${courtId}` : '',
    { immediate: !!courtId },
  )

  const { data: walletData, error: walletError } = useApiCall<WalletResponse>(
    '/users/me/wallet',
    { immediate: true },
  )

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card')
  const [promoCode, setPromoCode] = useState('')
  const [isPromoApplied, setIsPromoApplied] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const duration = endHour - startHour
  const basePrice = court?.basePrice ?? 0
  const subtotal = basePrice * duration
  const serviceFee = 20
  const vat = Math.round(subtotal * 0.14)
  const promoDiscount = isPromoApplied ? Math.round(subtotal * 0.1) : 0
  const total = subtotal + serviceFee + vat - promoDiscount

  const walletBalance = walletData?.balance ?? 0

  if (!courtId) {
    return (
      <main className="w-full min-h-screen bg-surface flex items-center justify-center px-5">
        <div className="text-center">
          <p className="text-lg font-bold text-primary">No court selected</p>
          <Link href="/" className="mt-4 inline-block px-6 py-3 rounded-full bg-primary-container text-surface-container-lowest font-bold">
            Browse Courts
          </Link>
        </div>
      </main>
    )
  }

  if (courtError) {
    return (
      <main className="w-full min-h-screen bg-surface flex items-center justify-center px-5">
        <APIErrorFallback error={courtError} onRetry={refetchCourt} />
      </main>
    )
  }

  if (!court) {
    return (
      <main className="w-full min-h-screen bg-surface flex items-center justify-center px-5">
        <p className="text-lg font-bold text-primary">Loading checkout...</p>
      </main>
    )
  }

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back()
      return
    }
    router.push(`/book?courtId=${courtId}`)
  }

  const handleCheckout = async () => {
    setSubmitting(true)
    setSubmitError(null)

    try {
      const booking = await api.post<{ id: string; paymentStatus: string }>('/bookings', {
        type: 'COURT',
        courtId,
        date: dateParam,
        startHour,
        endHour,
        playerCount: 1,
        couponCode: isPromoApplied ? 'COURT10' : undefined,
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
        `/confirmation?${new URLSearchParams({
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

  const paymentOptions: Array<{ id: PaymentMethod; label: string; icon: typeof CreditCard; sublabel?: string }> = [
    { id: 'card', label: 'Credit / Debit Card', icon: CreditCard },
    { id: 'wallet', label: 'Wallet Balance', icon: Wallet, sublabel: `${walletBalance.toFixed(2)} EGP Available` },
    { id: 'cash', label: 'Pay At Venue', icon: Banknote },
  ]

  return (
    <main className="w-full min-h-screen bg-surface-container-low pb-36 md:pb-40 relative">
      <header className="sticky top-0 z-40 bg-surface-container-low/90 backdrop-blur-xl px-5 py-4 md:px-10 lg:px-14 md:py-5">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handleBack}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-container-high hover:bg-surface-container-lowest transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5 text-primary" />
          </button>
          <div>
            <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-primary">Court Checkout</h1>
            <p className="text-sm text-primary/60 mt-0.5">Secure your court booking</p>
          </div>
        </div>
      </header>

      <section className="px-5 md:px-10 lg:px-14 md:max-w-5xl md:mx-auto grid grid-cols-1 lg:grid-cols-[1.15fr,0.85fr] gap-5 md:gap-6 mt-5">
        <div className="space-y-5">
          <article className="bg-surface-container-lowest rounded-[var(--radius-lg)] p-4 md:p-5 shadow-ambient">
            <h2 className="text-lg md:text-xl font-bold text-primary mb-4">Booking Details</h2>
            <div className="flex items-start gap-4">
              <div className="relative w-24 h-24 rounded-[var(--radius-default)] overflow-hidden shrink-0">
                <Image src={court.images?.[0] ?? '/favicon.ico'} alt={court.name} fill className="object-cover" />
              </div>
              <div className="flex-1 min-w-0 space-y-1.5 text-sm">
                <p className="text-[10px] font-lexend uppercase tracking-[0.18em] text-secondary">{court.sport?.displayName ?? 'Court'}</p>
                <h3 className="text-lg font-extrabold text-primary">{court.name}</h3>
                <p className="text-primary/75">{new Date(dateParam).toLocaleDateString()} • {formatHour(startHour)}</p>
                <p className="text-primary/75">{duration} hour{duration > 1 ? 's' : ''} • {formatHour(startHour)} - {formatHour(endHour)}</p>
                <p className="text-primary/60">{court.branch?.facility?.name ?? ''}{court.branch?.name ? ` - ${court.branch.name}` : ''}</p>
              </div>
            </div>
          </article>

          <article className="bg-surface-container-lowest rounded-[var(--radius-lg)] p-4 md:p-5 shadow-ambient space-y-4">
            <h2 className="text-lg md:text-xl font-bold text-primary">Payment Method</h2>
            <div className="space-y-3">
              {paymentOptions.map((option) => {
                const Icon = option.icon
                const active = paymentMethod === option.id
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setPaymentMethod(option.id)}
                    className={`w-full flex items-center justify-between rounded-[var(--radius-md)] px-4 py-3 transition-colors ${
                      active ? 'bg-tertiary-fixed text-primary' : 'bg-surface-container-high text-primary/80'
                    }`}
                  >
                    <span className="inline-flex items-center gap-2 font-semibold">
                      <Icon className="w-4 h-4" />
                      <div>
                        <span>{option.label}</span>
                        {option.sublabel && (
                          <span className="block text-[10px] font-lexend font-medium text-primary/40">{option.sublabel}</span>
                        )}
                      </div>
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
                onClick={() => setIsPromoApplied(promoCode.trim().toUpperCase() === 'COURT10')}
                className="px-3 py-1.5 rounded-full bg-primary text-white text-xs font-bold"
              >
                Apply
              </button>
            </div>

            {promoCode.length > 0 && (
              <p className={`text-xs ${isPromoApplied ? 'text-[#0d7a44]' : 'text-secondary'}`}>
                {isPromoApplied ? 'Promo applied: 10% discount.' : 'Use code COURT10 for 10% off.'}
              </p>
            )}

            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-primary/70">Subtotal ({duration}hr × {basePrice} EGP)</span>
                <span className="font-lexend font-bold text-primary">{subtotal} EGP</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-primary/70">Service Fee</span>
                <span className="font-lexend font-bold text-primary">{serviceFee} EGP</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-primary/70">VAT 14%</span>
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

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <main className="w-full min-h-screen bg-surface px-5 py-12">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-lg font-bold text-primary">Loading checkout...</p>
          </div>
        </main>
      }
    >
      <CheckoutPageContent />
    </Suspense>
  )
}