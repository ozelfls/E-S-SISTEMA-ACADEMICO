import type { PropsWithChildren } from 'react'

export type BadgeVariant =
  | 'success'
  | 'danger'
  | 'warning'
  | 'neutral'
  | 'ativa'
  | 'concluida'
  | 'trancada'
  | 'reprovada'
  | 'default'

interface BadgeProps {
  variant?: BadgeVariant
}

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  success: 'bg-success-light text-success-dark',
  danger: 'bg-primary-light text-primary-dark',
  warning: 'bg-warning-light text-warning-dark',
  neutral: 'bg-surface text-text-muted border border-surface-border',
  ativa: 'bg-success-light text-success-dark',
  concluida: 'bg-success-light text-success-dark',
  trancada: 'bg-warning-light text-warning-dark',
  reprovada: 'bg-primary-light text-primary-dark font-bold',
  default: 'bg-surface text-text-muted border border-surface-border'
}

export function Badge({
  variant = 'default',
  children
}: PropsWithChildren<BadgeProps>) {
  const base =
    'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium'
  return (
    <span className={`${base} ${VARIANT_CLASSES[variant]}`}>{children}</span>
  )
}
