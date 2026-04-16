import { prisma } from '@lib/prisma'
import { NotFoundError } from '@common/errors'
import { offsetPagination } from '@common/pagination'

export async function listCourts(filters: {
  page: number
  limit: number
  sportId?: string
  branchId?: string
  city?: string
  status?: string
  minPrice?: number
  maxPrice?: number
}) {
  const { page, limit, sportId, branchId, city, status, minPrice, maxPrice } = filters

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

  return offsetPagination(courts, total, page, limit)
}

export async function getCourt(id: string) {
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
  if (!court) {
    throw new NotFoundError('Court')
  }
  return court
}

export async function getCourtSlots(courtId: string, dateStr: string) {
  const date = new Date(dateStr)
  const dayOfWeek = date.getDay()

  const court = await prisma.court.findUnique({
    where: { id: courtId },
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
    throw new NotFoundError('Court')
  }

  const bookings = await prisma.booking.findMany({
    where: {
      courtId,
      date: {
        gte: new Date(dateStr),
        lt: new Date(new Date(dateStr).setDate(date.getDate() + 1)),
      },
      status: { in: ['PENDING', 'CONFIRMED'] },
    },
  })

  const slots = []
  for (let hour = 0; hour < 24; hour++) {
    const closure = court.closures.find(c => {
      if (c.allDay) return true
      return c.startHour !== null && c.endHour !== null &&
        hour >= c.startHour && hour < c.endHour
    })

    const booking = bookings.find(b => hour >= b.startHour && hour < b.endHour)

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

  return {
    date: dateStr,
    courtId,
    slots,
  }
}

export async function getCourtReviews(courtId: string, page: number, limit: number) {
  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where: {
        courtId,
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
      where: { courtId, status: 'APPROVED' },
    }),
  ])

  return offsetPagination(reviews, total, page, limit)
}
