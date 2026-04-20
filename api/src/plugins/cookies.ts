import cookie from '@fastify/cookie'
import type { FastifyInstance } from 'fastify'
import { env } from '@config/env'

export async function registerCookies(app: FastifyInstance) {
  await app.register(cookie, {
    secret: env.JWT_SECRET,
    parseOptions: {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: env.NODE_ENV === 'production' ? 'strict' : 'lax',
      path: '/',
    },
  })
}
