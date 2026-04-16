// Types: Role = 'PLAYER' | 'COACH' | 'OPERATOR' | 'ADMIN'
//        UserStatus = 'ACTIVE' | 'PENDING' | 'SUSPENDED'
import { prisma } from '@lib/prisma'
import { env } from '@config/env'
import {
  hashPassword,
  verifyPassword,
  generateRefreshToken,
  generateVerificationToken,
} from '@lib/crypto'
import { ApiError, ConflictError, UnauthorizedError, NotFoundError } from '@common/errors'
import type {
  RegisterInput,
  LoginInput,
  RoleUpgradeRequestInput,
} from './schema'

const REFRESH_TOKEN_EXPIRY_DAYS = parseInt(env.REFRESH_TOKEN_DAYS)

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface AuthUser {
  id: string
  email: string
  name: string
  role: string
  status: string
  emailVerified: boolean
}

export async function register(data: RegisterInput): Promise<{ user: AuthUser; tokens: AuthTokens }> {
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  })

  if (existingUser) {
    throw new ConflictError('Email already registered')
  }

  const passwordHash = await hashPassword(data.password)

  const user = await prisma.user.create({
    data: {
      email: data.email,
      password: passwordHash,
      name: data.name,
      phone: data.phone,
      role: 'PLAYER',
      status: 'ACTIVE',
      wallet: {
        create: {
          balance: 0,
          currency: 'EGP',
        },
      },
      preferences: {
        create: {
          language: 'en',
          currency: 'EGP',
          timezone: 'Africa/Cairo',
        },
      },
    },
  })

  const tokens = await generateTokens(user.id, user.email, user.role)

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      status: user.status,
      emailVerified: user.emailVerified,
    },
    tokens,
  }
}

export async function login(data: LoginInput): Promise<{ user: AuthUser; tokens: AuthTokens }> {
  const user = await prisma.user.findUnique({
    where: { email: data.email },
  })

  if (!user) {
    throw new UnauthorizedError('Invalid email or password')
  }

  const isPasswordValid = await verifyPassword(data.password, user.password)

  if (!isPasswordValid) {
    throw new UnauthorizedError('Invalid email or password')
  }

  if (user.status === 'SUSPENDED') {
    throw new UnauthorizedError('Account has been suspended')
  }

  const tokens = await generateTokens(user.id, user.email, user.role)

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      status: user.status,
      emailVerified: user.emailVerified,
    },
    tokens,
  }
}

export async function logout(userId: string, refreshToken: string): Promise<void> {
  await prisma.refreshToken.deleteMany({
    where: {
      token: refreshToken,
      userId,
    },
  })
}

export async function logoutAll(userId: string): Promise<void> {
  await prisma.refreshToken.deleteMany({
    where: { userId },
  })
}

export async function refreshAccessToken(refreshToken: string): Promise<AuthTokens> {
  const tokenRecord = await prisma.refreshToken.findUnique({
    where: { token: refreshToken },
    include: { user: true },
  })

  if (!tokenRecord || tokenRecord.revokedAt || tokenRecord.expiresAt < new Date()) {
    throw new UnauthorizedError('Invalid or expired refresh token')
  }

  // Rotate refresh token
  await prisma.refreshToken.delete({
    where: { id: tokenRecord.id },
  })

  const tokens = await generateTokens(tokenRecord.user.id, tokenRecord.user.email, tokenRecord.user.role as 'PLAYER' | 'COACH' | 'OPERATOR' | 'ADMIN')

  return tokens
}

export async function requestPasswordReset(email: string): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { email },
  })

  if (!user) {
    // Don't reveal if email exists
    return
  }

  const token = generateVerificationToken()

  // Store token in user record (could also use a separate table)
  await prisma.user.update({
    where: { id: user.id },
    data: {
      // In a real implementation, you'd store this in a passwordResetToken field
      // or a separate PasswordResetToken table
    },
  })

  // TODO: Send email with reset link
  console.log(`Password reset token for ${email}: ${token}`)
}

export async function resetPassword(token: string, newPassword: string): Promise<void> {
  // In a real implementation, validate the token and find the user
  // Then update the password
  throw new ApiError('Not implemented', 'NOT_IMPLEMENTED', 501)
}

export async function requestRoleUpgrade(
  userId: string,
  data: RoleUpgradeRequestInput
): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  })

  if (!user) {
    throw new NotFoundError('User')
  }

  // Check for existing pending request
  const existingRequest = await prisma.roleUpgradeRequest.findFirst({
    where: {
      userId,
      status: 'PENDING',
    },
  })

  if (existingRequest) {
    throw new ConflictError('You already have a pending role upgrade request')
  }

  await prisma.roleUpgradeRequest.create({
    data: {
      userId,
      requestedRole: data.requestedRole,
      sportId: data.sportId,
      experienceYears: data.experienceYears,
      bio: data.bio,
      businessName: data.businessName,
      businessAddress: data.businessAddress,
      licenseNumber: data.licenseNumber,
      documents: data.documents ? JSON.stringify(data.documents) : '[]',
    },
  })
}

async function generateTokens(userId: string, email: string, role: string): Promise<AuthTokens> {
  const accessToken = await signAccessToken(userId, email, role)
  const refreshToken = await createRefreshToken(userId)

  return { accessToken, refreshToken }
}

async function signAccessToken(userId: string, email: string, role: string): Promise<string> {
  // This will be called from routes.ts where we have access to the JWT plugin
  // For now, return a placeholder - the actual signing happens in the route
  return ''
}

async function createRefreshToken(userId: string): Promise<string> {
  const token = generateRefreshToken()
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS)

  await prisma.refreshToken.create({
    data: {
      userId,
      token,
      expiresAt,
    },
  })

  return token
}

// This is called from routes to actually sign the JWT
export function getAccessTokenPayload(userId: string, email: string, role: string) {
  return { userId, email, role }
}
