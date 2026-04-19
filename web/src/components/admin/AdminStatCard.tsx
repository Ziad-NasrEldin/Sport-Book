import { ArrowDownRight, ArrowRight, ArrowUpRight } from 'lucide-react'

type Trend = 'up' | 'down' | 'flat' | 'steady'

type AdminStatCardProps = {
  label: string
  value: string
  delta: string
  trend: Trend
}

export function AdminStatCard({ label, value, delta, trend }: AdminStatCardProps) {
  const trendClasses =
    trend === 'up'
      ? 'text-emerald-700 bg-emerald-500/15'
      : trend === 'down'
        ? 'text-red-700 bg-red-500/15'
        : 'text-primary bg-primary/10'

  const TrendIcon = trend === 'up' ? ArrowUpRight : trend === 'down' ? ArrowDownRight : ArrowRight

  return (
    <article className="rounded-[var(--radius-md)] bg-surface-container-low p-4 md:p-5">
      <p className="text-[10px] uppercase tracking-[0.16em] font-lexend text-primary/55">{label}</p>
      <p className="mt-2 text-2xl md:text-3xl font-extrabold text-primary leading-tight">{value}</p>
      <p className={`mt-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-lexend font-bold uppercase tracking-[0.14em] ${trendClasses}`}>
        <TrendIcon className="w-3.5 h-3.5" />
        {delta}
      </p>
    </article>
  )
}
