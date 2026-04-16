import cors from '@fastify/cors'
import type { FastifyInstance } from 'fastify'
import { env } from '@config/env'

export async function registerCors(app: FastifyInstance) {
  await app.register(cors, {
    origin: env.WEB_ORIGIN,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
}
