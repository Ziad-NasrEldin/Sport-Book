import { prisma } from '@lib/prisma'
import { NotFoundError, BadRequestError } from '@common/errors'
import type {
  ListUsersInput,
  UpdateUserInput,
  RespondToRoleUpgradeInput,
  ListRoleUpgradesInput,
  ListAuditLogsInput,
} from './schema'

export async function listUsers(filters: ListUsersInput) {
  const { page, limit, role, status, search } = filters

  const where: {
    role?: string
    status?: string
    OR?: Array<{ name?: { contains: string }; email?: { contains: string } }>
  } = {}

  if (role) where.role = role
  if (status) where.status = status
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { email: { contains: search } },
    ]
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        avatar: true,
        createdAt: true,
        _count: {
          select: {
            bookings: true,
            reviews: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.count({ where }),
  ])

  return {
    data: users,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  }
}

export async function getUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      wallet: true,
      _count: {
        select: {
          bookings: true,
          reviews: true,
          favorites: true,
        },
      },
    },
  })

  if (!user) {
    throw new NotFoundError('User')
  }

  return user
}

export async function updateUser(userId: string, data: UpdateUserInput) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  })

  if (!user) {
    throw new NotFoundError('User')
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data,
  })

  return updated
}

export async function listRoleUpgrades(filters: ListRoleUpgradesInput) {
  const { page, limit, status } = filters

  const where: { status?: string } = {}
  if (status) where.status = status

  const [upgrades, total] = await Promise.all([
    prisma.roleUpgradeRequest.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        user: {
          select: {
            name: true,
            email: true,
            phone: true,
            avatar: true,
          },
        },
      },
      orderBy: { id: 'desc' },
    }),
    prisma.roleUpgradeRequest.count({ where }),
  ])

  return {
    data: upgrades,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  }
}

export async function respondToRoleUpgrade(requestId: string, data: RespondToRoleUpgradeInput) {
  const request = await prisma.roleUpgradeRequest.findUnique({
    where: { id: requestId },
    include: { user: true },
  })

  if (!request) {
    throw new NotFoundError('Role upgrade request')
  }

  if (request.status !== 'PENDING') {
    throw new BadRequestError('Request has already been processed')
  }

  const updated = await prisma.$transaction(async (tx: any) => {
    await tx.roleUpgradeRequest.update({
      where: { id: requestId },
      data: {
        status: data.status,
        adminReason: data.reason,
        respondedAt: new Date(),
      },
    })

    if (data.status === 'APPROVED') {
      await tx.user.update({
        where: { id: request.userId },
        data: { role: request.requestedRole },
      })
    }

    return tx.roleUpgradeRequest.findUnique({
      where: { id: requestId },
      include: { user: true },
    })
  })

  return updated
}

export async function getDashboardStats() {
  const [userCount, facilityCount, coachCount, bookingCount, revenue] = await Promise.all([
    prisma.user.count({ where: { status: 'ACTIVE' } }),
    prisma.facility.count({ where: { status: 'ACTIVE' } }),
    prisma.coach.count({ where: { isActive: true, isVerified: true } }),
    prisma.booking.count({ where: { date: { gte: new Date(new Date().setDate(new Date().getDate() - 30)) } } }),
    prisma.booking.aggregate({
      where: {
        paymentStatus: 'PAID',
        date: { gte: new Date(new Date().setDate(new Date().getDate() - 30)) },
      },
      _sum: { totalPrice: true },
    }),
  ])

  return {
    userCount,
    facilityCount,
    coachCount,
    bookingCount,
    revenue: revenue._sum.totalPrice?.toNumber() || 0,
  }
}

export async function listAuditLogs(filters: ListAuditLogsInput) {
  const { page, limit, action, userId, startDate, endDate } = filters

  const where: any = {}

  if (action) where.action = action
  if (userId) where.userId = userId
  if (startDate) {
    where.createdAt = { gte: new Date(startDate) }
  }
  if (endDate) {
    where.createdAt = { ...where.createdAt, lte: new Date(endDate) }
  }

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        actorId: true,
        action: true,
        object: true,
        details: true,
        severity: true,
        ip: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.auditLog.count({ where }),
  ])

  return {
    data: logs,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  }
}

export async function listFacilities(filters: { page: number; limit: number; status?: string }) {
  const { page, limit, status } = filters

  const where: { status?: string } = {}
  if (status) where.status = status

  const [facilities, total] = await Promise.all([
    prisma.facility.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        operator: {
          select: {
            name: true,
            email: true,
          },
        },
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

  return {
    data: facilities,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  }
}

export async function listCoaches(filters: { page: number; limit: number; status?: string }) {
  const { page, limit, status } = filters

  const where: { isActive?: boolean; isVerified?: boolean } = {
    isActive: true,
  }

  if (status === 'PENDING') {
    where.isVerified = false
  } else if (status === 'APPROVED') {
    where.isVerified = true
  }

  const [coaches, total] = await Promise.all([
    prisma.coach.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        sport: true,
        _count: {
          select: {
            bookings: true,
            reviews: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.coach.count({ where }),
  ])

  return {
    data: coaches,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  }
}
