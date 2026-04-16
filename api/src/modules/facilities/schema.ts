import { z } from 'zod'

export const listFacilitiesSchema = z.object({
  page: z.coerce.number().default(1),
  limit: z.coerce.number().min(1).max(50).default(20),
  city: z.string().optional(),
  sportId: z.string().optional(),
  status: z.string().optional(),
})

export type ListFacilitiesInput = z.infer<typeof listFacilitiesSchema>
