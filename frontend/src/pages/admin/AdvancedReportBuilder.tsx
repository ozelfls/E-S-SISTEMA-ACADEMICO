import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  relatorioAcademico,
  type RelatorioAcademicoRow
} from '../../api/consultas'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Spinner } from '../../components/ui/Spinner'

type TableKey =
  | 'alunos'
  | 'professores'
  | 'cursos'
  | 'disciplinas'
  | 'turmas'
  | 'matriculas'
  | 'provas'
  | 'resultados'
type FieldType = 'text' | 'number'
type ChartType =
  | 'table'
  | 'bar'
  | 'pie'
  | 'line'
  | 'kpi'
  | 'stacked'
  | 'heatmap'
  | 'scatter'
  | 'area'
type Primitive = string | number | null | undefined
type Row = Record<string, Primitive>
type FilterOp =
  | 'contains'
  | 'notContains'
  | 'equals'
  | 'notEquals'
  | 'startsWith'
  | 'endsWith'
  | 'inList'
  | 'notInList'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'between'
  | 'min'
  | 'max'
  | 'aboveAvg'
  | 'belowAvg'
  | 'top10Highest'
  | 'top10Lowest'
  | 'empty'
  | 'notEmpty'

interface FieldDef {
  key: string
  label: string
  table: TableKey
  type: FieldType
}

interface FilterDef {
  id: string
  field: string
  op: FilterOp
  value: string
}

interface SavedReport {
  id: string
  name: string
  favorite: boolean
  config: BuilderConfig
}

interface BuilderConfig {
  baseTable: TableKey
  relatedTables: TableKey[]
  selectedFields: string[]
  filters: FilterDef[]
  chartType: ChartType
  xField: string
  yField: string
}

const STORAGE_KEY = 'ghflusao-advanced-reports'
const SELECT_CLS =
  'w-full h-10 rounded-lg border border-surface-border bg-white px-3 text-sm text-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20'
const SOFT_RED = '#FB7185'
const SOFT_RED_RGB = '251, 113, 133'

const TABLES: Array<{ key: TableKey; label: string; hint: string }> = [
  { key: 'alunos', label: 'Alunos', hint: 'cadastro, curso e turno' },
  { key: 'professores', label: 'Professores', hint: 'docentes e carga' },
  { key: 'cursos', label: 'Cursos', hint: 'estrutura academica' },
  { key: 'disciplinas', label: 'Disciplinas', hint: 'grade e curso' },
  { key: 'turmas', label: 'Turmas', hint: 'oferta, docente e vagas' },
  { key: 'matriculas', label: 'Matriculas', hint: 'vinculo aluno-turma' },
  { key: 'provas', label: 'Provas', hint: 'avaliacoes por turma' },
  { key: 'resultados', label: 'Resultados', hint: 'notas, presenca e duracao' }
]

const CHARTS: Array<{ key: ChartType; label: string }> = [
  { key: 'table', label: 'Tabela' },
  { key: 'bar', label: 'Barras' },
  { key: 'pie', label: 'Pizza' },
  { key: 'line', label: 'Linha' },
  { key: 'kpi', label: 'KPI/card' },
  { key: 'stacked', label: 'Stacked bar' },
  { key: 'heatmap', label: 'Heatmap' },
  { key: 'scatter', label: 'Scatter' },
  { key: 'area', label: 'Area' }
]

const FIELDS: FieldDef[] = [
  { key: 'aluno_nome', label: 'Nome do aluno', table: 'alunos', type: 'text' },
  { key: 'aluno_email', label: 'E-mail do aluno', table: 'alunos', type: 'text' },
  { key: 'aluno_turno', label: 'Turno do aluno', table: 'alunos', type: 'text' },
  { key: 'aluno_matricula', label: 'Matricula do aluno', table: 'alunos', type: 'number' },
  { key: 'professor_nome', label: 'Nome do professor', table: 'professores', type: 'text' },
  { key: 'professor_email', label: 'E-mail do professor', table: 'professores', type: 'text' },
  { key: 'professor_titulacao', label: 'Titulacao', table: 'professores', type: 'text' },
  { key: 'professor_turmas', label: 'Turmas do professor', table: 'professores', type: 'number' },
  { key: 'curso_nome', label: 'Nome do curso', table: 'cursos', type: 'text' },
  { key: 'curso_ch', label: 'Carga horaria do curso', table: 'cursos', type: 'number' },
  { key: 'curso_alunos', label: 'Alunos no curso', table: 'cursos', type: 'number' },
  { key: 'curso_disciplinas', label: 'Disciplinas no curso', table: 'cursos', type: 'number' },
  { key: 'disciplina_nome', label: 'Nome da disciplina', table: 'disciplinas', type: 'text' },
  { key: 'disciplina_codigo', label: 'Codigo da disciplina', table: 'disciplinas', type: 'text' },
  { key: 'disciplina_ch', label: 'Carga horaria da disciplina', table: 'disciplinas', type: 'number' },
  { key: 'disciplina_modalidade', label: 'Modalidade da disciplina', table: 'disciplinas', type: 'text' },
  { key: 'disciplina_turmas', label: 'Turmas da disciplina', table: 'disciplinas', type: 'number' },
  { key: 'turma_codigo', label: 'Codigo da turma', table: 'turmas', type: 'text' },
  { key: 'turma_turno', label: 'Turno da turma', table: 'turmas', type: 'text' },
  { key: 'turma_semestre', label: 'Semestre', table: 'turmas', type: 'text' },
  { key: 'turma_ano', label: 'Ano', table: 'turmas', type: 'number' },
  { key: 'turma_vagas', label: 'Vagas da turma', table: 'turmas', type: 'number' },
  { key: 'turma_sala', label: 'Sala', table: 'turmas', type: 'text' },
  { key: 'turma_horario', label: 'Horario', table: 'turmas', type: 'text' },
  { key: 'matricula_id', label: 'Codigo da matricula em turma', table: 'matriculas', type: 'number' },
  { key: 'matricula_data', label: 'Data da matricula', table: 'matriculas', type: 'text' },
  { key: 'matricula_situacao', label: 'Situacao da matricula', table: 'matriculas', type: 'text' },
  { key: 'matricula_frequencia', label: 'Frequencia', table: 'matriculas', type: 'number' },
  { key: 'matricula_media', label: 'Media final', table: 'matriculas', type: 'number' },
  { key: 'prova_id', label: 'Codigo interno da prova', table: 'provas', type: 'number' },
  { key: 'prova_codigo', label: 'Codigo da prova', table: 'provas', type: 'text' },
  { key: 'prova_peso', label: 'Peso da prova', table: 'provas', type: 'number' },
  { key: 'prova_conteudo', label: 'Conteudo da prova', table: 'provas', type: 'text' },
  { key: 'resultado_id', label: 'Codigo do resultado', table: 'resultados', type: 'number' },
  { key: 'resultado_nota', label: 'Nota', table: 'resultados', type: 'number' },
  { key: 'resultado_presente', label: 'Presenca', table: 'resultados', type: 'text' },
  { key: 'resultado_data', label: 'Data de realizacao', table: 'resultados', type: 'text' },
  { key: 'resultado_duracao', label: 'Duracao em minutos', table: 'resultados', type: 'number' }
]

const defaultConfig: BuilderConfig = {
  baseTable: 'matriculas',
  relatedTables: ['alunos', 'turmas', 'disciplinas', 'professores', 'provas', 'resultados'],
  selectedFields: [
    'aluno_nome',
    'curso_nome',
    'turma_codigo',
    'turma_turno',
    'disciplina_nome',
    'professor_nome',
    'matricula_situacao',
    'matricula_frequencia',
    'resultado_nota'
  ],
  filters: [],
  chartType: 'bar',
  xField: 'disciplina_nome',
  yField: 'resultado_nota'
}

const OP_LABELS: Record<FilterOp, string> = {
  contains: 'contem',
  notContains: 'nao contem',
  equals: 'e igual a',
  notEquals: 'e diferente de',
  startsWith: 'comeca com',
  endsWith: 'termina com',
  inList: 'esta na lista',
  notInList: 'nao esta na lista',
  gt: 'maior que',
  gte: 'maior ou igual a',
  lt: 'menor que',
  lte: 'menor ou igual a',
  between: 'entre',
  min: 'valor minimo',
  max: 'valor maximo',
  aboveAvg: 'acima da media',
  belowAvg: 'abaixo da media',
  top10Highest: 'top 10 maiores',
  top10Lowest: 'top 10 menores',
  empty: 'esta vazio',
  notEmpty: 'esta preenchido'
}

const TEXT_OPS: FilterOp[] = [
  'contains',
  'notContains',
  'equals',
  'notEquals',
  'startsWith',
  'endsWith',
  'inList',
  'notInList',
  'empty',
  'notEmpty'
]
const NUMBER_OPS: FilterOp[] = [
  'equals',
  'notEquals',
  'gt',
  'gte',
  'lt',
  'lte',
  'between',
  'inList',
  'notInList',
  'min',
  'max',
  'aboveAvg',
  'belowAvg',
  'top10Highest',
  'top10Lowest',
  'empty',
  'notEmpty'
]

const VALUELESS_OPS = new Set<FilterOp>([
  'empty',
  'notEmpty',
  'min',
  'max',
  'aboveAvg',
  'belowAvg',
  'top10Highest',
  'top10Lowest'
])

const ORACLE_FILTER_PRESETS: Array<{
  label: string
  field: string
  op: FilterOp
  value?: string
}> = [
  { label: 'WHERE nota < 6', field: 'resultado_nota', op: 'lt', value: '6' },
  { label: 'BETWEEN 6 e 10', field: 'resultado_nota', op: 'between', value: '6,10' },
  { label: 'IN turnos', field: 'turma_turno', op: 'inList', value: 'Noite, Manha' },
  { label: 'LIKE aluno', field: 'aluno_nome', op: 'contains' },
  { label: 'NOT LIKE conteudo', field: 'prova_conteudo', op: 'notContains' },
  { label: 'IS NULL professor', field: 'professor_nome', op: 'empty' },
  { label: 'MAX nota', field: 'resultado_nota', op: 'max' },
  { label: 'MIN nota', field: 'resultado_nota', op: 'min' },
  { label: 'AVG acima', field: 'resultado_nota', op: 'aboveAvg' },
  { label: 'TOP 10 medias', field: 'matricula_media', op: 'top10Highest' }
]

const tableLabel = (key: TableKey) =>
  TABLES.find(table => table.key === key)?.label ?? key

const fieldLabel = (key: string) =>
  FIELDS.find(field => field.key === key)?.label ?? key

const fieldType = (key: string) =>
  FIELDS.find(field => field.key === key)?.type ?? 'text'

const filterOperators = (field: string) =>
  fieldType(field) === 'number' ? NUMBER_OPS : TEXT_OPS

const filterNeedsValue = (op: FilterOp) => !VALUELESS_OPS.has(op)

const filterPlaceholder = (op: FilterOp) => {
  if (!filterNeedsValue(op)) return 'Calculado automaticamente'
  if (op === 'between') return 'Ex: 6,10'
  if (op === 'inList' || op === 'notInList') return 'Ex: Noite, Manha, EAD'
  return 'Valor'
}

const createFilter = (
  field: string,
  op: FilterOp = fieldType(field) === 'number' ? 'lt' : 'contains',
  value = ''
): FilterDef => ({
  id: crypto.randomUUID(),
  field,
  op,
  value
})

const normalizeText = (value: Primitive) => asText(value).toLowerCase()

const asNumber = (value: Primitive) => {
  if (typeof value === 'number') return value
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : 0
  }
  return 0
}

const asText = (value: Primitive) =>
  value === null || value === undefined || value === '' ? '-' : String(value)

const parseNumberInput = (value: string) => Number(value.trim().replace(',', '.'))

const isEmptyValue = (value: Primitive) =>
  value === null || value === undefined || value === ''

const splitList = (value: string) =>
  value
    .split(/[,\n;]/)
    .map(item => item.trim().toLowerCase())
    .filter(Boolean)

const splitNumberRange = (value: string) => {
  const parts = value
    .split(/[,\n;|]/)
    .map(item => Number(item.trim().replace(',', '.')))
    .filter(Number.isFinite)
  return parts.length >= 2
    ? [Math.min(parts[0], parts[1]), Math.max(parts[0], parts[1])] as const
    : null
}

const numericValues = (rows: Row[], field: string) =>
  rows
    .map(row => row[field])
    .filter(value => !isEmptyValue(value))
    .map(asNumber)
    .filter(Number.isFinite)

const numericStats = (rows: Row[], field: string) => {
  const values = numericValues(rows, field)
  if (values.length === 0) {
    return { min: null, max: null, avg: null, topHigh: null, topLow: null }
  }
  const sortedAsc = [...values].sort((a, b) => a - b)
  const sortedDesc = [...values].sort((a, b) => b - a)
  const avg = values.reduce((sum, value) => sum + value, 0) / values.length
  return {
    min: sortedAsc[0],
    max: sortedDesc[0],
    avg,
    topHigh: sortedDesc[Math.min(9, sortedDesc.length - 1)],
    topLow: sortedAsc[Math.min(9, sortedAsc.length - 1)]
  }
}

function unique<T>(items: T[]) {
  return Array.from(new Set(items))
}

function downloadCsv(filename: string, rows: Row[], fields: FieldDef[]) {
  if (rows.length === 0 || fields.length === 0) return
  const csv = [
    fields.map(field => `"${field.label.replace(/"/g, '""')}"`).join(','),
    ...rows.map(row =>
      fields
        .map(field => `"${asText(row[field.key]).replace(/"/g, '""')}"`)
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

function buildRows(
  reportRows: RelatorioAcademicoRow[],
  baseTable: TableKey,
  selectedTables: TableKey[]
) {
  const mappedRows: Row[] = reportRows.map(row => ({
    aluno_nome: row.alunoNome,
    aluno_email: row.alunoEmail,
    aluno_turno: row.alunoTurno,
    aluno_matricula: row.alunoMatricula,
    professor_nome: row.professorNome,
    professor_email: row.professorEmail,
    professor_titulacao: row.professorTitulacao,
    professor_turmas: undefined,
    curso_nome: row.cursoNome,
    curso_ch: row.cursoChTotal,
    curso_alunos: undefined,
    curso_disciplinas: undefined,
    disciplina_nome: row.disciplinaNome,
    disciplina_codigo: row.disciplinaCodigo,
    disciplina_ch: row.disciplinaCh,
    disciplina_modalidade: row.disciplinaModalidade,
    disciplina_turmas: undefined,
    turma_codigo: row.turmaCodigo,
    turma_turno: row.turmaTurno,
    turma_semestre: row.turmaSemestre,
    turma_ano: row.turmaAno,
    turma_vagas: row.turmaVagas,
    turma_sala: row.turmaSala,
    turma_horario: row.turmaHorario,
    matricula_id: row.matriculaId,
    matricula_data: row.matriculaData,
    matricula_situacao: row.matriculaSituacao,
    matricula_frequencia: row.matriculaFrequencia,
    matricula_media: row.matriculaMediaFinal,
    prova_id: row.provaId,
    prova_codigo: row.provaCodigo,
    prova_peso: row.provaPeso,
    prova_conteudo: row.provaConteudo,
    resultado_id: row.resultadoId,
    resultado_nota: row.resultadoNota,
    resultado_presente:
      row.resultadoPresente === null || row.resultadoPresente === undefined
        ? undefined
        : row.resultadoPresente
          ? 'Presente'
          : 'Ausente',
    resultado_data: row.resultadoDataRealizacao,
    resultado_duracao: row.resultadoDuracaoMin,
    __aluno_id: row.alunoId,
    __professor_id: row.professorId,
    __curso_id: row.cursoId,
    __disciplina_id: row.disciplinaId,
    __turma_id: row.turmaId,
    __matricula_id: row.matriculaId,
    __prova_id: row.provaId,
    __resultado_id: row.resultadoId
  }))

  const idFieldByBase: Record<TableKey, string> = {
    alunos: '__aluno_id',
    professores: '__professor_id',
    cursos: '__curso_id',
    disciplinas: '__disciplina_id',
    turmas: '__turma_id',
    matriculas: '__matricula_id',
    provas: '__prova_id',
    resultados: '__resultado_id'
  }
  const keyTables = unique([baseTable, ...selectedTables])
  const seen = new Set<string>()

  return mappedRows.filter(row => {
    const key = keyTables
      .map(table => row[idFieldByBase[table]])
      .filter(value => value !== null && value !== undefined)
      .join('|')
    if (!key) return false
    if (seen.has(key)) {
      return false
    }
    seen.add(key)
    return true
  })
}

function applyFilters(rows: Row[], filters: FilterDef[]) {
  const statsByField = new Map<string, ReturnType<typeof numericStats>>()
  filters.forEach(filter => {
    if (filter.field && fieldType(filter.field) === 'number') {
      statsByField.set(filter.field, numericStats(rows, filter.field))
    }
  })

  return rows.filter(row =>
    filters.every(filter => {
      if (!filter.field) return true
      const value = row[filter.field]
      if (filter.op === 'empty') return isEmptyValue(value)
      if (filter.op === 'notEmpty') return !isEmptyValue(value)
      const stats = statsByField.get(filter.field) ?? null
      const numberValue = asNumber(value)
      if (filter.op === 'min') return !isEmptyValue(value) && stats?.min != null && numberValue === stats.min
      if (filter.op === 'max') return !isEmptyValue(value) && stats?.max != null && numberValue === stats.max
      if (filter.op === 'aboveAvg') return !isEmptyValue(value) && stats?.avg != null && numberValue > stats.avg
      if (filter.op === 'belowAvg') return !isEmptyValue(value) && stats?.avg != null && numberValue < stats.avg
      if (filter.op === 'top10Highest') return !isEmptyValue(value) && stats?.topHigh != null && numberValue >= stats.topHigh
      if (filter.op === 'top10Lowest') return !isEmptyValue(value) && stats?.topLow != null && numberValue <= stats.topLow
      if (filter.value.trim() === '') return true
      const expected = filter.value.trim().toLowerCase()
      if (filter.op === 'inList') {
        return splitList(filter.value).includes(normalizeText(value))
      }
      if (filter.op === 'notInList') {
        return !splitList(filter.value).includes(normalizeText(value))
      }
      if (filter.op === 'contains') {
        return normalizeText(value).includes(expected)
      }
      if (filter.op === 'notContains') {
        return !normalizeText(value).includes(expected)
      }
      if (filter.op === 'equals') {
        return normalizeText(value) === expected
      }
      if (filter.op === 'notEquals') return normalizeText(value) !== expected
      if (filter.op === 'startsWith') return normalizeText(value).startsWith(expected)
      if (filter.op === 'endsWith') return normalizeText(value).endsWith(expected)
      if (filter.op === 'gt') return numberValue > parseNumberInput(filter.value)
      if (filter.op === 'gte') return numberValue >= parseNumberInput(filter.value)
      if (filter.op === 'lt') return numberValue < parseNumberInput(filter.value)
      if (filter.op === 'lte') return numberValue <= parseNumberInput(filter.value)
      if (filter.op === 'between') {
        const range = splitNumberRange(filter.value)
        return range ? numberValue >= range[0] && numberValue <= range[1] : true
      }
      return true
    })
  )
}

function chartRows(rows: Row[], xField: string, yField: string) {
  const grouped = new Map<string, number>()
  rows.forEach(row => {
    const label = asText(row[xField])
    const value = yField ? asNumber(row[yField]) : 1
    grouped.set(label, (grouped.get(label) ?? 0) + (value || 1))
  })
  return Array.from(grouped.entries())
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value || a.label.localeCompare(b.label))
    .slice(0, 12)
}

function loadSavedReports(): SavedReport[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as SavedReport[]
  } catch {
    return []
  }
}

export function AdvancedReportBuilder() {
  const relatorio = useQuery({
    queryKey: ['consultas', 'relatorio-academico'],
    queryFn: relatorioAcademico
  })

  const [config, setConfig] = useState<BuilderConfig>(() => {
    const params = new URLSearchParams(window.location.search)
    const encoded = params.get('relatorio')
    if (!encoded) return defaultConfig
    try {
      return { ...defaultConfig, ...JSON.parse(atob(encoded)) }
    } catch {
      return defaultConfig
    }
  })
  const [saved, setSaved] = useState<SavedReport[]>(loadSavedReports)
  const [reportName, setReportName] = useState('')

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved))
  }, [saved])

  const selectedTables = useMemo(
    () => unique([config.baseTable, ...config.relatedTables]),
    [config.baseTable, config.relatedTables]
  )

  const availableFields = useMemo(
    () => FIELDS.filter(field => selectedTables.includes(field.table)),
    [selectedTables]
  )

  const selectedFieldDefs = useMemo(
    () =>
      availableFields.filter(field => config.selectedFields.includes(field.key)),
    [availableFields, config.selectedFields]
  )

  const rows = useMemo(
    () => buildRows(relatorio.data ?? [], config.baseTable, selectedTables),
    [config.baseTable, relatorio.data, selectedTables]
  )

  const filteredRows = useMemo(
    () => applyFilters(rows, config.filters),
    [config.filters, rows]
  )
  const graphRows = useMemo(
    () => chartRows(filteredRows, config.xField, config.yField),
    [config.xField, config.yField, filteredRows]
  )

  const valueSuggestions = useMemo(() => {
    const entries = availableFields.map(field => {
      const values = unique(
        rows
          .map(row => row[field.key])
          .filter(value => value !== null && value !== undefined && value !== '')
          .map(value => String(value))
      )
        .sort((a, b) => a.localeCompare(b))
        .slice(0, 25)
      return [field.key, values] as const
    })
    return Object.fromEntries(entries) as Record<string, string[]>
  }, [availableFields, rows])

  const isLoading = relatorio.isLoading
  const hasError = relatorio.isError

  const update = (patch: Partial<BuilderConfig>) =>
    setConfig(current => ({ ...current, ...patch }))

  const changeBase = (baseTable: TableKey) => {
    const relatedTables = config.relatedTables.filter(table => table !== baseTable)
    const tables = unique([baseTable, ...relatedTables])
    const validFields = FIELDS.filter(field => tables.includes(field.table)).map(
      field => field.key
    )
    update({
      baseTable,
      relatedTables,
      selectedFields: config.selectedFields.filter(field =>
        validFields.includes(field)
      ),
      filters: config.filters.filter(filter => validFields.includes(filter.field))
    })
  }

  const changeRelation = (index: number, table: TableKey) => {
    const relatedTables = [...config.relatedTables]
    relatedTables[index] = table
    update({ relatedTables: unique(relatedTables).filter(t => t !== config.baseTable) })
  }

  const addRelation = () => {
    const next = TABLES.find(
      table => !selectedTables.includes(table.key)
    )?.key
    if (next) update({ relatedTables: [...config.relatedTables, next] })
  }

  const removeRelation = (index: number) => {
    const relatedTables = config.relatedTables.filter((_, i) => i !== index)
    const tables = unique([config.baseTable, ...relatedTables])
    update({
      relatedTables,
      selectedFields: config.selectedFields.filter(field =>
        FIELDS.some(def => def.key === field && tables.includes(def.table))
      ),
      filters: config.filters.filter(filter =>
        FIELDS.some(def => def.key === filter.field && tables.includes(def.table))
      )
    })
  }

  const toggleField = (field: string) => {
    update({
      selectedFields: config.selectedFields.includes(field)
        ? config.selectedFields.filter(item => item !== field)
        : [...config.selectedFields, field]
    })
  }

  const addFilter = () => {
    update({
      filters: [...config.filters, createFilter(availableFields[0]?.key ?? '')]
    })
  }

  const addSmartFilter = (field: string, op: FilterOp, value = '') => {
    update({ filters: [...config.filters, createFilter(field, op, value)] })
  }

  const saveReport = () => {
    const name = reportName.trim() || `Relatorio ${saved.length + 1}`
    setSaved(current => [
      {
        id: crypto.randomUUID(),
        name,
        favorite: false,
        config
      },
      ...current
    ])
    setReportName('')
  }

  const shareReport = async () => {
    const encoded = btoa(JSON.stringify(config))
    const url = `${window.location.origin}${window.location.pathname}?relatorio=${encoded}`
    window.history.replaceState(null, '', url)
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      // URL is still placed in the address bar when clipboard is unavailable.
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 py-10 text-text-muted">
        <Spinner /> Carregando bases da consulta...
      </div>
    )
  }

  if (hasError) {
    return (
      <div className="rounded-card border border-primary bg-primary-light p-4 text-sm text-primary-dark">
        Nao foi possivel carregar todas as bases da consulta avancada.
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <Card
          title="Tabelas do relatorio"
          subtitle="Escolha a base e adicione os cruzamentos."
        >
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                Campo 1 - tabela base
              </label>
              <select
                value={config.baseTable}
                onChange={e => changeBase(e.target.value as TableKey)}
                className={SELECT_CLS}
              >
                {TABLES.map(table => (
                  <option key={table.key} value={table.key}>
                    {table.label}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-text-muted">
                {TABLES.find(t => t.key === config.baseTable)?.hint}
              </p>
            </div>

            {config.relatedTables.map((table, index) => {
              const usedBefore = [config.baseTable, ...config.relatedTables.slice(0, index)]
              const options = TABLES.filter(option => !usedBefore.includes(option.key))
              return (
                <div key={`${table}-${index}`}>
                  <label className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                    Campo {index + 2} - relacionar com
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={table}
                      onChange={e => changeRelation(index, e.target.value as TableKey)}
                      className={SELECT_CLS}
                    >
                      {options.map(option => (
                        <option key={option.key} value={option.key}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => removeRelation(index)}
                    >
                      Remover
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="mt-3">
            <Button
              type="button"
              variant="secondary"
              onClick={addRelation}
              disabled={selectedTables.length === TABLES.length}
            >
              + Adicionar tabela
            </Button>
          </div>
        </Card>

        <Card title="Relatorios salvos" subtitle="Modelos reutilizaveis no navegador.">
          <div className="flex gap-2">
            <Input
              value={reportName}
              onChange={e => setReportName(e.target.value)}
              placeholder="Nome do relatorio"
            />
            <Button type="button" onClick={saveReport}>
              Salvar
            </Button>
          </div>

          <div className="mt-4 max-h-44 space-y-2 overflow-y-auto pr-1">
            {saved.length === 0 ? (
              <p className="text-sm text-text-muted">Nenhum relatorio salvo.</p>
            ) : (
              saved.map(report => (
                <div
                  key={report.id}
                  className="flex items-center justify-between gap-2 rounded-card border border-surface-border px-3 py-2"
                >
                  <button
                    type="button"
                    onClick={() => setConfig(report.config)}
                    className="min-w-0 text-left"
                  >
                    <span className="block truncate text-sm font-semibold text-text">
                      {report.favorite ? '* ' : ''}
                      {report.name}
                    </span>
                    <span className="text-xs text-text-muted">
                      {tableLabel(report.config.baseTable)}
                    </span>
                  </button>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      className="text-xs font-semibold text-text-muted hover:text-primary"
                      onClick={() =>
                        setSaved(current =>
                          current.map(item =>
                            item.id === report.id
                              ? { ...item, favorite: !item.favorite }
                              : item
                          )
                        )
                      }
                    >
                      fav
                    </button>
                    <button
                      type="button"
                      className="text-xs font-semibold text-primary"
                      onClick={() =>
                        setSaved(current => current.filter(item => item.id !== report.id))
                      }
                    >
                      excluir
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      <Card title="Campos do relatorio" subtitle="Labels amigaveis, separados por area.">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {selectedTables.map(table => (
            <div key={table} className="rounded-card border border-surface-border p-3">
              <p className="mb-2 text-sm font-semibold text-text">{tableLabel(table)}</p>
              <div className="space-y-2">
                {FIELDS.filter(field => field.table === table).map(field => (
                  <label
                    key={field.key}
                    className="flex items-center gap-2 text-sm text-text"
                  >
                    <input
                      type="checkbox"
                      checked={config.selectedFields.includes(field.key)}
                      onChange={() => toggleField(field.key)}
                    />
                    {field.label}
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card
        title="Filtros guiados"
        subtitle="Adicione uma regra por vez. Todas as regras ficam ativas juntas."
        actions={
          <>
            {config.filters.length > 0 && (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => update({ filters: [] })}
              >
                Limpar
              </Button>
            )}
            <Button type="button" size="sm" variant="secondary" onClick={addFilter}>
              + Filtro
            </Button>
          </>
        }
      >
        <div className="mb-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-muted">
            Top 10 filtros estilo Oracle
          </p>
          <div className="flex flex-wrap gap-2">
            {ORACLE_FILTER_PRESETS.filter(preset =>
              availableFields.some(field => field.key === preset.field)
            ).map(preset => (
              <button
                key={`${preset.field}-${preset.op}-${preset.value ?? 'auto'}`}
                type="button"
                onClick={() => addSmartFilter(preset.field, preset.op, preset.value ?? '')}
                className="rounded-full border border-surface-border px-3 py-1.5 text-xs font-semibold text-text-muted hover:border-primary hover:text-primary"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
        {config.filters.length === 0 ? (
          <p className="text-sm text-text-muted">
            Nenhum filtro aplicado. Use um atalho ou clique em + Filtro.
          </p>
        ) : (
          <div className="space-y-2">
            <div className="mb-3 flex flex-wrap gap-2">
              {config.filters.map(filter => (
                <span
                  key={`summary-${filter.id}`}
                  className="rounded-full bg-surface px-3 py-1 text-xs font-semibold text-text-muted"
                >
                  {fieldLabel(filter.field)} {OP_LABELS[filter.op]}
                  {filterNeedsValue(filter.op) && filter.value
                    ? ` ${filter.value}`
                    : ''}
                </span>
              ))}
            </div>
            {config.filters.map(filter => (
              <div
                key={filter.id}
                className="grid grid-cols-1 gap-2 rounded-card border border-surface-border p-3 md:grid-cols-[1fr_160px_1fr_auto]"
              >
                <select
                  value={filter.field}
                  onChange={e =>
                    update({
                      filters: config.filters.map(item => {
                        if (item.id !== filter.id) return item
                        const field = e.target.value
                        const ops = filterOperators(field)
                        return {
                          ...item,
                          field,
                          op: ops.includes(item.op) ? item.op : ops[0],
                          value: ''
                        }
                      })
                    })
                  }
                  className={SELECT_CLS}
                >
                  {availableFields.map(field => (
                    <option key={field.key} value={field.key}>
                      {field.label}
                    </option>
                  ))}
                </select>
                <select
                  value={filter.op}
                  onChange={e =>
                    update({
                      filters: config.filters.map(item =>
                        item.id === filter.id
                          ? { ...item, op: e.target.value as FilterOp }
                          : item
                      )
                    })
                  }
                  className={SELECT_CLS}
                >
                  {filterOperators(filter.field).map(op => (
                    <option key={op} value={op}>
                      {OP_LABELS[op]}
                    </option>
                  ))}
                </select>
                <div>
                  <Input
                    value={filter.value}
                    onChange={e =>
                      update({
                        filters: config.filters.map(item =>
                          item.id === filter.id
                            ? { ...item, value: e.target.value }
                            : item
                        )
                      })
                    }
                    placeholder={filterPlaceholder(filter.op)}
                    disabled={!filterNeedsValue(filter.op)}
                    list={`filter-values-${filter.id}`}
                  />
                  <datalist id={`filter-values-${filter.id}`}>
                    {(valueSuggestions[filter.field] ?? []).map(value => (
                      <option key={value} value={value} />
                    ))}
                  </datalist>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() =>
                    update({
                      filters: config.filters.filter(item => item.id !== filter.id)
                    })
                  }
                >
                  Remover
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card
        title="Resultado"
        subtitle={`${filteredRows.length} registro(s) encontrados`}
        actions={
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={shareReport}
              className="text-xs font-semibold uppercase tracking-wide text-text-muted hover:text-primary"
            >
              compartilhar
            </button>
            <button
              type="button"
              onClick={() =>
                downloadCsv(
                  'consulta-avancada.csv',
                  filteredRows,
                  selectedFieldDefs
                )
              }
              className="text-xs font-semibold uppercase tracking-wide text-text-muted hover:text-primary"
            >
              csv
            </button>
          </div>
        }
      >
        <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-3">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-text-muted">
              Visualizacao
            </label>
            <select
              value={config.chartType}
              onChange={e => update({ chartType: e.target.value as ChartType })}
              className={SELECT_CLS}
            >
              {CHARTS.map(chart => (
                <option key={chart.key} value={chart.key}>
                  {chart.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-text-muted">
              Eixo / agrupamento
            </label>
            <select
              value={config.xField}
              onChange={e => update({ xField: e.target.value })}
              className={SELECT_CLS}
            >
              {selectedFieldDefs.map(field => (
                <option key={field.key} value={field.key}>
                  {field.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-text-muted">
              Valor numerico
            </label>
            <select
              value={config.yField}
              onChange={e => update({ yField: e.target.value })}
              className={SELECT_CLS}
            >
              {selectedFieldDefs
                .filter(field => field.type === 'number')
                .map(field => (
                  <option key={field.key} value={field.key}>
                    {field.label}
                  </option>
                ))}
            </select>
          </div>
        </div>

        <ReportVisualization
          type={config.chartType}
          rows={filteredRows}
          fields={selectedFieldDefs}
          graphRows={graphRows}
          yField={config.yField}
        />
      </Card>
    </div>
  )
}

function ReportVisualization({
  type,
  rows,
  fields,
  graphRows,
  yField
}: {
  type: ChartType
  rows: Row[]
  fields: FieldDef[]
  graphRows: Array<{ label: string; value: number }>
  yField: string
}) {
  const max = Math.max(...graphRows.map(row => row.value), 1)
  const total = graphRows.reduce((sum, row) => sum + row.value, 0)
  const avg = rows.length
    ? rows.reduce((sum, row) => sum + asNumber(row[yField]), 0) / rows.length
    : 0

  if (type === 'table') {
    return <ReportTable rows={rows} fields={fields} />
  }

  if (type === 'kpi') {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard label="Registros" value={rows.length} />
        <KpiCard label={`Soma de ${fieldLabel(yField)}`} value={total.toFixed(0)} />
        <KpiCard label="Media" value={avg.toFixed(2)} />
      </div>
    )
  }

  if (graphRows.length === 0) {
    return <p className="text-sm text-text-muted">Sem dados para o grafico.</p>
  }

  if (type === 'pie') {
    let current = 0
    const colors = [SOFT_RED, '#16A34A', '#D97706', '#2563EB', '#7C3AED', '#64748B']
    const gradient = graphRows
      .map((row, index) => {
        const start = current
        const size = total ? (row.value / total) * 100 : 0
        current += size
        return `${colors[index % colors.length]} ${start}% ${current}%`
      })
      .join(', ')
    return (
      <div className="grid grid-cols-1 items-center gap-6 md:grid-cols-[220px_1fr]">
        <div
          className="chart-pie-reveal mx-auto h-52 w-52 rounded-full border border-surface-border"
          style={{ background: `conic-gradient(${gradient})` }}
        />
        <Legend rows={graphRows} total={total} />
      </div>
    )
  }

  if (type === 'scatter') {
    return (
      <div className="relative h-72 rounded-card border border-surface-border bg-surface p-4">
        {graphRows.map((row, index) => (
          <div
            key={row.label}
            title={`${row.label}: ${row.value}`}
            className="absolute h-3 w-3 rounded-full bg-rose-400"
            style={{
              left: `${8 + (index / Math.max(graphRows.length - 1, 1)) * 84}%`,
              bottom: `${8 + (row.value / max) * 78}%`
            }}
          />
        ))}
      </div>
    )
  }

  if (type === 'heatmap') {
    return (
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {graphRows.map(row => (
          <div
            key={row.label}
            className="rounded-card border border-surface-border p-3"
            style={{ backgroundColor: `rgba(${SOFT_RED_RGB}, ${0.12 + (row.value / max) * 0.45})` }}
          >
            <p className="truncate text-sm font-semibold text-text">{row.label}</p>
            <p className="mt-1 text-2xl font-bold text-text">{row.value}</p>
          </div>
        ))}
      </div>
    )
  }

  if (type === 'line' || type === 'area') {
    const points = graphRows.map((row, index) => {
      const x = 8 + (index / Math.max(graphRows.length - 1, 1)) * 84
      const y = 90 - (row.value / max) * 76
      return `${x},${y}`
    })
    const areaPoints = `8,92 ${points.join(' ')} 92,92`
    return (
      <svg viewBox="0 0 100 100" className="h-72 w-full rounded-card border border-surface-border bg-surface">
        {type === 'area' && (
          <polygon points={areaPoints} fill={`rgba(${SOFT_RED_RGB}, 0.16)`} />
        )}
        <polyline
          points={points.join(' ')}
          fill="none"
          stroke={SOFT_RED}
          strokeWidth="2"
        />
        {points.map((point, index) => {
          const [cx, cy] = point.split(',')
          return (
            <circle key={point} cx={cx} cy={cy} r="1.6" fill={SOFT_RED}>
              <title>{`${graphRows[index].label}: ${graphRows[index].value}`}</title>
            </circle>
          )
        })}
      </svg>
    )
  }

  return (
    <div className="space-y-4">
      {graphRows.map(row => (
        <div key={row.label}>
          <div className="mb-1 flex justify-between gap-3 text-sm">
            <span className="truncate font-medium text-text">{row.label}</span>
            <span className="font-semibold text-text-muted">{row.value}</span>
          </div>
          <div className="flex h-4 overflow-hidden rounded-full bg-surface">
            <div
              className="bg-rose-400"
              style={{ width: `${Math.max((row.value / max) * 100, 3)}%` }}
            />
            {type === 'stacked' && (
              <div
                className="bg-success"
                style={{
                  width: `${Math.max(100 - (row.value / max) * 100, 0)}%`
                }}
              />
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

function ReportTable({ rows, fields }: { rows: Row[]; fields: FieldDef[] }) {
  if (fields.length === 0) {
    return <p className="text-sm text-text-muted">Selecione campos para o relatorio.</p>
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-surface-border text-xs uppercase tracking-wide text-text-muted">
          <tr>
            {fields.map(field => (
              <th key={field.key} className="whitespace-nowrap py-2 pr-4">
                {field.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-surface-border">
          {rows.length === 0 ? (
            <tr>
              <td className="py-4 text-text-muted" colSpan={fields.length}>
                Nenhum registro encontrado.
              </td>
            </tr>
          ) : (
            rows.slice(0, 80).map((row, index) => (
              <tr key={index}>
                {fields.map(field => (
                  <td key={field.key} className="whitespace-nowrap py-2 pr-4">
                    {asText(row[field.key])}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
      {rows.length > 80 && (
        <p className="mt-3 text-xs text-text-muted">
          Mostrando 80 linhas. O CSV exporta o resultado filtrado completo.
        </p>
      )}
    </div>
  )
}

function KpiCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-card border border-surface-border bg-surface p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
        {label}
      </p>
      <p className="mt-2 font-display text-3xl font-bold text-text">{value}</p>
    </div>
  )
}

function Legend({
  rows,
  total
}: {
  rows: Array<{ label: string; value: number }>
  total: number
}) {
  return (
    <div className="space-y-2">
      {rows.map(row => (
        <div key={row.label} className="flex items-center justify-between gap-3">
          <span className="truncate text-sm font-medium text-text">{row.label}</span>
          <span className="text-sm text-text-muted">
            {row.value} ({total ? Math.round((row.value / total) * 100) : 0}%)
          </span>
        </div>
      ))}
    </div>
  )
}
