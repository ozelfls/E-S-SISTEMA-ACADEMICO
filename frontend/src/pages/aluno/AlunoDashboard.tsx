import { useQuery } from '@tanstack/react-query'
import { listarMatriculasAtivas } from '../../api/matriculas'
import { listarHistorico } from '../../api/alunos'
import { useAuthStore } from '../../store/authStore'
import { PageHeader } from '../../components/layout/PageHeader'
import { StatCard } from '../../components/ui/StatCard'
import { Card } from '../../components/ui/Card'

export function AlunoDashboard() {
  const { nome, pessoaId } = useAuthStore()

  const ativas = useQuery({
    queryKey: ['minhas-turmas-ativas', pessoaId],
    queryFn: () => listarMatriculasAtivas(pessoaId!),
    enabled: !!pessoaId
  })

  const historico = useQuery({
    queryKey: ['meu-historico', pessoaId],
    queryFn: () => listarHistorico(pessoaId!),
    enabled: !!pessoaId
  })

  const concluidas =
    historico.data?.filter(m => m.situacao === 'CONCLUIDA').length ?? 0

  return (
    <>
      <PageHeader
        title={`Olá, ${nome ?? 'aluno'}!`}
        subtitle="Acompanhe seu desempenho e suas matrículas no semestre."
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard
          label="Turmas ativas"
          value={ativas.data?.length ?? '–'}
          accent="primary"
        />
        <StatCard
          label="Disciplinas concluídas"
          value={concluidas}
          accent="success"
        />
        <StatCard
          label="Total no histórico"
          value={historico.data?.length ?? '–'}
          accent="muted"
        />
      </div>

      <Card>
        <h2 className="font-display text-lg font-semibold mb-2">
          Próximos passos
        </h2>
        <ul className="text-sm text-text-muted list-disc pl-5 space-y-1">
          <li>Veja as turmas onde você está matriculado em "Matrículas".</li>
          <li>Consulte notas e situações no "Histórico".</li>
        </ul>
      </Card>
    </>
  )
}
