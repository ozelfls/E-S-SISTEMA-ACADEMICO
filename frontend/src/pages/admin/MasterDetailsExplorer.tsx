import { useEffect, useMemo, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { listarAlunos } from '../../api/alunos'
import {
  detalhesDaTurma,
  historicoDaDisciplina,
  relatorioAcademico,
  trajetoriaDoAluno,
  turmasDoProfessor,
  type RelatorioAcademicoRow
} from '../../api/consultas'
import { listarCursos } from '../../api/cursos'
import { listarDisciplinas } from '../../api/disciplinas'
import { listarProfessores } from '../../api/professores'
import { listarTurmas } from '../../api/turmas'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Pagination } from '../../components/ui/Pagination'
import { Spinner } from '../../components/ui/Spinner'
import {
  EmptyRow,
  TBody,
  TD,
  TH,
  THead,
  TR,
  Table
} from '../../components/ui/Table'

type MasterMode =
  | 'curso'
  | 'professor'
  | 'aluno'
  | 'disciplina'
  | 'turma'
  | 'prova'
  | 'matricula'
  | 'resultado'

type NodeKind = MasterMode

interface TreeNode {
  id: string
  kind: NodeKind
  refId: number
  label: string
  sublabel: string
  metrics: Record<string, string | number>
  rows?: RelatorioAcademicoRow[]
  children: TreeNode[]
}

const MASTER_OPTIONS: Array<{
  key: MasterMode
  label: string
  hint: string
}> = [
  { key: 'curso', label: 'Curso', hint: 'Curso > disciplinas > turmas' },
  { key: 'professor', label: 'Professor', hint: 'Professor > turmas' },
  { key: 'aluno', label: 'Aluno', hint: 'Aluno > matriculas e provas' },
  { key: 'disciplina', label: 'Disciplina', hint: 'Disciplina > turmas' },
  { key: 'turma', label: 'Turma', hint: 'Turma > alunos e provas' },
  { key: 'prova', label: 'Prova', hint: 'Prova > resultados' },
  { key: 'matricula', label: 'Matricula', hint: 'Matricula > provas/resultados' },
  { key: 'resultado', label: 'Resultado', hint: 'Resultado > aluno/prova' }
]

const TREE_PAGE_SIZE = 25

const kindLabel: Record<NodeKind, string> = {
  curso: 'Curso',
  professor: 'Professor',
  aluno: 'Aluno',
  disciplina: 'Disciplina',
  turma: 'Turma',
  prova: 'Prova',
  matricula: 'Matricula',
  resultado: 'Resultado'
}

const fmt = (value: number | null | undefined) =>
  value == null ? '-' : value.toFixed(2)

function uniqueCount<T>(items: T[], getKey: (item: T) => number | null | undefined) {
  const set = new Set<number>()
  items.forEach(item => {
    const key = getKey(item)
    if (typeof key === 'number') set.add(key)
  })
  return set.size
}

function groupBy<T>(items: T[], getKey: (item: T) => number | null | undefined) {
  const map = new Map<number, T[]>()
  items.forEach(item => {
    const key = getKey(item)
    if (typeof key !== 'number') return
    const current = map.get(key) ?? []
    current.push(item)
    map.set(key, current)
  })
  return map
}

function findNode(nodes: TreeNode[], id: string): TreeNode | null {
  for (const node of nodes) {
    if (node.id === id) return node
    const found = findNode(node.children, id)
    if (found) return found
  }
  return null
}

function nodeMatches(node: TreeNode, query: string) {
  const q = query.trim().toLowerCase()
  if (!q) return true
  const metrics = Object.entries(node.metrics)
    .map(([key, value]) => `${key} ${value}`)
    .join(' ')
  const haystack = [
    node.id,
    node.refId,
    kindLabel[node.kind],
    node.label,
    node.sublabel,
    metrics
  ]
    .join(' ')
    .toLowerCase()
  return haystack.includes(q)
}

function filterTree(nodes: TreeNode[], query: string): TreeNode[] {
  const q = query.trim()
  if (!q) return nodes
  return nodes
    .map(node => {
      const children = filterTree(node.children, q)
      if (nodeMatches(node, q) || children.length > 0) {
        return { ...node, children }
      }
      return null
    })
    .filter((node): node is TreeNode => node !== null)
}

function collectIds(nodes: TreeNode[]) {
  const ids = new Set<string>()
  const visit = (node: TreeNode) => {
    ids.add(node.id)
    node.children.forEach(visit)
  }
  nodes.forEach(visit)
  return ids
}

function avg(values: Array<number | null | undefined>) {
  const nums = values.filter((value): value is number => typeof value === 'number')
  return nums.length ? nums.reduce((sum, value) => sum + value, 0) / nums.length : null
}

function buildLightTrees(
  mode: MasterMode,
  base: Awaited<ReturnType<typeof loadBaseData>>
): TreeNode[] {
  const { cursos, professores, alunos, disciplinas, turmas } = base

  if (mode === 'curso') {
    return cursos
      .map(curso => {
        const disciplinasDoCurso = disciplinas.filter(d => d.curso?.id === curso.id)
        const turmasDoCurso = turmas.filter(t => t.disciplina?.curso?.id === curso.id)
        const alunosDoCurso = alunos.filter(a => a.curso?.id === curso.id)
        return {
          id: `curso-${curso.id}`,
          kind: 'curso',
          refId: curso.id,
          label: curso.nome,
          sublabel: `${curso.chTotal}h`,
          metrics: {
            alunos: alunosDoCurso.length,
            disciplinas: disciplinasDoCurso.length,
            turmas: turmasDoCurso.length
          },
          children: disciplinasDoCurso.map(disciplina => ({
            id: `disciplina-${disciplina.id}`,
            kind: 'disciplina',
            refId: disciplina.id,
            label: disciplina.nome,
            sublabel: disciplina.codigo,
            metrics: {
              turmas: turmas.filter(t => t.disciplina?.id === disciplina.id).length,
              ch: disciplina.ch
            },
            children: turmas
              .filter(t => t.disciplina?.id === disciplina.id)
              .map(turmaNode)
          }))
        } satisfies TreeNode
      })
      .sort((a, b) => a.label.localeCompare(b.label))
  }

  if (mode === 'professor') {
    return professores
      .map(professor => {
        const turmasDoProfessor = turmas.filter(t => t.professor?.id === professor.id)
        return {
          id: `professor-${professor.id}`,
          kind: 'professor',
          refId: professor.id,
          label: professor.nome,
          sublabel: professor.email ?? professor.registro ?? '-',
          metrics: {
            turmas: turmasDoProfessor.length,
            titulacao: professor.titulacao ?? '-'
          },
          children: turmasDoProfessor.map(turmaNode)
        } satisfies TreeNode
      })
      .sort((a, b) => a.label.localeCompare(b.label))
  }

  if (mode === 'aluno') {
    return alunos
      .map(aluno => ({
        id: `aluno-${aluno.id}`,
        kind: 'aluno',
        refId: aluno.id,
        label: aluno.nome,
        sublabel: `${aluno.matriculaId} - ${aluno.curso?.nome ?? 'Sem curso'}`,
        metrics: {
          curso: aluno.curso?.nome ?? '-',
          turno: aluno.turno
        },
        children: []
      } satisfies TreeNode))
      .sort((a, b) => a.label.localeCompare(b.label))
  }

  if (mode === 'disciplina') {
    return disciplinas
      .map(disciplina => ({
        id: `disciplina-${disciplina.id}`,
        kind: 'disciplina',
        refId: disciplina.id,
        label: disciplina.nome,
        sublabel: `${disciplina.codigo} - ${disciplina.curso?.nome ?? '-'}`,
        metrics: {
          turmas: turmas.filter(t => t.disciplina?.id === disciplina.id).length,
          ch: disciplina.ch
        },
        children: turmas
          .filter(t => t.disciplina?.id === disciplina.id)
          .map(turmaNode)
      } satisfies TreeNode))
      .sort((a, b) => a.label.localeCompare(b.label))
  }

  return turmas
    .map(turmaNode)
    .sort((a, b) => a.label.localeCompare(b.label))
}

function turmaNode(turma: Awaited<ReturnType<typeof loadBaseData>>['turmas'][number]): TreeNode {
  return {
    id: `turma-${turma.id}`,
    kind: 'turma',
    refId: turma.id,
    label: turma.codigo,
    sublabel: `${turma.disciplina?.nome ?? '-'} - ${turma.semestre}/${turma.ano}`,
    metrics: {
      vagas: turma.vagas,
      professor: turma.professor?.nome ?? '-'
    },
    children: []
  }
}

function buildReportTree(mode: MasterMode, rows: RelatorioAcademicoRow[]) {
  const sourceKey =
    mode === 'prova'
      ? 'provaId'
      : mode === 'matricula'
        ? 'matriculaId'
        : 'resultadoId'
  const groups = groupBy(rows, row => row[sourceKey])

  return Array.from(groups.entries())
    .map(([id, group]) => {
      const first = group[0]
      if (mode === 'prova') {
        const resultGroups = groupBy(group, row => row.resultadoId)
        return {
          id: `prova-${id}`,
          kind: 'prova',
          refId: id,
          label: first.provaCodigo ?? `Prova ${id}`,
          sublabel: `${first.turmaCodigo ?? '-'} - ${first.disciplinaNome ?? '-'}`,
          metrics: {
            resultados: uniqueCount(group, row => row.resultadoId),
            media: fmt(avg(group.map(row => row.resultadoNota)))
          },
          rows: group,
          children: Array.from(resultGroups.entries()).map(([resultId, resultRows]) =>
            reportNode('resultado', resultId, resultRows)
          )
        } satisfies TreeNode
      }
      if (mode === 'matricula') {
        return {
          id: `matricula-${id}`,
          kind: 'matricula',
          refId: id,
          label: first.alunoNome ?? `Matricula ${id}`,
          sublabel: `${first.turmaCodigo ?? '-'} - ${first.matriculaSituacao ?? '-'}`,
          metrics: {
            provas: uniqueCount(group, row => row.provaId),
            media: fmt(avg(group.map(row => row.resultadoNota ?? row.matriculaMediaFinal)))
          },
          rows: group,
          children: Array.from(groupBy(group, row => row.provaId).entries()).map(
            ([provaId, provaRows]) => reportNode('prova', provaId, provaRows)
          )
        } satisfies TreeNode
      }
      return reportNode('resultado', id, group)
    })
    .sort((a, b) => a.label.localeCompare(b.label))
}

function reportNode(kind: NodeKind, id: number, rows: RelatorioAcademicoRow[]): TreeNode {
  const first = rows[0]
  return {
    id: `${kind}-${id}`,
    kind,
    refId: id,
    label:
      kind === 'resultado'
        ? `${first.alunoNome ?? '-'} / ${first.provaCodigo ?? '-'}`
        : first.provaCodigo ?? `${kindLabel[kind]} ${id}`,
    sublabel:
      kind === 'resultado'
        ? `Nota ${first.resultadoNota ?? '-'} - ${first.turmaCodigo ?? '-'}`
        : `${first.turmaCodigo ?? '-'} - ${first.disciplinaNome ?? '-'}`,
    metrics: {
      nota: first.resultadoNota ?? '-',
      aluno: first.alunoNome ?? '-'
    },
    rows,
    children: []
  }
}

async function loadBaseData() {
  const [cursos, professores, alunos, disciplinas, turmas] = await Promise.all([
    listarCursos(),
    listarProfessores(),
    listarAlunos(),
    listarDisciplinas(),
    listarTurmas()
  ])
  return { cursos, professores, alunos, disciplinas, turmas }
}

function TreeItem({
  node,
  selectedId,
  expanded,
  onToggle,
  onSelect,
  level = 0
}: {
  node: TreeNode
  selectedId: string | null
  expanded: Set<string>
  onToggle: (id: string) => void
  onSelect: (id: string) => void
  level?: number
}) {
  const isOpen = expanded.has(node.id)
  const selected = selectedId === node.id
  const hasChildren = node.children.length > 0

  return (
    <li>
      <div
        className={`grid grid-cols-[28px_1fr] items-center rounded-card pr-2 ${
          selected ? 'bg-primary-light text-primary-dark' : 'hover:bg-surface'
        }`}
        style={{ paddingLeft: `${level * 14}px` }}
      >
        <button
          type="button"
          aria-label={isOpen ? 'Recolher' : 'Expandir'}
          disabled={!hasChildren}
          onClick={() => hasChildren && onToggle(node.id)}
          className="grid h-9 w-7 place-items-center text-text-muted disabled:opacity-30"
        >
          <span aria-hidden className={`transition-transform ${isOpen ? 'rotate-90' : ''}`}>
            {'>'}
          </span>
        </button>
        <button type="button" onClick={() => onSelect(node.id)} className="min-w-0 py-2 text-left">
          <span className="block truncate text-sm font-semibold">{node.label}</span>
          <span className="block truncate text-xs text-text-muted">{node.sublabel}</span>
        </button>
      </div>
      {hasChildren && isOpen && (
        <ul className="mt-1 space-y-1">
          {node.children.map(child => (
            <TreeItem
              key={child.id}
              node={child}
              selectedId={selectedId}
              expanded={expanded}
              onToggle={onToggle}
              onSelect={onSelect}
              level={level + 1}
            />
          ))}
        </ul>
      )}
    </li>
  )
}

function Metrics({ node }: { node: TreeNode }) {
  const entries = Object.entries(node.metrics).slice(0, 6)
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
      {entries.map(([label, value]) => (
        <div key={label} className="rounded-card border border-surface-border bg-surface px-3 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">{label}</p>
          <p className="mt-1 truncate font-display text-xl font-semibold text-text">{value}</p>
        </div>
      ))}
    </div>
  )
}

function ChildrenTable({ node, onSelect }: { node: TreeNode; onSelect: (id: string) => void }) {
  return (
    <Table>
      <THead>
        <TR>
          <TH>Tipo</TH>
          <TH>Registro</TH>
          <TH>Resumo</TH>
          <TH>Abrir</TH>
        </TR>
      </THead>
      <TBody>
        {node.children.length === 0 && <EmptyRow colSpan={4}>Sem detalhes abaixo.</EmptyRow>}
        {node.children.map(child => (
          <TR key={child.id}>
            <TD><Badge variant="neutral">{kindLabel[child.kind]}</Badge></TD>
            <TD>
              <div className="font-medium text-text">{child.label}</div>
              <div className="text-xs text-text-muted">{child.sublabel}</div>
            </TD>
            <TD>{Object.entries(child.metrics).map(([k, v]) => `${k}: ${v}`).join(' | ')}</TD>
            <TD>
              <Button type="button" size="sm" variant="secondary" onClick={() => onSelect(child.id)}>
                Ver
              </Button>
            </TD>
          </TR>
        ))}
      </TBody>
    </Table>
  )
}

function ProfessorDetails({ id }: { id: number }) {
  const detail = useQuery({
    queryKey: ['consultas', 'professor', id],
    queryFn: () => turmasDoProfessor(id)
  })
  if (detail.isLoading) return <LoadingText text="Carregando turmas do professor..." />
  if (detail.isError || !detail.data) return <ErrorText />
  return (
    <Table>
      <THead>
        <TR><TH>Turma</TH><TH>Disciplina</TH><TH>Curso</TH><TH>Alunos</TH><TH>Provas</TH></TR>
      </THead>
      <TBody>
        {detail.data.turmas.map(t => (
          <TR key={t.id}>
            <TD>{t.codigo}</TD><TD>{t.disciplina.nome}</TD><TD>{t.curso?.nome ?? '-'}</TD><TD>{t.totalAlunos}</TD><TD>{t.totalProvas}</TD>
          </TR>
        ))}
      </TBody>
    </Table>
  )
}

function AlunoDetails({ id }: { id: number }) {
  const detail = useQuery({
    queryKey: ['consultas', 'aluno', id],
    queryFn: () => trajetoriaDoAluno(id)
  })
  if (detail.isLoading) return <LoadingText text="Carregando trajetoria do aluno..." />
  if (detail.isError || !detail.data) return <ErrorText />
  return (
    <Table>
      <THead>
        <TR><TH>Turma</TH><TH>Disciplina</TH><TH>Situacao</TH><TH>Media</TH><TH>Provas</TH></TR>
      </THead>
      <TBody>
        {detail.data.matriculas.map(m => (
          <TR key={m.id}>
            <TD>{m.turma.codigo}</TD><TD>{m.disciplina.nome}</TD><TD><Badge variant="neutral">{m.situacao}</Badge></TD><TD>{fmt(m.mediaPonderada)}</TD><TD>{m.provas.length}</TD>
          </TR>
        ))}
      </TBody>
    </Table>
  )
}

function DisciplinaDetails({ id }: { id: number }) {
  const detail = useQuery({
    queryKey: ['consultas', 'disciplina', id],
    queryFn: () => historicoDaDisciplina(id)
  })
  if (detail.isLoading) return <LoadingText text="Carregando historico da disciplina..." />
  if (detail.isError || !detail.data) return <ErrorText />
  return (
    <Table>
      <THead>
        <TR><TH>Turma</TH><TH>Semestre</TH><TH>Professor</TH><TH>Alunos</TH><TH>Media</TH></TR>
      </THead>
      <TBody>
        {detail.data.turmas.map(t => (
          <TR key={t.id}>
            <TD>{t.codigo}</TD><TD>{t.semestre}/{t.ano}</TD><TD>{t.professor?.nome ?? '-'}</TD><TD>{t.totalAlunos}</TD><TD>{fmt(t.mediaTurma)}</TD>
          </TR>
        ))}
      </TBody>
    </Table>
  )
}

function TurmaDetails({ id }: { id: number }) {
  const detail = useQuery({
    queryKey: ['consultas', 'turma', id],
    queryFn: () => detalhesDaTurma(id)
  })
  if (detail.isLoading) return <LoadingText text="Carregando detalhes da turma..." />
  if (detail.isError || !detail.data) return <ErrorText />
  return (
    <div className="space-y-5">
      <Table>
        <THead>
          <TR><TH>Prova</TH><TH>Peso</TH><TH>Resultados</TH><TH>Media</TH></TR>
        </THead>
        <TBody>
          {detail.data.provas.length === 0 && <EmptyRow colSpan={4}>Sem provas cadastradas.</EmptyRow>}
          {detail.data.provas.map(p => (
            <TR key={p.id}><TD>{p.codigo}</TD><TD>{p.peso}</TD><TD>{p.totalResultados}</TD><TD>{fmt(p.mediaTurma)}</TD></TR>
          ))}
        </TBody>
      </Table>
      <Table>
        <THead>
          <TR><TH>Aluno</TH><TH>Matricula</TH><TH>Situacao</TH><TH>Media</TH><TH>Frequencia</TH></TR>
        </THead>
        <TBody>
          {detail.data.alunos.map(a => (
            <TR key={a.matriculaId}><TD>{a.aluno.nome}</TD><TD>{a.aluno.matriculaId}</TD><TD>{a.situacao}</TD><TD>{fmt(a.mediaPonderada)}</TD><TD>{Math.round(a.frequencia * 100)}%</TD></TR>
          ))}
        </TBody>
      </Table>
    </div>
  )
}

function ReportDetails({ node }: { node: TreeNode }) {
  const rows = node.rows ?? []
  return (
    <Table>
      <THead>
        <TR><TH>Aluno</TH><TH>Curso</TH><TH>Turma</TH><TH>Prova</TH><TH>Nota</TH><TH>Situacao</TH></TR>
      </THead>
      <TBody>
        {rows.length === 0 && <EmptyRow colSpan={6}>Sem linhas vinculadas.</EmptyRow>}
        {rows.slice(0, 80).map((row, index) => (
          <TR key={`${row.resultadoId ?? row.provaId ?? row.matriculaId}-${index}`}>
            <TD>{row.alunoNome ?? '-'}</TD><TD>{row.cursoNome ?? '-'}</TD><TD>{row.turmaCodigo ?? '-'}</TD><TD>{row.provaCodigo ?? '-'}</TD><TD>{row.resultadoNota ?? '-'}</TD><TD>{row.matriculaSituacao ?? '-'}</TD>
          </TR>
        ))}
      </TBody>
    </Table>
  )
}

function LoadingText({ text }: { text: string }) {
  return <div className="flex items-center gap-2 text-sm text-text-muted"><Spinner /> {text}</div>
}

function ErrorText() {
  return <div className="rounded-card border border-primary bg-primary-light px-3 py-2 text-sm text-primary-dark">Nao foi possivel carregar este detalhe.</div>
}

function DetailPanel({ node, onSelect }: { node: TreeNode; onSelect: (id: string) => void }) {
  return (
    <div className="space-y-5">
      <Metrics node={node} />
      {node.children.length > 0 && <ChildrenTable node={node} onSelect={onSelect} />}
      {node.kind === 'professor' && <ProfessorDetails id={node.refId} />}
      {node.kind === 'aluno' && <AlunoDetails id={node.refId} />}
      {node.kind === 'disciplina' && <DisciplinaDetails id={node.refId} />}
      {node.kind === 'turma' && <TurmaDetails id={node.refId} />}
      {(node.kind === 'prova' || node.kind === 'matricula' || node.kind === 'resultado') && <ReportDetails node={node} />}
    </div>
  )
}

export function MasterDetailsExplorer() {
  const [mode, setMode] = useState<MasterMode>('curso')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [treeQuery, setTreeQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [treePage, setTreePage] = useState(1)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const base = useQuery({
    queryKey: ['master-details', 'base'],
    queryFn: loadBaseData
  })
  const report = useQuery({
    queryKey: ['consultas', 'relatorio-academico'],
    queryFn: relatorioAcademico,
    enabled: mode === 'prova' || mode === 'matricula' || mode === 'resultado'
  })

  const tree = useMemo(() => {
    if (mode === 'prova' || mode === 'matricula' || mode === 'resultado') {
      return buildReportTree(mode, report.data ?? [])
    }
    if (!base.data) return []
    return buildLightTrees(mode, base.data)
  }, [base.data, mode, report.data])

  const selected = useMemo(() => {
    if (tree.length === 0) return null
    return selectedId ? findNode(tree, selectedId) ?? tree[0] : tree[0]
  }, [selectedId, tree])

  const filteredTree = useMemo(() => filterTree(tree, treeQuery), [tree, treeQuery])
  const paginatedTree = useMemo(
    () => filteredTree.slice((treePage - 1) * TREE_PAGE_SIZE, treePage * TREE_PAGE_SIZE),
    [filteredTree, treePage]
  )
  const visibleCount = useMemo(() => collectIds(filteredTree).size, [filteredTree])

  const select = (id: string) => {
    setSelectedId(id)
    setExpanded(prev => new Set(prev).add(id))
  }

  const toggle = (id: string) =>
    setExpanded(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const loading = base.isLoading || report.isLoading
  const error = base.isError || report.isError
  const active = MASTER_OPTIONS.find(item => item.key === mode) ?? MASTER_OPTIONS[0]

  useEffect(() => {
    if (!searchOpen) return
    const timer = window.setTimeout(() => searchInputRef.current?.focus(), 180)
    return () => window.clearTimeout(timer)
  }, [searchOpen])

  return (
    <div className="space-y-5">
      <Card title="Escolha o master" subtitle={active.hint}>
        <div className="flex flex-wrap gap-2">
          {MASTER_OPTIONS.map(item => (
            <button
              key={item.key}
              type="button"
              onClick={() => {
                setMode(item.key)
                setSelectedId(null)
                setExpanded(new Set())
                setTreePage(1)
              }}
              className={`h-9 rounded-card border px-3 text-sm font-semibold transition-colors ${
                item.key === mode
                  ? 'border-primary bg-primary text-white'
                  : 'border-surface-border bg-white text-text hover:bg-surface'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </Card>

      {loading ? (
        <LoadingText text="Carregando estrutura master details..." />
      ) : error ? (
        <ErrorText />
      ) : (
        <div className="grid gap-5 xl:grid-cols-[460px_minmax(0,1fr)]">
          <Card
            title="Treeview"
            subtitle={active.hint}
            className="min-w-0 xl:sticky xl:top-20 xl:self-start"
            actions={
              <div className="flex min-w-0 items-center justify-end gap-2">
                <div
                  className={[
                    'search-slide-panel min-w-0',
                    searchOpen ? 'search-slide-panel-open' : 'search-slide-panel-closed'
                  ].join(' ')}
                  aria-hidden={!searchOpen}
                >
                  <Input
                    ref={searchInputRef}
                    className="h-9 px-2.5 text-xs"
                    value={treeQuery}
                    onChange={e => {
                      setTreeQuery(e.target.value)
                      setTreePage(1)
                    }}
                    placeholder="Buscar..."
                    tabIndex={searchOpen ? 0 : -1}
                  />
                </div>
                <button
                  type="button"
                  aria-label="Buscar no treeview"
                  aria-expanded={searchOpen}
                  title="Buscar no treeview"
                  onClick={() => {
                    setSearchOpen(open => !open)
                    if (searchOpen) setTreeQuery('')
                  }}
                  className={`grid h-9 w-9 shrink-0 place-items-center rounded-card border transition-colors ${
                    searchOpen || treeQuery.trim()
                      ? 'border-primary bg-primary-light text-primary-dark'
                      : 'border-surface-border bg-white text-text hover:bg-surface'
                  }`}
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2" aria-hidden>
                    <circle cx="11" cy="11" r="6" />
                    <path d="m16 16 4 4" />
                  </svg>
                </button>
              </div>
            }
          >
            {treeQuery.trim() && (
              <p className="mb-3 text-xs text-text-muted">
                {visibleCount} resultado(s) na arvore filtrada.
              </p>
            )}

            {tree.length === 0 ? (
              <p className="text-sm text-text-muted">Nenhum registro encontrado.</p>
            ) : filteredTree.length === 0 ? (
              <p className="text-sm text-text-muted">
                Nenhum item encontrado para esta busca.
              </p>
            ) : (
              <>
                <ul className="max-h-[70vh] space-y-1 overflow-auto pr-1 scrollbar-thin">
                  {paginatedTree.map(node => (
                    <TreeItem
                      key={node.id}
                      node={node}
                      selectedId={selected?.id ?? null}
                      expanded={expanded}
                      onToggle={toggle}
                      onSelect={select}
                    />
                  ))}
                </ul>
                <Pagination
                  page={treePage}
                  pageSize={TREE_PAGE_SIZE}
                  total={filteredTree.length}
                  onPageChange={setTreePage}
                />
              </>
            )}
          </Card>

          <div className="space-y-5">
            {selected && (
              <>
                <Card>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <Badge variant="neutral">{kindLabel[selected.kind]}</Badge>
                      <h3 className="mt-2 font-display text-2xl font-semibold text-text">{selected.label}</h3>
                      <p className="text-sm text-text-muted">{selected.sublabel}</p>
                    </div>
                    <div className="rounded-card border border-surface-border bg-surface px-3 py-2 text-sm text-text-muted">
                      ID {selected.refId}
                    </div>
                  </div>
                </Card>
                <Card title="Details" noPadding>
                  <div className="p-5">
                    <DetailPanel node={selected} onSelect={select} />
                  </div>
                </Card>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
