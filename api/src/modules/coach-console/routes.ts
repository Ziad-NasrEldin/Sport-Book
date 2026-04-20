import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { success } from '@common/response'
import {
  coachAvailabilityCreateSchema,
  coachAvailabilityExceptionCreateSchema,
  coachAvailabilityExceptionUpdateSchema,
  coachAvailabilityUpdateSchema,
  coachProfileUpdateSchema,
  coachServiceCreateSchema,
  coachServiceUpdateSchema,
  coachSessionTypeCreateSchema,
  coachSessionTypeUpdateSchema,
  coachSettingsUpdateSchema,
} from './schema'
import {
  createCoachAvailabilityExceptionView,
  createCoachAvailabilityWindow,
  createCoachServiceView,
  createCoachSessionType,
  deleteCoachAvailabilityExceptionView,
  deleteCoachAvailabilityWindow,
  deleteCoachServiceView,
  deleteCoachSessionType,
  getCoachAvailabilityView,
  getCoachSecurityInfo,
  listCoachAvailabilityTemplates,
  getCoachDashboard,
  getCoachProfileView,
  getCoachReportsView,
  getCoachSettingsView,
  listCoachBookingsView,
  listCoachServices,
  listCoachSessionTypes,
  updateCoachAvailabilityExceptionView,
  updateCoachAvailabilityWindow,
  updateCoachProfileView,
  updateCoachServiceView,
  updateCoachSessionType,
  updateCoachSettingsView,
} from './service'

async function requireCoach(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify()
  } catch {
    return reply.status(401).send({ error: 'Unauthorized - Please log in', code: 'UNAUTHORIZED' })
  }

  if (request.user?.role !== 'COACH') {
    return reply.status(403).send({ error: 'Forbidden: Coach role required', code: 'FORBIDDEN' })
  }
}

export async function coachConsoleRoutes(app: FastifyInstance) {
  app.addHook('preHandler', requireCoach)

  app.get('/dashboard', async (request) => success(await getCoachDashboard(request.user!.userId)))

  app.get('/profile', async (request) => success(await getCoachProfileView(request.user!.userId)))
  app.put('/profile', async (request) =>
    success(await updateCoachProfileView(request.user!.userId, coachProfileUpdateSchema.parse(request.body))),
  )

  app.get('/settings', async (request) => success(await getCoachSettingsView(request.user!.userId)))
  app.put('/settings', async (request) =>
    success(await updateCoachSettingsView(request.user!.userId, coachSettingsUpdateSchema.parse(request.body))),
  )

  app.get('/session-types', async (request) => success(await listCoachSessionTypes(request.user!.userId)))
  app.post('/session-types', async (request) =>
    success(await createCoachSessionType(request.user!.userId, coachSessionTypeCreateSchema.parse(request.body))),
  )
  app.patch('/session-types/:id', async (request) => {
    const { id } = request.params as { id: string }
    return success(await updateCoachSessionType(request.user!.userId, id, coachSessionTypeUpdateSchema.parse(request.body)))
  })
  app.delete('/session-types/:id', async (request) => {
    const { id } = request.params as { id: string }
    return success(await deleteCoachSessionType(request.user!.userId, id))
  })

  app.get('/services', async (request) => success(await listCoachServices(request.user!.userId)))
  app.post('/services', async (request) =>
    success(await createCoachServiceView(request.user!.userId, coachServiceCreateSchema.parse(request.body))),
  )
  app.patch('/services/:id', async (request) => {
    const { id } = request.params as { id: string }
    return success(await updateCoachServiceView(request.user!.userId, id, coachServiceUpdateSchema.parse(request.body)))
  })
  app.delete('/services/:id', async (request) => {
    const { id } = request.params as { id: string }
    return success(await deleteCoachServiceView(request.user!.userId, id))
  })

  app.get('/availability', async (request) => success(await getCoachAvailabilityView(request.user!.userId)))
  app.post('/availability', async (request) =>
    success(await createCoachAvailabilityWindow(request.user!.userId, coachAvailabilityCreateSchema.parse(request.body))),
  )
  app.patch('/availability/:id', async (request) => {
    const { id } = request.params as { id: string }
    return success(await updateCoachAvailabilityWindow(request.user!.userId, id, coachAvailabilityUpdateSchema.parse(request.body)))
  })
  app.delete('/availability/:id', async (request) => {
    const { id } = request.params as { id: string }
    return success(await deleteCoachAvailabilityWindow(request.user!.userId, id))
  })

  app.post('/availability/exceptions', async (request) =>
    success(
      await createCoachAvailabilityExceptionView(
        request.user!.userId,
        coachAvailabilityExceptionCreateSchema.parse(request.body),
      ),
    ),
  )
  app.patch('/availability/exceptions/:id', async (request) => {
    const { id } = request.params as { id: string }
    return success(
      await updateCoachAvailabilityExceptionView(
        request.user!.userId,
        id,
        coachAvailabilityExceptionUpdateSchema.parse(request.body),
      ),
    )
  })
  app.delete('/availability/exceptions/:id', async (request) => {
    const { id } = request.params as { id: string }
    return success(await deleteCoachAvailabilityExceptionView(request.user!.userId, id))
  })

  app.get('/availability-templates', async (request) => success(await listCoachAvailabilityTemplates(request.user!.userId)))

  app.get('/security', async (request) => success(await getCoachSecurityInfo(request.user!.userId)))

  app.get('/bookings', async (request) => success(await listCoachBookingsView(request.user!.userId)))
  app.get('/reports', async (request) => success(await getCoachReportsView(request.user!.userId)))
}
