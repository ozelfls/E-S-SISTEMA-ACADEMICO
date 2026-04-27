import { useQuery } from '@tanstack/react-query'
import { listarTurmas } from '../../api/turmas'
import { useAuthStore } from '../../store/authStore'
import { PageHeader } from '../../components/layout/PageHeader'
import { StatCard } from '../../components/ui/StatCard'
import { Card } from '../../components/ui/Card'

export function ProfessorDashboard() {
  const { nome, pessoaId } = useAuthStore()

  const turmas = useQuery({
    queryKey: ['turmas-todas'],
    queryFn: () => listarTurmas()
  })

  const minhasTurmas =
    turmas.data?.filter(t => t.professor?.id === pessoaId) ?? []

  return (
    <>
      <PageHeader
        title={`Bem-vindo(a), Prof. ${nome ?? ''}`}
        subtitle="Painel do professor — turmas, provas e lançamento de notas."
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard
          label="Minhas turmas"
          value={minhasTurmas.length}
          accent="primary"
        />
        <StatCard
          label="Total de turmas"
          value={turmas.data?.length ?? '–'}
          accent="muted"
        />
        <StatCard
          label="Semestre atual"
          value={minhasTurmas[0]?.semestre ?? '—'}
          hint={minhasTurmas[0]?.ano ? String(minhasTurmas[0].ano) : ''}
          accent="success"
        />
      </div>

      <Card>
        <h2 className="font-display text-lg font-semibold mb-2">
          Acesso rápido
        </h2>
        <p className="text-sm text-text-muted">
          Use o menu lateral para acessar "Lançar Notas" e selecionar uma de
          suas turmas.
        </p>
      </Card>
    </>
  )
}
