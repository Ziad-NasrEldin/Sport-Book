import { z } from 'zod'

export const createBookingSchema = z.object({
  type: z.enum(['COURT', 'COACH']),
  courtId: z.string().optional(),
  coachId: z.string().optional(),
  coachServiceId: z.string().optional(),
  date: z.string(), // YYYY-MM-DD
  startHour: z.coerce.number().min(0).max(23),
  endHour: z.coerce.number().min(1).max(24),
  playerCount: z.coerce.number().min(1).default(1),
  couponCode: z.string().optional(),
})

export const cancelBookingSchema = z.object({
  reason: z.string().optional(),
})

export const rescheduleBookingSchema = z.object({
  newDate: z.string(), // YYYY-MM-DD
  newStartHour: z.coerce.number().min(0).max(23),
  newEndHour: z.coerce.number().min(1).max(24),
})

export type CreateBookingInput = z.infer<typeof createBookingSchema>
export type CancelBookingInput = z.infer<typeof cancelBookingSchema>
export type RescheduleBookingInput = z.infer<typeof rescheduleBookingSchema>
