"use client"

import { useEffect, useState } from "react"
import { CheckCircle, XCircle, AlertCircle, Info, X } from "lucide-react"
import { clsx } from "clsx"

export type ToastType = "success" | "error" | "warning" | "info"

type AdminToastProps = {
  type?: ToastType
  message: string
  isVisible: boolean
  onClose?: () => void
  duration?: number
}

const toastConfig: Record<ToastType, { icon: typeof CheckCircle; bg: string; text: string; border: string }> = {
  success: {
    icon: CheckCircle,
    bg: "bg-emerald-500/10",
    text: "text-emerald-700",
    border: "border-emerald-500/20",
  },
  error: {
    icon: XCircle,
    bg: "bg-red-500/10",
    text: "text-red-700",
    border: "border-red-500/20",
  },
  warning: {
    icon: AlertCircle,
    bg: "bg-amber-500/10",
    text: "text-amber-700",
    border: "border-amber-500/20",
  },
  info: {
    icon: Info,
    bg: "bg-primary/10",
    text: "text-primary",
    border: "border-primary/20",
  },
}

export function AdminToast({
  type = "info",
  message,
  isVisible,
  onClose,
  duration = 4000,
}: AdminToastProps) {
  const [isLeaving, setIsLeaving] = useState(false)
  const config = toastConfig[type]
  const Icon = config.icon

  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        setIsLeaving(true)
        setTimeout(() => {
          onClose?.()
        }, 200)
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [isVisible, duration, onClose])

  if (!isVisible && !isLeaving) return null

  return (
    <div
      className={clsx(
        "fixed bottom-6 right-6 z-50 flex items-center gap-3",
        "rounded-[var(--radius-lg)] border px-4 py-3 shadow-lg",
        "animate-slide-up backdrop-blur-sm",
        config.bg,
        config.border,
        isLeaving && "animate-fade-out opacity-0"
      )}
      role="alert"
    >
      <Icon className={clsx("w-5 h-5 shrink-0", config.text)} />
      <p className={clsx("text-sm font-semibold text-primary", config.text)}>{message}</p>
      {onClose && (
        <button
          onClick={() => {
            setIsLeaving(true)
            setTimeout(() => onClose(), 200)
          }}
          className="ml-2 p-1 rounded-full hover:bg-primary/10 transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4 text-primary/60" />
        </button>
      )}
    </div>
  )
}

export function AdminToastContainer({
  toasts,
  onRemove,
}: {
  toasts: Array<{ id: string; type: ToastType; message: string }>
  onRemove: (id: string) => void
}) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <AdminToast
          key={toast.id}
          type={toast.type}
          message={toast.message}
          isVisible={true}
          onClose={() => onRemove(toast.id)}
        />
      ))}
    </div>
  )
}