import type { FastifyInstance, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { prisma } from '@lib/prisma'
import { success } from '@common/response'
import { offsetPagination } from '@common/pagination'

const querySchema = z.object({
  page: z.coerce.number().default(1),
  limit: z.coerce.number().min(1).max(50).default(20),
  city: z.string().optional(),
  sportId: z.string().optional(),
  status: z.string().optional(),
})

export async function facilityRoutes(app: FastifyInstance) {
  // GET /facilities - List facilities with filters
  app.get('/', async (request: FastifyRequest) => {
    const { page, limit, city, sportId, status } = querySchema.parse(request.query)

    const where: {
      city?: string
      status?: string
      sports?: { some: { sportId: string } }
    } = {}

    if (city) where.city = city
    if (status) where.status = status
    if (sportId) where.sports = { some: { sportId } }

    const [facilities, total] = await Promise.all([
      prisma.facility.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          name: true,
          logo: true,
          address: true,
          city: true,
          status: true,
          _count: {
            select: {
              branches: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.facility.count({ where }),
    ])

    return success(offsetPagination(facilities, total, page, limit))
  })

  // GET /facilities/:id - Get facility details
  app.get('/:id', async (request: FastifyRequest) => {
    const { id } = request.params as { id: string }
    const facility = await prisma.facility.findUnique({
      where: { id },
      include: {
        sports: {
          include: {
            sport: {
              select: {
                id: true,
                name: true,
                displayName: true,
              },
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
    return success(facility)
  })

  // GET /facilities/:id/branches
  app.get('/:id/branches', async (request: FastifyRequest) => {
    const { id } = request.params as { id: string }
    const branches = await prisma.branch.findMany({
      where: { facilityId: id },
      select: {
        id: true,
        name: true,
        address: true,
        city: true,
        phone: true,
        _count: {
          select: { courts: true },
        },
      },
    })
    return success(branches)
  })

  // GET /facilities/:id/reviews
  app.get('/:id/reviews', async (request: FastifyRequest) => {
    const { id } = request.params as { id: string }
    const page = z.coerce.number().default(1).parse((request.query as { page?: string }).page)
    const limit = z.coerce.number().min(1).max(50).default(20).parse((request.query as { limit?: string }).limit)

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: {
          facilityId: id,
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
        where: { facilityId: id, status: 'APPROVED' },
      }),
    ])

    return success(offsetPagination(reviews, total, page, limit))
  })
}
