import type { ReactNode } from 'react'

interface StatCardProps {
  label: string
  value: ReactNode
  hint?: string
  accent?: 'primary' | 'success' | 'muted'
}

const ACCENT_BAR: Record<NonNullable<StatCardProps['accent']>, string> = {
  primary: 'bg-primary',
  success: 'bg-success',
  muted: 'bg-surface-border'
}

export function StatCard({
  label,
  value,
  hint,
  accent = 'primary'
}: StatCardProps) {
  return (
    <div className="relative overflow-hidden bg-surface-card border border-surface-border rounded-card p-5 shadow-sm">
      <span
        aria-hidden
        className={`absolute left-0 top-0 bottom-0 w-1 ${ACCENT_BAR[accent]}`}
      />
      <p className="text-text-muted text-xs uppercase tracking-wide font-semibold">
        {label}
      </p>
      <p className="font-display text-3xl font-bold text-text mt-2">{value}</p>
      {hint && <p className="text-text-muted text-xs mt-1">{hint}</p>}
    </div>
  )
}
