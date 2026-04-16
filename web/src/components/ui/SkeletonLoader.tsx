export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-surface-container-lowest rounded-lg overflow-hidden ${className}`}>
      <div className="w-full aspect-[16/11] bg-surface-container-low animate-pulse" />
      <div className="p-5 space-y-3">
        <div className="h-4 bg-surface-container-low rounded w-1/3 animate-pulse" />
        <div className="h-6 bg-surface-container-low rounded w-2/3 animate-pulse" />
        <div className="h-4 bg-surface-container-low rounded w-full animate-pulse" />
        <div className="h-10 bg-surface-container-low rounded w-full animate-pulse" />
      </div>
    </div>
  )
}

export function SkeletonStat() {
  return (
    <div className="bg-surface-container-lowest rounded-lg p-5 space-y-3">
      <div className="h-4 bg-surface-container-low rounded w-1/2 animate-pulse" />
      <div className="h-8 bg-surface-container-low rounded w-3/4 animate-pulse" />
      <div className="h-3 bg-surface-container-low rounded w-full animate-pulse" />
    </div>
  )
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      <div className="h-10 bg-surface-container-low rounded animate-pulse" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-12 bg-surface-container-low rounded animate-pulse" />
      ))}
    </div>
  )
}

export function SkeletonList({ items = 5 }: { items?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="bg-surface-container-low rounded-lg p-4 space-y-2 animate-pulse">
          <div className="h-4 bg-surface-container-high rounded w-1/3" />
          <div className="h-3 bg-surface-container-high rounded w-full" />
        </div>
      ))}
    </div>
  )
}
