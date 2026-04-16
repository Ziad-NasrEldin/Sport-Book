import { z } from 'zod'

export const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
  avatar: z.string().optional(),
})

export const updatePreferencesSchema = z.object({
  language: z.string().optional(),
  currency: z.string().optional(),
  timezone: z.string().optional(),
  rtl: z.boolean().optional(),
  emailNotifications: z.boolean().optional(),
  pushNotifications: z.boolean().optional(),
  smsNotifications: z.boolean().optional(),
  profileVisible: z.boolean().optional(),
  showActivityStatus: z.boolean().optional(),
})

export const addFavoriteSchema = z.object({
  targetType: z.enum(['COURT', 'COACH', 'FACILITY', 'PRODUCT']),
  courtId: z.string().optional(),
  coachId: z.string().optional(),
  facilityId: z.string().optional(),
  productId: z.string().optional(),
})

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
export type UpdatePreferencesInput = z.infer<typeof updatePreferencesSchema>
export type AddFavoriteInput = z.infer<typeof addFavoriteSchema>
