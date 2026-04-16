import type { FastifyInstance } from 'fastify'
import { ZodError } from 'zod'
import { ApiError } from '@common/errors'

export async function registerErrorHandler(app: FastifyInstance) {
  app.setErrorHandler((error, request, reply) => {
    if (error instanceof ApiError) {
      return reply.status(error.statusCode).send({
        error: error.message,
        code: error.code,
      })
    }

    if (error instanceof ZodError) {
      const message = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
      return reply.status(400).send({
        error: `Validation failed: ${message}`,
        code: 'VALIDATION_ERROR',
      })
    }

    if (error.validation) {
      return reply.status(400).send({
        error: error.message,
        code: 'VALIDATION_ERROR',
      })
    }

    // Handle Fastify JWT errors
    if (error.code && error.code.startsWith('FST_JWT')) {
      return reply.status(401).send({
        error: 'Unauthorized',
        code: 'UNAUTHORIZED',
      })
    }

    request.log.error(error)
    return reply.status(500).send({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
    })
  })
}
