import type { FastifyInstance, FastifyRequest } from 'fastify'
import { z } from 'zod'
import {
  createTeamPost,
  getTeamPost,
  listTeamPosts,
  joinTeamPost,
  respondToJoinRequest,
  leaveTeamPost,
  cancelTeamPost,
} from './service'
import {
  createTeamPostSchema,
  joinTeamPostSchema,
  respondToJoinRequestSchema,
} from './schema'
import { success } from '@common/response'

export async function teamRoutes(app: FastifyInstance) {
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

  // POST /teams - Create team post
  app.post('/', async (request: FastifyRequest) => {
    const data = createTeamPostSchema.parse(request.body)
    const teamPost = await createTeamPost(request.user!.userId, data)
    return success(teamPost)
  })

  // GET /teams - List team posts with filters
  app.get('/', async (request: FastifyRequest) => {
    const courtId = (request.query as { courtId?: string }).courtId
    const status = (request.query as { status?: string }).status
    const date = (request.query as { date?: string }).date
    const page = z.coerce.number().default(1).parse((request.query as { page?: string }).page)
    const limit = z.coerce.number().min(1).max(50).default(20).parse((request.query as { limit?: string }).limit)

    const result = await listTeamPosts({ courtId, status, date, page, limit })
    return success(result)
  })

  // GET /teams/:id - Get team post details
  app.get('/:id', async (request: FastifyRequest) => {
    const { id } = request.params as { id: string }
    const teamPost = await getTeamPost(id)
    return success(teamPost)
  })

  // POST /teams/:id/join - Request to join team
  app.post('/:id/join', async (request: FastifyRequest) => {
    const { id } = request.params as { id: string }
    const data = joinTeamPostSchema.parse({ teamPostId: id })
    const joinRequest = await joinTeamPost(request.user!.userId, data)
    return success(joinRequest)
  })

  // POST /teams/requests/:requestId/respond - Respond to join request
  app.post('/requests/:requestId/respond', async (request: FastifyRequest) => {
    const { requestId } = request.params as { requestId: string }
    const data = respondToJoinRequestSchema.parse(request.body)
    const result = await respondToJoinRequest(request.user!.userId, requestId, data)
    return success(result)
  })

  // POST /teams/:id/leave - Leave team
  app.post('/:id/leave', async (request: FastifyRequest) => {
    const { id } = request.params as { id: string }
    const result = await leaveTeamPost(request.user!.userId, id)
    return success(result)
  })

  // POST /teams/:id/cancel - Cancel team post
  app.post('/:id/cancel', async (request: FastifyRequest) => {
    const { id } = request.params as { id: string }
    const result = await cancelTeamPost(request.user!.userId, id)
    return success(result)
  })
}
