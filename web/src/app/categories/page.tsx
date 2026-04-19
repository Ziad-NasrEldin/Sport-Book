'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowUpRight, Trophy, Sparkles, Loader2 } from 'lucide-react'
import { FloatingNav } from '@/components/layout/FloatingNav'
import { useApiCall } from '@/lib/api/hooks'
import { APIErrorFallback } from '@/components/ui/ErrorBoundary'

const toneMap: Record<string, string> = {
  Tennis: 'from-[#002366] to-[#153e8d]',
  Padel: 'from-[#fd8b00] to-[#d36a00]',
  Squash: 'from-[#1e2b56] to-[#00113a]',
  Football: 'from-[#14532d] to-[#0f3f24]',
  Basketball: 'from-[#7c2d12] to-[#9a3412]',
  Badminton: 'from-[#1e3a8a] to-[#1d4ed8]',
}

const defaultTone = 'from-[#1e3a8a] to-[#3b82f6]'

export default function CategoriesPage() {
  const router = useRouter()
  const { data: sportsData, loading, error } = useApiCall('/sports')
  const sports: any[] = Array.isArray(sportsData) ? sportsData : (Array.isArray(sportsData?.data) ? sportsData.data : [])

  if (error) {
    return (
      <main className="w-full min-h-screen bg-surface flex items-center justify-center px-5">
        <APIErrorFallback error={error} onRetry={() => window.location.reload()} />
      </main>
    )
  }

  const totalCourts = sports.reduce((sum: number, s: any) => sum + (s.courts || s.courtCount || 0), 0)
  const minPrice = sports.length > 0
    ? Math.min(...sports.map((s: any) => s.fromPrice || s.minPrice || s.pricePerHour || Infinity))
    : 0

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back()
      return
    }

    router.push('/')
  }

  return (
    <main className="w-full min-h-screen bg-surface pb-[calc(8.5rem+env(safe-area-inset-bottom))] md:pb-[11rem] relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-20 -left-10 h-72 w-72 rounded-full bg-primary-container/12 blur-[100px]" />
        <div className="absolute bottom-8 -right-14 h-80 w-80 rounded-full bg-secondary-container/20 blur-[120px]" />
      </div>

      <header className="sticky top-0 z-40 bg-surface/85 backdrop-blur-xl px-5 pt-6 pb-4 md:px-10 lg:px-14 md:pt-8 md:pb-5">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handleBack}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-container-high hover:bg-surface-container-low transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5 text-primary stroke-[2.5]" />
          </button>

          <div>
            <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-primary">All Categories</h1>
            <p className="text-sm md:text-base text-primary/60">Browse sports categories and discover available courts</p>
          </div>
        </div>
      </header>

      {loading ? (
        <section className="px-5 md:px-10 lg:px-14 md:max-w-5xl md:mx-auto py-12 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </section>
      ) : (
        <section className="px-5 md:px-10 lg:px-14 md:max-w-5xl md:mx-auto space-y-6 md:space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-5">
            <article className="bg-surface-container-lowest rounded-[var(--radius-lg)] p-5 shadow-ambient">
              <div className="flex items-center justify-between mb-6">
                <span className="text-[10px] font-lexend font-bold uppercase tracking-[0.18em] text-primary/50">Sports</span>
                <Trophy className="w-5 h-5 text-primary-container" />
              </div>
              <p className="text-4xl font-black tracking-tight text-primary">{sports.length}</p>
            </article>

            <article className="bg-surface-container-lowest rounded-[var(--radius-lg)] p-5 shadow-ambient">
              <div className="flex items-center justify-between mb-6">
                <span className="text-[10px] font-lexend font-bold uppercase tracking-[0.18em] text-primary/50">Total Courts</span>
                <Sparkles className="w-5 h-5 text-secondary-container" />
              </div>
              <p className="text-4xl font-black tracking-tight text-primary">{totalCourts}</p>
            </article>

            <article className="bg-surface-container-lowest rounded-[var(--radius-lg)] p-5 shadow-ambient">
              <div className="flex items-center justify-between mb-6">
                <span className="text-[10px] font-lexend font-bold uppercase tracking-[0.18em] text-primary/50">Starting From</span>
                <span className="text-xs font-lexend font-bold uppercase tracking-widest text-secondary-container">EGP</span>
              </div>
              <p className="text-4xl font-black tracking-tight text-primary">{minPrice === Infinity ? 0 : minPrice}</p>
            </article>
          </div>

          <section className="space-y-4 md:space-y-5">
            <h2 className="text-xl md:text-3xl font-extrabold tracking-tight text-primary">Choose Your Sport</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
              {sports.map((category: any) => (
                <Link
                  key={category.id || category.name}
                  href={`/courts?sport=${encodeURIComponent(category.name)}`}
                  className={`group relative min-h-[210px] rounded-[var(--radius-lg)] overflow-hidden bg-gradient-to-br ${toneMap[category.name] || defaultTone} p-5 md:p-6 shadow-ambient text-white flex flex-col justify-between`}
                >
                  <div>
                    <h3 className="text-2xl md:text-3xl font-black tracking-tight">{category.name}</h3>
                    <p className="mt-2 text-xs font-lexend uppercase tracking-widest text-white/70">{category.courts || category.courtCount || 0} Courts Available</p>
                  </div>

                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-[10px] font-lexend uppercase tracking-widest text-white/70">From</p>
                      <p className="text-xl font-extrabold">{category.fromPrice || category.minPrice || category.pricePerHour || 0} EGP/hr</p>
                    </div>

                    <span className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                      <ArrowUpRight className="w-5 h-5" />
                    </span>
                  </div>

                  <div className="absolute -right-8 -bottom-8 h-24 w-24 rounded-full border-[12px] border-white/15" />
                </Link>
              ))}
            </div>
          </section>
        </section>
      )}

      <FloatingNav />
    </main>
  )
}