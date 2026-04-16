import type { ReactNode } from 'react'

type Column<T> = {
  key: string
  header: string
  className?: string
  render: (item: T) => ReactNode
}

type AdminTableProps<T> = {
  items: T[]
  columns: Column<T>[]
  getRowKey: (item: T) => string
  emptyMessage?: string
}

export function AdminTable<T>({
  items,
  columns,
  getRowKey,
  emptyMessage = 'No records match the current filters.',
}: AdminTableProps<T>) {
  if (items.length === 0) {
    return (
      <div className="rounded-[var(--radius-md)] bg-surface-container-low p-8 text-center">
        <p className="text-sm font-semibold text-primary/70">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-[var(--radius-md)] bg-surface-container-low">
      <table className="min-w-full text-sm text-primary">
        <thead>
          <tr className="text-left text-[11px] uppercase tracking-[0.14em] font-lexend text-primary/55">
            {columns.map((column) => (
              <th key={column.key} className={`px-4 py-3.5 whitespace-nowrap ${column.className ?? ''}`}>
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={getRowKey(item)} className="border-t border-primary/5 align-top">
              {columns.map((column) => (
                <td key={column.key} className={`px-4 py-3.5 ${column.className ?? ''}`}>
                  {column.render(item)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
