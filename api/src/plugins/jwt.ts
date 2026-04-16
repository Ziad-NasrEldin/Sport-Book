import jwt from '@fastify/jwt'
import type { FastifyInstance, FastifyRequest } from 'fastify'
import { env } from '@config/env'
import { UnauthorizedError, ForbiddenError } from '@common/errors'

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: {
      userId: string
      email: string
      role: string
    }
    user: {
      userId: string
      email: string
      role: string
    }
  }
}

declare module 'fastify' {
  interface FastifyRequest {
    user: {
      userId: string
      email: string
      role: string
    }
  }
}

export async function registerJwt(app: FastifyInstance) {
  await app.register(jwt, {
    secret: env.JWT_SECRET,
    cookie: {
      cookieName: 'refreshToken',
      signed: false,
    },
    sign: {
      expiresIn: env.JWT_EXPIRES_IN,
    },
  })

  app.decorate('authenticate', async (request: FastifyRequest) => {
    try {
      await request.jwtVerify()
    } catch (err) {
      throw new UnauthorizedError()
    }
  })
}

export const authDecorators = {
  async requireAuth(request: FastifyRequest) {
    try {
      await request.jwtVerify()
    } catch {
      throw new UnauthorizedError()
    }
  },

  requireRole(...allowedRoles: string[]) {
    return async (request: FastifyRequest) => {
      try {
        await request.jwtVerify()
      } catch {
        throw new UnauthorizedError()
      }
      if (!allowedRoles.includes(request.user.role)) {
        throw new ForbiddenError()
      }
    }
  },
}
