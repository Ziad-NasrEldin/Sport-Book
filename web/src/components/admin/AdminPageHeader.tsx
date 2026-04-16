import type { ReactNode } from 'react'

type AdminPageHeaderProps = {
  title: string
  subtitle: string
  actions?: ReactNode
}

export function AdminPageHeader({ title, subtitle, actions }: AdminPageHeaderProps) {
  return (
    <section className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
      <div>
        <h2 className="text-3xl font-extrabold text-primary leading-tight">{title}</h2>
        <p className="mt-2 text-sm md:text-base text-primary/65 max-w-3xl">{subtitle}</p>
      </div>
      {actions ? <div className="flex items-center gap-2 flex-wrap">{actions}</div> : null}
    </section>
  )
}
