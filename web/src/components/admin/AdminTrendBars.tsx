type AdminTrendBarsProps = {
  values: number[]
  colorClassName?: string
}

export function AdminTrendBars({ values, colorClassName = 'bg-primary-container' }: AdminTrendBarsProps) {
  const max = Math.max(...values, 1)
  const ariaLabel = `Trend chart with ${values.length} bars, values from ${Math.min(...values)} to ${Math.max(...values)}`

  return (
    <div className="flex items-end gap-1.5 h-20" aria-label={ariaLabel} role="img">
      {values.map((value, index) => {
        const height = Math.max(10, Math.round((value / max) * 100))

        return (
          <span
            key={`${value}-${index}`}
            className={`w-full rounded-full transition-[height,opacity,transform] duration-300 ease-out-quart ${colorClassName} animate-card-stagger`}
            style={{
              height: `${height}%`,
              opacity: 0.35 + index * 0.06,
              animationDelay: `${index * 70}ms`,
            }}
            aria-hidden="true"
          />
        )
      })}
    </div>
  )
}
