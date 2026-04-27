interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  variant?: 'primary' | 'white'
}

const SIZE_CLASS: Record<NonNullable<SpinnerProps['size']>, string> = {
  sm: 'w-3.5 h-3.5 border-2',
  md: 'w-5 h-5 border-2',
  lg: 'w-8 h-8 border-[3px]'
}

const VARIANT_CLASS: Record<NonNullable<SpinnerProps['variant']>, string> = {
  primary: 'border-surface-border border-t-primary',
  white: 'border-white/40 border-t-white'
}

export function Spinner({ size = 'sm', variant = 'primary' }: SpinnerProps = {}) {
  return (
    <span
      role="status"
      aria-label="Carregando"
      className={`inline-block rounded-full ${SIZE_CLASS[size]} ${VARIANT_CLASS[variant]}`}
      style={{ animation: 'spin 0.8s linear infinite' }}
    />
  )
}
