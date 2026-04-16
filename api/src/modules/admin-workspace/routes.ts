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
}
