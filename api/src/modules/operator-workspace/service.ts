import { prisma } from '@lib/prisma'
import { NotFoundError, BadRequestError, ForbiddenError } from '@common/errors'
import type {
  UpdateFacilityInput,
  CreateCourtInput,
  UpdateCourtInput,
  CreateCourtPricingRuleInput,
  CreateCourtClosureInput,
} from './schema'

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
