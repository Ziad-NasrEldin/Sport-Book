import rateLimit from '@fastify/rate-limit'
import type { FastifyInstance } from 'fastify'

export async function registerRateLimit(app: FastifyInstance) {
  await app.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
    skipOnError: true,
    keyGenerator: (request) => request.ip,
    errorResponseBuilder: (req, context) => ({
      error: `Rate limit exceeded. Retry in ${context.after}`,
      code: 'RATE_LIMIT_EXCEEDED',
    }),
  })
}
