import type { FastifyInstance, FastifyRequest } from 'fastify'
import { z } from 'zod'
import {
  listProducts,
  getProduct,
  createOrder,
  listOrders,
  getOrder,
  listCoupons,
} from './service'
import { createOrderSchema } from './schema'
import { success } from '@common/response'

export async function storeRoutes(app: FastifyInstance) {
  // Public routes
  // GET /store/products - List products
  app.get('/products', async (request: FastifyRequest) => {
    const facilityId = (request.query as { facilityId?: string }).facilityId
    const category = (request.query as { category?: string }).category
    const status = (request.query as { status?: string }).status
    const page = z.coerce.number().default(1).parse((request.query as { page?: string }).page)
    const limit = z.coerce.number().min(1).max(50).default(20).parse((request.query as { limit?: string }).limit)

    const result = await listProducts({ facilityId, category, status, page, limit })
    return success(result)
  })

  // GET /store/products/:id - Get product details
  app.get('/products/:id', async (request: FastifyRequest) => {
    const { id } = request.params as { id: string }
    const product = await getProduct(id)
    return success(product)
  })

  // GET /store/coupons - List active coupons
  app.get('/coupons', async () => {
    const coupons = await listCoupons()
    return success(coupons)
  })

  // Authenticated routes
  const authRoutes = async (request: FastifyRequest, reply: any) => {
    try {
      await request.jwtVerify()
    } catch (err) {
      return reply.status(401).send({
        error: 'Unauthorized - Please log in',
        code: 'UNAUTHORIZED'
      })
    }
  }

  // POST /store/orders - Create order
  app.post('/orders', { preHandler: authRoutes }, async (request: FastifyRequest) => {
    const data = createOrderSchema.parse(request.body)
    const order = await createOrder(request.user!.userId, data)
    return success(order)
  })

  // GET /store/orders - List user's orders
  app.get('/orders', { preHandler: authRoutes }, async (request: FastifyRequest) => {
    const status = (request.query as { status?: string }).status
    const page = z.coerce.number().default(1).parse((request.query as { page?: string }).page)
    const limit = z.coerce.number().min(1).max(50).default(20).parse((request.query as { limit?: string }).limit)

    const result = await listOrders(request.user!.userId, { status, page, limit })
    return success(result)
  })

  // GET /store/orders/:id - Get order details
  app.get('/orders/:id', { preHandler: authRoutes }, async (request: FastifyRequest) => {
    const { id } = request.params as { id: string }
    const order = await getOrder(request.user!.userId, id)
    return success(order)
  })
}
