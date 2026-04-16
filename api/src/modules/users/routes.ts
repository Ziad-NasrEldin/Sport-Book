import type { FastifyInstance, FastifyRequest } from 'fastify'
import { z } from 'zod'
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
} from './service'
import {
  updateProfileSchema,
  updatePreferencesSchema,
  addFavoriteSchema,
} from './schema'
import { success } from '@common/response'

export async function userRoutes(app: FastifyInstance) {
  // All routes require authentication
  app.addHook('preHandler', async (request: FastifyRequest) => {
    await request.jwtVerify()
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
    const notificationIds = (request.body as { notificationIds?: string[] })?.notificationIds
    await markNotificationsAsRead(request.user!.userId, notificationIds)
    return success({ message: 'Notifications marked as read' })
  })
}
