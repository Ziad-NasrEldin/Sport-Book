import { z } from 'zod'

export const listUsersSchema = z.object({
  page: z.coerce.number().default(1),
  limit: z.coerce.number().min(1).max(50).default(20),
  role: z.string().optional(),
  status: z.string().optional(),
  search: z.string().optional(),
})

export const updateUserSchema = z.object({
  role: z.string().optional(),
  status: z.string().optional(),
})

export const respondToRoleUpgradeSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
  reason: z.string().optional(),
})

export const listRoleUpgradesSchema = z.object({
  page: z.coerce.number().default(1),
  limit: z.coerce.number().min(1).max(50).default(20),
  status: z.string().optional(),
})

export const listAuditLogsSchema = z.object({
  page: z.coerce.number().default(1),
  limit: z.coerce.number().min(1).max(50).default(20),
  action: z.string().optional(),
  userId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
})

export type ListUsersInput = z.infer<typeof listUsersSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>
export type RespondToRoleUpgradeInput = z.infer<typeof respondToRoleUpgradeSchema>
export type ListRoleUpgradesInput = z.infer<typeof listRoleUpgradesSchema>
export type ListAuditLogsInput = z.infer<typeof listAuditLogsSchema>
