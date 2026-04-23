import { config } from 'dotenv'
import { PrismaClient as PostgresClient } from '../generated/postgres-client'
import { PrismaClient as SqliteClient } from '../generated/sqlite-client'

config()

const SOURCE_DATABASE_URL = process.env.SOURCE_DATABASE_URL ?? 'file:./dev.db'
const TARGET_DATABASE_URL = process.env.DATABASE_URL ?? ''
const BATCH_SIZE = Number(process.env.MIGRATION_BATCH_SIZE ?? 500)

const INSERT_ORDER = [
  'User',
  'Sport',
  'Coupon',
  'CmsContent',
  'SocialAccount',
  'RefreshToken',
  'UserPreference',
  'Wallet',
  'Facility',
  'FacilitySport',
  'Branch',
  'Court',
  'CourtPricingRule',
  'CourtClosure',
  'Coach',
  'CoachSessionType',
  'CoachService',
  'CoachAvailability',
  'CoachAvailabilityException',
  'Booking',
  'PaymentIntent',
  'TeamPost',
  'TeamPostMember',
  'TeamPostJoinRequest',
  'StoreProduct',
  'StoreOrder',
  'StoreOrderItem',
  'WalletTransaction',
  'Notification',
  'Review',
  'RoleUpgradeRequest',
  'Favorite',
  'AuditLog',
] as const

type ModelName = (typeof INSERT_ORDER)[number]

function delegateName(model: string): string {
  return model.charAt(0).toLowerCase() + model.slice(1)
}

function getDelegate(client: any, model: string): any {
  return client[delegateName(model)]
}

function assertEnv(): void {
  if (!TARGET_DATABASE_URL.startsWith('postgresql://') && !TARGET_DATABASE_URL.startsWith('postgres://')) {
    throw new Error('DATABASE_URL must be PostgreSQL URL before running migration.')
  }

  if (!SOURCE_DATABASE_URL.startsWith('file:')) {
    throw new Error('SOURCE_DATABASE_URL must point to SQLite file URL, ex: file:./dev.db')
  }
}

async function truncateTarget(postgres: PostgresClient): Promise<void> {
  const tableList = INSERT_ORDER.map((table) => `"${table}"`).join(', ')
  await postgres.$executeRawUnsafe(`TRUNCATE TABLE ${tableList} CASCADE;`)
}

async function migrateTable(sqlite: SqliteClient, postgres: PostgresClient, model: ModelName): Promise<void> {
  const sourceDelegate = getDelegate(sqlite, model)
  const targetDelegate = getDelegate(postgres, model)
  const total = await sourceDelegate.count()

  if (total === 0) {
    console.log(`[${model}] source empty`)
    return
  }

  let skip = 0
  while (skip < total) {
    const rows = await sourceDelegate.findMany({
      skip,
      take: BATCH_SIZE,
      orderBy: { id: 'asc' },
    })

    if (!rows.length) break

    await targetDelegate.createMany({
      data: rows,
      skipDuplicates: false,
    })

    skip += rows.length
    console.log(`[${model}] copied ${skip}/${total}`)
  }
}

async function verifyCounts(sqlite: SqliteClient, postgres: PostgresClient): Promise<void> {
  const failures: string[] = []

  for (const model of INSERT_ORDER) {
    const sourceCount = await getDelegate(sqlite, model).count()
    const targetCount = await getDelegate(postgres, model).count()
    console.log(`[${model}] source=${sourceCount} target=${targetCount}`)

    if (sourceCount !== targetCount) {
      failures.push(`${model}: ${sourceCount} != ${targetCount}`)
    }
  }

  if (failures.length > 0) {
    throw new Error(`Count verification failed:\n${failures.join('\n')}`)
  }
}

async function main(): Promise<void> {
  assertEnv()

  const sqlite = new SqliteClient({
    datasources: {
      db: { url: SOURCE_DATABASE_URL },
    },
  })

  const postgres = new PostgresClient({
    datasources: {
      db: { url: TARGET_DATABASE_URL },
    },
  })

  try {
    await sqlite.$connect()
    await postgres.$connect()

    console.log(`source=${SOURCE_DATABASE_URL}`)
    console.log(`target=${TARGET_DATABASE_URL}`)

    await truncateTarget(postgres)

    for (const model of INSERT_ORDER) {
      await migrateTable(sqlite, postgres, model)
    }

    await verifyCounts(sqlite, postgres)
    console.log('SQLite to PostgreSQL migration completed.')
  } finally {
    await sqlite.$disconnect()
    await postgres.$disconnect()
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
