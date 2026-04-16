import { z } from 'zod'

export const getSportSchema = z.object({
  id: z.string(),
})

export type GetSportInput = z.infer<typeof getSportSchema>
