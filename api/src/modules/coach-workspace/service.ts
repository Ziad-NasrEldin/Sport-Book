import { prisma } from '@lib/prisma'
import { NotFoundError, BadRequestError, ForbiddenError } from '@common/errors'
import type {
  UpdateCoachProfileInput,
  CreateCoachServiceInput,
  UpdateCoachServiceInput,
  SetAvailabilityInput,
  SetAvailabilityExceptionInput,
} from './schema'

export async function getCoachProfile(userId: string) {
  const coach = await prisma.coach.findUnique({
    where: { userId },
    include: {
      user: {
        select: {
          name: true,
          email: true,
          phone: true,
          avatar: true,
        },
      },
      sport: true,
      services: {
        where: { isActive: true },
      },
      availability: true,
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

  return {
    ...coach,
    certifications: JSON.parse(coach.certifications || '[]'),
    specialties: JSON.parse(coach.specialties || '[]'),
  }
}

export async function updateCoachProfile(userId: string, data: UpdateCoachProfileInput) {
  const coach = await prisma.coach.findUnique({
    where: { userId },
  })

  if (!coach) {
    throw new NotFoundError('Coach profile')
  }

  const updated = await prisma.coach.update({
    where: { id: coach.id },
    data: {
      ...(data.bio !== undefined && { bio: data.bio }),
      ...(data.experience !== undefined && { experience: data.experience }),
      ...(data.certifications !== undefined && { certifications: data.certifications }),
      ...(data.specialties !== undefined && { specialties: data.specialties }),
      ...(data.sessionRate !== undefined && { sessionRate: data.sessionRate }),
    },
  })

  return updated
}

export async function createCoachService(userId: string, data: CreateCoachServiceInput) {
  const coach = await prisma.coach.findUnique({
    where: { userId },
  })

  if (!coach) {
    throw new NotFoundError('Coach profile')
  }

  const service = await prisma.coachService.create({
    data: {
      coachId: coach.id,
      ...data,
    },
  })

  return service
}

export async function updateCoachService(userId: string, serviceId: string, data: UpdateCoachServiceInput) {
  const coach = await prisma.coach.findUnique({
    where: { userId },
  })

  if (!coach) {
    throw new NotFoundError('Coach profile')
  }

  const service = await prisma.coachService.findUnique({
    where: { id: serviceId },
  })

  if (!service) {
    throw new NotFoundError('Coach service')
  }

  if (service.coachId !== coach.id) {
    throw new ForbiddenError('You can only update your own services')
  }

  const updated = await prisma.coachService.update({
    where: { id: serviceId },
    data,
  })

  return updated
}

export async function deleteCoachService(userId: string, serviceId: string) {
  const coach = await prisma.coach.findUnique({
    where: { userId },
  })

  if (!coach) {
    throw new NotFoundError('Coach profile')
  }

  const service = await prisma.coachService.findUnique({
    where: { id: serviceId },
  })

  if (!service) {
    throw new NotFoundError('Coach service')
  }

  if (service.coachId !== coach.id) {
    throw new ForbiddenError('You can only delete your own services')
  }

  await prisma.coachService.delete({
    where: { id: serviceId },
  })

  return { message: 'Service deleted' }
}

export async function setAvailability(userId: string, data: SetAvailabilityInput) {
  const coach = await prisma.coach.findUnique({
    where: { userId },
  })

  if (!coach) {
    throw new NotFoundError('Coach profile')
  }

  const availability = await prisma.coachAvailability.upsert({
    where: {
      coachId_dayOfWeek_startHour: {
        coachId: coach.id,
        dayOfWeek: data.dayOfWeek,
        startHour: data.startHour,
      },
    },
    create: {
      coachId: coach.id,
      dayOfWeek: data.dayOfWeek,
      startHour: data.startHour,
      endHour: data.endHour,
    },
    update: {
      endHour: data.endHour,
    },
  })

  return availability
}

export async function setAvailabilityException(userId: string, data: SetAvailabilityExceptionInput) {
  const coach = await prisma.coach.findUnique({
    where: { userId },
  })

  if (!coach) {
    throw new NotFoundError('Coach profile')
  }

  const date = new Date(data.date)

  const exception = await prisma.coachAvailabilityException.upsert({
    where: {
      coachId_date: {
        coachId: coach.id,
        date,
      },
    },
    create: {
      coachId: coach.id,
      date,
      isAvailable: data.isAvailable,
    },
    update: {
      isAvailable: data.isAvailable,
    },
  })

  return exception
}

export async function getCoachBookings(userId: string, filters: {
  status?: string
  startDate?: string
  endDate?: string
  page?: number
  limit?: number
}) {
  const coach = await prisma.coach.findUnique({
    where: { userId },
  })

  if (!coach) {
    throw new NotFoundError('Coach profile')
  }

  const { status, startDate, endDate, page = 1, limit = 20 } = filters

  const where: any = { coachId: coach.id }
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

export async function getCoachEarnings(userId: string, filters: {
  startDate?: string
  endDate?: string
}) {
  const coach = await prisma.coach.findUnique({
    where: { userId },
  })

  if (!coach) {
    throw new NotFoundError('Coach profile')
  }

  const { startDate, endDate } = filters

  const where: any = {
    coachId: coach.id,
    paymentStatus: 'PAID',
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
    totalEarnings: total,
    bookingCount: bookings.length,
    bookings,
  }
}
