type Segment = {
  label: string
  value: number
  color: string
}

type AdminDonutProps = {
  segments: Segment[]
}

function buildConic(segments: Segment[]) {
  const total = segments.reduce((sum, segment) => sum + segment.value, 0)
  let progress = 0
  const parts = segments.map((segment) => {
    const start = progress
    progress += (segment.value / total) * 100
    return `${segment.color} ${start}% ${progress}%`
  })

  return `conic-gradient(${parts.join(', ')})`
}

export function AdminDonut({ segments }: AdminDonutProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center gap-4">
      <div
        className="w-32 h-32 rounded-full relative"
        style={{ background: buildConic(segments) }}
        aria-label="Distribution chart"
      >
        <span className="absolute inset-[22%] rounded-full bg-surface-container-lowest" />
      </div>
      <ul className="space-y-2">
        {segments.map((segment) => (
          <li key={segment.label} className="flex items-center gap-2.5 text-sm text-primary/80">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: segment.color }} />
            <span className="font-semibold">{segment.label}</span>
            <span className="text-primary/55">{segment.value}%</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
