import { useQuery } from '@tanstack/react-query'
import { listarDisciplinas } from '../../api/disciplinas'
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
import { Spinner } from '../../components/ui/Spinner'
import { Badge } from '../../components/ui/Badge'

export function Disciplinas() {
  const { data, isLoading } = useQuery({
    queryKey: ['disciplinas'],
    queryFn: () => listarDisciplinas()
  })

  return (
    <>
      <PageHeader
        title="Disciplinas"
        subtitle="Catálogo de disciplinas oferecidas pelo curso."
      />

      {isLoading ? (
        <div className="flex items-center gap-2 text-text-muted">
          <Spinner /> Carregando disciplinas...
        </div>
      ) : (
        <Table>
          <THead>
            <TR>
              <TH>Código</TH>
              <TH>Nome</TH>
              <TH>Créditos</TH>
              <TH>CH</TH>
              <TH>Pré-requisito</TH>
            </TR>
          </THead>
          <TBody>
            {(!data || data.length === 0) && <EmptyRow colSpan={5} />}
            {data?.map(d => (
              <TR key={d.id}>
                <TD>{d.codigo}</TD>
                <TD>{d.nome}</TD>
                <TD>{d.creditos}</TD>
                <TD>{d.ch}h</TD>
                <TD>
                  {d.preRequisito ? (
                    <Badge variant="default">{d.preRequisito.codigo}</Badge>
                  ) : (
                    <span className="text-text-muted text-xs">—</span>
                  )}
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      )}
    </>
  )
}
