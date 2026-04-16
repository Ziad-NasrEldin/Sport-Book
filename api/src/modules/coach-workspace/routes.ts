import type { FastifyInstance, FastifyRequest } from 'fastify'
import { z } from 'zod'
import {
  getCoachProfile,
  updateCoachProfile,
  createCoachService,
  updateCoachService,
  deleteCoachService,
  setAvailability,
  setAvailabilityException,
  getCoachBookings,
  getCoachEarnings,
} from './service'
import {
  updateCoachProfileSchema,
  createCoachServiceSchema,
  updateCoachServiceSchema,
  setAvailabilitySchema,
  setAvailabilityExceptionSchema,
} from './schema'
import { success } from '@common/response'

export async function coachWorkspaceRoutes(app: FastifyInstance) {
  // All routes require authentication and coach role
  app.addHook('preHandler', async (request: FastifyRequest) => {
    await request.jwtVerify()
    if (request.user!.role !== 'COACH') {
      throw new Error('Unauthorized: Coach role required')
    }
  })

  // GET /coach-workspace/profile - Get coach profile
  app.get('/profile', async (request: FastifyRequest) => {
    const profile = await getCoachProfile(request.user!.userId)
    return success(profile)
  })

  // PATCH /coach-workspace/profile - Update coach profile
  app.patch('/profile', async (request: FastifyRequest) => {
    const data = updateCoachProfileSchema.parse(request.body)
    const profile = await updateCoachProfile(request.user!.userId, data)
    return success(profile)
  })

  // POST /coach-workspace/services - Create coach service
  app.post('/services', async (request: FastifyRequest) => {
    const data = createCoachServiceSchema.parse(request.body)
    const service = await createCoachService(request.user!.userId, data)
    return success(service)
  })

  // PATCH /coach-workspace/services/:id - Update coach service
  app.patch('/services/:id', async (request: FastifyRequest) => {
    const { id } = request.params as { id: string }
    const data = updateCoachServiceSchema.parse(request.body)
    const service = await updateCoachService(request.user!.userId, id, data)
    return success(service)
  })

  // DELETE /coach-workspace/services/:id - Delete coach service
  app.delete('/services/:id', async (request: FastifyRequest) => {
    const { id } = request.params as { id: string }
    const result = await deleteCoachService(request.user!.userId, id)
    return success(result)
  })

  // POST /coach-workspace/availability - Set availability
  app.post('/availability', async (request: FastifyRequest) => {
    const data = setAvailabilitySchema.parse(request.body)
    const availability = await setAvailability(request.user!.userId, data)
    return success(availability)
  })

  // POST /coach-workspace/availability/exception - Set availability exception
  app.post('/availability/exception', async (request: FastifyRequest) => {
    const data = setAvailabilityExceptionSchema.parse(request.body)
    const exception = await setAvailabilityException(request.user!.userId, data)
    return success(exception)
  })

  // GET /coach-workspace/bookings - Get coach bookings
  app.get('/bookings', async (request: FastifyRequest) => {
    const status = (request.query as { status?: string }).status
    const startDate = (request.query as { startDate?: string }).startDate
    const endDate = (request.query as { endDate?: string }).endDate
    const page = z.coerce.number().default(1).parse((request.query as { page?: string }).page)
    const limit = z.coerce.number().min(1).max(50).default(20).parse((request.query as { limit?: string }).limit)

    const result = await getCoachBookings(request.user!.userId, { status, startDate, endDate, page, limit })
    return success(result)
  })

  // GET /coach-workspace/earnings - Get coach earnings
  app.get('/earnings', async (request: FastifyRequest) => {
    const startDate = (request.query as { startDate?: string }).startDate
    const endDate = (request.query as { endDate?: string }).endDate

    const result = await getCoachEarnings(request.user!.userId, { startDate, endDate })
    return success(result)
  })
}
