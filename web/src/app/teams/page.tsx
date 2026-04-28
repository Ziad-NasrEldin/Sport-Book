'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { CalendarDays, Clock3, MapPin, Plus, Users } from 'lucide-react'
import { FloatingNav } from '@/components/layout/FloatingNav'
import { useApiCall } from '@/lib/api/hooks'
import { stringValue } from '@/lib/api/extract'
import { api } from '@/lib/api/client'
import { APIErrorFallback } from '@/components/ui/ErrorBoundary'
import { SkeletonStat } from '@/components/ui/SkeletonLoader'

import { AppSelect } from '@/components/ui/AppSelect'
type CourtSport = string

type CreateFormState = {
  sport: CourtSport
  courtId: string
  date: string
  startHour: number
  durationHours: number
  neededPlayers: number
}

function toDateInputValue(date: Date) {
  return date.toISOString().slice(0, 10)
}

function formatHour(hour: number) {
  return `${hour.toString().padStart(2, '0')}:00`
}

const startHourOptions = Array.from({ length: 16 }, (_, index) => 6 + index)
const durationOptions = [1, 2, 3]

function getNoticeFeedbackFromUrl() {
  if (typeof window === 'undefined') return ''

  const currentUrl = new URL(window.location.href)
  const notice = currentUrl.searchParams.get('notice')

  if (notice === 'left') return 'You left the team successfully.'
  if (notice === 'cancelled') return 'Team post cancelled successfully.'

  return ''
}

type CurrentUser = {
  id: string
  name: string
}

type CourtRecord = {
  id: string
  name: string
  sport?: {
    displayName?: string
    name?: string
  }
  branch?: {
    name?: string
    city?: string
  }
}

type TeamPost = {
  id: string
  createdByUserId: string
  createdByName: string
  sport: CourtSport
  courtId: string
  courtTitle: string
  courtLocation: string
  date: string
  startHour: number
  endHour: number
  neededPlayers: number
  memberUserIds: string[]
  requestedUserIds: string[]
  status: 'open' | 'full'
}

type TeamPostApiResponse = {
  id: string
  createdByUserId: string
  courtId: string
  date: string
  startHour: number
  endHour: number
  neededPlayers: number
  memberUserIds?: string | string[]
  status: string
  court?: {
    name?: string
    branch?: {
      name?: string
      city?: string
    }
    sport?: {
      displayName?: string
      name?: string
    }
  }
  createdBy?: {
    name?: string
  }
}

function normalizeSport(value: string | undefined): CourtSport {
  const normalized = value?.toLowerCase()
  if (normalized === 'padel') return 'Padel'
  if (normalized === 'football') return 'Football'
  return 'Tennis'
}

function parseUserIds(value: string | string[] | undefined): string[] {
  if (Array.isArray(value)) return value
  if (!value) return []

  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed.filter((entry): entry is string => typeof entry === 'string') : []
  } catch {
    return []
  }
}

function normalizeTeamPost(post: TeamPostApiResponse): TeamPost {
  const memberUserIds = parseUserIds(post.memberUserIds)
  const normalizedStatus = post.status?.toUpperCase() === 'FULL' ? 'full' : 'open'

  return {
    id: post.id,
    createdByUserId: post.createdByUserId,
    createdByName: post.createdBy?.name ?? 'Unknown',
    sport: normalizeSport(post.court?.sport?.displayName ?? post.court?.sport?.name),
    courtId: post.courtId,
    courtTitle: post.court?.name ?? 'Selected Court',
    courtLocation: [post.court?.branch?.name, post.court?.branch?.city].filter(Boolean).join(', ') || 'Location unavailable',
    date: post.date.slice(0, 10),
    startHour: post.startHour,
    endHour: post.endHour,
    neededPlayers: post.neededPlayers,
    memberUserIds,
    requestedUserIds: [],
    status: normalizedStatus,
  }
}

export default function TeamsPage() {
  const { data: teamsResponse, loading, error, refetch } = useApiCall<{ data: TeamPostApiResponse[] }>('/teams')
  const { data: currentUser } = useApiCall<CurrentUser>('/users/me')
  const { data: courtsResponse } = useApiCall<{ items: CourtRecord[] }>('/courts?limit=50')

  const [mounted, setMounted] = useState(false)
  const [feedbackVisible, setFeedbackVisible] = useState(true)

  const courtsData = useMemo(
    () => (Array.isArray(courtsResponse?.items) ? courtsResponse.items : []),
    [courtsResponse],
  )

  const teamsData = useMemo(
    () => (Array.isArray(teamsResponse?.data) ? teamsResponse.data.map((post: TeamPostApiResponse) => normalizeTeamPost(post)) : []),
    [teamsResponse],
  )
  const usersData = useMemo(
    () => (currentUser ? [currentUser] : []),
    [currentUser],
  )

  const availableSports = useMemo(() => {
    const sportsFromCourts = courtsData
      .map((court) => court.sport?.displayName ?? court.sport?.name)
      .filter((sport): sport is string => Boolean(sport?.trim()))
    const sportsFromPosts = teamsData.map((post) => post.sport).filter((sport) => Boolean(sport?.trim()))

    return Array.from(
      new Set(
        [...sportsFromCourts, ...sportsFromPosts],
      ),
    )
  }, [courtsData, teamsData])

  const [activeUserId, setActiveUserState] = useState('')
  const [teamPosts, setTeamPosts] = useState<TeamPost[]>([])
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [feedback, setFeedback] = useState(getNoticeFeedbackFromUrl)
  const [selectedSportFilter, setSelectedSportFilter] = useState<'All' | string>('All')
  const [selectedDateFilter, setSelectedDateFilter] = useState('')

  const [createForm, setCreateForm] = useState<CreateFormState>({
    sport: '',
    courtId: '',
    date: toDateInputValue(new Date()),
    startHour: 18,
    durationHours: 1,
    neededPlayers: 3,
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    setTeamPosts(teamsData)
  }, [teamsData])

  useEffect(() => {
    if (usersData.length > 0 && !activeUserId) {
      setActiveUserState(usersData[0]?.id || '')
    }
  }, [usersData, activeUserId])

  useEffect(() => {
    const currentUrl = new URL(window.location.href)
    const notice = currentUrl.searchParams.get('notice')

    if (!notice) return

    currentUrl.searchParams.delete('notice')
    const nextSearch = currentUrl.searchParams.toString()
    const nextPath = `${currentUrl.pathname}${nextSearch ? `?${nextSearch}` : ''}`
    window.history.replaceState({}, '', nextPath)
  }, [])

  useEffect(() => {
    if (!feedback) return

    const hideTimer = setTimeout(() => setFeedbackVisible(false), 3800)
    const clearTimer = setTimeout(() => setFeedback(''), 4200)

    return () => {
      clearTimeout(hideTimer)
      clearTimeout(clearTimer)
    }
  }, [feedback])

  useEffect(() => {
    if (courtsData.length === 0) return

    const fallbackSport = courtsData[0]?.sport?.displayName ?? courtsData[0]?.sport?.name ?? ''

    setCreateForm((prev) => {
      const isCurrentCourtValid = courtsData.some((court) => court.id === prev.courtId)
      if (isCurrentCourtValid && prev.sport) return prev

      const sport = prev.sport || fallbackSport
      const firstCourtForSport = courtsData.find((court) => {
        const sportName = court.sport?.displayName ?? court.sport?.name ?? ''
        return sportName === sport
      })

      return {
        ...prev,
        sport,
        courtId: firstCourtForSport?.id ?? courtsData[0]?.id ?? '',
      }
    })
  }, [courtsData])

  const filteredPosts = useMemo(() => {
    return teamPosts.filter((post) => {
      const sportMatch = selectedSportFilter === 'All' || post.sport === selectedSportFilter
      const dateMatch = selectedDateFilter === '' || post.date === selectedDateFilter
      return sportMatch && dateMatch
    })
  }, [selectedDateFilter, selectedSportFilter, teamPosts])

  const selectableCourts = useMemo(
    () =>
      courtsData.filter((court) => {
        const sportName = court.sport?.displayName ?? court.sport?.name ?? ''
        return sportName === createForm.sport
      }),
    [courtsData, createForm.sport],
  )

  const handleCreatePost = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!createForm.courtId) {
      setFeedback('No court available for selected sport.')
      setFeedbackVisible(true)
      return
    }

    try {
      await api.post('/teams', {
        courtId: createForm.courtId,
        date: createForm.date,
        startHour: createForm.startHour,
        endHour: createForm.startHour + createForm.durationHours,
        neededPlayers: createForm.neededPlayers,
      })
      setFeedback('Team post published successfully.')
      setFeedbackVisible(true)
      setCreateForm((prev) => ({
        ...prev,
        neededPlayers: 3,
      }))
      setIsCreateOpen(false)
      refetch()
    } catch (err) {
      setFeedback('Could not create your team post.')
      setFeedbackVisible(true)
    }
  }

  const handleJoinTeam = async (postId: string) => {
    try {
      await api.post(`/teams/${postId}/join`)
      setFeedback('Join request sent. Waiting for creator approval.')
      setFeedbackVisible(true)
      refetch()
    } catch (err) {
      setFeedback('Could not join this team.')
      setFeedbackVisible(true)
    }
  }

  const activeUserName = usersData.find((u) => u.id === activeUserId)?.name || 'You'

  const getUserNameById = (userId: string) => {
    const user = usersData.find((u) => u.id === userId)
    return user?.name || teamPosts.find((post) => post.createdByUserId === userId)?.createdByName || 'Unknown'
  }

  if (error) {
    return <APIErrorFallback error={error} onRetry={() => window.location.reload()} />
  }

  return (
    <main className="w-full min-h-screen bg-surface-container-low pb-[calc(8.5rem+env(safe-area-inset-bottom))] md:pb-[11rem] relative overflow-hidden">
      {/* Bold geometric background pattern */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `repeating-linear-gradient(45deg, currentColor 0px, currentColor 1px, transparent 1px, transparent 40px), repeating-linear-gradient(-45deg, currentColor 0px, currentColor 1px, transparent 1px, transparent 40px)`,
      }} />
      <div className="pointer-events-none absolute top-0 right-0 w-[600px] h-[600px] bg-[#c3f400]/8 blur-[120px] rounded-full -translate-y-1/4 translate-x-1/4" />
      <div className="pointer-events-none absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary/6 blur-[100px] rounded-full translate-y-1/4 -translate-x-1/4" />

      {/* HERO: Full-bleed dramatic header */}
      <header className={`relative z-40 bg-[#0a1631] overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${mounted ? 'opacity-100' : 'opacity-0'}`}>
        {/* Diagonal accent line */}
        <div className="absolute top-0 left-0 w-full h-1 bg-[#c3f400]" />
        <div className="absolute bottom-0 right-0 w-1/2 h-2 bg-[#c3f400]" style={{ clipPath: 'polygon(20% 0, 100% 0, 100% 100%, 0% 100%)' }} />

        <div className="relative max-w-[1440px] mx-auto px-5 pt-10 pb-8 md:px-8 md:pt-14 md:pb-10">
          <div className="flex items-end justify-between gap-4">
            <div className="space-y-2">
              <p className="text-[#c3f400] text-xs font-black uppercase tracking-[0.3em] animate-soft-rise">Find Your Squad</p>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-[-0.04em] text-white leading-[0.85]">
                TEAMS
              </h1>
              <p className="text-white/50 text-sm md:text-base max-w-md mt-3 leading-relaxed">
                Create squads, choose court slots, and join matches. Your next game starts here.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsCreateOpen((value) => !value)}
              className={`group flex-none inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-[#c3f400] text-[#0a1631] font-black text-sm uppercase tracking-wider transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_-12px_rgba(195,244,0,0.5)] active:scale-95 ${mounted ? 'animate-soft-rise' : 'opacity-0'}`}
              style={{ animationDelay: '150ms' }}
            >
              <Plus className={`w-5 h-5 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${isCreateOpen ? 'rotate-45' : 'group-hover:rotate-90'}`} />
              {isCreateOpen ? 'Close' : 'Post Team'}
            </button>
          </div>

          {/* Asymmetric info bar */}
          <div className="mt-4 md:mt-5 grid grid-cols-1 md:grid-cols-[2fr_3fr] gap-4">
            <div className={`bg-white/5 border-l-4 border-[#c3f400] rounded-[var(--radius-md)] px-5 py-4 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${mounted ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`} style={{ transitionDelay: '200ms' }}>
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#c3f400]">Joining As</p>
              <AppSelect
                className="mt-2 w-full bg-[#0a1631] text-white font-bold text-lg outline-none focus:text-[#c3f400] transition-colors duration-200"
                value={activeUserId}
                onChange={(event) => {
                  const nextUserId = event.target.value
                  setActiveUserState(nextUserId)
                }}
              >
              {usersData.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
                ))}
              </AppSelect>
            </div>

            <div className={`bg-white/5 border-l-4 border-white/20 rounded-[var(--radius-md)] px-5 py-4 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${mounted ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`} style={{ transitionDelay: '300ms' }}>
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-white/40">Rules</p>
              <p className="mt-2 text-sm font-semibold text-white/80">Joining requires creator approval. Approved slots cannot overlap.</p>
            </div>
          </div>
        </div>
      </header>

      <section className="px-5 md:px-6 lg:px-8 max-w-[1440px] mx-auto space-y-5 py-4 md:py-6">
        {feedback && (
          <div className={`bg-[#c3f400] rounded-[var(--radius-md)] px-6 py-4 text-sm font-black text-[#0a1631] uppercase tracking-wider transition-opacity duration-300 ${feedbackVisible ? 'opacity-100' : 'opacity-0'}`}>
            {feedback}
          </div>
        )}

        {isCreateOpen && (
          <form
            onSubmit={handleCreatePost}
            className="bg-[#0a1631] rounded-[var(--radius-lg)] p-4 md:p-6 space-y-4 animate-soft-drop border-l-4 border-[#c3f400]"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#c3f400] flex items-center justify-center">
                <Plus className="w-5 h-5 text-[#0a1631]" />
              </div>
              <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">Create Team Post</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <label className="group bg-white/5 rounded-[var(--radius-md)] px-4 py-3 border-l-2 border-transparent focus-within:border-[#c3f400] transition-colors duration-200">
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-white/40 group-focus-within:text-[#c3f400] transition-colors duration-200">Sport</span>
                <AppSelect
                  value={createForm.sport}
                  onChange={(event) => {
                    const value = event.target.value
                    const firstCourtForSport = courtsData.find((court) => {
                      const sportName = court.sport?.displayName ?? court.sport?.name ?? ''
                      return sportName === value
                    })

                    setCreateForm((prev) => ({
                      ...prev,
                      sport: value,
                      courtId: firstCourtForSport?.id ?? '',
                    }))
                  }}
                  className="mt-1.5 w-full bg-transparent text-white font-bold outline-none focus:text-[#c3f400] transition-colors duration-200"
                >
                  {availableSports.map((sport) => (
                    <option key={sport} value={sport}>
                      {sport}
                    </option>
                  ))}
                </AppSelect>
              </label>

              <label className="group bg-white/5 rounded-[var(--radius-md)] px-4 py-3 border-l-2 border-transparent focus-within:border-[#c3f400] transition-colors duration-200">
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-white/40 group-focus-within:text-[#c3f400] transition-colors duration-200">Court</span>
                <AppSelect
                  value={createForm.courtId}
                  onChange={(event) => {
                    setCreateForm((prev) => ({
                      ...prev,
                      courtId: event.target.value,
                    }))
                  }}
                  className="mt-1.5 w-full bg-transparent text-white font-bold outline-none focus:text-[#c3f400] transition-colors duration-200"
                >
                  {selectableCourts.length === 0 && (
                    <option value="">
                      No courts available
                    </option>
                  )}
                  {selectableCourts.map((court) => (
                    <option key={court.id} value={court.id}>
                      {court.name}
                    </option>
                  ))}
                </AppSelect>
              </label>

              <label className="group bg-white/5 rounded-[var(--radius-md)] px-4 py-3 border-l-2 border-transparent focus-within:border-[#c3f400] transition-colors duration-200">
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-white/40 group-focus-within:text-[#c3f400] transition-colors duration-200">Date</span>
                <input
                  type="date"
                  value={createForm.date}
                  min={toDateInputValue(new Date())}
                  onChange={(event) => {
                    setCreateForm((prev) => ({
                      ...prev,
                      date: event.target.value,
                    }))
                  }}
                  className="mt-1.5 w-full bg-transparent text-white font-bold outline-none focus:text-[#c3f400] transition-colors duration-200"
                />
              </label>

              <label className="group bg-white/5 rounded-[var(--radius-md)] px-4 py-3 border-l-2 border-transparent focus-within:border-[#c3f400] transition-colors duration-200">
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-white/40 group-focus-within:text-[#c3f400] transition-colors duration-200">Needed Players</span>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={createForm.neededPlayers}
                  onChange={(event) => {
                    setCreateForm((prev) => ({
                      ...prev,
                      neededPlayers: Number(event.target.value),
                    }))
                  }}
                  className="mt-1.5 w-full bg-transparent text-white font-bold outline-none focus:text-[#c3f400] transition-colors duration-200"
                />
              </label>

              <label className="group bg-white/5 rounded-[var(--radius-md)] px-4 py-3 border-l-2 border-transparent focus-within:border-[#c3f400] transition-colors duration-200">
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-white/40 group-focus-within:text-[#c3f400] transition-colors duration-200">Start Hour</span>
                <AppSelect
                  value={createForm.startHour}
                  onChange={(event) => {
                    setCreateForm((prev) => ({
                      ...prev,
                      startHour: Number(event.target.value),
                    }))
                  }}
                  className="mt-1.5 w-full bg-transparent text-white font-bold outline-none focus:text-[#c3f400] transition-colors duration-200"
                >
                  {startHourOptions.map((hour) => (
                    <option key={hour} value={hour}>
                      {formatHour(hour)}
                    </option>
                  ))}
                </AppSelect>
              </label>

              <label className="group bg-white/5 rounded-[var(--radius-md)] px-4 py-3 border-l-2 border-transparent focus-within:border-[#c3f400] transition-colors duration-200">
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-white/40 group-focus-within:text-[#c3f400] transition-colors duration-200">Duration</span>
                <AppSelect
                  value={createForm.durationHours}
                  onChange={(event) => {
                    setCreateForm((prev) => ({
                      ...prev,
                      durationHours: Number(event.target.value),
                    }))
                  }}
                  className="mt-1.5 w-full bg-transparent text-white font-bold outline-none focus:text-[#c3f400] transition-colors duration-200"
                >
                  {durationOptions.map((duration) => (
                    <option key={duration} value={duration}>
                      {duration} hour{duration > 1 ? 's' : ''}
                    </option>
                  ))}
                </AppSelect>
              </label>
            </div>

            <div className="bg-white/5 rounded-[var(--radius-md)] px-5 py-4 text-sm text-white/70">
              <p>
                Team size will be <strong className="text-[#c3f400]">{1 + createForm.neededPlayers}</strong> players including you ({activeUserName}).
              </p>
            </div>

            <button
              type="submit"
              disabled={!createForm.courtId}
              className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-[#c3f400] text-[#0a1631] font-black uppercase tracking-wider text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:-translate-y-1 hover:shadow-[0_16px_32px_-12px_rgba(195,244,0,0.4)] active:scale-95 transition-all duration-200"
            >
              Publish Team Post
            </button>
          </form>
        )}

        {/* Filter bar */}
        <div className={`flex flex-col md:flex-row md:items-end md:justify-between gap-4 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '180ms' }}>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/40 mb-1">Browse</p>
            <h2 className="text-3xl md:text-3xl font-black text-primary tracking-tight">Teams Feed</h2>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <AppSelect
              value={selectedSportFilter}
              onChange={(event) => setSelectedSportFilter(event.target.value as 'All' | CourtSport)}
              className="bg-primary text-white px-5 py-3 rounded-full text-sm font-black uppercase tracking-wider outline-none focus:ring-2 focus:ring-[#c3f400] transition-all duration-200"
            >
              <option value="All">All Sports</option>
              {availableSports.map((sport) => (
                <option key={sport} value={sport}>
                  {sport}
                </option>
              ))}
            </AppSelect>

            <input
              type="date"
              value={selectedDateFilter}
              onChange={(event) => setSelectedDateFilter(event.target.value)}
              className="bg-surface-container-high px-5 py-3 rounded-full text-sm font-bold text-primary outline-none focus:ring-2 focus:ring-[#c3f400] transition-all duration-200"
            />
          </div>
        </div>

        {/* Posts list */}
        <div className="space-y-4">
          {loading ? (
            <SkeletonStat />
          ) : filteredPosts.length === 0 ? (
            <div className="bg-surface-container-high rounded-[var(--radius-md)] px-8 py-6 text-center">
              <Users className="w-16 h-16 text-primary/20 mx-auto mb-4" />
              <p className="text-2xl font-black text-primary">No teams found</p>
              <p className="text-sm text-primary/60 mt-2">Try another sport/date filter or create a new post.</p>
            </div>
          ) : (
            filteredPosts.map((post, index) => {
            const joinedPlayers = 1 + post.memberUserIds.length
            const totalPlayers = 1 + post.neededPlayers
            const spotsLeft = Math.max(0, totalPlayers - joinedPlayers)
            const isCreator = post.createdByUserId === activeUserId
            const alreadyJoined = isCreator || post.memberUserIds.includes(activeUserId)
            const hasPendingRequest = post.requestedUserIds.includes(activeUserId)
            const canJoin = post.status === 'open' && !alreadyJoined && !hasPendingRequest
            const pendingRequestCount = post.requestedUserIds.length

            return (
              <article key={post.id} className={`group relative bg-surface-container-lowest rounded-[var(--radius-md)] border-l-4 ${post.status === 'full' ? 'border-primary' : 'border-[#c3f400]'} p-4 md:p-5 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_24px_48px_-20px_rgba(0,17,58,0.35)] ${mounted ? 'animate-soft-rise' : 'opacity-0'}`} style={{ animationDelay: `${200 + index * 80}ms` }}>
                {/* Status indicator */}
                <div className={`absolute top-0 right-0 px-4 py-1.5 rounded-bl-[var(--radius-md)] text-[10px] font-black uppercase tracking-[0.2em] ${post.status === 'full' ? 'bg-primary text-white' : 'bg-[#c3f400] text-[#0a1631]'}`}>
                  {post.status === 'full' ? 'Full' : 'Open'}
                </div>

                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
                  <div className="space-y-3 min-w-0 pr-16 lg:pr-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="inline-flex px-3 py-1.5 rounded-full bg-primary text-white text-xs font-black uppercase tracking-widest">
                        {stringValue(post.sport)}
                      </span>
                      {pendingRequestCount > 0 && (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-primary/50">
                          {pendingRequestCount} pending request{pendingRequestCount === 1 ? '' : 's'}
                        </span>
                      )}
                    </div>

                    <h3 className="text-xl md:text-2xl font-black text-primary leading-tight group-hover:translate-x-1 transition-transform duration-300">{post.courtTitle}</h3>

                    <p className="text-sm text-primary/60 inline-flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 flex-none" />
                      {post.courtLocation}
                    </p>

                    <div className="flex flex-wrap gap-3 text-xs text-primary/70">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-container-high px-3 py-1.5 font-semibold">
                        <CalendarDays className="w-3.5 h-3.5" /> {post.date}
                      </span>
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-container-high px-3 py-1.5 font-semibold">
                        <Clock3 className="w-3.5 h-3.5" /> {formatHour(post.startHour)} - {formatHour(post.endHour)}
                      </span>
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-container-high px-3 py-1.5 font-semibold">
                        <Users className="w-3.5 h-3.5" /> {joinedPlayers}/{totalPlayers} players
                      </span>
                    </div>

                    <p className="text-sm text-primary/60">
                      Created by <strong className="text-primary">{getUserNameById(post.createdByUserId)}</strong>
                    </p>
                  </div>

                  <div className="lg:w-[200px] space-y-2 flex flex-col">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black text-[#c3f400]">{spotsLeft}</span>
                      <span className="text-xs font-black uppercase tracking-wider text-primary/40">
                        spot{spotsLeft === 1 ? '' : 's'} left
                      </span>
                    </div>

                    <Link
                      href={`/teams/${post.id}`}
                      className="w-full inline-flex items-center justify-center px-4 py-3 rounded-full bg-surface-container-high text-primary font-bold text-sm hover:bg-[#c3f400] hover:text-[#0a1631] active:scale-95 transition-all duration-200"
                    >
                      View Details
                    </Link>

                    {alreadyJoined && (
                      <p className="text-sm font-black text-primary text-center py-1">
                        {isCreator ? 'You are the creator' : 'You already joined'}
                      </p>
                    )}

                    {hasPendingRequest && !alreadyJoined && (
                      <p className="text-sm font-black text-primary/60 text-center py-1">Request pending</p>
                    )}

                    <button
                      type="button"
                      disabled={!canJoin}
                      onClick={() => handleJoinTeam(post.id)}
                      className={`w-full inline-flex items-center justify-center px-4 py-3 rounded-full font-black text-sm uppercase tracking-wider transition-all duration-200 active:scale-95 ${
                        canJoin
                          ? 'bg-[#0a1631] text-white hover:-translate-y-1 hover:shadow-[0_12px_24px_-8px_rgba(10,22,49,0.5)]'
                          : 'bg-surface-container-high text-primary/40 cursor-not-allowed'
                      }`}
                    >
                      {post.status === 'full' ? 'Team Full' : hasPendingRequest ? 'Request Sent' : 'Request to Join'}
                    </button>
                  </div>
                </div>
              </article>
            )
            })
          )}
        </div>
      </section>

      <FloatingNav />
    </main>
  )
}

