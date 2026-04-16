import type { FastifyInstance, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { prisma } from '@lib/prisma'
import { success } from '@common/response'
import { offsetPagination } from '@common/pagination'

const querySchema = z.object({
  page: z.coerce.number().default(1),
  limit: z.coerce.number().min(1).max(50).default(20),
  sportId: z.string().optional(),
  city: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
  minRate: z.coerce.number().optional(),
  maxRate: z.coerce.number().optional(),
})

export async function coachRoutes(app: FastifyInstance) {
  // GET /coaches - List coaches with filters
  app.get('/', async (request: FastifyRequest) => {
    const { page, limit, sportId, isActive, minRate, maxRate } = querySchema.parse(request.query)

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

    return success(offsetPagination(coaches, total, page, limit))
  })

  // GET /coaches/:slug - Get coach by slug
  app.get('/:slug', async (request: FastifyRequest) => {
    const { slug } = request.params as { slug: string }
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
    return success(coach)
  })

  // GET /coaches/:slug/availability - Get coach availability
  app.get('/:slug/availability', async (request: FastifyRequest) => {
    const { slug } = request.params as { slug: string }
    const dateStr = (request.query as { date?: string }).date

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
      return success({ error: 'Coach not found' })
    }

    return success({
      coachId: coach.id,
      regularAvailability: coach.availability,
      exceptions: dateStr ? coach.availabilityExceptions : undefined,
    })
  })

  // GET /coaches/:slug/services
  app.get('/:slug/services', async (request: FastifyRequest) => {
    const { slug } = request.params as { slug: string }
    const services = await prisma.coachService.findMany({
      where: {
        coach: { slug },
        isActive: true,
      },
      orderBy: { price: 'asc' },
    })
    return success(services)
  })

  // GET /coaches/:slug/reviews
  app.get('/:slug/reviews', async (request: FastifyRequest) => {
    const { slug } = request.params as { slug: string }
    const page = z.coerce.number().default(1).parse((request.query as { page?: string }).page)
    const limit = z.coerce.number().min(1).max(50).default(20).parse((request.query as { limit?: string }).limit)

    const coach = await prisma.coach.findUnique({
      where: { slug },
      select: { id: true },
    })

    if (!coach) {
      return success({ error: 'Coach not found' })
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

    return success(offsetPagination(reviews, total, page, limit))
  })
}
