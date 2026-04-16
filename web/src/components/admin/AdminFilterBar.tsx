import { type ChangeEvent } from 'react'
import { Search } from 'lucide-react'

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

  return (
    <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
      <label className="flex items-center gap-2.5 rounded-[var(--radius-default)] bg-surface-container-low px-3.5 py-2.5 w-full xl:max-w-sm">
        <Search className="w-4 h-4 text-primary/45" />
        <input
          type="text"
          value={searchValue}
          onChange={handleSearch}
          placeholder={searchPlaceholder}
          aria-label={searchPlaceholder}
          className="w-full bg-transparent text-sm text-primary placeholder:text-primary/45 outline-none"
        />
      </label>
      {controls ? <div className="flex flex-wrap items-center gap-2">{controls}</div> : null}
    </div>
  )
}
