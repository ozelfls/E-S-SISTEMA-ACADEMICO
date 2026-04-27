import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { listarTurmas } from '../../api/turmas'
import { listarMatriculasAtivas, matricular } from '../../api/matriculas'
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
import { useToast } from '../../hooks/useToast'

export function Matriculas() {
  const pessoaId = useAuthStore(s => s.pessoaId)
  const qc = useQueryClient()
  const { showError, showSuccess } = useToast()

  const turmas = useQuery({
    queryKey: ['turmas-disponiveis'],
    queryFn: () => listarTurmas()
  })

  const ativas = useQuery({
    queryKey: ['turmas-ativas', pessoaId],
    queryFn: () => listarMatriculasAtivas(pessoaId!),
    enabled: !!pessoaId
  })

  const mutation = useMutation({
    mutationFn: (turmaId: number) => matricular(pessoaId!, turmaId),
    onSuccess: () => {
      showSuccess('Matrícula realizada com sucesso.')
      qc.invalidateQueries({ queryKey: ['turmas-ativas'] })
      qc.invalidateQueries({ queryKey: ['turmas-disponiveis'] })
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      showError(err?.response?.data?.message ?? 'Não foi possível matricular.')
    }
  })

  const idsAtivas = new Set(ativas.data?.map(m => m.turma?.id) ?? [])
  const isLoading = turmas.isLoading || ativas.isLoading

  return (
    <>
      <PageHeader
        title="Matrículas"
        subtitle="Veja as turmas disponíveis no semestre e realize sua matrícula."
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
              <TH>Horário</TH>
              <TH>Vagas</TH>
              <TH>Status</TH>
              <TH>Ação</TH>
            </TR>
          </THead>
          <TBody>
            {(!turmas.data || turmas.data.length === 0) && (
              <EmptyRow colSpan={7}>Nenhuma turma disponível.</EmptyRow>
            )}
            {turmas.data?.map(t => {
              const matriculado = idsAtivas.has(t.id)
              const semVagas = t.vagas <= 0
              return (
                <TR key={t.id}>
                  <TD>{t.disciplina?.nome ?? '–'}</TD>
                  <TD>{t.codigo}</TD>
                  <TD>{t.professor?.nome ?? '–'}</TD>
                  <TD>{t.horario ?? '–'}</TD>
                  <TD>{t.vagas}</TD>
                  <TD>
                    {matriculado ? (
                      <Badge variant="ativa">Matriculado</Badge>
                    ) : semVagas ? (
                      <Badge variant="trancada">Sem vaga</Badge>
                    ) : (
                      <Badge variant="default">Disponível</Badge>
                    )}
                  </TD>
                  <TD>
                    <Button
                      variant="primary"
                      disabled={matriculado || semVagas || mutation.isPending}
                      onClick={() => mutation.mutate(t.id)}
                    >
                      Matricular
                    </Button>
                  </TD>
                </TR>
              )
            })}
          </TBody>
        </Table>
      )}
    </>
  )
}
