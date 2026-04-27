import { useQuery } from '@tanstack/react-query'
import { listarHistorico } from '../../api/alunos'
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
import { Badge } from '../../components/ui/Badge'
import { Spinner } from '../../components/ui/Spinner'
import { situacaoToVariant } from '../../utils/status'

export function Historico() {
  const pessoaId = useAuthStore(s => s.pessoaId)
  const { data, isLoading } = useQuery({
    queryKey: ['historico', pessoaId],
    queryFn: () => listarHistorico(pessoaId!),
    enabled: !!pessoaId
  })

  return (
    <>
      <PageHeader
        title="Histórico Acadêmico"
        subtitle="Todas as suas matrículas, situações e datas de inscrição."
      />

      {isLoading ? (
        <div className="flex items-center gap-2 text-text-muted">
          <Spinner /> Carregando histórico...
        </div>
      ) : (
        <Table>
          <THead>
            <TR>
              <TH>Disciplina</TH>
              <TH>Turma</TH>
              <TH>Semestre</TH>
              <TH>Situação</TH>
              <TH>Média Final</TH>
              <TH>Frequência</TH>
              <TH>Inscrição</TH>
            </TR>
          </THead>
          <TBody>
            {(!data || data.length === 0) && <EmptyRow colSpan={7} />}
            {data?.map(m => (
              <TR key={m.id}>
                <TD>{m.turma?.disciplina?.nome ?? '–'}</TD>
                <TD>{m.turma?.codigo ?? '–'}</TD>
                <TD>
                  {m.turma?.semestre}/{m.turma?.ano}
                </TD>
                <TD>
                  <Badge variant={situacaoToVariant(m.situacao)}>
                    {m.situacao}
                  </Badge>
                </TD>
                <TD>{m.mediaFinal?.toFixed?.(2) ?? '–'}</TD>
                <TD>{m.frequencia?.toFixed?.(1) ?? '0.0'}%</TD>
                <TD>{m.dtInscricao}</TD>
              </TR>
            ))}
          </TBody>
        </Table>
      )}
    </>
  )
}
