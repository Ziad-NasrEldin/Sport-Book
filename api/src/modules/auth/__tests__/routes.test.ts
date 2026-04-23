import { describe, it, expect, vi, beforeAll, afterAll, beforeEach } from 'vitest'
import type { FastifyInstance } from 'fastify'
import { createApp } from '../../../app'

// ── service mock — keeps route tests fast (no real DB) ────────────────────────
vi.mock('../service', () => ({
  register: vi.fn(),
  login: vi.fn(),
  loginWithSocialToken: vi.fn(),
  logout: vi.fn(),
  refreshAccessToken: vi.fn(),
  requestPasswordReset: vi.fn(),
  resetPassword: vi.fn(),
  requestRoleUpgrade: vi.fn(),
  listMyRoleUpgradeRequests: vi.fn(),
  verifyEmail: vi.fn(),
  getAccessTokenPayload: vi.fn((id, email, role) => ({ userId: id, email, role })),
}))

import {
  register,
  login,
  loginWithSocialToken,
  logout,
  refreshAccessToken,
  requestPasswordReset,
  resetPassword,
  requestRoleUpgrade,
  listMyRoleUpgradeRequests,
  verifyEmail,
} from '../service'

const mockUser = { id: 'user_1', email: 'test@example.com', name: 'Test', role: 'PLAYER', status: 'ACTIVE', emailVerified: false }
const mockTokens = { refreshToken: 'rt_token' }

let app: FastifyInstance

beforeAll(async () => {
  app = await createApp()
  await app.ready()
})

afterAll(async () => {
  await app.close()
})

beforeEach(() => {
  vi.clearAllMocks()
})

// ── POST /auth/register ───────────────────────────────────────────────────────
describe('POST /api/v1/auth/register', () => {
  it('returns 200 with accessToken and sets cookie on success', async () => {
    vi.mocked(register).mockResolvedValue({ user: mockUser, tokens: mockTokens })

    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: { email: 'test@example.com', password: 'password123', name: 'Test' },
    })

    expect(res.statusCode).toBe(200)
    const body = res.json()
    expect(body.data.accessToken).toBeDefined()
    expect(body.data.user.email).toBe('test@example.com')
    expect(res.headers['set-cookie']).toMatch(/refreshToken=/)
  })

  it('returns 400 for invalid email', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: { email: 'not-an-email', password: 'password123', name: 'Test' },
    })
    expect(res.statusCode).toBe(400)
  })

  it('returns 400 for short password', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: { email: 'test@example.com', password: '123', name: 'Test' },
    })
    expect(res.statusCode).toBe(400)
  })

  it('returns 409 when service throws ConflictError', async () => {
    const { ConflictError } = await import('@common/errors')
    vi.mocked(register).mockRejectedValue(new ConflictError('Email already registered'))

    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: { email: 'taken@example.com', password: 'password123', name: 'Test' },
    })
    expect(res.statusCode).toBe(409)
  })
})

// ── POST /auth/login ──────────────────────────────────────────────────────────
describe('POST /api/v1/auth/login', () => {
  it('returns 200 with accessToken and sets cookie', async () => {
    vi.mocked(login).mockResolvedValue({ user: mockUser, tokens: mockTokens })

    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      payload: { email: 'test@example.com', password: 'password123' },
    })

    expect(res.statusCode).toBe(200)
    expect(res.json().data.accessToken).toBeDefined()
    expect(res.headers['set-cookie']).toMatch(/refreshToken=/)
  })

  it('returns 401 when service throws UnauthorizedError', async () => {
    const { UnauthorizedError } = await import('@common/errors')
    vi.mocked(login).mockRejectedValue(new UnauthorizedError('Invalid email or password'))

    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      payload: { email: 'test@example.com', password: 'wrong' },
    })
    expect(res.statusCode).toBe(401)
  })
})

describe('POST /api/v1/auth/social-login', () => {
  it('returns 200 with accessToken and sets cookie', async () => {
    vi.mocked(loginWithSocialToken).mockResolvedValue({ user: mockUser, tokens: mockTokens })

    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/social-login',
      payload: { provider: 'google', idToken: 'firebase_id_token' },
    })

    expect(res.statusCode).toBe(200)
    expect(loginWithSocialToken).toHaveBeenCalledWith({ provider: 'google', idToken: 'firebase_id_token' })
    expect(res.json().data.accessToken).toBeDefined()
    expect(res.headers['set-cookie']).toMatch(/refreshToken=/)
  })

  it('returns 400 for invalid provider', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/social-login',
      payload: { provider: 'twitter', idToken: 'firebase_id_token' },
    })

    expect(res.statusCode).toBe(400)
  })
})

// ── POST /auth/logout ─────────────────────────────────────────────────────────
describe('POST /api/v1/auth/logout', () => {
  it('returns 200 and clears the cookie', async () => {
    vi.mocked(logout).mockResolvedValue()

    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/logout',
    })

    expect(res.statusCode).toBe(200)
    const setCookie = res.headers['set-cookie'] as string | string[]
    const cookies = Array.isArray(setCookie) ? setCookie : [setCookie ?? '']
    expect(cookies.some((c) => c.includes('refreshToken=;') || c.includes('refreshToken=;') || c.includes('Max-Age=0') || c.includes('Expires='))).toBe(true)
  })
})

// ── POST /auth/refresh ────────────────────────────────────────────────────────
describe('POST /api/v1/auth/refresh', () => {
  it('returns 200 with new accessToken when cookie is valid', async () => {
    vi.mocked(refreshAccessToken).mockResolvedValue({ user: mockUser, tokens: mockTokens })

    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/refresh',
      cookies: { refreshToken: 'valid_rt' },
    })

    expect(res.statusCode).toBe(200)
    expect(res.json().data.accessToken).toBeDefined()
  })

  it('returns 401 when no refresh token cookie', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/refresh',
    })
    expect(res.statusCode).toBe(401)
  })

  it('returns 401 when service rejects the token', async () => {
    const { UnauthorizedError } = await import('@common/errors')
    vi.mocked(refreshAccessToken).mockRejectedValue(new UnauthorizedError('Invalid or expired refresh token'))

    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/refresh',
      cookies: { refreshToken: 'expired_rt' },
    })
    expect(res.statusCode).toBe(401)
  })
})

// ── POST /auth/forgot-password ────────────────────────────────────────────────
describe('POST /api/v1/auth/forgot-password', () => {
  it('returns 200 regardless of whether email exists', async () => {
    vi.mocked(requestPasswordReset).mockResolvedValue()

    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/forgot-password',
      payload: { email: 'anyone@example.com' },
    })
    expect(res.statusCode).toBe(200)
  })

  it('returns 400 for invalid email', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/forgot-password',
      payload: { email: 'not-an-email' },
    })
    expect(res.statusCode).toBe(400)
  })
})

// ── POST /auth/reset-password ─────────────────────────────────────────────────
describe('POST /api/v1/auth/reset-password', () => {
  it('returns 200 on success', async () => {
    vi.mocked(resetPassword).mockResolvedValue()

    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/reset-password',
      payload: { token: 'valid_token', password: 'newpassword123' },
    })
    expect(res.statusCode).toBe(200)
  })

  it('returns 400 when service rejects the token', async () => {
    const { BadRequestError } = await import('@common/errors')
    vi.mocked(resetPassword).mockRejectedValue(new BadRequestError('Invalid or expired password reset token'))

    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/reset-password',
      payload: { token: 'bad_token', password: 'newpassword123' },
    })
    expect(res.statusCode).toBe(400)
  })
})

// ── POST /auth/verify-email ───────────────────────────────────────────────────
describe('POST /api/v1/auth/verify-email', () => {
  it('returns 200 on success', async () => {
    vi.mocked(verifyEmail).mockResolvedValue()

    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/verify-email',
      payload: { token: 'verify_token' },
    })

    expect(res.statusCode).toBe(200)
  })
})

// ── GET /auth/send-request ────────────────────────────────────────────────────
describe('GET /api/v1/auth/send-request', () => {
  it('returns 401 without a Bearer token', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/auth/send-request',
    })

    expect(res.statusCode).toBe(401)
  })

  it('returns the current user requests with a valid token', async () => {
    vi.mocked(listMyRoleUpgradeRequests).mockResolvedValue([
      {
        id: 'req_1',
        requestedRole: 'coach',
        fullName: 'Test User',
        email: 'test@example.com',
        phone: '+201000000000',
        city: 'Cairo',
        requestMessage: 'Please review me.',
        status: 'pending',
        submittedAt: new Date().toISOString(),
      },
    ] as any)
    const token = await app.jwt.sign({ userId: 'user_1', email: 'test@example.com', role: 'PLAYER' })

    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/auth/send-request',
      headers: { authorization: `Bearer ${token}` },
    })

    expect(res.statusCode).toBe(200)
    expect(res.json().data).toHaveLength(1)
  })
})

// ── POST /auth/send-request (RBAC) ────────────────────────────────────────────
describe('POST /api/v1/auth/send-request', () => {
  it('returns 401 without a Bearer token', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/send-request',
      payload: { requestedRole: 'COACH' },
    })
    expect(res.statusCode).toBe(401)
  })

  it('returns 200 with a valid token', async () => {
    vi.mocked(requestRoleUpgrade).mockResolvedValue({ id: 'req_1' })
    const token = await app.jwt.sign({ userId: 'user_1', email: 'test@example.com', role: 'PLAYER' })

    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/send-request',
      headers: { authorization: `Bearer ${token}` },
      payload: { requestedRole: 'COACH' },
    })
    expect(res.statusCode).toBe(200)
    expect(res.json().data).toMatchObject({ id: 'req_1' })
  })
})
