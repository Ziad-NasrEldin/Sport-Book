import type { FastifyInstance, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { prisma } from '@lib/prisma'
import { success } from '@common/response'
import { offsetPagination } from '@common/pagination'

const querySchema = z.object({
  page: z.coerce.number().default(1),
  limit: z.coerce.number().min(1).max(50).default(20),
  sportId: z.string().optional(),
  branchId: z.string().optional(),
  city: z.string().optional(),
  status: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
})

export async function courtRoutes(app: FastifyInstance) {
  // GET /courts - List courts with filters
  app.get('/', async (request: FastifyRequest) => {
    const { page, limit, sportId, branchId, city, status, minPrice, maxPrice } = querySchema.parse(request.query)

    const where: {
      sportId?: string
      branchId?: string
      status?: string
      basePrice?: { gte?: number; lte?: number }
      branch?: { city?: string }
    } = {}

    if (sportId) where.sportId = sportId
    if (branchId) where.branchId = branchId
    if (status) where.status = status
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.basePrice = {}
      if (minPrice !== undefined) where.basePrice.gte = minPrice
      if (maxPrice !== undefined) where.basePrice.lte = maxPrice
    }
    if (city) where.branch = { city }

    const [courts, total] = await Promise.all([
      prisma.court.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          sport: {
            select: {
              id: true,
              name: true,
              displayName: true,
            },
          },
          branch: {
            select: {
              id: true,
              name: true,
              city: true,
              facility: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          _count: {
            select: { reviews: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.court.count({ where }),
    ])

    return success(offsetPagination(courts, total, page, limit))
  })

  // GET /courts/:id - Get court details
  app.get('/:id', async (request: FastifyRequest) => {
    const { id } = request.params as { id: string }
    const court = await prisma.court.findUnique({
      where: { id },
      include: {
        sport: {
          select: {
            id: true,
            name: true,
            displayName: true,
          },
        },
        branch: {
          select: {
            id: true,
            name: true,
            address: true,
            city: true,
            facility: {
              select: {
                id: true,
                name: true,
                logo: true,
              },
            },
          },
        },
        pricingRules: true,
        _count: {
          select: { reviews: true },
        },
      },
    })
    return success(court)
  })

  // GET /courts/:id/slots - Get available slots for a date
  app.get('/:id/slots', async (request: FastifyRequest) => {
    const { id } = request.params as { id: string }
    const dateStr = (request.query as { date?: string }).date

    if (!dateStr) {
      return success({ error: 'Date query parameter is required (YYYY-MM-DD)' })
    }

    const date = new Date(dateStr)
    const dayOfWeek = date.getDay()

    // Get court with pricing rules
    const court = await prisma.court.findUnique({
      where: { id },
      include: {
        pricingRules: true,
        closures: {
          where: {
            date: {
              gte: new Date(dateStr),
              lt: new Date(new Date(dateStr).setDate(date.getDate() + 1)),
            },
          },
        },
      },
    })

    if (!court) {
      return success({ error: 'Court not found' })
    }

    // Get existing bookings for this date
    const bookings = await prisma.booking.findMany({
      where: {
        courtId: id,
        date: {
          gte: new Date(dateStr),
          lt: new Date(new Date(dateStr).setDate(date.getDate() + 1)),
        },
        status: { in: ['PENDING', 'CONFIRMED'] },
      },
    })

    // Generate 24 hourly slots
    const slots = []
    for (let hour = 0; hour < 24; hour++) {
      // Check if court is closed for this hour
      const closure = court.closures.find(c => {
        if (c.allDay) return true
        return c.startHour !== null && c.endHour !== null &&
          hour >= c.startHour && hour < c.endHour
      })

      // Check if hour is booked
      const booking = bookings.find(b => hour >= b.startHour && hour < b.endHour)

      // Find pricing for this hour
      const pricingRule = court.pricingRules.find(r =>
        (r.dayOfWeek === null || r.dayOfWeek === dayOfWeek) &&
        hour >= r.startHour && hour < r.endHour
      )

      let status: 'AVAILABLE' | 'BLOCKED' | 'BUSY'
      if (closure) {
        status = 'BLOCKED'
      } else if (booking) {
        status = 'BUSY'
      } else {
        status = 'AVAILABLE'
      }

      slots.push({
        hour,
        time: `${hour.toString().padStart(2, '0')}:00`,
        status,
        price: pricingRule ? pricingRule.price : court.basePrice,
        isPeak: pricingRule ? pricingRule.isPeak : false,
      })
    }

    return success({
      date: dateStr,
      courtId: id,
      slots,
    })
  })

  // GET /courts/:id/reviews
  app.get('/:id/reviews', async (request: FastifyRequest) => {
    const { id } = request.params as { id: string }
    const page = z.coerce.number().default(1).parse((request.query as { page?: string }).page)
    const limit = z.coerce.number().min(1).max(50).default(20).parse((request.query as { limit?: string }).limit)

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: {
          courtId: id,
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
        where: { courtId: id, status: 'APPROVED' },
      }),
    ])

    return success(offsetPagination(reviews, total, page, limit))
  })
}
