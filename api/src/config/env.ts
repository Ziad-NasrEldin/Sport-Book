import { config } from 'dotenv'
import { z } from 'zod'

config()

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3001'),
  HOST: z.string().default('0.0.0.0'),
  DATABASE_URL: z.string(),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('15m'),
  REFRESH_TOKEN_DAYS: z.string().default('7'),
  WEB_ORIGIN: z.string().default('http://localhost:3000'),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  PAYMOB_API_KEY: z.string().optional(),
  PAYMOB_INTEGRATION_ID: z.string().optional(),
  PAYMOB_HMAC_SECRET: z.string().optional(),
  FIREBASE_PROJECT_ID: z.string().optional(),
  FIREBASE_CLIENT_EMAIL: z.string().optional(),
  FIREBASE_PRIVATE_KEY: z.string().optional(),
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.format())
  process.exit(1)
}

export const env = parsed.data
