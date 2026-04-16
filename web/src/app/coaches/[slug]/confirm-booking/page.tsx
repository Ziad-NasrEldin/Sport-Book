'use client'

import { Suspense, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  UserRound,
  MapPin,
  Circle,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react'
import { coaches } from '@/lib/coaches'

const DEFAULT_DATE = 'Apr 20, 2026'
const DEFAULT_TIME = '06:00 PM'
const DEFAULT_LOCATION = 'SportBook Club - Main Arena'

type SessionType = 'private' | 'duo'

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

function CoachConfirmBookingPageContent() {
  const router = useRouter()
  const params = useParams<{ slug: string | string[] }>()
  const searchParams = useSearchParams()

  const slugParam = params.slug
  const slug = Array.isArray(slugParam) ? slugParam[0] : (slugParam ?? '')

  const coach = useMemo(
    () => coaches.find((entry) => entry.slug === slug),
    [slug],
  )

  const sessionDate = searchParams.get('date') ?? DEFAULT_DATE
  const sessionTime = searchParams.get('time') ?? DEFAULT_TIME
  const sessionLocation = searchParams.get('location') ?? DEFAULT_LOCATION

  const [sessionType, setSessionType] = useState<SessionType>(
    searchParams.get('type') === 'duo' ? 'duo' : 'private',
  )
  const [durationMinutes, setDurationMinutes] = useState(
    parsePositiveInt(searchParams.get('duration'), 60),
  )

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
  const participants = sessionType === 'duo' ? 2 : 1
  const sessionSubtotal = Math.round(hourlyRate * (durationMinutes / 60) * typeMultiplier)
  const platformFee = 20
  const total = sessionSubtotal + platformFee

  const checkoutHref = `/coaches/${coach.slug}/checkout?${new URLSearchParams({
    date: sessionDate,
    time: sessionTime,
    location: sessionLocation,
    duration: String(durationMinutes),
    type: sessionType,
    participants: String(participants),
    subtotal: String(sessionSubtotal),
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

              router.push(`/coaches/${coach.slug}`)
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

      <section className="px-5 md:px-10 lg:px-14 md:max-w-5xl md:mx-auto grid grid-cols-1 lg:grid-cols-[1.15fr,0.85fr] gap-5 md:gap-6 mt-5">
        <div className="space-y-5">
          <article className="bg-surface-container-lowest rounded-[var(--radius-lg)] p-4 md:p-5 shadow-ambient">
            <h2 className="text-lg md:text-xl font-bold text-primary mb-4">Coach Details</h2>
            <div className="flex items-start gap-4">
              <div className="relative w-24 h-24 rounded-[var(--radius-default)] overflow-hidden shrink-0">
                <Image src={coach.image} alt={coach.name} fill className="object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-lexend uppercase tracking-[0.18em] text-secondary">{coach.sport} Coaching</p>
                <h3 className="text-lg font-extrabold text-primary mt-1">{coach.name}</h3>
                <p className="text-sm text-primary/65 mt-1">{coach.bio}</p>
                <p className="text-sm font-bold text-secondary mt-2">{coach.sessionRate}</p>
              </div>
            </div>
          </article>

          <article className="bg-surface-container-lowest rounded-[var(--radius-lg)] p-4 md:p-5 shadow-ambient space-y-4">
            <h2 className="text-lg md:text-xl font-bold text-primary">Session Setup</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="rounded-[var(--radius-md)] bg-surface-container-high px-4 py-3 text-primary/80 inline-flex items-center gap-2">
                <CalendarDays className="w-4 h-4" />
                {sessionDate}
              </div>
              <div className="rounded-[var(--radius-md)] bg-surface-container-high px-4 py-3 text-primary/80 inline-flex items-center gap-2">
                <Clock3 className="w-4 h-4" />
                {sessionTime}
              </div>
              <div className="rounded-[var(--radius-md)] bg-surface-container-high px-4 py-3 text-primary/80 inline-flex items-center gap-2 sm:col-span-2">
                <MapPin className="w-4 h-4" />
                {sessionLocation}
              </div>
            </div>

            <div className="space-y-2.5">
              <p className="text-[10px] font-lexend font-bold uppercase tracking-[0.16em] text-primary/50">Session Type</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSessionType('private')}
                  className={`rounded-[var(--radius-md)] px-4 py-3 text-left transition-colors ${
                    sessionType === 'private'
                      ? 'bg-tertiary-fixed text-primary'
                      : 'bg-surface-container-high text-primary/80'
                  }`}
                >
                  <p className="font-bold">Private Session</p>
                  <p className="text-xs mt-1 opacity-80">1 athlete focused coaching.</p>
                </button>
                <button
                  type="button"
                  onClick={() => setSessionType('duo')}
                  className={`rounded-[var(--radius-md)] px-4 py-3 text-left transition-colors ${
                    sessionType === 'duo'
                      ? 'bg-tertiary-fixed text-primary'
                      : 'bg-surface-container-high text-primary/80'
                  }`}
                >
                  <p className="font-bold">Duo Session</p>
                  <p className="text-xs mt-1 opacity-80">2 athletes with shared drills.</p>
                </button>
              </div>
            </div>

            <div className="space-y-2.5">
              <p className="text-[10px] font-lexend font-bold uppercase tracking-[0.16em] text-primary/50">Duration</p>
              <div className="flex flex-wrap gap-2">
                {[60, 90, 120].map((minutes) => {
                  const isActive = durationMinutes === minutes

                  return (
                    <button
                      key={minutes}
                      type="button"
                      onClick={() => setDurationMinutes(minutes)}
                      className={`px-3 py-1.5 rounded-full text-[11px] font-lexend font-bold uppercase tracking-wide transition-colors ${
                        isActive
                          ? 'bg-primary-container text-surface-container-lowest'
                          : 'bg-surface-container-high text-primary/75 hover:bg-surface-container-low'
                      }`}
                    >
                      {minutes} min
                    </button>
                  )
                })}
              </div>
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
              <p className="inline-flex items-center gap-2 text-primary/65">
                <Circle className="w-3.5 h-3.5" />
                Final total will be calculated during checkout.
              </p>
            </div>
          </article>
        </aside>
      </section>

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
