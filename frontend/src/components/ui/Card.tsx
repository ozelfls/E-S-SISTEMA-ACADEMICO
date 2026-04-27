import type { PropsWithChildren, ReactNode } from 'react'

interface CardProps {
  className?: string
  title?: string
  subtitle?: string
  actions?: ReactNode
  noPadding?: boolean
}

export function Card({
  className,
  title,
  subtitle,
  actions,
  noPadding = false,
  children
}: PropsWithChildren<CardProps>) {
  const hasHeader = Boolean(title || subtitle || actions)
  return (
    <section
      className={`bg-surface-card border border-surface-border rounded-card shadow-card hover:shadow-cardHover transition-shadow duration-300 ${className ?? ''}`}
    >
      {hasHeader && (
        <header className="flex items-start justify-between gap-3 px-5 py-4 border-b border-surface-border">
          <div>
            {title && (
              <h3 className="font-display text-base font-semibold text-text">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-text-muted text-xs mt-0.5">{subtitle}</p>
            )}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </header>
      )}
      <div className={noPadding ? '' : 'p-5'}>{children}</div>
    </section>
  )
}
