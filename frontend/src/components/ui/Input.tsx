import { forwardRef, type InputHTMLAttributes } from 'react'

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  error?: string
}

export const Input = forwardRef<HTMLInputElement, Props>(function Input(
  { className, error, ...props },
  ref
) {
  const base =
    'w-full h-10 rounded-lg border bg-white px-3 text-sm text-text placeholder:text-text-muted transition-colors focus:outline-none focus:ring-2 disabled:bg-surface'
  const stateClass = error
    ? 'border-primary focus:border-primary focus:ring-primary/30'
    : 'border-surface-border focus:border-primary focus:ring-primary/20'
  return (
    <div className="flex flex-col gap-1">
      <input
        ref={ref}
        {...props}
        className={[base, stateClass, className].filter(Boolean).join(' ')}
      />
      {error && <small className="text-primary text-xs">{error}</small>}
    </div>
  )
})
