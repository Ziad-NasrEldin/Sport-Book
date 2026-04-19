'use client'

import { Suspense, useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  ArrowLeft,
  Heart,
  MapPin,
  Search,
  SlidersHorizontal,
  Star,
} from 'lucide-react'
import { FloatingNav } from '@/components/layout/FloatingNav'
import { useApiCall } from '@/lib/api/hooks'
import { stringValue } from '@/lib/api/extract'
import { APIErrorFallback } from '@/components/ui/ErrorBoundary'
import {
  FAVORITES_UPDATED_EVENT,
  getFavorites,
  toggleCourtFavorite,
} from '@/lib/favorites'

function CourtsPageContent() {
  const { data: courtsResponse, loading, error } = useApiCall('/player/courts')
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialSport = searchParams.get('sport')

  const courtsData = Array.isArray(courtsResponse) ? courtsResponse : (Array.isArray(courtsResponse?.data) ? courtsResponse.data : [])
  const sportLabel = (sport: any): string => stringValue(sport)

  const courtSports = useMemo(() => {
    const sports = new Set(courtsData.map((court: any) => sportLabel(court.sport)))
    return Array.from(sports) as string[]
  }, [courtsData])

  const defaultSport = courtSports.includes((initialSport as string) ?? 'Tennis')
    ? (initialSport as string)
    : courtSports[0] || 'Tennis'

  const [selectedSport, setSelectedSport] = useState<string>(defaultSport)
  const [query, setQuery] = useState('')
  const [priceFilter, setPriceFilter] = useState<'all' | 'lt500' | '500to1000'>('all')
  const [distanceFilter, setDistanceFilter] = useState<'all' | 'lt5'>('all')
  const [favoriteCourtIds, setFavoriteCourtIds] = useState<string[]>(() => {
    if (typeof window === 'undefined') return []
    return getFavorites().courts.map((court) => court.id)
  })

  useEffect(() => {
    const refreshFavorites = () => {
      setFavoriteCourtIds(getFavorites().courts.map((court) => court.id))
    }

    refreshFavorites()
    window.addEventListener(FAVORITES_UPDATED_EVENT, refreshFavorites)
    return () => {
      window.removeEventListener(FAVORITES_UPDATED_EVENT, refreshFavorites)
    }
  }, [])

  const filteredCourts = useMemo(() => {
    return courtsData
      .filter((court: any) => sportLabel(court.sport) === selectedSport)
      .filter((court: any) => {
        if (priceFilter === 'lt500') return court.price < 500
        if (priceFilter === '500to1000') return court.price >= 500 && court.price <= 1000
        return true
      })
      .filter((court: any) => (distanceFilter === 'lt5' ? court.distance < 5 : true))
      .filter((court: any) => {
        const text = `${court.title || ''} ${stringValue(court.location)} ${court.sportLabel || ''}`.toLowerCase()
        return text.includes(query.toLowerCase())
      })
  }, [courtsData, distanceFilter, priceFilter, query, selectedSport])

  if (error) {
    return <APIErrorFallback error={error} onRetry={() => window.location.reload()} />
  }

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back()
      return
    }

    router.push('/categories')
  }

  const handleToggleCourtFavorite = (court: any) => {
    toggleCourtFavorite({
      id: court.id,
      name: court.title,
      surface: court.sportLabel,
      location: stringValue(court.location),
      rating: court.rating,
      image: court.image,
    })
    setFavoriteCourtIds(getFavorites().courts.map((entry) => entry.id))
  }

  return (
    <main className="w-full min-h-screen bg-surface-container-low pb-[calc(8.5rem+env(safe-area-inset-bottom))] md:pb-[11rem] relative">
      <header className="sticky top-0 z-40 bg-surface-container-low/90 backdrop-blur-xl px-5 pt-7 pb-5 md:px-10 lg:px-14 md:pt-8">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleBack}
              className="w-9 h-9 rounded-full flex items-center justify-center text-primary hover:bg-surface-container-high transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-[32px] leading-none font-extrabold tracking-tight text-primary md:text-[40px]">All Courts</h1>
          </div>

          <button
            type="button"
            onClick={() => {
              const input = document.querySelector<HTMLInputElement>('input[type="text"]')
              if (input) { input.focus(); input.scrollIntoView({ behavior: 'smooth', block: 'center' }) }
            }}
            className="w-9 h-9 rounded-full flex items-center justify-center text-primary hover:bg-surface-container-high transition-colors"
            aria-label="Focus search"
          >
            <Search className="w-5 h-5" />
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/45" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            type="text"
            placeholder="Search courts, locations..."
            className="w-full bg-surface-container-high rounded-[var(--radius-lg)] py-4 pl-12 pr-4 text-primary placeholder:text-primary/55 outline-none"
          />
        </div>
      </header>

      <section className="px-5 md:px-10 lg:px-14 md:max-w-4xl md:mx-auto space-y-5 pb-2">
        <div className="flex items-center gap-3 overflow-x-auto hide-scrollbar pb-1">
          {courtSports.map((sport) => (
            <button
              key={sport}
              onClick={() => setSelectedSport(sport)}
              className={`shrink-0 px-6 py-3 rounded-full text-base font-semibold transition-colors ${
                selectedSport === sport
                  ? 'bg-tertiary-fixed text-primary'
                  : 'bg-surface-container-high text-primary/80 hover:text-primary'
              }`}
            >
              {sport}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 overflow-x-auto hide-scrollbar pb-2">
          <button
            onClick={() => setPriceFilter((value) => (value === 'lt500' ? 'all' : 'lt500'))}
            className={`shrink-0 px-5 py-2.5 rounded-full text-[13px] font-lexend tracking-widest uppercase transition-colors ${
              priceFilter === 'lt500'
                ? 'bg-primary-container text-surface-container-lowest'
                : 'bg-surface-container-high text-primary/80'
            }`}
          >
            Price: {'<'}500
          </button>

          <button
            onClick={() => setPriceFilter((value) => (value === '500to1000' ? 'all' : '500to1000'))}
            className={`shrink-0 px-5 py-2.5 rounded-full text-[13px] font-lexend tracking-widest uppercase transition-colors ${
              priceFilter === '500to1000'
                ? 'bg-primary-container text-surface-container-lowest'
                : 'bg-surface-container-high text-primary/80'
            }`}
          >
            500-1000
          </button>

          <button
            onClick={() => setDistanceFilter((value) => (value === 'lt5' ? 'all' : 'lt5'))}
            className={`shrink-0 px-5 py-2.5 rounded-full text-[13px] font-lexend tracking-widest uppercase transition-colors ${
              distanceFilter === 'lt5'
                ? 'bg-primary-container text-surface-container-lowest'
                : 'bg-surface-container-high text-primary/80'
            }`}
          >
            Distance: {'<'}5km
          </button>

          <button
            type="button"
            onClick={() => {
              setPriceFilter('all')
              setDistanceFilter('all')
              setQuery('')
            }}
            title="Reset all filters"
            className="shrink-0 w-11 h-11 rounded-full bg-surface-container-high text-primary flex items-center justify-center hover:bg-surface-container-low transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-6">
          {filteredCourts.map((court: any) => (
            <article
              key={court.id}
              className="bg-surface-container-lowest rounded-[var(--radius-xl)] overflow-hidden shadow-ambient"
            >
              <div className="relative w-full aspect-[16/11]">
                <Image src={court.image} alt={court.title} fill className="object-cover" />

                <span
                  className={`absolute left-4 top-4 px-4 py-1.5 rounded-full text-[12px] font-lexend font-bold tracking-widest text-white ${
                    court.statusTone === 'danger' ? 'bg-[#b40000]' : 'bg-primary-container'
                  }`}
                >
                  {court.status}
                </span>

                <div className="absolute right-4 top-4 flex flex-col items-end gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggleCourtFavorite(court)}
                    className={`w-10 h-10 rounded-full backdrop-blur-md border border-white/40 flex items-center justify-center transition-colors ${
                      favoriteCourtIds.includes(court.id)
                        ? 'bg-secondary-container text-white'
                        : 'bg-white/20 text-white'
                    }`}
                    aria-label={favoriteCourtIds.includes(court.id) ? 'Remove court from favorites' : 'Add court to favorites'}
                  >
                    <Heart className={`w-4 h-4 ${favoriteCourtIds.includes(court.id) ? 'fill-white' : ''}`} />
                  </button>

                  <span className="px-3 py-1.5 rounded-full bg-surface-container-lowest text-primary text-sm font-bold inline-flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-secondary-container fill-secondary-container" />
                    {court.rating}
                  </span>
                </div>
              </div>

              <div className="p-5 md:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-lexend uppercase tracking-[0.18em] text-secondary">{court.sportLabel}</p>
                    <h3 className="text-[18px] md:text-[22px] leading-tight font-black text-primary mt-2">{court.title}</h3>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-[34px] md:text-[38px] leading-none font-black text-primary">{court.price} EGP</p>
                    <p className="text-[11px] font-lexend uppercase tracking-widest text-primary/60 mt-1">Per Hour</p>
                  </div>
                </div>

                <p className="mt-4 text-base text-primary/80 inline-flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary/40" />
                  {stringValue(court.distance)} km away • {stringValue(court.location)}
                </p>

                <Link
                  href="/book"
                  className="mt-6 w-full py-4 rounded-full bg-secondary-container text-primary text-center font-semibold text-lg hover:opacity-90 transition-opacity block"
                >
                  Book Now
                </Link>
              </div>
            </article>
          ))}

          {filteredCourts.length === 0 && (
            <div className="bg-surface-container-lowest rounded-[var(--radius-lg)] p-6 text-center shadow-ambient">
              <p className="text-lg font-bold text-primary">No courts found</p>
              <p className="text-sm text-primary/65 mt-1">Try adjusting your filters to see more results.</p>
            </div>
          )}
        </div>
      </section>

      <FloatingNav />
    </main>
  )
}

export default function CourtsPage() {
  return (
    <Suspense
      fallback={
        <main className="w-full min-h-screen bg-surface-container-low pb-[calc(8.5rem+env(safe-area-inset-bottom))] md:pb-[11rem] px-5 md:px-10 lg:px-14">
          <div className="md:max-w-4xl md:mx-auto py-16 text-center">
            <p className="text-lg font-bold text-primary">Loading courts...</p>
          </div>
        </main>
      }
    >
      <CourtsPageContent />
    </Suspense>
  )
}