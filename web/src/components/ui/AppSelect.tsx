'use client'

import { clsx } from 'clsx'
import { ChevronDown } from 'lucide-react'
import {
  Children,
  isValidElement,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type ReactNode,
  type SelectHTMLAttributes,
} from 'react'

type AppSelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, 'multiple'> & {
  children: ReactNode
}

type SelectOption = {
  value: string
  label: ReactNode
  disabled: boolean
}

function parseOptions(children: ReactNode): SelectOption[] {
  const options: SelectOption[] = []

  const collectOption = (node: ReactNode) => {
    if (!isValidElement(node)) return

    if (typeof node.type === 'string' && node.type === 'option') {
      const optionProps = node.props as {
        value?: string | number
        children?: ReactNode
        disabled?: boolean
      }

      const rawValue = optionProps.value ?? (typeof optionProps.children === 'string' ? optionProps.children : '')
      options.push({
        value: String(rawValue),
        label: optionProps.children,
        disabled: Boolean(optionProps.disabled),
      })
      return
    }

    if (typeof node.type === 'string' && node.type === 'optgroup') {
      const groupProps = node.props as { children?: ReactNode }
      Children.forEach(groupProps.children, collectOption)
    }
  }

  Children.forEach(children, collectOption)
  return options
}

function buildChangeEvent(nextValue: string, name?: string): ChangeEvent<HTMLSelectElement> {
  const target = { value: nextValue, name: name ?? '' } as unknown as HTMLSelectElement
  return {
    target,
    currentTarget: target,
  } as ChangeEvent<HTMLSelectElement>
}

export function AppSelect({
  children,
  className,
  value,
  defaultValue,
  onChange,
  disabled,
  name,
  id,
  title,
  'aria-label': ariaLabel,
}: AppSelectProps) {
  const options = useMemo(() => parseOptions(children), [children])
  const firstEnabledValue = useMemo(() => options.find((option) => !option.disabled)?.value ?? '', [options])

  const controlled = value !== undefined
  const [internalValue, setInternalValue] = useState(() => String(defaultValue ?? firstEnabledValue))
  const [open, setOpen] = useState(false)

  const rootRef = useRef<HTMLDivElement | null>(null)

  const selectedValue = controlled ? String(value ?? '') : internalValue
  const selectedOption = options.find((option) => option.value === selectedValue) ?? options.find((option) => !option.disabled)

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current) return
      if (rootRef.current.contains(event.target as Node)) return
      setOpen(false)
    }

    window.addEventListener('pointerdown', handlePointerDown)
    return () => window.removeEventListener('pointerdown', handlePointerDown)
  }, [])

  const handleSelect = (nextValue: string) => {
    if (!controlled) {
      setInternalValue(nextValue)
    }
    onChange?.(buildChangeEvent(nextValue, name))
    setOpen(false)
  }

  const fullWidth = className?.includes('w-full')

  return (
    <div ref={rootRef} className={clsx('relative inline-flex', fullWidth && 'w-full')}>
      <button
        type="button"
        id={id}
        name={name}
        disabled={disabled}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        title={title}
        onClick={() => !disabled && setOpen((current) => !current)}
        onKeyDown={(event) => {
          if (disabled) return
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp' || event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            setOpen(true)
          }
          if (event.key === 'Escape') {
            event.preventDefault()
            setOpen(false)
          }
        }}
        className={clsx(
          'relative appearance-none',
          '!rounded-[0.95rem] border border-primary/25 !px-2.5 !py-1.5 !text-xs leading-tight',
          'bg-gradient-to-br from-surface-container-lowest to-surface-container-high',
          'text-primary shadow-[0_16px_30px_-24px_rgba(0,17,58,0.72)]',
          'transition-all duration-150 ease-out-quart',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25',
          'hover:-translate-y-[1px] hover:border-primary/40',
          'disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0',
          className
        )}
      >
        <span className="block truncate pr-7 text-left">{selectedOption?.label}</span>
        <ChevronDown
          className={clsx(
            'pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-primary/75 transition-transform duration-150 ease-out-quart',
            open && 'rotate-180'
          )}
        />
      </button>

      {open && !disabled ? (
        <div
          role="listbox"
          aria-labelledby={id}
          className="absolute left-0 top-[calc(100%+0.35rem)] z-50 min-w-full max-h-64 overflow-y-auto rounded-[0.95rem] border border-primary/20 bg-gradient-to-b from-surface-container-lowest to-surface-container-high p-1 shadow-[0_24px_44px_-24px_rgba(0,17,58,0.9)] backdrop-blur-sm"
        >
          {options.map((option) => {
            const selected = option.value === selectedValue
            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={selected}
                disabled={option.disabled}
                onClick={() => handleSelect(option.value)}
                className={clsx(
                  'flex w-full items-center rounded-[0.66rem] border !px-2.5 !py-1.5 text-left !text-xs font-lexend font-bold tracking-[0.08em] transition-colors duration-150',
                  selected
                    ? 'border-primary/35 bg-primary text-surface-container-lowest'
                    : 'border-transparent text-primary hover:border-primary/18 hover:bg-primary/10',
                  option.disabled && 'cursor-not-allowed opacity-45'
                )}
              >
                <span className="truncate">{option.label}</span>
              </button>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}
