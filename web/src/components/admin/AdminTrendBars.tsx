type AdminTrendBarsProps = {
  values: number[]
  colorClassName?: string
}

export function AdminTrendBars({ values, colorClassName = 'bg-primary-container' }: AdminTrendBarsProps) {
  const max = Math.max(...values, 1)

  return (
    <div className="flex items-end gap-1.5 h-20">
      {values.map((value, index) => {
        const height = Math.max(10, Math.round((value / max) * 100))

        return (
          <span
            key={`${value}-${index}`}
            className={`w-full rounded-full ${colorClassName}`}
            style={{ height: `${height}%`, opacity: 0.35 + index * 0.06 }}
          />
        )
      })}
    </div>
  )
}
