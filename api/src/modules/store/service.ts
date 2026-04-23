import { prisma } from '@lib/prisma'
import { NotFoundError, BadRequestError } from '@common/errors'
import type { CreateOrderInput } from './schema'

function safeParseJson<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback

  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

function mapProduct(product: {
  id: string
  facilityId: string
  name: string
  description: string | null
  category: string
  images: string
  price: any
  currency: string
  quantity: number
  status: string
  createdAt: Date
  updatedAt: Date
  facility?: { name: string; city: string; address?: string | null } | null
}) {
  const images = safeParseJson<string[]>(product.images, [])

  return {
    ...product,
    title: product.name,
    image: images[0] ?? '',
    images,
    price: Number(product.price),
    location: product.facility?.city ?? '',
    facilityName: product.facility?.name ?? '',
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
  }
}

export async function listProducts(filters: {
  facilityId?: string
  category?: string
  status?: string
  page?: number
  limit?: number
}) {
  const { facilityId, category, status, page = 1, limit = 20 } = filters

  const where: any = {}

  if (facilityId) where.facilityId = facilityId
  if (category) where.category = category
  if (status) where.status = status

  const [products, total] = await Promise.all([
    prisma.storeProduct.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        facility: {
          select: {
            name: true,
            city: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.storeProduct.count({ where }),
  ])

  return {
    data: products.map(mapProduct),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  }
}

export async function getProduct(productId: string) {
  const product = await prisma.storeProduct.findUnique({
    where: { id: productId },
    include: {
      facility: {
        select: {
          name: true,
          city: true,
          address: true,
        },
      },
    },
  })

  if (!product) {
    throw new NotFoundError('Product')
  }

  return {
    ...mapProduct(product),
  }
}

export async function createOrder(userId: string, data: CreateOrderInput) {
  const { items, fulfillment, deliveryAddress, contactPhone, couponCode } = data

  if (fulfillment === 'DELIVERY' && (!deliveryAddress || !contactPhone)) {
    throw new BadRequestError('deliveryAddress and contactPhone are required for delivery')
  }

  // Validate products and calculate total
  let subtotal = 0
  const orderItems: Array<{
    productId: string
    quantity: number
    unitPrice: number
    totalPrice: number
  }> = []

  for (const item of items) {
    const product = await prisma.storeProduct.findUnique({
      where: { id: item.productId },
    })

    if (!product) {
      throw new NotFoundError(`Product ${item.productId}`)
    }

    if (product.status !== 'IN_STOCK') {
      throw new BadRequestError(`Product ${product.name} is not available`)
    }

    if (product.quantity < item.quantity) {
      throw new BadRequestError(`Insufficient stock for ${product.name}`)
    }

    const itemTotal = Number(product.price) * item.quantity
    subtotal += itemTotal

    orderItems.push({
      productId: item.productId,
      quantity: item.quantity,
      unitPrice: product.price.toNumber(),
      totalPrice: itemTotal,
    })
  }

  let discount = 0

  // Apply coupon if provided
  if (couponCode) {
    const coupon = await prisma.coupon.findUnique({
      where: { code: couponCode },
    })

    if (coupon && coupon.status === 'ACTIVE' && new Date() >= coupon.startDate && new Date() <= coupon.endDate) {
      if (coupon.usageCount < (coupon.usageLimit ?? Infinity)) {
        if (coupon.type === 'PERCENTAGE') {
          discount = (subtotal * coupon.value.toNumber()) / 100
          if (coupon.maxDiscount && discount > coupon.maxDiscount.toNumber()) {
            discount = coupon.maxDiscount.toNumber()
          }
        } else {
          discount = coupon.value.toNumber()
        }

        if (coupon.minOrderValue && subtotal < coupon.minOrderValue.toNumber()) {
          discount = 0
        }
      }
    }
  }

  const deliveryFee = fulfillment === 'DELIVERY' ? 50 : 0
  const total = subtotal - discount + deliveryFee

  // Create order
  const order = await prisma.$transaction(async (tx: any) => {
    const newOrder = await tx.storeOrder.create({
      data: {
        userId,
        subtotal,
        discount,
        deliveryFee,
        total,
        fulfillment,
        deliveryAddress,
        contactPhone,
        paymentStatus: 'PENDING',
        status: 'PENDING',
        items: {
          create: orderItems,
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    })

    // Update product quantities
    for (const item of items) {
      await tx.storeProduct.update({
        where: { id: item.productId },
        data: {
          quantity: {
            decrement: item.quantity,
          },
          status: {
            set: 'IN_STOCK',
          },
        },
      })
    }

    // Update coupon usage if used
    if (couponCode && discount > 0) {
      await tx.coupon.update({
        where: { code: couponCode },
        data: { usageCount: { increment: 1 } },
      })
    }

    return newOrder
  })

  return order
}

export async function listOrders(userId: string, filters: {
  status?: string
  page?: number
  limit?: number
}) {
  const { status, page = 1, limit = 20 } = filters

  const where: any = { userId }
  if (status) where.status = status

  const [orders, total] = await Promise.all([
    prisma.storeOrder.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.storeOrder.count({ where }),
  ])

  return {
    data: orders,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  }
}

export async function getOrder(userId: string, orderId: string) {
  const order = await prisma.storeOrder.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  })

  if (!order) {
    throw new NotFoundError('Order')
  }

  if (order.userId !== userId) {
    throw new BadRequestError('You can only view your own orders')
  }

  return order
}

export async function listCoupons() {
  const coupons = await prisma.coupon.findMany({
    where: {
      status: 'ACTIVE',
      startDate: { lte: new Date() },
      endDate: { gte: new Date() },
    },
    orderBy: { createdAt: 'desc' },
  })

  return coupons
}
