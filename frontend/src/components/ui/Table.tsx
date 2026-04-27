import type { PropsWithChildren, ReactNode } from 'react'

export function Table({ children }: PropsWithChildren) {
  return (
    <div className="overflow-x-auto rounded-card border border-surface-border bg-white shadow-card scrollbar-thin">
      <table className="min-w-full text-left text-sm">{children}</table>
    </div>
  )
}

export function THead({ children }: PropsWithChildren) {
  return (
    <thead className="bg-surface text-text-muted text-xs uppercase tracking-wide border-b border-surface-border">
      {children}
    </thead>
  )
}

export function TH({ children }: PropsWithChildren) {
  return <th className="px-4 py-3 font-semibold">{children}</th>
}

export function TBody({ children }: PropsWithChildren) {
  return (
    <tbody className="divide-y divide-surface-border bg-white">{children}</tbody>
  )
}

export function TR({ children }: PropsWithChildren) {
  return (
    <tr className="hover:bg-surface transition-colors">
      {children}
    </tr>
  )
}

export function TD({ children }: PropsWithChildren) {
  return <td className="px-4 py-3 text-text align-middle">{children}</td>
}

interface EmptyRowProps {
  colSpan: number
  children?: ReactNode
}

export function EmptyRow({
  colSpan,
  children = 'Nenhum registro encontrado.'
}: EmptyRowProps) {
  return (
    <tr>
      <td
        className="px-4 py-10 text-center text-text-muted"
        colSpan={colSpan}
      >
        {children}
      </td>
    </tr>
  )
}
