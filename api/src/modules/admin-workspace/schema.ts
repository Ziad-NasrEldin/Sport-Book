import { z } from 'zod'

export const listUsersSchema = z.object({
  page: z.coerce.number().default(1),
  limit: z.coerce.number().min(1).max(50).default(20),
  role: z.string().optional(),
  status: z.string().optional(),
  search: z.string().optional(),
})

export const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  role: z.string().optional(),
  status: z.string().optional(),
  country: z.string().min(2).optional(),
})

export const createFacilitySchema = z.object({
  name: z.string().min(2),
  city: z.string().min(2),
  address: z.string().min(2).optional(),
  description: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  status: z.enum(['PENDING', 'ACTIVE', 'SUSPENDED']).default('PENDING'),
  operatorName: z.string().min(2).optional(),
  operatorEmail: z.string().email().optional(),
  operatorPhone: z.string().optional(),
  branchName: z.string().min(2).optional(),
  branchAddress: z.string().min(2).optional(),
  sportIds: z.array(z.string()).default([]),
})

export const createCoachSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  city: z.string().min(2).optional(),
  bio: z.string().optional(),
  sportId: z.string().min(1),
  experienceYears: z.coerce.number().int().min(0).default(0),
  sessionRate: z.coerce.number().min(0).default(0),
  commissionRate: z.coerce.number().min(0).max(100).default(20),
  status: z.enum(['APPROVED', 'PENDING', 'SUSPENDED']).default('APPROVED'),
  certifications: z.array(z.string()).default([]),
  specialties: z.array(z.string()).default([]),
})

export const createStoreProductSchema = z.object({
  facilityId: z.string().min(1),
  name: z.string().min(2),
  category: z.string().min(2),
  description: z.string().optional(),
  imageUrl: z.string().url().optional(),
  price: z.coerce.number().min(0),
  quantity: z.coerce.number().int().min(0),
  status: z.enum(['IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK']).optional(),
})

export const updateStoreProductSchema = z.object({
  facilityId: z.string().min(1).optional(),
  name: z.string().min(2).optional(),
  category: z.string().min(2).optional(),
  description: z.string().optional(),
  imageUrl: z.string().url().optional(),
  price: z.coerce.number().min(0).optional(),
  quantity: z.coerce.number().int().min(0).optional(),
  status: z.enum(['IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK']).optional(),
})

export const updateStoreOrderStatusSchema = z.object({
  status: z.enum(['PENDING', 'PROCESSING', 'DELIVERED', 'CANCELLED']),
})

export const updateBookingStatusSchema = z.object({
  status: z.string().min(1),
})

export const createSportSchema = z.object({
  name: z.string().min(2),
  displayName: z.string().min(2),
  description: z.string().optional(),
  icon: z.string().optional(),
  active: z.boolean().optional(),
})

export const updateSportSchema = z.object({
  name: z.string().min(2).optional(),
  displayName: z.string().min(2).optional(),
  description: z.string().optional(),
  icon: z.string().optional(),
  active: z.boolean().optional(),
})

export const createCouponSchema = z.object({
  campaignName: z.string().min(2),
  couponCode: z.string().min(3),
  discountKind: z.enum(['Percentage', 'Fixed Amount']),
  discountValue: z.coerce.number().positive(),
  minimumSpend: z.coerce.number().min(0).optional(),
  maxDiscountCap: z.coerce.number().min(0).optional(),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  totalRedemptions: z.coerce.number().int().positive().optional(),
  perUserLimit: z.coerce.number().int().positive().default(1),
  isStackable: z.boolean().optional(),
  firstBookingOnly: z.boolean().optional(),
  newUsersOnly: z.boolean().optional(),
  selectedSports: z.array(z.string()).default([]),
  status: z.enum(['DRAFT', 'ACTIVE']).default('DRAFT'),
})

export const updateVerificationCaseSchema = z.object({
  status: z.enum(['Pending Review', 'Approved', 'Rejected', 'Needs Info']).optional(),
  assignee: z.string().min(1).nullable().optional(),
  adminNote: z.string().optional(),
  riskLevel: z.enum(['Low', 'Medium', 'High']).optional(),
  region: z.string().min(2).optional(),
  checklist: z.array(z.object({
    id: z.string(),
    label: z.string(),
    verified: z.boolean(),
  })).optional(),
  timeline: z.array(z.object({
    id: z.string(),
    message: z.string(),
    at: z.string(),
  })).optional(),
})

export const updateLocalizationDefaultSchema = z.object({
  defaultLocale: z.string().min(2),
})

export const updatePlatformSettingsSchema = z.object({
  commissionRate: z.coerce.number().min(0).max(100),
  approvalMode: z.enum(['manual', 'auto']),
  refundWindow: z.coerce.number().int().min(1).max(72),
  strictKyc: z.boolean(),
  fraudMonitoring: z.boolean(),
})

export const createReportJobSchema = z.object({
  preset: z.string().min(2),
  dateRange: z.string().min(2),
  action: z.enum(['GENERATE', 'SCHEDULE']),
})

export const respondToRoleUpgradeSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
  reason: z.string().optional(),
})

export const listRoleUpgradesSchema = z.object({
  page: z.coerce.number().default(1),
  limit: z.coerce.number().min(1).max(50).default(20),
  status: z.string().optional(),
})

export const listAuditLogsSchema = z.object({
  page: z.coerce.number().default(1),
  limit: z.coerce.number().min(1).max(50).default(20),
  action: z.string().optional(),
  userId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
})

export type ListUsersInput = z.infer<typeof listUsersSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>
export type CreateFacilityInput = z.infer<typeof createFacilitySchema>
export type CreateCoachInput = z.infer<typeof createCoachSchema>
export type CreateStoreProductInput = z.infer<typeof createStoreProductSchema>
export type UpdateStoreProductInput = z.infer<typeof updateStoreProductSchema>
export type UpdateStoreOrderStatusInput = z.infer<typeof updateStoreOrderStatusSchema>
export type UpdateBookingStatusInput = z.infer<typeof updateBookingStatusSchema>
export type CreateSportInput = z.infer<typeof createSportSchema>
export type UpdateSportInput = z.infer<typeof updateSportSchema>
export type CreateCouponInput = z.infer<typeof createCouponSchema>
export type UpdateVerificationCaseInput = z.infer<typeof updateVerificationCaseSchema>
export type UpdateLocalizationDefaultInput = z.infer<typeof updateLocalizationDefaultSchema>
export type UpdatePlatformSettingsInput = z.infer<typeof updatePlatformSettingsSchema>
export type CreateReportJobInput = z.infer<typeof createReportJobSchema>
export type RespondToRoleUpgradeInput = z.infer<typeof respondToRoleUpgradeSchema>
export type ListRoleUpgradesInput = z.infer<typeof listRoleUpgradesSchema>
export type ListAuditLogsInput = z.infer<typeof listAuditLogsSchema>
