import { z } from 'zod'

export const createReviewSchema = z.object({
  targetType: z.enum(['FACILITY', 'COURT', 'COACH']),
  facilityId: z.string().optional(),
  courtId: z.string().optional(),
  coachId: z.string().optional(),
  bookingId: z.string(),
  rating: z.coerce.number().min(1).max(5),
  comment: z.string().optional(),
})

export const updateReviewSchema = z.object({
  rating: z.coerce.number().min(1).max(5).optional(),
  comment: z.string().optional(),
})

export const moderateReviewSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
  reason: z.string().optional(),
})

export type CreateReviewInput = z.infer<typeof createReviewSchema>
export type UpdateReviewInput = z.infer<typeof updateReviewSchema>
export type ModerateReviewInput = z.infer<typeof moderateReviewSchema>
