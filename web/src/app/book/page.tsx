'use client'

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, Bell, MapPin, Star, Check, ArrowRight } from 'lucide-react'
import { useApiCall } from '@/lib/api/hooks'
import { APIErrorFallback } from '@/components/ui/ErrorBoundary'
import type { CourtDetail, SlotsResponse } from '@/lib/court/types'
import { formatHour } from '@/lib/court/types'
import { useAuth } from '@/lib/auth/useAuth'
import { ReviewModal } from '@/components/modals/ReviewModal'
import { NotificationsModal } from '@/components/modals/NotificationsModal'
import {
  NOTIFICATIONS_UPDATED_EVENT,
  getUnreadInAppNotificationsCount,
} from '@/lib/notifications'
import { ACTIVE_USER_UPDATED_EVENT, getActiveUserId } from '@/lib/teams'

function getSlotColor(hour: number) {
  if (hour < 7) return 'bg-[#6366f1]'
  if (hour < 11) return 'bg-[#f59e0b]'
  if (hour < 16) return 'bg-[#10b981]'
  return 'bg-[#ef4444]'
}

function BookingPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const courtId = searchParams.get('courtId') ?? ''
  const { isAuthenticated, requireAuth } = useAuth()

  const today = useMemo(() => new Date().toISOString().slice(0, 10), [])
  const [selectedDate, setSelectedDate] = useState(today)
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null)
  const [isReviewOpen, setIsReviewOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(() => {
    if (typeof window === 'undefined') return 0
    return getUnreadInAppNotificationsCount(getActiveUserId())
  })

  const { data: court, error: courtError, refetch: refetchCourt } = useApiCall<CourtDetail>(
    courtId ? `/courts/${courtId}` : '',
    { immediate: !!courtId },
  )

  const slotsEndpoint = useMemo(
    () => (courtId && selectedDate ? `/courts/${courtId}/slots?date=${selectedDate}` : ''),
    [courtId, selectedDate],
  )

  const { data: slotsData, error: slotsError, refetch: refetchSlots } = useApiCall<SlotsResponse>(
    slotsEndpoint,
    { immediate: !!slotsEndpoint },
  )

  useEffect(() => {
    const refreshUnread = () => {
      setUnreadCount(getUnreadInAppNotificationsCount(getActiveUserId()))
    }
    window.addEventListener(NOTIFICATIONS_UPDATED_EVENT, refreshUnread)
    window.addEventListener(ACTIVE_USER_UPDATED_EVENT, refreshUnread)
    return () => {
      window.removeEventListener(NOTIFICATIONS_UPDATED_EVENT, refreshUnread)
      window.removeEventListener(ACTIVE_USER_UPDATED_EVENT, refreshUnread)
    }
  }, [])

  const handleDateChange = useCallback((date: string) => {
    setSelectedDate(date)
    setSelectedSlot(null)
  }, [])

  const handleReviewComplete = useCallback(() => {
    setIsReviewOpen(false)
    if (!courtId || selectedSlot === null) return
    const params = new URLSearchParams({
      courtId,
      date: selectedDate,
      startHour: String(selectedSlot),
      endHour: String(selectedSlot + 1),
    })
    router.push(`/checkout?${params.toString()}`)
  }, [courtId, selectedDate, selectedSlot, router])

  const handleBack = useCallback(() => {
    if (window.history.length > 1) {
      router.back()
      return
    }
    router.push('/')
  }, [router])

  if (!courtId) {
    return (
      <main className="w-full min-h-screen bg-surface flex items-center justify-center px-5">
        <div className="text-center">
          <p className="text-lg font-bold text-primary">No court selected</p>
          <button
            type="button"
            onClick={() => router.push('/')}
            className="mt-4 px-6 py-3 rounded-full bg-primary-container text-surface-container-lowest font-bold"
          >
            Browse Courts
          </button>
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
        <p className="text-lg font-bold text-primary">Loading court details...</p>
      </main>
    )
  }

  const slots = slotsData?.slots ?? []
  const selectedSlotData = slots.find((s) => s.hour === selectedSlot)
  const selectedPrice = selectedSlotData?.price ?? court.basePrice

  const availabilityCounts = useMemo(() => {
    const avail = slots.filter((s) => s.available).length
    const booked = slots.filter((s) => s.reason === 'BOOKED').length
    const unavail = slots.length - avail - booked
    return { avail, booked, unavail }
  }, [slots])

  return (
    <main className="w-full bg-surface min-h-screen pb-48 relative">
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-[10%] -left-[5%] w-[40%] h-[40%] bg-primary-container/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[10%] -right-[5%] w-[30%] h-[30%] bg-tertiary-fixed/10 rounded-full blur-[100px]" />
      </div>

      <header className="flex justify-between items-center w-full px-5 py-4 sticky top-0 z-50 bg-surface/80 backdrop-blur-xl md:px-10 lg:px-14">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handleBack}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-container-high hover:bg-surface-container-low transition-colors active:scale-95 duration-200 shadow-sm"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5 text-primary-container stroke-[2]" />
          </button>
          <h1 className="text-primary-container font-extrabold tracking-tight text-lg md:text-xl">
            {court.name}
          </h1>
        </div>
        <button
          onClick={() => setIsNotificationsOpen(true)}
          aria-label="Open notifications"
          className="relative w-10 h-10 flex items-center justify-center rounded-full hover:bg-black/5 transition-colors active:scale-95 duration-200"
        >
          <Bell className="w-5 h-5 text-primary-container stroke-[2]" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 bg-secondary-container text-primary text-[10px] rounded-full border border-surface font-black inline-flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </header>

      <div className="md:max-w-4xl md:mx-auto">
        <section className="relative w-full aspect-[16/10] sm:aspect-video overflow-hidden md:rounded-[2rem] md:mt-4 md:shadow-ambient">
          <Image
            src={court.images?.[0] ?? '/favicon.ico'}
            alt={court.name}
            fill
            className="object-cover object-center"
            priority
          />
          <div className="absolute inset-x-0 bottom-0 p-6 md:p-8 bg-gradient-to-t from-primary/90 via-primary/40 to-transparent">
            <div className="flex justify-between items-end">
              <div className="space-y-1.5 md:space-y-3">
                <span className="inline-flex items-center gap-1 bg-tertiary-fixed text-primary px-3 py-1 rounded-full text-xs font-bold font-sans tracking-wide">
                  <Star className="w-3 h-3 fill-primary" />
                  {court.rating} ({court.reviewCount})
                </span>
                <h2 className="text-3xl font-extrabold text-white leading-none md:text-5xl">
                  {court.branch?.facility?.name ?? court.name}
                </h2>
                <div className="flex items-center gap-2 text-white/80 pb-2">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm font-medium md:text-base">
                    {court.branch?.name ?? ''}{court.branch?.name && court.branch?.facility?.name ? ' • ' : ''}{court.branch?.facility?.name ?? ''}
                  </span>
                </div>
              </div>

              <div className="hidden md:block">
                <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/10 shadow-sm">
                  <p className="text-white/60 text-xs font-lexend uppercase font-bold tracking-widest mb-1">
                    Starting from
                  </p>
                  <p className="text-3xl font-bold text-white font-lexend group">
                    {court.basePrice} EGP<span className="text-sm font-normal text-white/60 ml-1 font-sans">/hr</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="px-5 py-8 space-y-10 md:px-0 md:py-10 md:space-y-12">
          {court.amenities && court.amenities.length > 0 && (
            <section className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
              {court.amenities.slice(0, 4).map((amenity) => (
                <div key={amenity} className="p-5 bg-surface-container-lowest shadow-ambient rounded-[1.5rem] space-y-2 flex flex-col items-center text-center justify-center aspect-square md:aspect-auto md:p-6 md:items-start md:text-left">
                  <p className="font-bold text-primary text-sm md:text-lg">{amenity}</p>
                </div>
              ))}
            </section>
          )}

          <section className="space-y-6">
            <h3 className="text-xl font-extrabold text-primary md:text-[28px]">
              Select Time Slot
            </h3>

            <div className="flex items-center gap-3">
              <label htmlFor="booking-date" className="text-sm font-bold text-primary/70">
                Date:
              </label>
              <input
                id="booking-date"
                type="date"
                value={selectedDate}
                min={today}
                onChange={(e) => handleDateChange(e.target.value)}
                className="bg-surface-container-high rounded-full px-4 py-2 text-sm font-semibold text-primary outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="space-y-6">
              {slots.length > 0 ? (
                <div className="grid grid-cols-8 gap-2 md:gap-3">
                  {slots.map((slot) => {
                    const isSelected = selectedSlot === slot.hour
                    const isSelectable = slot.available

                    let boxColor = 'bg-[#10b981]'
                    if (!slot.available && slot.reason === 'BOOKED') boxColor = 'bg-[#ef4444]'
                    else if (!slot.available) boxColor = 'bg-[#d1d5db]'

                    return (
                      <button
                        key={slot.hour}
                        type="button"
                        disabled={!isSelectable}
                        onClick={() => isSelectable && setSelectedSlot(isSelected ? null : slot.hour)}
                        aria-label={`${!slot.available ? (slot.reason === 'BOOKED' ? 'Booked' : 'Unavailable') : 'Select'} slot at ${slot.hour}:00`}
                        aria-pressed={isSelected}
                        className={`flex flex-col gap-[3px] transition-transform ${isSelectable ? 'active:scale-95 cursor-pointer' : 'cursor-not-allowed opacity-70'} ${isSelected ? 'scale-105' : ''}`}
                      >
                        <div className={`h-10 sm:h-12 md:h-14 ${getSlotColor(slot.hour)} rounded-md flex items-center justify-center text-white font-bold font-lexend text-xs sm:text-sm shadow-sm ${isSelected ? 'ring-2 ring-white ring-offset-1' : ''}`}>
                          {slot.hour}
                        </div>
                        <div className={`h-8 sm:h-10 md:h-12 ${boxColor} rounded-md shadow-sm ${isSelected ? 'ring-2 ring-white ring-offset-1' : ''}`} />
                      </button>
                    )
                  })}
                </div>
              ) : (
                <p className="text-sm text-primary/60 py-8 text-center">
                  {slotsError ? 'Failed to load slots.' : 'Select a date to view available slots.'}
                </p>
              )}

              <div className="flex items-center justify-center gap-6 pt-3 md:gap-10">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-primary/60 uppercase tracking-widest font-lexend">unavailable</span>
                  <span className="w-5 h-5 rounded-full bg-[#d1d5db] shadow-sm" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-primary/60 uppercase tracking-widest font-lexend">booked</span>
                  <span className="w-5 h-5 rounded-full bg-[#ef4444] shadow-sm" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-primary/60 uppercase tracking-widest font-lexend">available</span>
                  <span className="w-5 h-5 rounded-full bg-[#10b981] shadow-sm" />
                </div>
              </div>

              {court.pricingRules && court.pricingRules.length > 0 && (
                <div className="bg-surface-container-low p-4 md:p-6 rounded-[1.5rem] flex flex-wrap items-center justify-center gap-3">
                  {court.pricingRules.map((rule) => {
                    const colorClass =
                      rule.fromHour < 7 ? 'bg-[#6366f1]' :
                      rule.fromHour < 11 ? 'bg-[#f59e0b]' :
                      rule.fromHour < 16 ? 'bg-[#10b981]' : 'bg-[#ef4444]'
                    return (
                      <span key={rule.id} className={`px-5 py-2.5 ${colorClass} text-white rounded-full text-[11px] md:text-sm font-bold font-lexend shadow-sm`}>
                        {rule.name}: {rule.value} EGP/hr
                      </span>
                    )
                  })}
                </div>
              )}
            </div>
          </section>

          <section className="bg-primary text-white rounded-[1.5rem] md:rounded-[2rem] p-7 md:p-10 space-y-6 overflow-hidden relative shadow-lg">
            <div className="absolute -right-12 -top-12 w-64 h-64 bg-tertiary-fixed/10 rounded-full blur-3xl pointer-events-none" />
            <h3 className="text-xl md:text-2xl font-extrabold flex items-center gap-2">
              Rules to Follow
            </h3>
            <ul className="space-y-5">
              {['Non-marking shoes only - Keep our professional surface pristine.', 'Max 4 players per court booking at any time.', 'Cancel 24h before your time slot for a full refund.'].map((rule) => (
                <li key={rule} className="flex items-start gap-4">
                  <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 text-tertiary-fixed">
                    <Check className="w-4 h-4 stroke-[3]" />
                  </span>
                  <p className="text-white/80 text-sm md:text-base leading-relaxed pt-1 font-medium">{rule}</p>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-5 md:p-8 bg-surface/80 backdrop-blur-xl z-50">
        <div className="w-full max-w-[1200px] mx-auto flex items-center justify-between gap-6 md:px-14">
          <div className="hidden sm:block">
            <p className="text-xs font-lexend font-bold text-primary/50 uppercase tracking-widest mb-1.5">
              {selectedSlot !== null ? `Slot ${formatHour(selectedSlot)} – ${formatHour(selectedSlot + 1)}` : 'No slot selected'}
            </p>
            <p className="text-3xl font-black font-lexend text-primary">
              {selectedSlot !== null ? `${selectedPrice} EGP` : '—'}
            </p>
          </div>
          <button
            onClick={() => {
              if (!isAuthenticated) {
                requireAuth()
                return
              }
              if (selectedSlot !== null) setIsReviewOpen(true)
            }}
            disabled={selectedSlot === null}
            className="flex-1 max-w-sm ml-auto bg-gradient-to-br from-secondary to-secondary-container text-white py-4 md:py-5 px-10 rounded-[2rem] font-extrabold text-lg md:text-xl flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-[0_15px_40px_-5px_rgba(253,139,0,0.35)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {selectedSlot !== null ? 'Confirm Booking' : 'Select a Slot'}
            <ArrowRight className="w-5 h-5 stroke-[3]" />
          </button>
        </div>
      </div>

      <ReviewModal
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        onComplete={handleReviewComplete}
      />
      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />
    </main>
  )
}

export default function BookingPage() {
  return (
    <Suspense
      fallback={
        <main className="w-full min-h-screen bg-surface px-5 py-12">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-lg font-bold text-primary">Loading booking page...</p>
          </div>
        </main>
      }
    >
      <BookingPageContent />
    </Suspense>
  )
}