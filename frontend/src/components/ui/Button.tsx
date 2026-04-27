import type { ButtonHTMLAttributes, PropsWithChildren } from 'react'
import { Spinner } from './Spinner'

type Variant = 'primary' | 'secondary' | 'success' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  fullWidth?: boolean
  loading?: boolean
}

const VARIANT_CLASSES: Record<Variant, string> = {
  primary:
    'bg-primary text-white hover:bg-primary-dark active:scale-[0.98] focus-visible:ring-primary disabled:opacity-60',
  danger:
    'bg-primary text-white hover:bg-primary-dark active:scale-[0.98] focus-visible:ring-primary disabled:opacity-60',
  success:
    'bg-success text-white hover:bg-success-dark active:scale-[0.98] focus-visible:ring-success disabled:opacity-60',
  secondary:
    'bg-white text-text border border-surface-border hover:bg-surface hover:border-text-muted focus-visible:ring-primary disabled:opacity-60',
  ghost:
    'bg-transparent text-text hover:bg-surface focus-visible:ring-primary disabled:opacity-60'
}

const SIZE_CLASSES: Record<Size, string> = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-11 px-5 text-base'
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  className,
  disabled,
  ...props
}: PropsWithChildren<ButtonProps>) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-card font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed'
  const widthClass = fullWidth ? 'w-full' : ''
  const cls = [
    base,
    SIZE_CLASSES[size],
    VARIANT_CLASSES[variant],
    widthClass,
    className
  ]
    .filter(Boolean)
    .join(' ')
  const spinnerVariant =
    variant === 'secondary' || variant === 'ghost' ? 'primary' : 'white'
  return (
    <button {...props} disabled={disabled || loading} className={cls}>
      {loading && <Spinner variant={spinnerVariant} />}
      {children}
    </button>
  )
}
