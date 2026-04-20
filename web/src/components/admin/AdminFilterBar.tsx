import { type ChangeEvent } from 'react'
import { Search, X } from 'lucide-react'
import { clsx } from 'clsx'

type AdminFilterBarProps = {
  searchValue: string
  onSearchChange: (value: string) => void
  searchPlaceholder?: string
  controls?: React.ReactNode
}

export function AdminFilterBar({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search',
  controls,
}: AdminFilterBarProps) {
  const handleSearch = (event: ChangeEvent<HTMLInputElement>) => {
    onSearchChange(event.target.value)
  }

  const handleClear = () => {
    onSearchChange('')
  }

  return (
    <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
      <div className="relative w-full xl:max-w-sm">
        <div
          className={clsx(
            'flex items-center gap-2.5 rounded-[var(--radius-default)] bg-surface-container-low',
            'px-3.5 py-2.5 transition-all duration-150 ease-out-quart',
            'focus-within:bg-surface-container-high',
            'focus-within:ring-2 focus-within:ring-primary/20 focus-within:ring-offset-2'
          )}
        >
          <Search className="w-4 h-4 text-primary/45 shrink-0" />
          <input
            type="text"
            value={searchValue}
            onChange={handleSearch}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
            className="w-full bg-transparent text-sm text-primary placeholder:text-primary/45 outline-none"
          />
          {searchValue && (
            <button
              type="button"
              onClick={handleClear}
              aria-label="Clear search"
              className="p-0.5 text-primary/45 hover:text-primary hover:bg-primary/10 rounded-full transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
      {controls ? <div className="flex flex-wrap items-center gap-2">{controls}</div> : null}
    </div>
  )
}
