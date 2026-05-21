import { useMemo, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { listarTurmas } from '../../api/turmas'
import {
  analisarMatricula,
  listarMatriculasAtivas,
  matricular,
  type MatriculaWorkflow
} from '../../api/matriculas'
import { useAuthStore } from '../../store/authStore'
import { PageHeader } from '../../components/layout/PageHeader'
import {
  EmptyRow,
  TBody,
  TD,
  TH,
  THead,
  TR,
  Table
} from '../../components/ui/Table'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Spinner } from '../../components/ui/Spinner'
import { Modal } from '../../components/ui/Modal'
import { useToast } from '../../hooks/useToast'
import type { Turma } from '../../types'

function WorkflowTimeline({ data }: { data?: MatriculaWorkflow }) {
  if (!data) {
    return (
      <div className="flex items-center gap-2 text-sm text-text-muted">
        <Spinner /> Checando regras academicas...
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div
        className={`rounded-card border px-3 py-2 text-sm ${
          data.podeMatricular
            ? 'border-success bg-success-light text-success-dark'
            : 'border-warning bg-warning-light text-warning-dark'
        }`}
      >
        {data.resumo}
      </div>
      <div className="relative space-y-3 before:absolute before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-surface-border">
        {data.etapas.map((etapa, index) => {
          const ok = etapa.status === 'OK'
          return (
            <div
              key={etapa.chave}
              className="relative grid grid-cols-[34px_1fr] gap-3"
              style={{ animation: 'workflowStepIn 220ms ease-out both', animationDelay: `${index * 70}ms` }}
            >
              <span
                className={`z-10 grid h-8 w-8 place-items-center rounded-full border text-xs font-bold ${
                  ok
                    ? 'border-success bg-success text-white'
                    : 'border-warning bg-warning text-white'
                }`}
              >
                {ok ? '✓' : '!'}
              </span>
              <div className="rounded-card border border-surface-border bg-surface px-3 py-2">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-text">{etapa.titulo}</p>
                  <Badge variant={ok ? 'success' : 'warning'}>{ok ? 'OK' : 'Atenção'}</Badge>
                </div>
                <p className="mt-1 text-xs text-text-muted">{etapa.detalhe}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function Matriculas() {
  const pessoaId = useAuthStore(s => s.pessoaId)
  const qc = useQueryClient()
  const { showError, showSuccess } = useToast()
  const [turmaSelecionada, setTurmaSelecionada] = useState<Turma | null>(null)

  const turmas = useQuery({
    queryKey: ['turmas-disponiveis'],
    queryFn: () => listarTurmas()
  })

  const ativas = useQuery({
    queryKey: ['turmas-ativas', pessoaId],
    queryFn: () => listarMatriculasAtivas(pessoaId!),
    enabled: !!pessoaId
  })

  const analise = useQuery({
    queryKey: ['matricula-analise', pessoaId, turmaSelecionada?.id],
    queryFn: () => analisarMatricula(pessoaId!, turmaSelecionada!.id),
    enabled: !!pessoaId && !!turmaSelecionada
  })

  const mutation = useMutation({
    mutationFn: (turmaId: number) => matricular(pessoaId!, turmaId),
    onSuccess: () => {
      showSuccess('Matricula realizada com sucesso.')
      setTurmaSelecionada(null)
      qc.invalidateQueries({ queryKey: ['turmas-ativas'] })
      qc.invalidateQueries({ queryKey: ['turmas-disponiveis'] })
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      showError(err?.response?.data?.message ?? 'Nao foi possivel matricular.')
      qc.invalidateQueries({ queryKey: ['matricula-analise'] })
    }
  })

  const idsAtivas = useMemo(
    () => new Set(ativas.data?.map(m => m.turma?.id) ?? []),
    [ativas.data]
  )
  const isLoading = turmas.isLoading || ativas.isLoading

  return (
    <>
      <PageHeader
        title="Matriculas"
        subtitle="Confira as turmas disponiveis, veja a pre-checagem e confirme sua matricula."
      />

      {isLoading ? (
        <div className="flex items-center gap-2 text-text-muted">
          <Spinner /> Carregando turmas...
        </div>
      ) : (
        <Table>
          <THead>
            <TR>
              <TH>Disciplina</TH>
              <TH>Turma</TH>
              <TH>Professor</TH>
              <TH>Horario</TH>
              <TH>Vagas</TH>
              <TH>Status</TH>
              <TH>Acao</TH>
            </TR>
          </THead>
          <TBody>
            {(!turmas.data || turmas.data.length === 0) && (
              <EmptyRow colSpan={7}>Nenhuma turma disponivel.</EmptyRow>
            )}
            {turmas.data?.map(t => {
              const matriculado = idsAtivas.has(t.id)
              const semVagas = t.vagas <= 0
              return (
                <TR key={t.id}>
                  <TD>{t.disciplina?.nome ?? '-'}</TD>
                  <TD>{t.codigo}</TD>
                  <TD>{t.professor?.nome ?? '-'}</TD>
                  <TD>{t.horario ?? '-'}</TD>
                  <TD>{t.vagas}</TD>
                  <TD>
                    {matriculado ? (
                      <Badge variant="ativa">Matriculado</Badge>
                    ) : semVagas ? (
                      <Badge variant="trancada">Sem vaga</Badge>
                    ) : (
                      <Badge variant="default">Disponivel</Badge>
                    )}
                  </TD>
                  <TD>
                    <Button
                      variant="primary"
                      disabled={matriculado || mutation.isPending}
                      onClick={() => setTurmaSelecionada(t)}
                    >
                      Verificar
                    </Button>
                  </TD>
                </TR>
              )
            })}
          </TBody>
        </Table>
      )}

      <Modal
        open={!!turmaSelecionada}
        onClose={() => setTurmaSelecionada(null)}
        title="Pre-checagem da matricula"
        size="lg"
      >
        <div className="space-y-5">
          {turmaSelecionada && (
            <div className="grid gap-3 rounded-card border border-surface-border bg-surface p-3 md:grid-cols-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">Turma</p>
                <p className="font-semibold text-text">{turmaSelecionada.codigo}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">Disciplina</p>
                <p className="truncate font-semibold text-text">{turmaSelecionada.disciplina?.nome ?? '-'}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">Horario</p>
                <p className="font-semibold text-text">{turmaSelecionada.horario ?? '-'}</p>
              </div>
            </div>
          )}

          {analise.isError ? (
            <div className="rounded-card border border-primary bg-primary-light px-3 py-2 text-sm text-primary-dark">
              Nao foi possivel checar esta turma agora. Tente novamente em instantes.
            </div>
          ) : (
            <WorkflowTimeline data={analise.data} />
          )}

          <div className="flex justify-end gap-2 border-t border-surface-border pt-4">
            <Button type="button" variant="secondary" onClick={() => setTurmaSelecionada(null)}>
              Cancelar
            </Button>
            <Button
              type="button"
              disabled={!analise.data?.podeMatricular || !turmaSelecionada}
              loading={mutation.isPending}
              onClick={() => turmaSelecionada && mutation.mutate(turmaSelecionada.id)}
            >
              Confirmar matricula
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
