'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Heart, MapPin, Star, CalendarPlus, Trophy } from 'lucide-react'
import { FloatingNav } from '@/components/layout/FloatingNav'

const favoriteFacilities = [
  {
    id: 'FAC-01',
    name: "The Regent's Park",
    surface: 'Hard Court',
    location: 'London NW1',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'FAC-02',
    name: 'Elite Padel Club',
    surface: 'Panoramic Court',
    location: 'Chelsea, London',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=900&q=80',
  },
]

const favoriteCoaches = [
  {
    id: 'COA-01',
    name: 'Sofia Carter',
    specialty: 'Advanced Tennis Drills',
    sessions: 36,
    rating: 4.9,
    avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=320&q=80',
  },
]

export default function FavoritesPage() {
  const router = useRouter()

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back()
      return
    }

    router.push('/profile')
  }

  return (
    <main className="w-full min-h-screen bg-surface pb-[calc(8.5rem+env(safe-area-inset-bottom))] md:pb-[11rem] relative">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-16 -left-20 h-60 w-60 rounded-full bg-primary-container/12 blur-[95px]" />
        <div className="absolute bottom-16 -right-10 h-72 w-72 rounded-full bg-secondary-container/18 blur-[110px]" />
      </div>

      <header className="sticky top-0 z-40 bg-surface/80 backdrop-blur-xl px-5 pt-6 pb-4 md:px-10 lg:px-14 md:pt-8 md:pb-5">
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
            <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-primary">Saved Favorites</h1>
            <p className="text-sm md:text-base text-primary/60">Facilities and coaches you follow</p>
          </div>
        </div>
      </header>

      <section className="px-5 md:px-10 lg:px-14 md:max-w-5xl md:mx-auto space-y-6 md:space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-5">
          <article className="bg-surface-container-lowest rounded-[var(--radius-lg)] p-5 shadow-ambient">
            <div className="flex items-center justify-between mb-6">
              <span className="text-[10px] font-lexend font-bold uppercase tracking-[0.18em] text-primary/50">Facilities</span>
              <Heart className="w-5 h-5 text-secondary-container" />
            </div>
            <p className="text-4xl font-black tracking-tight text-primary">{favoriteFacilities.length}</p>
          </article>

          <article className="bg-surface-container-lowest rounded-[var(--radius-lg)] p-5 shadow-ambient">
            <div className="flex items-center justify-between mb-6">
              <span className="text-[10px] font-lexend font-bold uppercase tracking-[0.18em] text-primary/50">Coaches</span>
              <Trophy className="w-5 h-5 text-primary-container" />
            </div>
            <p className="text-4xl font-black tracking-tight text-primary">{favoriteCoaches.length}</p>
          </article>

          <article className="bg-surface-container-lowest rounded-[var(--radius-lg)] p-5 shadow-ambient">
            <div className="flex items-center justify-between mb-6">
              <span className="text-[10px] font-lexend font-bold uppercase tracking-[0.18em] text-primary/50">Quick Action</span>
              <CalendarPlus className="w-5 h-5 text-primary-container" />
            </div>
            <Link
              href="/book"
              className="inline-flex items-center justify-center w-full py-3 rounded-full bg-primary-container text-surface-container-lowest font-bold text-sm hover:bg-primary transition-colors"
            >
              Book Favorite Court
            </Link>
          </article>
        </div>

        <section className="space-y-4 md:space-y-5">
          <h2 className="text-xl md:text-3xl font-extrabold tracking-tight text-primary">Favorite Facilities</h2>

          <div className="space-y-4">
            {favoriteFacilities.map((facility) => (
              <article
                key={facility.id}
                className="bg-surface-container-lowest rounded-[var(--radius-lg)] p-3.5 md:p-4 shadow-ambient"
              >
                <div className="flex items-center gap-3 md:gap-4 min-w-0">
                  <div className="relative h-24 w-24 sm:w-28 md:w-32 rounded-[var(--radius-default)] overflow-hidden shrink-0">
                    <Image src={facility.image} alt={facility.name} fill className="object-cover" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-base md:text-lg font-bold text-primary truncate">{facility.name}</h3>
                    <p className="text-xs md:text-sm text-primary/65 mt-0.5 truncate">{facility.surface}</p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-surface-container-low text-[10px] md:text-xs font-lexend font-bold uppercase tracking-wider text-primary/75">
                        <MapPin className="w-3.5 h-3.5" />
                        {facility.location}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-surface-container-low text-[10px] md:text-xs font-lexend font-bold uppercase tracking-wider text-primary/75">
                        <Star className="w-3.5 h-3.5" />
                        {facility.rating}
                      </span>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="space-y-4 md:space-y-5">
          <h2 className="text-xl md:text-3xl font-extrabold tracking-tight text-primary">Favorite Coaches</h2>

          <div className="space-y-4">
            {favoriteCoaches.map((coach) => (
              <article
                key={coach.id}
                className="bg-surface-container-lowest rounded-[var(--radius-lg)] p-4 md:p-5 shadow-ambient"
              >
                <div className="flex items-center gap-4">
                  <div className="relative h-16 w-16 rounded-full overflow-hidden shrink-0 border-2 border-surface-container-low">
                    <Image src={coach.avatar} alt={coach.name} fill className="object-cover" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-base md:text-lg font-bold text-primary truncate">{coach.name}</h3>
                    <p className="text-xs md:text-sm text-primary/65 mt-0.5 truncate">{coach.specialty}</p>
                    <div className="mt-2 flex items-center gap-2 text-[11px] text-primary/70 font-lexend">
                      <span>{coach.sessions} Sessions</span>
                      <span>•</span>
                      <span className="inline-flex items-center gap-1">
                        <Star className="w-3.5 h-3.5" /> {coach.rating}
                      </span>
                    </div>
                  </div>

                  <Link
                    href="/book"
                    className="shrink-0 px-4 py-2 rounded-full bg-secondary-container text-on-secondary-container font-bold text-xs hover:opacity-90 transition-opacity"
                  >
                    Book
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      </section>

      <FloatingNav />
    </main>
  )
}