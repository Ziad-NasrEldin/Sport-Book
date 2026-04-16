import { z } from 'zod'

export const createOrderSchema = z.object({
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.coerce.number().min(1),
  })),
  fulfillment: z.enum(['PICKUP', 'DELIVERY']),
  deliveryAddress: z.string().optional(),
  contactPhone: z.string().optional(),
  couponCode: z.string().optional(),
})

export const addToCartSchema = z.object({
  productId: z.string(),
  quantity: z.coerce.number().min(1),
})

export type CreateOrderInput = z.infer<typeof createOrderSchema>
export type AddToCartInput = z.infer<typeof addToCartSchema>
