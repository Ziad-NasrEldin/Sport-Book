import { prisma } from '@lib/prisma'
import { NotFoundError, ForbiddenError } from '@common/errors'
import type {
  CoachAvailabilityCreateInput,
  CoachAvailabilityExceptionCreateInput,
  CoachAvailabilityExceptionUpdateInput,
  CoachAvailabilityUpdateInput,
  CoachProfileUpdateInput,
  CoachServiceCreateInput,
  CoachServiceUpdateInput,
  CoachSessionTypeCreateInput,
  CoachSessionTypeUpdateInput,
  CoachSettingsUpdateInput,
} from './schema'

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const

type CoachWithRelations = Awaited<ReturnType<typeof getCoachRecord>>

function parseJsonArray(value: string | null | undefined): string[] {
  if (!value) return []
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : []
  } catch {
    return []
  }
}

function parseJsonNumberArray(value: string | null | undefined): number[] {
  if (!value) return []
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed.map((item) => Number(item)).filter(Number.isFinite) : []
  } catch {
    return []
  }
}

function parseJsonObject<T extends Record<string, unknown>>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback
  try {
    const parsed = JSON.parse(value)
    return typeof parsed === 'object' && parsed !== null ? { ...fallback, ...parsed } : fallback
  } catch {
    return fallback
  }
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-EG', {
    style: 'currency',
    currency: 'EGP',
    maximumFractionDigits: 0,
  }).format(value)
}

function hourToLabel(hour: number) {
  const suffix = hour >= 12 ? 'PM' : 'AM'
  const normalized = hour % 12 === 0 ? 12 : hour % 12
  return `${String(normalized).padStart(2, '0')}:00 ${suffix}`
}

async function getCoachRecord(userId: string) {
  const coach = await prisma.coach.findUnique({
    where: { userId },
    include: {
      user: true,
      sport: true,
      sessionTypes: {
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
      },
      services: {
        include: {
          sessionType: true,
          _count: {
            select: {
              bookings: true,
            },
          },
        },
        orderBy: { createdAt: 'asc' },
      },
      availability: {
        orderBy: [{ dayOfWeek: 'asc' }, { startHour: 'asc' }],
      },
      availabilityExceptions: {
        orderBy: { date: 'asc' },
      },
      bookings: {
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
          coachService: true,
          court: {
            include: {
              branch: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
      reviews: true,
      _count: {
        select: {
          bookings: true,
          reviews: true,
        },
      },
    },
  })

  if (!coach) {
    throw new NotFoundError('Coach profile')
  }

  return coach
}

function mapBooking(booking: CoachWithRelations['bookings'][number]) {
  const dateTime = new Date(booking.date)
  dateTime.setHours(booking.startHour, 0, 0, 0)

  return {
    id: booking.id,
    athlete: booking.user.name,
    sessionType: booking.coachService?.name ?? 'Coach Session',
    duration: booking.duration * 60,
    location: booking.court?.branch?.name ?? 'TBD',
    payout: Number(booking.totalPrice),
    status: booking.status,
    dateTime: dateTime.toISOString(),
    user: booking.user,
    service: booking.coachService
      ? {
          id: booking.coachService.id,
          name: booking.coachService.name,
        }
      : null,
  }
}

function defaultSettings() {
  return {
    payoutCycle: 'weekly',
    notifications: {
      bookingRequests: true,
      bookingChanges: true,
      payoutUpdates: true,
      athleteMessages: false,
    },
    policies: {
      autoConfirmFollowUps: false,
      allowLateCancellation: true,
      allowRescheduleRequests: true,
    },
  }
}

function settingsPayload(settings: ReturnType<typeof defaultSettings>) {
  return {
    payoutCycle: settings.payoutCycle,
    notifications: [
      {
        key: 'bookingRequests',
        label: 'Booking requests',
        description: 'Get notified whenever a new athlete requests a session.',
        enabled: settings.notifications.bookingRequests,
      },
      {
        key: 'bookingChanges',
        label: 'Booking changes',
        description: 'Notify me when players reschedule or cancel sessions.',
        enabled: settings.notifications.bookingChanges,
      },
      {
        key: 'payoutUpdates',
        label: 'Payout updates',
        description: 'Receive updates about completed transfers and pending payouts.',
        enabled: settings.notifications.payoutUpdates,
      },
      {
        key: 'athleteMessages',
        label: 'Athlete messages',
        description: 'Email me when athletes send questions from my public profile.',
        enabled: settings.notifications.athleteMessages,
      },
    ],
    policies: [
      {
        key: 'autoConfirmFollowUps',
        label: 'Auto-confirm follow-ups',
        description: 'Automatically confirm repeat sessions when the slot is available.',
        enabled: settings.policies.autoConfirmFollowUps,
      },
      {
        key: 'allowLateCancellation',
        label: 'Allow late cancellation',
        description: 'Allow players to cancel within the late cancellation window.',
        enabled: settings.policies.allowLateCancellation,
      },
      {
        key: 'allowRescheduleRequests',
        label: 'Allow reschedule requests',
        description: 'Let players request a different time instead of canceling outright.',
        enabled: settings.policies.allowRescheduleRequests,
      },
    ],
  }
}

export async function getCoachDashboard(userId: string) {
  const coach = await getCoachRecord(userId)
  const bookings = coach.bookings.map(mapBooking)
  const paidBookings = coach.bookings.filter((booking) => booking.paymentStatus === 'PAID')
  const totalRevenue = paidBookings.reduce((sum, booking) => sum + Number(booking.totalPrice), 0)
  const confirmedBookings = coach.bookings.filter((booking) => booking.status === 'CONFIRMED').length
  const activeServices = coach.services.filter((service) => service.status === 'ACTIVE').length
  const averageRating =
    coach.reviews.length > 0
      ? coach.reviews.reduce((sum, review) => sum + review.rating, 0) / coach.reviews.length
      : 0

  const monthMap = new Map<string, number>()
  for (let index = 5; index >= 0; index -= 1) {
    const date = new Date()
    date.setMonth(date.getMonth() - index)
    const key = `${date.getFullYear()}-${date.getMonth()}`
    monthMap.set(key, 0)
  }
  for (const booking of paidBookings) {
    const bookingDate = new Date(booking.date)
    const key = `${bookingDate.getFullYear()}-${bookingDate.getMonth()}`
    if (monthMap.has(key)) {
      monthMap.set(key, (monthMap.get(key) ?? 0) + Number(booking.totalPrice))
    }
  }

  const revenueTrend = Array.from(monthMap.entries()).map(([key, value]) => {
    const [year, month] = key.split('-').map(Number)
    return {
      id: key,
      label: new Date(year, month).toLocaleString('en-US', { month: 'short' }),
      value,
    }
  })

  const sessionMix = coach.sessionTypes.map((sessionType) => {
    const sessions = coach.services
      .filter((service) => service.sessionTypeId === sessionType.id)
      .reduce((sum, service) => sum + service._count.bookings, 0)

    return {
      id: sessionType.id,
      label: sessionType.name,
      value: sessions,
    }
  })

  return {
    metrics: [
      { id: 'revenue', label: 'Estimated Revenue', value: formatCurrency(totalRevenue), delta: 'Paid sessions', trend: 'up' },
      { id: 'bookings', label: 'Total Bookings', value: String(coach._count.bookings), delta: `${confirmedBookings} confirmed`, trend: 'up' },
      { id: 'services', label: 'Active Services', value: String(activeServices), delta: `${coach.sessionTypes.length} session types`, trend: 'flat' },
      { id: 'rating', label: 'Average Rating', value: averageRating.toFixed(1), delta: `${coach._count.reviews} reviews`, trend: 'up' },
    ],
    revenueTrend,
    sessionMix,
    bookings: bookings.slice(0, 6),
  }
}

export async function getCoachProfileView(userId: string) {
  const coach = await getCoachRecord(userId)

  return {
    id: coach.id,
    displayName: coach.user.name,
    headline: coach.headline ?? '',
    bio: coach.bio ?? '',
    city: coach.city ?? '',
    avatar: coach.user.avatar ?? '',
    isPublicProfileVisible: coach.isActive,
    sports: [coach.sport.displayName],
    certifications: parseJsonArray(coach.certifications),
    specialties: parseJsonArray(coach.specialties),
    languages: parseJsonArray(coach.languages),
  }
}

export async function updateCoachProfileView(userId: string, input: CoachProfileUpdateInput) {
  const coach = await getCoachRecord(userId)

  await prisma.$transaction([
    prisma.user.update({
      where: { id: coach.userId },
      data: {
        ...(input.displayName !== undefined ? { name: input.displayName } : {}),
        ...(input.avatar !== undefined ? { avatar: input.avatar } : {}),
      },
    }),
    prisma.coach.update({
      where: { id: coach.id },
      data: {
        ...(input.headline !== undefined ? { headline: input.headline } : {}),
        ...(input.bio !== undefined ? { bio: input.bio } : {}),
        ...(input.city !== undefined ? { city: input.city } : {}),
        ...(input.isPublicProfileVisible !== undefined ? { isActive: input.isPublicProfileVisible } : {}),
        ...(input.languages !== undefined ? { languages: JSON.stringify(input.languages) } : {}),
        ...(input.certifications !== undefined ? { certifications: JSON.stringify(input.certifications) } : {}),
        ...(input.specialties !== undefined ? { specialties: JSON.stringify(input.specialties) } : {}),
      },
    }),
  ])

  return getCoachProfileView(userId)
}

export async function getCoachSettingsView(userId: string) {
  const coach = await getCoachRecord(userId)
  const settings = parseJsonObject(coach.settings, defaultSettings())
  return settingsPayload(settings)
}

export async function updateCoachSettingsView(userId: string, input: CoachSettingsUpdateInput) {
  const coach = await getCoachRecord(userId)
  const mergedDefaults = defaultSettings()
  const nextSettings = {
    payoutCycle: input.payoutCycle,
    notifications: {
      ...mergedDefaults.notifications,
      ...input.notifications,
    },
    policies: {
      ...mergedDefaults.policies,
      ...input.policies,
    },
  }

  await prisma.coach.update({
    where: { id: coach.id },
    data: {
      settings: JSON.stringify(nextSettings),
    },
  })

  return settingsPayload(nextSettings)
}

function mapSessionType(sessionType: CoachWithRelations['sessionTypes'][number]) {
  return {
    id: sessionType.id,
    name: sessionType.name,
    description: sessionType.description ?? '',
    minParticipants: sessionType.minParticipants,
    maxParticipants: sessionType.maxParticipants,
    durationOptions: parseJsonNumberArray(sessionType.durationOptions),
    baseRate: Number(sessionType.baseRate),
    multiplier: Number(sessionType.multiplier),
    visibility: sessionType.visibility,
    status: sessionType.status,
  }
}

export async function listCoachSessionTypes(userId: string) {
  const coach = await getCoachRecord(userId)
  return coach.sessionTypes.map(mapSessionType)
}

export async function createCoachSessionType(userId: string, input: CoachSessionTypeCreateInput) {
  const coach = await getCoachRecord(userId)
  const sessionType = await prisma.coachSessionType.create({
    data: {
      coachId: coach.id,
      name: input.name,
      description: input.description,
      minParticipants: input.minParticipants,
      maxParticipants: input.maxParticipants,
      durationOptions: JSON.stringify(input.durationOptions),
      baseRate: input.baseRate,
      multiplier: input.multiplier,
      visibility: input.visibility,
      status: input.status,
      sortOrder: coach.sessionTypes.length + 1,
    },
  })

  return mapSessionType(sessionType)
}

export async function updateCoachSessionType(userId: string, id: string, input: CoachSessionTypeUpdateInput) {
  const coach = await getCoachRecord(userId)
  const sessionType = await prisma.coachSessionType.findUnique({ where: { id } })
  if (!sessionType || sessionType.coachId !== coach.id) {
    throw new NotFoundError('Coach session type')
  }

  const updated = await prisma.coachSessionType.update({
    where: { id },
    data: {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.minParticipants !== undefined ? { minParticipants: input.minParticipants } : {}),
      ...(input.maxParticipants !== undefined ? { maxParticipants: input.maxParticipants } : {}),
      ...(input.durationOptions !== undefined ? { durationOptions: JSON.stringify(input.durationOptions) } : {}),
      ...(input.baseRate !== undefined ? { baseRate: input.baseRate } : {}),
      ...(input.multiplier !== undefined ? { multiplier: input.multiplier } : {}),
      ...(input.visibility !== undefined ? { visibility: input.visibility } : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
    },
  })

  return mapSessionType(updated)
}

export async function deleteCoachSessionType(userId: string, id: string) {
  const coach = await getCoachRecord(userId)
  const sessionType = await prisma.coachSessionType.findUnique({ where: { id } })
  if (!sessionType || sessionType.coachId !== coach.id) {
    throw new NotFoundError('Coach session type')
  }

  await prisma.coachService.updateMany({
    where: { sessionTypeId: id },
    data: { sessionTypeId: null },
  })
  await prisma.coachSessionType.delete({ where: { id } })
  return { message: 'Session type deleted' }
}

function mapService(service: CoachWithRelations['services'][number], sportName: string) {
  return {
    id: service.id,
    title: service.name,
    description: service.description ?? '',
    sport: sportName,
    duration: service.duration,
    price: Number(service.price),
    bookingsThisMonth: service._count.bookings,
    status: service.status,
    sessionTypeId: service.sessionTypeId,
  }
}

export async function listCoachServices(userId: string) {
  const coach = await getCoachRecord(userId)
  return coach.services.map((service) => mapService(service, coach.sport.displayName))
}

export async function createCoachServiceView(userId: string, input: CoachServiceCreateInput) {
  const coach = await getCoachRecord(userId)
  const service = await prisma.coachService.create({
    data: {
      coachId: coach.id,
      sessionTypeId: input.sessionTypeId ?? null,
      name: input.title,
      description: input.description,
      duration: input.duration,
      price: input.price,
      status: input.status,
      isActive: input.status === 'ACTIVE',
    },
    include: {
      sessionType: true,
      _count: {
        select: {
          bookings: true,
        },
      },
    },
  })

  return mapService(service, coach.sport.displayName)
}

export async function updateCoachServiceView(userId: string, id: string, input: CoachServiceUpdateInput) {
  const coach = await getCoachRecord(userId)
  const service = await prisma.coachService.findUnique({ where: { id } })
  if (!service || service.coachId !== coach.id) {
    throw new NotFoundError('Coach service')
  }

  const updated = await prisma.coachService.update({
    where: { id },
    data: {
      ...(input.sessionTypeId !== undefined ? { sessionTypeId: input.sessionTypeId } : {}),
      ...(input.title !== undefined ? { name: input.title } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.duration !== undefined ? { duration: input.duration } : {}),
      ...(input.price !== undefined ? { price: input.price } : {}),
      ...(input.status !== undefined ? { status: input.status, isActive: input.status === 'ACTIVE' } : {}),
    },
    include: {
      sessionType: true,
      _count: {
        select: {
          bookings: true,
        },
      },
    },
  })

  return mapService(updated, coach.sport.displayName)
}

export async function deleteCoachServiceView(userId: string, id: string) {
  const coach = await getCoachRecord(userId)
  const service = await prisma.coachService.findUnique({ where: { id } })
  if (!service || service.coachId !== coach.id) {
    throw new NotFoundError('Coach service')
  }

  await prisma.coachService.delete({ where: { id } })
  return { message: 'Service deleted' }
}

function deriveCoachVenue(coach: CoachWithRelations): string {
  const bookingWithVenue = coach.bookings.find((b) => b.court?.branch)
  return bookingWithVenue?.court?.branch?.name ?? 'TBD'
}

function mapAvailabilityWindow(window: { id: string; dayOfWeek: number; startHour: number; endHour: number }, venue: string) {
  return {
    id: window.id,
    day: DAYS[window.dayOfWeek],
    start: hourToLabel(window.startHour),
    end: hourToLabel(window.endHour),
    venue,
    mode: 'ACTIVE',
  }
}

function parseHourLabel(value: string) {
  return Number(value.split(':')[0])
}

export async function getCoachAvailabilityView(userId: string) {
  const coach = await getCoachRecord(userId)
  const venue = deriveCoachVenue(coach)
  return {
    windows: coach.availability.map((w) => mapAvailabilityWindow(w, venue)),
    exceptions: coach.availabilityExceptions.map((exception) => ({
      id: exception.id,
      date: exception.date.toISOString(),
      reason: exception.reason ?? (exception.isAvailable ? 'Available override' : 'Blocked date'),
      impact: exception.isAvailable ? 'Available by override' : 'Unavailable all day',
      isAvailable: exception.isAvailable,
    })),
  }
}

export async function createCoachAvailabilityWindow(userId: string, input: CoachAvailabilityCreateInput) {
  const coach = await getCoachRecord(userId)
  const venue = deriveCoachVenue(coach)
  const created = await prisma.coachAvailability.create({
    data: {
      coachId: coach.id,
      dayOfWeek: DAYS.indexOf(input.day),
      startHour: parseHourLabel(input.start),
      endHour: parseHourLabel(input.end),
    },
  })

  return mapAvailabilityWindow(created, venue)
}

export async function updateCoachAvailabilityWindow(userId: string, id: string, input: CoachAvailabilityUpdateInput) {
  const coach = await getCoachRecord(userId)
  const window = await prisma.coachAvailability.findUnique({ where: { id } })
  if (!window || window.coachId !== coach.id) {
    throw new NotFoundError('Availability window')
  }

  const updated = await prisma.coachAvailability.update({
    where: { id },
    data: {
      ...(input.day !== undefined ? { dayOfWeek: DAYS.indexOf(input.day) } : {}),
      ...(input.start !== undefined ? { startHour: parseHourLabel(input.start) } : {}),
      ...(input.end !== undefined ? { endHour: parseHourLabel(input.end) } : {}),
    },
  })

  return mapAvailabilityWindow(updated, deriveCoachVenue(coach))
}

export async function deleteCoachAvailabilityWindow(userId: string, id: string) {
  const coach = await getCoachRecord(userId)
  const window = await prisma.coachAvailability.findUnique({ where: { id } })
  if (!window || window.coachId !== coach.id) {
    throw new NotFoundError('Availability window')
  }
  await prisma.coachAvailability.delete({ where: { id } })
  return { message: 'Availability window deleted' }
}

export async function createCoachAvailabilityExceptionView(userId: string, input: CoachAvailabilityExceptionCreateInput) {
  const coach = await getCoachRecord(userId)
  const exception = await prisma.coachAvailabilityException.create({
    data: {
      coachId: coach.id,
      date: new Date(input.date),
      isAvailable: input.isAvailable,
      reason: input.reason,
    },
  })

  return {
    id: exception.id,
    date: exception.date.toISOString(),
    reason: exception.reason ?? '',
    impact: input.impact,
    isAvailable: exception.isAvailable,
  }
}

export async function updateCoachAvailabilityExceptionView(userId: string, id: string, input: CoachAvailabilityExceptionUpdateInput) {
  const coach = await getCoachRecord(userId)
  const exception = await prisma.coachAvailabilityException.findUnique({ where: { id } })
  if (!exception || exception.coachId !== coach.id) {
    throw new NotFoundError('Availability exception')
  }

  const updated = await prisma.coachAvailabilityException.update({
    where: { id },
    data: {
      ...(input.date !== undefined ? { date: new Date(input.date) } : {}),
      ...(input.reason !== undefined ? { reason: input.reason } : {}),
      ...(input.isAvailable !== undefined ? { isAvailable: input.isAvailable } : {}),
    },
  })

  return {
    id: updated.id,
    date: updated.date.toISOString(),
    reason: updated.reason ?? '',
    impact: input.impact ?? (updated.isAvailable ? 'Available by override' : 'Unavailable all day'),
    isAvailable: updated.isAvailable,
  }
}

export async function deleteCoachAvailabilityExceptionView(userId: string, id: string) {
  const coach = await getCoachRecord(userId)
  const exception = await prisma.coachAvailabilityException.findUnique({ where: { id } })
  if (!exception || exception.coachId !== coach.id) {
    throw new NotFoundError('Availability exception')
  }
  await prisma.coachAvailabilityException.delete({ where: { id } })
  return { message: 'Availability exception deleted' }
}

export async function listCoachBookingsView(userId: string) {
  const coach = await getCoachRecord(userId)
  return coach.bookings.map(mapBooking)
}

export async function getCoachReportsView(userId: string) {
  const coach = await getCoachRecord(userId)
  const bookings = coach.bookings.map(mapBooking)
  const revenueTrendMap = new Map<string, number>()
  const snapshotMap = new Map<string, { sessions: number; gross: number; ratings: number[] }>()

  for (const booking of coach.bookings) {
    const date = new Date(booking.date)
    const monthLabel = date.toLocaleString('en-US', { month: 'short', year: 'numeric' })
    revenueTrendMap.set(monthLabel, (revenueTrendMap.get(monthLabel) ?? 0) + Number(booking.totalPrice))

    const current = snapshotMap.get(monthLabel) ?? { sessions: 0, gross: 0, ratings: [] }
    current.sessions += 1
    current.gross += Number(booking.totalPrice)
    snapshotMap.set(monthLabel, current)
  }

  for (const review of coach.reviews) {
    const label = new Date(review.createdAt).toLocaleString('en-US', { month: 'short', year: 'numeric' })
    const current = snapshotMap.get(label) ?? { sessions: 0, gross: 0, ratings: [] }
    current.ratings.push(review.rating)
    snapshotMap.set(label, current)
  }

  const revenueTrend = Array.from(revenueTrendMap.entries()).map(([label, value], index) => ({
    id: `revenue-${index}`,
    label,
    value,
  }))

  const sessionMix = coach.sessionTypes.map((sessionType) => ({
    id: sessionType.id,
    label: sessionType.name,
    value: coach.bookings.filter((booking) => booking.coachService?.sessionTypeId === sessionType.id).length,
  }))

  const monthSnapshots = Array.from(snapshotMap.entries()).map(([month, snapshot], index) => ({
    id: `snapshot-${index}`,
    month,
    sessions: snapshot.sessions,
    gross: snapshot.gross,
    avgRating:
      snapshot.ratings.length > 0
        ? snapshot.ratings.reduce((sum, rating) => sum + rating, 0) / snapshot.ratings.length
        : 0,
  }))

  return {
    bookings,
    revenueTrend,
    sessionMix,
    monthSnapshots,
  }
}

export async function listCoachAvailabilityTemplates(userId: string) {
  const coach = await getCoachRecord(userId)

  const sportName = coach.sport?.displayName ?? coach.sport?.name ?? 'General'

  const templates = [
    {
      id: 'competition-week',
      title: 'Competition Week Template',
      description: `Optimized for competitive ${sportName} athletes. Shifts evening sessions to match-play slots and blocks Friday recovery window.`,
    },
    {
      id: 'academy-launch',
      title: 'Academy Launch Template',
      description: `Ideal for starting a ${sportName} training program. Adds additional beginner windows on Tuesday and Thursday afternoons.`,
    },
    {
      id: 'travel-week',
      title: 'Travel Week Template',
      description: `Consolidates ${sportName} sessions to two days and auto-markets limited availability for maximum demand.`,
    },
  ]

  return templates
}

export async function getCoachSecurityInfo(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      emailVerified: true,
      createdAt: true,
      refreshTokens: {
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: { createdAt: true },
      },
    },
  })

  if (!user) {
    throw new NotFoundError('User not found')
  }

  const lastLogin = user.refreshTokens.length > 0 ? user.refreshTokens[0].createdAt : user.createdAt
  const activeDeviceSessions = user.refreshTokens.length

  return {
    twoFactorEnabled: false,
    apiTokenCount: 0,
    activeDeviceSessions,
    lastLoginAt: lastLogin.toISOString(),
    lastLoginIp: null,
  }
}

export async function assertCoachOwnsCoachRecord(userId: string, coachId: string) {
  const coach = await prisma.coach.findUnique({ where: { userId } })
  if (!coach || coach.id !== coachId) {
    throw new ForbiddenError('Coach record does not belong to current user')
  }
  return coach
}
