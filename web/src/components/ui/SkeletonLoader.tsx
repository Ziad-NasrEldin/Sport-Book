import { clsx } from "clsx"

const shimmer =
  "animate-shimmer bg-gradient-to-r from-transparent via-primary/[0.08] to-transparent"

export function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <div
      className={clsx(
        "bg-surface-container-lowest rounded-lg overflow-hidden",
        className
      )}
    >
      <div
        className={clsx(
          "w-full aspect-[16/11] bg-surface-container-low relative overflow-hidden",
          "before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-primary/[0.06] before:to-transparent",
          "before:animate-shimmer"
        )}
      />
      <div className="p-5 space-y-3">
        <div className={clsx("h-4 bg-surface-container-low rounded w-1/3", shimmer)} />
        <div className={clsx("h-6 bg-surface-container-low rounded w-2/3", shimmer)} />
        <div className={clsx("h-4 bg-surface-container-low rounded w-full", shimmer)} />
        <div className={clsx("h-10 bg-surface-container-low rounded w-full", shimmer)} />
      </div>
    </div>
  )
}

export function SkeletonStat() {
  return (
    <div className="bg-surface-container-lowest rounded-lg p-5 space-y-3">
      <div className={clsx("h-4 bg-surface-container-low rounded w-1/2", shimmer)} />
      <div className={clsx("h-8 bg-surface-container-low rounded w-3/4", shimmer)} />
      <div className={clsx("h-3 bg-surface-container-low rounded w-full", shimmer)} />
    </div>
  )
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      <div className={clsx("h-10 bg-surface-container-low rounded", shimmer)} />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className={clsx("h-12 bg-surface-container-low rounded", shimmer)} />
      ))}
    </div>
  )
}

export function SkeletonList({ items = 5 }: { items?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: items }).map((_, i) => (
        <div
          key={i}
          className="bg-surface-container-low rounded-lg p-4 space-y-2"
        >
          <div className={clsx("h-4 bg-surface-container-high rounded w-1/3", shimmer)} />
          <div className={clsx("h-3 bg-surface-container-high rounded w-full", shimmer)} />
        </div>
      ))}
    </div>
  )
}
