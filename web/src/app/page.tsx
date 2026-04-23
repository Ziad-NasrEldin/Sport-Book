'use client'

import { useState } from 'react'
import { Bell, Map, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { CategoryCard } from '@/components/home/CategoryCard'
import { CourtCard } from '@/components/home/CourtCard'
import { DateSelector } from '@/components/home/DateSelector'
import { FloatingNav } from '@/components/layout/FloatingNav'
import { NotificationsModal } from '@/components/modals/NotificationsModal'
import { useApiCall } from '@/lib/api/hooks'
import { APIErrorFallback } from '@/components/ui/ErrorBoundary'
import { SkeletonStat } from '@/components/ui/SkeletonLoader'

function asArray<T>(value: T[] | null | undefined): T[] {
  return Array.isArray(value) ? value : []
}

export default function Home() {
  const router = useRouter()
  const { data: categoriesResponse, loading: categoriesLoading, error: categoriesError } = useApiCall('/player/categories')
  const { data: courtsResponse, loading: courtsLoading, error: courtsError } = useApiCall('/player/courts/nearby')
  const { data: notificationsResponse } = useApiCall('/player/notifications/unread-count')

  const categoriesData = asArray(categoriesResponse)
  const courtsData = asArray(courtsResponse?.items)
  const unreadCount = notificationsResponse?.count || 0

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)

  if (categoriesError || courtsError) {
    return <APIErrorFallback error={categoriesError || courtsError as any} onRetry={() => window.location.reload()} />
  }

  return (
    <main className="w-full flex-1 pb-[calc(8.5rem+env(safe-area-inset-bottom))] md:pb-[11rem]">
      {/* Header Top Bar */}
      <header className="px-5 pt-12 pb-6 flex items-center justify-between md:px-10 md:pt-10 md:pb-8 lg:px-14 opacity-0 animate-soft-drop">
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
              <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 bg-secondary-container text-primary text-[10px] rounded-full border border-surface font-black inline-flex items-center justify-center animate-badge-pop">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Category Section */}
      <section className="mb-10 md:mb-12 opacity-0 animate-soft-rise animation-delay-75">
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
        {categoriesLoading ? (
          <SkeletonStat />
        ) : (
          <div className="flex overflow-x-auto snap-x hide-scrollbar px-5 gap-4 pb-4 md:px-10 md:grid md:grid-cols-3 md:overflow-visible md:snap-none lg:px-14">
            {categoriesData.slice(0, 3).map((category: any, idx: number) => (
              <div
                key={category.id}
                className="opacity-0 animate-card-stagger"
                style={{ animationDelay: `${90 + idx * 80}ms` }}
              >
                <CategoryCard
                  title={category.name}
                  courtsCount={category.courtsCount || 0}
                  color={category.color || 'bg-primary-container text-white'}
                  href={`/courts?sport=${category.name}`}
                />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Date Selector component added between categories and courts */}
      <div className="opacity-0 animate-soft-rise animation-delay-150">
        <DateSelector />
      </div>

      {/* Courts Nearby Section */}
      <section className="px-5 md:px-10 lg:px-14 opacity-0 animate-soft-rise animation-delay-200">
        <div className="flex items-end justify-between mb-6 md:mb-7">
          <h2 className="text-xl font-bold text-primary md:text-[32px]">Courts Nearby</h2>
          <button onClick={() => router.push('/courts')} className="text-secondary-container font-lexend text-[10px] uppercase font-bold tracking-wider flex items-center gap-1 hover:text-secondary transition-colors pb-0.5 md:text-xs md:gap-2">
            View Map <Map className="w-3 h-3 stroke-[2.5]" />
          </button>
        </div>

        <div className="flex flex-col gap-6 md:grid md:grid-cols-2 md:gap-7">
          {courtsLoading ? (
            <SkeletonStat />
          ) : courtsData.slice(0, 2).map((court: any, idx: number) => (
            <div
              key={court.id}
              className="opacity-0 animate-card-stagger"
              style={{ animationDelay: `${180 + idx * 110}ms` }}
            >
              <CourtCard
                title={court.title || court.name}
                image={court.image}
                rating={court.rating || 0}
                distance={`${court.distance || 0} km away`}
                location={court.location}
                price={court.price || 0}
                status={court.status || 'AVAILABLE'}
                type={court.type || `${court.sportLabel || 'TENNIS'} • ${court.surface || 'HARD COURT'}`}
              />
            </div>
          ))}
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
