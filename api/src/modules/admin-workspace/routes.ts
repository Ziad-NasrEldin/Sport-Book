import type { FastifyInstance, FastifyRequest } from 'fastify'
import { z } from 'zod'
import {
  listUsers,
  getUser,
  updateUser,
  updateBookingStatus,
  listRoleUpgrades,
  respondToRoleUpgrade,
  getDashboardStats,
  listAuditLogs,
  listFacilities,
  createFacility,
  listCoaches,
  createCoach,
  listBookings,
  listFinance,
  listSports,
  createSport,
  updateSport,
  getVerificationCase,
  updateVerificationCase,
  listCoupons,
  createCoupon,
  updateCoupon,
  listReviews,
  updateReviewStatus,
  listCmsPages,
  updateCmsPage,
  listReports,
  createReportJob,
  getLocalizationConfig,
  updateLocalizationDefault,
  getPlatformSettings,
  updatePlatformSettings,
  listStoreProducts,
  createStoreProduct,
  updateStoreProduct,
  archiveStoreProduct,
  deleteStoreProduct,
  listStoreOrders,
  updateStoreOrderStatus,
} from './service'
import {
  updateUserSchema,
  createFacilitySchema,
  createCoachSchema,
  createStoreProductSchema,
  updateStoreProductSchema,
  updateStoreOrderStatusSchema,
  updateBookingStatusSchema,
  createSportSchema,
  updateSportSchema,
  updateVerificationCaseSchema,
  createCouponSchema,
  createReportJobSchema,
  updateLocalizationDefaultSchema,
  updatePlatformSettingsSchema,
  respondToRoleUpgradeSchema,
} from './schema'
import { success } from '@common/response'

export async function adminWorkspaceRoutes(app: FastifyInstance) {
  // All routes require authentication and admin role
  app.addHook('preHandler', async (request: FastifyRequest, reply) => {
    try {
      await request.jwtVerify()
    } catch (err) {
      return reply.status(401).send({
        error: 'Unauthorized - Please log in',
        code: 'UNAUTHORIZED'
      })
    }
    if (request.user!.role !== 'ADMIN') {
      return reply.status(403).send({
        error: 'Forbidden: Admin role required',
        code: 'FORBIDDEN'
      })
    }
  })

  // GET /admin-workspace/dashboard - Get dashboard stats
  app.get('/dashboard', async () => {
    const stats = await getDashboardStats()
    return success(stats)
  })

  // GET /admin-workspace/users - List users
  app.get('/users', async (request: FastifyRequest) => {
    const role = (request.query as { role?: string }).role
    const status = (request.query as { status?: string }).status
    const search = (request.query as { search?: string }).search
    const page = z.coerce.number().default(1).parse((request.query as { page?: string }).page)
    const limit = z.coerce.number().min(1).max(50).default(20).parse((request.query as { limit?: string }).limit)

    const result = await listUsers({ page, limit, role, status, search })
    return success(result)
  })

  // GET /admin-workspace/users/:id - Get user details
  app.get('/users/:id', async (request: FastifyRequest) => {
    const { id } = request.params as { id: string }
    const user = await getUser(id)
    return success(user)
  })

  // PATCH /admin-workspace/users/:id - Update user
  app.patch('/users/:id', async (request: FastifyRequest) => {
    const { id } = request.params as { id: string }
    const data = updateUserSchema.parse(request.body)
    const user = await updateUser(id, data)
    return success(user)
  })

  // PUT /admin-workspace/users/:id - Update user
  app.put('/users/:id', async (request: FastifyRequest) => {
    const { id } = request.params as { id: string }
    const data = updateUserSchema.parse(request.body)
    const user = await updateUser(id, data)
    return success(user)
  })

  // GET /admin-workspace/role-upgrades - List role upgrade requests
  app.get('/role-upgrades', async (request: FastifyRequest) => {
    const status = (request.query as { status?: string }).status
    const page = z.coerce.number().default(1).parse((request.query as { page?: string }).page)
    const limit = z.coerce.number().min(1).max(50).default(20).parse((request.query as { limit?: string }).limit)

    const result = await listRoleUpgrades({ page, limit, status })
    return success(result)
  })

  // POST /admin-workspace/role-upgrades/:id/respond - Respond to role upgrade
  app.post('/role-upgrades/:id/respond', async (request: FastifyRequest) => {
    const { id } = request.params as { id: string }
    const data = respondToRoleUpgradeSchema.parse(request.body)
    const result = await respondToRoleUpgrade(id, data, request.user!.userId)
    return success(result)
  })

  // GET /admin-workspace/audit-logs - List audit logs
  app.get('/audit-logs', async (request: FastifyRequest) => {
    const action = (request.query as { action?: string }).action
    const userId = (request.query as { userId?: string }).userId
    const startDate = (request.query as { startDate?: string }).startDate
    const endDate = (request.query as { endDate?: string }).endDate
    const page = z.coerce.number().default(1).parse((request.query as { page?: string }).page)
    const limit = z.coerce.number().min(1).max(50).default(20).parse((request.query as { limit?: string }).limit)

    const result = await listAuditLogs({ page, limit, action, userId, startDate, endDate })
    return success(result)
  })

  // GET /admin-workspace/facilities - List facilities
  app.get('/facilities', async (request: FastifyRequest) => {
    const status = (request.query as { status?: string }).status
    const page = z.coerce.number().default(1).parse((request.query as { page?: string }).page)
    const limit = z.coerce.number().min(1).max(50).default(20).parse((request.query as { limit?: string }).limit)

    const result = await listFacilities({ page, limit, status })
    return success(result)
  })

  // POST /admin-workspace/facilities - Create facility
  app.post('/facilities', async (request: FastifyRequest) => {
    const data = createFacilitySchema.parse(request.body)
    const result = await createFacility(data, request.user!.userId)
    return success(result)
  })

  // GET /admin-workspace/coaches - List coaches
  app.get('/coaches', async (request: FastifyRequest) => {
    const status = (request.query as { status?: string }).status
    const page = z.coerce.number().default(1).parse((request.query as { page?: string }).page)
    const limit = z.coerce.number().min(1).max(50).default(20).parse((request.query as { limit?: string }).limit)

    const result = await listCoaches({ page, limit, status })
    return success(result)
  })

  // POST /admin-workspace/coaches - Create coach
  app.post('/coaches', async (request: FastifyRequest) => {
    const data = createCoachSchema.parse(request.body)
    const result = await createCoach(data, request.user!.userId)
    return success(result)
  })

  // GET /admin-workspace/bookings - List bookings
  app.get('/bookings', async (request: FastifyRequest) => {
    const status = (request.query as { status?: string }).status
    const page = z.coerce.number().default(1).parse((request.query as { page?: string }).page)
    const limit = z.coerce.number().min(1).max(50).default(20).parse((request.query as { limit?: string }).limit)

    const result = await listBookings({ page, limit, status })
    return success(result)
  })

  // PATCH /admin-workspace/bookings/:id/status - update booking status
  app.patch('/bookings/:id/status', async (request: FastifyRequest) => {
    const { id } = request.params as { id: string }
    const data = updateBookingStatusSchema.parse(request.body)
    const result = await updateBookingStatus(id, data)
    return success(result)
  })

  // GET /admin-workspace/finance - List financial transactions
  app.get('/finance', async (request: FastifyRequest) => {
    const page = z.coerce.number().default(1).parse((request.query as { page?: string }).page)
    const limit = z.coerce.number().min(1).max(50).default(20).parse((request.query as { limit?: string }).limit)

    const result = await listFinance({ page, limit })
    return success(result)
  })

  // GET /admin-workspace/sports - List sports
  app.get('/sports', async (request: FastifyRequest) => {
    const status = (request.query as { status?: string }).status
    const page = z.coerce.number().default(1).parse((request.query as { page?: string }).page)
    const limit = z.coerce.number().min(1).max(50).default(20).parse((request.query as { limit?: string }).limit)

    const result = await listSports({ page, limit, status })
    return success(result)
  })

  // POST /admin-workspace/sports - create sport
  app.post('/sports', async (request: FastifyRequest) => {
    const data = createSportSchema.parse(request.body)
    const result = await createSport(data)
    return success(result)
  })

  // PATCH /admin-workspace/sports/:id - update sport
  app.patch('/sports/:id', async (request: FastifyRequest) => {
    const { id } = request.params as { id: string }
    const data = updateSportSchema.parse(request.body)
    const result = await updateSport(id, data)
    return success(result)
  })

  // GET /admin-workspace/verification/:id - Get verification case details
  app.get('/verification/:id', async (request: FastifyRequest) => {
    const { id } = request.params as { id: string }
    const verificationCase = await getVerificationCase(id)
    return success(verificationCase)
  })

  // PUT /admin-workspace/verification/:id - Update verification case details
  app.put('/verification/:id', async (request: FastifyRequest) => {
    const { id } = request.params as { id: string }
    const data = updateVerificationCaseSchema.parse(request.body)
    const result = await updateVerificationCase(id, data, request.user!.userId)
    return success(result)
  })

  // PUT /admin-workspace/verification/:id/status - Update verification case status
  app.put('/verification/:id/status', async (request: FastifyRequest) => {
    const { id } = request.params as { id: string }
    const data = updateVerificationCaseSchema.pick({ status: true }).parse(request.body)
    const result = await updateVerificationCase(id, data, request.user!.userId)
    return success(result)
  })

  // GET /admin-workspace/cms - List CMS pages
  app.get('/cms', async () => {
    const cmsData = await listCmsPages()
    return success(cmsData)
  })

  // PUT /admin-workspace/cms/:id - Update CMS page
  app.put('/cms/:id', async (request: FastifyRequest) => {
    const { id } = request.params as { id: string }
    const { content, status } = request.body as { content: string; status: string }
    const result = await updateCmsPage(id, { content, status })
    return success(result)
  })

  // GET /admin-workspace/coupons - List coupons
  app.get('/coupons', async () => {
    const coupons = await listCoupons()
    return success(coupons)
  })

  // POST /admin-workspace/coupons - Create coupon
  app.post('/coupons', async (request: FastifyRequest) => {
    const data = createCouponSchema.parse(request.body)
    const result = await createCoupon(data)
    return success(result)
  })

  // PATCH /admin-workspace/coupons/:id - Update coupon
  app.patch('/coupons/:id', async (request: FastifyRequest) => {
    const { id } = request.params as { id: string }
    const { status } = request.body as { status: string }
    const result = await updateCoupon(id, status)
    return success(result)
  })

  // GET /admin-workspace/reviews - List reviews
  app.get('/reviews', async () => {
    const reviews = await listReviews()
    return success(reviews)
  })

  // PATCH /admin-workspace/reviews/:id/status - Update review status
  app.patch('/reviews/:id/status', async (request: FastifyRequest) => {
    const { id } = request.params as { id: string }
    const { status } = request.body as { status: string }
    const result = await updateReviewStatus(id, status)
    return success(result)
  })

  // GET /admin-workspace/reports - List reports
  app.get('/reports', async () => {
    const reports = await listReports()
    return success(reports)
  })

  // POST /admin-workspace/reports - trigger report action
  app.post('/reports', async (request: FastifyRequest) => {
    const data = createReportJobSchema.parse(request.body)
    const result = await createReportJob(data)
    return success(result)
  })

  // GET /admin-workspace/localization - localization config
  app.get('/localization', async () => {
    const config = await getLocalizationConfig()
    return success(config)
  })

  // PUT /admin-workspace/localization - update default locale
  app.put('/localization', async (request: FastifyRequest) => {
    const data = updateLocalizationDefaultSchema.parse(request.body)
    const result = await updateLocalizationDefault(data)
    return success(result)
  })

  // GET /admin-workspace/localization/default - localization config
  app.get('/localization/default', async () => {
    const config = await getLocalizationConfig()
    return success(config)
  })

  // PUT /admin-workspace/localization/default - update default locale
  app.put('/localization/default', async (request: FastifyRequest) => {
    const data = updateLocalizationDefaultSchema.parse(request.body)
    const result = await updateLocalizationDefault(data)
    return success(result)
  })

  // GET /admin-workspace/settings - platform settings
  app.get('/settings', async () => {
    const settings = await getPlatformSettings()
    return success(settings)
  })

  // PUT /admin-workspace/settings - update platform settings
  app.put('/settings', async (request: FastifyRequest) => {
    const data = updatePlatformSettingsSchema.parse(request.body)
    const result = await updatePlatformSettings(data)
    return success(result)
  })

  // GET /admin-workspace/store/products - List store products
  app.get('/store/products', async () => {
    const products = await listStoreProducts()
    return success(products)
  })

  // POST /admin-workspace/store/products - Create store product
  app.post('/store/products', async (request: FastifyRequest) => {
    const data = createStoreProductSchema.parse(request.body)
    const result = await createStoreProduct(data, request.user!.userId)
    return success(result)
  })

  // PATCH /admin-workspace/store/products/:id - Update store product
  app.patch('/store/products/:id', async (request: FastifyRequest) => {
    const { id } = request.params as { id: string }
    const data = updateStoreProductSchema.parse(request.body)
    const result = await updateStoreProduct(id, data, request.user!.userId)
    return success(result)
  })

  // DELETE /admin-workspace/store/products/:id - Archive store product
  app.delete('/store/products/:id', async (request: FastifyRequest) => {
    const { id } = request.params as { id: string }
    const result = await archiveStoreProduct(id, request.user!.userId)
    return success(result)
  })

  // DELETE /admin-workspace/store/products/:id/permanent - Permanently delete store product
  app.delete('/store/products/:id/permanent', async (request: FastifyRequest) => {
    const { id } = request.params as { id: string }
    const result = await deleteStoreProduct(id, request.user!.userId)
    return success(result)
  })

  // GET /admin-workspace/store/orders - List store orders
  app.get('/store/orders', async () => {
    const orders = await listStoreOrders()
    return success(orders)
  })

  // PATCH /admin-workspace/store/orders/:id/status - Update store order status
  app.patch('/store/orders/:id/status', async (request: FastifyRequest) => {
    const { id } = request.params as { id: string }
    const data = updateStoreOrderStatusSchema.parse(request.body)
    const result = await updateStoreOrderStatus(id, data, request.user!.userId)
    return success(result)
  })
}
