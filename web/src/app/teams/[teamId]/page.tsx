'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, CalendarDays, Clock3, LogOut, MapPin, Trash2, UserPlus, Users } from 'lucide-react'
import { FloatingNav } from '@/components/layout/FloatingNav'
import { useApiCall } from '@/lib/api/hooks'
import { stringValue } from '@/lib/api/extract'
import { api } from '@/lib/api/client'
import { APIErrorFallback } from '@/components/ui/ErrorBoundary'

function formatHour(hour: number) {
  return `${hour.toString().padStart(2, '0')}:00`
}

interface TeamMember {
  id: string
  name: string
  avatar?: string
}

interface JoinRequest {
  id: string
  userId: string
  userName: string
  status: string
}

interface TeamData {
  id: string
  sport?: string
  courtId?: string
  courtName?: string
  courtLocation?: string
  date?: string
  startHour?: number
  endHour?: number
  status?: string
  neededPlayers?: number
  creator?: TeamMember
  members?: TeamMember[]
  joinRequests?: JoinRequest[]
  createdBy?: string
  memberUserIds?: string[]
  requestedUserIds?: string[]
}

interface CurrentUser {
  id: string
  name: string
}

export default function TeamDetailsPage() {
  const router = useRouter()
  const params = useParams<{ teamId: string }>()
  const teamId = Array.isArray(params.teamId) ? params.teamId[0] : params.teamId

  const { data: post, loading, error, refetch } = useApiCall<TeamData>(`/teams/${teamId}`)
  const { data: currentUserData } = useApiCall<CurrentUser>('/users/me')

  const [feedback, setFeedback] = useState('')
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  const currentUser = (() => {
    if (!currentUserData) return null
    const d = (currentUserData as any)?.data
    return d && typeof d === 'object' && !Array.isArray(d) ? d : currentUserData
  })()
  const activeUserId = currentUser?.id || ''
  const activeUserName = currentUser?.name || ''

  if (error) {
    return (
      <main className="w-full min-h-screen bg-surface-container-low pb-[calc(8.5rem+env(safe-area-inset-bottom))] md:pb-[11rem] px-5 md:px-10 lg:px-14">
        <div className="max-w-3xl mx-auto pt-16 md:pt-20">
          <APIErrorFallback error={error as any} onRetry={refetch} />
        </div>
        <FloatingNav />
      </main>
    )
  }

  if (loading || !post) {
    return (
      <main className="w-full min-h-screen bg-surface-container-low pb-[calc(8.5rem+env(safe-area-inset-bottom))] md:pb-[11rem] px-5 md:px-10 lg:px-14">
        <div className="max-w-3xl mx-auto pt-16 md:pt-20 space-y-4">
          <div className="h-8 w-48 bg-surface-container-low rounded animate-pulse" />
          <div className="h-64 bg-surface-container-lowest rounded-[var(--radius-lg)] p-5 shadow-ambient animate-pulse" />
          <div className="h-48 bg-surface-container-lowest rounded-[var(--radius-lg)] p-5 shadow-ambient animate-pulse" />
        </div>
        <FloatingNav />
      </main>
    )
  }

  const creatorId = post.createdBy || post.creator?.id || ''
  const creatorName = post.creator?.name || ''
  const memberList = post.members || []
  const joinRequests = post.joinRequests || []
  const pendingRequests = joinRequests.filter((r) => r.status === 'PENDING' || !r.status)
  const memberUserIds = post.memberUserIds || memberList.map((m) => m.id)
  const requestedUserIds = post.requestedUserIds || pendingRequests.map((r) => r.userId)

  const joinedPlayers = 1 + memberUserIds.length
  const totalPlayers = 1 + (post.neededPlayers || 0)
  const spotsLeft = Math.max(0, totalPlayers - joinedPlayers)

  const isCreator = creatorId === activeUserId
  const isMember = memberUserIds.includes(activeUserId)
  const isParticipant = isCreator || isMember
  const hasPendingRequest = requestedUserIds.includes(activeUserId)
  const canJoin = (post.status === 'open' || post.status === 'OPEN') && !isParticipant && !hasPendingRequest

  const courtTitle = post.courtName || 'Selected Court'
  const courtLocation = post.courtLocation || 'Location unavailable'

  const handleJoin = async () => {
    setActionLoading(true)
    try {
      await api.post(`/teams/${post.id}/join`)
      setFeedback('Join request sent. Waiting for creator approval.')
      await refetch()
    } catch {
      setFeedback('Could not join this team. Please try again.')
    } finally {
      setActionLoading(false)
    }
  }

  const handleApproveRequest = async (requestId: string, userName: string) => {
    setActionLoading(true)
    try {
      await api.post(`/teams/requests/${requestId}/respond`, { status: 'APPROVED' })
      setFeedback(`${userName} has been approved.`)
      await refetch()
    } catch {
      setFeedback('Could not approve this request.')
    } finally {
      setActionLoading(false)
    }
  }

  const handleRejectRequest = async (requestId: string, userName: string) => {
    setActionLoading(true)
    try {
      await api.post(`/teams/requests/${requestId}/respond`, { status: 'REJECTED' })
      setFeedback(`${userName} request was declined.`)
      await refetch()
    } catch {
      setFeedback('Could not reject this request.')
    } finally {
      setActionLoading(false)
    }
  }

  const handleLeave = async () => {
    setActionLoading(true)
    try {
      await api.post(`/teams/${post.id}/leave`)
      router.push('/teams?notice=left')
    } catch {
      setFeedback('Could not leave this team.')
    } finally {
      setActionLoading(false)
    }
  }

  const handleCancel = async () => {
    setActionLoading(true)
    try {
      await api.post(`/teams/${post.id}/cancel`)
      setIsCancelConfirmOpen(false)
      router.push('/teams?notice=cancelled')
    } catch {
      setFeedback('Could not cancel this team.')
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <main className="w-full min-h-screen bg-surface-container-low pb-[calc(8.5rem+env(safe-area-inset-bottom))] md:pb-[11rem] relative">
      <header className="sticky top-0 z-40 bg-surface-container-low/90 backdrop-blur-xl px-5 pt-6 pb-4 md:px-10 lg:px-14 md:pt-8 md:pb-6">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2">
            <Link
              href="/teams"
              className="inline-flex items-center gap-2 text-sm font-bold text-primary/80 hover:text-primary"
            >
              <ArrowLeft className="w-4 h-4" /> Back to teams
            </Link>
            <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-primary">Team Details</h1>
          </div>

          <span
            className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-lexend font-bold uppercase tracking-widest self-center ${
              post.status === 'full' || post.status === 'FULL' ? 'bg-primary text-white' : 'bg-tertiary-fixed text-primary'
            }`}
          >
            {post.status === 'full' || post.status === 'FULL' ? 'Full' : 'Open'}
          </span>
        </div>

        {activeUserId && (
          <div className="mt-4 px-3 py-2 bg-surface-container-high rounded-[var(--radius-md)] inline-flex items-center gap-2">
            <span className="text-[10px] font-lexend font-bold uppercase tracking-[0.18em] text-primary/55">Signed in as</span>
            <span className="text-sm font-bold text-primary">{activeUserName || activeUserId}</span>
          </div>
        )}
      </header>

      <section className="px-5 md:px-10 lg:px-14 md:max-w-5xl md:mx-auto space-y-5">
        {feedback && (
          <div className="bg-tertiary-fixed rounded-[var(--radius-md)] px-4 py-3 text-sm font-semibold text-primary">
            {feedback}
          </div>
        )}

        <article className="bg-surface-container-lowest rounded-[var(--radius-lg)] p-4 md:p-5 shadow-ambient space-y-4">
          <div className="space-y-2 min-w-0">
            {post.sport && (
              <span className="inline-flex px-2.5 py-1 rounded-full bg-surface-container-high text-primary text-[10px] font-lexend font-bold uppercase tracking-widest">
                {stringValue(post.sport)}
              </span>
            )}

            <h2 className="text-xl md:text-3xl font-black text-primary leading-tight">{courtTitle}</h2>

            <p className="text-sm text-primary/70 inline-flex items-center gap-1.5">
              <MapPin className="w-4 h-4" />
              {courtLocation}
            </p>

            <div className="flex flex-wrap gap-2 text-xs text-primary/75">
              {post.date && (
                <span className="inline-flex items-center gap-1 rounded-full bg-surface-container-high px-2.5 py-1">
                  <CalendarDays className="w-3.5 h-3.5" /> {post.date}
                </span>
              )}
              {(post.startHour !== undefined && post.endHour !== undefined) && (
                <span className="inline-flex items-center gap-1 rounded-full bg-surface-container-high px-2.5 py-1">
                  <Clock3 className="w-3.5 h-3.5" /> {formatHour(post.startHour)} - {formatHour(post.endHour)}
                </span>
              )}
              <span className="inline-flex items-center gap-1 rounded-full bg-surface-container-high px-2.5 py-1">
                <Users className="w-3.5 h-3.5" /> {joinedPlayers}/{totalPlayers} players
              </span>
            </div>
          </div>
        </article>

        <article className="bg-surface-container-lowest rounded-[var(--radius-lg)] p-4 md:p-5 shadow-ambient space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg md:text-xl font-bold text-primary">Team Members</h3>
            <p className="text-xs font-lexend font-bold uppercase tracking-[0.18em] text-primary/55">
              {spotsLeft} spot{spotsLeft === 1 ? '' : 's'} left
            </p>
          </div>

          <div className="space-y-2">
            <div className="rounded-[var(--radius-md)] bg-surface-container-high px-4 py-3 flex items-center justify-between gap-3">
              <div>
                <p className="font-bold text-primary">{creatorName || 'Creator'}</p>
                <p className="text-xs text-primary/65">Creator</p>
              </div>
              <span className="inline-flex px-2.5 py-1 rounded-full bg-tertiary-fixed text-primary text-[10px] font-lexend font-bold uppercase tracking-widest">
                Host
              </span>
            </div>

            {memberList.length === 0 && memberUserIds.length === 0 && (
              <div className="rounded-[var(--radius-md)] bg-surface-container-high px-4 py-3 text-sm text-primary/75">
                No members joined yet.
              </div>
            )}

            {memberList.map((member) => (
              <div key={member.id} className="rounded-[var(--radius-md)] bg-surface-container-high px-4 py-3 flex items-center justify-between gap-3">
                <p className="font-bold text-primary">{member.name}</p>
                {member.id === activeUserId && (
                  <span className="text-xs font-semibold text-primary/75">You</span>
                )}
              </div>
            ))}
          </div>
        </article>

        {isCreator && (
          <article className="bg-surface-container-lowest rounded-[var(--radius-lg)] p-4 md:p-5 shadow-ambient space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-lg md:text-xl font-bold text-primary">Join Requests</h3>
              <p className="text-xs font-lexend font-bold uppercase tracking-[0.18em] text-primary/55">
                {pendingRequests.length} pending
              </p>
            </div>

            {pendingRequests.length === 0 && (
              <div className="rounded-[var(--radius-md)] bg-surface-container-high px-4 py-3 text-sm text-primary/75">
                No pending requests yet.
              </div>
            )}

            {pendingRequests.map((request) => (
              <div
                key={request.id}
                className="rounded-[var(--radius-md)] bg-surface-container-high px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
              >
                <p className="font-bold text-primary">{request.userName || request.userId}</p>

                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => handleRejectRequest(request.id, request.userName || request.userId)}
                    className="px-4 py-2 rounded-full bg-surface-container-lowest text-primary font-semibold"
                  >
                    Decline
                  </button>
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => handleApproveRequest(request.id, request.userName || request.userId)}
                    className="px-4 py-2 rounded-full bg-primary-container text-surface-container-lowest font-semibold"
                  >
                    Approve
                  </button>
                </div>
              </div>
            ))}
          </article>
        )}

        <article className="bg-surface-container-lowest rounded-[var(--radius-lg)] p-4 md:p-5 shadow-ambient space-y-3">
          <h3 className="text-lg md:text-xl font-bold text-primary">Actions</h3>

          {canJoin && (
            <button
              type="button"
              disabled={actionLoading}
              onClick={handleJoin}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-primary-container text-surface-container-lowest font-bold"
            >
              <UserPlus className="w-4 h-4" /> Request to Join
            </button>
          )}

          {hasPendingRequest && !isParticipant && (
            <p className="text-sm font-semibold text-primary/75">Your request is pending creator approval.</p>
          )}

          {isMember && (
            <button
              type="button"
              disabled={actionLoading}
              onClick={handleLeave}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-surface-container-high text-primary font-bold"
            >
              <LogOut className="w-4 h-4" /> Leave Team
            </button>
          )}

          {isCreator && (
            <button
              type="button"
              disabled={actionLoading}
              onClick={() => setIsCancelConfirmOpen(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-red-100 text-red-700 font-bold"
            >
              <Trash2 className="w-4 h-4" /> Cancel Team Post
            </button>
          )}

          {!canJoin && !isMember && !isCreator && (post.status === 'full' || post.status === 'FULL') && (
            <p className="text-sm font-semibold text-primary/75">This team is already full.</p>
          )}
        </article>
      </section>

      {isCancelConfirmOpen && (
        <div
          className="fixed inset-0 z-[90] bg-primary/35 backdrop-blur-sm p-4 md:p-6 flex items-center justify-center"
          onClick={() => setIsCancelConfirmOpen(false)}
        >
          <div
            className="w-full max-w-md bg-surface-container-lowest rounded-[var(--radius-lg)] shadow-ambient p-5 md:p-6"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Confirm team cancellation"
          >
            <h3 className="text-xl font-extrabold text-primary">Cancel Team Post?</h3>
            <p className="text-sm text-primary/70 mt-2">
              This action cannot be undone and all joined members will be notified.
            </p>

            <div className="mt-5 flex flex-col sm:flex-row gap-2.5 sm:justify-end">
              <button
                type="button"
                onClick={() => setIsCancelConfirmOpen(false)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-full bg-surface-container-high text-primary font-bold"
              >
                Keep Team
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleCancel}
                className="w-full sm:w-auto px-4 py-2.5 rounded-full bg-red-100 text-red-700 font-bold"
              >
                Yes, Cancel Team
              </button>
            </div>
          </div>
        </div>
      )}

      <FloatingNav />
    </main>
  )
}