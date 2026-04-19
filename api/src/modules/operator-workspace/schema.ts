import { z } from 'zod'

export const updateFacilitySchema = z.object({
  name: z.string().optional(),
  logo: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  phone: z.string().optional(),
  description: z.string().optional(),
  status: z.string().optional(),
})

export const createCourtSchema = z.object({
  branchId: z.string(),
  sportId: z.string(),
  name: z.string(),
  basePrice: z.coerce.number().min(0),
  description: z.string().optional(),
  images: z.string().optional(),
})

export const updateCourtSchema = z.object({
  name: z.string().optional(),
  basePrice: z.coerce.number().min(0).optional(),
  description: z.string().optional(),
  images: z.string().optional(),
  status: z.string().optional(),
})

export const createCourtPricingRuleSchema = z.object({
  courtId: z.string(),
  dayOfWeek: z.coerce.number().min(0).max(6).optional(),
  startHour: z.coerce.number().min(0).max(23),
  endHour: z.coerce.number().min(1).max(24),
  price: z.coerce.number().min(0),
  isPeak: z.coerce.boolean().default(false),
})

export const createCourtClosureSchema = z.object({
  courtId: z.string(),
  date: z.string(),
  allDay: z.coerce.boolean().default(false),
  startHour: z.coerce.number().min(0).max(23).optional(),
  endHour: z.coerce.number().min(1).max(24).optional(),
})

export const createBranchSchema = z.object({
  name: z.string().min(1),
  address: z.string().min(1),
  city: z.string().min(1),
  phone: z.string().optional(),
})

export const updateBranchSchema = z.object({
  name: z.string().min(1).optional(),
  address: z.string().min(1).optional(),
  city: z.string().min(1).optional(),
  phone: z.string().optional(),
})

export const inviteStaffSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  role: z.enum(['OPERATOR', 'COACH', 'PLAYER']),
})

export const approvalActionSchema = z.object({
  status: z.enum(['CONFIRMED', 'CANCELLED']),
  note: z.string().optional(),
})

export type UpdateFacilityInput = z.infer<typeof updateFacilitySchema>
export type CreateCourtInput = z.infer<typeof createCourtSchema>
export type UpdateCourtInput = z.infer<typeof updateCourtSchema>
export type CreateCourtPricingRuleInput = z.infer<typeof createCourtPricingRuleSchema>
export type CreateCourtClosureInput = z.infer<typeof createCourtClosureSchema>
export type CreateBranchInput = z.infer<typeof createBranchSchema>
export type UpdateBranchInput = z.infer<typeof updateBranchSchema>
export type InviteStaffInput = z.infer<typeof inviteStaffSchema>
export type ApprovalActionInput = z.infer<typeof approvalActionSchema>
