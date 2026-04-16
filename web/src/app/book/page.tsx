'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Bell, MapPin, Grid, Sun, ParkingCircle, ShowerHead, Star, Check, ArrowRight } from 'lucide-react'
import { ReviewModal } from '@/components/modals/ReviewModal'
import { NotificationsModal } from '@/components/modals/NotificationsModal'
import {
  NOTIFICATIONS_UPDATED_EVENT,
  getUnreadInAppNotificationsCount,
} from '@/lib/notifications'
import { ACTIVE_USER_UPDATED_EVENT, getActiveUserId } from '@/lib/teams'

const UNAVAILABLE = new Set([2, 14])
const BOOKED = new Set([18, 19])

const SLOT_PRICE: Record<string, number> = {
  night: 40,
  morning: 50,
  afternoon: 60,
  evening: 70,
}

function getSlotPeriod(h: number): string {
  if (h < 7) return 'night'
  if (h < 11) return 'morning'
  if (h < 16) return 'afternoon'
  return 'evening'
}

export default function BookingPage() {
  const router = useRouter()
  const [isReviewOpen, setIsReviewOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null)
  const [unreadCount, setUnreadCount] = useState(() => {
    if (typeof window === 'undefined') return 0
    return getUnreadInAppNotificationsCount(getActiveUserId())
  })

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

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back()
      return
    }

    router.push('/')
  }

  const handleReviewComplete = () => {
    setIsReviewOpen(false)
    router.push('/checkout')
  }

  return (
    <main className="w-full bg-surface min-h-screen pb-48 relative">
      {/* Background Decoration */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-[10%] -left-[5%] w-[40%] h-[40%] bg-primary-container/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[10%] -right-[5%] w-[30%] h-[30%] bg-tertiary-fixed/10 rounded-full blur-[100px]" />
      </div>

      {/* Top Navigation */}
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
            The Regent&apos;s Park Tennis Court
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
        {/* Court Gallery Hero */}
        <section className="relative w-full aspect-[16/10] sm:aspect-video overflow-hidden md:rounded-[2rem] md:mt-4 md:shadow-ambient">
          <Image
            src="https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=1200&q=80"
            alt="The Regent's Park Tennis Court"
            fill
            className="object-cover object-center"
            priority
          />
          {/* Bottom Gradient overlay for text */}
          <div className="absolute inset-x-0 bottom-0 p-6 md:p-8 bg-gradient-to-t from-primary/90 via-primary/40 to-transparent">
            <div className="flex justify-between items-end">
              <div className="space-y-1.5 md:space-y-3">
                <span className="inline-flex items-center gap-1 bg-tertiary-fixed text-primary px-3 py-1 rounded-full text-xs font-bold font-sans tracking-wide">
                  <Star className="w-3 h-3 fill-primary" />
                  4.8
                </span>
                <h2 className="text-3xl font-extrabold text-white leading-none md:text-5xl">
                  The Regent&apos;s Park
                </h2>
                <div className="flex items-center gap-2 text-white/80 pb-2">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm font-medium md:text-base">
                    1.2 km away • London, UK
                  </span>
                </div>
              </div>
              
              <div className="hidden md:block">
                <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/10 shadow-sm">
                  <p className="text-white/60 text-xs font-lexend uppercase font-bold tracking-widest mb-1">
                    Starting from
                  </p>
                  <p className="text-3xl font-bold text-white font-lexend group">
                    400 EGP<span className="text-sm font-normal text-white/60 ml-1 font-sans">/hr</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="px-5 py-8 space-y-10 md:px-0 md:py-10 md:space-y-12">
          {/* Bento Stats & Info */}
          <section className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
            <div className="p-5 bg-surface-container-lowest shadow-ambient rounded-[1.5rem] space-y-2 flex flex-col items-center text-center justify-center aspect-square md:aspect-auto md:p-6 md:items-start md:text-left">
              <Grid className="text-primary-container w-6 h-6 mb-1 md:w-8 md:h-8" />
              <p className="text-[10px] text-primary/50 font-lexend uppercase font-bold tracking-[0.15em] md:text-xs">
                Surface
              </p>
              <p className="font-bold text-primary text-sm md:text-lg">Hard Court</p>
            </div>
            
            <div className="p-5 bg-surface-container-lowest shadow-ambient rounded-[1.5rem] space-y-2 flex flex-col items-center text-center justify-center aspect-square md:aspect-auto md:p-6 md:items-start md:text-left">
              <Sun className="text-primary-container w-6 h-6 mb-1 md:w-8 md:h-8" />
              <p className="text-[10px] text-primary/50 font-lexend uppercase font-bold tracking-[0.15em] md:text-xs">
                Lighting
              </p>
              <p className="font-bold text-primary text-sm md:text-lg">Full LED</p>
            </div>
            
            <div className="p-5 bg-surface-container-lowest shadow-ambient rounded-[1.5rem] space-y-2 flex flex-col items-center text-center justify-center aspect-square md:aspect-auto md:p-6 md:items-start md:text-left">
              <ParkingCircle className="text-primary-container w-6 h-6 mb-1 md:w-8 md:h-8" />
              <p className="text-[10px] text-primary/50 font-lexend uppercase font-bold tracking-[0.15em] md:text-xs">
                Parking
              </p>
              <p className="font-bold text-primary text-sm md:text-lg">Available</p>
            </div>
            
            <div className="p-5 bg-surface-container-lowest shadow-ambient rounded-[1.5rem] space-y-2 flex flex-col items-center text-center justify-center aspect-square md:aspect-auto md:p-6 md:items-start md:text-left">
              <ShowerHead className="text-primary-container w-6 h-6 mb-1 md:w-8 md:h-8" />
              <p className="text-[10px] text-primary/50 font-lexend uppercase font-bold tracking-[0.15em] md:text-xs">
                Amenities
              </p>
              <p className="font-bold text-primary text-sm md:text-lg">Showers</p>
            </div>
          </section>

          {/* Select Time Slot */}
          <section className="space-y-6">
            <h3 className="text-xl font-extrabold text-primary md:text-[28px]">
              Select Time Slot
            </h3>
            
            {/* Time Slot Grid */}
            <div className="space-y-6">
              <div className="grid grid-cols-8 gap-2 md:gap-3">
                {/* Generated 0 to 23 with matching colors from HTML */}
                {[
                  { h: 0, c: "bg-[#6366f1]" }, { h: 1, c: "bg-[#6366f1]" }, { h: 2, c: "bg-[#6366f1]" }, { h: 3, c: "bg-[#6366f1]" },
                  { h: 4, c: "bg-[#6366f1]" }, { h: 5, c: "bg-[#6366f1]" }, { h: 6, c: "bg-[#6366f1]" },
                  
                  { h: 7, c: "bg-[#f59e0b]" }, { h: 8, c: "bg-[#f59e0b]" }, { h: 9, c: "bg-[#f59e0b]" }, { h: 10, c: "bg-[#f59e0b]" },
                  
                  { h: 11, c: "bg-[#10b981]" }, { h: 12, c: "bg-[#10b981]" }, { h: 13, c: "bg-[#10b981]" }, { h: 14, c: "bg-[#10b981]" },
                  { h: 15, c: "bg-[#10b981]" },
                  
                  { h: 16, c: "bg-[#ef4444]" }, { h: 17, c: "bg-[#ef4444]" }, { h: 18, c: "bg-[#ef4444]" }, { h: 19, c: "bg-[#ef4444]" },
                  { h: 20, c: "bg-[#ef4444]" }, { h: 21, c: "bg-[#ef4444]" }, { h: 22, c: "bg-[#ef4444]" }, { h: 23, c: "bg-[#ef4444]" }
                ].map((slot) => {
                  const isUnavailable = UNAVAILABLE.has(slot.h)
                  const isBooked = BOOKED.has(slot.h)
                  const isSelected = selectedSlot === slot.h
                  const isSelectable = !isUnavailable && !isBooked

                  let boxColor = 'bg-[#10b981]'
                  if (isUnavailable) boxColor = 'bg-[#d1d5db]'
                  if (isBooked) boxColor = 'bg-[#ef4444]'

                  return (
                    <button
                      key={slot.h}
                      type="button"
                      disabled={!isSelectable}
                      onClick={() => isSelectable && setSelectedSlot(isSelected ? null : slot.h)}
                      aria-label={`${isUnavailable ? 'Unavailable' : isBooked ? 'Booked' : 'Select'} slot at ${slot.h}:00`}
                      aria-pressed={isSelected}
                      className={`flex flex-col gap-[3px] transition-transform ${isSelectable ? 'active:scale-95 cursor-pointer' : 'cursor-not-allowed opacity-70'} ${isSelected ? 'scale-105' : ''}`}
                    >
                      <div className={`h-10 sm:h-12 md:h-14 ${slot.c} rounded-md flex items-center justify-center text-white font-bold font-lexend text-xs sm:text-sm shadow-sm ${isSelected ? 'ring-2 ring-white ring-offset-1' : ''}`}>
                        {slot.h}
                      </div>
                      <div className={`h-8 sm:h-10 md:h-12 ${boxColor} rounded-md shadow-sm ${isSelected ? 'ring-2 ring-white ring-offset-1' : ''}`} />
                    </button>
                  )
                })}
              </div>

              {/* Legend */}
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

              {/* Price Key */}
              <div className="bg-surface-container-low p-4 md:p-6 rounded-[1.5rem] flex flex-wrap items-center justify-center gap-3">
                <span className="px-5 py-2.5 bg-[#6366f1] text-white rounded-full text-[11px] md:text-sm font-bold font-lexend shadow-sm">Night: 40 EGP/hr</span>
                <span className="px-5 py-2.5 bg-[#f59e0b] text-white rounded-full text-[11px] md:text-sm font-bold font-lexend shadow-sm">Morning: 50 EGP/hr</span>
                <span className="px-5 py-2.5 bg-[#10b981] text-white rounded-full text-[11px] md:text-sm font-bold font-lexend shadow-sm">Afternoon: 60 EGP/hr</span>
                <span className="px-5 py-2.5 bg-[#ef4444] text-white rounded-full text-[11px] md:text-sm font-bold font-lexend shadow-sm">Evening: 70 EGP/hr</span>
              </div>
            </div>
          </section>

          {/* Rules Section */}
          <section className="bg-primary text-white rounded-[1.5rem] md:rounded-[2rem] p-7 md:p-10 space-y-6 overflow-hidden relative shadow-lg">
            <div className="absolute -right-12 -top-12 w-64 h-64 bg-tertiary-fixed/10 rounded-full blur-3xl pointer-events-none" />
            
            <h3 className="text-xl md:text-2xl font-extrabold flex items-center gap-2">
              Rules to Follow
            </h3>
            
            <ul className="space-y-5">
              <li className="flex items-start gap-4">
                <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 text-tertiary-fixed">
                  <Check className="w-4 h-4 stroke-[3]" />
                </span>
                <p className="text-white/80 text-sm md:text-base leading-relaxed pt-1 font-medium">
                  Non-marking shoes only - Keep our professional surface pristine.
                </p>
              </li>
              <li className="flex items-start gap-4">
                <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 text-tertiary-fixed">
                  <Check className="w-4 h-4 stroke-[3]" />
                </span>
                <p className="text-white/80 text-sm md:text-base leading-relaxed pt-1 font-medium">
                  Max 4 players per court booking at any time.
                </p>
              </li>
              <li className="flex items-start gap-4">
                <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 text-tertiary-fixed">
                  <Check className="w-4 h-4 stroke-[3]" />
                </span>
                <p className="text-white/80 text-sm md:text-base leading-relaxed pt-1 font-medium">
                  Cancel 24h before your time slot for a full refund.
                </p>
              </li>
            </ul>
          </section>
        </div>
      </div>

      {/* Sticky Call to Action Wrapper */}
      <div className="fixed bottom-0 left-0 right-0 p-5 md:p-8 bg-surface/80 backdrop-blur-xl z-50">
        <div className="w-full max-w-[1200px] mx-auto flex items-center justify-between gap-6 md:px-14">
          <div className="hidden sm:block">
            <p className="text-xs font-lexend font-bold text-primary/50 uppercase tracking-widest mb-1.5">
              {selectedSlot !== null ? `Slot ${selectedSlot}:00 – ${selectedSlot + 1}:00` : 'No slot selected'}
            </p>
            <p className="text-3xl font-black font-lexend text-primary">
              {selectedSlot !== null ? `${SLOT_PRICE[getSlotPeriod(selectedSlot)]} EGP` : '—'}
            </p>
          </div>
          <button
            onClick={() => selectedSlot !== null && setIsReviewOpen(true)}
            disabled={selectedSlot === null}
            className="flex-1 max-w-sm ml-auto bg-gradient-to-br from-secondary to-secondary-container text-white py-4 md:py-5 px-10 rounded-[2rem] font-extrabold text-lg md:text-xl flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-[0_15px_40px_-5px_rgba(253,139,0,0.35)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {selectedSlot !== null ? 'Confirm Booking' : 'Select a Slot'}
            <ArrowRight className="w-5 h-5 stroke-[3]" />
          </button>
        </div>
      </div>

      {/* Embedded Review Modal */}
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
