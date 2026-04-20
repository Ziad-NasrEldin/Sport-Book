"use client"

import { Search, Users, FileText, Inbox, TrendingUp } from "lucide-react"
import { clsx } from "clsx"

export type EmptyStateVariant = "search" | "users" | "documents" | "inbox" | "stats" | "default"

type AdminEmptyStateProps = {
  variant?: EmptyStateVariant
  title?: string
  description?: string
  action?: React.ReactNode
}

const variantConfig: Record<EmptyStateVariant, { icon: typeof Search; title: string; description: string }> = {
  search: {
    icon: Search,
    title: "No results found",
    description: "Try adjusting your search or filters to find what you're looking for.",
  },
  users: {
    icon: Users,
    title: "No users yet",
    description: "When users join the platform, they'll appear here ready for management.",
  },
  documents: {
    icon: FileText,
    title: "Nothing here yet",
    description: "This space is ready and waiting for content to be added.",
  },
  inbox: {
    icon: Inbox,
    title: "All caught up",
    description: "You've cleared everything. Enjoy the peaceful silence.",
  },
  stats: {
    icon: TrendingUp,
    title: "No data available",
    description: "Data will appear here once users start interacting with the platform.",
  },
  default: {
    icon: Inbox,
    title: "Nothing to show",
    description: "There's nothing here at the moment. Check back later.",
  },
}

export function AdminEmptyState({
  variant = "default",
  title,
  description,
  action,
}: AdminEmptyStateProps) {
  const config = variantConfig[variant]
  const Icon = config.icon

  return (
    <div
      className={clsx(
        "flex flex-col items-center justify-center py-16 px-6",
        "text-center animate-fade-in"
      )}
    >
      <div
        className={clsx(
          "w-16 h-16 rounded-full mb-6",
          "bg-surface-container-low flex items-center justify-center",
          "text-primary/30"
        )}
      >
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-extrabold text-primary mb-2">
        {title || config.title}
      </h3>
      <p className="text-sm text-primary/60 max-w-sm mb-6">
        {description || config.description}
      </p>
      {action && <div className="animate-slide-up">{action}</div>}
    </div>
  )
}