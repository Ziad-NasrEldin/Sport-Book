import type { FastifyInstance, FastifyRequest } from 'fastify'
import { z } from 'zod'
import {
  createBooking,
  cancelBooking,
  rescheduleBooking,
  getBooking,
  listBookings,
} from './service'
import { createBookingSchema, cancelBookingSchema, rescheduleBookingSchema } from './schema'
import { success } from '@common/response'

export async function bookingRoutes(app: FastifyInstance) {
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

  // POST /bookings - Create booking
  app.post('/', async (request: FastifyRequest) => {
    const data = createBookingSchema.parse(request.body)
    const booking = await createBooking(request.user!.userId, data)
    return success(booking)
  })

  // GET /bookings - List user's bookings
  app.get('/', async (request: FastifyRequest) => {
    const status = (request.query as { status?: string }).status
    const type = (request.query as { type?: string }).type
    const page = z.coerce.number().default(1).parse((request.query as { page?: string }).page)
    const limit = z.coerce.number().min(1).max(50).default(20).parse((request.query as { limit?: string }).limit)

    const result = await listBookings(request.user!.userId, { status, type, page, limit })
    return success(result)
  })

  // GET /bookings/:id - Get booking details
  app.get('/:id', async (request: FastifyRequest) => {
    const { id } = request.params as { id: string }
    const booking = await getBooking(request.user!.userId, id)
    return success(booking)
  })

  // POST /bookings/:id/cancel - Cancel booking
  app.post('/:id/cancel', async (request: FastifyRequest) => {
    const { id } = request.params as { id: string }
    const data = cancelBookingSchema.parse(request.body)
    const booking = await cancelBooking(request.user!.userId, id, data)
    return success(booking)
  })

  // POST /bookings/:id/reschedule - Reschedule booking
  app.post('/:id/reschedule', async (request: FastifyRequest) => {
    const { id } = request.params as { id: string }
    const data = rescheduleBookingSchema.parse(request.body)
    const booking = await rescheduleBooking(request.user!.userId, id, data)
    return success(booking)
  })

  // POST /bookings/price-check - Calculate price without creating booking
  app.post('/price-check', async (request: FastifyRequest) => {
    const data = createBookingSchema.parse(request.body)
    const { calculatePrice } = await import('./service')
    const bookingDate = new Date(data.date)
    const pricing = await calculatePrice(
      data.type,
      data.courtId,
      data.coachId,
      data.coachServiceId,
      bookingDate,
      data.startHour,
      data.endHour,
      data.couponCode
    )
    return success(pricing)
  })
}
