import { useQuery } from '@tanstack/react-query'
import { listarCursos } from '../../api/cursos'
import { listarDisciplinas } from '../../api/disciplinas'
import { listarProfessores } from '../../api/professores'
import { PageHeader } from '../../components/layout/PageHeader'
import { StatCard } from '../../components/ui/StatCard'
import { Card } from '../../components/ui/Card'

export function DiretorDashboard() {
  const cursos = useQuery({ queryKey: ['cursos'], queryFn: listarCursos })
  const disciplinas = useQuery({
    queryKey: ['disciplinas'],
    queryFn: () => listarDisciplinas()
  })
  const professores = useQuery({
    queryKey: ['professores'],
    queryFn: listarProfessores
  })

  return (
    <>
      <PageHeader
        title="Painel da Direção"
        subtitle="Visão geral do programa acadêmico."
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard
          label="Cursos"
          value={cursos.data?.length ?? '–'}
          accent="primary"
        />
        <StatCard
          label="Disciplinas"
          value={disciplinas.data?.length ?? '–'}
          accent="success"
        />
        <StatCard
          label="Professores"
          value={professores.data?.length ?? '–'}
          accent="muted"
        />
      </div>

      <Card>
        <h2 className="font-display text-lg font-semibold mb-2">
          Indicadores estratégicos
        </h2>
        <p className="text-sm text-text-muted">
          Acesse "Cursos" para criar novos cursos e nomear coordenadores.
        </p>
      </Card>
    </>
  )
}
