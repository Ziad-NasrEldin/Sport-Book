import type { FastifyInstance, FastifyRequest } from 'fastify'
import { z } from 'zod'
import {
  createPaymentIntent,
  processPayment,
  processWalletPayment,
  getPaymentStatus,
} from './service'
import {
  createPaymentIntentSchema,
  processPaymentSchema,
  walletPaymentSchema,
} from './schema'
import { success } from '@common/response'

export async function paymentRoutes(app: FastifyInstance) {
  // All routes require authentication
  app.addHook('preHandler', async (request: FastifyRequest, reply) => {
    try {
      await request.jwtVerify()
    } catch (err) {
      return reply.status(401).send({
        error: 'Unauthorized - Please log in',
        code: 'UNAUTHORIZED'
      })
    }
  })

  // POST /payments/intent - Create payment intent
  app.post('/intent', async (request: FastifyRequest) => {
    const data = createPaymentIntentSchema.parse(request.body)
    const result = await createPaymentIntent(request.user!.userId, data)
    return success(result)
  })

  // POST /payments/process - Process Paymob payment
  app.post('/process', async (request: FastifyRequest) => {
    const data = processPaymentSchema.parse(request.body)
    const result = await processPayment(request.user!.userId, data)
    return success(result)
  })

  // POST /payments/wallet - Pay with wallet
  app.post('/wallet', async (request: FastifyRequest) => {
    const data = walletPaymentSchema.parse(request.body)
    const result = await processWalletPayment(request.user!.userId, data)
    return success(result)
  })

  // GET /payments/:intentId - Get payment status
  app.get('/:intentId', async (request: FastifyRequest) => {
    const { intentId } = request.params as { intentId: string }
    const result = await getPaymentStatus(request.user!.userId, intentId)
    return success(result)
  })
}
