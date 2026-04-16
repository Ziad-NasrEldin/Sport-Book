import { prisma } from '@lib/prisma'
import { NotFoundError } from '@common/errors'
import { offsetPagination } from '@common/pagination'

export async function listFacilities(filters: {
  page: number
  limit: number
  city?: string
  sportId?: string
  status?: string
}) {
  const { page, limit, city, sportId, status } = filters

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

  return offsetPagination(facilities, total, page, limit)
}

export async function getFacility(id: string) {
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
  if (!facility) {
    throw new NotFoundError('Facility')
  }
  return facility
}

export async function getFacilityBranches(facilityId: string) {
  const branches = await prisma.branch.findMany({
    where: { facilityId },
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
  return branches
}

export async function getFacilityReviews(facilityId: string, page: number, limit: number) {
  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where: {
        facilityId,
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
      where: { facilityId, status: 'APPROVED' },
    }),
  ])

  return offsetPagination(reviews, total, page, limit)
}
