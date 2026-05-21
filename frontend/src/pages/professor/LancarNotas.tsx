import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  buscarProvaParaLancamento,
  lancarResultado,
  type ProvaLancamentoView
} from '../../api/provas'
import { PageHeader } from '../../components/layout/PageHeader'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import {
  EmptyRow,
  TBody,
  TD,
  TH,
  THead,
  TR,
  Table
} from '../../components/ui/Table'
import { useToast } from '../../hooks/useToast'

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

const today = () => new Date().toISOString().slice(0, 10)

function formatConteudoProva(conteudo?: string | null) {
  if (!conteudo) return ''
  try {
    const parsed = JSON.parse(conteudo) as {
      formato?: string
      titulo?: string
      instrucoes?: string
      questoes?: unknown[]
    }
    if (parsed.formato === 'ghflusao-prova-v1') {
      return [
        parsed.titulo || 'Prova',
        `${parsed.questoes?.length ?? 0} questao(oes)`,
        parsed.instrucoes
      ]
        .filter(Boolean)
        .join('\n')
    }
  } catch {
    return conteudo
  }
  return conteudo
}

function buildDrafts(data?: ProvaLancamentoView) {
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

export function LancarNotas() {
  const [codigo, setCodigo] = useState('')
  const [submittedCode, setSubmittedCode] = useState('')
  const [drafts, setDrafts] = useState<Record<number, NotaDraft>>({})
  const [lastOperation, setLastOperation] = useState<LastOperation | null>(null)
  const [savingResultadoId, setSavingResultadoId] = useState<number | null>(null)
  const { showError, showSuccess } = useToast()
  const qc = useQueryClient()

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

  const prova = useQuery({
    queryKey: ['prova-lancamento', submittedCode],
    queryFn: () =>
      measureOperation('Carregar alunos para notas', () =>
        buscarProvaParaLancamento(submittedCode)
      ),
    enabled: submittedCode.length > 0
  })

  useEffect(() => {
    setDrafts(buildDrafts(prova.data))
  }, [prova.data])

  const stats = useMemo(() => {
    const resultados = prova.data?.resultados ?? []
    const lancados = resultados.filter(resultado => resultado.nota != null).length
    const soma = resultados.reduce((total, resultado) => total + (resultado.nota ?? 0), 0)
    return {
      total: resultados.length,
      lancados,
      pendentes: resultados.length - lancados,
      media: lancados > 0 ? soma / lancados : null
    }
  }, [prova.data])

  const salvar = useMutation({
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
      showSuccess('Nota salva.')
      qc.invalidateQueries({ queryKey: ['prova-lancamento', submittedCode] })
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      showError(err?.response?.data?.message ?? 'Nao foi possivel salvar a nota.')
    },
    onSettled: () => {
      setSavingResultadoId(null)
    }
  })

  const buscar = () => {
    const clean = codigo.trim()
    if (!clean) return
    setSubmittedCode(clean)
  }

  const updateDraft = (
    resultadoId: number,
    patch: Partial<NotaDraft>
  ) => {
    setDrafts(current => ({
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

  return (
    <>
      <PageHeader
        title="Lancar Notas"
        subtitle="Busque a prova pelo ID de 6 digitos e lance as notas dos alunos."
      />

      <Card className="mb-5" title="Buscar prova" subtitle="Use o ID que aparece no Historico de Provas.">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-[260px_auto_1fr] md:items-end">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-text-muted mb-1.5">
              ID da prova
            </label>
            <Input
              value={codigo}
              onChange={e => setCodigo(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="123456"
              inputMode="numeric"
              maxLength={6}
            />
          </div>
          <Button type="button" disabled={codigo.trim().length !== 6} onClick={buscar}>
            Buscar
          </Button>
          {prova.data && (
            <p className="text-sm text-text-muted">
              Prova <span className="font-mono font-semibold text-text">{prova.data.prova.codigo}</span>
              {' '}carregada.
            </p>
          )}
        </div>
      </Card>

      {prova.isError && (
        <div className="mb-4 rounded-card border border-primary bg-primary-light px-4 py-3 text-sm text-primary-dark">
          Prova nao encontrada. Confira o ID de 6 digitos no Historico de Provas.
        </div>
      )}

      {prova.data && (
        <Card className="mb-5" title="Dados da prova">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">ID</p>
              <p className="font-mono text-2xl font-bold text-text">{prova.data.prova.codigo}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">Turma</p>
              <p className="font-semibold text-text">
                {prova.data.turma.codigo} - {prova.data.turma.semestre}/{prova.data.turma.ano}
              </p>
              <p className="text-sm text-text-muted">{prova.data.turma.disciplina?.nome ?? '-'}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">Peso</p>
              <p className="font-semibold text-text">{prova.data.prova.peso}</p>
              <p className="text-sm text-text-muted">{prova.data.resultados.length} aluno(s)</p>
            </div>
          </div>
          {prova.data.prova.conteudo && (
            <pre className="mt-4 max-h-56 overflow-auto whitespace-pre-wrap rounded-card border border-surface-border bg-surface p-3 text-sm text-text-muted">
              {formatConteudoProva(prova.data.prova.conteudo)}
            </pre>
          )}
        </Card>
      )}

      {(prova.data || lastOperation) && (
        <div className="mb-4 grid grid-cols-2 gap-2 md:grid-cols-5">
          {[
            ['Alunos', stats.total],
            ['Lancadas', stats.lancados],
            ['Pendentes', stats.pendentes],
            ['Media', stats.media == null ? '-' : stats.media.toFixed(1)]
          ].map(([label, value]) => (
            <div key={label} className="rounded-card border border-surface-border bg-white px-3 py-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">
                {label}
              </p>
              <p className="mt-1 text-base font-bold text-text">{value}</p>
            </div>
          ))}
          {lastOperation && (
            <div
              className={[
                'rounded-card border px-3 py-2',
                lastOperation.tone === 'success'
                  ? 'border-success bg-success-light text-success-dark'
                  : 'border-primary bg-primary-light text-primary-dark'
              ].join(' ')}
            >
              <p className="text-[11px] font-semibold uppercase tracking-wide">
                Ultima operacao
              </p>
              <p className="mt-1 text-sm font-bold">
                {lastOperation.label} - {lastOperation.ms} ms
              </p>
            </div>
          )}
        </div>
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
          {!submittedCode && (
            <EmptyRow colSpan={8}>Digite o ID da prova para carregar os alunos.</EmptyRow>
          )}
          {prova.isLoading && (
            <EmptyRow colSpan={8}>Carregando prova...</EmptyRow>
          )}
          {prova.data?.resultados.length === 0 && (
            <EmptyRow colSpan={8}>Esta prova ainda nao possui alunos vinculados.</EmptyRow>
          )}
          {prova.data?.resultados.map(resultado => {
            const draft = drafts[resultado.id]
            return (
              <TR key={resultado.id}>
                <TD>
                  <div className="font-medium text-text">{resultado.aluno.nome}</div>
                  <div className="text-xs text-text-muted">
                    {resultado.aluno.curso?.nome ?? prova.data?.turma.curso?.nome ?? '-'}
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
                      onChange={e => updateDraft(resultado.id, { presente: e.target.checked })}
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
                    onChange={e => updateDraft(resultado.id, { nota: e.target.value })}
                  />
                </TD>
                <TD>
                  <Input
                    type="date"
                    value={draft?.data ?? today()}
                    onChange={e => updateDraft(resultado.id, { data: e.target.value })}
                  />
                </TD>
                <TD>
                  <Input
                    type="number"
                    min="1"
                    value={draft?.duracao ?? ''}
                    onChange={e => updateDraft(resultado.id, { duracao: e.target.value })}
                    placeholder="min"
                  />
                </TD>
                <TD>
                  <Input
                    value={draft?.motivo ?? ''}
                    onChange={e => updateDraft(resultado.id, { motivo: e.target.value })}
                    placeholder={resultado.nota == null ? 'Opcional' : 'Obrigatorio ao corrigir'}
                  />
                </TD>
                <TD>
                  <Button
                    type="button"
                    size="sm"
                    disabled={!draft?.nota || Number(draft.nota) < 0 || Number(draft.nota) > 10}
                    loading={savingResultadoId === resultado.id}
                    onClick={() => salvar.mutate({ resultadoId: resultado.id, draft })}
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
  )
}
