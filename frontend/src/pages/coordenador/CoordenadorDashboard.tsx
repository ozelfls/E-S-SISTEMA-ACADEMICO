import { useQuery } from '@tanstack/react-query'
import { listarDisciplinas } from '../../api/disciplinas'
import { listarTurmas } from '../../api/turmas'
import { PageHeader } from '../../components/layout/PageHeader'
import { StatCard } from '../../components/ui/StatCard'
import { Card } from '../../components/ui/Card'

export function CoordenadorDashboard() {
  const disciplinas = useQuery({
    queryKey: ['disciplinas'],
    queryFn: () => listarDisciplinas()
  })
  const turmas = useQuery({
    queryKey: ['turmas-todas'],
    queryFn: () => listarTurmas()
  })

  return (
    <>
      <PageHeader
        title="Painel da Coordenação"
        subtitle="Disciplinas, turmas e oferta acadêmica do curso."
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard
          label="Disciplinas"
          value={disciplinas.data?.length ?? '–'}
          accent="primary"
        />
        <StatCard
          label="Turmas"
          value={turmas.data?.length ?? '–'}
          accent="success"
        />
        <StatCard
          label="Vagas totais"
          value={
            turmas.data
              ? turmas.data.reduce((acc, t) => acc + (t.vagas ?? 0), 0)
              : '–'
          }
          accent="muted"
        />
      </div>

      <Card>
        <h2 className="font-display text-lg font-semibold mb-2">Atalhos</h2>
        <p className="text-sm text-text-muted">
          Acesse "Disciplinas" ou "Turmas" no menu lateral para gerenciar a
          oferta.
        </p>
      </Card>
    </>
  )
}
