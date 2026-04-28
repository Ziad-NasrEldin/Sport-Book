'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowLeft,
  Medal,
  Clock3,
  Search,
  ChevronDown,
  ChevronUp,
  Heart,
  ArrowRight,
  Star,
} from 'lucide-react'
import { FloatingNav } from '@/components/layout/FloatingNav'
import { useApiCall } from '@/lib/api/hooks'
import { APIErrorFallback } from '@/components/ui/ErrorBoundary'
import { SkeletonStat } from '@/components/ui/SkeletonLoader'
import {
  FAVORITES_UPDATED_EVENT,
  getFavorites,
  toggleCoachFavorite,
} from '@/lib/favorites'
import type { PublicCoachSummary } from '@/lib/coach/types'

export default function CoachesPage() {
  const { data: coachesResponse, loading, error, refetch } = useApiCall('/coaches')

  const [searchQuery, setSearchQuery] = useState('')
  const [activeSport, setActiveSport] = useState('All')
  const [minExperience, setMinExperience] = useState(0)
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)
  const [favoriteCoachSlugs, setFavoriteCoachSlugs] = useState<string[]>(() => {
    if (typeof window === 'undefined') return []
    return getFavorites().coaches.map((coach) => coach.slug)
  })

  useEffect(() => {
    const refreshFavorites = () => {
      setFavoriteCoachSlugs(getFavorites().coaches.map((coach) => coach.slug))
    }

    refreshFavorites()
    window.addEventListener(FAVORITES_UPDATED_EVENT, refreshFavorites)
    return () => {
      window.removeEventListener(FAVORITES_UPDATED_EVENT, refreshFavorites)
    }
  }, [])

  const coachesData: any[] = Array.isArray(coachesResponse)
    ? coachesResponse
    : Array.isArray((coachesResponse as any)?.items)
      ? (coachesResponse as any).items
      : Array.isArray((coachesResponse as any)?.data)
        ? (coachesResponse as any).data
        : []

  const sportLabel = (sport: any): string => typeof sport === 'string' ? sport : (sport?.displayName || sport?.name || '')

  const sports = useMemo(() => ['All', ...new Set(coachesData.map((coach: any) => sportLabel(coach.sport)).filter(Boolean))], [coachesData])

  const filteredCoaches = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()

    return coachesData.filter((coach: any) => {
      const sportName = sportLabel(coach.sport)
      const matchesSearch =
        query.length === 0 ||
        coach.name.toLowerCase().includes(query) ||
        sportName.toLowerCase().includes(query)
      const matchesSport = activeSport === 'All' || sportName === activeSport
      const matchesExperience = coach.experienceYears >= minExperience

      return matchesSearch && matchesSport && matchesExperience
    })
  }, [searchQuery, activeSport, minExperience, coachesData])

  if (error) {
    return <APIErrorFallback error={error} onRetry={refetch} />
  }

  const getCoachRating = (experienceYears: number) => {
    return Math.min(5, Number((4.4 + experienceYears / 20).toFixed(1)))
  }

  const handleToggleCoachFavorite = (coach: PublicCoachSummary) => {
    toggleCoachFavorite({
      slug: coach.slug,
      name: coach.name,
      specialty: coach.bio,
      sessions: coach.experienceYears * 4,
      rating: getCoachRating(coach.experienceYears),
      avatar: coach.image,
    })
    setFavoriteCoachSlugs(getFavorites().coaches.map((entry) => entry.slug))
  }

  return (
    <main className="w-full min-h-screen bg-surface pb-[calc(8.5rem+env(safe-area-inset-bottom))] md:pb-[11rem] relative overflow-hidden">
      {/* Geometric background */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: `repeating-linear-gradient(90deg, currentColor 0px, currentColor 1px, transparent 1px, transparent 80px), repeating-linear-gradient(0deg, currentColor 0px, currentColor 1px, transparent 1px, transparent 80px)`,
      }} />
      <div className="pointer-events-none absolute top-0 right-0 w-[500px] h-[500px] bg-[#c3f400]/6 blur-[120px] rounded-full -translate-y-1/3 translate-x-1/4" />

      {/* HERO */}
      <header className="relative bg-[#0a1631] overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-[#c3f400]" />

        <div className="relative max-w-[1440px] mx-auto px-5 pt-10 pb-8 md:px-8 md:pt-14 md:pb-10">
          <div className="flex items-center gap-4 pb-6">
            <Link
              href="/"
              className="w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-[#c3f400] hover:text-[#0a1631] transition-colors duration-200"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <p className="text-[#c3f400] text-xs font-black uppercase tracking-[0.3em]">Find Your Trainer</p>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight text-white">Coaches</h1>
            </div>
          </div>
          <p className="text-white/60 text-sm md:text-base max-w-xl leading-relaxed">
            Elite trainers across every sport. Book sessions, sharpen skills, and level up your game.
          </p>
        </div>
      </header>

      <section className="px-5 md:px-6 lg:px-8 max-w-[1440px] mx-auto space-y-4 md:space-y-6 py-5 md:py-8">
        {/* Search & Filters */}
        <article className="bg-surface-container-lowest rounded-[var(--radius-lg)] p-4 md:p-5 shadow-ambient space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-primary/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search coaches or sport..."
              className="w-full h-12 pl-11 pr-4 rounded-full border border-primary/10 bg-surface-container-low text-primary text-sm md:text-base outline-none focus:border-[#0a1631] focus:ring-2 focus:ring-[#0a1631]/10 transition-all"
            />
          </div>

          <div className="flex items-center justify-between md:hidden">
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-primary/40">Filters</p>
            <button
              type="button"
              onClick={() => setIsFiltersOpen((previous) => !previous)}
              aria-expanded={isFiltersOpen}
              aria-controls="coach-filters"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-surface-container-low text-primary text-[11px] font-black uppercase tracking-wide active:scale-95 transition-all"
            >
              {isFiltersOpen ? 'Hide' : 'Show'}
              {isFiltersOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          <div id="coach-filters" className={`space-y-4 ${isFiltersOpen ? 'block' : 'hidden'} md:block animate-fade-in`}>
            <div className="space-y-2">
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-primary/40">Sport</p>
              <div className="flex flex-wrap gap-2">
                {sports.map((sport) => {
                  const isActive = activeSport === sport

                  return (
                    <button
                      key={sport}
                      type="button"
                      onClick={() => setActiveSport(sport)}
                      className={`px-4 py-2 rounded-full text-[11px] font-black uppercase tracking-wide transition-all active:scale-95 ${
                        isActive
                          ? 'bg-[#0a1631] text-[#c3f400]'
                          : 'bg-surface-container-low text-primary/75 hover:bg-surface-container-high'
                      }`}
                    >
                      {sport}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-primary/40">Experience</p>
              <div className="flex flex-wrap gap-2">
                {[0, 5, 10].map((years) => {
                  const isActive = minExperience === years

                  return (
                    <button
                      key={years}
                      type="button"
                      onClick={() => setMinExperience(years)}
                      className={`px-4 py-2 rounded-full text-[11px] font-black uppercase tracking-wide transition-all active:scale-95 ${
                        isActive
                          ? 'bg-[#0a1631] text-[#c3f400]'
                          : 'bg-surface-container-low text-primary/75 hover:bg-surface-container-high'
                      }`}
                    >
                      {years === 0 ? 'Any' : `${years}+ Years`}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          <p className="text-xs md:text-sm text-primary/50 font-black uppercase tracking-wider">
            Showing {filteredCoaches.length} {filteredCoaches.length === 1 ? 'coach' : 'coaches'}
          </p>
        </article>

        {loading ? (
          <SkeletonStat />
        ) : filteredCoaches.map((coach, index) => (
          <article
            key={coach.slug}
            className="bg-surface-container-lowest rounded-[var(--radius-lg)] p-0 shadow-ambient overflow-hidden group hover:shadow-[0_16px_40px_-12px_rgba(10,22,49,0.15)] transition-all duration-300 animate-spring-in"
            style={{ animationDelay: `${Math.min(index * 75, 500)}ms` }}
          >
            <div className="flex flex-col sm:flex-row">
              {/* Image */}
              <div className="relative w-full sm:w-32 md:w-40 aspect-[16/10] sm:aspect-auto sm:min-h-[140px] shrink-0">
                <Image
                  src={coach.image}
                  alt={coach.name}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-[#0a1631]/10 sm:bg-transparent" />
              </div>

              <div className="flex-1 p-4 md:p-5 space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="text-lg md:text-2xl font-black text-primary truncate group-hover:text-[#0a1631] transition-colors">
                      {coach.name}
                    </h2>
                    <p className="text-sm text-primary/60 mt-1 line-clamp-2">{coach.bio}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleCoachFavorite(coach)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-150 active:scale-90 shrink-0 ${
                      favoriteCoachSlugs.includes(coach.slug)
                        ? 'bg-[#0a1631] text-[#c3f400]'
                        : 'bg-surface-container-low text-primary/50 hover:bg-[#0a1631] hover:text-white'
                    }`}
                    aria-label={favoriteCoachSlugs.includes(coach.slug) ? 'Remove coach from favorites' : 'Add coach to favorites'}
                  >
                    <Heart className={`w-4 h-4 ${favoriteCoachSlugs.includes(coach.slug) ? 'fill-[#c3f400]' : ''}`} />
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0a1631]/5 text-[11px] font-black uppercase tracking-wide text-primary/80">
                    <Medal className="w-3.5 h-3.5 text-[#0a1631]" />
                    {coach.experienceYears} Years
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0a1631]/5 text-[11px] font-black uppercase tracking-wide text-primary/80">
                    <Clock3 className="w-3.5 h-3.5 text-[#0a1631]" />
                    {sportLabel(coach.sport)}
                  </span>
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#c3f400]/20 text-[11px] font-black uppercase tracking-wide text-[#0a1631]">
                    <Star className="w-3 h-3 fill-[#0a1631]" />
                    {getCoachRating(coach.experienceYears)}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-primary/5">
                  <p className="text-lg font-black text-[#0a1631]">{coach.sessionRate}</p>
                  <Link
                    href={`/coaches/${coach.slug}`}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#0a1631] text-white text-xs font-black uppercase tracking-wider hover:bg-[#c3f400] hover:text-[#0a1631] active:scale-95 transition-all duration-200"
                  >
                    View Slots <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </article>
        ))}

        {filteredCoaches.length === 0 && !loading && (
          <article className="bg-surface-container-lowest rounded-[var(--radius-lg)] p-4 md:p-6 shadow-ambient text-center animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-[#0a1631]/5 flex items-center justify-center mx-auto mb-4">
              <Search className="w-7 h-7 text-primary/40" />
            </div>
            <h2 className="text-xl font-black text-primary">No coaches found</h2>
            <p className="text-sm text-primary/60 mt-2">Try clearing filters or using a broader search term.</p>
          </article>
        )}
      </section>

      <FloatingNav />
    </main>
  )
}
