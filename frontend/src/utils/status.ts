import type { BadgeVariant } from '../components/ui/Badge'
import type { Situacao } from '../types'

export function situacaoToVariant(situacao: Situacao): BadgeVariant {
  switch (situacao) {
    case 'ATIVA':
      return 'ativa'
    case 'CONCLUIDA':
      return 'concluida'
    case 'TRANCADA':
      return 'trancada'
    case 'REPROVADA':
      return 'reprovada'
    default:
      return 'default'
  }
}

export function formatPerfil(p: string | null | undefined): string {
  if (!p) return ''
  return p.charAt(0) + p.slice(1).toLowerCase()
}
