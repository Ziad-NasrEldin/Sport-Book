import { z } from 'zod'

export const createPaymentIntentSchema = z.object({
  bookingId: z.string(),
  paymentMethod: z.enum(['WALLET', 'PAYMOB_CARD', 'PAYMOB_MOBILE_WALLET']),
})

export const processPaymentSchema = z.object({
  paymentIntentId: z.string(),
  paymentRef: z.string(),
})

export const walletPaymentSchema = z.object({
  bookingId: z.string(),
})

export type CreatePaymentIntentInput = z.infer<typeof createPaymentIntentSchema>
export type ProcessPaymentInput = z.infer<typeof processPaymentSchema>
export type WalletPaymentInput = z.infer<typeof walletPaymentSchema>
