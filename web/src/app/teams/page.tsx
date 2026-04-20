'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { CalendarDays, Clock3, MapPin, Plus, Users } from 'lucide-react'
import { FloatingNav } from '@/components/layout/FloatingNav'
import { CourtSport, courtSports, courts } from '@/lib/courts'
import { useApiCall } from '@/lib/api/hooks'
import { stringValue } from '@/lib/api/extract'
import { api } from '@/lib/api/client'
import { APIErrorFallback } from '@/components/ui/ErrorBoundary'
import { SkeletonStat } from '@/components/ui/SkeletonLoader'

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
  const { data: teamsResponse, loading, error, refetch } = useApiCall('/teams')
  const { data: currentUser } = useApiCall<CurrentUser>('/users/me')

  const teamsData = useMemo(
    () => (Array.isArray(teamsResponse?.data) ? teamsResponse.data.map(normalizeTeamPost) : []),
    [teamsResponse],
  )
  const usersData = useMemo(
    () => (currentUser ? [currentUser] : []),
    [currentUser],
  )

  const availableSports = useMemo(() => {
    return courtSports
  }, [])

  const [activeUserId, setActiveUserState] = useState('')
  const [teamPosts, setTeamPosts] = useState<TeamPost[]>([])
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [feedback, setFeedback] = useState(getNoticeFeedbackFromUrl)
  const [selectedSportFilter, setSelectedSportFilter] = useState<'All' | CourtSport>('All')
  const [selectedDateFilter, setSelectedDateFilter] = useState('')

  const initialSport = availableSports[0] ?? 'Tennis'
  const initialCourt = courts.find((court) => court.sport === initialSport) ?? courts[0]

  const [createForm, setCreateForm] = useState<CreateFormState>({
    sport: initialSport,
    courtId: initialCourt?.id ?? '',
    date: toDateInputValue(new Date()),
    startHour: 18,
    durationHours: 1,
    neededPlayers: 3,
  })

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

  const filteredPosts = useMemo(() => {
    return teamPosts.filter((post) => {
      const sportMatch = selectedSportFilter === 'All' || post.sport === selectedSportFilter
      const dateMatch = selectedDateFilter === '' || post.date === selectedDateFilter
      return sportMatch && dateMatch
    })
  }, [selectedDateFilter, selectedSportFilter, teamPosts])

  const selectableCourts = useMemo(
    () => courts.filter((court) => court.sport === createForm.sport),
    [createForm.sport],
  )

  const handleCreatePost = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    try {
      await api.post('/teams', {
        courtId: createForm.courtId,
        date: createForm.date,
        startHour: createForm.startHour,
        endHour: createForm.startHour + createForm.durationHours,
        neededPlayers: createForm.neededPlayers,
      })
      setFeedback('Team post published successfully.')
      setCreateForm((prev) => ({
        ...prev,
        neededPlayers: 3,
      }))
      setIsCreateOpen(false)
      refetch()
    } catch (err) {
      setFeedback('Could not create your team post.')
    }
  }

  const handleJoinTeam = async (postId: string) => {
    try {
      await api.post(`/teams/${postId}/join`)
      setFeedback('Join request sent. Waiting for creator approval.')
      refetch()
    } catch (err) {
      setFeedback('Could not join this team.')
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
    <main className="w-full min-h-screen bg-surface-container-low pb-[calc(8.5rem+env(safe-area-inset-bottom))] md:pb-[11rem] relative">
      <header className="sticky top-0 z-40 bg-surface-container-low/90 backdrop-blur-xl px-5 pt-6 pb-4 md:px-10 lg:px-14 md:pt-8 md:pb-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-primary">Teams</h1>
            <p className="text-sm md:text-base text-primary/60 mt-1">Create squads, choose court slots, and join matches.</p>
          </div>

          <button
            type="button"
            onClick={() => setIsCreateOpen((value) => !value)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-primary-container text-surface-container-lowest font-bold text-sm"
          >
            <Plus className="w-4 h-4" />
            {isCreateOpen ? 'Close' : 'Post Team'}
          </button>
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="bg-surface-container-high rounded-[var(--radius-md)] px-4 py-3">
            <span className="text-[10px] font-lexend font-bold uppercase tracking-[0.18em] text-primary/55">You are joining as</span>
            <select
              className="mt-1.5 w-full bg-transparent text-primary font-bold outline-none"
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
            </select>
          </label>

          <div className="bg-surface-container-high rounded-[var(--radius-md)] px-4 py-3">
            <p className="text-[10px] font-lexend font-bold uppercase tracking-[0.18em] text-primary/55">Rules</p>
            <p className="mt-1.5 text-sm font-semibold text-primary">Joining requires creator approval. Approved slots cannot overlap.</p>
          </div>
        </div>
      </header>

      <section className="px-5 md:px-10 lg:px-14 md:max-w-6xl md:mx-auto space-y-5">
        {feedback && (
          <div className="bg-tertiary-fixed rounded-[var(--radius-md)] px-4 py-3 text-sm font-semibold text-primary">
            {feedback}
          </div>
        )}

        {isCreateOpen && (
          <form
            onSubmit={handleCreatePost}
            className="bg-surface-container-lowest rounded-[var(--radius-lg)] p-4 md:p-5 shadow-ambient space-y-4"
          >
            <h2 className="text-lg md:text-xl font-bold text-primary">Create Team Post</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <label className="bg-surface-container-high rounded-[var(--radius-md)] px-4 py-3">
                <span className="text-[10px] font-lexend font-bold uppercase tracking-[0.18em] text-primary/55">Sport</span>
                <select
                  value={createForm.sport}
                  onChange={(event) => {
                    const value = event.target.value as CourtSport
                    const firstCourtForSport = courts.find((court) => court.sport === value)

                    setCreateForm((prev) => ({
                      ...prev,
                      sport: value,
                      courtId: firstCourtForSport?.id ?? prev.courtId,
                    }))
                  }}
                  className="mt-1.5 w-full bg-transparent text-primary font-bold outline-none"
                >
                  {availableSports.map((sport) => (
                    <option key={sport} value={sport}>
                      {sport}
                    </option>
                  ))}
                </select>
              </label>

              <label className="bg-surface-container-high rounded-[var(--radius-md)] px-4 py-3">
                <span className="text-[10px] font-lexend font-bold uppercase tracking-[0.18em] text-primary/55">Court</span>
                <select
                  value={createForm.courtId}
                  onChange={(event) => {
                    setCreateForm((prev) => ({
                      ...prev,
                      courtId: event.target.value,
                    }))
                  }}
                  className="mt-1.5 w-full bg-transparent text-primary font-bold outline-none"
                >
                  {selectableCourts.map((court) => (
                    <option key={court.id} value={court.id}>
                      {court.title}
                    </option>
                  ))}
                </select>
              </label>

              <label className="bg-surface-container-high rounded-[var(--radius-md)] px-4 py-3">
                <span className="text-[10px] font-lexend font-bold uppercase tracking-[0.18em] text-primary/55">Date</span>
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
                  className="mt-1.5 w-full bg-transparent text-primary font-bold outline-none"
                />
              </label>

              <label className="bg-surface-container-high rounded-[var(--radius-md)] px-4 py-3">
                <span className="text-[10px] font-lexend font-bold uppercase tracking-[0.18em] text-primary/55">Needed Players</span>
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
                  className="mt-1.5 w-full bg-transparent text-primary font-bold outline-none"
                />
              </label>

              <label className="bg-surface-container-high rounded-[var(--radius-md)] px-4 py-3">
                <span className="text-[10px] font-lexend font-bold uppercase tracking-[0.18em] text-primary/55">Start Hour</span>
                <select
                  value={createForm.startHour}
                  onChange={(event) => {
                    setCreateForm((prev) => ({
                      ...prev,
                      startHour: Number(event.target.value),
                    }))
                  }}
                  className="mt-1.5 w-full bg-transparent text-primary font-bold outline-none"
                >
                  {startHourOptions.map((hour) => (
                    <option key={hour} value={hour}>
                      {formatHour(hour)}
                    </option>
                  ))}
                </select>
              </label>

              <label className="bg-surface-container-high rounded-[var(--radius-md)] px-4 py-3">
                <span className="text-[10px] font-lexend font-bold uppercase tracking-[0.18em] text-primary/55">Duration</span>
                <select
                  value={createForm.durationHours}
                  onChange={(event) => {
                    setCreateForm((prev) => ({
                      ...prev,
                      durationHours: Number(event.target.value),
                    }))
                  }}
                  className="mt-1.5 w-full bg-transparent text-primary font-bold outline-none"
                >
                  {durationOptions.map((duration) => (
                    <option key={duration} value={duration}>
                      {duration} hour{duration > 1 ? 's' : ''}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="bg-surface-container-high rounded-[var(--radius-md)] px-4 py-3 text-sm text-primary/80">
              <p>
                Team size will be <strong>{1 + createForm.neededPlayers}</strong> players including you ({activeUserName}).
              </p>
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-3 rounded-full bg-secondary-container text-on-secondary-container font-bold"
            >
              Publish Team Post
            </button>
          </form>
        )}

        <section className="bg-surface-container-lowest rounded-[var(--radius-lg)] p-4 md:p-5 shadow-ambient space-y-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <h2 className="text-lg md:text-xl font-bold text-primary">Teams Feed</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full md:w-auto">
              <select
                value={selectedSportFilter}
                onChange={(event) => setSelectedSportFilter(event.target.value as 'All' | CourtSport)}
                className="bg-surface-container-high rounded-full px-4 py-2.5 text-sm font-semibold text-primary outline-none"
              >
                <option value="All">All Sports</option>
                {availableSports.map((sport) => (
                  <option key={sport} value={sport}>
                    {sport}
                  </option>
                ))}
              </select>

              <input
                type="date"
                value={selectedDateFilter}
                onChange={(event) => setSelectedDateFilter(event.target.value)}
                className="bg-surface-container-high rounded-full px-4 py-2.5 text-sm font-semibold text-primary outline-none"
              />
            </div>
          </div>

          {loading ? (
            <SkeletonStat />
          ) : filteredPosts.length === 0 ? (
            <div className="rounded-[var(--radius-md)] bg-surface-container-high px-4 py-6 text-center">
              <p className="text-lg font-bold text-primary">No teams found</p>
              <p className="text-sm text-primary/70 mt-1">Try another sport/date filter or create a new post.</p>
            </div>
          ) : (
            filteredPosts.map((post) => {
            const joinedPlayers = 1 + post.memberUserIds.length
            const totalPlayers = 1 + post.neededPlayers
            const spotsLeft = Math.max(0, totalPlayers - joinedPlayers)
            const isCreator = post.createdByUserId === activeUserId
            const alreadyJoined = isCreator || post.memberUserIds.includes(activeUserId)
            const hasPendingRequest = post.requestedUserIds.includes(activeUserId)
            const canJoin = post.status === 'open' && !alreadyJoined && !hasPendingRequest
            const pendingRequestCount = post.requestedUserIds.length

            return (
              <article key={post.id} className="rounded-[var(--radius-md)] bg-surface-container-high p-4 md:p-5">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="space-y-2 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="inline-flex px-2.5 py-1 rounded-full bg-tertiary-fixed text-primary text-[10px] font-lexend font-bold uppercase tracking-widest">
                        {stringValue(post.sport)}
                      </span>
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-lexend font-bold uppercase tracking-widest ${
                          post.status === 'full' ? 'bg-primary text-white' : 'bg-surface-container-lowest text-primary'
                        }`}
                      >
                        {post.status === 'full' ? 'Full' : 'Open'}
                      </span>
                    </div>

                    <h3 className="text-lg md:text-xl font-black text-primary leading-tight">{post.courtTitle}</h3>

                    <p className="text-sm text-primary/70 inline-flex items-center gap-1.5">
                      <MapPin className="w-4 h-4" />
                      {post.courtLocation}
                    </p>

                    <div className="flex flex-wrap gap-2 text-xs text-primary/75">
                      <span className="inline-flex items-center gap-1 rounded-full bg-surface-container-lowest px-2.5 py-1">
                        <CalendarDays className="w-3.5 h-3.5" /> {post.date}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-surface-container-lowest px-2.5 py-1">
                        <Clock3 className="w-3.5 h-3.5" /> {formatHour(post.startHour)} - {formatHour(post.endHour)}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-surface-container-lowest px-2.5 py-1">
                        <Users className="w-3.5 h-3.5" /> {joinedPlayers}/{totalPlayers} players
                      </span>
                    </div>

                    <p className="text-sm text-primary/75">
                      Created by <strong>{getUserNameById(post.createdByUserId)}</strong>.
                    </p>

                    {pendingRequestCount > 0 && (
                      <p className="text-xs text-primary/65">
                        {pendingRequestCount} join request{pendingRequestCount === 1 ? '' : 's'} waiting for approval.
                      </p>
                    )}
                  </div>

                  <div className="min-w-[170px] space-y-2">
                    <p className="text-xs font-lexend font-bold uppercase tracking-[0.18em] text-primary/50">
                      {spotsLeft} spot{spotsLeft === 1 ? '' : 's'} left
                    </p>

                    <Link
                      href={`/teams/${post.id}`}
                      className="w-full inline-flex items-center justify-center px-4 py-2.5 rounded-full bg-surface-container-lowest text-primary font-bold"
                    >
                      View Details
                    </Link>

                    {alreadyJoined && (
                      <p className="text-sm font-semibold text-primary">
                        {isCreator ? 'You are the creator' : 'You already joined'}
                      </p>
                    )}

                    {hasPendingRequest && !alreadyJoined && (
                      <p className="text-sm font-semibold text-primary">Request pending creator approval</p>
                    )}

                    <button
                      type="button"
                      disabled={!canJoin}
                      onClick={() => handleJoinTeam(post.id)}
                      className="w-full inline-flex items-center justify-center px-4 py-2.5 rounded-full bg-primary-container text-surface-container-lowest font-bold disabled:opacity-45 disabled:cursor-not-allowed"
                    >
                      {post.status === 'full' ? 'Team Full' : hasPendingRequest ? 'Request Sent' : 'Request to Join'}
                    </button>
                  </div>
                </div>
              </article>
            )
            })
          )}
        </section>
      </section>

      <FloatingNav />
    </main>
  )
}
