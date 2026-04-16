'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, CalendarDays, Clock3, LogOut, MapPin, Trash2, UserPlus, Users } from 'lucide-react'
import { FloatingNav } from '@/components/layout/FloatingNav'
import { courts } from '@/lib/courts'
import {
  ACTIVE_USER_UPDATED_EVENT,
  TEAM_POSTS_UPDATED_EVENT,
  TeamPost,
  approveTeamJoinRequest,
  cancelTeamPost,
  getActiveUserId,
  getMockUsers,
  getTeamPosts,
  getUserNameById,
  leaveTeamPost,
  rejectTeamJoinRequest,
  requestJoinTeamPost,
  setActiveUserId,
} from '@/lib/teams'

function formatHour(hour: number) {
  return `${hour.toString().padStart(2, '0')}:00`
}

export default function TeamDetailsPage() {
  const router = useRouter()
  const params = useParams<{ teamId: string }>()
  const users = useMemo(() => getMockUsers(), [])

  const [activeUserId, setActiveUserState] = useState(getActiveUserId)
  const [teamPosts, setTeamPosts] = useState<TeamPost[]>(() => getTeamPosts())
  const [feedback, setFeedback] = useState('')
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false)

  const teamId = Array.isArray(params.teamId) ? params.teamId[0] : params.teamId

  useEffect(() => {
    const refreshPosts = () => {
      setTeamPosts(getTeamPosts())
    }

    const refreshActiveUser = () => {
      setActiveUserState(getActiveUserId())
    }

    window.addEventListener(TEAM_POSTS_UPDATED_EVENT, refreshPosts)
    window.addEventListener(ACTIVE_USER_UPDATED_EVENT, refreshActiveUser)

    return () => {
      window.removeEventListener(TEAM_POSTS_UPDATED_EVENT, refreshPosts)
      window.removeEventListener(ACTIVE_USER_UPDATED_EVENT, refreshActiveUser)
    }
  }, [])

  const post = useMemo(() => teamPosts.find((entry) => entry.id === teamId), [teamId, teamPosts])

  if (!post) {
    return (
      <main className="w-full min-h-screen bg-surface-container-low pb-[calc(8.5rem+env(safe-area-inset-bottom))] md:pb-[11rem] px-5 md:px-10 lg:px-14">
        <div className="max-w-3xl mx-auto pt-16 md:pt-20 text-center">
          <h1 className="text-2xl md:text-4xl font-extrabold text-primary">Team Not Found</h1>
          <p className="mt-2 text-primary/70">This team post was removed or no longer exists.</p>
          <Link
            href="/teams"
            className="mt-6 inline-flex items-center justify-center px-6 py-3 rounded-full bg-primary-container text-surface-container-lowest font-bold"
          >
            Back To Teams
          </Link>
        </div>
        <FloatingNav />
      </main>
    )
  }

  const court = courts.find((item) => item.id === post.courtId)
  const joinedPlayers = 1 + post.memberUserIds.length
  const totalPlayers = 1 + post.neededPlayers
  const spotsLeft = Math.max(0, totalPlayers - joinedPlayers)

  const isCreator = post.createdByUserId === activeUserId
  const isMember = post.memberUserIds.includes(activeUserId)
  const isParticipant = isCreator || isMember
  const hasPendingRequest = post.requestedUserIds.includes(activeUserId)
  const canJoin = post.status === 'open' && !isParticipant && !hasPendingRequest

  const handleJoin = () => {
    const result = requestJoinTeamPost(post.id, activeUserId)

    if (!result.ok) {
      setFeedback(result.error ?? 'Could not join this team.')
      return
    }

    setFeedback('Join request sent. Waiting for creator approval.')
  }

  const handleApproveRequest = (requestedUserId: string) => {
    const result = approveTeamJoinRequest(post.id, activeUserId, requestedUserId)

    if (!result.ok) {
      setFeedback(result.error ?? 'Could not approve this request.')
      return
    }

    setFeedback(`${getUserNameById(requestedUserId)} has been approved.`)
  }

  const handleRejectRequest = (requestedUserId: string) => {
    const result = rejectTeamJoinRequest(post.id, activeUserId, requestedUserId)

    if (!result.ok) {
      setFeedback(result.error ?? 'Could not reject this request.')
      return
    }

    setFeedback(`${getUserNameById(requestedUserId)} request was declined.`)
  }

  const handleLeave = () => {
    const result = leaveTeamPost(post.id, activeUserId)

    if (!result.ok) {
      setFeedback(result.error ?? 'Could not leave this team.')
      return
    }

    router.push('/teams?notice=left')
  }

  const handleCancel = () => {
    const result = cancelTeamPost(post.id, activeUserId)

    if (!result.ok) {
      setFeedback(result.error ?? 'Could not cancel this team.')
      return
    }

    setIsCancelConfirmOpen(false)
    router.push('/teams?notice=cancelled')
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
              post.status === 'full' ? 'bg-primary text-white' : 'bg-tertiary-fixed text-primary'
            }`}
          >
            {post.status === 'full' ? 'Full' : 'Open'}
          </span>
        </div>

        <div className="mt-4">
          <label className="bg-surface-container-high rounded-[var(--radius-md)] px-4 py-3 block max-w-[340px]">
            <span className="text-[10px] font-lexend font-bold uppercase tracking-[0.18em] text-primary/55">You are managing as</span>
            <select
              className="mt-1.5 w-full bg-transparent text-primary font-bold outline-none"
              value={activeUserId}
              onChange={(event) => {
                const nextUserId = event.target.value
                setActiveUserId(nextUserId)
                setActiveUserState(nextUserId)
              }}
            >
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          </label>
        </div>
      </header>

      <section className="px-5 md:px-10 lg:px-14 md:max-w-5xl md:mx-auto space-y-5">
        {feedback && (
          <div className="bg-tertiary-fixed rounded-[var(--radius-md)] px-4 py-3 text-sm font-semibold text-primary">
            {feedback}
          </div>
        )}

        <article className="bg-surface-container-lowest rounded-[var(--radius-lg)] p-4 md:p-5 shadow-ambient space-y-4">
          <div className="space-y-2 min-w-0">
            <span className="inline-flex px-2.5 py-1 rounded-full bg-surface-container-high text-primary text-[10px] font-lexend font-bold uppercase tracking-widest">
              {post.sport}
            </span>

            <h2 className="text-xl md:text-3xl font-black text-primary leading-tight">{court?.title ?? 'Selected Court'}</h2>

            <p className="text-sm text-primary/70 inline-flex items-center gap-1.5">
              <MapPin className="w-4 h-4" />
              {court?.location ?? 'Location unavailable'}
            </p>

            <div className="flex flex-wrap gap-2 text-xs text-primary/75">
              <span className="inline-flex items-center gap-1 rounded-full bg-surface-container-high px-2.5 py-1">
                <CalendarDays className="w-3.5 h-3.5" /> {post.date}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-surface-container-high px-2.5 py-1">
                <Clock3 className="w-3.5 h-3.5" /> {formatHour(post.startHour)} - {formatHour(post.endHour)}
              </span>
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
                <p className="font-bold text-primary">{getUserNameById(post.createdByUserId)}</p>
                <p className="text-xs text-primary/65">Creator</p>
              </div>
              <span className="inline-flex px-2.5 py-1 rounded-full bg-tertiary-fixed text-primary text-[10px] font-lexend font-bold uppercase tracking-widest">
                Host
              </span>
            </div>

            {post.memberUserIds.length === 0 && (
              <div className="rounded-[var(--radius-md)] bg-surface-container-high px-4 py-3 text-sm text-primary/75">
                No members joined yet.
              </div>
            )}

            {post.memberUserIds.map((memberUserId) => (
              <div key={memberUserId} className="rounded-[var(--radius-md)] bg-surface-container-high px-4 py-3 flex items-center justify-between gap-3">
                <p className="font-bold text-primary">{getUserNameById(memberUserId)}</p>
                {memberUserId === activeUserId && (
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
                {post.requestedUserIds.length} pending
              </p>
            </div>

            {post.requestedUserIds.length === 0 && (
              <div className="rounded-[var(--radius-md)] bg-surface-container-high px-4 py-3 text-sm text-primary/75">
                No pending requests yet.
              </div>
            )}

            {post.requestedUserIds.map((requestedUserId) => (
              <div
                key={requestedUserId}
                className="rounded-[var(--radius-md)] bg-surface-container-high px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
              >
                <p className="font-bold text-primary">{getUserNameById(requestedUserId)}</p>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleRejectRequest(requestedUserId)}
                    className="px-4 py-2 rounded-full bg-surface-container-lowest text-primary font-semibold"
                  >
                    Decline
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApproveRequest(requestedUserId)}
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
              onClick={handleLeave}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-surface-container-high text-primary font-bold"
            >
              <LogOut className="w-4 h-4" /> Leave Team
            </button>
          )}

          {isCreator && (
            <button
              type="button"
              onClick={() => setIsCancelConfirmOpen(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-red-100 text-red-700 font-bold"
            >
              <Trash2 className="w-4 h-4" /> Cancel Team Post
            </button>
          )}

          {!canJoin && !isMember && !isCreator && post.status === 'full' && (
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
