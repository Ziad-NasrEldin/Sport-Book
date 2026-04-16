import type { FastifyInstance, FastifyRequest } from 'fastify'
import { z } from 'zod'
import {
  createReview,
  getReview,
  updateReview,
  deleteReview,
  moderateReview,
  listReviews,
  getAverageRating,
} from './service'
import {
  createReviewSchema,
  updateReviewSchema,
  moderateReviewSchema,
} from './schema'
import { success } from '@common/response'

export async function reviewRoutes(app: FastifyInstance) {
  // All routes require authentication
  app.addHook('preHandler', async (request: FastifyRequest) => {
    await request.jwtVerify()
  })

  // POST /reviews - Create review
  app.post('/', async (request: FastifyRequest) => {
    const data = createReviewSchema.parse(request.body)
    const review = await createReview(request.user!.userId, data)
    return success(review)
  })

  // GET /reviews - List reviews with filters
  app.get('/', async (request: FastifyRequest) => {
    const targetType = (request.query as { targetType?: string }).targetType
    const facilityId = (request.query as { facilityId?: string }).facilityId
    const courtId = (request.query as { courtId?: string }).courtId
    const coachId = (request.query as { coachId?: string }).coachId
    const status = (request.query as { status?: string }).status
    const page = z.coerce.number().default(1).parse((request.query as { page?: string }).page)
    const limit = z.coerce.number().min(1).max(50).default(20).parse((request.query as { limit?: string }).limit)

    const result = await listReviews({ targetType, facilityId, courtId, coachId, status, page, limit })
    return success(result)
  })

  // GET /reviews/:id - Get review details
  app.get('/:id', async (request: FastifyRequest) => {
    const { id } = request.params as { id: string }
    const review = await getReview(id)
    return success(review)
  })

  // PATCH /reviews/:id - Update review
  app.patch('/:id', async (request: FastifyRequest) => {
    const { id } = request.params as { id: string }
    const data = updateReviewSchema.parse(request.body)
    const review = await updateReview(request.user!.userId, id, data)
    return success(review)
  })

  // DELETE /reviews/:id - Delete review
  app.delete('/:id', async (request: FastifyRequest) => {
    const { id } = request.params as { id: string }
    const result = await deleteReview(request.user!.userId, id)
    return success(result)
  })

  // POST /reviews/:id/moderate - Moderate review (admin/operator only)
  app.post('/:id/moderate', async (request: FastifyRequest) => {
    const { id } = request.params as { id: string }
    const data = moderateReviewSchema.parse(request.body)
    const review = await moderateReview(request.user!.userId, id, data)
    return success(review)
  })

  // GET /reviews/average - Get average rating for target
  app.get('/average/rating', async (request: FastifyRequest) => {
    const targetType = (request.query as { targetType?: string }).targetType
    const targetId = (request.query as { targetId?: string }).targetId

    if (!targetType || !targetId) {
      return success({ error: 'targetType and targetId are required' })
    }

    const result = await getAverageRating(targetType, targetId)
    return success(result)
  })
}
