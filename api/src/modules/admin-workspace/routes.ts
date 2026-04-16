import type { FastifyInstance, FastifyRequest } from 'fastify'
import { z } from 'zod'
import {
  listUsers,
  getUser,
  updateUser,
  listRoleUpgrades,
  respondToRoleUpgrade,
  getDashboardStats,
  listAuditLogs,
  listFacilities,
  listCoaches,
  listBookings,
  listFinance,
  listSports,
} from './service'
import {
  listUsersSchema,
  updateUserSchema,
  respondToRoleUpgradeSchema,
  listRoleUpgradesSchema,
  listAuditLogsSchema,
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
    const result = await respondToRoleUpgrade(id, data)
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

  // GET /admin-workspace/coaches - List coaches
  app.get('/coaches', async (request: FastifyRequest) => {
    const status = (request.query as { status?: string }).status
    const page = z.coerce.number().default(1).parse((request.query as { page?: string }).page)
    const limit = z.coerce.number().min(1).max(50).default(20).parse((request.query as { limit?: string }).limit)

    const result = await listCoaches({ page, limit, status })
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

  // GET /admin-workspace/verification/:id - Get verification case details
  app.get('/verification/:id', async (request: FastifyRequest) => {
    const { id } = request.params as { id: string }
    // Mock response for verification case
    const verificationCase = {
      id,
      entity: 'User',
      type: 'Identity Verification',
      submittedAt: new Date().toISOString(),
      riskLevel: 'Low',
      status: 'Pending Review',
      region: 'Egypt',
      assignee: 'Compliance Team',
      checklist: [
        { id: 'doc-id', label: 'National ID / Passport validation', verified: true },
        { id: 'doc-face', label: 'Face match and selfie confidence', verified: false },
        { id: 'doc-license', label: 'Business or coaching license authenticity', verified: true },
        { id: 'doc-bank', label: 'Bank account ownership proof', verified: false },
      ],
      timeline: [
        { id: 'seed-1', message: 'Case created and queued for review.', at: new Date().toISOString() },
        { id: 'seed-2', message: 'Automated risk scoring completed.', at: new Date().toISOString() },
      ],
    }
    return success(verificationCase)
  })

  // PUT /admin-workspace/verification/:id/status - Update verification case status
  app.put('/verification/:id/status', async (request: FastifyRequest) => {
    const { id } = request.params as { id: string }
    const { status } = request.body as { status: string }
    // Mock response
    return success({ id, status })
  })

  // GET /admin-workspace/cms - List CMS pages
  app.get('/cms', async () => {
    const cmsData = [
      {
        id: '1',
        page: 'Terms of Service',
        content: 'Terms of Service content...',
        status: 'PUBLISHED',
        language: 'en',
        version: '1.0',
      },
      {
        id: '2',
        page: 'Privacy Policy',
        content: 'Privacy Policy content...',
        status: 'PUBLISHED',
        language: 'en',
        version: '1.0',
      },
    ]
    return success(cmsData)
  })

  // PUT /admin-workspace/cms/:id - Update CMS page
  app.put('/cms/:id', async (request: FastifyRequest) => {
    const { id } = request.params as { id: string }
    const { content, status } = request.body as { content: string; status: string }
    // Mock response
    return success({ id, content, status })
  })

  // GET /admin-workspace/coupons - List coupons
  app.get('/coupons', async () => {
    const coupons = [
      {
        id: '1',
        code: 'WELCOME20',
        type: 'PERCENTAGE',
        value: 20,
        status: 'ACTIVE',
        usesCount: 45,
        maxUses: 100,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ]
    return success(coupons)
  })

  // PATCH /admin-workspace/coupons/:id - Update coupon
  app.patch('/coupons/:id', async (request: FastifyRequest) => {
    const { id } = request.params as { id: string }
    const { status } = request.body as { status: string }
    // Mock response
    return success({ id, status })
  })

  // GET /admin-workspace/reviews - List reviews
  app.get('/reviews', async () => {
    const reviews = [
      {
        id: '1',
        userId: 'user-1',
        user: { name: 'John Doe', email: 'john@example.com' },
        rating: 5,
        comment: 'Great service!',
        status: 'APPROVED',
        createdAt: new Date().toISOString(),
      },
    ]
    return success(reviews)
  })

  // PATCH /admin-workspace/reviews/:id/status - Update review status
  app.patch('/reviews/:id/status', async (request: FastifyRequest) => {
    const { id } = request.params as { id: string }
    const { status } = request.body as { status: string }
    // Mock response
    return success({ id, status })
  })

  // GET /admin-workspace/reports - List reports
  app.get('/reports', async () => {
    const reports = [
      {
        id: '1',
        name: 'Monthly Revenue',
        owner: 'Admin',
        frequency: 'Monthly',
        format: 'PDF',
        status: 'ACTIVE',
        lastRun: new Date().toISOString(),
      },
    ]
    return success(reports)
  })

  // GET /admin-workspace/localization - List localizations
  app.get('/localization', async () => {
    const localizations = [
      {
        id: '1',
        locale: 'en-EG',
        language: 'English (Egypt)',
        currency: 'EGP',
        timezone: 'Africa/Cairo',
        rtl: false,
      },
      {
        id: '2',
        locale: 'ar-EG',
        language: 'Arabic (Egypt)',
        currency: 'EGP',
        timezone: 'Africa/Cairo',
        rtl: true,
      },
    ]
    return success(localizations)
  })

  // GET /admin-workspace/store/products - List store products
  app.get('/store/products', async () => {
    const products = [
      {
        id: '1',
        title: 'Tennis Racket Pro',
        category: 'Equipment',
        price: 2500,
        quantity: 15,
        status: 'IN_STOCK',
        facility: { name: 'City Sports Club' },
        createdAt: new Date().toISOString(),
      },
    ]
    return success(products)
  })

  // GET /admin-workspace/store/orders - List store orders
  app.get('/store/orders', async () => {
    const orders = [
      {
        id: '1',
        productId: '1',
        product: { title: 'Tennis Racket Pro' },
        quantity: 2,
        total: 5000,
        status: 'DELIVERED',
        fulfillment: 'PICKUP',
        user: { name: 'Jane Smith', email: 'jane@example.com' },
        createdAt: new Date().toISOString(),
      },
    ]
    return success(orders)
  })
}
