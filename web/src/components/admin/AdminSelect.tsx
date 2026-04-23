"use client"

import { forwardRef, type SelectHTMLAttributes } from "react"
import { ChevronDown } from "lucide-react"
import { clsx } from "clsx"
export type SelectSize = "sm" | "md" | "lg"

type AdminSelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, "size"> & {
  size?: SelectSize
  error?: boolean
}

const sizeStyles: Record<SelectSize, string> = {
  sm: "px-2.5 py-1.5 text-[10px] tracking-[0.12em]",
  md: "px-3 py-2 text-xs tracking-[0.12em]",
  lg: "px-3.5 py-2.5 text-sm tracking-[0.08em]",
}

export const AdminSelect = forwardRef<HTMLSelectElement, AdminSelectProps>(
  function AdminSelect(
    { size = "md", error = false, className, children, ...props },
    ref
  ) {
    return (
      <div className="relative inline-flex items-center">
        <select
          ref={ref}
          data-select-icon
          className={clsx(
            "appearance-none rounded-full bg-surface-container-low font-lexend font-bold",
            "text-primary outline-none cursor-pointer",
            "transition-all duration-150 ease-out-quart",
            "focus:ring-2 focus:ring-primary/30 focus:ring-offset-2",
            "hover:bg-surface-container-high",
            error && "focus:ring-red-500/50 focus:ring-red-500/30",
            sizeStyles[size as SelectSize],
            className
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDown
          className={clsx(
            "absolute right-2 pointer-events-none text-primary/55",
            size === "sm" && "w-3 h-3",
            size === "md" && "w-3.5 h-3.5",
            size === "lg" && "w-4 h-4"
          )}
        />
      </div>
    )
  }
)

