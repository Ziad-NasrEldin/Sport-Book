'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Heart, MapPin, Star, CalendarPlus, Trophy, Loader2, Store } from 'lucide-react'
import { FloatingNav } from '@/components/layout/FloatingNav'
import { APIErrorFallback } from '@/components/ui/ErrorBoundary'
import { useApiCall, useApiMutation } from '@/lib/api/hooks'
import { stringValue } from '@/lib/api/extract'
import { showToast } from '@/lib/toast'
import { AuthGuard } from '@/components/auth/AuthGuard'

export default function FavoritesPage() {
  return (
    <AuthGuard>
      <FavoritesPageContent />
    </AuthGuard>
  )
}

function FavoritesPageContent() {
  const router = useRouter()
  const { data: favoritesData, loading, error, refetch } = useApiCall('/users/me/favorites')
  const removeMutation = useApiMutation('/users/me/favorites/:id', 'DELETE')
  const [removingIds, setRemovingIds] = useState<Set<string>>(new Set())

  const rawFavorites = favoritesData?.data || favoritesData
  const favorites = rawFavorites && typeof rawFavorites === 'object' && !Array.isArray(rawFavorites) ? rawFavorites : { courts: [], coaches: [], products: [], facilities: [] }

  const favoriteCourts = favorites.courts || favorites.facilities || []
  const favoriteCoaches = favorites.coaches || []
  const favoriteProducts = favorites.products || []

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back()
      return
    }
    router.push('/profile')
  }

  const handleRemove = async (id: string, e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    const itemId = id || String(Date.now())
    setRemovingIds(prev => new Set([...prev, itemId]))
    
    setTimeout(async () => {
      try {
        await removeMutation.mutate({ id } as any)
        showToast('Removed from favorites', 'success')
        refetch()
      } catch {
        showToast('Failed to remove favorite', 'error')
        setRemovingIds(prev => {
          const next = new Set(prev)
          next.delete(itemId)
          return next
        })
      }
    }, 300)
  }

  if (error) {
    return (
      <main className="w-full min-h-screen bg-surface flex items-center justify-center px-5">
        <APIErrorFallback error={error} onRetry={() => refetch()} />
      </main>
    )
  }

  return (
    <main className="w-full min-h-screen bg-surface pb-[calc(8.5rem+env(safe-area-inset-bottom))] md:pb-[11rem] relative selection:bg-tertiary-fixed selection:text-primary">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-16 -left-20 h-[30rem] w-[30rem] rounded-full bg-primary-container/5 blur-[120px]" />
        <div className="absolute bottom-[20%] -right-20 h-[25rem] w-[25rem] rounded-full bg-secondary-container/10 blur-[100px]" />
      </div>

      <header className="sticky top-0 z-40 bg-surface/80 backdrop-blur-xl px-5 pt-8 pb-6 md:px-10 lg:px-14 md:pt-12 md:pb-8 flex items-center gap-5 justify-between">
        <div className="flex items-center gap-5">
          <button
            type="button"
            onClick={handleBack}
            className="w-12 h-12 flex items-center justify-center rounded-[1.25rem] bg-white shadow-[0_4px_20px_-8px_rgba(0,17,58,0.08)] hover:bg-surface-container-low hover:scale-95 transition-all duration-200"
            aria-label="Go back"
          >
            <ArrowLeft className="w-6 h-6 text-primary stroke-[2.5]" />
          </button>
          <div className="pt-1">
            <h1 className="text-4xl md:text-5xl font-display font-bold uppercase tracking-tight text-primary leading-none">Saved Favorites</h1>
            <p className="text-[10px] md:text-xs text-primary/60 font-sans font-bold uppercase tracking-[0.2em] mt-1.5">Facilities and coaches you follow</p>
          </div>
        </div>
      </header>

      {loading ? (
        <section className="px-5 md:px-10 lg:px-14 md:max-w-6xl md:mx-auto py-20 flex flex-col items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-tertiary-fixed" />
          <p className="mt-4 text-xs font-sans font-bold uppercase tracking-widest text-primary/50">Loading favorites...</p>
        </section>
      ) : (
        <section className="px-5 md:px-10 lg:px-14 md:max-w-6xl md:mx-auto space-y-12 md:space-y-16 pb-12">
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8">
            <article style={{ animationDelay: '100ms' }} className="bg-surface-container-lowest rounded-[2.5rem] p-8 shadow-[0_8px_40px_-12px_rgba(0,17,58,0.12)] animate-soft-rise">
              <div className="flex items-center justify-between mb-8">
                <span className="text-[11px] font-sans font-bold uppercase tracking-[0.2em] text-primary/60">Facilities</span>
                <div className="w-12 h-12 rounded-[1rem] bg-primary/5 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-tertiary-fixed stroke-[2.5]" />
                </div>
              </div>
              <p className="text-6xl font-display uppercase tracking-tight text-primary leading-none">{favoriteCourts.length}</p>
            </article>

            <article style={{ animationDelay: '200ms' }} className="bg-surface-container-lowest rounded-[2.5rem] p-8 shadow-[0_8px_40px_-12px_rgba(0,17,58,0.12)] animate-soft-rise">
              <div className="flex items-center justify-between mb-8">
                <span className="text-[11px] font-sans font-bold uppercase tracking-[0.2em] text-primary/60">Coaches</span>
                <div className="w-12 h-12 rounded-[1rem] bg-primary/5 flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-tertiary-fixed stroke-[2.5]" />
                </div>
              </div>
              <p className="text-6xl font-display uppercase tracking-tight text-primary leading-none">{favoriteCoaches.length}</p>
            </article>

            <article style={{ animationDelay: '300ms' }} className="bg-surface-container-lowest rounded-[2.5rem] p-8 shadow-[0_8px_40px_-12px_rgba(0,17,58,0.12)] animate-soft-rise flex flex-col justify-between">
              <div className="flex items-center justify-between mb-6">
                <span className="text-[11px] font-sans font-bold uppercase tracking-[0.2em] text-primary/60">Quick Action</span>
                <div className="w-12 h-12 rounded-[1rem] bg-primary/5 flex items-center justify-center">
                  <CalendarPlus className="w-5 h-5 text-tertiary-fixed stroke-[2.5]" />
                </div>
              </div>
              <Link
                href="/book"
                className="block w-full py-4 text-center bg-tertiary-fixed text-primary font-sans font-bold uppercase tracking-widest text-sm rounded-[2rem] shadow-[0_4px_0_0_#00113a] hover:shadow-[0_2px_0_0_#00113a] hover:translate-y-[2px] transition-all active:shadow-none active:translate-y-[4px]"
              >
                Book Court
              </Link>
            </article>
          </div>

          <section className="space-y-6 md:space-y-8">
            <h2 className="text-3xl md:text-4xl font-display font-bold uppercase tracking-tight text-primary px-2">Favorite Facilities</h2>

            <div className="space-y-5">
              {favoriteCourts.map((facility: any, index: number) => (
                <Link
                  href={`/courts/${facility.id || facility.courtId}`}
                  key={facility.id || facility.courtId || index}
                  style={{ animationDelay: `${(index % 5) * 75}ms` }}
                  className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 md:p-6 bg-surface-container-lowest rounded-[2rem] shadow-[0_4px_20px_-8px_rgba(0,17,58,0.08)] group hover:bg-primary transition-all duration-200 ${removingIds.has(facility.id || facility.courtId || String(index)) ? 'animate-fade-out pointer-events-none opacity-0' : 'animate-soft-rise hover:-translate-y-1'}`}
                >
                  <div className="flex items-center gap-5 min-w-0 w-full">
                    {facility.image ? (
                      <div className="relative h-20 w-20 md:h-24 md:w-24 rounded-[1rem] overflow-hidden shrink-0 shadow-sm">
                        <Image src={facility.image} alt={facility.name || facility.courtName || ''} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                      </div>
                    ) : (
                      <div className="relative h-20 w-20 md:h-24 md:w-24 rounded-[1rem] bg-surface-container-low shrink-0 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                        <MapPin className="w-8 h-8 text-primary/30 group-hover:text-white/30" />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <h3 className="text-2xl md:text-3xl font-display font-medium uppercase tracking-tight text-primary group-hover:text-white truncate transition-colors">{facility.name || facility.courtName || 'Facility'}</h3>
                      <p className="text-[10px] md:text-xs font-sans font-bold uppercase tracking-widest text-primary/60 group-hover:text-tertiary-fixed mt-1 truncate transition-colors">{facility.surface || 'Padel Court'}</p>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {(facility.location || facility.address) && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/5 group-hover:bg-white/10 text-[10px] font-sans font-bold uppercase tracking-wider text-primary group-hover:text-white transition-colors">
                            <MapPin className="w-3 h-3" />
                            {stringValue(facility.location || facility.address)}
                          </span>
                        )}
                        {facility.rating && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/5 group-hover:bg-white/10 text-[10px] font-sans font-bold uppercase tracking-wider text-primary group-hover:text-white transition-colors">
                            <Star className="w-3 h-3" />
                            {facility.rating}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <button
                      type="button"
                      onClick={(e) => handleRemove(facility.id || facility.courtId, e)}
                      className="shrink-0 w-12 h-12 rounded-[1rem] bg-primary/5 group-hover:bg-white/10 text-primary hover:bg-tertiary-fixed/20 flex items-center justify-center transition-all sm:ml-4 mt-4 sm:mt-0 self-end sm:self-center"
                      aria-label="Remove from favorites"
                    >
                      <Heart className="w-5 h-5 text-primary group-hover:text-white fill-primary group-hover:fill-white transition-colors" />
                    </button>
                  </div>
                </Link>
              ))}

              {favoriteCourts.length === 0 && (
                <article className="bg-surface-container-lowest rounded-[2.5rem] p-12 shadow-[0_8px_40px_-12px_rgba(0,17,58,0.12)] text-center animate-soft-rise w-full flex flex-col items-center">
                  <div className="w-20 h-20 rounded-[1.5rem] bg-primary/5 flex items-center justify-center mb-6">
                    <Heart className="w-8 h-8 text-primary/30" />
                  </div>
                  <h3 className="text-3xl font-display uppercase tracking-tight text-primary">No favorite courts yet</h3>
                  <p className="text-sm font-sans text-primary/60 mt-3 max-w-sm">Tap the heart button on any court to save it here for quick access later.</p>
                </article>
              )}
            </div>
          </section>

          <section className="space-y-6 md:space-y-8">
            <h2 className="text-3xl md:text-4xl font-display font-bold uppercase tracking-tight text-primary px-2">Favorite Coaches</h2>

            <div className="space-y-5">
              {favoriteCoaches.map((coach: any, index: number) => (
                <Link
                  href={`/coaches/${coach.slug || coach.id}`}
                  key={coach.id || coach.slug || index}
                  style={{ animationDelay: `${(index % 5) * 75}ms` }}
                  className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 md:p-6 bg-surface-container-lowest rounded-[2rem] shadow-[0_4px_20px_-8px_rgba(0,17,58,0.08)] group hover:bg-primary transition-all duration-200 ${removingIds.has(coach.id || coach.slug || String(index)) ? 'animate-fade-out pointer-events-none opacity-0' : 'animate-soft-rise hover:-translate-y-1'}`}
                >
                  <div className="flex items-center gap-5 min-w-0 w-full">
                    {coach.avatar ? (
                      <div className="relative h-16 w-16 md:h-20 md:w-20 rounded-full overflow-hidden shrink-0 border-2 border-surface-container-low group-hover:border-tertiary-fixed transition-colors shadow-sm">
                        <Image src={coach.avatar} alt={coach.name || ''} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                      </div>
                    ) : (
                      <div className="relative h-16 w-16 md:h-20 md:w-20 rounded-full bg-surface-container-low shrink-0 flex items-center justify-center border-2 border-transparent group-hover:border-tertiary-fixed group-hover:bg-white/10 transition-colors">
                        <Trophy className="w-8 h-8 text-primary/30 group-hover:text-white/30" />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <h3 className="text-2xl md:text-3xl font-display font-medium uppercase tracking-tight text-primary group-hover:text-white truncate transition-colors">{coach.name || 'Coach'}</h3>
                      <p className="text-[10px] md:text-xs font-sans font-bold uppercase tracking-widest text-primary/60 group-hover:text-tertiary-fixed mt-1 truncate transition-colors">{coach.specialty || 'Tennis & Padel'}</p>
                      
                      <div className="mt-4 flex flex-wrap gap-2 text-[10px] font-sans font-bold uppercase tracking-wider text-primary group-hover:text-white transition-colors">
                        {coach.sessions && (
                          <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-primary/5 group-hover:bg-white/10 transition-colors">
                            {coach.sessions} Sessions
                          </span>
                        )}
                        {coach.rating && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/5 group-hover:bg-white/10 transition-colors">
                            <Star className="w-3 h-3" /> {coach.rating}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => handleRemove(coach.id || coach.slug, e)}
                      className="shrink-0 w-12 h-12 rounded-[1rem] bg-primary/5 group-hover:bg-white/10 text-primary hover:bg-tertiary-fixed/20 flex items-center justify-center transition-all sm:ml-4 mt-4 sm:mt-0 self-end sm:self-center"
                      aria-label="Remove from favorites"
                    >
                      <Heart className="w-5 h-5 text-primary group-hover:text-white fill-primary group-hover:fill-white transition-colors" />
                    </button>
                  </div>
                </Link>
              ))}

              {favoriteCoaches.length === 0 && (
                <article className="bg-surface-container-lowest rounded-[2.5rem] p-12 shadow-[0_8px_40px_-12px_rgba(0,17,58,0.12)] text-center animate-soft-rise w-full flex flex-col items-center">
                  <div className="w-20 h-20 rounded-[1.5rem] bg-primary/5 flex items-center justify-center mb-6">
                    <Trophy className="w-8 h-8 text-primary/30" />
                  </div>
                  <h3 className="text-3xl font-display uppercase tracking-tight text-primary">No favorite coaches yet</h3>
                  <p className="text-sm font-sans text-primary/60 mt-3 max-w-sm">Tap the heart button on any coach to save it here for quick access later.</p>
                </article>
              )}
            </div>
          </section>

          {favoriteProducts.length > 0 && (
            <section className="space-y-6 md:space-y-8">
              <h2 className="text-3xl md:text-4xl font-display font-bold uppercase tracking-tight text-primary px-2">Favorite Products</h2>
              <div className="space-y-5">
                {favoriteProducts.map((product: any, index: number) => (
                  <Link
                    href={`/store/${product.productId || product.id}`}
                    key={product.id || product.productId || index}
                    style={{ animationDelay: `${(index % 5) * 75}ms` }}
                    className="flex items-center justify-between p-5 md:p-6 bg-surface-container-lowest rounded-[2rem] shadow-[0_4px_20px_-8px_rgba(0,17,58,0.08)] group hover:bg-primary transition-all duration-200 animate-soft-rise hover:-translate-y-1"
                  >
                    <div className="flex items-center gap-5 min-w-0 w-full">
                      <div className="relative h-16 w-16 md:h-20 md:w-20 rounded-[1rem] bg-surface-container-low shrink-0 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                        <Store className="w-8 h-8 text-primary/30 group-hover:text-white/30" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl md:text-2xl font-display font-medium uppercase tracking-tight text-primary group-hover:text-white truncate transition-colors">{product.name || product.title || 'Product'}</h3>
                      </div>
                      
                      <button
                        type="button"
                        onClick={(e) => handleRemove(product.id || product.productId, e)}
                        className="shrink-0 w-12 h-12 rounded-[1rem] bg-primary/5 group-hover:bg-white/10 text-primary hover:bg-tertiary-fixed/20 flex items-center justify-center transition-all ml-4"
                        aria-label="Remove product from favorites"
                      >
                        <Heart className="w-5 h-5 text-primary group-hover:text-white fill-primary group-hover:fill-white transition-colors" />
                      </button>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

        </section>
      )}

      <FloatingNav />
    </main>
  )
}
