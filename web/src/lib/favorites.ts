export const FAVORITES_STORAGE_KEY = 'kinetic:favorites'
export const FAVORITES_UPDATED_EVENT = 'kinetic:favorites-updated'

export type FavoriteCourt = {
  id: string
  name: string
  surface: string
  location: string
  rating: number
  image: string
}

export type FavoriteCoach = {
  slug: string
  name: string
  specialty: string
  sessions: number
  rating: number
  avatar: string
}

export type FavoritesState = {
  courts: FavoriteCourt[]
  coaches: FavoriteCoach[]
}

const EMPTY_FAVORITES: FavoritesState = {
  courts: [],
  coaches: [],
}

function dispatchFavoritesUpdated() {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new Event(FAVORITES_UPDATED_EVENT))
}

function sanitizeFavorites(raw: unknown): FavoritesState {
  if (!raw || typeof raw !== 'object') return EMPTY_FAVORITES

  const parsed = raw as Partial<FavoritesState>
  return {
    courts: Array.isArray(parsed.courts) ? parsed.courts : [],
    coaches: Array.isArray(parsed.coaches) ? parsed.coaches : [],
  }
}

export function getFavorites(): FavoritesState {
  if (typeof window === 'undefined') return EMPTY_FAVORITES

  try {
    const raw = window.localStorage.getItem(FAVORITES_STORAGE_KEY)
    if (!raw) return EMPTY_FAVORITES

    const parsed = JSON.parse(raw) as unknown
    return sanitizeFavorites(parsed)
  } catch {
    return EMPTY_FAVORITES
  }
}

function saveFavorites(nextState: FavoritesState) {
  if (typeof window === 'undefined') return

  window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(nextState))
  dispatchFavoritesUpdated()
}

export function isCourtFavorited(courtId: string): boolean {
  return getFavorites().courts.some((court) => court.id === courtId)
}

export function isCoachFavorited(coachSlug: string): boolean {
  return getFavorites().coaches.some((coach) => coach.slug === coachSlug)
}

export function toggleCourtFavorite(court: FavoriteCourt): boolean {
  const current = getFavorites()
  const exists = current.courts.some((entry) => entry.id === court.id)

  const nextCourts = exists
    ? current.courts.filter((entry) => entry.id !== court.id)
    : [court, ...current.courts]

  saveFavorites({ ...current, courts: nextCourts })
  return !exists
}

export function toggleCoachFavorite(coach: FavoriteCoach): boolean {
  const current = getFavorites()
  const exists = current.coaches.some((entry) => entry.slug === coach.slug)

  const nextCoaches = exists
    ? current.coaches.filter((entry) => entry.slug !== coach.slug)
    : [coach, ...current.coaches]

  saveFavorites({ ...current, coaches: nextCoaches })
  return !exists
}