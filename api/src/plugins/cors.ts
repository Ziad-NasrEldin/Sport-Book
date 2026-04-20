import cors from '@fastify/cors'
import type { FastifyInstance } from 'fastify'
import { env } from '@config/env'

export async function registerCors(app: FastifyInstance) {
  const configuredOrigins = env.WEB_ORIGIN.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)

  const isAllowedOrigin = (origin?: string) => {
    if (!origin) return true

    if (configuredOrigins.includes(origin)) {
      return true
    }

    if (env.NODE_ENV !== 'production') {
      return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin)
    }

    return false
  }

  await app.register(cors, {
    origin: (origin, callback) => {
      callback(null, isAllowedOrigin(origin))
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
}
