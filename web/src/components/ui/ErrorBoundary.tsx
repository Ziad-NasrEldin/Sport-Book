"use client"

import { type ReactNode } from "react"
import { AlertTriangle, RefreshCw, Home } from "lucide-react"
import { AdminButton } from "@/components/admin/AdminButton"

type APIErrorFallbackProps = {
  error?: Error | { message?: string }
  title?: string
  message?: string
  onRetry?: () => void
}

const friendlyMessages = [
  "Something went wrong. Let's try again.",
  "The system is taking a moment. Want to retry?",
  "We hit a small bump. No worries, let's recover.",
  "Things got a bit tangled. Want to try once more?",
]

function getRandomMessage(): string {
  if (typeof window === "undefined") return friendlyMessages[0]
  const index = Math.floor(Math.random() * friendlyMessages.length)
  return friendlyMessages[index]
}

export function APIErrorFallback({
  error,
  title = "Something went wrong",
  message,
  onRetry,
}: APIErrorFallbackProps) {
  const displayMessage = message || error?.message || getRandomMessage()

  return (
    <div
      className="flex flex-col items-center justify-center py-16 px-6 text-center animate-fade-in"
      role="alert"
    >
      <div className="w-16 h-16 rounded-full mb-6 bg-red-500/10 flex items-center justify-center">
        <AlertTriangle className="w-8 h-8 text-red-500/60" />
      </div>
      <h3 className="text-lg font-extrabold text-primary mb-2">{title}</h3>
      <p className="text-sm text-primary/60 max-w-sm mb-6">{displayMessage}</p>
      <div className="flex items-center gap-3 animate-slide-up">
        {onRetry && (
          <AdminButton variant="secondary" icon={<RefreshCw className="w-4 h-4" />} onClick={onRetry}>
            Try Again
          </AdminButton>
        )}
        <AdminButton
          variant="ghost"
          icon={<Home className="w-4 h-4" />}
          onClick={() => (window.location.href = "/")}
        >
          Go Home
        </AdminButton>
      </div>
    </div>
  )
}