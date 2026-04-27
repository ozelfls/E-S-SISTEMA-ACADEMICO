import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { listarCursos } from '../../api/cursos'
import { listarDisciplinas } from '../../api/disciplinas'
import { listarTurmas } from '../../api/turmas'
import { listarAlunos } from '../../api/alunos'
import { PageHeader } from '../../components/layout/PageHeader'
import { StatCard } from '../../components/ui/StatCard'
import { Card } from '../../components/ui/Card'
import { Spinner } from '../../components/ui/Spinner'
import { Button } from '../../components/ui/Button'
import { useAuthStore } from '../../store/authStore'

export function AdminDashboard() {
  const nome = useAuthStore(s => s.nome)

  const cursos = useQuery({ queryKey: ['cursos'], queryFn: listarCursos })
  const disciplinas = useQuery({
    queryKey: ['disciplinas'],
    queryFn: () => listarDisciplinas()
  })
  const turmas = useQuery({
    queryKey: ['turmas-todas'],
    queryFn: () => listarTurmas()
  })
  const alunos = useQuery({ queryKey: ['alunos'], queryFn: listarAlunos })

  const renderValue = (q: { isLoading: boolean; data?: unknown[] }) =>
    q.isLoading ? <Spinner /> : (q.data?.length ?? 0)

  const ultimasTurmas = (turmas.data ?? []).slice(0, 5)

  return (
    <>
      <PageHeader
        title={`Bem-vindo, ${nome ?? 'Admin'}`}
        subtitle="Painel administrativo do sistema acadêmico."
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Cursos" value={renderValue(cursos)} accent="primary" />
        <StatCard
          label="Disciplinas"
          value={renderValue(disciplinas)}
          accent="success"
        />
        <StatCard label="Turmas" value={renderValue(turmas)} accent="primary" />
        <StatCard label="Alunos" value={renderValue(alunos)} accent="success" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Atalhos" subtitle="Acesso rápido às áreas de gestão">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link to="/admin/disciplinas">
              <Button fullWidth>Disciplinas</Button>
            </Link>
            <Link to="/admin/professores">
              <Button fullWidth>Professores</Button>
            </Link>
            <Link to="/admin/turmas">
              <Button fullWidth>Turmas</Button>
            </Link>
            <Link to="/admin/alunos">
              <Button fullWidth>Alunos</Button>
            </Link>
            <Link to="/admin/cursos" className="sm:col-span-2">
              <Button fullWidth variant="secondary">
                Cursos
              </Button>
            </Link>
          </div>
        </Card>

        <Card title="Últimas turmas" subtitle="As 5 turmas mais recentes">
          {turmas.isLoading ? (
            <div className="flex items-center gap-2 text-text-muted">
              <Spinner /> Carregando...
            </div>
          ) : ultimasTurmas.length === 0 ? (
            <p className="text-text-muted text-sm">Nenhuma turma cadastrada.</p>
          ) : (
            <ul className="divide-y divide-surface-border">
              {ultimasTurmas.map(t => (
                <li
                  key={t.id}
                  className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                >
                  <div>
                    <p className="text-sm font-semibold text-text">{t.codigo}</p>
                    <p className="text-xs text-text-muted">
                      {t.semestre}/{t.ano}
                      {t.disciplina?.nome ? ` · ${t.disciplina.nome}` : ''}
                    </p>
                  </div>
                  <span className="text-xs font-medium text-primary-dark bg-primary-light px-2.5 py-1 rounded-full">
                    {t.vagas} vagas
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  )
}
