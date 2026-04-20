import type { ReactNode } from 'react'
import { clsx } from 'clsx'

type AdminPageHeaderProps = {
  title: string
  subtitle: string
  actions?: ReactNode
  className?: string
}

export function AdminPageHeader({
  title,
  subtitle,
  actions,
  className,
}: AdminPageHeaderProps) {
  return (
    <section
      className={clsx(
        'flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between',
        className
      )}
    >
      <div>
        <h2 className="text-3xl font-extrabold text-primary leading-tight tracking-tight">
          {title}
        </h2>
        <p className="mt-2 text-sm md:text-base text-primary/65 max-w-3xl leading-relaxed">
          {subtitle}
        </p>
      </div>
      {actions ? (
        <div className="flex items-center gap-2 flex-wrap">{actions}</div>
      ) : null}
    </section>
  )
}
