'use client'

import { useEffect, useState } from 'react'
import { Bell, Map, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { CategoryCard } from '@/components/home/CategoryCard'
import { CourtCard } from '@/components/home/CourtCard'
import { DateSelector } from '@/components/home/DateSelector'
import { FloatingNav } from '@/components/layout/FloatingNav'
import { NotificationsModal } from '@/components/modals/NotificationsModal'
import {
  NOTIFICATIONS_UPDATED_EVENT,
  getUnreadInAppNotificationsCount,
} from '@/lib/notifications'
import { ACTIVE_USER_UPDATED_EVENT, getActiveUserId } from '@/lib/teams'
import { hasCompletedOnboarding } from '@/lib/onboarding'

export default function Home() {
  const router = useRouter()
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [isOnboardingGateReady, setIsOnboardingGateReady] = useState(false)
  const [unreadCount, setUnreadCount] = useState(() =>
    getUnreadInAppNotificationsCount(getActiveUserId()),
  )

  useEffect(() => {
    if (!hasCompletedOnboarding()) {
      router.replace('/onboarding')
      return
    }

    setIsOnboardingGateReady(true)
  }, [router])

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

  if (!isOnboardingGateReady) {
    return <main className="w-full flex-1 min-h-screen bg-surface" />
  }

  return (
    <main className="w-full flex-1 pb-[calc(8.5rem+env(safe-area-inset-bottom))] md:pb-[11rem]">
      {/* Header Top Bar */}
      <header className="px-5 pt-12 pb-6 flex items-center justify-between md:px-10 md:pt-10 md:pb-8 lg:px-14">
        <h1 className="text-[28px] font-extrabold tracking-tight text-primary leading-none md:text-[40px]">
          Court Advantage
        </h1>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsNotificationsOpen(true)}
            className="relative p-2 text-primary hover:bg-black/5 rounded-full transition-colors"
            aria-label="Open notifications"
          >
            <Bell className="w-6 h-6 stroke-[2]" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 bg-secondary-container text-primary text-[10px] rounded-full border border-surface font-black inline-flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Category Section */}
      <section className="mb-10 md:mb-12">
        <div className="px-5 pt-2 flex items-end justify-between mb-4 md:px-10 md:mb-5 lg:px-14">
          <div>
            <h2 className="text-xl font-bold text-primary mb-1 md:text-[32px] md:mb-2">Choose Category</h2>
            <p className="text-primary/60 text-sm md:text-base">Select your favorite sport</p>
          </div>
          <Link
            href="/categories"
            className="text-secondary-container font-lexend text-[10px] uppercase font-bold tracking-wider flex items-center gap-1 hover:text-secondary transition-colors mb-1 pr-1 md:text-xs md:gap-2"
          >
            VIEW ALL <ChevronRight className="w-3 h-3 stroke-[3]" />
          </Link>
        </div>

        {/* Scrollable Categories - horizontal snap */}
        <div className="flex overflow-x-auto snap-x hide-scrollbar px-5 gap-4 pb-4 md:px-10 md:grid md:grid-cols-3 md:overflow-visible md:snap-none lg:px-14">
          <CategoryCard
            title="Tennis"
            courtsCount={124}
            color="bg-primary-container text-white"
            href="/courts?sport=Tennis"
          />
          <CategoryCard
            title="Padel"
            courtsCount={48}
            color="bg-secondary-container text-primary"
            href="/courts?sport=Padel"
          />
          <CategoryCard
            title="Squash"
            courtsCount={32}
            color="bg-primary hover:bg-primary/90 text-white"
            href="/courts?sport=Squash"
          />
        </div>
      </section>

      {/* Date Selector component added between categories and courts */}
      <DateSelector />

      {/* Courts Nearby Section */}
      <section className="px-5 md:px-10 lg:px-14">
        <div className="flex items-end justify-between mb-6 md:mb-7">
          <h2 className="text-xl font-bold text-primary md:text-[32px]">Courts Nearby</h2>
          <button className="text-secondary-container font-lexend text-[10px] uppercase font-bold tracking-wider flex items-center gap-1 hover:text-secondary transition-colors pb-0.5 md:text-xs md:gap-2">
            View Map <Map className="w-3 h-3 stroke-[2.5]" />
          </button>
        </div>

        <div className="flex flex-col gap-6 md:grid md:grid-cols-2 md:gap-7">
          {/* Card 1 */}
          <CourtCard
            title="The Regent's Park"
            image="https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=800&q=80"
            rating={4.8}
            distance="1.2 km away"
            location="London NW1"
            price={500}
            status="AVAILABLE"
            type="TENNIS • HARD COURT"
          />

          {/* Card 2 */}
          <CourtCard
            title="Elite Padel Club"
            image="https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=800&q=80"
            rating={4.9}
            distance="2.5 km away"
            location="Chelsea, London"
            price={850}
            status="BUSY"
            type="PADEL • PANORAMIC"
          />
        </div>

        <div className="mt-5 md:mt-6 flex justify-center">
          <Link
            href="/courts"
            className="inline-flex items-center gap-1.5 text-secondary-container font-lexend text-xs uppercase font-bold tracking-wider hover:text-secondary transition-colors"
          >
            View All Courts
            <ChevronRight className="w-3.5 h-3.5 stroke-[3]" />
          </Link>
        </div>
      </section>

      <FloatingNav />
      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />
    </main>
  )
}

