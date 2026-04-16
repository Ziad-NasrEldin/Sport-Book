'use client'

import { useEffect, useMemo, useState } from 'react'
import { BellRing, CheckCircle2, Clock3, Mail, Smartphone, X } from 'lucide-react'
import {
  NOTIFICATIONS_UPDATED_EVENT,
  getInAppNotificationsForUser,
  markInAppNotificationsRead,
} from '@/lib/notifications'
import { ACTIVE_USER_UPDATED_EVENT, getActiveUserId } from '@/lib/teams'

interface NotificationsModalProps {
  isOpen: boolean
  onClose: () => void
}

function getRelativeTimeLabel(timestamp: string) {
  const createdAt = new Date(timestamp).getTime()
  const now = Date.now()
  const minutes = Math.max(0, Math.floor((now - createdAt) / (1000 * 60)))

  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes} min ago`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hr ago`

  const days = Math.floor(hours / 24)
  return `${days} day${days > 1 ? 's' : ''} ago`
}

export function NotificationsModal({ isOpen, onClose }: NotificationsModalProps) {
  const [activeUserId, setActiveUserId] = useState(getActiveUserId)
  const [notifications, setNotifications] = useState(() => getInAppNotificationsForUser(getActiveUserId()))

  useEffect(() => {
    const refresh = () => {
      const nextActiveUserId = getActiveUserId()
      setActiveUserId(nextActiveUserId)
      setNotifications(getInAppNotificationsForUser(nextActiveUserId))
    }

    window.addEventListener(NOTIFICATIONS_UPDATED_EVENT, refresh)
    window.addEventListener(ACTIVE_USER_UPDATED_EVENT, refresh)

    return () => {
      window.removeEventListener(NOTIFICATIONS_UPDATED_EVENT, refresh)
      window.removeEventListener(ACTIVE_USER_UPDATED_EVENT, refresh)
    }
  }, [])

  useEffect(() => {
    if (!isOpen) return

    markInAppNotificationsRead(activeUserId)
  }, [activeUserId, isOpen])

  const decoratedNotifications = useMemo(() => {
    return notifications.map((notification) => {
      const isTeamFull = notification.title.toLowerCase().includes('team is full')

      return {
        ...notification,
        timeLabel: getRelativeTimeLabel(notification.createdAt),
        icon: isTeamFull ? CheckCircle2 : Clock3,
        iconClassName: isTeamFull ? 'text-[#0d7a44]' : 'text-secondary',
        chipClassName: isTeamFull
          ? 'bg-[#d8f7e8] text-[#0d7a44]'
          : 'bg-surface-container-high text-primary',
        badge: isTeamFull ? 'Team Full' : 'Update',
      }
    })
  }, [notifications])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-[110] bg-primary/40 backdrop-blur-sm flex items-start justify-center p-4 md:p-6"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Notifications"
        className="w-full max-w-xl mt-14 md:mt-20 bg-surface-container-lowest rounded-[var(--radius-xl)] shadow-[0_20px_60px_-15px_rgba(0,17,58,0.2)] overflow-hidden"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="px-5 py-4 md:px-6 md:py-5 bg-surface-container-low flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-full bg-surface-container-lowest text-primary flex items-center justify-center shadow-ambient">
              <BellRing className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-lg md:text-xl font-extrabold text-primary">Notifications</h2>
              <p className="text-xs md:text-sm text-primary/60">Recent updates for your active player profile</p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close notifications"
            className="w-9 h-9 rounded-full bg-surface-container-lowest text-primary hover:bg-surface transition-colors flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </header>

        <div className="p-4 md:p-6 space-y-3 bg-surface-container-low max-h-[70vh] overflow-y-auto">
          {decoratedNotifications.length === 0 && (
            <article className="bg-surface-container-lowest rounded-[var(--radius-md)] p-5 shadow-ambient text-center">
              <p className="text-base font-bold text-primary">No notifications yet</p>
              <p className="text-sm text-primary/70 mt-1">When your team fills up, you will get notified here.</p>
              <div className="mt-3 inline-flex items-center gap-2 text-xs text-primary/60 bg-surface-container-high rounded-full px-3 py-1.5">
                <Mail className="w-3.5 h-3.5" />
                <Smartphone className="w-3.5 h-3.5" />
                Email and push channels are also prepared.
              </div>
            </article>
          )}

          {decoratedNotifications.map((notification) => {
            const Icon = notification.icon

            return (
              <article
                key={notification.id}
                className="bg-surface-container-lowest rounded-[var(--radius-md)] p-4 md:p-5 shadow-ambient"
              >
                <div className="flex items-start gap-3 md:gap-4">
                  <span className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center shrink-0">
                    <Icon className={`w-5 h-5 ${notification.iconClassName}`} />
                  </span>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-sm md:text-base font-bold text-primary leading-tight">{notification.title}</h3>
                      <span className="text-[10px] md:text-xs font-lexend uppercase tracking-widest text-primary/45 shrink-0">
                        {notification.timeLabel}
                      </span>
                    </div>

                    <p className="text-xs md:text-sm text-primary/70 mt-1.5 leading-relaxed">{notification.description}</p>

                    <span
                      className={`inline-flex mt-3 px-2.5 py-1 rounded-[var(--radius-full)] text-[10px] font-lexend font-bold uppercase tracking-widest ${notification.chipClassName}`}
                    >
                      {notification.badge}
                    </span>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </div>
  )
}