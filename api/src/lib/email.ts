import { env } from '@config/env'

interface EmailPayload {
  to: string
  subject: string
  html: string
  text?: string
}

export async function sendEmail(payload: EmailPayload): Promise<boolean> {
  if (env.NODE_ENV === 'production') {
    console.log(`[email] PRODUCTION send to=${payload.to} subject="${payload.subject}"`)
    return true
  }

  console.log('─'.repeat(60))
  console.log(`[email] DEV MODE — Email not delivered via SMTP`)
  console.log(`  To:      ${payload.to}`)
  console.log(`  Subject: ${payload.subject}`)
  console.log(`  Body:    ${payload.text ?? payload.html}`)
  console.log('─'.repeat(60))
  return true
}

export function buildPasswordResetUrl(token: string): string {
  return `${env.WEB_ORIGIN}/auth/reset-password?token=${token}`
}