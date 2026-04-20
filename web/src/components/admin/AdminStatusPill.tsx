import { clsx } from 'clsx'

export type Tone = 'blue' | 'green' | 'amber' | 'red' | 'violet' | 'slate'

type AdminStatusPillProps = {
  label: string
  tone?: Tone
  interactive?: boolean
}

const toneClasses: Record<Tone, string> = {
  blue: 'bg-primary-container/15 text-primary',
  green: 'bg-emerald-500/15 text-emerald-700',
  amber: 'bg-amber-500/20 text-amber-800',
  red: 'bg-red-500/15 text-red-700',
  violet: 'bg-violet-500/15 text-violet-800',
  slate: 'bg-slate-500/15 text-slate-700',
}

const interactiveClasses = 'cursor-pointer hover:scale-105 hover:shadow-sm transition-all duration-200 ease-out-quart'

export function AdminStatusPill({
  label,
  tone = 'slate',
  interactive = false,
}: AdminStatusPillProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center px-2.5 py-1 rounded-full',
        'text-[10px] font-lexend font-bold uppercase tracking-[0.14em]',
        toneClasses[tone],
        interactive && interactiveClasses
      )}
    >
      {label}
    </span>
  )
}

export function getToneFromStatus(status: string): Tone {
  const normalized = status.toLowerCase()
  if (
    normalized.includes('active') ||
    normalized.includes('enabled') ||
    normalized.includes('approved') ||
    normalized.includes('settled') ||
    normalized.includes('healthy') ||
    normalized.includes('confirmed') ||
    normalized.includes('completed') ||
    normalized.includes('delivered')
  ) {
    return 'green'
  }
  if (
    normalized.includes('pending') ||
    normalized.includes('processing') ||
    normalized.includes('review') ||
    normalized.includes('draft')
  ) {
    return 'amber'
  }
  if (
    normalized.includes('suspended') ||
    normalized.includes('failed') ||
    normalized.includes('rejected') ||
    normalized.includes('cancelled') ||
    normalized.includes('expired') ||
    normalized.includes('critical') ||
    normalized.includes('disabled')
  ) {
    return 'red'
  }
  if (normalized.includes('archived')) {
    return 'violet'
  }
  return 'blue'
}
