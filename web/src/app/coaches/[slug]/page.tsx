'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowLeft, Medal, Clock3, Star, Check, ArrowRight } from 'lucide-react'
import { FloatingNav } from '@/components/layout/FloatingNav'
import { useApiCall } from '@/lib/api/hooks'
import { APIErrorFallback } from '@/components/ui/ErrorBoundary'
import type { PublicCoachDetail } from '@/lib/coach/types'

type PublicAvailabilityWindow = {
  id: string
  dayOfWeek: number
  startHour: number
  endHour: number
}

type PublicAvailabilityResponse = {
  coachId: string
  regularAvailability: PublicAvailabilityWindow[]
  exceptions?: Array<{ date: string; isAvailable: boolean }>
}

type PublicReviewResponse = {
  items: Array<{ id: string; rating: number; comment: string; user: { name: string } }>
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export default function CoachDetailsPage() {
  const params = useParams<{ slug: string }>()
  const slug = params.slug
  const [selectedServiceId, setSelectedServiceId] = useState<string>('')
  const [selectedDate, setSelectedDate] = useState(() => {
    const next = new Date()
    next.setDate(next.getDate() + 1)
    return next.toISOString().slice(0, 10)
  })
  const [selectedStartHour, setSelectedStartHour] = useState<number | null>(null)

  const { data: coach, error: coachError, refetch: refetchCoach } = useApiCall<PublicCoachDetail>(`/coaches/${slug}`)
  const { data: services, error: servicesError, refetch: refetchServices } = useApiCall<PublicCoachDetail['services']>(`/coaches/${slug}/services`)
  const { data: availability, error: availabilityError, refetch: refetchAvailability } =
    useApiCall<PublicAvailabilityResponse>(`/coaches/${slug}/availability?date=${selectedDate}`)
  const { data: reviews } = useApiCall<PublicReviewResponse>(`/coaches/${slug}/reviews`)

  useEffect(() => {
    if (!selectedServiceId && services && services.length > 0) {
      setSelectedServiceId(services[0].id)
    }
  }, [selectedServiceId, services])

  if (coachError) {
    return <APIErrorFallback error={coachError} onRetry={refetchCoach} />
  }
  if (servicesError) {
    return <APIErrorFallback error={servicesError} onRetry={refetchServices} />
  }
  if (availabilityError) {
    return <APIErrorFallback error={availabilityError} onRetry={refetchAvailability} />
  }

  const selectedService = services?.find((service) => service.id === selectedServiceId) ?? services?.[0]
  const dateOptions = Array.from({ length: 7 }, (_, index) => {
    const target = new Date()
    target.setDate(target.getDate() + index)
    return target
  })

  const availableSlots = useMemo(() => {
    const date = new Date(selectedDate)
    const windowForDay = availability?.regularAvailability.filter((window) => window.dayOfWeek === date.getDay()) ?? []
    const blocked = availability?.exceptions?.find((exception) => exception.date.startsWith(selectedDate) && !exception.isAvailable)
    if (blocked) return []

    return windowForDay.flatMap((window) => {
      const slots: number[] = []
      const stepHours = Math.max(1, Math.round((selectedService?.duration ?? 60) / 60))
      for (let hour = window.startHour; hour + stepHours <= window.endHour; hour += stepHours) {
        slots.push(hour)
      }
      return slots
    })
  }, [availability, selectedDate, selectedService])

  const confirmBookingHref =
    coach && selectedService && selectedStartHour !== null
      ? `/coaches/${coach.slug}/confirm-booking?${new URLSearchParams({
          coachId: coach.id,
          serviceId: selectedService.id,
          date: selectedDate,
          startHour: String(selectedStartHour),
          endHour: String(selectedStartHour + Math.max(1, Math.round(selectedService.duration / 60))),
        }).toString()}`
      : '#'

  return (
    <main className="w-full bg-surface min-h-screen pb-[calc(8.5rem+env(safe-area-inset-bottom))] md:pb-[11rem] relative overflow-hidden">
      {/* Geometric background */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: `repeating-linear-gradient(90deg, currentColor 0px, currentColor 1px, transparent 1px, transparent 80px), repeating-linear-gradient(0deg, currentColor 0px, currentColor 1px, transparent 1px, transparent 80px)`,
      }} />
      <div className="pointer-events-none absolute top-0 right-0 w-[500px] h-[500px] bg-[#c3f400]/6 blur-[120px] rounded-full -translate-y-1/3 translate-x-1/4" />

      {/* HERO HEADER */}
      <header className="relative bg-[#0a1631] overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-[#c3f400]" />

        <div className="relative max-w-[1440px] mx-auto px-5 pt-10 pb-8 md:px-8 md:pt-14 md:pb-10">
          <div className="flex items-center gap-4 pb-6">
            <Link
              href="/coaches"
              className="w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-[#c3f400] hover:text-[#0a1631] transition-colors duration-200"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <p className="text-[#c3f400] text-xs font-black uppercase tracking-[0.3em]">Coach Profile</p>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">{coach?.user.name ?? 'Coach'}</h1>
            </div>
          </div>
        </div>

        {/* Full-bleed hero image */}
        {coach && (
          <div className="relative w-full aspect-[16/9] md:aspect-[21/9] max-h-[50vh]">
            <Image
              src={coach.user.avatar ?? '/favicon.ico'}
              alt={coach.user.name}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-[#0a1631]/30" />

            {/* Rating badge */}
            <span className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#c3f400] text-[#0a1631] text-[10px] font-black uppercase tracking-widest">
              <Star className="w-3.5 h-3.5 fill-[#0a1631]" />
              {(reviews?.items?.[0]?.rating ?? 4.9).toFixed?.(1) ?? '4.9'}
            </span>

            {/* Info overlay */}
            <div className="absolute bottom-4 left-4 md:bottom-8 md:left-8">
              <div className="flex flex-wrap items-center gap-3 text-white/90 text-sm md:text-base">
                <span className="inline-flex items-center gap-1.5">
                  <Medal className="w-4 h-4 text-[#c3f400]" /> {coach.experienceYears} years
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock3 className="w-4 h-4 text-[#c3f400]" /> {coach.sport.displayName} Coach
                </span>
              </div>
            </div>
          </div>
        )}
      </header>

      {coach ? (
        <div className="px-5 md:px-6 lg:px-8 max-w-[1440px] mx-auto space-y-4 md:space-y-6 py-4 md:py-6">
          {/* About */}
          <section className="space-y-3 animate-fade-in">
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-primary/40">About Coach</p>
            <p className="text-base md:text-lg text-primary/80 max-w-3xl leading-relaxed">{coach.bio}</p>
          </section>

          {/* Services */}
          <section className="space-y-4 animate-fade-in animation-delay-100">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-primary/40 mb-1">Services</p>
                <h3 className="text-2xl md:text-3xl font-black text-primary tracking-tight">Choose A Session</h3>
              </div>
            </div>

            <div className="grid gap-3">
              {(services ?? []).map((service) => {
                const active = selectedServiceId === service.id
                return (
                  <button
                    key={service.id}
                    type="button"
                    onClick={() => setSelectedServiceId(service.id)}
                    className={`rounded-[var(--radius-lg)] p-4 md:p-5 text-left shadow-ambient transition-all duration-200 ${
                      active
                        ? 'bg-[#0a1631] text-white ring-2 ring-[#c3f400]'
                        : 'bg-surface-container-lowest text-primary hover:bg-surface-container-high'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="font-black text-lg md:text-xl">{service.name}</p>
                        <p className={`text-sm mt-1 ${active ? 'text-white/70' : 'text-primary/60'}`}>
                          {service.description}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-black text-xl md:text-2xl">{service.price} <span className="text-sm font-bold">EGP</span></p>
                        <p className={`text-xs mt-1 ${active ? 'text-white/60' : 'text-primary/50'}`}>{service.duration} min</p>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </section>

          {/* Time Slots */}
          <section className="space-y-4 animate-fade-in animation-delay-200">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-primary/40 mb-1">Schedule</p>
              <h3 className="text-2xl md:text-3xl font-black text-primary tracking-tight">Available Time Slots</h3>
            </div>

            <div className="flex flex-wrap gap-2">
              {dateOptions.map((date) => {
                const value = date.toISOString().slice(0, 10)
                const active = selectedDate === value
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => {
                      setSelectedDate(value)
                      setSelectedStartHour(null)
                    }}
                    className={`px-4 py-2.5 rounded-full text-sm font-black transition-all active:scale-95 ${
                      active
                        ? 'bg-[#0a1631] text-[#c3f400]'
                        : 'bg-surface-container-low text-primary hover:bg-surface-container-high'
                    }`}
                  >
                    {date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                  </button>
                )
              })}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {availableSlots.map((hour) => {
                const active = selectedStartHour === hour
                return (
                  <button
                    key={hour}
                    type="button"
                    onClick={() => setSelectedStartHour(hour)}
                    className={`rounded-[var(--radius-default)] p-4 font-black text-sm md:text-base shadow-sm transition-all duration-200 active:scale-95 ${
                      active
                        ? 'bg-[#c3f400] text-[#0a1631]'
                        : 'bg-surface-container-lowest text-primary hover:bg-surface-container-low hover:-translate-y-0.5'
                    }`}
                  >
                    {formatHour(hour)}
                  </button>
                )
              })}
            </div>

            {availableSlots.length === 0 && (
              <div className="bg-surface-container-lowest rounded-[var(--radius-lg)] p-4 text-sm text-primary/60 text-center">
                No available slots for the selected date.
              </div>
            )}
          </section>

          {/* Session Notes */}
          <section className="bg-[#0a1631] text-white rounded-[var(--radius-lg)] md:rounded-[2rem] p-7 md:p-10 space-y-4 overflow-hidden relative animate-fade-in animation-delay-300">
            <div className="absolute top-0 left-0 w-full h-1 bg-[#c3f400]" />
            <h3 className="text-xl md:text-2xl font-black">Session Notes</h3>
            <ul className="space-y-5">
              <li className="flex items-start gap-4">
                <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 text-[#c3f400]">
                  <Check className="w-4 h-4 stroke-[3]" />
                </span>
                <p className="text-white/70 text-sm md:text-base leading-relaxed pt-1 font-medium">
                  Bring your own equipment and hydration for high-intensity drills.
                </p>
              </li>
              <li className="flex items-start gap-4">
                <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 text-[#c3f400]">
                  <Check className="w-4 h-4 stroke-[3]" />
                </span>
                <p className="text-white/70 text-sm md:text-base leading-relaxed pt-1 font-medium">
                  Cancellation and reschedule policies are enforced from the coach settings page.
                </p>
              </li>
            </ul>
          </section>

          {/* CTA */}
          <section className="bg-surface-container-lowest rounded-[var(--radius-lg)] p-4 md:p-5 shadow-ambient flex flex-col md:flex-row md:items-center md:justify-between gap-4 animate-fade-in animation-delay-400">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-primary/40">Next Step</p>
              <h3 className="text-xl font-black text-primary mt-1">Confirm this coach session</h3>
              <p className="text-sm text-primary/60 mt-1">Review session setup, then continue to secure checkout.</p>
            </div>
            <Link
              href={confirmBookingHref}
              aria-disabled={!selectedService || selectedStartHour === null}
              className={`inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-black text-sm md:text-base whitespace-nowrap transition-all active:scale-95 ${
                selectedService && selectedStartHour !== null
                  ? 'bg-[#0a1631] text-white hover:bg-[#c3f400] hover:text-[#0a1631]'
                  : 'bg-surface-container-low text-primary/40 pointer-events-none'
              }`}
            >
              Confirm Booking
              <ArrowRight className="w-4 h-4" />
            </Link>
          </section>
        </div>
      ) : null}

      <FloatingNav />
    </main>
  )
}

function formatHour(hour: number) {
  const suffix = hour >= 12 ? 'PM' : 'AM'
  const normalized = hour % 12 === 0 ? 12 : hour % 12
  return `${normalized}:00 ${suffix}`
}
