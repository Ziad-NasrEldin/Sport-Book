import { type ReactNode, memo } from 'react'
import { clsx } from 'clsx'

type AdminPanelProps = {
  title?: string
  eyebrow?: string
  actions?: ReactNode
  children: ReactNode
  className?: string
  noPadding?: boolean
}

export const AdminPanel = memo(function AdminPanel({
  title,
  eyebrow,
  actions,
  children,
  className = '',
  noPadding = false,
}: AdminPanelProps) {
  return (
    <section
      className={clsx(
        'rounded-[var(--radius-lg)] bg-surface-container-lowest shadow-ambient',
        'transition-all duration-150',
        noPadding ? '' : 'p-4 md:p-5',
        className ?? ''
      )}
    >
      {(title || eyebrow || actions) && (
        <header className="mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            {eyebrow ? (
              <p className="text-[10px] uppercase tracking-[0.14em] font-lexend text-primary/55">{eyebrow}</p>
            ) : null}
            {title ? <h3 className="mt-1 text-lg md:text-xl font-extrabold text-primary">{title}</h3> : null}
          </div>
          {actions ? <div className="flex items-center gap-2 flex-wrap">{actions}</div> : null}
        </header>
      )}
      {children}
    </section>
  )
})
