import { useEffect, useMemo, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { PageHeader } from '../../components/layout/PageHeader'
import { Card } from '../../components/ui/Card'
import { Combobox } from '../../components/ui/Combobox'
import { Spinner } from '../../components/ui/Spinner'
import { Badge, type BadgeVariant } from '../../components/ui/Badge'
import { StatCard } from '../../components/ui/StatCard'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { AlocarProfessorModal } from '../../components/admin/AlocarProfessorModal'
import { AdvancedReportBuilder } from './AdvancedReportBuilder'
import { MasterDetailsExplorer } from './MasterDetailsExplorer'
import {
  EmptyRow,
  TBody,
  TD,
  TH,
  THead,
  TR,
  Table
} from '../../components/ui/Table'
import { listarProfessores } from '../../api/professores'
import { listarAlunos } from '../../api/alunos'
import { listarTurmas } from '../../api/turmas'
import { listarDisciplinas } from '../../api/disciplinas'
import {
  buscarGlobal,
  detalhesDaTurma,
  historicoDaDisciplina,
  resumoSemestre,
  trajetoriaDoAluno,
  turmasDoProfessor
} from '../../api/consultas'

type TabKey =
  | 'masterdetails'
  | 'relatorio'
  | 'professor'
  | 'aluno'
  | 'turma'
  | 'disciplina'
  | 'semestre'
  | 'busca'

interface ExplorerState {
  professorId: number | null
  alunoId: number | null
  turmaId: number | null
  disciplinaId: number | null
  semestre: string
  ano: number
  query: string
}

const TABS: Array<{
  key: TabKey
  label: string
  hint: string
}> = [
  {
    key: 'masterdetails',
    label: 'Master details',
    hint: 'Treeview hierarquico de curso, disciplina e turma com detalhes vinculados.'
  },
  {
    key: 'relatorio',
    label: 'Construtor',
    hint: 'Relatorios customizados com tabelas relacionadas, graficos e CSV.'
  },
  {
    key: 'professor',
    label: 'Professor',
    hint: 'Turmas, carga e ocupação por docente.'
  },
  {
    key: 'aluno',
    label: 'Aluno',
    hint: 'Trajetória, provas, médias e situação acadêmica.'
  },
  {
    key: 'turma',
    label: 'Turma',
    hint: 'Composição da turma, alunos e desempenho geral.'
  },
  {
    key: 'disciplina',
    label: 'Disciplina',
    hint: 'Histórico de oferta e professores que lecionaram.'
  },
  {
    key: 'semestre',
    label: 'Semestre',
    hint: 'Visão executiva com ocupação e indicadores.'
  },
  {
    key: 'busca',
    label: 'Busca Global',
    hint: 'Atalho rápido para achar qualquer entidade.'
  }
]

const fmtMedia = (m: number | null | undefined) =>
  m == null ? '—' : m.toFixed(2)
const fmtOcc = (o: number) => `${Math.round(o * 100)}%`
const occBadgeVariant = (o: number): BadgeVariant =>
  o >= 0.8 ? 'warning' : 'success'
const ocupacaoFromTurma = (alunos: number, vagas: number) =>
  vagas > 0 ? alunos / vagas : 0

const situacaoVariant = (s: string): BadgeVariant => {
  switch (s) {
    case 'ATIVA':
      return 'success'
    case 'TRANCADA':
      return 'warning'
    case 'CONCLUIDA':
      return 'neutral'
    case 'REPROVADA':
      return 'danger'
    default:
      return 'default'
  }
}

const errorMessage = (err: unknown): string => {
  const e = err as
    | { response?: { data?: { message?: string } }; message?: string }
    | undefined
  return (
    e?.response?.data?.message ?? e?.message ?? 'Erro ao carregar dados.'
  )
}

const CURRENT_YEAR = new Date().getFullYear()

export function AdminExplorar() {
  const [tab, setTab] = useState<TabKey>('masterdetails')
  const [state, setState] = useState<ExplorerState>({
    professorId: null,
    alunoId: null,
    turmaId: null,
    disciplinaId: null,
    semestre: '1',
    ano: CURRENT_YEAR,
    query: ''
  })

  const setPart = <K extends keyof ExplorerState>(
    key: K,
    value: ExplorerState[K]
  ) => setState(s => ({ ...s, [key]: value }))
  const currentTab = TABS.find(t => t.key === tab) ?? TABS[0]

  return (
    <>
      <PageHeader
        title="Consulta Avancada"
        subtitle="Central de consulta: escolha o modo de analise e encontre dados academicos em segundos."
      />

      <Card
        className="mb-5"
        title="Como usar"
        subtitle="Fluxo sugerido para consultar dados com rapidez."
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
          <div className="rounded-card border border-surface-border bg-surface p-3">
            <p className="text-xs uppercase tracking-wide text-text-muted font-semibold mb-1">Passo 1</p>
            <p className="font-medium text-text">Escolha o contexto de análise</p>
            <p className="text-text-muted mt-1">Professor, aluno, turma, disciplina, semestre ou busca global.</p>
          </div>
          <div className="rounded-card border border-surface-border bg-surface p-3">
            <p className="text-xs uppercase tracking-wide text-text-muted font-semibold mb-1">Passo 2</p>
            <p className="font-medium text-text">Selecione o item</p>
            <p className="text-text-muted mt-1">Use os campos inteligentes para filtrar e encontrar mais rápido.</p>
          </div>
          <div className="rounded-card border border-surface-border bg-surface p-3">
            <p className="text-xs uppercase tracking-wide text-text-muted font-semibold mb-1">Passo 3</p>
            <p className="font-medium text-text">Analise os indicadores</p>
            <p className="text-text-muted mt-1">Métricas, ocupação, médias e histórico detalhado em uma única tela.</p>
          </div>
        </div>
      </Card>

      <div className="flex flex-wrap gap-2 mb-3">
        {TABS.map(t => {
          const active = t.key === tab
          const cls = active
            ? 'bg-primary text-white border border-primary'
            : 'bg-surface-card text-text-muted hover:text-text border border-surface-border'
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`inline-flex items-center rounded-full px-4 h-9 text-sm font-semibold transition-colors ${cls}`}
            >
              {t.label}
            </button>
          )
        })}
      </div>
      <p className="text-sm text-text-muted mb-5">
        <span className="font-semibold text-text">{currentTab.label}:</span>{' '}
        {currentTab.hint}
      </p>

      {tab === 'masterdetails' ? (
        <MasterDetailsExplorer />
      ) : tab === 'relatorio' ? (
        <AdvancedReportBuilder />
      ) : (
      <Card>
        {tab === 'professor' && (
          <ProfessorLens
            value={state.professorId}
            onChange={id => setPart('professorId', id)}
          />
        )}
        {tab === 'aluno' && (
          <AlunoLens
            value={state.alunoId}
            onChange={id => setPart('alunoId', id)}
          />
        )}
        {tab === 'turma' && (
          <TurmaLens
            value={state.turmaId}
            onChange={id => setPart('turmaId', id)}
          />
        )}
        {tab === 'disciplina' && (
          <DisciplinaLens
            value={state.disciplinaId}
            onChange={id => setPart('disciplinaId', id)}
          />
        )}
        {tab === 'semestre' && (
          <SemestreLens
            semestre={state.semestre}
            ano={state.ano}
            onChange={(s, a) => {
              setPart('semestre', s)
              setPart('ano', a)
            }}
          />
        )}
        {tab === 'busca' && (
          <BuscaLens
            query={state.query}
            onQuery={q => setPart('query', q)}
            onJumpAluno={id => {
              setPart('alunoId', id)
              setTab('aluno')
            }}
            onJumpProfessor={id => {
              setPart('professorId', id)
              setTab('professor')
            }}
            onJumpDisciplina={id => {
              setPart('disciplinaId', id)
              setTab('disciplina')
            }}
            onJumpTurma={id => {
              setPart('turmaId', id)
              setTab('turma')
            }}
          />
        )}
      </Card>
      )}
    </>
  )
}

function CardSpinner() {
  return (
    <div className="flex items-center justify-center py-10">
      <Spinner size="lg" />
    </div>
  )
}

function ErrorBox({ msg }: { msg: string }) {
  return (
    <div className="bg-primary-light text-primary-dark border border-primary rounded-card px-4 py-3 text-sm">
      {msg}
    </div>
  )
}

function EmptyHint({ children }: { children: React.ReactNode }) {
  return <p className="text-text-muted text-sm py-6">{children}</p>
}

/* -------------------- Professor -------------------- */

function ProfessorLens({
  value,
  onChange
}: {
  value: number | null
  onChange: (id: number | null) => void
}) {
  const professores = useQuery({
    queryKey: ['professores'],
    queryFn: listarProfessores
  })

  const options = useMemo(
    () =>
      (professores.data ?? []).map(p => ({
        id: p.id,
        label: p.nome,
        sublabel: p.registro ?? p.email ?? undefined
      })),
    [professores.data]
  )

  const detail = useQuery({
    queryKey: ['consultas', 'professor', value],
    queryFn: () => turmasDoProfessor(value as number),
    enabled: !!value
  })

  return (
    <div className="flex flex-col gap-5">
      <div className="max-w-xl">
        <Combobox
          label="Professor"
          placeholder={
            professores.isLoading ? 'Carregando...' : 'Pesquisar professor...'
          }
          value={value}
          onChange={onChange}
          options={options}
          emptyMessage="Nenhum professor encontrado."
        />
      </div>

      {!value && (
        <EmptyHint>Selecione um professor para ver as turmas que leciona.</EmptyHint>
      )}

      {value && detail.isLoading && <CardSpinner />}
      {value && detail.isError && <ErrorBox msg={errorMessage(detail.error)} />}

      {value && detail.data && (
        <div className="flex flex-col gap-5">
          <div className="bg-surface rounded-card border border-surface-border p-5 flex flex-wrap items-center gap-x-6 gap-y-3">
            <div>
              <p className="text-text-muted text-xs uppercase tracking-wide font-semibold">
                Professor
              </p>
              <p className="font-display text-xl font-semibold text-text">
                {detail.data.professor.nome}
              </p>
            </div>
            <div className="text-sm text-text-muted">
              {detail.data.professor.email && (
                <p>{detail.data.professor.email}</p>
              )}
              {detail.data.professor.registro && (
                <p>
                  Registro:{' '}
                  <span className="text-text font-medium">
                    {detail.data.professor.registro}
                  </span>
                </p>
              )}
              {detail.data.professor.titulacao && (
                <p>
                  Titulação:{' '}
                  <span className="text-text font-medium">
                    {detail.data.professor.titulacao}
                  </span>
                </p>
              )}
            </div>
            <div className="ml-auto">
              <Badge variant="neutral">
                {detail.data.totalTurmas}{' '}
                {detail.data.totalTurmas === 1 ? 'turma' : 'turmas'}
              </Badge>
            </div>
          </div>

          <Table>
            <THead>
              <TR>
                <TH>Código</TH>
                <TH>Disciplina</TH>
                <TH>Curso</TH>
                <TH>Semestre</TH>
                <TH>Sala</TH>
                <TH>Vagas</TH>
                <TH>Alunos</TH>
                <TH>Provas</TH>
                <TH>Ocupação</TH>
              </TR>
            </THead>
            <TBody>
              {detail.data.turmas.length === 0 && (
                <EmptyRow colSpan={9}>
                  Este professor ainda não está vinculado a turmas.
                </EmptyRow>
              )}
              {detail.data.turmas.map(t => {
                const occ = ocupacaoFromTurma(t.totalAlunos, t.vagas)
                return (
                  <TR key={t.id}>
                    <TD>
                      <span className="font-mono text-xs font-semibold">
                        {t.codigo}
                      </span>
                    </TD>
                    <TD>
                      <div className="font-medium">{t.disciplina.nome}</div>
                      <div className="text-xs text-text-muted">
                        {t.disciplina.codigo}
                      </div>
                    </TD>
                    <TD>{t.curso?.nome ?? '—'}</TD>
                    <TD>
                      {t.semestre}/{t.ano}
                    </TD>
                    <TD>{t.sala ?? '—'}</TD>
                    <TD>{t.vagas}</TD>
                    <TD>{t.totalAlunos}</TD>
                    <TD>{t.totalProvas}</TD>
                    <TD>
                      <Badge variant={occBadgeVariant(occ)}>{fmtOcc(occ)}</Badge>
                    </TD>
                  </TR>
                )
              })}
            </TBody>
          </Table>
        </div>
      )}
    </div>
  )
}

/* -------------------- Aluno -------------------- */

function AlunoLens({
  value,
  onChange
}: {
  value: number | null
  onChange: (id: number | null) => void
}) {
  const alunos = useQuery({ queryKey: ['alunos'], queryFn: listarAlunos })

  const options = useMemo(
    () =>
      (alunos.data ?? []).map(a => ({
        id: a.id,
        label: a.nome,
        sublabel: a.matriculaId
          ? `Matrícula ${a.matriculaId}`
          : (a.curso?.nome ?? undefined)
      })),
    [alunos.data]
  )

  const detail = useQuery({
    queryKey: ['consultas', 'aluno', value],
    queryFn: () => trajetoriaDoAluno(value as number),
    enabled: !!value
  })

  const [expanded, setExpanded] = useState<Set<number>>(new Set())
  const toggle = (id: number) =>
    setExpanded(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const mediaGeral = useMemo(() => {
    if (!detail.data) return null
    const ms = detail.data.matriculas
      .map(m => m.mediaPonderada)
      .filter((m): m is number => m != null)
    if (ms.length === 0) return null
    return ms.reduce((a, b) => a + b, 0) / ms.length
  }, [detail.data])

  return (
    <div className="flex flex-col gap-5">
      <div className="max-w-xl">
        <Combobox
          label="Aluno"
          placeholder={alunos.isLoading ? 'Carregando...' : 'Pesquisar aluno...'}
          value={value}
          onChange={onChange}
          options={options}
          emptyMessage="Nenhum aluno encontrado."
        />
      </div>

      {!value && <EmptyHint>Selecione um aluno para ver a trajetória.</EmptyHint>}

      {value && detail.isLoading && <CardSpinner />}
      {value && detail.isError && <ErrorBox msg={errorMessage(detail.error)} />}

      {value && detail.data && (
        <div className="flex flex-col gap-5">
          <div className="bg-surface rounded-card border border-surface-border p-5 flex flex-wrap items-center gap-x-6 gap-y-2">
            <div>
              <p className="text-text-muted text-xs uppercase tracking-wide font-semibold">
                Aluno
              </p>
              <p className="font-display text-xl font-semibold text-text">
                {detail.data.aluno.nome}
              </p>
            </div>
            <div className="text-sm text-text-muted">
              <p>
                Matrícula:{' '}
                <span className="text-text font-medium">
                  {detail.data.aluno.matriculaId}
                </span>
              </p>
              {detail.data.curso && <p>Curso: {detail.data.curso.nome}</p>}
              {detail.data.aluno.turno && <p>Turno: {detail.data.aluno.turno}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Total matrículas"
              value={detail.data.totalMatriculas}
            />
            <StatCard
              label="Ativas"
              value={detail.data.matriculasAtivas}
              accent="success"
            />
            <StatCard
              label="Concluídas"
              value={detail.data.matriculasConcluidas}
              accent="muted"
            />
            <StatCard label="Média geral" value={fmtMedia(mediaGeral)} />
          </div>

          <div className="flex flex-col gap-3">
            {detail.data.matriculas.length === 0 && (
              <EmptyHint>Nenhuma matrícula registrada.</EmptyHint>
            )}
            {detail.data.matriculas.map(m => {
              const isOpen = expanded.has(m.id)
              return (
                <div
                  key={m.id}
                  className="bg-white border border-surface-border rounded-card shadow-card"
                >
                  <button
                    type="button"
                    onClick={() => toggle(m.id)}
                    className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-surface transition-colors"
                  >
                    <span
                      aria-hidden
                      className={`inline-block transition-transform ${
                        isOpen ? 'rotate-90' : ''
                      } text-text-muted`}
                    >
                      ›
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-text truncate">
                        {m.disciplina.nome}{' '}
                        <span className="text-text-muted text-xs">
                          ({m.disciplina.codigo})
                        </span>
                      </div>
                      <div className="text-xs text-text-muted">
                        Turma {m.turma.codigo} · {m.turma.semestre}/
                        {m.turma.ano}
                        {m.professor ? ` · ${m.professor.nome}` : ''}
                      </div>
                    </div>
                    <div className="hidden sm:block text-xs text-text-muted">
                      Frequência:{' '}
                      <span className="text-text font-medium">
                        {Math.round(m.frequencia * 100)}%
                      </span>
                    </div>
                    <Badge variant={situacaoVariant(m.situacao)}>
                      {m.situacao}
                    </Badge>
                    <div className="ml-2 text-right">
                      <div className="text-xs text-text-muted uppercase tracking-wide">
                        Média
                      </div>
                      <div className="font-display text-base font-semibold text-text">
                        {fmtMedia(m.mediaPonderada)}
                      </div>
                    </div>
                  </button>
                  {isOpen && (
                    <div className="border-t border-surface-border px-5 py-4">
                      {m.provas.length === 0 ? (
                        <p className="text-text-muted text-sm">
                          Nenhuma prova nesta turma.
                        </p>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="min-w-full text-left text-sm">
                            <thead className="text-text-muted text-xs uppercase tracking-wide">
                              <tr>
                                <th className="py-2 pr-4">Prova</th>
                                <th className="py-2 pr-4">Peso</th>
                                <th className="py-2 pr-4">Conteúdo</th>
                                <th className="py-2 pr-4">Data</th>
                                <th className="py-2 pr-4">Presente</th>
                                <th className="py-2 pr-4">Nota</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-surface-border">
                              {m.provas.map(p => (
                                <tr key={p.id}>
                                  <td className="py-2 pr-4 font-mono text-xs">
                                    {p.codigo}
                                  </td>
                                  <td className="py-2 pr-4">{p.peso}</td>
                                  <td className="py-2 pr-4">
                                    {p.conteudo ?? '—'}
                                  </td>
                                  <td className="py-2 pr-4">
                                    {p.resultado?.dataRealizacao ?? '—'}
                                  </td>
                                  <td className="py-2 pr-4">
                                    {p.resultado
                                      ? p.resultado.presente
                                        ? 'Sim'
                                        : 'Não'
                                      : '—'}
                                  </td>
                                  <td className="py-2 pr-4 font-medium">
                                    {p.resultado?.nota != null
                                      ? p.resultado.nota.toFixed(2)
                                      : '—'}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

/* -------------------- Turma -------------------- */

function TurmaLens({
  value,
  onChange
}: {
  value: number | null
  onChange: (id: number | null) => void
}) {
  const qc = useQueryClient()
  const [alocarOpen, setAlocarOpen] = useState(false)

  const turmas = useQuery({
    queryKey: ['turmas'],
    queryFn: () => listarTurmas()
  })

  const options = useMemo(
    () =>
      (turmas.data ?? []).map(t => ({
        id: t.id,
        label: t.codigo,
        sublabel: `${t.semestre}/${t.ano}${
          t.disciplina?.nome ? ` · ${t.disciplina.nome}` : ''
        }`
      })),
    [turmas.data]
  )

  const detail = useQuery({
    queryKey: ['consultas', 'turma', value],
    queryFn: () => detalhesDaTurma(value as number),
    enabled: !!value
  })

  return (
    <>
    <div className="flex flex-col gap-5">
      <div className="max-w-xl">
        <Combobox
          label="Turma"
          placeholder={turmas.isLoading ? 'Carregando...' : 'Pesquisar turma...'}
          value={value}
          onChange={onChange}
          options={options}
          emptyMessage="Nenhuma turma encontrada."
        />
      </div>

      {!value && (
        <EmptyHint>Selecione uma turma para ver os detalhes completos.</EmptyHint>
      )}

      {value && detail.isLoading && <CardSpinner />}
      {value && detail.isError && <ErrorBox msg={errorMessage(detail.error)} />}

      {value && detail.data && (
        <div className="flex flex-col gap-5">
          <div className="bg-surface rounded-card border border-surface-border p-5 flex flex-wrap items-start gap-x-6 gap-y-3">
            <div>
              <p className="text-text-muted text-xs uppercase tracking-wide font-semibold">
                Turma
              </p>
              <p className="font-display text-xl font-semibold text-text">
                {detail.data.turma.codigo}
              </p>
              <p className="text-sm text-text-muted">
                {detail.data.disciplina.nome} ({detail.data.disciplina.codigo})
              </p>
            </div>
            <div className="text-sm text-text-muted">
              {detail.data.curso && <p>Curso: {detail.data.curso.nome}</p>}
              <p className="flex items-center gap-2 flex-wrap">
                <span>
                  Professor:{' '}
                  <span className="text-text font-medium">
                    {detail.data.professor?.nome ?? 'Sem professor'}
                  </span>
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setAlocarOpen(true)}
                >
                  Trocar professor
                </Button>
              </p>
              <p>
                {detail.data.turma.semestre}/{detail.data.turma.ano}
                {detail.data.turma.sala ? ` · Sala ${detail.data.turma.sala}` : ''}
                {detail.data.turma.horario ? ` · ${detail.data.turma.horario}` : ''}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard label="Vagas" value={detail.data.turma.vagas} />
            <StatCard
              label="Ocupadas"
              value={detail.data.totalAlunos}
              accent="success"
            />
            <StatCard
              label="Restantes"
              value={detail.data.vagasRestantes}
              accent="muted"
            />
            <StatCard label="Provas" value={detail.data.provas.length} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div>
              <h4 className="font-display text-base font-semibold text-text mb-2">
                Alunos
              </h4>
              <Table>
                <THead>
                  <TR>
                    <TH>Matrícula</TH>
                    <TH>Nome</TH>
                    <TH>Situação</TH>
                    <TH>Frequência</TH>
                    <TH>Média</TH>
                  </TR>
                </THead>
                <TBody>
                  {detail.data.alunos.length === 0 && (
                    <EmptyRow colSpan={5}>Sem alunos matriculados.</EmptyRow>
                  )}
                  {detail.data.alunos.map(a => (
                    <TR key={a.matriculaId}>
                      <TD>
                        <span className="font-mono text-xs font-semibold">
                          {a.aluno.matriculaId}
                        </span>
                      </TD>
                      <TD>{a.aluno.nome}</TD>
                      <TD>
                        <Badge variant={situacaoVariant(a.situacao)}>
                          {a.situacao}
                        </Badge>
                      </TD>
                      <TD>{Math.round(a.frequencia * 100)}%</TD>
                      <TD>{fmtMedia(a.mediaPonderada)}</TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            </div>

            <div>
              <h4 className="font-display text-base font-semibold text-text mb-2">
                Provas
              </h4>
              <Table>
                <THead>
                  <TR>
                    <TH>Código</TH>
                    <TH>Peso</TH>
                    <TH>Resultados</TH>
                    <TH>Média turma</TH>
                  </TR>
                </THead>
                <TBody>
                  {detail.data.provas.length === 0 && (
                    <EmptyRow colSpan={4}>Sem provas cadastradas.</EmptyRow>
                  )}
                  {detail.data.provas.map(p => (
                    <TR key={p.id}>
                      <TD>
                        <span className="font-mono text-xs font-semibold">
                          {p.codigo}
                        </span>
                      </TD>
                      <TD>{p.peso}</TD>
                      <TD>{p.totalResultados}</TD>
                      <TD>{fmtMedia(p.mediaTurma)}</TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            </div>
          </div>
        </div>
      )}
    </div>
    {value && detail.data && (
      <AlocarProfessorModal
        open={alocarOpen}
        onClose={() => setAlocarOpen(false)}
        turmaId={detail.data.turma.id}
        turmaCodigo={detail.data.turma.codigo}
        currentProfessorId={detail.data.professor?.id ?? null}
        onSuccess={() => {
          qc.invalidateQueries({ queryKey: ['turmas'] })
          qc.invalidateQueries({ queryKey: ['turmas-todas'] })
          qc.invalidateQueries({ queryKey: ['consultas', 'turma', value] })
        }}
      />
    )}
    </>
  )
}

/* -------------------- Disciplina -------------------- */

function DisciplinaLens({
  value,
  onChange
}: {
  value: number | null
  onChange: (id: number | null) => void
}) {
  const disciplinas = useQuery({
    queryKey: ['disciplinas'],
    queryFn: () => listarDisciplinas()
  })

  const options = useMemo(
    () =>
      (disciplinas.data ?? []).map(d => ({
        id: d.id,
        label: d.nome,
        sublabel: `${d.codigo}${d.curso?.nome ? ` · ${d.curso.nome}` : ''}`
      })),
    [disciplinas.data]
  )

  const detail = useQuery({
    queryKey: ['consultas', 'disciplina', value],
    queryFn: () => historicoDaDisciplina(value as number),
    enabled: !!value
  })

  return (
    <div className="flex flex-col gap-5">
      <div className="max-w-xl">
        <Combobox
          label="Disciplina"
          placeholder={
            disciplinas.isLoading ? 'Carregando...' : 'Pesquisar disciplina...'
          }
          value={value}
          onChange={onChange}
          options={options}
          emptyMessage="Nenhuma disciplina encontrada."
        />
      </div>

      {!value && (
        <EmptyHint>
          Selecione uma disciplina para ver o histórico de turmas.
        </EmptyHint>
      )}

      {value && detail.isLoading && <CardSpinner />}
      {value && detail.isError && <ErrorBox msg={errorMessage(detail.error)} />}

      {value && detail.data && (
        <div className="flex flex-col gap-5">
          <div className="bg-surface rounded-card border border-surface-border p-5">
            <p className="text-text-muted text-xs uppercase tracking-wide font-semibold">
              Disciplina
            </p>
            <p className="font-display text-xl font-semibold text-text">
              {detail.data.disciplina.nome}
            </p>
            <p className="text-sm text-text-muted">
              {detail.data.disciplina.codigo} ·{' '}
              {detail.data.disciplina.creditos} cr ·{' '}
              {detail.data.disciplina.ch}h
              {detail.data.disciplina.modalidade
                ? ` · ${detail.data.disciplina.modalidade}`
                : ''}
              {detail.data.curso ? ` · ${detail.data.curso.nome}` : ''}
            </p>
            {detail.data.disciplina.ementa && (
              <p className="text-sm text-text-muted mt-3 leading-relaxed">
                {detail.data.disciplina.ementa}
              </p>
            )}
          </div>

          {detail.data.preRequisito && (
            <div className="bg-warning-light border border-warning rounded-card p-4">
              <p className="text-text-muted text-xs uppercase tracking-wide font-semibold">
                Pré-requisito
              </p>
              <p className="text-text font-medium">
                {detail.data.preRequisito.nome}{' '}
                <span className="text-text-muted text-xs">
                  ({detail.data.preRequisito.codigo})
                </span>
              </p>
            </div>
          )}

          <div>
            <h4 className="font-display text-base font-semibold text-text mb-2">
              Turmas oferecidas ({detail.data.totalTurmas})
            </h4>
            <Table>
              <THead>
                <TR>
                  <TH>Código</TH>
                  <TH>Semestre</TH>
                  <TH>Professor</TH>
                  <TH>Vagas</TH>
                  <TH>Alunos</TH>
                  <TH>Média turma</TH>
                </TR>
              </THead>
              <TBody>
                {detail.data.turmas.length === 0 && (
                  <EmptyRow colSpan={6}>
                    Disciplina sem turmas registradas.
                  </EmptyRow>
                )}
                {detail.data.turmas.map(t => (
                  <TR key={t.id}>
                    <TD>
                      <span className="font-mono text-xs font-semibold">
                        {t.codigo}
                      </span>
                    </TD>
                    <TD>
                      {t.semestre}/{t.ano}
                    </TD>
                    <TD>{t.professor?.nome ?? '—'}</TD>
                    <TD>{t.vagas}</TD>
                    <TD>{t.totalAlunos}</TD>
                    <TD>
                      <Badge variant="neutral">{fmtMedia(t.mediaTurma)}</Badge>
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </div>

          <div>
            <h4 className="font-display text-base font-semibold text-text mb-2">
              Professores que lecionaram
            </h4>
            {detail.data.professoresQueLecionaram.length === 0 ? (
              <p className="text-text-muted text-sm">
                Sem registros de professores ainda.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {detail.data.professoresQueLecionaram.map(p => (
                  <span
                    key={p.id}
                    className="inline-flex items-center gap-2 bg-surface border border-surface-border rounded-full px-3 py-1.5 text-sm"
                  >
                    <span className="font-medium text-text">{p.nome}</span>
                    <span className="text-xs text-text-muted">
                      {p.totalTurmas}{' '}
                      {p.totalTurmas === 1 ? 'turma' : 'turmas'}
                    </span>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

/* -------------------- Semestre -------------------- */

const SELECT_CLS =
  'w-full h-10 rounded-lg border border-surface-border bg-white px-3 text-sm text-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20'

function SemestreLens({
  semestre,
  ano,
  onChange
}: {
  semestre: string
  ano: number
  onChange: (semestre: string, ano: number) => void
}) {
  const [draftSem, setDraftSem] = useState(semestre)
  const [draftAno, setDraftAno] = useState(ano)
  const [submitted, setSubmitted] = useState<{
    semestre: string
    ano: number
  } | null>(null)

  const detail = useQuery({
    queryKey: [
      'consultas',
      'semestre',
      submitted?.semestre,
      submitted?.ano
    ],
    queryFn: () => resumoSemestre(submitted!.semestre, submitted!.ano),
    enabled: !!submitted
  })

  const submit = () => {
    onChange(draftSem, draftAno)
    setSubmitted({ semestre: draftSem, ano: draftAno })
  }

  const years = useMemo(() => {
    const arr: number[] = []
    for (let y = CURRENT_YEAR - 5; y <= CURRENT_YEAR + 5; y++) arr.push(y)
    return arr
  }, [])

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end gap-3">
        <div className="w-40">
          <label className="text-text-muted text-xs uppercase tracking-wide font-semibold">
            Semestre
          </label>
          <select
            value={draftSem}
            onChange={e => setDraftSem(e.target.value)}
            className={SELECT_CLS}
          >
            <option value="1">1º semestre</option>
            <option value="2">2º semestre</option>
          </select>
        </div>
        <div className="w-40">
          <label className="text-text-muted text-xs uppercase tracking-wide font-semibold">
            Ano
          </label>
          <select
            value={draftAno}
            onChange={e => setDraftAno(Number(e.target.value))}
            className={SELECT_CLS}
          >
            {years.map(y => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
        <Button onClick={submit}>Consultar</Button>
      </div>

      {!submitted && (
        <EmptyHint>Escolha um semestre e clique em Consultar.</EmptyHint>
      )}

      {submitted && detail.isLoading && <CardSpinner />}
      {submitted && detail.isError && (
        <ErrorBox msg={errorMessage(detail.error)} />
      )}

      {submitted && detail.data && (
        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard label="Turmas" value={detail.data.totalTurmas} />
            <StatCard label="Vagas" value={detail.data.totalVagas} />
            <StatCard
              label="Matrículas"
              value={detail.data.totalMatriculas}
              accent="success"
            />
            <StatCard
              label="Profs ativos"
              value={detail.data.totalProfessoresAtivos}
              accent="muted"
            />
          </div>

          <div className="bg-surface rounded-card border border-surface-border p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-text-muted text-xs uppercase tracking-wide font-semibold">
                Ocupação média
              </p>
              <span className="font-display font-semibold text-text">
                {fmtOcc(detail.data.ocupacaoMedia)}
              </span>
            </div>
            <div className="h-3 w-full bg-white border border-surface-border rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all"
                style={{
                  width: `${Math.min(100, Math.max(0, detail.data.ocupacaoMedia * 100))}%`
                }}
              />
            </div>
          </div>

          <Table>
            <THead>
              <TR>
                <TH>Código</TH>
                <TH>Disciplina</TH>
                <TH>Professor</TH>
                <TH>Sala</TH>
                <TH>Horário</TH>
                <TH>Vagas</TH>
                <TH>Ocupadas</TH>
                <TH>Ocupação</TH>
              </TR>
            </THead>
            <TBody>
              {detail.data.turmas.length === 0 && (
                <EmptyRow colSpan={8}>Sem turmas neste semestre.</EmptyRow>
              )}
              {detail.data.turmas.map(t => (
                <TR key={t.id}>
                  <TD>
                    <span className="font-mono text-xs font-semibold">
                      {t.codigo}
                    </span>
                  </TD>
                  <TD>
                    <div className="font-medium">{t.disciplina.nome}</div>
                    <div className="text-xs text-text-muted">
                      {t.disciplina.codigo}
                    </div>
                  </TD>
                  <TD>{t.professor?.nome ?? '—'}</TD>
                  <TD>{t.sala ?? '—'}</TD>
                  <TD>{t.horario ?? '—'}</TD>
                  <TD>{t.vagas}</TD>
                  <TD>{t.ocupadas}</TD>
                  <TD>
                    <Badge variant={occBadgeVariant(t.ocupacao)}>
                      {fmtOcc(t.ocupacao)}
                    </Badge>
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </div>
      )}
    </div>
  )
}

/* -------------------- Busca -------------------- */

function BuscaLens({
  query,
  onQuery,
  onJumpAluno,
  onJumpProfessor,
  onJumpDisciplina,
  onJumpTurma
}: {
  query: string
  onQuery: (q: string) => void
  onJumpAluno: (id: number) => void
  onJumpProfessor: (id: number) => void
  onJumpDisciplina: (id: number) => void
  onJumpTurma: (id: number) => void
}) {
  const [debounced, setDebounced] = useState(query)

  useEffect(() => {
    const id = setTimeout(() => setDebounced(query.trim()), 300)
    return () => clearTimeout(id)
  }, [query])

  const enabled = debounced.length >= 2

  const result = useQuery({
    queryKey: ['consultas', 'busca', debounced],
    queryFn: () => buscarGlobal(debounced),
    enabled
  })

  return (
    <div className="flex flex-col gap-5">
      <div className="max-w-xl">
        <label className="text-text-muted text-xs uppercase tracking-wide font-semibold">
          Buscar
        </label>
        <Input
          value={query}
          onChange={e => onQuery(e.target.value)}
          placeholder="Mínimo 2 caracteres..."
        />
      </div>

      {!enabled && (
        <EmptyHint>
          Digite ao menos 2 caracteres para buscar em todas as entidades.
        </EmptyHint>
      )}

      {enabled && result.isLoading && <CardSpinner />}
      {enabled && result.isError && (
        <ErrorBox msg={errorMessage(result.error)} />
      )}

      {enabled && result.data && (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-text-muted">
            <span className="font-semibold text-text">
              {result.data.totalHits}
            </span>{' '}
            resultado(s) para{' '}
            <span className="font-mono">&ldquo;{result.data.q}&rdquo;</span>
          </p>

          <Card title="Alunos">
            {result.data.alunos.length === 0 ? (
              <p className="text-text-muted text-sm">
                Sem resultados nesta categoria.
              </p>
            ) : (
              <ul className="flex flex-col divide-y divide-surface-border">
                {result.data.alunos.map(a => (
                  <li key={a.id}>
                    <button
                      type="button"
                      onClick={() => onJumpAluno(a.id)}
                      className="w-full flex items-center justify-between gap-3 py-2.5 px-1 text-left hover:bg-surface rounded transition-colors"
                    >
                      <div>
                        <div className="font-medium text-text">{a.nome}</div>
                        <div className="text-xs text-text-muted">
                          Matrícula {a.matriculaId}
                          {a.cursoNome ? ` · ${a.cursoNome}` : ''}
                        </div>
                      </div>
                      <span className="text-primary text-sm font-semibold">
                        Ver trajetória →
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card title="Professores">
            {result.data.professores.length === 0 ? (
              <p className="text-text-muted text-sm">
                Sem resultados nesta categoria.
              </p>
            ) : (
              <ul className="flex flex-col divide-y divide-surface-border">
                {result.data.professores.map(p => (
                  <li key={p.id}>
                    <button
                      type="button"
                      onClick={() => onJumpProfessor(p.id)}
                      className="w-full flex items-center justify-between gap-3 py-2.5 px-1 text-left hover:bg-surface rounded transition-colors"
                    >
                      <div>
                        <div className="font-medium text-text">{p.nome}</div>
                        {p.email && (
                          <div className="text-xs text-text-muted">
                            {p.email}
                          </div>
                        )}
                      </div>
                      <span className="text-primary text-sm font-semibold">
                        Ver turmas →
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card title="Disciplinas">
            {result.data.disciplinas.length === 0 ? (
              <p className="text-text-muted text-sm">
                Sem resultados nesta categoria.
              </p>
            ) : (
              <ul className="flex flex-col divide-y divide-surface-border">
                {result.data.disciplinas.map(d => (
                  <li key={d.id}>
                    <button
                      type="button"
                      onClick={() => onJumpDisciplina(d.id)}
                      className="w-full flex items-center justify-between gap-3 py-2.5 px-1 text-left hover:bg-surface rounded transition-colors"
                    >
                      <div>
                        <div className="font-medium text-text">{d.nome}</div>
                        <div className="text-xs text-text-muted font-mono">
                          {d.codigo}
                        </div>
                      </div>
                      <span className="text-primary text-sm font-semibold">
                        Ver histórico →
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card title="Turmas">
            {result.data.turmas.length === 0 ? (
              <p className="text-text-muted text-sm">
                Sem resultados nesta categoria.
              </p>
            ) : (
              <ul className="flex flex-col divide-y divide-surface-border">
                {result.data.turmas.map(t => (
                  <li key={t.id}>
                    <button
                      type="button"
                      onClick={() => onJumpTurma(t.id)}
                      className="w-full flex items-center justify-between gap-3 py-2.5 px-1 text-left hover:bg-surface rounded transition-colors"
                    >
                      <div>
                        <div className="font-medium text-text">
                          <span className="font-mono">{t.codigo}</span> ·{' '}
                          {t.disciplinaNome}
                        </div>
                        <div className="text-xs text-text-muted">
                          {t.semestre}/{t.ano}
                        </div>
                      </div>
                      <span className="text-primary text-sm font-semibold">
                        Ver detalhes →
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card title="Cursos">
            {result.data.cursos.length === 0 ? (
              <p className="text-text-muted text-sm">
                Sem resultados nesta categoria.
              </p>
            ) : (
              <ul className="flex flex-col divide-y divide-surface-border">
                {result.data.cursos.map(c => (
                  <li
                    key={c.id}
                    className="py-2.5 px-1 flex items-center justify-between"
                  >
                    <span className="font-medium text-text">{c.nome}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      )}
    </div>
  )
}
