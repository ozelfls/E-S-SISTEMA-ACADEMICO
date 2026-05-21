import { Button } from './Button'

interface PaginationProps {
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
}

export function Pagination({
  page,
  pageSize,
  total,
  onPageChange
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const safePage = Math.min(Math.max(page, 1), totalPages)
  const start = total === 0 ? 0 : (safePage - 1) * pageSize + 1
  const end = Math.min(total, safePage * pageSize)

  if (total <= pageSize) {
    return (
      <p className="mt-3 text-xs text-text-muted">
        {total} registro{total === 1 ? '' : 's'} encontrado{total === 1 ? '' : 's'}.
      </p>
    )
  }

  return (
    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs text-text-muted">
        Mostrando {start}-{end} de {total} registros
      </p>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={safePage <= 1}
          onClick={() => onPageChange(safePage - 1)}
        >
          Anterior
        </Button>
        <span className="min-w-20 text-center text-xs font-semibold text-text">
          {safePage} / {totalPages}
        </span>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={safePage >= totalPages}
          onClick={() => onPageChange(safePage + 1)}
        >
          Proxima
        </Button>
      </div>
    </div>
  )
}
