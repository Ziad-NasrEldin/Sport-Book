import { z } from 'zod'

export const createTeamPostSchema = z.object({
  courtId: z.string(),
  date: z.string(), // YYYY-MM-DD
  startHour: z.coerce.number().min(0).max(23),
  endHour: z.coerce.number().min(1).max(24),
  neededPlayers: z.coerce.number().min(1),
  description: z.string().optional(),
})

export const joinTeamPostSchema = z.object({
  teamPostId: z.string(),
})

export const respondToJoinRequestSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
})

export type CreateTeamPostInput = z.infer<typeof createTeamPostSchema>
export type JoinTeamPostInput = z.infer<typeof joinTeamPostSchema>
export type RespondToJoinRequestInput = z.infer<typeof respondToJoinRequestSchema>
