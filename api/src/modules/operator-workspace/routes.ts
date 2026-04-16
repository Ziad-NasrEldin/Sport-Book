import type { FastifyInstance, FastifyRequest } from 'fastify'
import { z } from 'zod'
import {
  getOperatorFacility,
  updateOperatorFacility,
  getOperatorBookings,
  getOperatorRevenue,
  createCourt,
  updateCourt,
  deleteCourt,
  createCourtPricingRule,
  createCourtClosure,
  getOperatorCourts,
} from './service'
import {
  updateFacilitySchema,
  createCourtSchema,
  updateCourtSchema,
  createCourtPricingRuleSchema,
  createCourtClosureSchema,
} from './schema'
import { success } from '@common/response'

export async function operatorWorkspaceRoutes(app: FastifyInstance) {
  // All routes require authentication and operator role
  app.addHook('preHandler', async (request: FastifyRequest, reply) => {
    try {
      await request.jwtVerify()
    } catch (err) {
      return reply.status(401).send({
        error: 'Unauthorized - Please log in',
        code: 'UNAUTHORIZED'
      })
    }
    if (request.user!.role !== 'OPERATOR') {
      return reply.status(403).send({
        error: 'Forbidden: Operator role required',
        code: 'FORBIDDEN'
      })
    }
  })

  // GET /operator-workspace/facility - Get operator's facility
  app.get('/facility', async (request: FastifyRequest) => {
    const facility = await getOperatorFacility(request.user!.userId)
    return success(facility)
  })

  // PATCH /operator-workspace/facility - Update facility
  app.patch('/facility', async (request: FastifyRequest) => {
    const data = updateFacilitySchema.parse(request.body)
    const facility = await updateOperatorFacility(request.user!.userId, data)
    return success(facility)
  })

  // GET /operator-workspace/bookings - Get operator's bookings
  app.get('/bookings', async (request: FastifyRequest) => {
    const status = (request.query as { status?: string }).status
    const startDate = (request.query as { startDate?: string }).startDate
    const endDate = (request.query as { endDate?: string }).endDate
    const page = z.coerce.number().default(1).parse((request.query as { page?: string }).page)
    const limit = z.coerce.number().min(1).max(50).default(20).parse((request.query as { limit?: string }).limit)

    const result = await getOperatorBookings(request.user!.userId, { status, startDate, endDate, page, limit })
    return success(result)
  })

  // GET /operator-workspace/revenue - Get operator's revenue
  app.get('/revenue', async (request: FastifyRequest) => {
    const startDate = (request.query as { startDate?: string }).startDate
    const endDate = (request.query as { endDate?: string }).endDate

    const result = await getOperatorRevenue(request.user!.userId, { startDate, endDate })
    return success(result)
  })

  // GET /operator-workspace/courts - Get operator's courts
  app.get('/courts', async (request: FastifyRequest) => {
    const courts = await getOperatorCourts(request.user!.userId)
    return success(courts)
  })

  // POST /operator-workspace/courts - Create court
  app.post('/courts', async (request: FastifyRequest) => {
    const data = createCourtSchema.parse(request.body)
    const court = await createCourt(request.user!.userId, data)
    return success(court)
  })

  // PATCH /operator-workspace/courts/:id - Update court
  app.patch('/courts/:id', async (request: FastifyRequest) => {
    const { id } = request.params as { id: string }
    const data = updateCourtSchema.parse(request.body)
    const court = await updateCourt(request.user!.userId, id, data)
    return success(court)
  })

  // DELETE /operator-workspace/courts/:id - Delete court
  app.delete('/courts/:id', async (request: FastifyRequest) => {
    const { id } = request.params as { id: string }
    const result = await deleteCourt(request.user!.userId, id)
    return success(result)
  })

  // POST /operator-workspace/courts/pricing-rules - Create pricing rule
  app.post('/courts/pricing-rules', async (request: FastifyRequest) => {
    const data = createCourtPricingRuleSchema.parse(request.body)
    const rule = await createCourtPricingRule(request.user!.userId, data)
    return success(rule)
  })

  // POST /operator-workspace/courts/closures - Create court closure
  app.post('/courts/closures', async (request: FastifyRequest) => {
    const data = createCourtClosureSchema.parse(request.body)
    const closure = await createCourtClosure(request.user!.userId, data)
    return success(closure)
  })
}
