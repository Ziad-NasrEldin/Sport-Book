import path from 'node:path'
import { PrismaClient as SqlitePrismaClient } from '@prisma/client'
import { env } from '@config/env'

const isPostgresUrl = /^postgres(?:ql)?:\/\//i.test(env.DATABASE_URL ?? '')

const PrismaClientCtor: typeof SqlitePrismaClient = (() => {
  if (!isPostgresUrl) return SqlitePrismaClient

  try {
    const postgresClientPath = path.join(process.cwd(), 'generated', 'postgres-client')
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const postgresClientModule = require(postgresClientPath) as { PrismaClient: typeof SqlitePrismaClient }
    return postgresClientModule.PrismaClient
  } catch (error) {
    console.error('Failed loading generated postgres Prisma client. Falling back to default client.', error)
    return SqlitePrismaClient
  }
})()

const globalForPrisma = globalThis as unknown as {
  prisma: SqlitePrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClientCtor({
    log: env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
