import { z } from 'zod'

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().optional(),
})

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export const socialLoginSchema = z.object({
  provider: z.enum(['google', 'facebook']),
  idToken: z.string().min(1, 'idToken is required'),
})

export const refreshTokenSchema = z.object({
  refreshToken: z.string().optional(),
})

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
})

export const resetPasswordSchema = z.object({
  token: z.string(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export const verifyEmailSchema = z.object({
  token: z.string(),
})

export const roleUpgradeRequestSchema = z.object({
  requestedRole: z.enum(['COACH', 'OPERATOR', 'FACILITY']).transform((value) =>
    value === 'FACILITY' ? 'OPERATOR' : value
  ),
  fullName: z.string().min(2).optional(),
  email: z.string().email().optional(),
  phone: z.string().min(3).optional(),
  city: z.string().min(2).optional(),
  specialization: z.string().min(2).optional(),
  certifications: z.string().optional(),
  requestMessage: z.string().min(10).optional(),
  // For coaches
  sportId: z.string().optional(),
  experienceYears: z.number().min(0).optional(),
  bio: z.string().optional(),
  // For operators
  facilityName: z.string().optional(),
  registrationNumber: z.string().optional(),
  facilityAddress: z.string().optional(),
  businessName: z.string().optional(),
  businessAddress: z.string().optional(),
  licenseNumber: z.string().optional(),
  documents: z.array(z.string()).optional(),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type SocialLoginInput = z.infer<typeof socialLoginSchema>
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>
export type RoleUpgradeRequestInput = z.infer<typeof roleUpgradeRequestSchema>
