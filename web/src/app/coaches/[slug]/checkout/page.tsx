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
import { coaches } from '@/lib/coaches'

type SessionType = 'private' | 'duo'
type PaymentMethod = 'card' | 'wallet' | 'cash'

function parsePositiveInt(value: string | null, fallback: number) {
  const parsed = Number(value)
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback
  }

  return Math.floor(parsed)
}

function parseCoachHourlyRate(sessionRate: string) {
  const match = sessionRate.match(/\d+/)
  if (!match) {
    return 0
  }

  return Number(match[0])
}

function CoachCheckoutPageContent() {
  const router = useRouter()
  const params = useParams<{ slug: string | string[] }>()
  const searchParams = useSearchParams()

  const slugParam = params.slug
  const slug = Array.isArray(slugParam) ? slugParam[0] : (slugParam ?? '')

  const coach = useMemo(
    () => coaches.find((entry) => entry.slug === slug),
    [slug],
  )

  const sessionDate = searchParams.get('date') ?? 'Apr 20, 2026'
  const sessionTime = searchParams.get('time') ?? '06:00 PM'
  const sessionLocation = searchParams.get('location') ?? 'SportBook Club - Main Arena'
  const sessionType: SessionType = searchParams.get('type') === 'duo' ? 'duo' : 'private'
  const participants = parsePositiveInt(searchParams.get('participants'), sessionType === 'duo' ? 2 : 1)
  const durationMinutes = parsePositiveInt(searchParams.get('duration'), 60)

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card')
  const [promoCode, setPromoCode] = useState('')
  const [isPromoApplied, setIsPromoApplied] = useState(false)

  if (!coach) {
    return (
      <main className="w-full min-h-screen bg-surface px-5 py-10 md:px-10 lg:px-14">
        <div className="max-w-2xl mx-auto bg-surface-container-lowest rounded-[var(--radius-xl)] p-6 md:p-8 shadow-ambient text-center">
          <h1 className="text-2xl md:text-3xl font-extrabold text-primary">Coach Not Found</h1>
          <p className="text-primary/70 mt-2">We could not find this coach profile.</p>
          <Link
            href="/coaches"
            className="mt-6 inline-flex items-center justify-center px-6 py-3 rounded-full bg-primary-container text-surface-container-lowest font-bold"
          >
            Back To Coaches
          </Link>
        </div>
      </main>
    )
  }

  const hourlyRate = parseCoachHourlyRate(coach.sessionRate)
  const typeMultiplier = sessionType === 'duo' ? 1.65 : 1
  const fallbackSubtotal = Math.round(hourlyRate * (durationMinutes / 60) * typeMultiplier)
  const querySubtotal = parsePositiveInt(searchParams.get('subtotal'), 0)
  const sessionSubtotal = querySubtotal > 0 ? querySubtotal : fallbackSubtotal

  const bookingFee = 20
  const vat = Math.round(sessionSubtotal * 0.14)
  const promoDiscount = isPromoApplied ? Math.round(sessionSubtotal * 0.1) : 0
  const total = sessionSubtotal + bookingFee + vat - promoDiscount

  const confirmationHref = `/coaches/${coach.slug}/confirmation?${new URLSearchParams({
    date: sessionDate,
    time: sessionTime,
    location: sessionLocation,
    duration: String(durationMinutes),
    type: sessionType,
    participants: String(participants),
    total: String(total),
    payment: paymentMethod,
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
                <Image src={coach.image} alt={coach.name} fill className="object-cover" />
              </div>
              <div className="flex-1 min-w-0 space-y-1.5 text-sm">
                <p className="text-[10px] font-lexend uppercase tracking-[0.18em] text-secondary">{coach.sport} Coach</p>
                <h3 className="text-lg font-extrabold text-primary">{coach.name}</h3>
                <p className="text-primary/75">{sessionDate} • {sessionTime}</p>
                <p className="text-primary/75">{durationMinutes} minutes • {sessionType === 'duo' ? 'Duo Session' : 'Private Session'}</p>
                <p className="text-primary/60">{sessionLocation}</p>
              </div>
            </div>
          </article>

          <article className="bg-surface-container-lowest rounded-[var(--radius-lg)] p-4 md:p-5 shadow-ambient space-y-4">
            <h2 className="text-lg md:text-xl font-bold text-primary">Payment Method</h2>
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`w-full flex items-center justify-between rounded-[var(--radius-md)] px-4 py-3 transition-colors ${
                  paymentMethod === 'card'
                    ? 'bg-tertiary-fixed text-primary'
                    : 'bg-surface-container-high text-primary/80'
                }`}
              >
                <span className="inline-flex items-center gap-2 font-semibold">
                  <CreditCard className="w-4 h-4" />
                  Credit / Debit Card
                </span>
                {paymentMethod === 'card' ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('wallet')}
                className={`w-full flex items-center justify-between rounded-[var(--radius-md)] px-4 py-3 transition-colors ${
                  paymentMethod === 'wallet'
                    ? 'bg-tertiary-fixed text-primary'
                    : 'bg-surface-container-high text-primary/80'
                }`}
              >
                <span className="inline-flex items-center gap-2 font-semibold">
                  <Wallet className="w-4 h-4" />
                  Wallet Balance (850 EGP)
                </span>
                {paymentMethod === 'wallet' ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('cash')}
                className={`w-full flex items-center justify-between rounded-[var(--radius-md)] px-4 py-3 transition-colors ${
                  paymentMethod === 'cash'
                    ? 'bg-tertiary-fixed text-primary'
                    : 'bg-surface-container-high text-primary/80'
                }`}
              >
                <span className="inline-flex items-center gap-2 font-semibold">
                  <Banknote className="w-4 h-4" />
                  Pay At Venue
                </span>
                {paymentMethod === 'cash' ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
              </button>
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

            <div className="inline-flex items-center gap-2 text-xs text-primary/70 bg-surface-container-high rounded-full px-3 py-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              SSL encrypted checkout session
            </div>
          </article>
        </aside>
      </section>

      <div className="fixed bottom-0 left-0 right-0 p-5 md:p-8 bg-surface/80 backdrop-blur-xl z-50">
        <div className="w-full max-w-5xl mx-auto">
          <Link
            href={confirmationHref}
            className="w-full inline-flex items-center justify-center py-4 px-6 rounded-full bg-gradient-to-br from-secondary to-secondary-container text-white font-extrabold text-lg"
          >
            Pay Now
          </Link>
        </div>
      </div>
    </main>
  )
}

export default function CoachCheckoutPage() {
  return (
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
  )
}
