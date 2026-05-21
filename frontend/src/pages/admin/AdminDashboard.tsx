import { type CSSProperties, type ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { buscarAdminDashboardResumo } from '../../api/dashboard'
import { PageHeader } from '../../components/layout/PageHeader'
import { Card } from '../../components/ui/Card'
import { Spinner } from '../../components/ui/Spinner'
import { useAuthStore } from '../../store/authStore'

type BarItem = {
  label: string
  value: number
  href?: string
  tone?: 'primary' | 'success' | 'warning' | 'neutral'
}

const toneClasses: Record<NonNullable<BarItem['tone']>, string> = {
  primary: 'bg-rose-400',
  success: 'bg-success',
  warning: 'bg-warning',
  neutral: 'bg-slate-400'
}

const PIE_COLORS = [
  '#2563EB',
  '#DC2626',
  '#16A34A',
  '#D97706',
  '#7C3AED',
  '#0891B2',
  '#DB2777',
  '#65A30D',
  '#EA580C',
  '#4F46E5',
  '#0D9488',
  '#BE123C',
  '#9333EA',
  '#0284C7',
  '#84CC16',
  '#F59E0B'
]

function pieColor(index: number) {
  if (index < PIE_COLORS.length) return PIE_COLORS[index]
  const hue = (index * 137.508) % 360
  return `hsl(${hue.toFixed(0)} 72% 45%)`
}

function DashboardPanel({
  title,
  children,
  className = ''
}: {
  title: string
  children: ReactNode
  className?: string
}) {
  return (
    <section className={`rounded-card border border-surface-border bg-surface-card p-4 shadow-sm ${className}`}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-text">{title}</h2>
      </div>
      {children}
    </section>
  )
}

export function AdminDashboard() {
  const { nome, perfil } = useAuthStore()

  const resumo = useQuery({
    queryKey: ['dashboard', 'admin-resumo'],
    queryFn: buscarAdminDashboardResumo
  })

  const isLoading = resumo.isLoading
  const hasError = resumo.isError
  const data = resumo.data
  const metricas = data?.metricas

  const alunosPorCurso = data?.alunosPorCurso ?? []
  const turmasPorTurno = data?.turmasPorTurno ?? []
  const turmasPorStatus = data?.turmasPorStatus ?? []
  const disciplinasPorCurso = data?.disciplinasPorCurso ?? []
  const alunosRisco = data?.alunosRisco ?? []
  const pendenciasNotas = data?.pendenciasNotas ?? []
  const ocupacaoTurmas = data?.ocupacaoTurmas ?? []
  const maxCurso = Math.max(...alunosPorCurso.map(item => item.value), 1)
  const maxTurno = Math.max(...turmasPorTurno.map(item => item.value), 1)
  const maxDisciplina = Math.max(...disciplinasPorCurso.map(item => item.value), 1)
  const totalAlunos = metricas?.totalAlunos ?? 0
  const pieSegments = alunosPorCurso.reduce(
    (acc, item, index) => {
      const start = totalAlunos ? (acc.total / totalAlunos) * 100 : 0
      const nextTotal = acc.total + item.value
      const end = totalAlunos ? (nextTotal / totalAlunos) * 100 : 0
      acc.parts.push(`${pieColor(index)} ${start}% ${end}%`)
      acc.total = nextTotal
      return acc
    },
    { total: 0, parts: [] as string[] }
  )
  const pieStyle: CSSProperties = {
    background: pieSegments.parts.length
      ? `conic-gradient(${pieSegments.parts.join(', ')})`
      : 'conic-gradient(#e5e7eb 0% 100%)'
  }

  const kpis = [
    {
      label: 'Alunos',
      value: metricas?.totalAlunos ?? 0,
      href: '/admin/alunos',
      tone: 'primary' as const
    },
    {
      label: 'Matriculas',
      value: metricas?.totalMatriculas ?? 0,
      href: '/admin/matriculas',
      tone: 'success' as const
    },
    {
      label: 'Turmas',
      value: metricas?.totalTurmas ?? 0,
      href: '/admin/turmas',
      tone: (data?.turmasSemProfessor ?? 0) > 0 ? ('warning' as const) : ('primary' as const)
    },
    {
      label: 'Professores',
      value: metricas?.totalProfessores ?? 0,
      href: '/admin/professores',
      tone: 'neutral' as const
    },
    {
      label: 'Provas',
      value: metricas?.totalProvas ?? 0,
      href: '/admin/provas',
      tone: 'primary' as const
    },
    {
      label: 'Pendencias',
      value: pendenciasNotas.reduce((sum, item) => sum + item.resultadosSemNota, 0),
      href: '/admin/provas',
      tone: pendenciasNotas.length > 0 ? ('warning' as const) : ('success' as const)
    }
  ]

  return (
    <>
      <PageHeader title="Dashboard" subtitle={nome ? `${nome} - ${perfil ?? 'ADMIN'}` : perfil ?? 'ADMIN'} />

      {isLoading ? (
        <Card>
          <div className="flex items-center gap-2 text-text-muted">
            <Spinner /> Carregando indicadores...
          </div>
        </Card>
      ) : hasError ? (
        <Card>
          <div className="flex flex-col gap-2 text-sm">
            <p className="font-semibold text-text">
              Nao foi possivel carregar todos os indicadores.
            </p>
            <p className="text-text-muted">
              Recarregue a pagina ou confira se backend e banco estao ativos antes
              de usar os numeros da dashboard.
            </p>
          </div>
        </Card>
      ) : (
        <>
          <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
            {kpis.map(kpi => (
              <Link
                key={kpi.label}
                to={kpi.href}
                className="rounded-card border border-surface-border bg-surface-card px-4 py-3 shadow-sm transition hover:border-primary/40 hover:shadow-cardHover"
              >
                <div className={`mb-3 h-1.5 rounded-full ${toneClasses[kpi.tone]}`} />
                <p className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">
                  {kpi.label}
                </p>
                <p className="mt-1 font-display text-3xl font-bold text-text">{kpi.value}</p>
              </Link>
            ))}
          </div>

          <div className="mb-5 grid grid-cols-1 gap-5 xl:grid-cols-[1.15fr_0.85fr]">
            <DashboardPanel title="Alunos por curso" className="min-h-[360px]">
              <div className="grid gap-6 lg:grid-cols-[260px_1fr] lg:items-center">
                <div className="mx-auto grid h-64 w-64 place-items-center rounded-full bg-surface shadow-inner">
                  <div
                    className="chart-pie-reveal grid h-56 w-56 place-items-center rounded-full"
                    style={pieStyle}
                  >
                    <div className="grid h-28 w-28 place-items-center rounded-full bg-surface-card text-center shadow-sm">
                      <span className="block font-display text-3xl font-bold text-text">{totalAlunos}</span>
                      <span className="block text-[11px] font-semibold uppercase tracking-wide text-text-muted">
                        alunos
                      </span>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  {alunosPorCurso.slice(0, 7).map((item, index) => (
                    <Link
                      key={item.label}
                      to={`/admin/alunos?curso=${encodeURIComponent(item.label)}`}
                      className="grid grid-cols-[12px_1fr_44px] items-center gap-3"
                    >
                      <span
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: pieColor(index) }}
                      />
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold text-text">{item.label}</span>
                        <span className="block h-1.5 overflow-hidden rounded-full bg-surface">
                          <span
                            className="block h-full rounded-full"
                            style={{
                              width: `${Math.max((item.value / maxCurso) * 100, 5)}%`,
                              backgroundColor: pieColor(index)
                            }}
                          />
                        </span>
                      </span>
                      <span className="text-right text-sm font-bold text-text-muted">{item.value}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </DashboardPanel>

            <DashboardPanel title="Oferta academica" className="min-h-[360px]">
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-card bg-surface px-3 py-2">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">Vagas</p>
                  <p className="text-2xl font-bold text-text">{data?.vagasTotais ?? 0}</p>
                </div>
                <div className="rounded-card bg-surface px-3 py-2">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">Noite</p>
                  <p className="text-2xl font-bold text-text">{data?.turmasNoturnas ?? 0}</p>
                </div>
                <div className="rounded-card bg-surface px-3 py-2">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">Email</p>
                  <p className="text-2xl font-bold text-text">{data?.alunosSemEmail ?? 0}</p>
                </div>
              </div>

              <div className="mt-5 space-y-5">
                <div>
                  <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-text-muted">
                    <span>Turnos</span>
                    <span>{metricas?.totalTurmas ?? 0}</span>
                  </div>
                  <div className="space-y-3">
                    {turmasPorTurno.map((item, index) => (
                      <Link
                        key={item.label}
                        to={`/admin/turmas?turno=${encodeURIComponent(item.label)}`}
                        className="grid grid-cols-[86px_1fr_42px] items-center gap-3 text-sm"
                      >
                        <span className="font-medium text-text">{item.label}</span>
                        <span className="h-3 overflow-hidden rounded-full bg-surface">
                          <span
                            className={`chart-bar-fill block h-full rounded-full ${
                              item.label === 'NOITE' ? 'bg-warning' : 'bg-success'
                            }`}
                            style={{
                              width: `${Math.max((item.value / maxTurno) * 100, 6)}%`,
                              animationDelay: `${index * 70}ms`
                            }}
                          />
                        </span>
                        <span className="text-right font-bold text-text-muted">{item.value}</span>
                      </Link>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-text-muted">
                    <span>Status</span>
                    <span>{turmasPorStatus.length}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {turmasPorStatus.slice(0, 4).map(item => (
                      <Link
                        key={item.label}
                        to={`/admin/turmas?status=${encodeURIComponent(item.label)}`}
                        className="rounded-card border border-surface-border px-3 py-2 transition hover:border-primary/40"
                      >
                        <span className="block truncate text-xs font-semibold uppercase tracking-wide text-text-muted">
                          {item.label}
                        </span>
                        <span className="font-display text-2xl font-bold text-text">{item.value}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </DashboardPanel>
          </div>

          <div className="grid grid-cols-1 gap-5 xl:grid-cols-[0.75fr_1.25fr]">
            <DashboardPanel title="Alertas">
              <div className="grid grid-cols-3 gap-2">
                <Link to="/admin/turmas" className="rounded-card bg-warning-light px-3 py-3 text-warning-dark">
                  <p className="text-[11px] font-bold uppercase tracking-wide">Sem prof.</p>
                  <p className="text-2xl font-bold">{data?.turmasSemProfessor ?? 0}</p>
                </Link>
                <Link to="/admin/cursos" className="rounded-card bg-warning-light px-3 py-3 text-warning-dark">
                  <p className="text-[11px] font-bold uppercase tracking-wide">Sem coord.</p>
                  <p className="text-2xl font-bold">{data?.cursosSemCoordenador ?? 0}</p>
                </Link>
                <Link to="/admin/explorar" className="rounded-card bg-primary-light px-3 py-3 text-primary-dark">
                  <p className="text-[11px] font-bold uppercase tracking-wide">Risco</p>
                  <p className="text-2xl font-bold">{alunosRisco.length}</p>
                </Link>
              </div>

              <div className="mt-4 divide-y divide-surface-border">
                {pendenciasNotas.slice(0, 5).map(item => (
                  <Link
                    key={`${item.provaId}-${item.turmaId}`}
                    to="/admin/provas"
                    className="grid grid-cols-[1fr_auto] gap-3 py-2.5"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-text">{item.provaCodigo}</span>
                      <span className="block truncate text-xs text-text-muted">{item.turmaCodigo}</span>
                    </span>
                    <span className="rounded-full bg-primary-light px-2 py-1 text-xs font-bold text-primary-dark">
                      {item.resultadosSemNota}
                    </span>
                  </Link>
                ))}
                {pendenciasNotas.length === 0 && (
                  <p className="py-4 text-sm text-text-muted">Sem pendencias de notas.</p>
                )}
              </div>
            </DashboardPanel>

            <DashboardPanel title="Turmas e disciplinas">
              <div className="grid gap-5 lg:grid-cols-2">
                <div className="space-y-3">
                  {ocupacaoTurmas.slice(0, 6).map((item, index) => (
                    <Link key={item.turmaId} to={`/admin/turmas?turma=${item.turmaCodigo}`} className="block">
                      <div className="mb-1 flex items-center justify-between gap-2 text-xs">
                        <span className="truncate font-semibold text-text">{item.turmaCodigo}</span>
                        <span className="font-bold text-text-muted">{item.ocupacao.toFixed(0)}%</span>
                      </div>
                      <div className="h-2.5 overflow-hidden rounded-full bg-surface">
                        <span
                          className={`chart-bar-fill block h-full rounded-full ${
                            item.ocupacao >= 90 ? 'bg-warning' : 'bg-success'
                          }`}
                          style={{
                            width: `${Math.max(item.ocupacao, 5)}%`,
                            animationDelay: `${index * 55}ms`
                          }}
                        />
                      </div>
                    </Link>
                  ))}
                </div>

                <div className="space-y-3">
                  {disciplinasPorCurso.slice(0, 6).map((item, index) => (
                    <Link
                      key={item.label}
                      to={`/admin/cursos?curso=${encodeURIComponent(item.label)}`}
                      className="grid grid-cols-[1fr_42px] items-center gap-3"
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-xs font-semibold text-text">{item.label}</span>
                        <span className="block h-2.5 overflow-hidden rounded-full bg-surface">
                          <span
                            className="chart-bar-fill block h-full rounded-full bg-rose-400"
                            style={{
                              width: `${Math.max((item.value / maxDisciplina) * 100, 5)}%`,
                              animationDelay: `${index * 55}ms`
                            }}
                          />
                        </span>
                      </span>
                      <span className="text-right text-sm font-bold text-text-muted">{item.value}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </DashboardPanel>
          </div>
        </>
      )}
    </>
  )
}
