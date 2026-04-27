import type { PropsWithChildren } from 'react'

interface ModalProps extends PropsWithChildren {
  open: boolean
  onClose: () => void
  title?: string
  size?: 'sm' | 'md' | 'lg'
}

const SIZE_CLASS: Record<NonNullable<ModalProps['size']>, string> = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl'
}

export function Modal({
  open,
  onClose,
  title,
  size = 'md',
  children
}: ModalProps) {
  if (!open) return null
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 grid place-items-center bg-black/30 backdrop-blur-sm p-4"
      style={{ animation: 'backdropIn 160ms ease-out' }}
    >
      <div
        onClick={e => e.stopPropagation()}
        className={`relative bg-surface-card w-full ${SIZE_CLASS[size]} rounded-card shadow-cardHover border border-surface-border`}
        style={{ animation: 'modalIn 180ms cubic-bezier(0.16, 1, 0.3, 1)' }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar"
          className="absolute top-3 right-3 grid place-items-center w-8 h-8 rounded-full text-text-muted hover:bg-surface hover:text-text transition-colors"
        >
          <span aria-hidden className="text-xl leading-none">&times;</span>
        </button>
        {title && (
          <div className="px-6 pt-5 pb-3 border-b border-surface-border">
            <h3 className="font-display text-lg font-semibold text-text pr-8">
              {title}
            </h3>
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}
