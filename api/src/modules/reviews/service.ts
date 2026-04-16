import { prisma } from '@lib/prisma'
import { NotFoundError, BadRequestError, ConflictError, ForbiddenError } from '@common/errors'
import type { CreateReviewInput, UpdateReviewInput, ModerateReviewInput } from './schema'

export async function createReview(userId: string, data: CreateReviewInput) {
  const { targetType, facilityId, courtId, coachId, bookingId, rating, comment } = data

  // Validate target is provided
  if (targetType === 'FACILITY' && !facilityId) {
    throw new BadRequestError('facilityId is required for FACILITY reviews')
  }
  if (targetType === 'COURT' && !courtId) {
    throw new BadRequestError('courtId is required for COURT reviews')
  }
  if (targetType === 'COACH' && !coachId) {
    throw new BadRequestError('coachId is required for COACH reviews')
  }

  // Verify booking exists and belongs to user
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
  })

  if (!booking) {
    throw new NotFoundError('Booking')
  }

  if (booking.userId !== userId) {
    throw new ForbiddenError('You can only review your own bookings')
  }

  if (booking.status !== 'COMPLETED') {
    throw new BadRequestError('You can only review completed bookings')
  }

  // Check if review already exists for this booking
  const existingReview = await prisma.review.findUnique({
    where: { bookingId },
  })

  if (existingReview) {
    throw new ConflictError('Review already exists for this booking')
  }

  // Create review
  const review = await prisma.review.create({
    data: {
      userId,
      targetType,
      facilityId,
      courtId,
      coachId,
      bookingId,
      rating,
      comment,
      status: 'PENDING',
    },
    include: {
      user: {
        select: {
          name: true,
          avatar: true,
        },
      },
    },
  })

  return review
}

export async function getReview(reviewId: string) {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    include: {
      user: {
        select: {
          name: true,
          avatar: true,
        },
      },
    },
  })

  if (!review) {
    throw new NotFoundError('Review')
  }

  return review
}

export async function updateReview(userId: string, reviewId: string, data: UpdateReviewInput) {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
  })

  if (!review) {
    throw new NotFoundError('Review')
  }

  if (review.userId !== userId) {
    throw new ForbiddenError('You can only update your own reviews')
  }

  if (review.status === 'APPROVED') {
    throw new BadRequestError('Cannot update approved reviews')
  }

  const updated = await prisma.review.update({
    where: { id: reviewId },
    data: {
      ...(data.rating !== undefined && { rating: data.rating }),
      ...(data.comment !== undefined && { comment: data.comment }),
    },
    include: {
      user: {
        select: {
          name: true,
          avatar: true,
        },
      },
    },
  })

  return updated
}

export async function deleteReview(userId: string, reviewId: string) {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
  })

  if (!review) {
    throw new NotFoundError('Review')
  }

  if (review.userId !== userId) {
    throw new ForbiddenError('You can only delete your own reviews')
  }

  if (review.status === 'APPROVED') {
    throw new BadRequestError('Cannot delete approved reviews')
  }

  await prisma.review.delete({
    where: { id: reviewId },
  })

  return { message: 'Review deleted' }
}

export async function moderateReview(userId: string, reviewId: string, data: ModerateReviewInput) {
  // Check if user is admin or operator
  const user = await prisma.user.findUnique({
    where: { id: userId },
  })

  if (!user || (user.role !== 'ADMIN' && user.role !== 'OPERATOR')) {
    throw new ForbiddenError('Only admins and operators can moderate reviews')
  }

  const review = await prisma.review.findUnique({
    where: { id: reviewId },
  })

  if (!review) {
    throw new NotFoundError('Review')
  }

  const updated = await prisma.review.update({
    where: { id: reviewId },
    data: {
      status: data.status,
      moderationReason: data.reason,
    },
  })

  return updated
}

export async function listReviews(filters: {
  targetType?: string
  facilityId?: string
  courtId?: string
  coachId?: string
  status?: string
  page?: number
  limit?: number
}) {
  const { targetType, facilityId, courtId, coachId, status, page = 1, limit = 20 } = filters

  const where: any = {}

  if (targetType) where.targetType = targetType
  if (facilityId) where.facilityId = facilityId
  if (courtId) where.courtId = courtId
  if (coachId) where.coachId = coachId
  if (status) where.status = status

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        user: {
          select: {
            name: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.review.count({ where }),
  ])

  return {
    data: reviews,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  }
}

export async function getAverageRating(targetType: string, targetId: string) {
  const where: any = {
    targetType,
    status: 'APPROVED',
  }

  if (targetType === 'FACILITY') where.facilityId = targetId
  if (targetType === 'COURT') where.courtId = targetId
  if (targetType === 'COACH') where.coachId = targetId

  const reviews = await prisma.review.findMany({
    where,
    select: { rating: true },
  })

  if (reviews.length === 0) {
    return { average: 0, count: 0 }
  }

  const sum = reviews.reduce((acc, r) => acc + r.rating, 0)
  const average = sum / reviews.length

  return {
    average: Math.round(average * 10) / 10,
    count: reviews.length,
  }
}
