import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ConflictError, UnauthorizedError, BadRequestError } from '@common/errors'

// ── Prisma mock ────────────────────────────────────────────────────────────────
vi.mock('@lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    refreshToken: {
      findUnique: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
    },
    socialAccount: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
    },
    roleUpgradeRequest: {
      findFirst: vi.fn(),
      create: vi.fn(),
    },
  },
}))

// ── Crypto mock — deterministic tokens ────────────────────────────────────────
vi.mock('@lib/crypto', () => ({
  hashPassword: vi.fn().mockResolvedValue('hashed_password'),
  verifyPassword: vi.fn(),
  generateRefreshToken: vi.fn().mockReturnValue('mock_refresh_token'),
  generateVerificationToken: vi.fn().mockReturnValue('mock_verify_token'),
  generatePasswordResetToken: vi.fn().mockReturnValue('mock_reset_token'),
}))

vi.mock('@lib/firebaseAdmin', () => ({
  verifyFirebaseSocialIdToken: vi.fn(),
}))

import { prisma } from '@lib/prisma'
import { verifyPassword } from '@lib/crypto'
import { verifyFirebaseSocialIdToken } from '@lib/firebaseAdmin'
import {
  register,
  login,
  loginWithSocialToken,
  logout,
  refreshAccessToken,
  requestPasswordReset,
  resetPassword,
  requestRoleUpgrade,
} from '../service'

const mockUser = {
  id: 'user_1',
  email: 'test@example.com',
  password: 'hashed_password',
  name: 'Test User',
  phone: null,
  avatar: null,
  role: 'PLAYER',
  status: 'ACTIVE',
  emailVerified: false,
  emailVerificationToken: null,
  passwordResetToken: null,
  passwordResetTokenExpiry: null,
  createdAt: new Date(),
  updatedAt: new Date(),
}

beforeEach(() => {
  vi.clearAllMocks()
})

// ── register ──────────────────────────────────────────────────────────────────
describe('register', () => {
  it('creates a user and returns tokens', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null)
    vi.mocked(prisma.user.create).mockResolvedValue(mockUser as any)
    vi.mocked(prisma.refreshToken.create).mockResolvedValue({} as any)

    const result = await register({ email: 'test@example.com', password: 'password123', name: 'Test User' })

    expect(result.user.email).toBe('test@example.com')
    expect(result.user.role).toBe('PLAYER')
    expect(result.tokens.refreshToken).toBe('mock_refresh_token')
    expect(prisma.user.create).toHaveBeenCalledOnce()
  })

  it('throws ConflictError if email already registered', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any)

    await expect(
      register({ email: 'test@example.com', password: 'password123', name: 'Test User' })
    ).rejects.toThrow(ConflictError)
  })
})

// ── login ─────────────────────────────────────────────────────────────────────
describe('login', () => {
  it('returns user and tokens on valid credentials', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any)
    vi.mocked(verifyPassword).mockResolvedValue(true)
    vi.mocked(prisma.refreshToken.create).mockResolvedValue({} as any)

    const result = await login({ email: 'test@example.com', password: 'password123' })

    expect(result.user.id).toBe('user_1')
    expect(result.tokens.refreshToken).toBe('mock_refresh_token')
  })

  it('throws UnauthorizedError for unknown email', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null)

    await expect(
      login({ email: 'nobody@example.com', password: 'password123' })
    ).rejects.toThrow(UnauthorizedError)
  })

  it('throws UnauthorizedError for wrong password', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any)
    vi.mocked(verifyPassword).mockResolvedValue(false)

    await expect(
      login({ email: 'test@example.com', password: 'wrongpassword' })
    ).rejects.toThrow(UnauthorizedError)
  })

  it('throws UnauthorizedError for suspended account', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ ...mockUser, status: 'SUSPENDED' } as any)
    vi.mocked(verifyPassword).mockResolvedValue(true)

    await expect(
      login({ email: 'test@example.com', password: 'password123' })
    ).rejects.toThrow(UnauthorizedError)
  })
})

describe('loginWithSocialToken', () => {
  it('creates a user, links social account, and returns tokens', async () => {
    vi.mocked(verifyFirebaseSocialIdToken).mockResolvedValue({
      uid: 'firebase_uid_1',
      email: 'Social@Example.com',
      emailVerified: true,
      name: 'Social User',
      picture: 'https://example.com/avatar.png',
    })
    vi.mocked(prisma.socialAccount.findUnique).mockResolvedValue(null)
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null)
    vi.mocked(prisma.user.create).mockResolvedValue({
      ...mockUser,
      email: 'social@example.com',
      name: 'Social User',
      emailVerified: true,
    } as any)
    vi.mocked(prisma.socialAccount.upsert).mockResolvedValue({} as any)
    vi.mocked(prisma.refreshToken.create).mockResolvedValue({} as any)

    const result = await loginWithSocialToken({ provider: 'google', idToken: 'firebase_token' })

    expect(verifyFirebaseSocialIdToken).toHaveBeenCalledWith('google', 'firebase_token')
    expect(prisma.socialAccount.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({
          provider: 'GOOGLE',
          providerUserId: 'firebase_uid_1',
          email: 'social@example.com',
        }),
      })
    )
    expect(result.user.email).toBe('social@example.com')
    expect(result.tokens.refreshToken).toBe('mock_refresh_token')
  })

  it('uses linked user when social account already exists', async () => {
    vi.mocked(verifyFirebaseSocialIdToken).mockResolvedValue({
      uid: 'firebase_uid_1',
      email: 'social@example.com',
      emailVerified: true,
      name: 'Social User',
      picture: null,
    })
    vi.mocked(prisma.socialAccount.findUnique).mockResolvedValue({ user: mockUser } as any)
    vi.mocked(prisma.refreshToken.create).mockResolvedValue({} as any)

    const result = await loginWithSocialToken({ provider: 'google', idToken: 'firebase_token' })

    expect(result.user.id).toBe('user_1')
    expect(prisma.user.create).not.toHaveBeenCalled()
    expect(prisma.socialAccount.upsert).not.toHaveBeenCalled()
  })

  it('throws BadRequestError when Firebase identity has no email', async () => {
    vi.mocked(verifyFirebaseSocialIdToken).mockResolvedValue({
      uid: 'firebase_uid_1',
      email: null,
      emailVerified: false,
      name: null,
      picture: null,
    })

    await expect(
      loginWithSocialToken({ provider: 'facebook', idToken: 'firebase_token' })
    ).rejects.toThrow(BadRequestError)
  })
})

// ── logout ────────────────────────────────────────────────────────────────────
describe('logout', () => {
  it('deletes the specific refresh token', async () => {
    vi.mocked(prisma.refreshToken.deleteMany).mockResolvedValue({ count: 1 })

    await logout('user_1', 'some_token')

    expect(prisma.refreshToken.deleteMany).toHaveBeenCalledWith({
      where: { token: 'some_token', userId: 'user_1' },
    })
  })
})

// ── refreshAccessToken ────────────────────────────────────────────────────────
describe('refreshAccessToken', () => {
  it('rotates the refresh token and returns user info', async () => {
    const futureDate = new Date(Date.now() + 86400000)
    vi.mocked(prisma.refreshToken.findUnique).mockResolvedValue({
      id: 'rt_1',
      token: 'old_token',
      userId: 'user_1',
      expiresAt: futureDate,
      revokedAt: null,
      createdAt: new Date(),
      user: mockUser,
    } as any)
    vi.mocked(prisma.refreshToken.delete).mockResolvedValue({} as any)
    vi.mocked(prisma.refreshToken.create).mockResolvedValue({} as any)

    const result = await refreshAccessToken('old_token')

    expect(result.user.id).toBe('user_1')
    expect(result.tokens.refreshToken).toBe('mock_refresh_token')
    expect(prisma.refreshToken.delete).toHaveBeenCalledWith({ where: { id: 'rt_1' } })
  })

  it('throws UnauthorizedError for expired token', async () => {
    vi.mocked(prisma.refreshToken.findUnique).mockResolvedValue({
      id: 'rt_1',
      token: 'old_token',
      userId: 'user_1',
      expiresAt: new Date(Date.now() - 1000), // expired
      revokedAt: null,
      createdAt: new Date(),
      user: mockUser,
    } as any)

    await expect(refreshAccessToken('old_token')).rejects.toThrow(UnauthorizedError)
  })

  it('throws UnauthorizedError for revoked token', async () => {
    vi.mocked(prisma.refreshToken.findUnique).mockResolvedValue({
      id: 'rt_1',
      token: 'old_token',
      userId: 'user_1',
      expiresAt: new Date(Date.now() + 86400000),
      revokedAt: new Date(), // revoked
      createdAt: new Date(),
      user: mockUser,
    } as any)

    await expect(refreshAccessToken('old_token')).rejects.toThrow(UnauthorizedError)
  })

  it('throws UnauthorizedError for unknown token', async () => {
    vi.mocked(prisma.refreshToken.findUnique).mockResolvedValue(null)

    await expect(refreshAccessToken('unknown_token')).rejects.toThrow(UnauthorizedError)
  })
})

// ── requestPasswordReset ──────────────────────────────────────────────────────
describe('requestPasswordReset', () => {
  it('stores reset token for known email', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any)
    vi.mocked(prisma.user.update).mockResolvedValue(mockUser as any)

    await requestPasswordReset('test@example.com')

    expect(prisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'user_1' },
        data: expect.objectContaining({ passwordResetToken: 'mock_reset_token' }),
      })
    )
  })

  it('silently returns for unknown email (no-op, no leak)', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null)

    await expect(requestPasswordReset('unknown@example.com')).resolves.toBeUndefined()
    expect(prisma.user.update).not.toHaveBeenCalled()
  })
})

// ── resetPassword ─────────────────────────────────────────────────────────────
describe('resetPassword', () => {
  it('updates password and clears token for valid token', async () => {
    vi.mocked(prisma.user.findFirst).mockResolvedValue(mockUser as any)
    vi.mocked(prisma.user.update).mockResolvedValue(mockUser as any)
    vi.mocked(prisma.refreshToken.deleteMany).mockResolvedValue({ count: 1 })

    await resetPassword('mock_reset_token', 'newpassword123')

    expect(prisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          passwordResetToken: null,
          passwordResetTokenExpiry: null,
        }),
      })
    )
    expect(prisma.refreshToken.deleteMany).toHaveBeenCalledWith({ where: { userId: 'user_1' } })
  })

  it('throws BadRequestError for invalid or expired token', async () => {
    vi.mocked(prisma.user.findFirst).mockResolvedValue(null)

    await expect(resetPassword('bad_token', 'newpassword123')).rejects.toThrow(BadRequestError)
  })
})

// ── requestRoleUpgrade ────────────────────────────────────────────────────────
describe('requestRoleUpgrade', () => {
  it('creates a role upgrade request', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any)
    vi.mocked(prisma.roleUpgradeRequest.findFirst).mockResolvedValue(null)
    vi.mocked(prisma.roleUpgradeRequest.create).mockResolvedValue({} as any)

    await requestRoleUpgrade('user_1', { requestedRole: 'COACH' })

    expect(prisma.roleUpgradeRequest.create).toHaveBeenCalledOnce()
  })

  it('throws ConflictError if pending request already exists', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any)
    vi.mocked(prisma.roleUpgradeRequest.findFirst).mockResolvedValue({ id: 'r1' } as any)

    await expect(
      requestRoleUpgrade('user_1', { requestedRole: 'COACH' })
    ).rejects.toThrow('pending role upgrade request')
  })
})
