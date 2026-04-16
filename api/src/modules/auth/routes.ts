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
  getAccessTokenPayload,
} from './service'
import { UnauthorizedError } from '@common/errors'
import { success } from '@common/response'

export async function authRoutes(app: FastifyInstance) {
  // POST /auth/register
  app.post('/register', async (request: FastifyRequest, reply: FastifyReply) => {
    const data = registerSchema.parse(request.body)
    const result = await register(data)

    // Sign access token
    const accessToken = await reply.jwtSign(getAccessTokenPayload(result.user.id, result.user.email, result.user.role))

    // Set refresh token as cookie
    reply.setCookie('refreshToken', result.tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    })

    return success({
      user: result.user,
      accessToken,
    })
  })

  // POST /auth/login
  app.post('/login', async (request: FastifyRequest, reply: FastifyReply) => {
    const data = loginSchema.parse(request.body)
    const result = await login(data)

    // Sign access token
    const accessToken = await reply.jwtSign(getAccessTokenPayload(result.user.id, result.user.email, result.user.role))

    // Set refresh token as cookie
    reply.setCookie('refreshToken', result.tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })

    return success({
      user: result.user,
      accessToken,
    })
  })

  // POST /auth/logout
  app.post('/logout', async (request: FastifyRequest, reply: FastifyReply) => {
    const refreshToken = request.cookies.refreshToken

    if (request.user && refreshToken) {
      await logout(request.user.userId, refreshToken)
    }

    reply.clearCookie('refreshToken', { path: '/' })

    return success({ message: 'Logged out successfully' })
  })

  // POST /auth/refresh
  app.post('/refresh', async (request: FastifyRequest, reply: FastifyReply) => {
    const refreshToken = request.cookies.refreshToken

    if (!refreshToken) {
      throw new UnauthorizedError('No refresh token provided')
    }

    const tokens = await refreshAccessToken(refreshToken)

    // Sign new access token
    // We need to decode the new refresh token to get user info
    // For now, we'll use the request body if provided
    const userId = (request.body as { userId?: string })?.userId
    const email = (request.body as { email?: string })?.email
    const role = (request.body as { role?: string })?.role

    if (!userId || !email || !role) {
      throw new UnauthorizedError('Invalid refresh token')
    }

    const accessToken = await reply.jwtSign(getAccessTokenPayload(userId, email, role))

    reply.setCookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })

    return success({ accessToken })
  })

  // POST /auth/forgot-password
  app.post('/forgot-password', async (request: FastifyRequest) => {
    const data = forgotPasswordSchema.parse(request.body)
    await requestPasswordReset(data.email)
    return success({ message: 'If an account exists, a password reset email has been sent' })
  })

  // POST /auth/reset-password
  app.post('/reset-password', async (request: FastifyRequest) => {
    const data = resetPasswordSchema.parse(request.body)
    await resetPassword(data.token, data.password)
    return success({ message: 'Password has been reset successfully' })
  })

  // POST /auth/verify-email
  app.post('/verify-email', async (request: FastifyRequest) => {
    const data = verifyEmailSchema.parse(request.body)
    // TODO: Implement email verification
    return success({ message: 'Email verified successfully' })
  })

  // POST /auth/send-request (role upgrade request)
  app.post('/send-request', { preHandler: async (request: FastifyRequest) => { await request.jwtVerify() } }, async (request: FastifyRequest) => {
    const data = roleUpgradeRequestSchema.parse(request.body)

    if (!request.user) {
      throw new UnauthorizedError()
    }

    await requestRoleUpgrade(request.user.userId, data)
    return success({ message: 'Role upgrade request submitted successfully' })
  })
}
