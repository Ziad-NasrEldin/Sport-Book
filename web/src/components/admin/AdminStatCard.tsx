import { ArrowDownRight, ArrowRight, ArrowUpRight } from 'lucide-react'
import { clsx } from 'clsx'
import type { Tone } from './AdminStatusPill'

type Trend = 'up' | 'down' | 'flat' | 'steady'

type AdminStatCardProps = {
  label: string
  value: string
  delta: string
  trend: Trend
}

const trendToneMap: Record<Trend, Tone> = {
  up: 'green',
  down: 'red',
  flat: 'slate',
  steady: 'slate',
}

const trendColors: Record<Tone, string> = {
  blue: 'bg-primary-container/15 text-primary',
  green: 'bg-emerald-500/15 text-emerald-700',
  amber: 'bg-amber-500/20 text-amber-800',
  red: 'bg-red-500/15 text-red-700',
  violet: 'bg-violet-500/15 text-violet-800',
  slate: 'bg-slate-500/15 text-slate-700',
}

export function AdminStatCard({ label, value, delta, trend }: AdminStatCardProps) {
  const tone = trendToneMap[trend]
  const trendClasses = trendColors[tone]

  const TrendIcon = trend === 'up' ? ArrowUpRight : trend === 'down' ? ArrowDownRight : ArrowRight

  return (
    <article
      className={clsx(
        'rounded-[var(--radius-md)] bg-surface-container-low p-4 md:p-5',
        'transition-all duration-200 ease-out-quart animate-scale-in',
        'hover:bg-surface-container-medium hover:-translate-y-1 hover:shadow-lg'
      )}
    >
      <p className="text-[10px] uppercase tracking-[0.14em] font-lexend text-primary/55">{label}</p>
      <p className="mt-2 text-2xl md:text-3xl font-extrabold text-primary leading-tight">{value}</p>
      <p
        className={clsx(
          'mt-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1',
          'text-[10px] font-lexend font-bold uppercase tracking-[0.14em]',
          trendClasses
        )}
      >
        <TrendIcon className="w-3.5 h-3.5" />
        {delta}
      </p>
    </article>
  )
}
