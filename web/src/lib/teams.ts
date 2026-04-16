import { addNotifications } from '@/lib/notifications'
import { CourtSport, courts } from '@/lib/courts'

export type MockUser = {
  id: string
  name: string
}

export type TeamPostStatus = 'open' | 'full'

export type TeamPost = {
  id: string
  createdByUserId: string
  createdAt: string
  sport: CourtSport
  courtId: string
  date: string
  startHour: number
  endHour: number
  neededPlayers: number
  memberUserIds: string[]
  status: TeamPostStatus
}

export type TeamActionResult = {
  ok: boolean
  error?: string
}

type CreateTeamPostInput = {
  createdByUserId: string
  sport: CourtSport
  courtId: string
  date: string
  startHour: number
  durationHours: number
  neededPlayers: number
}

const TEAM_POSTS_STORAGE_KEY = 'sportbook-team-posts-v1'
const ACTIVE_USER_STORAGE_KEY = 'sportbook-active-user-v1'

export const TEAM_POSTS_UPDATED_EVENT = 'sportbook-team-posts-updated'
export const ACTIVE_USER_UPDATED_EVENT = 'sportbook-active-user-updated'

export const mockUsers: MockUser[] = [
  { id: 'usr-001', name: 'Alex Rivera' },
  { id: 'usr-002', name: 'Lina Farouk' },
  { id: 'usr-003', name: 'Omar Hassan' },
  { id: 'usr-004', name: 'Nora Salem' },
  { id: 'usr-005', name: 'Samir Ali' },
]

function canUseStorage() {
  return typeof window !== 'undefined'
}

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function dispatchTeamPostsUpdated(posts: TeamPost[]) {
  if (!canUseStorage()) return

  window.dispatchEvent(
    new CustomEvent(TEAM_POSTS_UPDATED_EVENT, {
      detail: posts,
    }),
  )
}

function dispatchActiveUserUpdated(userId: string) {
  if (!canUseStorage()) return

  window.dispatchEvent(
    new CustomEvent(ACTIVE_USER_UPDATED_EVENT, {
      detail: userId,
    }),
  )
}

function normalizeTeamPost(post: TeamPost): TeamPost {
  return {
    ...post,
    neededPlayers: Math.max(1, Math.floor(post.neededPlayers)),
    startHour: Math.max(0, Math.floor(post.startHour)),
    endHour: Math.max(1, Math.floor(post.endHour)),
    memberUserIds: Array.from(new Set(post.memberUserIds)),
    status: post.status === 'full' ? 'full' : 'open',
  }
}

function isParticipant(post: TeamPost, userId: string) {
  return post.createdByUserId === userId || post.memberUserIds.includes(userId)
}

function hasSlotOverlap(
  left: { date: string; startHour: number; endHour: number },
  right: { date: string; startHour: number; endHour: number },
) {
  if (left.date !== right.date) return false
  return left.startHour < right.endHour && right.startHour < left.endHour
}

function formatHour(hour: number) {
  return `${hour.toString().padStart(2, '0')}:00`
}

function getAllPostsInternal(): TeamPost[] {
  if (!canUseStorage()) return []

  const raw = window.localStorage.getItem(TEAM_POSTS_STORAGE_KEY)
  if (!raw) return []

  try {
    const parsed = JSON.parse(raw) as TeamPost[]
    if (!Array.isArray(parsed)) return []
    return parsed.map(normalizeTeamPost)
  } catch {
    return []
  }
}

function setAllPostsInternal(posts: TeamPost[]) {
  if (!canUseStorage()) return

  const normalized = posts.map(normalizeTeamPost)
  window.localStorage.setItem(TEAM_POSTS_STORAGE_KEY, JSON.stringify(normalized))
  dispatchTeamPostsUpdated(normalized)
}

function emitTeamFullNotifications(post: TeamPost) {
  const court = courts.find((item) => item.id === post.courtId)
  const recipients = Array.from(new Set([post.createdByUserId, ...post.memberUserIds]))

  addNotifications(
    recipients.flatMap((userId) => {
      const title = 'Team is full'
      const description = `${post.sport} team at ${court?.title ?? 'selected court'} on ${post.date} (${formatHour(
        post.startHour,
      )}-${formatHour(post.endHour)}) is now complete.`

      return [
        { userId, channel: 'in-app' as const, title, description },
        { userId, channel: 'email' as const, title, description },
        { userId, channel: 'push' as const, title, description },
      ]
    }),
  )
}

function emitTeamCancelledNotifications(post: TeamPost) {
  if (post.memberUserIds.length === 0) return

  const court = courts.find((item) => item.id === post.courtId)

  addNotifications(
    post.memberUserIds.flatMap((userId) => {
      const title = 'Team was cancelled'
      const description = `${post.sport} team at ${court?.title ?? 'selected court'} on ${post.date} (${formatHour(
        post.startHour,
      )}-${formatHour(post.endHour)}) was cancelled by the creator.`

      return [
        { userId, channel: 'in-app' as const, title, description },
        { userId, channel: 'email' as const, title, description },
        { userId, channel: 'push' as const, title, description },
      ]
    }),
  )
}

export function getActiveUserId() {
  if (!canUseStorage()) return mockUsers[0].id

  const raw = window.localStorage.getItem(ACTIVE_USER_STORAGE_KEY)
  if (!raw) {
    window.localStorage.setItem(ACTIVE_USER_STORAGE_KEY, mockUsers[0].id)
    return mockUsers[0].id
  }

  if (mockUsers.some((user) => user.id === raw)) return raw

  window.localStorage.setItem(ACTIVE_USER_STORAGE_KEY, mockUsers[0].id)
  return mockUsers[0].id
}

export function setActiveUserId(userId: string) {
  if (!canUseStorage()) return
  if (!mockUsers.some((user) => user.id === userId)) return

  window.localStorage.setItem(ACTIVE_USER_STORAGE_KEY, userId)
  dispatchActiveUserUpdated(userId)
}

export function getMockUsers() {
  return mockUsers
}

export function getUserNameById(userId: string) {
  return mockUsers.find((user) => user.id === userId)?.name ?? 'Unknown Player'
}

export function getTeamPosts() {
  return getAllPostsInternal().sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1))
}

export function getTeamPostById(postId: string) {
  return getAllPostsInternal().find((post) => post.id === postId)
}

export function getAvailableTeamSports(): CourtSport[] {
  return Array.from(new Set(courts.map((court) => court.sport))) as CourtSport[]
}

export function createTeamPost(input: CreateTeamPostInput): TeamActionResult {
  const court = courts.find((item) => item.id === input.courtId)
  if (!court) return { ok: false, error: 'Please select a valid court.' }
  if (court.sport !== input.sport) {
    return { ok: false, error: 'The selected court does not match the chosen sport.' }
  }

  if (!input.date) return { ok: false, error: 'Please select a valid date.' }
  if (input.startHour < 0 || input.startHour > 23) {
    return { ok: false, error: 'Start hour is not valid.' }
  }
  if (input.durationHours < 1 || input.durationHours > 6) {
    return { ok: false, error: 'Duration must be between 1 and 6 hours.' }
  }

  const endHour = input.startHour + input.durationHours
  if (endHour > 24) {
    return { ok: false, error: 'Selected time slot goes past end of day.' }
  }

  if (input.neededPlayers < 1) {
    return { ok: false, error: 'Needed players must be at least 1.' }
  }

  const posts = getAllPostsInternal()

  const creatorConflict = posts.some((post) => {
    if (!isParticipant(post, input.createdByUserId)) return false

    return hasSlotOverlap(
      { date: post.date, startHour: post.startHour, endHour: post.endHour },
      { date: input.date, startHour: input.startHour, endHour },
    )
  })

  if (creatorConflict) {
    return { ok: false, error: 'You already have a team in an overlapping time slot.' }
  }

  const courtConflict = posts.some((post) => {
    if (post.courtId !== input.courtId) return false

    return hasSlotOverlap(
      { date: post.date, startHour: post.startHour, endHour: post.endHour },
      { date: input.date, startHour: input.startHour, endHour },
    )
  })

  if (courtConflict) {
    return { ok: false, error: 'This court already has a team in that time slot.' }
  }

  const nextPost: TeamPost = {
    id: createId('team'),
    createdByUserId: input.createdByUserId,
    createdAt: new Date().toISOString(),
    sport: input.sport,
    courtId: input.courtId,
    date: input.date,
    startHour: input.startHour,
    endHour,
    neededPlayers: Math.floor(input.neededPlayers),
    memberUserIds: [],
    status: 'open',
  }

  setAllPostsInternal([nextPost, ...posts])
  return { ok: true }
}

export function joinTeamPost(postId: string, userId: string): TeamActionResult {
  const posts = getAllPostsInternal()
  const post = posts.find((item) => item.id === postId)

  if (!post) return { ok: false, error: 'This team post no longer exists.' }

  if (post.createdByUserId === userId) {
    return { ok: false, error: 'You are already on this team as the creator.' }
  }

  if (post.memberUserIds.includes(userId)) {
    return { ok: false, error: 'You already joined this team.' }
  }

  if (post.status === 'full') {
    return { ok: false, error: 'This team is already full.' }
  }

  const userConflict = posts.some((otherPost) => {
    if (otherPost.id === post.id) return false
    if (!isParticipant(otherPost, userId)) return false

    return hasSlotOverlap(
      { date: otherPost.date, startHour: otherPost.startHour, endHour: otherPost.endHour },
      { date: post.date, startHour: post.startHour, endHour: post.endHour },
    )
  })

  if (userConflict) {
    return { ok: false, error: 'You cannot join because this overlaps one of your other teams.' }
  }

  const nextMemberUserIds = [...post.memberUserIds, userId]
  const totalPlayers = 1 + nextMemberUserIds.length
  const requiredPlayers = 1 + post.neededPlayers
  const isNowFull = totalPlayers >= requiredPlayers

  const nextPost: TeamPost = {
    ...post,
    memberUserIds: nextMemberUserIds,
    status: isNowFull ? 'full' : 'open',
  }

  const nextPosts = posts.map((item) => (item.id === post.id ? nextPost : item))
  setAllPostsInternal(nextPosts)

  if (isNowFull) {
    emitTeamFullNotifications(nextPost)
  }

  return { ok: true }
}

export function leaveTeamPost(postId: string, userId: string): TeamActionResult {
  const posts = getAllPostsInternal()
  const post = posts.find((item) => item.id === postId)

  if (!post) return { ok: false, error: 'This team post no longer exists.' }

  if (post.createdByUserId === userId) {
    return { ok: false, error: 'Creators cannot leave their own team. Cancel it instead.' }
  }

  if (!post.memberUserIds.includes(userId)) {
    return { ok: false, error: 'You are not currently on this team.' }
  }

  const nextMemberUserIds = post.memberUserIds.filter((memberId) => memberId !== userId)
  const totalPlayers = 1 + nextMemberUserIds.length
  const requiredPlayers = 1 + post.neededPlayers

  const nextPost: TeamPost = {
    ...post,
    memberUserIds: nextMemberUserIds,
    status: totalPlayers >= requiredPlayers ? 'full' : 'open',
  }

  const nextPosts = posts.map((item) => (item.id === post.id ? nextPost : item))
  setAllPostsInternal(nextPosts)

  return { ok: true }
}

export function cancelTeamPost(postId: string, userId: string): TeamActionResult {
  const posts = getAllPostsInternal()
  const post = posts.find((item) => item.id === postId)

  if (!post) return { ok: false, error: 'This team post no longer exists.' }

  if (post.createdByUserId !== userId) {
    return { ok: false, error: 'Only the team creator can cancel this post.' }
  }

  const nextPosts = posts.filter((item) => item.id !== post.id)
  setAllPostsInternal(nextPosts)
  emitTeamCancelledNotifications(post)

  return { ok: true }
}
