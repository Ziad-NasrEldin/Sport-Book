import { prisma } from '@lib/prisma'
import { NotFoundError, BadRequestError, ForbiddenError, ConflictError } from '@common/errors'
import type {
  UpdateFacilityInput,
  CreateCourtInput,
  UpdateCourtInput,
  CreateCourtPricingRuleInput,
  CreateCourtClosureInput,
  CreateBranchInput,
  UpdateBranchInput,
  InviteStaffInput,
  ApprovalActionInput,
} from './schema'

function toNumber(value: unknown) {
  if (typeof value === 'number') return value
  if (value && typeof value === 'object' && 'toNumber' in value && typeof value.toNumber === 'function') {
    return value.toNumber()
  }
  return Number(value ?? 0)
}

export async function getOperatorFacility(userId: string) {
  const facility = await prisma.facility.findUnique({
    where: { operatorId: userId },
    include: {
      sports: {
        include: {
          sport: true,
        },
      },
      branches: {
        include: {
          _count: {
            select: { courts: true },
          },
        },
      },
      _count: {
        select: {
          branches: true,
          reviews: true,
        },
      },
    },
  })

  if (!facility) {
    throw new NotFoundError('Facility')
  }

  return facility
}

export async function getOperatorDashboard(userId: string) {
  const facility = await prisma.facility.findUnique({
    where: { operatorId: userId },
    include: {
      branches: {
        include: {
          courts: {
            include: {
              sport: true,
              bookings: {
                include: {
                  user: {
                    select: {
                      name: true,
                    },
                  },
                },
                orderBy: {
                  date: 'desc',
                },
                take: 50,
              },
            },
          },
        },
      },
    },
  })

  if (!facility) {
    throw new NotFoundError('Facility')
  }

  const branches = facility.branches ?? []
  const courts = branches.flatMap((branch) =>
    branch.courts.map((court) => ({
      id: court.id,
      name: court.name,
      branch: branch.name,
      sport: court.sport?.name ?? 'Unknown',
      status: court.status,
    })),
  )
  const bookings = branches.flatMap((branch) =>
    branch.courts.flatMap((court) =>
      court.bookings.map((booking) => ({
        id: booking.id,
        court: court.name,
        branch: branch.name,
        user: booking.user?.name ?? 'Guest',
        status: booking.status,
        amount: toNumber(booking.totalPrice),
        date: booking.date.toISOString(),
      })),
    ),
  )

  const todayKey = new Date().toISOString().slice(0, 10)
  const confirmedBookings = bookings.filter(
    (booking) => booking.status === 'CONFIRMED' || booking.status === 'COMPLETED',
  )
  const todayRevenue = confirmedBookings
    .filter((booking) => booking.date.slice(0, 10) === todayKey)
    .reduce((sum, booking) => sum + booking.amount, 0)

  const metrics = [
    {
      id: 'branches',
      label: 'Branches',
      value: branches.length,
      delta: `${branches.length} live`,
      trend: 'steady',
    },
    {
      id: 'courts',
      label: 'Courts',
      value: courts.length,
      delta: `${courts.filter((court) => court.status === 'ACTIVE').length} active`,
      trend: 'up',
    },
    {
      id: 'bookings',
      label: 'Recent Bookings',
      value: bookings.length,
      delta: `${confirmedBookings.length} confirmed`,
      trend: confirmedBookings.length > 0 ? 'up' : 'steady',
    },
    {
      id: 'revenue',
      label: 'Revenue Today',
      value: `EGP ${todayRevenue.toFixed(0)}`,
      delta: confirmedBookings.length > 0 ? 'Paid sessions flowing' : 'No paid sessions yet',
      trend: todayRevenue > 0 ? 'up' : 'steady',
    },
  ]

  const approvals = branches.map((branch) => ({
    id: branch.id,
    subject: branch.name,
    type: 'Branch',
    requestedBy: facility.name,
    status: facility.status,
    submittedAt: branch.createdAt.toISOString(),
  }))

  const utilizationVelocity = Array.from({ length: 12 }, (_, index) => {
    const target = new Date()
    target.setDate(target.getDate() - (11 - index))
    const key = target.toISOString().slice(0, 10)
    return confirmedBookings.filter((booking) => booking.date.slice(0, 10) === key).length
  })

  const cancelledBookings = bookings.filter((b) => b.status === 'CANCELLED')
  const totalFinalizedBookings = confirmedBookings.length + cancelledBookings.length
  const cancellationRatio = totalFinalizedBookings > 0
    ? ((cancelledBookings.length / totalFinalizedBookings) * 100).toFixed(1)
    : '0.0'

  const attentionItems: Array<{ message: string; severity: 'low' | 'medium' | 'high' }> = []

  const inactiveCourts = courts.filter((c) => c.status === 'MAINTENANCE' || c.status === 'INACTIVE')
  if (inactiveCourts.length > 0) {
    attentionItems.push({
      message: `${inactiveCourts[0].name}${inactiveCourts.length > 1 ? ` and ${inactiveCourts.length - 1} other${inactiveCourts.length > 2 ? 's' : ''}` : ''} ${inactiveCourts.length === 1 ? 'is' : 'are'} blocked for maintenance and need reassignment plan.`,
      severity: inactiveCourts.length > 2 ? 'high' : 'medium',
    })
  }

  const pendingApprovals = approvals.filter((a) => a.status === 'PENDING')
  if (pendingApprovals.length > 0) {
    attentionItems.push({
      message: `${pendingApprovals.length} branch setup${pendingApprovals.length > 1 ? 's are' : ' is'} still pending compliance checklist completion.`,
      severity: 'medium',
    })
  }

  const refundCount = bookings.filter((b) => b.status === 'CANCELLED' && b.amount > 0).length
  if (refundCount > 0) {
    attentionItems.push({
      message: `${refundCount} high-priority discount override${refundCount > 1 ? 's are' : ' is'} awaiting manager approval.`,
      severity: 'low',
    })
  }

  if (attentionItems.length === 0) {
    attentionItems.push({
      message: 'No critical issues identified. All systems operating normally.',
      severity: 'low',
    })
  }

  return {
    facility: {
      id: facility.id,
      name: facility.name,
      city: facility.city,
      status: facility.status,
    },
    metrics,
    approvals,
    courts,
    bookings,
    utilizationVelocity,
    cancellationRatio: `${cancellationRatio}%`,
    attentionItems,
  }
}

export async function updateOperatorFacility(userId: string, data: UpdateFacilityInput) {
  const facility = await prisma.facility.findUnique({
    where: { operatorId: userId },
  })

  if (!facility) {
    throw new NotFoundError('Facility')
  }

  const updated = await prisma.facility.update({
    where: { id: facility.id },
    data,
  })

  return updated
}

export async function getOperatorBookings(userId: string, filters: {
  status?: string
  startDate?: string
  endDate?: string
  page?: number
  limit?: number
}) {
  const facility = await prisma.facility.findUnique({
    where: { operatorId: userId },
    select: { id: true },
  })

  if (!facility) {
    throw new NotFoundError('Facility')
  }

  const { status, startDate, endDate, page = 1, limit = 20 } = filters

  const where: any = {
    court: {
      branch: {
        facilityId: facility.id,
      },
    },
  }

  if (status) where.status = status
  if (startDate) {
    where.date = { gte: new Date(startDate) }
  }
  if (endDate) {
    where.date = { ...where.date, lte: new Date(endDate) }
  }

  const [bookings, total] = await Promise.all([
    prisma.booking.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        user: {
          select: {
            name: true,
            phone: true,
            avatar: true,
          },
        },
        court: {
          include: {
            sport: true,
            branch: true,
          },
        },
      },
      orderBy: { date: 'desc' },
    }),
    prisma.booking.count({ where }),
  ])

  return {
    data: bookings,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  }
}

export async function getOperatorRevenue(userId: string, filters: {
  startDate?: string
  endDate?: string
}) {
  const facility = await prisma.facility.findUnique({
    where: { operatorId: userId },
    select: { id: true },
  })

  if (!facility) {
    throw new NotFoundError('Facility')
  }

  const { startDate, endDate } = filters

  const where: any = {
    paymentStatus: 'PAID',
    court: {
      branch: {
        facilityId: facility.id,
      },
    },
  }

  if (startDate) {
    where.date = { gte: new Date(startDate) }
  }
  if (endDate) {
    where.date = { ...where.date, lte: new Date(endDate) }
  }

  const bookings = await prisma.booking.findMany({
    where,
    select: {
      totalPrice: true,
      date: true,
    },
  })

  const total = bookings.reduce((sum: number, b: { totalPrice: { toNumber: () => number } }) => sum + b.totalPrice.toNumber(), 0)

  return {
    totalRevenue: total,
    bookingCount: bookings.length,
    bookings,
  }
}

export async function createCourt(userId: string, data: CreateCourtInput) {
  const facility = await prisma.facility.findUnique({
    where: { operatorId: userId },
  })

  if (!facility) {
    throw new NotFoundError('Facility')
  }

  const branch = await prisma.branch.findUnique({
    where: { id: data.branchId },
  })

  if (!branch || branch.facilityId !== facility.id) {
    throw new BadRequestError('Invalid branch')
  }

  const court = await prisma.court.create({
    data: {
      branchId: data.branchId,
      sportId: data.sportId,
      name: data.name,
      basePrice: data.basePrice,
      description: data.description,
      images: data.images || '[]',
    },
  })

  return court
}

export async function updateCourt(userId: string, courtId: string, data: UpdateCourtInput) {
  const facility = await prisma.facility.findUnique({
    where: { operatorId: userId },
  })

  if (!facility) {
    throw new NotFoundError('Facility')
  }

  const court = await prisma.court.findUnique({
    where: { id: courtId },
    include: {
      branch: true,
    },
  })

  if (!court) {
    throw new NotFoundError('Court')
  }

  if (court.branch.facilityId !== facility.id) {
    throw new ForbiddenError('You can only update your own courts')
  }

  const updated = await prisma.court.update({
    where: { id: courtId },
    data,
  })

  return updated
}

export async function deleteCourt(userId: string, courtId: string) {
  const facility = await prisma.facility.findUnique({
    where: { operatorId: userId },
  })

  if (!facility) {
    throw new NotFoundError('Facility')
  }

  const court = await prisma.court.findUnique({
    where: { id: courtId },
    include: {
      branch: true,
    },
  })

  if (!court) {
    throw new NotFoundError('Court')
  }

  if (court.branch.facilityId !== facility.id) {
    throw new ForbiddenError('You can only delete your own courts')
  }

  await prisma.court.delete({
    where: { id: courtId },
  })

  return { message: 'Court deleted' }
}

export async function createCourtPricingRule(userId: string, data: CreateCourtPricingRuleInput) {
  const facility = await prisma.facility.findUnique({
    where: { operatorId: userId },
  })

  if (!facility) {
    throw new NotFoundError('Facility')
  }

  const court = await prisma.court.findUnique({
    where: { id: data.courtId },
    include: {
      branch: true,
    },
  })

  if (!court) {
    throw new NotFoundError('Court')
  }

  if (court.branch.facilityId !== facility.id) {
    throw new ForbiddenError('You can only manage your own courts')
  }

  const rule = await prisma.courtPricingRule.create({
    data,
  })

  return rule
}

export async function createCourtClosure(userId: string, data: CreateCourtClosureInput) {
  const facility = await prisma.facility.findUnique({
    where: { operatorId: userId },
  })

  if (!facility) {
    throw new NotFoundError('Facility')
  }

  const court = await prisma.court.findUnique({
    where: { id: data.courtId },
    include: {
      branch: true,
    },
  })

  if (!court) {
    throw new NotFoundError('Court')
  }

  if (court.branch.facilityId !== facility.id) {
    throw new ForbiddenError('You can only manage your own courts')
  }

  const closure = await prisma.courtClosure.create({
    data: {
      courtId: data.courtId,
      date: new Date(data.date),
      allDay: data.allDay,
      startHour: data.startHour,
      endHour: data.endHour,
    },
  })

  return closure
}

export async function getOperatorCourts(userId: string) {
  const facility = await prisma.facility.findUnique({
    where: { operatorId: userId },
    select: { id: true },
  })

  if (!facility) {
    throw new NotFoundError('Facility')
  }

  const courts = await prisma.court.findMany({
    where: {
      branch: {
        facilityId: facility.id,
      },
    },
    include: {
      sport: true,
      branch: true,
      pricingRules: true,
      _count: {
        select: {
          bookings: true,
          reviews: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return courts
}

export async function createBranch(userId: string, data: CreateBranchInput) {
  const facility = await prisma.facility.findUnique({
    where: { operatorId: userId },
  })

  if (!facility) {
    throw new NotFoundError('Facility')
  }

  const branch = await prisma.branch.create({
    data: {
      facilityId: facility.id,
      name: data.name,
      address: data.address,
      city: data.city,
      phone: data.phone,
    },
  })

  return branch
}

export async function getOperatorBranches(userId: string) {
  const facility = await prisma.facility.findUnique({
    where: { operatorId: userId },
    select: { id: true },
  })

  if (!facility) {
    throw new NotFoundError('Facility')
  }

  const branches = await prisma.branch.findMany({
    where: { facilityId: facility.id },
    include: {
      _count: {
        select: { courts: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return branches
}

export async function updateBranch(userId: string, branchId: string, data: UpdateBranchInput) {
  const facility = await prisma.facility.findUnique({
    where: { operatorId: userId },
  })

  if (!facility) {
    throw new NotFoundError('Facility')
  }

  const branch = await prisma.branch.findUnique({
    where: { id: branchId },
  })

  if (!branch) {
    throw new NotFoundError('Branch')
  }

  if (branch.facilityId !== facility.id) {
    throw new ForbiddenError('You can only update your own branches')
  }

  const updated = await prisma.branch.update({
    where: { id: branchId },
    data,
  })

  return updated
}

export async function deleteBranch(userId: string, branchId: string) {
  const facility = await prisma.facility.findUnique({
    where: { operatorId: userId },
  })

  if (!facility) {
    throw new NotFoundError('Facility')
  }

  const branch = await prisma.branch.findUnique({
    where: { id: branchId },
    include: {
      _count: {
        select: { courts: true },
      },
    },
  })

  if (!branch) {
    throw new NotFoundError('Branch')
  }

  if (branch.facilityId !== facility.id) {
    throw new ForbiddenError('You can only delete your own branches')
  }

  if (branch._count.courts > 0) {
    throw new ConflictError('Cannot delete branch with existing courts')
  }

  await prisma.branch.delete({
    where: { id: branchId },
  })

  return { message: 'Branch deleted' }
}

export async function getStaff(userId: string) {
  const facility = await prisma.facility.findUnique({
    where: { operatorId: userId },
    select: { id: true },
  })

  if (!facility) {
    throw new NotFoundError('Facility')
  }

  const operator = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      avatar: true,
      role: true,
    },
  })

  const coaches = await prisma.coach.findMany({
    where: {
      sport: {
        facilities: {
          some: {
            facilityId: facility.id,
          },
        },
      },
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          avatar: true,
          role: true,
        },
      },
      sport: {
        select: {
          id: true,
          displayName: true,
        },
      },
    },
  })

  const staff = [
    { ...operator, staffRole: 'OPERATOR' },
    ...coaches.map((coach) => ({
      ...coach.user,
      staffRole: 'COACH',
      sport: coach.sport,
    })),
  ]

  return staff
}

export async function inviteStaff(userId: string, data: InviteStaffInput) {
  const facility = await prisma.facility.findUnique({
    where: { operatorId: userId },
  })

  if (!facility) {
    throw new NotFoundError('Facility')
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  })

  if (existingUser) {
    if (data.role === 'COACH') {
      const existingCoach = await prisma.coach.findUnique({
        where: { userId: existingUser.id },
      })

      if (existingCoach) {
        throw new ConflictError('User is already a coach')
      }

      const sports = await prisma.facilitySport.findMany({
        where: { facilityId: facility.id },
        select: { sportId: true },
      })

      if (sports.length === 0) {
        throw new BadRequestError('Facility has no sports configured')
      }

      const coach = await prisma.coach.create({
        data: {
          userId: existingUser.id,
          slug: `${existingUser.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
          sportId: sports[0].sportId,
          sessionRate: 0,
          isVerified: true,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
      })

      return coach
    }

    return existingUser
  }

  const newUser = await prisma.user.create({
    data: {
      email: data.email,
      name: data.name,
      password: Math.random().toString(36).slice(-12),
      role: data.role,
      status: 'PENDING',
    },
  })

  await prisma.notification.create({
    data: {
      userId: newUser.id,
      type: 'SYSTEM',
      title: 'Facility Invitation',
      message: `You have been invited to join ${facility.name} as a ${data.role.toLowerCase()}.`,
    },
  })

  return newUser
}

export async function getPendingBookings(userId: string) {
  const facility = await prisma.facility.findUnique({
    where: { operatorId: userId },
    select: { id: true },
  })

  if (!facility) {
    throw new NotFoundError('Facility')
  }

  const bookings = await prisma.booking.findMany({
    where: {
      status: 'PENDING',
      court: {
        branch: {
          facilityId: facility.id,
        },
      },
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          phone: true,
          avatar: true,
        },
      },
      court: {
        include: {
          sport: {
            select: { displayName: true },
          },
          branch: {
            select: { name: true },
          },
        },
      },
      coach: {
        include: {
          user: {
            select: { name: true, avatar: true },
          },
        },
      },
    },
    orderBy: { createdAt: 'asc' },
  })

  return bookings
}

export async function approveBooking(userId: string, bookingId: string, data: ApprovalActionInput) {
  const facility = await prisma.facility.findUnique({
    where: { operatorId: userId },
    select: { id: true },
  })

  if (!facility) {
    throw new NotFoundError('Facility')
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      court: {
        include: {
          branch: true,
        },
      },
    },
  })

  if (!booking) {
    throw new NotFoundError('Booking')
  }

  if (booking.court?.branch.facilityId !== facility.id) {
    throw new ForbiddenError('You can only manage bookings for your own facility')
  }

  if (booking.status !== 'PENDING') {
    throw new BadRequestError('Only pending bookings can be approved or rejected')
  }

  const updated = await prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: data.status,
      cancellationReason: data.note,
    },
  })

  await prisma.notification.create({
    data: {
      userId: booking.userId,
      type: data.status === 'CONFIRMED' ? 'BOOKING_CONFIRMED' : 'BOOKING_CANCELLED',
      title: data.status === 'CONFIRMED' ? 'Booking Confirmed' : 'Booking Cancelled',
      message: data.status === 'CONFIRMED'
        ? `Your booking has been confirmed${data.note ? ': ' + data.note : ''}.`
        : `Your booking has been cancelled${data.note ? ': ' + data.note : ''}.`,
    },
  })

  return updated
}

export async function getOperatorProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      createdAt: true,
      refreshTokens: {
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: { createdAt: true },
      },
    },
  })

  if (!user) {
    throw new NotFoundError('User')
  }

  const facility = await prisma.facility.findUnique({
    where: { operatorId: userId },
    select: { name: true, city: true, status: true, id: true },
  })

  const facilitySettings = facility
    ? await prisma.cmsContent.findUnique({
        where: { page_language: { page: `operator-settings.${facility.id}`, language: 'system' } },
      })
    : null

  const parsedSettings = facilitySettings?.content
    ? (() => { try { return JSON.parse(facilitySettings.content) } catch { return {} } })()
    : {}

  return {
    fullName: user.name ?? '',
    title: parsedSettings.title ?? 'Facility Operator',
    email: user.email,
    phone: user.phone ?? '',
    notifyApprovals: parsedSettings.notifyApprovals ?? true,
    notifyIncidents: parsedSettings.notifyIncidents ?? true,
    notifyReports: parsedSettings.notifyReports ?? false,
    facility: facility
      ? { name: facility.name, city: facility.city, status: facility.status }
      : null,
    lastLoginAt: user.refreshTokens.length > 0 ? user.refreshTokens[0].createdAt.toISOString() : user.createdAt.toISOString(),
    lastLoginIp: null,
    twoFactorEnabled: false,
    activeDeviceSessions: user.refreshTokens.length,
  }
}

type OperatorProfileUpdateInput = {
  fullName?: string
  title?: string
  email?: string
  phone?: string
  notifyApprovals?: boolean
  notifyIncidents?: boolean
  notifyReports?: boolean
}

export async function updateOperatorProfile(userId: string, input: OperatorProfileUpdateInput) {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) {
    throw new NotFoundError('User')
  }

  if (input.fullName !== undefined || input.email !== undefined || input.phone !== undefined) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        ...(input.fullName !== undefined ? { name: input.fullName } : {}),
        ...(input.email !== undefined ? { email: input.email } : {}),
        ...(input.phone !== undefined ? { phone: input.phone } : {}),
      },
    })
  }

  const facility = await prisma.facility.findUnique({ where: { operatorId: userId } })
  if (facility) {
    const settingsKey = `operator-settings.${facility.id}`
    const existingSettings = await prisma.cmsContent.findUnique({
      where: { page_language: { page: settingsKey, language: 'system' } },
    })

    const currentSettings = existingSettings?.content ? (() => { try { return JSON.parse(existingSettings.content) } catch { return {} } })() : {}
    const updatedSettings = {
      ...currentSettings,
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.notifyApprovals !== undefined ? { notifyApprovals: input.notifyApprovals } : {}),
      ...(input.notifyIncidents !== undefined ? { notifyIncidents: input.notifyIncidents } : {}),
      ...(input.notifyReports !== undefined ? { notifyReports: input.notifyReports } : {}),
    }

    await prisma.cmsContent.upsert({
      where: { page_language: { page: settingsKey, language: 'system' } },
      update: { content: JSON.stringify(updatedSettings), status: 'PUBLISHED' },
      create: {
        page: settingsKey,
        language: 'system',
        title: `Operator Settings for ${facility.name}`,
        content: JSON.stringify(updatedSettings),
        status: 'PUBLISHED',
        version: '1.0',
      },
    })
  }

  return getOperatorProfile(userId)
}
