import type { FastifyInstance, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { prisma } from '@lib/prisma'
import { listCoaches } from '@modules/coaches/service'
import {
  getMe,
  updateProfile,
  getPreferences,
  updatePreferences,
  getWallet,
  getWalletTransactions,
  getFavorites,
  addFavorite,
  removeFavorite,
  getMyBookings,
  getMyOrders,
  getNotifications,
  markNotificationsAsRead,
  getUnreadNotificationsCount,
  walletTopup,
} from './service'
import {
  updateProfileSchema,
  updatePreferencesSchema,
  addFavoriteSchema,
  walletTopupSchema,
  markNotificationsReadSchema,
} from './schema'
import { success } from '@common/response'

export async function userRoutes(app: FastifyInstance) {
  // All routes require authentication
  app.addHook('preHandler', async (request: FastifyRequest, reply) => {
    try {
      await request.jwtVerify()
    } catch (err) {
      return reply.status(401).send({
        error: 'Unauthorized - Please log in',
        code: 'UNAUTHORIZED'
      })
    }
  })

  // GET /users/me
  app.get('/me', async (request: FastifyRequest) => {
    const user = await getMe(request.user!.userId)
    return success(user)
  })

  // PATCH /users/me
  app.patch('/me', async (request: FastifyRequest) => {
    const data = updateProfileSchema.parse(request.body)
    const user = await updateProfile(request.user!.userId, data)
    return success(user)
  })

  // GET /users/me/preferences
  app.get('/me/preferences', async (request: FastifyRequest) => {
    const preferences = await getPreferences(request.user!.userId)
    return success(preferences)
  })

  // PATCH /users/me/preferences
  app.patch('/me/preferences', async (request: FastifyRequest) => {
    const data = updatePreferencesSchema.parse(request.body)
    const preferences = await updatePreferences(request.user!.userId, data)
    return success(preferences)
  })

  // GET /users/me/wallet
  app.get('/me/wallet', async (request: FastifyRequest) => {
    const wallet = await getWallet(request.user!.userId)
    return success(wallet)
  })

  // GET /users/me/wallet/transactions
  app.get('/me/wallet/transactions', async (request: FastifyRequest) => {
    const limit = z.coerce.number().min(1).max(100).default(50).parse(
      (request.query as { limit?: string })?.limit
    )
    const transactions = await getWalletTransactions(request.user!.userId, limit)
    return success(transactions)
  })

  // POST /users/me/wallet/topup
  app.post('/me/wallet/topup', async (request: FastifyRequest) => {
    const data = walletTopupSchema.parse(request.body)
    const paymentIntent = await walletTopup(request.user!.userId, data)
    return success({ paymentIntent })
  })

  // GET /users/me/favorites
  app.get('/me/favorites', async (request: FastifyRequest) => {
    const favorites = await getFavorites(request.user!.userId)
    return success(favorites)
  })

  // POST /users/me/favorites
  app.post('/me/favorites', async (request: FastifyRequest) => {
    const data = addFavoriteSchema.parse(request.body)
    const favorite = await addFavorite(request.user!.userId, data)
    return success(favorite)
  })

  // DELETE /users/me/favorites/:id
  app.delete('/me/favorites/:id', async (request: FastifyRequest) => {
    const { id } = request.params as { id: string }
    await removeFavorite(request.user!.userId, id)
    return success({ message: 'Favorite removed' })
  })

  // GET /users/me/bookings
  app.get('/me/bookings', async (request: FastifyRequest) => {
    const status = (request.query as { status?: string })?.status
    const bookings = await getMyBookings(request.user!.userId, status)
    return success(bookings)
  })

  // GET /users/me/orders
  app.get('/me/orders', async (request: FastifyRequest) => {
    const status = (request.query as { status?: string })?.status
    const orders = await getMyOrders(request.user!.userId, status)
    return success(orders)
  })

  // GET /users/me/notifications
  app.get('/me/notifications', async (request: FastifyRequest) => {
    const unreadOnly = (request.query as { unreadOnly?: string })?.unreadOnly === 'true'
    const limit = z.coerce.number().min(1).max(100).default(50).parse(
      (request.query as { limit?: string })?.limit
    )
    const notifications = await getNotifications(request.user!.userId, unreadOnly, limit)
    return success(notifications)
  })

  // GET /users/me/notifications/unread-count
  app.get('/me/notifications/unread-count', async (request: FastifyRequest) => {
    const count = await getUnreadNotificationsCount(request.user!.userId)
    return success({ count })
  })

  // PATCH /users/me/notifications/read-all
  app.patch('/me/notifications/read-all', async (request: FastifyRequest) => {
    const parsed = markNotificationsReadSchema.parse(request.body)
    const ids = parsed?.ids
    await markNotificationsAsRead(request.user!.userId, ids)
    return success({ message: 'Notifications marked as read' })
  })
}

// Player-context routes (migrated from the removed player module).
// These stubs keep the web frontend working until Phase C replaces them
// with real implementations pointing at the correct domain modules.
export async function playerRoutes(app: FastifyInstance) {
  app.addHook('preHandler', async (request: FastifyRequest, reply) => {
    try {
      await request.jwtVerify()
    } catch {
      return reply.status(401).send({ error: 'Unauthorized - Please log in', code: 'UNAUTHORIZED' })
    }
  })

  app.get('/profile', async (request: FastifyRequest) => {
    const user = await getMe(request.user!.userId)
    return success(user)
  })

  app.get('/categories', async () => {
    const sports = await prisma.sport.findMany({
      where: { active: true },
      orderBy: { sortOrder: 'asc' },
      select: {
        id: true,
        name: true,
        displayName: true,
        icon: true,
        description: true,
      },
    })
    return success(sports)
  })

  app.get('/courts', async (request: FastifyRequest) => {
    const city = (request.query as { city?: string })?.city
    const sportId = (request.query as { sportId?: string })?.sportId
    const page = z.coerce.number().default(1).parse((request.query as { page?: string })?.page)
    const limit = z.coerce.number().min(1).max(50).default(20).parse((request.query as { limit?: string })?.limit)

    const where: any = {}
    if (city) where.branch = { city }
    if (sportId) where.sportId = sportId

    const [courts, total] = await Promise.all([
      prisma.court.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          sport: { select: { id: true, name: true, displayName: true } },
          branch: {
            select: {
              id: true,
              name: true,
              city: true,
              facility: { select: { id: true, name: true } },
            },
          },
          _count: { select: { reviews: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.court.count({ where }),
    ])

    return success({ items: courts, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } })
  })

  app.get('/courts/nearby', async (request: FastifyRequest) => {
    const city = (request.query as { city?: string })?.city
    if (!city) {
      return success({ items: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } })
    }

    const where = { branch: { city } }
    const [courts, total] = await Promise.all([
      prisma.court.findMany({
        where,
        take: 20,
        include: {
          sport: { select: { id: true, name: true, displayName: true } },
          branch: {
            select: {
              id: true,
              name: true,
              city: true,
              address: true,
              facility: { select: { id: true, name: true } },
            },
          },
          _count: { select: { reviews: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.court.count({ where }),
    ])

    return success({ items: courts, pagination: { page: 1, limit: 20, total, totalPages: Math.ceil(total / 20) } })
  })

  app.get('/teams', async (request: FastifyRequest) => {
    const page = z.coerce.number().default(1).parse((request.query as { page?: string })?.page)
    const limit = z.coerce.number().min(1).max(50).default(20).parse((request.query as { limit?: string })?.limit)

    const where = { status: 'OPEN' }

    const [teamPosts, total] = await Promise.all([
      prisma.teamPost.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          court: {
            select: {
              id: true,
              name: true,
              sport: { select: { id: true, name: true, displayName: true } },
              branch: { select: { id: true, name: true, city: true } },
            },
          },
          createdBy: {
            select: { id: true, name: true, avatar: true },
          },
          _count: { select: { members: true, joinRequests: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.teamPost.count({ where }),
    ])

    return success({ items: teamPosts, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } })
  })

  app.get('/coaches', async () => {
    const result = await listCoaches({ page: 1, limit: 50 })
    return success(
      result.items.map((coach) => ({
        id: coach.id,
        slug: coach.slug,
        name: coach.user.name,
        sport: coach.sport.displayName,
        bio: coach.bio ?? '',
        image: coach.user.avatar ?? 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=1200&q=80',
        sessionRate: `${Number(coach.sessionRate)} EGP / hr`,
        experienceYears: coach.experienceYears,
      })),
    )
  })

  app.get('/notifications/unread-count', async (request: FastifyRequest) => {
    const count = await getUnreadNotificationsCount(request.user!.userId)
    return success({ count })
  })
}
