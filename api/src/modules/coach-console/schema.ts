import { z } from 'zod'

export const coachProfileUpdateSchema = z.object({
  displayName: z.string().min(2).optional(),
  headline: z.string().max(120).optional(),
  bio: z.string().max(1000).optional(),
  city: z.string().max(120).optional(),
  avatar: z.string().url().optional(),
  isPublicProfileVisible: z.boolean().optional(),
  languages: z.array(z.string()).optional(),
  certifications: z.array(z.string()).optional(),
  specialties: z.array(z.string()).optional(),
})

export const coachSettingsUpdateSchema = z.object({
  payoutCycle: z.enum(['weekly', 'biweekly', 'monthly']),
  notifications: z.record(z.boolean()),
  policies: z.record(z.boolean()),
})

export const coachSessionTypeCreateSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  minParticipants: z.coerce.number().min(1),
  maxParticipants: z.coerce.number().min(1),
  durationOptions: z.array(z.coerce.number().min(15)),
  baseRate: z.coerce.number().min(0),
  multiplier: z.coerce.number().min(0.1),
  visibility: z.string().default('Public'),
  status: z.enum(['ACTIVE', 'PAUSED', 'DRAFT']).default('ACTIVE'),
})

export const coachSessionTypeUpdateSchema = coachSessionTypeCreateSchema.partial()

export const coachServiceCreateSchema = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
  duration: z.coerce.number().min(15),
  price: z.coerce.number().min(0),
  sport: z.string().optional(),
  sessionTypeId: z.string().nullable().optional(),
  status: z.enum(['ACTIVE', 'PAUSED', 'DRAFT']).default('ACTIVE'),
})

export const coachServiceUpdateSchema = coachServiceCreateSchema.partial()

export const coachAvailabilityCreateSchema = z.object({
  day: z.enum(['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']),
  start: z.string().regex(/^\d{2}:\d{2}$/),
  end: z.string().regex(/^\d{2}:\d{2}$/),
  venue: z.string().default('SportBook Club - Main Arena'),
  mode: z.enum(['ACTIVE', 'PAUSED']).default('ACTIVE'),
})

export const coachAvailabilityUpdateSchema = coachAvailabilityCreateSchema.partial()

export const coachAvailabilityExceptionCreateSchema = z.object({
  date: z.string(),
  reason: z.string().optional(),
  impact: z.string().default('Unavailable all day'),
  isAvailable: z.boolean().default(false),
})

export const coachAvailabilityExceptionUpdateSchema = coachAvailabilityExceptionCreateSchema.partial()

export type CoachProfileUpdateInput = z.infer<typeof coachProfileUpdateSchema>
export type CoachSettingsUpdateInput = z.infer<typeof coachSettingsUpdateSchema>
export type CoachSessionTypeCreateInput = z.infer<typeof coachSessionTypeCreateSchema>
export type CoachSessionTypeUpdateInput = z.infer<typeof coachSessionTypeUpdateSchema>
export type CoachServiceCreateInput = z.infer<typeof coachServiceCreateSchema>
export type CoachServiceUpdateInput = z.infer<typeof coachServiceUpdateSchema>
export type CoachAvailabilityCreateInput = z.infer<typeof coachAvailabilityCreateSchema>
export type CoachAvailabilityUpdateInput = z.infer<typeof coachAvailabilityUpdateSchema>
export type CoachAvailabilityExceptionCreateInput = z.infer<typeof coachAvailabilityExceptionCreateSchema>
export type CoachAvailabilityExceptionUpdateInput = z.infer<typeof coachAvailabilityExceptionUpdateSchema>
