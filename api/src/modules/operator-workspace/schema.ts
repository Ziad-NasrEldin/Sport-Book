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
  images: z.string().optional(), // JSON string
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
  date: z.string(), // YYYY-MM-DD
  allDay: z.coerce.boolean().default(false),
  startHour: z.coerce.number().min(0).max(23).optional(),
  endHour: z.coerce.number().min(1).max(24).optional(),
})

export type UpdateFacilityInput = z.infer<typeof updateFacilitySchema>
export type CreateCourtInput = z.infer<typeof createCourtSchema>
export type UpdateCourtInput = z.infer<typeof updateCourtSchema>
export type CreateCourtPricingRuleInput = z.infer<typeof createCourtPricingRuleSchema>
export type CreateCourtClosureInput = z.infer<typeof createCourtClosureSchema>
