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
        'animate-soft-rise',
        className
      )}
    >
      <div>
        <h2 className="text-3xl font-extrabold text-primary leading-tight tracking-tight animate-slide-up">
          {title}
        </h2>
        <p className="mt-2 text-sm md:text-base text-primary/65 max-w-3xl leading-relaxed animate-fade-in animation-delay-150">
          {subtitle}
        </p>
      </div>
      {actions ? (
        <div className="flex items-center gap-2 flex-wrap animate-fade-in animation-delay-200">{actions}</div>
      ) : null}
    </section>
  )
}
