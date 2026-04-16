export type Tone = 'blue' | 'green' | 'amber' | 'red' | 'violet' | 'slate'

type AdminStatusPillProps = {
  label: string
  tone?: Tone
}

const toneClasses: Record<Tone, string> = {
  blue: 'bg-primary-container/15 text-primary',
  green: 'bg-emerald-500/15 text-emerald-700',
  amber: 'bg-amber-500/20 text-amber-800',
  red: 'bg-red-500/15 text-red-700',
  violet: 'bg-violet-500/15 text-violet-800',
  slate: 'bg-slate-500/15 text-slate-700',
}

export function AdminStatusPill({ label, tone = 'slate' }: AdminStatusPillProps) {
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-lexend font-bold uppercase tracking-[0.14em] ${toneClasses[tone]}`}>
      {label}
    </span>
  )
}
