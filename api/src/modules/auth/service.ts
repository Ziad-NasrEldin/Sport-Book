import { prisma } from '@lib/prisma'
import { env } from '@config/env'
import {
  hashPassword,
  verifyPassword,
  generateRefreshToken,
  generateVerificationToken,
  generatePasswordResetToken,
} from '@lib/crypto'
import { sendEmail, buildPasswordResetUrl } from '@lib/email'
import { verifyFirebaseSocialIdToken } from '@lib/firebaseAdmin'
import { ApiError, ConflictError, UnauthorizedError, NotFoundError, BadRequestError } from '@common/errors'
import type {
  RegisterInput,
  LoginInput,
  SocialLoginInput,
  RoleUpgradeRequestInput,
} from './schema'

const REFRESH_TOKEN_EXPIRY_DAYS = parseInt(env.REFRESH_TOKEN_DAYS)
const PASSWORD_RESET_EXPIRY_MINUTES = 60
const SOCIAL_PROVIDER_TO_DB = {
  google: 'GOOGLE',
  facebook: 'FACEBOOK',
} as const

export interface AuthTokens {
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
  const existingUser = await prisma.user.findUnique({ where: { email: data.email } })

  if (existingUser) {
    throw new ConflictError('Email already registered')
  }

  const passwordHash = await hashPassword(data.password)
  const verificationToken = generateVerificationToken()

  const user = await prisma.user.create({
    data: {
      email: data.email,
      password: passwordHash,
      name: data.name,
      phone: data.phone,
      role: 'PLAYER',
      status: 'ACTIVE',
      emailVerificationToken: verificationToken,
      wallet: { create: { balance: 0, currency: 'EGP' } },
      preferences: {
        create: { language: 'en', currency: 'EGP', timezone: 'Africa/Cairo' },
      },
    },
  })

  const tokens = await createRefreshToken(user.id)
  return { user: toAuthUser(user), tokens: { refreshToken: tokens } }
}

export async function login(data: LoginInput): Promise<{ user: AuthUser; tokens: AuthTokens }> {
  const user = await prisma.user.findUnique({ where: { email: data.email } })

  if (!user || !(await verifyPassword(data.password, user.password))) {
    throw new UnauthorizedError('Invalid email or password')
  }

  if (user.status === 'SUSPENDED') {
    throw new UnauthorizedError('Account has been suspended')
  }

  const refreshToken = await createRefreshToken(user.id)
  return { user: toAuthUser(user), tokens: { refreshToken } }
}

export async function loginWithSocialToken(
  data: SocialLoginInput
): Promise<{ user: AuthUser; tokens: AuthTokens }> {
  const identity = await verifyFirebaseSocialIdToken(data.provider, data.idToken)
  const email = identity.email?.trim().toLowerCase() ?? null

  if (!email) {
    throw new BadRequestError('Social account is missing an email address')
  }

  const provider = SOCIAL_PROVIDER_TO_DB[data.provider]
  const linkedAccount = await prisma.socialAccount.findUnique({
    where: {
      provider_providerUserId: {
        provider,
        providerUserId: identity.uid,
      },
    },
    include: {
      user: true,
    },
  })

  let user = linkedAccount?.user ?? null

  if (!user) {
    user = await prisma.user.findUnique({ where: { email } })

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          password: await hashPassword(generateRefreshToken()),
          name: identity.name?.trim() || email.split('@')[0],
          avatar: identity.picture,
          role: 'PLAYER',
          status: 'ACTIVE',
          emailVerified: identity.emailVerified,
          wallet: { create: { balance: 0, currency: 'EGP' } },
          preferences: {
            create: { language: 'en', currency: 'EGP', timezone: 'Africa/Cairo' },
          },
        },
      })
    } else if (identity.emailVerified && !user.emailVerified) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: true },
      })
    }

    await prisma.socialAccount.upsert({
      where: {
        provider_providerUserId: {
          provider,
          providerUserId: identity.uid,
        },
      },
      update: {
        userId: user.id,
        email,
      },
      create: {
        userId: user.id,
        provider,
        providerUserId: identity.uid,
        email,
      },
    })
  }

  if (user.status === 'SUSPENDED') {
    throw new UnauthorizedError('Account has been suspended')
  }

  const refreshToken = await createRefreshToken(user.id)
  return { user: toAuthUser(user), tokens: { refreshToken } }
}

export async function logout(userId: string, refreshToken: string): Promise<void> {
  await prisma.refreshToken.deleteMany({ where: { token: refreshToken, userId } })
}

export async function logoutAll(userId: string): Promise<void> {
  await prisma.refreshToken.deleteMany({ where: { userId } })
}

export async function refreshAccessToken(
  refreshToken: string
): Promise<{ user: AuthUser; tokens: AuthTokens }> {
  const tokenRecord = await prisma.refreshToken.findUnique({
    where: { token: refreshToken },
    include: { user: true },
  })

  if (!tokenRecord || tokenRecord.revokedAt || tokenRecord.expiresAt < new Date()) {
    throw new UnauthorizedError('Invalid or expired refresh token')
  }

  await prisma.refreshToken.delete({ where: { id: tokenRecord.id } })

  const newRefreshToken = await createRefreshToken(tokenRecord.user.id)
  return { user: toAuthUser(tokenRecord.user), tokens: { refreshToken: newRefreshToken } }
}

export async function requestPasswordReset(email: string): Promise<void> {
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return

  const token = generatePasswordResetToken()
  const expiry = new Date(Date.now() + PASSWORD_RESET_EXPIRY_MINUTES * 60 * 1000)

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordResetToken: token, passwordResetTokenExpiry: expiry },
  })

  const resetUrl = buildPasswordResetUrl(token)
  await sendEmail({
    to: email,
    subject: 'Password Reset Request',
    html: `<p>Click <a href="${resetUrl}">here</a> to reset your password. This link expires in ${PASSWORD_RESET_EXPIRY_MINUTES} minutes.</p>`,
    text: `Reset your password: ${resetUrl}`,
  })
}

export async function resetPassword(token: string, newPassword: string): Promise<void> {
  const user = await prisma.user.findFirst({
    where: {
      passwordResetToken: token,
      passwordResetTokenExpiry: { gt: new Date() },
    },
  })

  if (!user) {
    throw new BadRequestError('Invalid or expired password reset token')
  }

  const passwordHash = await hashPassword(newPassword)

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: passwordHash,
      passwordResetToken: null,
      passwordResetTokenExpiry: null,
    },
  })

  // Revoke all active sessions after password change
  await logoutAll(user.id)
}

export async function requestRoleUpgrade(
  userId: string,
  data: RoleUpgradeRequestInput
): Promise<{ id: string }> {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) throw new NotFoundError('User')

  const existing = await prisma.roleUpgradeRequest.findFirst({
    where: { userId, status: 'PENDING' },
  })
  if (existing) throw new ConflictError('You already have a pending role upgrade request')

  const details = {
    fullName: data.fullName,
    email: data.email,
    phone: data.phone,
    city: data.city,
    specialization: data.specialization,
    certifications: data.certifications,
    requestMessage: data.requestMessage,
  }

  const request = await prisma.roleUpgradeRequest.create({
    data: {
      userId,
      requestedRole: data.requestedRole,
      sportId: data.sportId,
      experienceYears: data.experienceYears,
      bio: data.bio ?? data.requestMessage,
      businessName: data.businessName ?? data.facilityName,
      businessAddress: data.businessAddress ?? data.facilityAddress,
      licenseNumber: data.licenseNumber ?? data.registrationNumber,
      documents: JSON.stringify({
        files: data.documents ?? [],
        details,
      }),
      notes: JSON.stringify(details),
    },
  })

  return { id: request.id }
}

export async function verifyEmail(token: string): Promise<void> {
  const user = await prisma.user.findFirst({
    where: {
      emailVerificationToken: token,
    },
  })

  if (!user) {
    throw new BadRequestError('Invalid verification token')
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerified: true,
      emailVerificationToken: null,
    },
  })
}

type RoleUpgradeListItem = {
  id: string
  requestedRole: 'coach' | 'facility'
  fullName: string
  email: string
  phone: string
  city: string
  specialization?: string
  experienceYears?: number
  certifications?: string
  facilityName?: string
  registrationNumber?: string
  facilityAddress?: string
  requestMessage: string
  status: 'pending' | 'approved' | 'rejected' | 'needs-info'
  submittedAt: string
  reviewedAt?: string
}

export async function listMyRoleUpgradeRequests(userId: string): Promise<RoleUpgradeListItem[]> {
  const requests = await prisma.roleUpgradeRequest.findMany({
    where: { userId },
    orderBy: { submittedAt: 'desc' },
    include: {
      user: {
        select: {
          name: true,
          email: true,
          phone: true,
        },
      },
    },
  })

  return requests.map((request) => {
    const parsedNotes = safeParseJson<Record<string, string | undefined>>(request.notes)
    const parsedDocuments = safeParseJson<{
      files?: string[]
      details?: Record<string, string | undefined>
    }>(request.documents)
    const details = parsedDocuments?.details ?? {}

    return {
      id: request.id,
      requestedRole: request.requestedRole === 'COACH' ? 'coach' : 'facility',
      fullName: details.fullName ?? parsedNotes?.fullName ?? request.user.name,
      email: details.email ?? parsedNotes?.email ?? request.user.email,
      phone: details.phone ?? parsedNotes?.phone ?? request.user.phone ?? '',
      city: details.city ?? parsedNotes?.city ?? 'Egypt',
      specialization: details.specialization ?? parsedNotes?.specialization,
      experienceYears: request.experienceYears ?? undefined,
      certifications: details.certifications ?? parsedNotes?.certifications,
      facilityName: request.businessName ?? undefined,
      registrationNumber: request.licenseNumber ?? undefined,
      facilityAddress: request.businessAddress ?? undefined,
      requestMessage: details.requestMessage ?? parsedNotes?.requestMessage ?? request.bio ?? '',
      status: mapRoleUpgradeStatus(request.status),
      submittedAt: request.submittedAt.toISOString(),
      reviewedAt: request.reviewedAt?.toISOString(),
    }
  })
}

export function getAccessTokenPayload(userId: string, email: string, role: string) {
  return { userId, email, role }
}

// ─── private helpers ──────────────────────────────────────────────────────────

function toAuthUser(user: { id: string; email: string; name: string; role: string; status: string; emailVerified: boolean }): AuthUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    status: user.status,
    emailVerified: user.emailVerified,
  }
}

async function createRefreshToken(userId: string): Promise<string> {
  const token = generateRefreshToken()
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS)

  await prisma.refreshToken.create({ data: { userId, token, expiresAt } })
  return token
}

function safeParseJson<T>(value: string | null | undefined): T | null {
  if (!value) return null

  try {
    return JSON.parse(value) as T
  } catch {
    return null
  }
}

function mapRoleUpgradeStatus(status: string): RoleUpgradeListItem['status'] {
  if (status === 'APPROVED') return 'approved'
  if (status === 'REJECTED') return 'rejected'
  if (status === 'NEEDS_INFO') return 'needs-info'
  return 'pending'
}
