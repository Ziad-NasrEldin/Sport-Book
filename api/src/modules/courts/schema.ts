import { z } from 'zod'

export const listCourtsSchema = z.object({
  page: z.coerce.number().default(1),
  limit: z.coerce.number().min(1).max(50).default(20),
  sportId: z.string().optional(),
  branchId: z.string().optional(),
  city: z.string().optional(),
  status: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
})

export const getCourtSlotsSchema = z.object({
  date: z.string(),
})

export type ListCourtsInput = z.infer<typeof listCourtsSchema>
export type GetCourtSlotsInput = z.infer<typeof getCourtSlotsSchema>
