import { prisma } from '@lib/prisma'
import { env } from '@config/env'
import { NotFoundError, BadRequestError, ConflictError } from '@common/errors'
import type { CreatePaymentIntentInput, ProcessPaymentInput, WalletPaymentInput } from './schema'

export async function createPaymentIntent(userId: string, data: CreatePaymentIntentInput) {
  const { bookingId, paymentMethod } = data

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      user: true,
    },
  })

  if (!booking) {
    throw new NotFoundError('Booking')
  }

  if (booking.userId !== userId) {
    throw new BadRequestError('You can only pay for your own bookings')
  }

  if (booking.paymentStatus === 'PAID') {
    throw new ConflictError('Booking is already paid')
  }

  if (paymentMethod === 'WALLET') {
    const wallet = await prisma.wallet.findUnique({
      where: { userId },
    })

    if (!wallet || wallet.balance < booking.totalPrice) {
      throw new BadRequestError('Insufficient wallet balance')
    }
  }

  // Create payment intent record
  const paymentIntent = await prisma.$transaction(async (tx: any) => {
    const intent = await tx.paymentIntent.create({
      data: {
        userId,
        bookingId,
        amount: booking.totalPrice,
        currency: booking.currency,
        paymentMethod,
        status: 'PENDING',
      },
    })

    return intent
  })

  // If Paymob, return payment URL
  if (paymentMethod.startsWith('PAYMOB')) {
    const paymentUrl = await createPaymobPayment(paymentIntent.id, booking.totalPrice.toNumber(), booking.currency, booking.user.email)
    return {
      paymentIntent,
      paymentUrl,
    }
  }

  return { paymentIntent }
}

async function createPaymobPayment(intentId: string, amount: number, currency: string, userEmail: string) {
  // Paymob integration placeholder
  // In production, this would call Paymob API to create a payment
  const paymobApiKey = env.PAYMOB_API_KEY
  const paymobIntegrationId = env.PAYMOB_INTEGRATION_ID

  // For now, return a mock URL
  return `https://paymob.mock/checkout/${intentId}?amount=${amount}&currency=${currency}`
}

export async function processPayment(userId: string, data: ProcessPaymentInput) {
  const { paymentIntentId, paymentRef } = data

  const paymentIntent = await prisma.paymentIntent.findUnique({
    where: { id: paymentIntentId },
    include: {
      booking: true,
    },
  })

  if (!paymentIntent) {
    throw new NotFoundError('Payment intent')
  }

  if (paymentIntent.userId !== userId) {
    throw new BadRequestError('Unauthorized')
  }

  if (paymentIntent.status === 'COMPLETED') {
    throw new ConflictError('Payment already processed')
  }

  // Verify payment with Paymob (placeholder)
  const paymentVerified = true // In production, verify with Paymob API

  if (!paymentVerified) {
    throw new BadRequestError('Payment verification failed')
  }

  // Update payment intent and booking
  const result = await prisma.$transaction(async (tx) => {
    await tx.paymentIntent.update({
      where: { id: paymentIntentId },
      data: {
        status: 'COMPLETED',
        paymentRef,
      },
    })

    if (!paymentIntent.bookingId) {
      return paymentIntent
    }

    const updatedBooking = await tx.booking.update({
      where: { id: paymentIntent.bookingId },
      data: {
        paymentStatus: 'PAID',
        paymentMethod: paymentIntent.paymentMethod,
        paymentRef,
        status: 'CONFIRMED',
      },
    })

    return updatedBooking
  })

  return result
}

export async function processWalletPayment(userId: string, data: WalletPaymentInput) {
  const { bookingId } = data

  const [booking, wallet] = await Promise.all([
    prisma.booking.findUnique({
      where: { id: bookingId },
    }),
    prisma.wallet.findUnique({
      where: { userId },
    }),
  ])

  if (!booking) {
    throw new NotFoundError('Booking')
  }

  if (!wallet) {
    throw new NotFoundError('Wallet')
  }

  if (booking.userId !== userId) {
    throw new BadRequestError('You can only pay for your own bookings')
  }

  if (booking.paymentStatus === 'PAID') {
    throw new ConflictError('Booking is already paid')
  }

  if (wallet.balance < booking.totalPrice) {
    throw new BadRequestError('Insufficient wallet balance')
  }

  const result = await prisma.$transaction(async (tx) => {
    // Deduct from wallet
    await tx.wallet.update({
      where: { id: wallet.id },
      data: {
        balance: {
          decrement: booking.totalPrice,
        },
      },
    })

    // Create wallet transaction
    await tx.walletTransaction.create({
      data: {
        walletId: wallet.id,
        type: 'DEBIT',
        amount: booking.totalPrice,
        currency: booking.currency,
        description: `Booking payment: ${bookingId}`,
        referenceType: 'BOOKING',
        referenceId: bookingId,
        status: 'COMPLETED',
      },
    })

    // Update booking
    const updatedBooking = await tx.booking.update({
      where: { id: bookingId },
      data: {
        paymentStatus: 'PAID',
        paymentMethod: 'WALLET',
        status: 'CONFIRMED',
      },
    })

    return updatedBooking
  })

  return result
}

export async function getPaymentStatus(userId: string, paymentIntentId: string) {
  const paymentIntent = await prisma.paymentIntent.findUnique({
    where: { id: paymentIntentId },
    include: {
      booking: true,
    },
  })

  if (!paymentIntent) {
    throw new NotFoundError('Payment intent')
  }

  if (paymentIntent.userId !== userId) {
    throw new BadRequestError('Unauthorized')
  }

  return paymentIntent
}
