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
import { Modal } from '../../components/ui/Modal'
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
  relatorioAcademico,
  resumoSemestre,
  trajetoriaDoAluno,
  turmasDoProfessor,
  type RelatorioAcademicoRow
} from '../../api/consultas'

type TabKey =
  | 'masterdetails'
  | 'prontas'
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
    key: 'prontas',
    label: 'Consultas prontas',
    hint: 'Presets de consulta com os cruzamentos mais pedidos.'
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
      ) : tab === 'prontas' ? (
        <ConsultasProntas />
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

type ReadyQueryKey =
  | 'aluno_turmas'
  | 'professor_disciplina'
  | 'alunos_sem_turma'
  | 'turma_prova_media'
  | 'professor_prova_notas'
  | 'professor_total_turmas'
  | 'professor_disciplinas'
  | 'disciplinas_sem_turma'
  | 'provas_nao_aplicadas'
  | 'disciplina_total_turmas'

interface ReadyColumn {
  key: string
  label: string
}

interface ReadyQuery {
  key: ReadyQueryKey
  title: string
  subtitle: string
  columns: ReadyColumn[]
}

type ReadyRow = Record<string, string | number>
type ReadyView = 'table' | 'bar' | 'kpi'
type ReadyQueryModalMode = 'view' | 'edit'

const READY_CAROUSEL_SIZE = 5
const READY_PAGE_SIZE_OPTIONS = [10, 25, 50]
const READY_QUERY_STORAGE_KEY = 'ghflusao-ready-query-texts'

const READY_QUERIES: ReadyQuery[] = [
  {
    key: 'aluno_turmas',
    title: 'Alunos matriculados em turmas',
    subtitle: 'Matricula, aluno, codigo, turno e horario da turma.',
    columns: [
      { key: 'matricula', label: 'Matricula' },
      { key: 'aluno', label: 'Aluno' },
      { key: 'turma', label: 'Cod. turma' },
      { key: 'turno', label: 'Turno' },
      { key: 'dia', label: 'Dia' },
      { key: 'inicio', label: 'Hora inicio' },
      { key: 'fim', label: 'Hora fim' }
    ]
  },
  {
    key: 'professor_disciplina',
    title: 'Professores e disciplinas',
    subtitle: 'Matricula/registro do professor, nome e disciplina vinculada.',
    columns: [
      { key: 'registro', label: 'Matricula prof.' },
      { key: 'professor', label: 'Professor' },
      { key: 'codigo', label: 'Cod. disciplina' },
      { key: 'disciplina', label: 'Disciplina' }
    ]
  },
  {
    key: 'alunos_sem_turma',
    title: 'Alunos sem turma',
    subtitle: 'Alunos cadastrados que nao aparecem em nenhuma turma.',
    columns: [
      { key: 'matricula', label: 'Matricula' },
      { key: 'aluno', label: 'Aluno' }
    ]
  },
  {
    key: 'turma_prova_media',
    title: 'Turmas, provas e media',
    subtitle: 'Turma, disciplina, prova, situacao e media das notas.',
    columns: [
      { key: 'turmaId', label: 'ID turma' },
      { key: 'disciplina', label: 'Disciplina' },
      { key: 'prova', label: 'Cod. prova' },
      { key: 'situacao', label: 'Situacao' },
      { key: 'media', label: 'Media notas' }
    ]
  },
  {
    key: 'professor_prova_notas',
    title: 'Notas por professor e prova',
    subtitle: 'Professor, turma, disciplina, prova, media, maior e menor nota.',
    columns: [
      { key: 'registro', label: 'Matricula prof.' },
      { key: 'professor', label: 'Professor' },
      { key: 'turmaId', label: 'ID turma' },
      { key: 'disciplina', label: 'Disciplina' },
      { key: 'prova', label: 'Cod. prova' },
      { key: 'situacao', label: 'Situacao' },
      { key: 'media', label: 'Media' },
      { key: 'maior', label: 'Maior nota' },
      { key: 'menor', label: 'Menor nota' }
    ]
  },
  {
    key: 'professor_total_turmas',
    title: 'Quantidade de turmas por professor',
    subtitle: 'Total de turmas que cada professor ministra.',
    columns: [
      { key: 'professor', label: 'Professor' },
      { key: 'total', label: 'Qtd. turmas' }
    ]
  },
  {
    key: 'professor_disciplinas',
    title: 'Disciplinas por professor',
    subtitle: 'Nome de cada professor e disciplinas ministradas.',
    columns: [
      { key: 'professor', label: 'Professor' },
      { key: 'disciplinas', label: 'Disciplinas' }
    ]
  },
  {
    key: 'disciplinas_sem_turma',
    title: 'Disciplinas sem turmas',
    subtitle: 'Disciplinas cadastradas sem nenhuma turma aberta.',
    columns: [
      { key: 'codigo', label: 'Cod. disciplina' },
      { key: 'disciplina', label: 'Disciplina' }
    ]
  },
  {
    key: 'provas_nao_aplicadas',
    title: 'Provas nao aplicadas',
    subtitle: 'Provas vinculadas a disciplinas ainda sem aplicacao registrada.',
    columns: [
      { key: 'prova', label: 'Cod. prova' },
      { key: 'disciplina', label: 'Disciplina' },
      { key: 'situacao', label: 'Situacao' }
    ]
  },
  {
    key: 'disciplina_total_turmas',
    title: 'Quantidade de turmas por disciplina',
    subtitle: 'Nome da disciplina e total de turmas vinculadas.',
    columns: [
      { key: 'disciplina', label: 'Disciplina' },
      { key: 'total', label: 'Qtd. turmas' }
    ]
  }
]

const DEFAULT_READY_QUERY_TEXTS: Record<ReadyQueryKey, string> = {
  aluno_turmas: `SELECT
  a.matricula_id AS matricula,
  a.nome AS aluno,
  t.codigo AS codigo_turma,
  t.turno,
  t.horario
FROM alunos a
JOIN matriculas_em_turma m ON m.aluno_id = a.id
JOIN turmas t ON t.id = m.turma_id
ORDER BY a.nome, t.codigo;`,
  professor_disciplina: `SELECT DISTINCT
  p.registro AS matricula_professor,
  p.nome AS professor,
  d.codigo AS codigo_disciplina,
  d.nome AS disciplina
FROM professores p
JOIN turmas t ON t.professor_id = p.id
JOIN disciplinas d ON d.id = t.disciplina_id
ORDER BY p.nome, d.nome;`,
  alunos_sem_turma: `SELECT
  a.matricula_id AS matricula,
  a.nome AS aluno
FROM alunos a
WHERE NOT EXISTS (
  SELECT 1
  FROM matriculas_em_turma m
  WHERE m.aluno_id = a.id
)
ORDER BY a.nome;`,
  turma_prova_media: `SELECT
  t.id AS turma_id,
  d.nome AS disciplina,
  p.codigo AS codigo_prova,
  CASE WHEN COUNT(r.data_realizacao) > 0 OR COUNT(r.nota) > 0
       THEN 'Aplicada'
       ELSE 'Nao aplicada'
  END AS situacao_prova,
  ROUND(AVG(r.nota), 2) AS media_notas
FROM turmas t
JOIN disciplinas d ON d.id = t.disciplina_id
JOIN provas p ON p.turma_id = t.id
LEFT JOIN resultados_prova r ON r.prova_id = p.id
GROUP BY t.id, d.nome, p.codigo
ORDER BY t.id, p.codigo;`,
  professor_prova_notas: `SELECT
  prof.registro AS matricula_professor,
  prof.nome AS professor,
  t.id AS turma_id,
  d.nome AS disciplina,
  p.codigo AS codigo_prova,
  CASE WHEN COUNT(r.data_realizacao) > 0 OR COUNT(r.nota) > 0
       THEN 'Aplicada'
       ELSE 'Nao aplicada'
  END AS situacao_prova,
  ROUND(AVG(r.nota), 2) AS media_notas,
  MAX(r.nota) AS maior_nota,
  MIN(r.nota) AS menor_nota
FROM professores prof
JOIN turmas t ON t.professor_id = prof.id
JOIN disciplinas d ON d.id = t.disciplina_id
JOIN provas p ON p.turma_id = t.id
LEFT JOIN resultados_prova r ON r.prova_id = p.id
GROUP BY prof.registro, prof.nome, t.id, d.nome, p.codigo
ORDER BY prof.nome, t.id, p.codigo;`,
  professor_total_turmas: `SELECT
  p.nome AS professor,
  COUNT(t.id) AS quantidade_turmas
FROM professores p
LEFT JOIN turmas t ON t.professor_id = p.id
GROUP BY p.nome
ORDER BY quantidade_turmas DESC, p.nome;`,
  professor_disciplinas: `SELECT
  p.nome AS professor,
  LISTAGG(DISTINCT d.nome, ', ') WITHIN GROUP (ORDER BY d.nome) AS disciplinas
FROM professores p
JOIN turmas t ON t.professor_id = p.id
JOIN disciplinas d ON d.id = t.disciplina_id
GROUP BY p.nome
ORDER BY p.nome;`,
  disciplinas_sem_turma: `SELECT
  d.codigo AS codigo_disciplina,
  d.nome AS disciplina
FROM disciplinas d
WHERE NOT EXISTS (
  SELECT 1
  FROM turmas t
  WHERE t.disciplina_id = d.id
)
ORDER BY d.nome;`,
  provas_nao_aplicadas: `SELECT
  p.codigo AS codigo_prova,
  d.nome AS disciplina,
  'Nao aplicada' AS situacao
FROM provas p
JOIN turmas t ON t.id = p.turma_id
JOIN disciplinas d ON d.id = t.disciplina_id
WHERE NOT EXISTS (
  SELECT 1
  FROM resultados_prova r
  WHERE r.prova_id = p.id
    AND (r.data_realizacao IS NOT NULL OR r.nota IS NOT NULL)
)
ORDER BY d.nome, p.codigo;`,
  disciplina_total_turmas: `SELECT
  d.nome AS disciplina,
  COUNT(t.id) AS quantidade_turmas
FROM disciplinas d
LEFT JOIN turmas t ON t.disciplina_id = d.id
GROUP BY d.nome
ORDER BY quantidade_turmas DESC, d.nome;`
}

function loadReadyQueryTexts() {
  try {
    return {
      ...DEFAULT_READY_QUERY_TEXTS,
      ...(JSON.parse(
        localStorage.getItem(READY_QUERY_STORAGE_KEY) ?? '{}'
      ) as Partial<Record<ReadyQueryKey, string>>)
    }
  } catch {
    return DEFAULT_READY_QUERY_TEXTS
  }
}

const readyValue = (value: string | number | null | undefined) =>
  value === null || value === undefined || value === '' ? '-' : value

const fmtReadyNumber = (value: number | null | undefined) =>
  value === null || value === undefined || !Number.isFinite(value)
    ? '-'
    : value.toFixed(2)

const avgReady = (values: number[]) =>
  values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null

const uniqueBy = <T,>(items: T[], getKey: (item: T) => string) => {
  const seen = new Set<string>()
  return items.filter(item => {
    const key = getKey(item)
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

const parseTurmaHorario = (horario: string | null | undefined) => {
  const raw = horario?.trim() ?? ''
  const times = raw.match(/\d{1,2}:\d{2}/g) ?? []
  const day = raw
    .split(/\d{1,2}:\d{2}/)[0]
    ?.replace(/[-–|]/g, ' ')
    .trim()
  return {
    dia: day || raw || '-',
    inicio: times[0] ?? '-',
    fim: times[1] ?? '-'
  }
}

const groupRelatorioByProva = (rows: RelatorioAcademicoRow[]) => {
  const groups = new Map<number, RelatorioAcademicoRow[]>()
  rows.forEach(row => {
    if (row.provaId == null) return
    groups.set(row.provaId, [...(groups.get(row.provaId) ?? []), row])
  })
  return Array.from(groups.values())
}

const provaSituacao = (rows: RelatorioAcademicoRow[]) =>
  rows.some(row => row.resultadoDataRealizacao || row.resultadoNota != null)
    ? 'Aplicada'
    : 'Nao aplicada'

function buildReadyRows(
  key: ReadyQueryKey,
  rows: RelatorioAcademicoRow[],
  alunos: Awaited<ReturnType<typeof listarAlunos>>,
  professores: Awaited<ReturnType<typeof listarProfessores>>,
  disciplinas: Awaited<ReturnType<typeof listarDisciplinas>>,
  turmas: Awaited<ReturnType<typeof listarTurmas>>
): ReadyRow[] {
  const professorRegistro = new Map(professores.map(p => [p.id, p.registro]))

  if (key === 'aluno_turmas') {
    return uniqueBy(
      rows
        .filter(row => row.alunoMatricula && row.alunoNome && row.turmaCodigo)
        .map(row => {
          const horario = parseTurmaHorario(row.turmaHorario)
          return {
            matricula: readyValue(row.alunoMatricula),
            aluno: readyValue(row.alunoNome),
            turma: readyValue(row.turmaCodigo),
            turno: readyValue(row.turmaTurno),
            dia: horario.dia,
            inicio: horario.inicio,
            fim: horario.fim
          }
        }),
      row => `${row.matricula}-${row.turma}`
    )
  }

  if (key === 'professor_disciplina') {
    return uniqueBy(
      turmas
        .filter(turma => turma.professor && turma.disciplina)
        .map(turma => ({
          registro: readyValue(turma.professor?.registro ?? turma.professor?.id),
          professor: readyValue(turma.professor?.nome),
          codigo: readyValue(turma.disciplina?.codigo),
          disciplina: readyValue(turma.disciplina?.nome)
        })),
      row => `${row.registro}-${row.codigo}`
    )
  }

  if (key === 'alunos_sem_turma') {
    const alunosComTurma = new Set(
      rows
        .filter(row => row.alunoId != null && row.turmaId != null)
        .map(row => row.alunoId)
    )
    return alunos
      .filter(aluno => !alunosComTurma.has(aluno.id))
      .map(aluno => ({ matricula: aluno.matriculaId, aluno: aluno.nome }))
  }

  if (key === 'turma_prova_media') {
    return groupRelatorioByProva(rows).map(group => {
      const first = group[0]
      const notas = group
        .map(row => row.resultadoNota)
        .filter((nota): nota is number => typeof nota === 'number')
      return {
        turmaId: readyValue(first.turmaId),
        disciplina: readyValue(first.disciplinaNome),
        prova: readyValue(first.provaCodigo),
        situacao: provaSituacao(group),
        media: fmtReadyNumber(avgReady(notas))
      }
    })
  }

  if (key === 'professor_prova_notas') {
    return groupRelatorioByProva(rows).map(group => {
      const first = group[0]
      const notas = group
        .map(row => row.resultadoNota)
        .filter((nota): nota is number => typeof nota === 'number')
      return {
        registro: readyValue(
          first.professorId != null
            ? professorRegistro.get(first.professorId)
            : undefined
        ),
        professor: readyValue(first.professorNome),
        turmaId: readyValue(first.turmaId),
        disciplina: readyValue(first.disciplinaNome),
        prova: readyValue(first.provaCodigo),
        situacao: provaSituacao(group),
        media: fmtReadyNumber(avgReady(notas)),
        maior: fmtReadyNumber(notas.length ? Math.max(...notas) : null),
        menor: fmtReadyNumber(notas.length ? Math.min(...notas) : null)
      }
    })
  }

  if (key === 'professor_total_turmas') {
    const totals = new Map<number, { nome: string; total: number }>()
    turmas.forEach(turma => {
      if (!turma.professor) return
      const current = totals.get(turma.professor.id) ?? {
        nome: turma.professor.nome,
        total: 0
      }
      current.total += 1
      totals.set(turma.professor.id, current)
    })
    return Array.from(totals.values())
      .map(item => ({ professor: item.nome, total: item.total }))
      .sort((a, b) => Number(b.total) - Number(a.total))
  }

  if (key === 'professor_disciplinas') {
    const groups = new Map<number, { nome: string; disciplinas: Set<string> }>()
    turmas.forEach(turma => {
      if (!turma.professor || !turma.disciplina) return
      const current = groups.get(turma.professor.id) ?? {
        nome: turma.professor.nome,
        disciplinas: new Set<string>()
      }
      current.disciplinas.add(turma.disciplina.nome)
      groups.set(turma.professor.id, current)
    })
    return Array.from(groups.values()).map(item => ({
      professor: item.nome,
      disciplinas: Array.from(item.disciplinas).sort().join(', ')
    }))
  }

  if (key === 'disciplinas_sem_turma') {
    const disciplinasComTurma = new Set(
      turmas
        .map(turma => turma.disciplina?.id)
        .filter((id): id is number => typeof id === 'number')
    )
    return disciplinas
      .filter(disciplina => !disciplinasComTurma.has(disciplina.id))
      .map(disciplina => ({
        codigo: disciplina.codigo,
        disciplina: disciplina.nome
      }))
  }

  if (key === 'provas_nao_aplicadas') {
    return groupRelatorioByProva(rows)
      .filter(group => provaSituacao(group) === 'Nao aplicada')
      .map(group => ({
        prova: readyValue(group[0].provaCodigo),
        disciplina: readyValue(group[0].disciplinaNome),
        situacao: 'Nao aplicada'
      }))
  }

  const totals = new Map<number, { nome: string; total: number }>()
  disciplinas.forEach(disciplina => {
    totals.set(disciplina.id, { nome: disciplina.nome, total: 0 })
  })
  turmas.forEach(turma => {
    if (!turma.disciplina) return
    const current = totals.get(turma.disciplina.id) ?? {
      nome: turma.disciplina.nome,
      total: 0
    }
    current.total += 1
    totals.set(turma.disciplina.id, current)
  })
  return Array.from(totals.values())
    .map(item => ({ disciplina: item.nome, total: item.total }))
    .sort((a, b) => Number(b.total) - Number(a.total))
}

const readyNumber = (value: string | number | undefined) => {
  if (typeof value === 'number') return value
  if (typeof value !== 'string') return null
  const parsed = Number(value.replace(',', '.'))
  return Number.isFinite(parsed) ? parsed : null
}

const readyChartRows = (rows: ReadyRow[], query: ReadyQuery) => {
  const labelColumn =
    query.columns.find(column => readyNumber(rows[0]?.[column.key]) === null) ??
    query.columns[0]
  const valueColumn = ['total', 'media', 'maior', 'menor']
    .map(key => query.columns.find(column => column.key === key))
    .find((column): column is ReadyColumn => !!column)
  const grouped = new Map<string, number>()

  rows.forEach(row => {
    const label = String(readyValue(row[labelColumn.key]))
    const number = valueColumn ? readyNumber(row[valueColumn.key]) : null
    grouped.set(label, (grouped.get(label) ?? 0) + (number ?? 1))
  })

  return Array.from(grouped.entries())
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value || a.label.localeCompare(b.label))
    .slice(0, 12)
}

function downloadReadyCsv(filename: string, rows: ReadyRow[], columns: ReadyColumn[]) {
  if (rows.length === 0) return
  const csv = [
    columns.map(column => `"${column.label.replace(/"/g, '""')}"`).join(','),
    ...rows.map(row =>
      columns
        .map(column => `"${String(readyValue(row[column.key])).replace(/"/g, '""')}"`)
        .join(',')
    )
  ].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

function ConsultasProntas() {
  const [selected, setSelected] = useState<ReadyQueryKey>('aluno_turmas')
  const [started, setStarted] = useState<ReadyQueryKey | null>(null)
  const [carouselPage, setCarouselPage] = useState(0)
  const [resultPage, setResultPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)
  const [view, setView] = useState<ReadyView>('table')
  const [openDevMenu, setOpenDevMenu] = useState<ReadyQueryKey | null>(null)
  const [queryModal, setQueryModal] = useState<{
    key: ReadyQueryKey
    mode: ReadyQueryModalMode
  } | null>(null)
  const [queryTexts, setQueryTexts] = useState(loadReadyQueryTexts)
  const [queryDraft, setQueryDraft] = useState('')
  const relatorio = useQuery({
    queryKey: ['consultas', 'relatorio-academico'],
    queryFn: relatorioAcademico
  })
  const alunos = useQuery({ queryKey: ['alunos'], queryFn: listarAlunos })
  const professores = useQuery({
    queryKey: ['professores'],
    queryFn: listarProfessores
  })
  const disciplinas = useQuery({
    queryKey: ['disciplinas'],
    queryFn: () => listarDisciplinas()
  })
  const turmas = useQuery({ queryKey: ['turmas'], queryFn: () => listarTurmas() })

  const loading =
    relatorio.isLoading ||
    alunos.isLoading ||
    professores.isLoading ||
    disciplinas.isLoading ||
    turmas.isLoading
  const error =
    relatorio.error ||
    alunos.error ||
    professores.error ||
    disciplinas.error ||
    turmas.error
  const selectedQuery =
    READY_QUERIES.find(item => item.key === selected) ?? READY_QUERIES[0]
  const activeQuery =
    READY_QUERIES.find(item => item.key === started) ?? selectedQuery
  const carouselPages = Math.ceil(READY_QUERIES.length / READY_CAROUSEL_SIZE)
  const visibleQueries = READY_QUERIES.slice(
    carouselPage * READY_CAROUSEL_SIZE,
    carouselPage * READY_CAROUSEL_SIZE + READY_CAROUSEL_SIZE
  )

  const readyRows = useMemo(
    () =>
      buildReadyRows(
        started ?? selected,
        relatorio.data ?? [],
        alunos.data ?? [],
        professores.data ?? [],
        disciplinas.data ?? [],
        turmas.data ?? []
      ),
    [alunos.data, disciplinas.data, professores.data, relatorio.data, selected, started, turmas.data]
  )
  const totalPages = Math.max(1, Math.ceil(readyRows.length / pageSize))
  const safePage = Math.min(resultPage, totalPages)
  const pagedRows = readyRows.slice((safePage - 1) * pageSize, safePage * pageSize)
  const chartRows = useMemo(
    () => readyChartRows(readyRows, activeQuery),
    [activeQuery, readyRows]
  )
  const maxChartValue = Math.max(...chartRows.map(row => row.value), 1)
  const totalChartValue = chartRows.reduce((sum, row) => sum + row.value, 0)
  const modalQuery = queryModal
    ? READY_QUERIES.find(item => item.key === queryModal.key)
    : null

  useEffect(() => {
    localStorage.setItem(READY_QUERY_STORAGE_KEY, JSON.stringify(queryTexts))
  }, [queryTexts])

  const openQueryModal = (key: ReadyQueryKey, mode: ReadyQueryModalMode) => {
    setQueryDraft(queryTexts[key] ?? DEFAULT_READY_QUERY_TEXTS[key])
    setQueryModal({ key, mode })
    setOpenDevMenu(null)
  }

  const saveQueryDraft = () => {
    if (!queryModal) return
    setQueryTexts(current => ({
      ...current,
      [queryModal.key]: queryDraft
    }))
    setQueryModal(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-10 text-text-muted">
        <Spinner /> Carregando consultas prontas...
      </div>
    )
  }

  if (error) {
    return <ErrorBox msg={errorMessage(error)} />
  }

  return (
    <div className="flex flex-col gap-5">
      <Card
        title="Consultas prontas"
        subtitle="Escolha um preset no carrossel e clique em Iniciar para carregar o resultado."
        actions={
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Consultas anteriores"
              onClick={() => setCarouselPage(page => Math.max(0, page - 1))}
              disabled={carouselPage === 0}
              className="ready-carousel-nav"
            >
              <span aria-hidden>‹</span>
            </button>
            <div className="flex items-center gap-1.5">
              {Array.from({ length: carouselPages }).map((_, page) => (
                <button
                  key={page}
                  type="button"
                  aria-label={`Ir para pagina ${page + 1}`}
                  onClick={() => setCarouselPage(page)}
                  className={[
                    'ready-carousel-dot',
                    page === carouselPage ? 'ready-carousel-dot-active' : ''
                  ].join(' ')}
                />
              ))}
            </div>
            <button
              type="button"
              aria-label="Proximas consultas"
              onClick={() =>
                setCarouselPage(page => Math.min(carouselPages - 1, page + 1))
              }
              disabled={carouselPage >= carouselPages - 1}
              className="ready-carousel-nav"
            >
              <span aria-hidden>›</span>
            </button>
          </div>
        }
      >
        <div className="ready-carousel-window">
          <div
            key={carouselPage}
            className="ready-carousel-page grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5"
          >
            {visibleQueries.map((item, offset) => {
              const active = item.key === selected
              const index = READY_QUERIES.findIndex(query => query.key === item.key)
              return (
                <div
                  key={item.key}
                  onClick={() => setSelected(item.key)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      setSelected(item.key)
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  style={{ animationDelay: `${offset * 55}ms` }}
                  className={[
                    'ready-query-card min-h-36 rounded-card border p-4 pr-11 text-left',
                    active
                      ? 'ready-query-card-active border-primary bg-primary-light text-primary-dark'
                      : 'border-surface-border bg-surface-card text-text'
                  ].join(' ')}
                >
                  <button
                    type="button"
                    aria-label={`Opcoes da consulta ${index + 1}`}
                    onClick={e => {
                      e.stopPropagation()
                      setOpenDevMenu(current =>
                        current === item.key ? null : item.key
                      )
                    }}
                    className="ready-query-menu-button"
                  >
                    <span aria-hidden className="ready-query-dots">
                      <span />
                      <span />
                      <span />
                    </span>
                  </button>
                  {openDevMenu === item.key && (
                    <div
                      className="ready-query-dev-menu"
                      onClick={e => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => openQueryModal(item.key, 'view')}
                      >
                        Visualizar query
                      </button>
                      <button
                        type="button"
                        onClick={() => openQueryModal(item.key, 'edit')}
                      >
                        Atualizar query
                      </button>
                    </div>
                  )}
                  <span className="ready-query-index">
                    Consulta {index + 1}
                  </span>
                  <span className="mt-3 block text-base font-semibold">
                    {item.title}
                  </span>
                  <span className="mt-2 block text-sm text-text-muted">
                    {item.subtitle}
                  </span>
                  <span className="mt-4 inline-flex items-center text-xs font-semibold uppercase tracking-wide">
                    {active ? 'Selecionada' : 'Ver preset'}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-3 rounded-card border border-surface-border bg-surface p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-text">{selectedQuery.title}</p>
            <p className="text-sm text-text-muted">{selectedQuery.subtitle}</p>
          </div>
          <Button
            type="button"
            onClick={() => {
              setStarted(selected)
              setResultPage(1)
              setView('table')
            }}
          >
            Iniciar
          </Button>
        </div>
      </Card>

      {started && (
        <Card
          title={activeQuery.title}
          subtitle={`${readyRows.length} registro(s) encontrados`}
          actions={
            <div className="flex flex-wrap items-center gap-2">
              {(['table', 'bar', 'kpi'] as ReadyView[]).map(option => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setView(option)}
                  className={[
                    'rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors',
                    view === option
                      ? 'border-primary bg-primary text-white'
                      : 'border-surface-border bg-white text-text hover:border-primary'
                  ].join(' ')}
                >
                  {option === 'table'
                    ? 'Tabela'
                    : option === 'bar'
                      ? 'Grafico'
                      : 'Resumo'}
                </button>
              ))}
              <button
                type="button"
                onClick={() =>
                  downloadReadyCsv('consulta-pronta.csv', readyRows, activeQuery.columns)
                }
                className="rounded-full border border-surface-border bg-white px-3 py-1.5 text-xs font-semibold text-text hover:border-primary"
              >
                CSV
              </button>
            </div>
          }
        >
          {view === 'kpi' ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <StatCard label="Registros" value={readyRows.length} />
              <StatCard label="Grupos no grafico" value={chartRows.length} />
              <StatCard label="Total calculado" value={totalChartValue.toFixed(0)} />
            </div>
          ) : view === 'bar' ? (
            <div className="space-y-4">
              {chartRows.length === 0 ? (
                <p className="text-sm text-text-muted">Sem dados para grafico.</p>
              ) : (
                chartRows.map(row => (
                  <div key={row.label}>
                    <div className="mb-1 flex justify-between gap-3 text-sm">
                      <span className="truncate font-medium text-text">{row.label}</span>
                      <span className="font-semibold text-text-muted">
                        {row.value}
                      </span>
                    </div>
                    <div className="h-4 overflow-hidden rounded-full bg-surface">
                      <div
                        className="h-full bg-primary"
                        style={{
                          width: `${Math.max((row.value / maxChartValue) * 100, 3)}%`
                        }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs text-text-muted">
                  Pagina {safePage} de {totalPages}
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-text-muted">
                    Linhas
                  </span>
                  <select
                    value={pageSize}
                    onChange={e => {
                      setPageSize(Number(e.target.value))
                      setResultPage(1)
                    }}
                    className="h-8 rounded-lg border border-surface-border bg-white px-2 text-xs text-text"
                  >
                    {READY_PAGE_SIZE_OPTIONS.map(size => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="border-b border-surface-border text-xs uppercase tracking-wide text-text-muted">
                    <tr>
                      {activeQuery.columns.map(column => (
                        <th
                          key={column.key}
                          className="whitespace-nowrap py-2 pr-4"
                        >
                          {column.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-border">
                    {pagedRows.length === 0 ? (
                      <tr>
                        <td
                          colSpan={activeQuery.columns.length}
                          className="py-8 text-center text-text-muted"
                        >
                          Nenhum registro encontrado para esta consulta.
                        </td>
                      </tr>
                    ) : (
                      pagedRows.map((row, index) => (
                        <tr key={index} className="hover:bg-surface">
                          {activeQuery.columns.map(column => (
                            <td
                              key={column.key}
                              className="whitespace-nowrap py-2 pr-4 text-text"
                            >
                              {readyValue(row[column.key])}
                            </td>
                          ))}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs text-text-muted">
                  Mostrando {pagedRows.length} de {readyRows.length} registro(s).
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setResultPage(page => Math.max(1, page - 1))}
                    disabled={safePage === 1}
                  >
                    Anterior
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setResultPage(page => Math.min(totalPages, page + 1))
                    }
                    disabled={safePage >= totalPages}
                  >
                    Proxima
                  </Button>
                </div>
              </div>
            </>
          )}
        </Card>
      )}

      <Modal
        open={!!queryModal}
        onClose={() => setQueryModal(null)}
        title={
          queryModal?.mode === 'edit'
            ? 'Atualizar query'
            : 'Visualizar query'
        }
        size="lg"
      >
        <div className="flex flex-col gap-3">
          <div>
            <p className="text-sm font-semibold text-text">
              {modalQuery?.title ?? 'Consulta pronta'}
            </p>
            <p className="text-sm text-text-muted">
              {queryModal?.mode === 'edit'
                ? 'Edicao local para documentar/ajustar a query exibida neste preset.'
                : 'Query de referencia usada para explicar o preset.'}
            </p>
          </div>

          {queryModal?.mode === 'edit' ? (
            <textarea
              value={queryDraft}
              onChange={e => setQueryDraft(e.target.value)}
              className="min-h-80 w-full rounded-card border border-surface-border bg-white p-3 font-mono text-xs leading-relaxed text-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              spellCheck={false}
            />
          ) : (
            <pre className="max-h-[60vh] overflow-auto rounded-card border border-surface-border bg-surface p-3 font-mono text-xs leading-relaxed text-text">
              {queryDraft}
            </pre>
          )}

          {queryModal?.mode === 'edit' && (
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setQueryModal(null)}
              >
                Cancelar
              </Button>
              <Button type="button" onClick={saveQueryDraft}>
                Salvar query
              </Button>
            </div>
          )}
        </div>
      </Modal>
    </div>
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
