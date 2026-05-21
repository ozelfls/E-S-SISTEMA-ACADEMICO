import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { listarCursos } from '../../api/cursos'
import { listarDisciplinas } from '../../api/disciplinas'
import {
  buscarProvaParaLancamento,
  cadastrarProvasLote,
  importarArquivoProva,
  lancarResultado,
  type ProvaLancamentoView,
  type ProvaImportadaView,
  type ProvaPayload
} from '../../api/provas'
import { listarTurmas } from '../../api/turmas'
import { detalhesDaTurma } from '../../api/consultas'
import { PageHeader } from '../../components/layout/PageHeader'
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

const SELECT_CLS =
  'w-full h-10 rounded-lg border border-surface-border bg-white px-3 text-sm text-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20'
const TEXTAREA_CLS =
  'w-full min-h-24 rounded-lg border border-surface-border bg-white px-3 py-2 text-sm text-text placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20'
const PAGE_SIZE = 10

const normalizeQuestionType = (value?: string): DraftQuestion['tipo'] => {
  const clean = (value ?? '').toLowerCase()
  if (clean.includes('objet')) return 'Objetiva'
  if (clean.includes('verd') || clean.includes('falso')) return 'Verdadeiro/Falso'
  return 'Discursiva'
}

const toQuestion = (item: ImportedQuestion, index: number): DraftQuestion => ({
  tipo: normalizeQuestionType(item.tipo),
  enunciado: String(item.enunciado ?? item.pergunta ?? `Questao ${index + 1}`).trim(),
  pontos: String(item.pontos ?? '1'),
  alternativas: item.alternativas ?? item.opcoes ?? [],
  resposta: String(item.resposta ?? item.respostaCorreta ?? '').trim()
})

function parseQuestionsFromJson(text: string): DraftQuestion[] {
  const parsed = JSON.parse(text) as
    | ImportedQuestion[]
    | { questoes?: ImportedQuestion[]; questions?: ImportedQuestion[] }
  const items = Array.isArray(parsed)
    ? parsed
    : parsed.questoes ?? parsed.questions ?? []
  return items
    .map(toQuestion)
    .filter(question => question.enunciado.trim().length > 0)
}

function parseQuestionsFromText(text: string): DraftQuestion[] {
  const cleaned = text
    .replace(/\r/g, '')
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)

  const blocks: string[][] = []
  let current: string[] = []

  cleaned.forEach(line => {
    const startsQuestion = /^(\d+[\).:-]|quest[aã]o\s+\d+[:.-]?)/i.test(line)
    if (startsQuestion && current.length > 0) {
      blocks.push(current)
      current = [line]
      return
    }
    current.push(line)
  })
  if (current.length > 0) blocks.push(current)

  return blocks.map((block, index) => {
    const first = block[0] ?? ''
    const body = first.replace(/^(\d+[\).:-]\s*|quest[aã]o\s+\d+[:.-]?\s*)/i, '')
    const alternatives = block
      .slice(1)
      .filter(line => /^[A-E][\).:-]\s+/i.test(line))
      .map(line => line.replace(/^[A-E][\).:-]\s+/i, '').trim())
    const answerLine = block.find(line => /^(resposta|gabarito)[:.-]/i.test(line))
    const answer = answerLine?.replace(/^(resposta|gabarito)[:.-]\s*/i, '').trim() ?? ''
    const explicitType = block.find(line => /^tipo[:.-]/i.test(line))
    const tipo = explicitType
      ? normalizeQuestionType(explicitType.replace(/^tipo[:.-]\s*/i, ''))
      : alternatives.length > 0
        ? 'Objetiva'
        : 'Discursiva'

    return {
      tipo,
      enunciado: body || `Questao ${index + 1}`,
      pontos: '1',
      alternativas: alternatives,
      resposta: answer
    }
  })
}

function parseQuestions(text: string) {
  const trimmed = text.trim()
  if (!trimmed) return []
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    return parseQuestionsFromJson(trimmed)
  }
  return parseQuestionsFromText(trimmed)
}

const importedToQuestions = (data: ProvaImportadaView): DraftQuestion[] =>
  data.questoes.map((q, index) => ({
    tipo: normalizeQuestionType(q.tipo),
    enunciado: q.enunciado || `Questao ${index + 1}`,
    pontos: String(q.pontos ?? 1),
    alternativas: q.alternativas ?? [],
    resposta: q.resposta ?? ''
  }))

function formatConteudoProva(conteudo?: string | null) {
  if (!conteudo) return '-'
  try {
    const parsed = JSON.parse(conteudo) as {
      formato?: string
      titulo?: string
      instrucoes?: string
      questoes?: unknown[]
    }
    if (parsed.formato === 'ghflusao-prova-v1') {
      const partes = [
        parsed.titulo || 'Prova',
        `${parsed.questoes?.length ?? 0} questao(oes)`,
        parsed.instrucoes
      ].filter(Boolean)
      return partes.join(' - ')
    }
  } catch {
    return conteudo
  }
  return conteudo
}

interface DraftProva {
  titulo: string
  peso: string
  questoes: DraftQuestion[]
}

interface DraftQuestion {
  tipo: 'Discursiva' | 'Objetiva' | 'Verdadeiro/Falso'
  enunciado: string
  pontos: string
  alternativas: string[]
  resposta: string
}

interface ImportedQuestion {
  tipo?: string
  enunciado?: string
  pergunta?: string
  pontos?: string | number
  alternativas?: string[]
  opcoes?: string[]
  resposta?: string
  respostaCorreta?: string
}

interface NotaDraft {
  nota: string
  presente: boolean
  data: string
  duracao: string
  motivo: string
}

interface LastOperation {
  label: string
  ms: number
  tone: 'success' | 'error'
}

type SectionKey = 'gerador' | 'historico' | 'notas'

const today = () => new Date().toISOString().slice(0, 10)

function buildNotaDrafts(data?: ProvaLancamentoView) {
  const next: Record<number, NotaDraft> = {}
  data?.resultados.forEach(resultado => {
    next[resultado.id] = {
      nota: resultado.nota == null ? '' : String(resultado.nota),
      presente: resultado.presente ?? true,
      data: resultado.dataRealizacao ?? today(),
      duracao: resultado.duracaoMin == null ? '' : String(resultado.duracaoMin),
      motivo: ''
    }
  })
  return next
}

export function AdminProvas() {
  const qc = useQueryClient()
  const [activeSection, setActiveSection] = useState<SectionKey>('gerador')
  const [cursoId, setCursoId] = useState<number | ''>('')
  const [disciplinaId, setDisciplinaId] = useState<number | ''>('')
  const [turmaId, setTurmaId] = useState<number | ''>('')
  const [generatorQtd, setGeneratorQtd] = useState('2')
  const [generatorPeso, setGeneratorPeso] = useState('1')
  const [importInstructions, setImportInstructions] = useState('')
  const [questionType, setQuestionType] = useState<DraftQuestion['tipo']>('Discursiva')
  const [questionText, setQuestionText] = useState('')
  const [questionPoints, setQuestionPoints] = useState('1')
  const [questionOptions, setQuestionOptions] = useState('')
  const [questionAnswer, setQuestionAnswer] = useState('')
  const [questionBank, setQuestionBank] = useState<DraftQuestion[]>([])
  const [importMsg, setImportMsg] = useState('')
  const [drafts, setDrafts] = useState<DraftProva[]>([])
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [codigoNotas, setCodigoNotas] = useState('')
  const [submittedNotasCode, setSubmittedNotasCode] = useState('')
  const [notaDrafts, setNotaDrafts] = useState<Record<number, NotaDraft>>({})
  const [alert, setAlert] = useState<{
    tone: 'success' | 'error'
    msg: string
  } | null>(null)
  const [lastOperation, setLastOperation] = useState<LastOperation | null>(null)
  const [savingResultadoId, setSavingResultadoId] = useState<number | null>(null)

  const measureOperation = async <T,>(
    label: string,
    work: () => Promise<T>
  ): Promise<T> => {
    const startedAt = performance.now()
    try {
      const result = await work()
      setLastOperation({
        label,
        ms: Math.round(performance.now() - startedAt),
        tone: 'success'
      })
      return result
    } catch (error) {
      setLastOperation({
        label,
        ms: Math.round(performance.now() - startedAt),
        tone: 'error'
      })
      throw error
    }
  }

  const cursos = useQuery({
    queryKey: ['cursos'],
    queryFn: () => measureOperation('Carregar cursos', listarCursos),
    staleTime: 60_000
  })
  const disciplinas = useQuery({
    queryKey: ['disciplinas', cursoId || 'sem-curso'],
    queryFn: () =>
      measureOperation('Carregar disciplinas do curso', () =>
        listarDisciplinas(cursoId || undefined)
      ),
    enabled: !!cursoId,
    staleTime: 60_000
  })
  const turmas = useQuery({
    queryKey: ['turmas-por-curso', cursoId || 'sem-curso'],
    queryFn: () =>
      measureOperation('Carregar turmas do curso', () =>
        listarTurmas(undefined, undefined, cursoId as number)
      ),
    enabled: !!cursoId,
    staleTime: 30_000
  })
  const detalhe = useQuery({
    queryKey: ['consulta-turma-detalhes', turmaId],
    queryFn: () =>
      measureOperation('Carregar historico da turma', () =>
        detalhesDaTurma(turmaId as number)
      ),
    enabled: !!turmaId
  })
  const provaLancamento = useQuery({
    queryKey: ['admin-prova-lancamento', submittedNotasCode],
    queryFn: () =>
      measureOperation('Carregar alunos para notas', () =>
        buscarProvaParaLancamento(submittedNotasCode)
      ),
    enabled: submittedNotasCode.length === 6
  })

  useEffect(() => {
    setNotaDrafts(buildNotaDrafts(provaLancamento.data))
  }, [provaLancamento.data])

  const turmasDaDisciplina = useMemo(() => {
    const list = turmas.data ?? []
    if (!disciplinaId) return []
    return list.filter(t => t.disciplina?.id === disciplinaId)
  }, [disciplinaId, turmas.data])

  const provas = useMemo(() => {
    const term = search.trim().toLowerCase()
    const list = detalhe.data?.provas ?? []
    if (!term) return list
    return list.filter(p =>
      [p.codigo, p.conteudo, String(p.peso), String(p.mediaTurma ?? '')]
        .filter(Boolean)
        .some(value => String(value).toLowerCase().includes(term))
    )
  }, [detalhe.data, search])

  const currentPage = Math.min(
    page,
    Math.max(1, Math.ceil(provas.length / PAGE_SIZE))
  )
  const pagedProvas = provas.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  )

  const loteMutation = useMutation({
    mutationFn: () =>
      measureOperation('Criar provas em lote', () =>
        cadastrarProvasLote(turmaId as number, draftsToPayload())
      ),
    onSuccess: data => {
      setAlert({
        tone: 'success',
        msg: `${data.length} provas geradas. IDs: ${data.map(p => p.codigo).join(', ')}`
      })
      setDrafts([])
      qc.invalidateQueries({ queryKey: ['consulta-turma-detalhes', turmaId] })
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      setAlert({
        tone: 'error',
        msg: err?.response?.data?.message ?? 'Erro ao gerar provas.'
      })
    }
  })

  const importMutation = useMutation({
    mutationFn: (arquivo: File) =>
      measureOperation('Importar arquivo de prova', () => importarArquivoProva(arquivo)),
    onSuccess: data => {
      const questoes = importedToQuestions(data)
      setQuestionBank(current => [...current, ...questoes])
      if (data.instrucoes && !importInstructions) {
        setImportInstructions(data.instrucoes)
      }
      setImportMsg(`${questoes.length} questao(oes) encontrada(s) no arquivo.`)
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      setImportMsg(
        err?.response?.data?.message ??
          'Nao consegui ler esse arquivo. Tente enviar DOCX/PDF com texto selecionavel.'
      )
    }
  })

  const notaMutation = useMutation({
    mutationFn: ({ resultadoId, draft }: { resultadoId: number; draft: NotaDraft }) => {
      setSavingResultadoId(resultadoId)
      return measureOperation('Salvar nota', () =>
        lancarResultado(resultadoId, {
          nota: Number(draft.nota),
          presente: draft.presente,
          data: draft.data || undefined,
          duracao: draft.duracao ? Number(draft.duracao) : undefined,
          motivoAlteracao: draft.motivo.trim() || undefined
        })
      )
    },
    onSuccess: () => {
      setAlert({ tone: 'success', msg: 'Nota salva.' })
      qc.invalidateQueries({ queryKey: ['admin-prova-lancamento', submittedNotasCode] })
      qc.invalidateQueries({ queryKey: ['consulta-turma-detalhes', turmaId] })
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      setAlert({
        tone: 'error',
        msg: err?.response?.data?.message ?? 'Nao foi possivel salvar a nota.'
      })
    },
    onSettled: () => {
      setSavingResultadoId(null)
    }
  })

  const draftsToPayload = (): ProvaPayload[] =>
    drafts.map(d => ({
      peso: Number(d.peso),
      conteudo: montarConteudo(d.titulo, d.questoes)
    }))

  const limparDependentes = () => {
    setDisciplinaId('')
    setTurmaId('')
    setDrafts([])
    setPage(1)
    setActiveSection('gerador')
  }

  const montarConteudo = (
    titulo: string,
    questoes: DraftQuestion[]
  ) => {
    const payload = {
      formato: 'ghflusao-prova-v1',
      titulo: titulo.trim() || 'Prova',
      instrucoes: importInstructions.trim(),
      questoes: questoes.map((q, index) => ({
        numero: index + 1,
        tipo: q.tipo,
        enunciado: q.enunciado.trim(),
        pontos: Number(q.pontos) > 0 ? Number(q.pontos) : 1,
        alternativas: q.alternativas,
        resposta: q.resposta.trim()
      }))
    }

    return JSON.stringify(payload, null, 2)
  }

  const addQuestion = () => {
    const enunciado = questionText.trim()
    if (!enunciado) return
    setQuestionBank(current => [
      ...current,
      {
        tipo: questionType,
        enunciado,
        pontos: Number(questionPoints) > 0 ? questionPoints : '1',
        alternativas: questionOptions
          .split('\n')
          .map(option => option.trim())
          .filter(Boolean),
        resposta: questionAnswer.trim()
      }
    ])
    setQuestionText('')
    setQuestionPoints('1')
    setQuestionOptions('')
    setQuestionAnswer('')
  }

  const removeQuestion = (index: number) => {
    setQuestionBank(current => current.filter((_, i) => i !== index))
  }

  const gerarRascunhos = () => {
    if (!turmaId) return
    const quantidade = Math.min(20, Math.max(1, Number(generatorQtd) || 1))
    const pesoPadrao = Number(generatorPeso) > 0 ? generatorPeso : '1'
    const novos: DraftProva[] = []

    for (let index = 0; index < quantidade; index += 1) {
      novos.push({
        titulo: `Prova ${index + 1}`,
        peso: pesoPadrao,
        questoes: questionBank
      })
    }

    setDrafts(novos)
  }

  const updateDraft = (
    index: number,
    field: 'titulo' | 'peso',
    value: string
  ) => {
    setDrafts(current =>
      current.map((draft, i) =>
        i === index ? { ...draft, [field]: value } : draft
      )
    )
  }

  const removeDraft = (index: number) => {
    setDrafts(current => current.filter((_, i) => i !== index))
  }

  const buscarNotas = () => {
    const clean = codigoNotas.trim()
    if (clean.length !== 6) return
    setSubmittedNotasCode(clean)
    setActiveSection('notas')
  }

  const abrirLancamento = (codigo: string) => {
    setCodigoNotas(codigo)
    setSubmittedNotasCode(codigo)
    setActiveSection('notas')
  }

  const updateNotaDraft = (
    resultadoId: number,
    patch: Partial<NotaDraft>
  ) => {
    setNotaDrafts(current => ({
      ...current,
      [resultadoId]: {
        ...(current[resultadoId] ?? {
          nota: '',
          presente: true,
          data: today(),
          duracao: '',
          motivo: ''
        }),
        ...patch
      }
    }))
  }

  const canSubmitDrafts =
    Boolean(turmaId) &&
    drafts.length > 0 &&
    drafts.every(d => Number(d.peso) > 0)
  const sections: Array<{
    key: SectionKey
    label: string
    hint: string
    marker: string
    requiresTurma?: boolean
  }> = [
    {
      key: 'gerador',
      label: 'Criar prova',
      hint: turmaId ? `${questionBank.length} questao(oes) opcionais` : 'Selecione a turma aqui',
      marker: drafts.length ? `${drafts.length}` : '+',
      requiresTurma: true
    },
    {
      key: 'historico',
      label: 'Historico',
      hint: turmaId ? `${provas.length} prova(s) encontrada(s)` : 'Opcional, selecione uma turma',
      marker: provas.length ? `${provas.length}` : 'H',
      requiresTurma: true
    },
    {
      key: 'notas',
      label: 'Lancar notas',
      hint: submittedNotasCode ? `Prova ${submittedNotasCode}` : 'Buscar pelo ID da prova',
      marker: 'ID'
    }
  ]

  const goToSection = (section: SectionKey) => {
    setActiveSection(section)
  }

  return (
    <>
      <PageHeader
        title="Provas"
        subtitle="Crie a prova em um unico lugar. O ID de 6 digitos aparece somente depois da criacao."
      />

      {alert && (
        <div
          className={`mb-4 rounded-card px-4 py-3 text-sm border ${
            alert.tone === 'success'
              ? 'bg-success-light border-success text-success-dark'
              : 'bg-primary-light border-primary text-primary-dark'
          }`}
        >
          {alert.msg}
        </div>
      )}

      <div className="mb-4 rounded-card border border-surface-border bg-white p-2 shadow-card">
        <ol className="grid grid-cols-1 gap-2 md:grid-cols-3">
            {sections.map(section => {
              const isActive = section.key === activeSection
              const needsContext = Boolean(section.requiresTurma && !turmaId)
              return (
                <li
                  key={section.key}
                  className="min-w-0"
                >
                  <button
                    type="button"
                    onClick={() => goToSection(section.key)}
                    aria-current={isActive ? 'page' : undefined}
                    className={[
                      'group flex h-full w-full items-center gap-3 rounded-card border px-3 py-3 text-left transition',
                      isActive
                        ? 'border-primary bg-primary-light text-primary-dark'
                        : 'border-transparent text-text hover:border-surface-border hover:bg-surface'
                    ].join(' ')}
                  >
                    <span className="relative grid h-9 w-9 shrink-0 place-items-center">
                      {isActive && (
                        <span className="workflow-current-pulse absolute inset-0 rounded-full bg-primary/20" />
                      )}
                      <span
                        className={[
                          'relative z-10 grid h-9 w-9 place-items-center rounded-full border text-xs font-bold transition',
                          isActive
                            ? 'border-primary bg-primary text-white'
                            : needsContext
                              ? 'border-surface-border bg-surface text-text-muted'
                              : 'border-surface-border bg-white text-text-muted group-hover:border-primary group-hover:text-primary'
                        ].join(' ')}
                      >
                        {section.marker}
                      </span>
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold">{section.label}</span>
                      <span className="mt-0.5 block truncate text-xs text-text-muted">
                        {section.hint}
                      </span>
                    </span>
                  </button>
                </li>
              )
            })}
          </ol>
      </div>

      {lastOperation && (
        <div
          className={[
            'mb-4 flex flex-col gap-1 rounded-card border px-3 py-2 text-xs md:flex-row md:items-center md:justify-between',
            lastOperation.tone === 'success'
              ? 'border-success bg-success-light text-success-dark'
              : 'border-primary bg-primary-light text-primary-dark'
          ].join(' ')}
        >
          <span className="font-semibold">{lastOperation.label}</span>
          <span>{lastOperation.ms} ms</span>
        </div>
      )}

      {activeSection === 'gerador' && (
      <Card className="mb-4" noPadding>
        <div className="border-b border-surface-border px-5 py-3">
          <h2 className="text-sm font-semibold text-text">Criar prova</h2>
          <p className="mt-1 text-xs text-text-muted">
            Selecione a turma, configure a prova e crie. O ID publico e gerado somente no final.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-3 p-5 lg:grid-cols-3">
          <div>
            <label className="block text-xs font-semibold text-text-muted uppercase tracking-wide mb-1.5">
              Curso
            </label>
            <select
              value={cursoId}
              onChange={e => {
                setCursoId(e.target.value ? Number(e.target.value) : '')
                limparDependentes()
              }}
              className={SELECT_CLS}
            >
              <option value="">Selecione um curso</option>
              {cursos.data?.map(c => (
                <option key={c.id} value={c.id}>
                  {c.nome}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-muted uppercase tracking-wide mb-1.5">
              Disciplina
            </label>
            <select
              value={disciplinaId}
              disabled={!cursoId || disciplinas.isLoading}
              onChange={e => {
                setDisciplinaId(e.target.value ? Number(e.target.value) : '')
                setTurmaId('')
                setDrafts([])
                setPage(1)
                setActiveSection('gerador')
              }}
              className={SELECT_CLS}
            >
              <option value="">
                {cursoId ? 'Selecione uma disciplina' : 'Escolha o curso primeiro'}
              </option>
              {disciplinas.data?.map(d => (
                <option key={d.id} value={d.id}>
                  {d.codigo} - {d.nome}
                </option>
              ))}
            </select>
            {disciplinas.isError && (
              <p className="mt-1 text-xs text-primary">
                Erro ao carregar disciplinas deste curso.
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-muted uppercase tracking-wide mb-1.5">
              Turma
            </label>
            <select
              value={turmaId}
              disabled={!disciplinaId || turmas.isLoading}
              onChange={e => {
                setTurmaId(e.target.value ? Number(e.target.value) : '')
                setDrafts([])
                setPage(1)
                setActiveSection('gerador')
              }}
              className={SELECT_CLS}
            >
              <option value="">
                {disciplinaId ? 'Selecione uma turma' : 'Escolha a disciplina primeiro'}
              </option>
              {turmasDaDisciplina.map(t => (
                <option key={t.id} value={t.id}>
                  {t.codigo} - {t.semestre}/{t.ano} - {t.turno ?? 'Sem turno'}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 border-t border-surface-border p-5 lg:grid-cols-[120px_120px_1fr_auto] lg:items-center">
          <div>
            <label className="block text-xs font-semibold text-text-muted uppercase tracking-wide mb-1.5">
              Quantidade
            </label>
            <Input
              type="number"
              min="1"
              max="20"
              value={generatorQtd}
              onChange={e => setGeneratorQtd(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-text-muted uppercase tracking-wide mb-1.5">
              Peso padrao
            </label>
            <Input
              type="number"
              min="0.1"
              step="0.1"
              value={generatorPeso}
              onChange={e => setGeneratorPeso(e.target.value)}
            />
          </div>
          <div className="rounded-card border border-surface-border bg-surface px-4 py-3">
            <p className="text-sm font-semibold text-text">
              {questionBank.length} questao(oes) prontas
            </p>
            <p className="mt-1 text-xs text-text-muted">
              {importInstructions
                ? 'Instrucoes do arquivo importado serao anexadas automaticamente.'
                : 'Adicione questoes manualmente ou envie um arquivo da prova.'}
            </p>
          </div>
          <Button type="button" disabled={!turmaId} onClick={gerarRascunhos}>
            Montar previa
          </Button>
        </div>

        <div className="border-t border-surface-border p-5">
          <div className="mb-4 flex flex-col gap-2 rounded-card border border-surface-border bg-surface p-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold text-text">Importar arquivo da prova</p>
              <p className="text-xs text-text-muted">
                Envie PDF, Word/DOCX ou texto. O sistema identifica as questoes e preenche a lista abaixo.
              </p>
              {importMsg && <p className="mt-1 text-xs text-text-muted">{importMsg}</p>}
            </div>
            <input
              type="file"
              accept=".txt,.csv,.pdf,.doc,.docx"
              onChange={e => {
                const file = e.target.files?.[0]
                if (file) importMutation.mutate(file)
                e.currentTarget.value = ''
              }}
              className="block w-full text-sm text-text-muted file:mr-3 file:rounded-card file:border-0 file:bg-white file:px-3 file:py-2 file:text-sm file:font-semibold file:text-text hover:file:bg-surface md:w-auto"
              disabled={importMutation.isPending}
            />
          </div>

          <div className="grid grid-cols-1 gap-3 lg:grid-cols-[160px_1fr_120px_auto] lg:items-end">
            <div>
              <label className="block text-xs font-semibold text-text-muted uppercase tracking-wide mb-1.5">
                Tipo
              </label>
              <select
                value={questionType}
                onChange={e => setQuestionType(e.target.value as DraftQuestion['tipo'])}
                className={SELECT_CLS}
              >
                <option value="Discursiva">Discursiva</option>
                <option value="Objetiva">Objetiva</option>
                <option value="Verdadeiro/Falso">Verdadeiro/Falso</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-muted uppercase tracking-wide mb-1.5">
                Enunciado da questao
              </label>
              <Input
                value={questionText}
                onChange={e => setQuestionText(e.target.value)}
                placeholder="Digite a questao que vai entrar na prova..."
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-muted uppercase tracking-wide mb-1.5">
                Pontos
              </label>
              <Input
                type="number"
                min="0.1"
                step="0.1"
                value={questionPoints}
                onChange={e => setQuestionPoints(e.target.value)}
              />
            </div>
            <Button type="button" variant="secondary" onClick={addQuestion}>
              + Questao
            </Button>
          </div>

          {questionType === 'Objetiva' && (
            <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-[1fr_240px]">
              <div>
                <label className="block text-xs font-semibold text-text-muted uppercase tracking-wide mb-1.5">
                  Alternativas
                </label>
                <textarea
                  value={questionOptions}
                  onChange={e => setQuestionOptions(e.target.value)}
                  className={TEXTAREA_CLS}
                  placeholder={'Uma alternativa por linha.\\nA resposta fica no campo ao lado.'}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-muted uppercase tracking-wide mb-1.5">
                  Resposta correta
                </label>
                <Input
                  value={questionAnswer}
                  onChange={e => setQuestionAnswer(e.target.value)}
                  placeholder="Ex.: A, B ou texto da resposta"
                />
              </div>
            </div>
          )}

          {questionType !== 'Objetiva' && (
            <div className="mt-3">
              <label className="block text-xs font-semibold text-text-muted uppercase tracking-wide mb-1.5">
                Resposta esperada / gabarito
              </label>
              <Input
                value={questionAnswer}
                onChange={e => setQuestionAnswer(e.target.value)}
                placeholder="Opcional"
              />
            </div>
          )}

          {questionBank.length > 0 && (
            <div className="mt-4 space-y-2">
              {questionBank.map((question, index) => (
                <div
                  key={`${question.enunciado}-${index}`}
                  className="flex items-start justify-between gap-3 rounded-card border border-surface-border bg-surface px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-text">
                      {index + 1}. {question.enunciado}
                    </p>
                    <p className="text-xs text-text-muted">
                      {question.tipo} - {question.pontos} ponto(s)
                    </p>
                    {question.alternativas.length > 0 && (
                      <p className="mt-1 text-xs text-text-muted">
                        Alternativas: {question.alternativas.join(' | ')}
                      </p>
                    )}
                    {question.resposta && (
                      <p className="mt-1 text-xs font-medium text-text-muted">
                        Resposta: {question.resposta}
                      </p>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeQuestion(index)}
                    className="text-primary hover:bg-primary-light"
                  >
                    Remover
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {drafts.length > 0 && (
          <div className="border-t border-surface-border">
            <Table>
              <THead>
                <TR>
                  <TH>ID final</TH>
                  <TH>Titulo</TH>
                  <TH>Peso</TH>
                  <TH>Questoes</TH>
                  <TH>Acoes</TH>
                </TR>
              </THead>
              <TBody>
                {drafts.map((draft, index) => (
                  <TR key={`${draft.titulo}-${index}`}>
                    <TD>
                      <span className="rounded-full bg-surface px-2 py-1 font-mono text-xs font-semibold text-text-muted">
                        gerado ao criar
                      </span>
                    </TD>
                    <TD>
                      <Input
                        value={draft.titulo}
                        onChange={e =>
                          updateDraft(index, 'titulo', e.target.value)
                        }
                      />
                    </TD>
                    <TD>
                      <Input
                        type="number"
                        min="0.1"
                        step="0.1"
                        value={draft.peso}
                        onChange={e =>
                          updateDraft(index, 'peso', e.target.value)
                        }
                      />
                    </TD>
                    <TD>
                      <div className="text-sm text-text-muted">
                        {draft.questoes.length} questao(oes)
                      </div>
                    </TD>
                    <TD>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeDraft(index)}
                        className="text-primary hover:bg-primary-light"
                      >
                        Remover
                      </Button>
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
            <div className="flex justify-end gap-2 border-t border-surface-border px-5 py-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setDrafts([])}
              >
                Limpar previa
              </Button>
              <Button
                type="button"
                disabled={!canSubmitDrafts}
                loading={loteMutation.isPending}
                onClick={() => loteMutation.mutate()}
              >
                Criar e gerar IDs
              </Button>
            </div>
          </div>
        )}
      </Card>
      )}

      {activeSection === 'historico' && (
      <>
      <Card className="mb-4" noPadding>
        <div className="border-b border-surface-border px-5 py-3">
          <h2 className="text-sm font-semibold text-text">Historico de provas</h2>
          <p className="mt-1 text-xs text-text-muted">
            Consulte pelo ID de 6 digitos para conferir provas criadas ou lancar notas.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-3 p-5 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <label className="block text-xs font-semibold text-text-muted uppercase tracking-wide mb-1.5">
              Pesquisar no historico
            </label>
            <Input
              value={search}
              onChange={e => {
                setSearch(e.target.value)
                setPage(1)
              }}
              placeholder="ID de 6 digitos, resumo, peso ou media..."
            />
          </div>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setSearch('')
              setPage(1)
            }}
          >
            Limpar
          </Button>
        </div>
      </Card>

      {detalhe.isLoading ? (
        <div className="flex items-center justify-center gap-2 text-text-muted py-10">
          <Spinner /> Carregando provas...
        </div>
      ) : (
        <>
          <Table>
            <THead>
              <TR>
                <TH>ID da prova</TH>
                <TH>Peso</TH>
                <TH>Resumo</TH>
                <TH>Resultados</TH>
                <TH>Media da turma</TH>
                <TH>Acoes</TH>
              </TR>
            </THead>
            <TBody>
              {!turmaId && (
                <EmptyRow colSpan={6}>
                  Selecione curso, disciplina e turma para visualizar provas.
                </EmptyRow>
              )}
              {turmaId && detalhe.isError && (
                <EmptyRow colSpan={6}>Erro ao carregar provas da turma.</EmptyRow>
              )}
              {turmaId && !detalhe.isError && provas.length === 0 && (
                <EmptyRow colSpan={6}>Nenhuma prova cadastrada para a turma.</EmptyRow>
              )}
              {pagedProvas.map(p => (
                <TR key={p.id}>
                  <TD>
                    <span className="font-mono text-xs font-semibold">
                      {p.codigo}
                    </span>
                  </TD>
                  <TD>{p.peso}</TD>
                  <TD>{formatConteudoProva(p.conteudo)}</TD>
                  <TD>{p.totalResultados}</TD>
                  <TD>{p.mediaTurma == null ? '-' : p.mediaTurma.toFixed(1)}</TD>
                  <TD>
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={() => abrirLancamento(p.codigo)}
                    >
                      Lancar notas
                    </Button>
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
          <Pagination
            page={currentPage}
            pageSize={PAGE_SIZE}
            total={provas.length}
            onPageChange={setPage}
          />
        </>
      )}
      </>
      )}

      {activeSection === 'notas' && (
      <>
      <Card className="mb-4" noPadding>
        <div className="border-b border-surface-border px-5 py-3">
          <h2 className="text-sm font-semibold text-text">Lancar notas</h2>
          <p className="mt-1 text-xs text-text-muted">
            Busque pelo ID de 6 digitos da prova ou use o botao no historico.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-3 p-5 md:grid-cols-[240px_auto_1fr] md:items-end">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-text-muted mb-1.5">
              ID da prova
            </label>
            <Input
              value={codigoNotas}
              onChange={e => setCodigoNotas(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="123456"
              inputMode="numeric"
              maxLength={6}
            />
          </div>
          <Button
            type="button"
            disabled={codigoNotas.trim().length !== 6}
            onClick={buscarNotas}
          >
            Buscar
          </Button>
          {provaLancamento.data && (
            <p className="text-sm text-text-muted">
              Prova <span className="font-mono font-semibold text-text">{provaLancamento.data.prova.codigo}</span>
              {' '}carregada para lancamento.
            </p>
          )}
        </div>
      </Card>

      {provaLancamento.isError && (
        <div className="mb-4 rounded-card border border-primary bg-primary-light px-4 py-3 text-sm text-primary-dark">
          Prova nao encontrada. Confira o ID de 6 digitos no Historico de Provas.
        </div>
      )}

      {provaLancamento.data && (
        <Card className="mb-4" noPadding>
          <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">ID</p>
              <p className="font-mono text-2xl font-bold text-text">{provaLancamento.data.prova.codigo}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">Turma</p>
              <p className="font-semibold text-text">
                {provaLancamento.data.turma.codigo} - {provaLancamento.data.turma.semestre}/{provaLancamento.data.turma.ano}
              </p>
              <p className="text-sm text-text-muted">
                {provaLancamento.data.turma.disciplina?.nome ?? '-'}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">Peso</p>
              <p className="font-semibold text-text">{provaLancamento.data.prova.peso}</p>
              <p className="text-sm text-text-muted">
                {provaLancamento.data.resultados.length} aluno(s)
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">Resumo</p>
              <p className="text-sm font-medium text-text">
                {formatConteudoProva(provaLancamento.data.prova.conteudo) || 'Prova simples'}
              </p>
            </div>
          </div>
        </Card>
      )}

      <Table>
        <THead>
          <TR>
            <TH>Aluno</TH>
            <TH>Matricula</TH>
            <TH>Presenca</TH>
            <TH>Nota</TH>
            <TH>Data</TH>
            <TH>Duracao</TH>
            <TH>Motivo</TH>
            <TH>Acoes</TH>
          </TR>
        </THead>
        <TBody>
          {!submittedNotasCode && (
            <EmptyRow colSpan={8}>Digite o ID da prova para carregar os alunos.</EmptyRow>
          )}
          {provaLancamento.isLoading && (
            <EmptyRow colSpan={8}>Carregando prova...</EmptyRow>
          )}
          {provaLancamento.data?.resultados.length === 0 && (
            <EmptyRow colSpan={8}>Esta prova ainda nao possui alunos vinculados.</EmptyRow>
          )}
          {provaLancamento.data?.resultados.map(resultado => {
            const draft = notaDrafts[resultado.id]
            return (
              <TR key={resultado.id}>
                <TD>
                  <div className="font-medium text-text">{resultado.aluno.nome}</div>
                  <div className="text-xs text-text-muted">
                    {resultado.aluno.curso?.nome ?? provaLancamento.data?.turma.curso?.nome ?? '-'}
                  </div>
                </TD>
                <TD>
                  <span className="font-mono text-xs font-semibold">
                    {resultado.aluno.matriculaId}
                  </span>
                </TD>
                <TD>
                  <label className="inline-flex items-center gap-2 text-sm text-text">
                    <input
                      type="checkbox"
                      checked={draft?.presente ?? true}
                      onChange={e => updateNotaDraft(resultado.id, { presente: e.target.checked })}
                    />
                    Presente
                  </label>
                </TD>
                <TD>
                  <Input
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    value={draft?.nota ?? ''}
                    onChange={e => updateNotaDraft(resultado.id, { nota: e.target.value })}
                  />
                </TD>
                <TD>
                  <Input
                    type="date"
                    value={draft?.data ?? today()}
                    onChange={e => updateNotaDraft(resultado.id, { data: e.target.value })}
                  />
                </TD>
                <TD>
                  <Input
                    type="number"
                    min="1"
                    value={draft?.duracao ?? ''}
                    onChange={e => updateNotaDraft(resultado.id, { duracao: e.target.value })}
                    placeholder="min"
                  />
                </TD>
                <TD>
                  <Input
                    value={draft?.motivo ?? ''}
                    onChange={e => updateNotaDraft(resultado.id, { motivo: e.target.value })}
                    placeholder={resultado.nota == null ? 'Opcional' : 'Obrigatorio ao corrigir'}
                  />
                </TD>
                <TD>
                  <Button
                    type="button"
                    size="sm"
                    disabled={!draft?.nota || Number(draft.nota) < 0 || Number(draft.nota) > 10}
                    loading={savingResultadoId === resultado.id}
                    onClick={() => draft && notaMutation.mutate({ resultadoId: resultado.id, draft })}
                  >
                    Salvar
                  </Button>
                </TD>
              </TR>
            )
          })}
        </TBody>
      </Table>
      </>
      )}
    </>
  )
}
