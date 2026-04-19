import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
  roleUpgradeRequestSchema,
} from './schema'
import {
  register,
  login,
  logout,
  refreshAccessToken,
  requestPasswordReset,
  resetPassword,
  requestRoleUpgrade,
  listMyRoleUpgradeRequests,
  verifyEmail,
  getAccessTokenPayload,
} from './service'
import { UnauthorizedError } from '@common/errors'
import { success } from '@common/response'
import { authDecorators } from '@plugins/jwt'

const REFRESH_COOKIE_OPTS = (secure: boolean) => ({
  httpOnly: true,
  secure,
  sameSite: 'strict' as const,
  path: '/',
  maxAge: 7 * 24 * 60 * 60,
})

export async function authRoutes(app: FastifyInstance) {
  const isProduction = process.env.NODE_ENV === 'production'

  // POST /auth/register
  app.post('/register', async (request: FastifyRequest, reply: FastifyReply) => {
    const data = registerSchema.parse(request.body)
    const result = await register(data)
    const accessToken = await reply.jwtSign(
      getAccessTokenPayload(result.user.id, result.user.email, result.user.role)
    )
    reply.setCookie('refreshToken', result.tokens.refreshToken, REFRESH_COOKIE_OPTS(isProduction))
    return success({ user: result.user, accessToken })
  })

  // POST /auth/login
  app.post('/login', async (request: FastifyRequest, reply: FastifyReply) => {
    const data = loginSchema.parse(request.body)
    const result = await login(data)
    const accessToken = await reply.jwtSign(
      getAccessTokenPayload(result.user.id, result.user.email, result.user.role)
    )
    reply.setCookie('refreshToken', result.tokens.refreshToken, REFRESH_COOKIE_OPTS(isProduction))
    return success({ user: result.user, accessToken })
  })

  // POST /auth/logout
  app.post('/logout', async (request: FastifyRequest, reply: FastifyReply) => {
    const refreshToken = request.cookies.refreshToken
    if (refreshToken) {
      try {
        await request.jwtVerify()
        await logout(request.user.userId, refreshToken)
      } catch {
        // Expired access token is fine on logout — still clear the cookie
      }
    }
    reply.clearCookie('refreshToken', { path: '/' })
    return success({ message: 'Logged out successfully' })
  })

  // POST /auth/refresh — derives user identity from the refresh token record, never from body
  app.post('/refresh', async (request: FastifyRequest, reply: FastifyReply) => {
    const refreshToken = request.cookies.refreshToken
    if (!refreshToken) throw new UnauthorizedError('No refresh token provided')

    const result = await refreshAccessToken(refreshToken)
    const accessToken = await reply.jwtSign(
      getAccessTokenPayload(result.user.id, result.user.email, result.user.role)
    )
    reply.setCookie('refreshToken', result.tokens.refreshToken, REFRESH_COOKIE_OPTS(isProduction))
    return success({ accessToken })
  })

  // POST /auth/forgot-password
  app.post('/forgot-password', async (request: FastifyRequest) => {
    const { email } = forgotPasswordSchema.parse(request.body)
    await requestPasswordReset(email)
    return success({ message: 'If an account exists, a password reset email has been sent' })
  })

  // POST /auth/reset-password
  app.post('/reset-password', async (request: FastifyRequest) => {
    const { token, password } = resetPasswordSchema.parse(request.body)
    await resetPassword(token, password)
    return success({ message: 'Password has been reset successfully' })
  })

  // POST /auth/verify-email
  app.post('/verify-email', async (request: FastifyRequest) => {
    const { token } = verifyEmailSchema.parse(request.body)
    await verifyEmail(token)
    return success({ message: 'Email verified successfully' })
  })

  // GET /auth/send-request - current user's previously submitted requests
  app.get(
    '/send-request',
    { preHandler: authDecorators.requireAuth },
    async (request: FastifyRequest) => {
      const requests = await listMyRoleUpgradeRequests(request.user.userId)
      return success(requests)
    }
  )

  // POST /auth/send-request (role upgrade)
  app.post(
    '/send-request',
    { preHandler: authDecorators.requireAuth },
    async (request: FastifyRequest) => {
      const data = roleUpgradeRequestSchema.parse(request.body)
      const result = await requestRoleUpgrade(request.user.userId, data)
      return success({ message: 'Role upgrade request submitted successfully', ...result })
    }
  )
}
