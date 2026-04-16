import { z } from 'zod'

export const listCoachesSchema = z.object({
  page: z.coerce.number().default(1),
  limit: z.coerce.number().min(1).max(50).default(20),
  sportId: z.string().optional(),
  city: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
  minRate: z.coerce.number().optional(),
  maxRate: z.coerce.number().optional(),
})

export const getCoachAvailabilitySchema = z.object({
  date: z.string().optional(),
})

export type ListCoachesInput = z.infer<typeof listCoachesSchema>
export type GetCoachAvailabilityInput = z.infer<typeof getCoachAvailabilitySchema>
