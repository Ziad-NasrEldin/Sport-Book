import bcrypt from 'bcrypt'
import crypto from 'crypto'

const SALT_ROUNDS = 12
const REFRESH_TOKEN_BYTES = 64
const VERIFICATION_TOKEN_BYTES = 32

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export function generateRefreshToken(): string {
  return crypto.randomBytes(REFRESH_TOKEN_BYTES).toString('hex')
}

export function generateVerificationToken(): string {
  return crypto.randomBytes(VERIFICATION_TOKEN_BYTES).toString('hex')
}

export function generatePasswordResetToken(): string {
  return crypto.randomBytes(VERIFICATION_TOKEN_BYTES).toString('hex')
}
