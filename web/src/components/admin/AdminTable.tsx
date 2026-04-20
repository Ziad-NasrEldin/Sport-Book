import { type ReactNode } from 'react'
import { clsx } from 'clsx'
import { AdminEmptyState } from './AdminEmptyState'

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
  zebraStriping?: boolean
  hover?: boolean
  emptyVariant?: 'search' | 'default'
}

export function AdminTable<T>({
  items,
  columns,
  getRowKey,
  emptyMessage = 'No records match the current filters.',
  zebraStriping = true,
  hover = true,
  emptyVariant = 'search',
}: AdminTableProps<T>) {
  if (items.length === 0) {
    return (
      <div className="rounded-[var(--radius-md)] bg-surface-container-low">
        <AdminEmptyState
          variant={emptyVariant}
          title={emptyVariant === 'search' ? 'No results found' : 'Nothing here yet'}
          description={emptyMessage}
        />
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-[var(--radius-md)] bg-surface-container-low">
      <table className="min-w-full text-sm text-primary">
        <thead>
          <tr className="text-left text-[10px] uppercase tracking-[0.14em] font-lexend text-primary/55 border-b border-primary/5">
            {columns.map((column) => (
              <th key={column.key} className={`px-4 py-3.5 whitespace-nowrap ${column.className ?? ''}`}>
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr
              key={getRowKey(item)}
              className={clsx(
                'border-b border-primary/5 align-top transition-colors duration-150',
                zebraStriping && index % 2 === 1 && 'bg-primary/[0.02]',
                hover && 'hover:bg-primary/[0.04] cursor-pointer'
              )}
            >
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
