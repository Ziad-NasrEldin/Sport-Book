export type NotificationChannel = 'in-app' | 'email' | 'push'

export type AppNotification = {
  id: string
  userId: string
  channel: NotificationChannel
  title: string
  description: string
  createdAt: string
  read: boolean
}

const STORAGE_KEY = 'sportbook-notifications-v1'
export const NOTIFICATIONS_UPDATED_EVENT = 'sportbook-notifications-updated'

function canUseStorage() {
  return typeof window !== 'undefined'
}

function createId() {
  return `notif-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function normalizeNotification(notification: AppNotification): AppNotification {
  return {
    id: notification.id,
    userId: notification.userId,
    channel: notification.channel,
    title: notification.title,
    description: notification.description,
    createdAt: notification.createdAt,
    read: notification.read,
  }
}

function dispatchNotificationsUpdated(notifications: AppNotification[]) {
  if (!canUseStorage()) return

  window.dispatchEvent(
    new CustomEvent(NOTIFICATIONS_UPDATED_EVENT, {
      detail: notifications,
    }),
  )
}

export function getAllNotifications(): AppNotification[] {
  if (!canUseStorage()) return []

  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) return []

  try {
    const parsed = JSON.parse(raw) as AppNotification[]
    if (!Array.isArray(parsed)) return []
    return parsed.map(normalizeNotification)
  } catch {
    return []
  }
}

export function setAllNotifications(notifications: AppNotification[]) {
  if (!canUseStorage()) return

  const normalized = notifications.map(normalizeNotification)
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized))
  dispatchNotificationsUpdated(normalized)
}

export function addNotifications(
  notifications: Array<Omit<AppNotification, 'id' | 'createdAt' | 'read'>>,
) {
  const current = getAllNotifications()
  const createdAt = new Date().toISOString()

  const next = [
    ...notifications.map((notification) => ({
      ...notification,
      id: createId(),
      createdAt,
      read: notification.channel === 'in-app' ? false : true,
    })),
    ...current,
  ]

  setAllNotifications(next)
}

export function getInAppNotificationsForUser(userId: string): AppNotification[] {
  return getAllNotifications()
    .filter((notification) => notification.userId === userId && notification.channel === 'in-app')
    .sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1))
}

export function getUnreadInAppNotificationsCount(userId: string): number {
  return getInAppNotificationsForUser(userId).filter((notification) => !notification.read).length
}

export function markInAppNotificationsRead(userId: string) {
  const current = getAllNotifications()
  const next = current.map((notification) => {
    if (notification.userId !== userId) return notification
    if (notification.channel !== 'in-app') return notification

    return {
      ...notification,
      read: true,
    }
  })

  setAllNotifications(next)
}
