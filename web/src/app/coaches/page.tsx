'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Medal, Clock3, ChevronRight, Search, ChevronDown, ChevronUp } from 'lucide-react'
import { FloatingNav } from '@/components/layout/FloatingNav'
import { coaches } from '@/lib/coaches'

export default function CoachesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeSport, setActiveSport] = useState('All')
  const [minExperience, setMinExperience] = useState(0)
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)

  const sports = useMemo(() => ['All', ...new Set(coaches.map((coach) => coach.sport))], [])

  const filteredCoaches = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()

    return coaches.filter((coach) => {
      const matchesSearch =
        query.length === 0 ||
        coach.name.toLowerCase().includes(query) ||
        coach.sport.toLowerCase().includes(query)
      const matchesSport = activeSport === 'All' || coach.sport === activeSport
      const matchesExperience = coach.experienceYears >= minExperience

      return matchesSearch && matchesSport && matchesExperience
    })
  }, [searchQuery, activeSport, minExperience])

  return (
    <main className="w-full min-h-screen bg-surface pb-[calc(8.5rem+env(safe-area-inset-bottom))] md:pb-[11rem] relative">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-20 -left-16 h-64 w-64 rounded-full bg-primary-container/12 blur-[90px]" />
        <div className="absolute bottom-10 -right-10 h-72 w-72 rounded-full bg-secondary-container/18 blur-[110px]" />
      </div>

      <header className="sticky top-0 z-40 bg-surface/80 backdrop-blur-xl px-5 pt-6 pb-4 md:px-10 lg:px-14 md:pt-8 md:pb-5">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-container-high hover:bg-surface-container-low transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-primary stroke-[2.5]" />
          </Link>
          <div>
            <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-primary">Coaches</h1>
            <p className="text-sm md:text-base text-primary/60">Choose your coach and view available time slots</p>
          </div>
        </div>
      </header>

      <section className="px-5 md:px-10 lg:px-14 md:max-w-5xl md:mx-auto space-y-4 md:space-y-5">
        <article className="bg-surface-container-lowest rounded-[var(--radius-lg)] p-4 md:p-5 shadow-ambient space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-primary/45" />
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search coaches or sport"
              className="w-full h-11 pl-10 pr-4 rounded-[var(--radius-default)] border border-primary/10 bg-surface-container-low text-primary text-sm md:text-base outline-none focus:border-primary-container"
            />
          </div>

          <div className="flex items-center justify-between md:hidden">
            <p className="text-[10px] font-lexend font-bold uppercase tracking-[0.16em] text-primary/50">Filters</p>
            <button
              type="button"
              onClick={() => setIsFiltersOpen((previous) => !previous)}
              aria-expanded={isFiltersOpen}
              aria-controls="coach-filters"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container-low text-primary text-[11px] font-lexend font-bold uppercase tracking-wide"
            >
              {isFiltersOpen ? 'Minimize' : 'Maximize'}
              {isFiltersOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          <div
            id="coach-filters"
            className={`space-y-4 ${isFiltersOpen ? 'block' : 'hidden'} md:block`}
          >
            <div className="space-y-2.5">
              <p className="text-[10px] font-lexend font-bold uppercase tracking-[0.16em] text-primary/50">Sport</p>
              <div className="flex flex-wrap gap-2">
                {sports.map((sport) => {
                  const isActive = activeSport === sport

                  return (
                    <button
                      key={sport}
                      type="button"
                      onClick={() => setActiveSport(sport)}
                      className={`px-3 py-1.5 rounded-full text-[11px] font-lexend font-bold uppercase tracking-wide transition-colors ${
                        isActive
                          ? 'bg-primary-container text-surface-container-lowest'
                          : 'bg-surface-container-low text-primary/75 hover:bg-surface-container-high'
                      }`}
                    >
                      {sport}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="space-y-2.5">
              <p className="text-[10px] font-lexend font-bold uppercase tracking-[0.16em] text-primary/50">Minimum Experience</p>
              <div className="flex flex-wrap gap-2">
                {[0, 5, 10].map((years) => {
                  const isActive = minExperience === years

                  return (
                    <button
                      key={years}
                      type="button"
                      onClick={() => setMinExperience(years)}
                      className={`px-3 py-1.5 rounded-full text-[11px] font-lexend font-bold uppercase tracking-wide transition-colors ${
                        isActive
                          ? 'bg-secondary-container text-on-secondary-container'
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

          <p className="text-xs md:text-sm text-primary/60 font-lexend">
            Showing {filteredCoaches.length} {filteredCoaches.length === 1 ? 'coach' : 'coaches'}
          </p>
        </article>

        {filteredCoaches.map((coach) => (
          <article key={coach.slug} className="bg-surface-container-lowest rounded-[var(--radius-lg)] p-4 md:p-5 shadow-ambient">
            <div className="flex gap-3 md:gap-4 items-start">
              <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-[var(--radius-default)] overflow-hidden shrink-0">
                <Image src={coach.image} alt={coach.name} fill className="object-cover" />
              </div>

              <div className="flex-1 min-w-0">
                <h2 className="text-lg md:text-xl font-extrabold text-primary truncate">{coach.name}</h2>
                <p className="text-sm text-primary/65 mt-1 line-clamp-2">{coach.bio}</p>

                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-low text-[11px] font-lexend font-bold uppercase tracking-wide text-primary/75">
                    <Medal className="w-3.5 h-3.5" />
                    {coach.experienceYears} Years
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-low text-[11px] font-lexend font-bold uppercase tracking-wide text-primary/75">
                    <Clock3 className="w-3.5 h-3.5" />
                    {coach.sport}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm md:text-base font-bold text-primary">{coach.sessionRate}</p>
              <Link
                href={`/coaches/${coach.slug}`}
                className="inline-flex items-center gap-1.5 text-sm font-bold text-secondary-container hover:text-secondary transition-colors"
              >
                View Slots <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </article>
        ))}

        {filteredCoaches.length === 0 && (
          <article className="bg-surface-container-lowest rounded-[var(--radius-lg)] p-6 shadow-ambient text-center">
            <h2 className="text-lg font-extrabold text-primary">No coaches found</h2>
            <p className="text-sm text-primary/60 mt-2">Try clearing filters or using a broader search term.</p>
          </article>
        )}
      </section>

      <FloatingNav />
    </main>
  )
}
