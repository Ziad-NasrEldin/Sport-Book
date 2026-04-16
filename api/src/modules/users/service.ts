import { prisma } from '@lib/prisma'
import { NotFoundError } from '@common/errors'
import type { UpdateProfileInput, UpdatePreferencesInput, AddFavoriteInput } from './schema'

export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      wallet: {
        select: {
          id: true,
          balance: true,
          currency: true,
        },
      },
      preferences: true,
      coachProfile: {
        select: {
          id: true,
          slug: true,
          bio: true,
          experienceYears: true,
          isActive: true,
          isVerified: true,
        },
      },
      operatorFacility: {
        select: {
          id: true,
          name: true,
          status: true,
        },
      },
    },
  })

  if (!user) {
    throw new NotFoundError('User')
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    phone: user.phone,
    avatar: user.avatar,
    role: user.role,
    status: user.status,
    emailVerified: user.emailVerified,
    createdAt: user.createdAt,
    wallet: user.wallet,
    preferences: user.preferences,
    coachProfile: user.coachProfile,
    operatorFacility: user.operatorFacility,
  }
}

export async function updateProfile(userId: string, data: UpdateProfileInput) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      name: data.name,
      phone: data.phone,
      avatar: data.avatar,
    },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      avatar: true,
      role: true,
      status: true,
      emailVerified: true,
    },
  })

  return user
}

export async function getPreferences(userId: string) {
  const preferences = await prisma.userPreference.findUnique({
    where: { userId },
  })

  if (!preferences) {
    throw new NotFoundError('User preferences')
  }

  return preferences
}

export async function updatePreferences(userId: string, data: UpdatePreferencesInput) {
  const preferences = await prisma.userPreference.upsert({
    where: { userId },
    create: {
      userId,
      language: data.language ?? 'en',
      currency: data.currency ?? 'EGP',
      timezone: data.timezone ?? 'Africa/Cairo',
      rtl: data.rtl ?? false,
      emailNotifications: data.emailNotifications ?? true,
      pushNotifications: data.pushNotifications ?? true,
      smsNotifications: data.smsNotifications ?? false,
      profileVisible: data.profileVisible ?? true,
      showActivityStatus: data.showActivityStatus ?? true,
    },
    update: {
      ...(data.language !== undefined && { language: data.language }),
      ...(data.currency !== undefined && { currency: data.currency }),
      ...(data.timezone !== undefined && { timezone: data.timezone }),
      ...(data.rtl !== undefined && { rtl: data.rtl }),
      ...(data.emailNotifications !== undefined && { emailNotifications: data.emailNotifications }),
      ...(data.pushNotifications !== undefined && { pushNotifications: data.pushNotifications }),
      ...(data.smsNotifications !== undefined && { smsNotifications: data.smsNotifications }),
      ...(data.profileVisible !== undefined && { profileVisible: data.profileVisible }),
      ...(data.showActivityStatus !== undefined && { showActivityStatus: data.showActivityStatus }),
    },
  })

  return preferences
}

export async function getWallet(userId: string) {
  const wallet = await prisma.wallet.findUnique({
    where: { userId },
    select: {
      id: true,
      balance: true,
      currency: true,
      createdAt: true,
      updatedAt: true,
    },
  })

  if (!wallet) {
    throw new NotFoundError('Wallet')
  }

  return wallet
}

export async function getWalletTransactions(userId: string, limit: number = 50) {
  const wallet = await prisma.wallet.findUnique({
    where: { userId },
    include: {
      transactions: {
        orderBy: { createdAt: 'desc' },
        take: limit,
      },
    },
  })

  if (!wallet) {
    throw new NotFoundError('Wallet')
  }

  return wallet.transactions
}

export async function getFavorites(userId: string) {
  const favorites = await prisma.favorite.findMany({
    where: { userId },
    include: {
      court: {
        select: {
          id: true,
          name: true,
          basePrice: true,
          status: true,
          sport: { select: { displayName: true } },
          branch: { select: { name: true, facility: { select: { name: true } } } },
        },
      },
      coach: {
        select: {
          id: true,
          slug: true,
          sessionRate: true,
          isActive: true,
          user: { select: { name: true, avatar: true } },
          sport: { select: { displayName: true } },
        },
      },
      facility: {
        select: {
          id: true,
          name: true,
          city: true,
          status: true,
        },
      },
      product: {
        select: {
          id: true,
          name: true,
          price: true,
          status: true,
          facility: { select: { name: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return favorites
}

export async function addFavorite(userId: string, data: AddFavoriteInput) {
  const favorite = await prisma.favorite.create({
    data: {
      userId,
      courtId: data.courtId,
      coachId: data.coachId,
      facilityId: data.facilityId,
      productId: data.productId,
    },
  })

  return favorite
}

export async function removeFavorite(userId: string, favoriteId: string) {
  await prisma.favorite.deleteMany({
    where: {
      id: favoriteId,
      userId,
    },
  })
}

export async function getMyBookings(userId: string, status?: string) {
  const where: { userId: string; status?: { in: string[] } | string } = { userId }

  if (status) {
    where.status = status
  }

  const bookings = await prisma.booking.findMany({
    where,
    include: {
      court: {
        select: {
          id: true,
          name: true,
          sport: { select: { displayName: true } },
          branch: { select: { name: true, facility: { select: { name: true } } } },
        },
      },
      coach: {
        select: {
          id: true,
          slug: true,
          sessionRate: true,
          user: { select: { name: true, avatar: true } },
          sport: { select: { displayName: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return bookings
}

export async function getMyOrders(userId: string, status?: string) {
  const where: { userId: string; status?: string } = { userId }

  if (status) {
    where.status = status
  }

  const orders = await prisma.storeOrder.findMany({
    where,
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              images: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return orders
}

export async function getNotifications(userId: string, unreadOnly: boolean = false, limit: number = 50) {
  const where: { userId: string; isRead?: boolean } = { userId }

  if (unreadOnly) {
    where.isRead = false
  }

  const notifications = await prisma.notification.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: limit,
  })

  return notifications
}

export async function markNotificationsAsRead(userId: string, notificationIds?: string[]) {
  if (notificationIds && notificationIds.length > 0) {
    await prisma.notification.updateMany({
      where: {
        userId,
        id: { in: notificationIds },
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    })
  } else {
    // Mark all as read
    await prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    })
  }
}

export async function getUnreadNotificationsCount(userId: string) {
  const count = await prisma.notification.count({
    where: {
      userId,
      isRead: false,
    },
  })

  return count
}
