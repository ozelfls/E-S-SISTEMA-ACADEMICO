import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Combobox } from '../ui/Combobox'
import { Spinner } from '../ui/Spinner'
import { listarProfessores } from '../../api/professores'
import { alocarProfessor } from '../../api/turmas'
import type { Turma } from '../../types'

interface AlocarProfessorModalProps {
  open: boolean
  onClose: () => void
  turmaId: number
  turmaCodigo: string
  currentProfessorId: number | null
  onSuccess?: (turma: Turma) => void
}

export function AlocarProfessorModal({
  open,
  onClose,
  turmaId,
  turmaCodigo,
  currentProfessorId,
  onSuccess
}: AlocarProfessorModalProps) {
  const [selected, setSelected] = useState<number | null>(currentProfessorId)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setSelected(currentProfessorId)
      setErrorMsg(null)
    }
  }, [open, currentProfessorId])

  const professores = useQuery({
    queryKey: ['professores'],
    queryFn: listarProfessores
  })

  const options = useMemo(
    () =>
      (professores.data ?? []).map(p => ({
        id: p.id,
        label: p.nome,
        sublabel: p.registro ?? p.email ?? undefined
      })),
    [professores.data]
  )

  const mutation = useMutation({
    mutationFn: (professorId: number | null) =>
      alocarProfessor(turmaId, professorId),
    onSuccess: turma => {
      onSuccess?.(turma)
      onClose()
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      setErrorMsg(
        err?.response?.data?.message ?? 'Erro ao alocar professor.'
      )
    }
  })

  const handleSalvar = () => {
    setErrorMsg(null)
    mutation.mutate(selected)
  }

  const handleDesalocar = () => {
    setErrorMsg(null)
    mutation.mutate(null)
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="md"
      title={`Alocar professor — ${turmaCodigo}`}
    >
      <div className="flex flex-col gap-4">
        {professores.isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Spinner />
          </div>
        ) : (
          <Combobox
            label="Professor"
            placeholder="Pesquisar professor..."
            value={selected}
            onChange={setSelected}
            options={options}
            emptyMessage="Nenhum professor encontrado."
            size="md"
          />
        )}

        {errorMsg && (
          <div className="bg-primary-light border border-primary text-primary-dark rounded-card px-4 py-3 text-sm">
            {errorMsg}
          </div>
        )}

        <div className="flex items-center justify-between gap-2 pt-2 border-t border-surface-border">
          <Button
            type="button"
            variant="ghost"
            onClick={handleDesalocar}
            disabled={mutation.isPending || currentProfessorId == null}
            className="text-primary hover:bg-primary-light"
          >
            Desalocar
          </Button>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={mutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleSalvar}
              loading={mutation.isPending}
              disabled={selected == null}
            >
              Salvar
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  )
}
