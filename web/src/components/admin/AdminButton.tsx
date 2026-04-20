"use client"

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react"
import { Loader2 } from "lucide-react"
import { clsx } from "clsx"

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger"
export type ButtonSize = "sm" | "md" | "lg"

type AdminButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  icon?: ReactNode
  iconPosition?: "left" | "right"
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-primary-container text-surface-container-lowest hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:shadow-sm focus:ring-2 focus:ring-primary-container/50",
  secondary:
    "bg-surface-container-low text-primary hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:shadow-sm focus:ring-2 focus:ring-primary/20",
  ghost:
    "bg-transparent text-primary hover:bg-surface-container-low hover:-translate-y-0.5 active:translate-y-0 focus:ring-2 focus:ring-primary/20",
  danger:
    "bg-red-500 text-white hover:-translate-y-0.5 hover:shadow-lg hover:bg-red-600 active:translate-y-0 active:shadow-sm focus:ring-2 focus:ring-red-500/50",
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-2.5 py-1.5 text-[10px] tracking-[0.12em] gap-1.5",
  md: "px-4 py-2 text-sm font-semibold tracking-[0.08em] gap-2",
  lg: "px-5 py-2.5 text-base font-semibold tracking-[0.06em] gap-2.5",
}

export const AdminButton = forwardRef<HTMLButtonElement, AdminButtonProps>(
  function AdminButton(
    {
      variant = "primary",
      size = "md",
      loading = false,
      disabled = false,
      icon,
      iconPosition = "left",
      className,
      children,
      ...props
    },
    ref
  ) {
    const isDisabled = disabled || loading

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={clsx(
          "inline-flex items-center justify-center rounded-full font-lexend font-bold",
          "transition-all duration-200 ease-out-quart",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
          "disabled:opacity-50 disabled:pointer-events-none",
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : icon && iconPosition === "left" ? (
          <span className="shrink-0">{icon}</span>
        ) : null}
        {children}
        {!loading && icon && iconPosition === "right" ? (
          <span className="shrink-0">{icon}</span>
        ) : null}
      </button>
    )
  }
)