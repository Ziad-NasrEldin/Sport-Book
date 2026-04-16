import { prisma } from '@lib/prisma'
import { NotFoundError } from '@common/errors'
import { offsetPagination } from '@common/pagination'

export async function listCoaches(filters: {
  page: number
  limit: number
  sportId?: string
  isActive?: boolean
  minRate?: number
  maxRate?: number
}) {
  const { page, limit, sportId, isActive, minRate, maxRate } = filters

  const where: {
    sportId?: string
    isActive?: boolean
    isVerified?: boolean
    sessionRate?: { gte?: number; lte?: number }
  } = {
    isActive: true,
    isVerified: true,
  }

  if (sportId) where.sportId = sportId
  if (isActive !== undefined) where.isActive = isActive
  if (minRate !== undefined || maxRate !== undefined) {
    where.sessionRate = {}
    if (minRate !== undefined) where.sessionRate.gte = minRate
    if (maxRate !== undefined) where.sessionRate.lte = maxRate
  }

  const [coaches, total] = await Promise.all([
    prisma.coach.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        sport: {
          select: {
            id: true,
            name: true,
            displayName: true,
          },
        },
        _count: {
          select: { reviews: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.coach.count({ where }),
  ])

  return offsetPagination(coaches, total, page, limit)
}

export async function getCoach(slug: string) {
  const coach = await prisma.coach.findUnique({
    where: { slug },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          avatar: true,
          email: true,
        },
      },
      sport: {
        select: {
          id: true,
          name: true,
          displayName: true,
        },
      },
      services: {
        where: { isActive: true },
      },
      _count: {
        select: { reviews: true },
      },
    },
  })
  if (!coach) {
    throw new NotFoundError('Coach')
  }
  return coach
}

export async function getCoachAvailability(slug: string, dateStr?: string) {
  const coach = await prisma.coach.findUnique({
    where: { slug },
    include: {
      availability: true,
      availabilityExceptions: dateStr ? {
        where: {
          date: {
            gte: new Date(dateStr),
            lt: new Date(new Date(dateStr).setDate(new Date(dateStr).getDate() + 1)),
          },
        },
      } : false,
    },
  })

  if (!coach) {
    throw new NotFoundError('Coach')
  }

  return {
    coachId: coach.id,
    regularAvailability: coach.availability,
    exceptions: dateStr ? coach.availabilityExceptions : undefined,
  }
}

export async function getCoachServices(slug: string) {
  const coach = await prisma.coach.findUnique({
    where: { slug },
    select: { id: true },
  })

  if (!coach) {
    throw new NotFoundError('Coach')
  }

  const services = await prisma.coachService.findMany({
    where: {
      coachId: coach.id,
      isActive: true,
    },
    orderBy: { price: 'asc' },
  })
  return services
}

export async function getCoachReviews(slug: string, page: number, limit: number) {
  const coach = await prisma.coach.findUnique({
    where: { slug },
    select: { id: true },
  })

  if (!coach) {
    throw new NotFoundError('Coach')
  }

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where: {
        coachId: coach.id,
        status: 'APPROVED',
      },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        user: {
          select: {
            name: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.review.count({
      where: { coachId: coach.id, status: 'APPROVED' },
    }),
  ])

  return offsetPagination(reviews, total, page, limit)
}
