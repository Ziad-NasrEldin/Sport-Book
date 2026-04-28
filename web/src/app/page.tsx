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
import { useApiCall } from '@/lib/api/hooks'
import { APIErrorFallback } from '@/components/ui/ErrorBoundary'
import { SkeletonStat } from '@/components/ui/SkeletonLoader'
import { useInView } from '@/lib/useInView'

function asArray<T>(value: T[] | null | undefined): T[] {
  return Array.isArray(value) ? value : []
}

function AnimatedSection({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const { ref, inView } = useInView({ once: true })
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(24px)',
        transition: `opacity 0.6s cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms, transform 0.6s cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  )
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
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 50)
    return () => clearTimeout(timer)
  }, [])

  if (categoriesError || courtsError) {
    return <APIErrorFallback error={categoriesError || courtsError as any} onRetry={() => window.location.reload()} />
  }

  return (
    <main className="w-full flex-1 pb-[calc(8.5rem+env(safe-area-inset-bottom))] md:pb-0">
      {/* Compact hero */}
      <header className="bg-[#0a1631] relative overflow-hidden">
        {/* Subtle animated background gradient */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-[#c3f400]/5 blur-[80px] animate-float-blob" />
        </div>

        <div className="px-5 py-6 md:px-8 md:py-8 max-w-[1440px] mx-auto flex items-end justify-between gap-4 relative z-10">
          <div>
            <p
              className="text-[#c3f400] text-[10px] font-black uppercase tracking-[0.2em] mb-1"
              style={{
                opacity: mounted ? 1 : 0,
                transform: mounted ? 'translateY(0)' : 'translateY(12px)',
                transition: 'opacity 0.5s cubic-bezier(0.22, 1, 0.36, 1), transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)',
              }}
            >
              Court Advantage
            </p>
            <h1
              className="text-4xl md:text-5xl font-black tracking-tight text-white"
              style={{
                opacity: mounted ? 1 : 0,
                transform: mounted ? 'translateY(0)' : 'translateY(20px)',
                transition: 'opacity 0.6s cubic-bezier(0.22, 1, 0.36, 1) 100ms, transform 0.6s cubic-bezier(0.22, 1, 0.36, 1) 100ms',
              }}
            >
              PLAY
            </h1>
            <p
              className="text-white/50 text-sm mt-1 max-w-sm"
              style={{
                opacity: mounted ? 1 : 0,
                transform: mounted ? 'translateY(0)' : 'translateY(16px)',
                transition: 'opacity 0.6s cubic-bezier(0.22, 1, 0.36, 1) 200ms, transform 0.6s cubic-bezier(0.22, 1, 0.36, 1) 200ms',
              }}
            >
              Book courts, join teams, find coaches.
            </p>
          </div>
          <button
            onClick={() => setIsNotificationsOpen(true)}
            className={`relative w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-[#c3f400] hover:text-[#0a1631] transition-all duration-200 hover:scale-105 active:scale-95 ${unreadCount > 0 ? 'animate-glow-pulse' : ''}`}
            style={{
              opacity: mounted ? 1 : 0,
              transform: mounted ? 'scale(1)' : 'scale(0.8)',
              transition: 'opacity 0.5s cubic-bezier(0.22, 1, 0.36, 1) 300ms, transform 0.5s cubic-bezier(0.22, 1, 0.36, 1) 300ms, background-color 200ms, color 200ms',
            }}
          >
            <Bell className={`w-4 h-4 ${unreadCount > 0 ? 'animate-bell-ring' : ''}`} />
            {unreadCount > 0 && (
              <span
                className="absolute -top-1 -right-1 w-4 h-4 bg-[#c3f400] text-[#0a1631] text-[9px] font-black flex items-center justify-center rounded-full animate-badge-pop"
                style={{ animationDelay: '500ms' }}
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Categories */}
      <AnimatedSection>
        <section className="px-5 pt-4 pb-2 md:px-8 max-w-[1440px] mx-auto">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-black text-primary">Categories</h2>
            <Link
              href="/categories"
              className="group text-primary/50 font-bold text-[11px] uppercase tracking-wide flex items-center gap-0.5 hover:text-[#0a1631] transition-colors"
            >
              View All
              <ChevronRight className="w-3 h-3 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
          </div>
          {categoriesLoading ? (
            <SkeletonStat />
          ) : (
            <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-3">
              {categoriesData.slice(0, 4).map((category: any, i: number) => (
                <div
                  key={category.id}
                  style={{
                    opacity: mounted ? 1 : 0,
                    transform: mounted ? 'translateY(0) scale(1)' : 'translateY(28px) scale(0.92)',
                    transition: `opacity 0.6s cubic-bezier(0.22, 1, 0.36, 1) ${350 + i * 90}ms, transform 0.6s cubic-bezier(0.22, 1, 0.36, 1) ${350 + i * 90}ms`,
                  }}
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
      </AnimatedSection>

      {/* Date Selector */}
      <AnimatedSection delay={100}>
        <section className="px-5 py-3 md:px-8 max-w-[1440px] mx-auto">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-black text-primary">Schedule</h2>
            <button className="text-primary/40 font-bold text-[11px] uppercase tracking-wide hover:text-[#0a1631] transition-colors">See All</button>
          </div>
          <DateSelector />
        </section>
      </AnimatedSection>

      {/* Courts */}
      <AnimatedSection delay={150}>
        <section className="px-5 pt-2 pb-8 md:px-8 max-w-[1440px] mx-auto">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-black text-primary">Nearby Courts</h2>
            <button
              onClick={() => router.push('/courts')}
              className="group text-primary/50 font-bold text-[11px] uppercase tracking-wide flex items-center gap-0.5 hover:text-[#0a1631] transition-colors"
            >
              View Map
              <Map className="w-3 h-3 transition-transform duration-200 group-hover:translate-x-0.5" />
            </button>
          </div>

          <div className="flex flex-col gap-4 md:grid md:grid-cols-2">
            {courtsLoading ? (
              <SkeletonStat />
            ) : courtsData.slice(0, 2).map((court: any, i: number) => (
              <div
                key={court.id}
                style={{
                  opacity: mounted ? 1 : 0,
                  transform: mounted ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.98)',
                  transition: `opacity 0.6s cubic-bezier(0.22, 1, 0.36, 1) ${450 + i * 120}ms, transform 0.6s cubic-bezier(0.22, 1, 0.36, 1) ${450 + i * 120}ms`,
                }}
              >
                <CourtCard
                  title={court.title || court.name}
                  image={court.image}
                  rating={court.rating || 0}
                  distance={`${court.distance || 0} km`}
                  location={court.location}
                  price={court.price || 0}
                  status={court.status || 'AVAILABLE'}
                  type={court.type || `${court.sportLabel || 'TENNIS'} • ${court.surface || 'HARD'}`}
                />
              </div>
            ))}
          </div>

          <div
            className="mt-4"
            style={{
              opacity: mounted ? 1 : 0,
              transform: mounted ? 'translateY(0)' : 'translateY(12px)',
              transition: 'opacity 0.5s cubic-bezier(0.22, 1, 0.36, 1) 700ms, transform 0.5s cubic-bezier(0.22, 1, 0.36, 1) 700ms',
            }}
          >
            <Link
              href="/courts"
              className="group inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#0a1631] text-white font-bold text-xs uppercase tracking-wide hover:bg-[#c3f400] hover:text-[#0a1631] transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] hover:shadow-[0_8px_20px_-6px_rgba(195,244,0,0.4)]"
            >
              View All Courts
              <ChevronRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
          </div>
        </section>
      </AnimatedSection>

      <FloatingNav />
      <NotificationsModal isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} />
    </main>
  )
}
