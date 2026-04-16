import type { FastifyInstance, FastifyRequest } from 'fastify'
import { prisma } from '@lib/prisma'

export enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  VERIFY = 'VERIFY',
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
}

export enum AuditSeverity {
  INFO = 'INFO',
  WARNING = 'WARNING',
  CRITICAL = 'CRITICAL',
}

interface AuditLogInput {
  actorId?: string
  action: AuditAction
  object: string
  details?: Record<string, unknown>
  severity?: AuditSeverity
  ip?: string
}

export async function logAudit(input: AuditLogInput) {
  await prisma.auditLog.create({
    data: {
      actorId: input.actorId,
      action: input.action,
      object: input.object,
      details: input.details ? JSON.stringify(input.details) : '{}',
      severity: input.severity ?? AuditSeverity.INFO,
      ip: input.ip,
    },
  })
}

export async function registerAudit(app: FastifyInstance) {
  app.decorate('audit', logAudit)
}

declare module 'fastify' {
  interface FastifyInstance {
    audit: typeof logAudit
  }
}

export function auditMiddleware(action: AuditAction, object: string, severity?: AuditSeverity) {
  return async (request: FastifyRequest) => {
    await logAudit({
      actorId: request.user?.userId,
      action,
      object,
      severity,
      ip: request.ip,
    })
  }
}
