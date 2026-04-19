import { prisma } from '@lib/prisma'
import { NotFoundError, ConflictError, BadRequestError } from '@common/errors'
import type { CreateBookingInput, CancelBookingInput, RescheduleBookingInput } from './schema'

export async function calculatePrice(
  type: 'COURT' | 'COACH',
  courtId: string | undefined,
  coachId: string | undefined,
  coachServiceId: string | undefined,
  date: Date,
  startHour: number,
  endHour: number,
  couponCode?: string
) {
  let basePrice = 0
  let duration = endHour - startHour

  if (type === 'COURT' && courtId) {
    const court = await prisma.court.findUnique({
      where: { id: courtId },
      include: { pricingRules: true },
    })

    if (!court) {
      throw new NotFoundError('Court')
    }

    const dayOfWeek = date.getDay()

    // Find pricing rule for this time slot
    const pricingRule = court.pricingRules.find(
      r => (r.dayOfWeek === null || r.dayOfWeek === dayOfWeek) &&
           startHour >= r.startHour && endHour <= r.endHour
    )

    basePrice = pricingRule ? pricingRule.price.toNumber() : court.basePrice.toNumber()
  } else if (type === 'COACH' && coachId && coachServiceId) {
    const coachService = await prisma.coachService.findUnique({
      where: { id: coachServiceId },
      include: { coach: true },
    })

    if (!coachService || coachService.coachId !== coachId) {
      throw new NotFoundError('Coach service')
    }

    basePrice = coachService.price.toNumber()
    duration = 1
  } else {
    throw new BadRequestError('Invalid booking parameters')
  }

  let totalPrice = basePrice * duration
  let discount = 0

  // Apply coupon if provided
  if (couponCode) {
    const coupon = await prisma.coupon.findUnique({
      where: { code: couponCode },
    })

    if (coupon && coupon.status === 'ACTIVE' && new Date() >= coupon.startDate && new Date() <= coupon.endDate) {
      if (coupon.usageCount < (coupon.usageLimit ?? Infinity)) {
        if (coupon.type === 'PERCENTAGE') {
          discount = (totalPrice * coupon.value.toNumber()) / 100
          if (coupon.maxDiscount && discount > coupon.maxDiscount.toNumber()) {
            discount = coupon.maxDiscount.toNumber()
          }
        } else {
          discount = coupon.value.toNumber()
        }
        if (coupon.minOrderValue && totalPrice < coupon.minOrderValue.toNumber()) {
          discount = 0
        }
      }
    }
  }

  totalPrice = totalPrice - discount

  return {
    basePrice,
    duration,
    discount,
    totalPrice,
    currency: 'EGP',
  }
}

export async function checkAvailability(
  type: 'COURT' | 'COACH',
  courtId: string | undefined,
  coachId: string | undefined,
  date: Date,
  startHour: number,
  endHour: number
) {
  const dateStart = new Date(date)
  dateStart.setHours(startHour, 0, 0, 0)
  const dateEnd = new Date(date)
  dateEnd.setHours(endHour, 0, 0, 0)

  if (type === 'COURT' && courtId) {
    // Check court closures
    const closure = await prisma.courtClosure.findFirst({
      where: {
        courtId,
        date: {
          gte: new Date(date.toDateString()),
          lt: new Date(new Date(date).setDate(date.getDate() + 1)),
        },
      },
    })

    if (closure) {
      if (closure.allDay) {
        return false
      }
      if (closure.startHour !== null && closure.endHour !== null) {
        if (startHour < closure.endHour && endHour > closure.startHour) {
          return false
        }
      }
    }

    // Check existing bookings
    const conflict = await prisma.booking.findFirst({
      where: {
        courtId,
        date: {
          gte: dateStart,
          lt: dateEnd,
        },
        status: { in: ['PENDING', 'CONFIRMED'] },
      },
    })

    return !conflict
  } else if (type === 'COACH' && coachId) {
    const regularWindow = await prisma.coachAvailability.findFirst({
      where: {
        coachId,
        dayOfWeek: date.getDay(),
        startHour: { lte: startHour },
        endHour: { gte: endHour },
      },
    })

    if (!regularWindow) {
      return false
    }

    // Check coach availability exceptions
    const exception = await prisma.coachAvailabilityException.findFirst({
      where: {
        coachId,
        date: {
          gte: new Date(date.toDateString()),
          lt: new Date(new Date(date).setDate(date.getDate() + 1)),
        },
      },
    })

    if (exception && !exception.isAvailable) {
      return false
    }

    // Check existing bookings
    const conflict = await prisma.booking.findFirst({
      where: {
        coachId,
        date: {
          gte: dateStart,
          lt: dateEnd,
        },
        status: { in: ['PENDING', 'CONFIRMED'] },
      },
    })

    return !conflict
  }

  return false
}

export async function createBooking(userId: string, data: CreateBookingInput) {
  const { type, courtId, coachId, coachServiceId, date, startHour, endHour, playerCount, couponCode } = data

  if (type === 'COURT' && !courtId) {
    throw new BadRequestError('courtId is required for COURT bookings')
  }

  if (type === 'COACH' && (!coachId || !coachServiceId)) {
    throw new BadRequestError('coachId and coachServiceId are required for COACH bookings')
  }

  const bookingDate = new Date(date)

  // Check availability
  const isAvailable = await checkAvailability(type, courtId, coachId, bookingDate, startHour, endHour)
  if (!isAvailable) {
    throw new ConflictError('Slot is not available')
  }

  // Calculate price
  const pricing = await calculatePrice(type, courtId, coachId, coachServiceId, bookingDate, startHour, endHour, couponCode)

  // Create booking
  const booking = await prisma.booking.create({
    data: {
      userId,
      type,
      courtId,
      coachId,
      coachServiceId,
      date: bookingDate,
      startHour,
      endHour,
      duration: pricing.duration,
      playerCount,
      basePrice: pricing.basePrice,
      discount: pricing.discount,
      totalPrice: pricing.totalPrice,
      currency: pricing.currency,
      status: 'PENDING',
      paymentStatus: 'PENDING',
    },
    include: {
      court: {
        include: {
          sport: true,
          branch: true,
        },
      },
      coach: {
        include: {
          user: true,
          sport: true,
        },
      },
      coachService: true,
    },
  })

  // Apply coupon if used
  if (couponCode && pricing.discount > 0) {
    await prisma.coupon.update({
      where: { code: couponCode },
      data: { usageCount: { increment: 1 } },
    })
  }

  return booking
}

export async function cancelBooking(userId: string, bookingId: string, data: CancelBookingInput) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
  })

  if (!booking) {
    throw new NotFoundError('Booking')
  }

  if (booking.userId !== userId) {
    throw new BadRequestError('You can only cancel your own bookings')
  }

  if (booking.status === 'CANCELLED' || booking.status === 'COMPLETED') {
    throw new BadRequestError('Cannot cancel this booking')
  }

  const updated = await prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: 'CANCELLED',
      cancelledAt: new Date(),
      cancellationReason: data.reason,
    },
  })

  return updated
}

export async function rescheduleBooking(userId: string, bookingId: string, data: RescheduleBookingInput) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
  })

  if (!booking) {
    throw new NotFoundError('Booking')
  }

  if (booking.userId !== userId) {
    throw new BadRequestError('You can only reschedule your own bookings')
  }

  if (booking.status === 'CANCELLED' || booking.status === 'COMPLETED') {
    throw new BadRequestError('Cannot reschedule this booking')
  }

  const newDate = new Date(data.newDate)

  // Check availability for new slot
  const isAvailable = await checkAvailability(
    booking.type as 'COURT' | 'COACH',
    booking.courtId || undefined,
    booking.coachId || undefined,
    newDate,
    data.newStartHour,
    data.newEndHour
  )

  if (!isAvailable) {
    throw new ConflictError('New slot is not available')
  }

  // Recalculate price for new slot
  const pricing = await calculatePrice(
    booking.type as 'COURT' | 'COACH',
    booking.courtId || undefined,
    booking.coachId || undefined,
    booking.coachServiceId || undefined,
    newDate,
    data.newStartHour,
    data.newEndHour
  )

  const updated = await prisma.booking.update({
    where: { id: bookingId },
    data: {
      date: newDate,
      startHour: data.newStartHour,
      endHour: data.newEndHour,
      duration: pricing.duration,
      basePrice: pricing.basePrice,
      totalPrice: pricing.totalPrice,
    },
  })

  return updated
}

export async function getBooking(userId: string, bookingId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      court: {
        include: {
          sport: true,
          branch: {
            include: {
              facility: true,
            },
          },
        },
      },
      coach: {
        include: {
          user: true,
          sport: true,
        },
      },
      coachService: true,
    },
  })

  if (!booking) {
    throw new NotFoundError('Booking')
  }

  if (booking.userId !== userId) {
    throw new BadRequestError('You can only view your own bookings')
  }

  return booking
}

export async function listBookings(userId: string, filters: { status?: string; type?: string; page?: number; limit?: number }) {
  const { status, type, page = 1, limit = 20 } = filters

  const where: { userId: string; status?: string; type?: string } = { userId }
  if (status) where.status = status
  if (type) where.type = type

  const [bookings, total] = await Promise.all([
    prisma.booking.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        court: {
          include: {
            sport: true,
            branch: true,
          },
        },
        coach: {
          include: {
            user: true,
            sport: true,
          },
        },
        coachService: true,
      },
    }),
    prisma.booking.count({ where }),
  ])

  return {
    data: bookings,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  }
}
