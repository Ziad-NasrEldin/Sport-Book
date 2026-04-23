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
    <main className="w-full bg-surface min-h-screen pb-[calc(8.5rem+env(safe-area-inset-bottom))] md:pb-[11rem] relative">
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-[10%] -left-[5%] w-[40%] h-[40%] bg-primary-container/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[10%] -right-[5%] w-[30%] h-[30%] bg-tertiary-fixed/10 rounded-full blur-[100px]" />
      </div>

      <header className="flex justify-between items-center w-full px-5 py-4 sticky top-0 z-50 bg-surface/80 backdrop-blur-xl md:px-10 lg:px-14">
        <div className="flex items-center gap-4">
          <Link
            href="/coaches"
            className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-container-high hover:bg-surface-container-low transition-colors active:scale-95 duration-200 shadow-sm"
          >
            <ArrowLeft className="w-5 h-5 text-primary-container stroke-[2]" />
          </Link>
          <h1 className="text-primary-container font-extrabold tracking-tight text-lg md:text-xl">{coach?.user.name ?? 'Coach'}</h1>
        </div>
      </header>

      {coach ? (
        <div className="md:max-w-4xl md:mx-auto">
          <section className="relative w-full aspect-[16/10] sm:aspect-video overflow-hidden md:rounded-[2rem] md:mt-4 md:shadow-ambient transition-transform duration-300 hover:scale-[1.01]">
            <Image src={coach.user.avatar ?? '/favicon.ico'} alt={coach.user.name} fill className="object-cover object-center" priority />
            <div className="absolute inset-x-0 bottom-0 p-6 md:p-8 bg-gradient-to-t from-primary/90 via-primary/40 to-transparent">
              <div className="space-y-2 md:space-y-3">
                <span className="inline-flex items-center gap-1 bg-tertiary-fixed text-primary px-3 py-1 rounded-full text-xs font-bold tracking-wide">
                  <Star className="w-3 h-3 fill-primary" /> {(reviews?.items?.[0]?.rating ?? 4.9).toFixed?.(1) ?? '4.9'}
                </span>
                <h2 className="text-3xl font-extrabold text-white leading-none md:text-5xl">{coach.user.name}</h2>
                <div className="flex flex-wrap items-center gap-2 text-white/85 text-sm md:text-base">
                  <span className="inline-flex items-center gap-1.5">
                    <Medal className="w-4 h-4" /> {coach.experienceYears} years experience
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Clock3 className="w-4 h-4" /> {coach.sport.displayName} Coach
                  </span>
                </div>
              </div>
            </div>
          </section>

          <div className="px-5 py-8 space-y-10 md:px-0 md:py-10 md:space-y-12">
            <section className="bg-surface-container-lowest rounded-[1.5rem] p-6 md:p-8 shadow-ambient">
              <p className="text-xs font-lexend font-bold uppercase tracking-[0.16em] text-primary/50 mb-2">About Coach</p>
              <p className="text-sm md:text-base text-primary/80 leading-relaxed">{coach.bio}</p>
            </section>

            <section className="space-y-6">
              <h3 className="text-xl font-extrabold text-primary md:text-[28px]">Choose A Service</h3>
              <div className="grid gap-3">
                {(services ?? []).map((service) => {
                  const active = selectedServiceId === service.id
                  return (
                    <button
                      key={service.id}
                      type="button"
                      onClick={() => setSelectedServiceId(service.id)}
                      className={`rounded-[1.5rem] p-4 text-left shadow-ambient ${
                        active ? 'bg-primary-container text-surface-container-lowest' : 'bg-surface-container-lowest text-primary'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-extrabold">{service.name}</p>
                          <p className={`text-sm mt-1 ${active ? 'text-surface-container-lowest/80' : 'text-primary/65'}`}>{service.description}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-black">{service.price} EGP</p>
                          <p className={`text-xs mt-1 ${active ? 'text-surface-container-lowest/80' : 'text-primary/60'}`}>{service.duration} min</p>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </section>

            <section className="space-y-6">
              <h3 className="text-xl font-extrabold text-primary md:text-[28px]">Available Time Slots</h3>

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
                      className={`px-4 py-2 rounded-full text-sm font-bold ${
                        active ? 'bg-primary-container text-surface-container-lowest' : 'bg-surface-container-low text-primary'
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
                      className={`rounded-[var(--radius-default)] p-4 font-bold shadow-sm transition-[transform,background-color] duration-200 ${
                        active ? 'bg-secondary-container text-white animate-slot-select' : 'bg-surface-container-lowest text-primary hover:bg-surface-container-low hover:-translate-y-0.5 active:scale-95'
                      }`}
                    >
                      {formatHour(hour)}
                    </button>
                  )
                })}
              </div>

              {availableSlots.length === 0 && (
                <div className="bg-surface-container-lowest rounded-[1.5rem] p-5 text-sm text-primary/70">
                  No available slots for the selected date.
                </div>
              )}
            </section>

            <section className="bg-primary text-white rounded-[1.5rem] md:rounded-[2rem] p-7 md:p-10 space-y-6 overflow-hidden relative shadow-lg">
              <h3 className="text-xl md:text-2xl font-extrabold">Session Notes</h3>
              <ul className="space-y-5">
                <li className="flex items-start gap-4">
                  <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 text-tertiary-fixed">
                    <Check className="w-4 h-4 stroke-[3]" />
                  </span>
                  <p className="text-white/80 text-sm md:text-base leading-relaxed pt-1 font-medium">
                    Bring your own equipment and hydration for high-intensity drills.
                  </p>
                </li>
                <li className="flex items-start gap-4">
                  <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 text-tertiary-fixed">
                    <Check className="w-4 h-4 stroke-[3]" />
                  </span>
                  <p className="text-white/80 text-sm md:text-base leading-relaxed pt-1 font-medium">
                    Cancellation and reschedule policies are enforced from the coach settings page.
                  </p>
                </li>
              </ul>
            </section>

            <section className="bg-surface-container-lowest rounded-[1.5rem] p-5 md:p-6 shadow-ambient flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <p className="text-[10px] font-lexend font-bold uppercase tracking-[0.16em] text-primary/50">Next Step</p>
                <h3 className="text-xl font-extrabold text-primary mt-1">Confirm this coach session</h3>
                <p className="text-sm text-primary/65 mt-1">Review session setup, then continue to secure checkout.</p>
              </div>
              <Link
                href={confirmBookingHref}
                aria-disabled={!selectedService || selectedStartHour === null}
                className={`inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full font-extrabold text-sm md:text-base whitespace-nowrap ${
                  selectedService && selectedStartHour !== null
                    ? 'bg-gradient-to-br from-secondary to-secondary-container text-white'
                    : 'bg-surface-container-low text-primary/50 pointer-events-none'
                }`}
              >
                Confirm Booking
                <ArrowRight className="w-4 h-4" />
              </Link>
            </section>
          </div>
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
