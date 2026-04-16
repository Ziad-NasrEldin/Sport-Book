import { z } from 'zod'

export const updateCoachProfileSchema = z.object({
  bio: z.string().optional(),
  experience: z.coerce.number().optional(),
  certifications: z.string().optional(), // JSON string
  specialties: z.string().optional(), // JSON string
  sessionRate: z.coerce.number().optional(),
})

export const createCoachServiceSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  duration: z.coerce.number().min(15), // minutes
  price: z.coerce.number().min(0),
  currency: z.string().default('EGP'),
})

export const updateCoachServiceSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  duration: z.coerce.number().min(15).optional(),
  price: z.coerce.number().min(0).optional(),
  isActive: z.boolean().optional(),
})

export const setAvailabilitySchema = z.object({
  dayOfWeek: z.coerce.number().min(0).max(6),
  startHour: z.coerce.number().min(0).max(23),
  endHour: z.coerce.number().min(1).max(24),
  isAvailable: z.boolean(),
})

export const setAvailabilityExceptionSchema = z.object({
  date: z.string(), // YYYY-MM-DD
  isAvailable: z.boolean(),
})

export type UpdateCoachProfileInput = z.infer<typeof updateCoachProfileSchema>
export type CreateCoachServiceInput = z.infer<typeof createCoachServiceSchema>
export type UpdateCoachServiceInput = z.infer<typeof updateCoachServiceSchema>
export type SetAvailabilityInput = z.infer<typeof setAvailabilitySchema>
export type SetAvailabilityExceptionInput = z.infer<typeof setAvailabilityExceptionSchema>
