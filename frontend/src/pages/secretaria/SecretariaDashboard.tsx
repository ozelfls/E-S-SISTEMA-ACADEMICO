import { useQuery } from '@tanstack/react-query'
import { listarAlunos } from '../../api/alunos'
import { listarCursos } from '../../api/cursos'
import { PageHeader } from '../../components/layout/PageHeader'
import { StatCard } from '../../components/ui/StatCard'
import { Card } from '../../components/ui/Card'

export function SecretariaDashboard() {
  const alunos = useQuery({ queryKey: ['alunos'], queryFn: listarAlunos })
  const cursos = useQuery({ queryKey: ['cursos'], queryFn: listarCursos })

  return (
    <>
      <PageHeader
        title="Painel da Secretaria"
        subtitle="Cadastros e gestão acadêmica."
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard
          label="Alunos cadastrados"
          value={alunos.data?.length ?? '–'}
          accent="primary"
        />
        <StatCard
          label="Cursos ativos"
          value={cursos.data?.length ?? '–'}
          accent="success"
        />
        <StatCard label="Pendências" value="—" accent="muted" />
      </div>

      <Card>
        <h2 className="font-display text-lg font-semibold mb-2">
          Acesso rápido
        </h2>
        <p className="text-sm text-text-muted">
          Use "Alunos" no menu lateral para cadastrar e listar alunos.
        </p>
      </Card>
    </>
  )
}
