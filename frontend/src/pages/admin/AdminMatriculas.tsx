import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { listarAlunos } from '../../api/alunos'
import {
  alocarAutomaticamente,
  analisarMatricula,
  listarMatriculasAtivas,
  listarOpcoesMatricula,
  matricular,
  type MatriculaOpcao,
  type MatriculaWorkflow
} from '../../api/matriculas'
import { PageHeader } from '../../components/layout/PageHeader'
import { Card } from '../../components/ui/Card'
import { Combobox } from '../../components/ui/Combobox'
import {
  EmptyRow,
  TBody,
  TD,
  TH,
  THead,
  TR,
  Table
} from '../../components/ui/Table'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Spinner } from '../../components/ui/Spinner'
import { Pagination } from '../../components/ui/Pagination'
import { useToast } from '../../hooks/useToast'
import type { Aluno, MatriculaEmTurma, Turma } from '../../types'

const WEEK_DAYS = ['SEG', 'TER', 'QUA', 'QUI', 'SEX']
const PAGE_SIZE = 10

function diasDaSemana(horario?: string) {
  const upper = horario?.toUpperCase() ?? ''
  return WEEK_DAYS.filter(day => upper.includes(day))
}

function alunoLabel(aluno: Aluno) {
  return `${aluno.nome} - ${aluno.matriculaId}`
}

function cargaHorariaDaTurma(turma?: Turma | null) {
  return turma?.cargaHoraria ?? turma?.disciplina?.ch ?? 0
}

function StatPill({
  label,
  value,
  tone = 'default'
}: {
  label: string
  value: string | number
  tone?: 'default' | 'success' | 'warning'
}) {
  const toneClass =
    tone === 'success'
      ? 'border-success/30 bg-success-light text-success-dark'
      : tone === 'warning'
        ? 'border-warning/30 bg-warning-light text-warning-dark'
        : 'border-surface-border bg-surface text-text'

  return (
    <div className={`rounded-card border px-3 py-2 ${toneClass}`}>
      <p className="text-[11px] font-semibold uppercase tracking-wide opacity-75">
        {label}
      </p>
      <p className="mt-0.5 text-xl font-bold leading-none">{value}</p>
    </div>
  )
}

function WorkflowTimeline({
  data,
  hasAluno,
  hasTurma,
  loading
}: {
  data?: MatriculaWorkflow
  hasAluno: boolean
  hasTurma: boolean
  loading?: boolean
}) {
  const baseSteps = data?.etapas ?? [
    {
      chave: 'aluno',
      titulo: 'Aluno',
      detalhe: hasAluno ? 'Aluno selecionado.' : 'Selecione um aluno para iniciar.',
      status: hasAluno ? 'OK' : 'PENDENTE'
    },
    {
      chave: 'turma',
      titulo: 'Turma',
      detalhe: hasTurma ? 'Turma escolhida para analise.' : 'Escolha uma turma elegivel.',
      status: hasTurma ? 'OK' : 'PENDENTE'
    },
    {
      chave: 'regras',
      titulo: 'Regras',
      detalhe: hasTurma ? 'Checando grade, vagas e conflitos.' : 'A pre-checagem entra aqui.',
      status: 'PENDENTE'
    },
    {
      chave: 'confirmacao',
      titulo: 'Confirmar',
      detalhe: 'Finalize somente se a analise liberar.',
      status: 'PENDENTE'
    }
  ]

  return (
    <div className="space-y-3">
      {loading && (
        <div className="flex items-center gap-2 text-sm text-text-muted">
          <Spinner /> Checando regras academicas...
        </div>
      )}
      {data && (
        <div
          className={`rounded-card border px-3 py-2 text-sm ${
            data.podeMatricular
              ? 'border-success bg-success-light text-success-dark'
              : 'border-warning bg-warning-light text-warning-dark'
          }`}
        >
          {data.resumo}
        </div>
      )}

      <ol className="relative grid grid-cols-1 gap-3 md:grid-cols-4">
        <div className="pointer-events-none absolute left-8 right-8 top-5 hidden h-0.5 bg-surface-border md:block" />
        {baseSteps.map((etapa, index) => {
          const ok = etapa.status === 'OK'
          const blocked = etapa.status === 'BLOQUEADO'
          const firstPending = baseSteps.findIndex(item => item.status !== 'OK')
          const current =
            (!data && ((hasAluno && !hasTurma && index === 1) || (hasTurma && index === 2))) ||
            (data && firstPending >= 0 && !ok && index === firstPending)

          return (
            <li
              key={etapa.chave}
              className="relative z-10 flex flex-col items-center text-center"
              style={{
                animation: 'workflowStepIn 220ms ease-out both',
                animationDelay: `${index * 70}ms`
              }}
            >
              <span className="relative grid h-10 w-10 place-items-center">
                {current && (
                  <span className="workflow-current-pulse absolute inset-0 rounded-full bg-primary/20" />
                )}
                <span
                  className={`relative z-10 grid h-10 w-10 place-items-center rounded-full border-2 text-xs font-bold shadow-sm ${
                    ok
                      ? 'border-success bg-success text-white'
                      : blocked
                        ? 'border-warning bg-warning text-white'
                        : current
                          ? 'border-primary bg-primary text-white'
                          : 'border-surface-border bg-white text-text-muted'
                  }`}
                >
                  {ok ? 'OK' : blocked ? '!' : index + 1}
                </span>
              </span>
              <div className="mt-2 max-w-[180px]">
                <p className="text-sm font-semibold text-text">{etapa.titulo}</p>
                <p className="mt-1 text-xs leading-snug text-text-muted">{etapa.detalhe}</p>
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

function MateriasAtivas({ matriculas }: { matriculas: MatriculaEmTurma[] }) {
  if (matriculas.length === 0) {
    return (
      <div className="rounded-card border border-dashed border-surface-border bg-surface px-3 py-4 text-sm text-text-muted">
        Nenhuma materia ativa ainda.
      </div>
    )
  }

  return (
    <div className="grid gap-2">
      {matriculas.map(matricula => (
        <div
          key={matricula.id}
          className="grid gap-2 rounded-card border border-surface-border bg-white px-3 py-2 sm:grid-cols-[1fr_auto] sm:items-center"
        >
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-text">
              {matricula.turma?.disciplina?.nome ?? '-'}
            </p>
            <p className="text-xs text-text-muted">
              {matricula.turma?.codigo ?? '-'} - {matricula.turma?.horario ?? 'Sem horario'}
            </p>
          </div>
          <Badge variant="ativa">{matricula.situacao}</Badge>
        </div>
      ))}
    </div>
  )
}

export function AdminMatriculas() {
  const qc = useQueryClient()
  const { showError, showSuccess } = useToast()
  const [alunoId, setAlunoId] = useState<number | null>(null)
  const [turmaSelecionada, setTurmaSelecionada] = useState<Turma | null>(null)
  const [mostrarIndisponiveis, setMostrarIndisponiveis] = useState(false)
  const [page, setPage] = useState(1)

  const alunos = useQuery({
    queryKey: ['admin-matriculas-alunos'],
    queryFn: listarAlunos
  })

  const ativas = useQuery({
    queryKey: ['admin-matriculas-ativas', alunoId],
    queryFn: () => listarMatriculasAtivas(alunoId!),
    enabled: !!alunoId
  })

  const analise = useQuery({
    queryKey: ['admin-matricula-analise', alunoId, turmaSelecionada?.id],
    queryFn: () => analisarMatricula(alunoId!, turmaSelecionada!.id),
    enabled: !!alunoId && !!turmaSelecionada
  })

  const alunoSelecionado = useMemo(
    () => alunos.data?.find(aluno => aluno.id === alunoId) ?? null,
    [alunos.data, alunoId]
  )

  const opcoes = useQuery({
    queryKey: ['admin-matriculas-opcoes', alunoId],
    queryFn: () => listarOpcoesMatricula(alunoId!),
    enabled: !!alunoId && !!alunoSelecionado?.curso
  })

  const alunoOptions = useMemo(
    () =>
      alunos.data?.map(aluno => ({
        id: aluno.id,
        label: alunoLabel(aluno),
        sublabel: `${aluno.curso?.nome ?? 'Sem curso'} - ${aluno.turno}`
      })) ?? [],
    [alunos.data]
  )

  const idsAtivas = useMemo(
    () => new Set(ativas.data?.map(m => m.turma?.id) ?? []),
    [ativas.data]
  )

  const materiasAtivas = ativas.data ?? []
  const diasOcupados = useMemo(
    () =>
      new Set(
        materiasAtivas.flatMap(matricula => diasDaSemana(matricula.turma?.horario))
      ),
    [materiasAtivas]
  )
  const cargaAtual = useMemo(
    () =>
      materiasAtivas.reduce(
        (total, matricula) => total + cargaHorariaDaTurma(matricula.turma),
        0
      ),
    [materiasAtivas]
  )
  const elegiveisCount = useMemo(
    () => (opcoes.data ?? []).filter(opcao => opcao.analise.podeMatricular).length,
    [opcoes.data]
  )
  const espacosSemana = Math.max(0, WEEK_DAYS.length - diasOcupados.size)

  const mutation = useMutation({
    mutationFn: (turmaId: number) => matricular(alunoId!, turmaId),
    onSuccess: () => {
      showSuccess('Matricula realizada com sucesso.')
      setTurmaSelecionada(null)
      qc.invalidateQueries({ queryKey: ['admin-matriculas-ativas', alunoId] })
      qc.invalidateQueries({ queryKey: ['admin-matriculas-opcoes', alunoId] })
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      showError(err?.response?.data?.message ?? 'Nao foi possivel matricular.')
      qc.invalidateQueries({ queryKey: ['admin-matricula-analise'] })
    }
  })

  const alocacaoAutomatica = useMutation({
    mutationFn: () => alocarAutomaticamente(alunoId!),
    onSuccess: data => {
      showSuccess(data.resumo)
      qc.invalidateQueries({ queryKey: ['admin-matriculas-ativas', alunoId] })
      qc.invalidateQueries({ queryKey: ['admin-matriculas-opcoes', alunoId] })
      setTurmaSelecionada(null)
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      showError(err?.response?.data?.message ?? 'Nao foi possivel alocar automaticamente.')
    }
  })

  const opcoesFiltradas = useMemo(
    () =>
      (opcoes.data ?? []).filter(opcao =>
        mostrarIndisponiveis ? true : opcao.analise.podeMatricular
      ),
    [mostrarIndisponiveis, opcoes.data]
  )
  const opcoesPaginadas = useMemo(
    () => opcoesFiltradas.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [opcoesFiltradas, page]
  )
  const indisponiveisCount = useMemo(
    () => (opcoes.data ?? []).filter(opcao => !opcao.analise.podeMatricular).length,
    [opcoes.data]
  )

  const alunoSemCurso = !!alunoId && !alunoSelecionado?.curso
  const isLoading = alunos.isLoading || opcoes.isLoading || ativas.isLoading

  return (
    <>
      <PageHeader
        title="Matriculas"
        subtitle="Selecione um aluno, confira a grade atual e escolha a proxima turma."
      />

      <div className="space-y-5">
        <Card
          className={alunoSelecionado ? 'transition-all duration-300' : 'transition-all duration-300'}
          title={alunoSelecionado ? undefined : 'Selecionar aluno'}
          subtitle={alunoSelecionado ? undefined : 'Busque por nome ou matricula para abrir o fluxo.'}
          actions={
            alunoId ? (
              <Button
                type="button"
                variant="success"
                loading={alocacaoAutomatica.isPending}
                disabled={isLoading || mutation.isPending}
                onClick={() => alocacaoAutomatica.mutate()}
              >
                Alocacao automatica
              </Button>
            ) : null
          }
        >
          <div
            className={`grid gap-3 transition-all duration-300 ${
              alunoSelecionado
                ? 'items-end lg:grid-cols-[minmax(260px,420px)_1fr]'
                : 'mx-auto max-w-2xl'
            }`}
          >
            <Combobox
              label="Aluno"
              placeholder="Pesquisar aluno..."
              value={alunoId}
              onChange={id => {
                setAlunoId(id)
                setTurmaSelecionada(null)
                setPage(1)
              }}
              options={alunoOptions}
              emptyMessage="Nenhum aluno encontrado."
              size={alunoSelecionado ? 'md' : 'lg'}
            />

            {alunoSelecionado ? (
              <div className="grid gap-2 rounded-card border border-surface-border bg-surface px-3 py-2 sm:grid-cols-3">
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">
                    Curso
                  </p>
                  <p className="truncate text-sm font-semibold text-text">
                    {alunoSelecionado.curso?.nome ?? '-'}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">
                    Matricula
                  </p>
                  <p className="text-sm font-semibold text-text">
                    {alunoSelecionado.matriculaId}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">
                    Turno
                  </p>
                  <p className="text-sm font-semibold text-text">{alunoSelecionado.turno}</p>
                </div>
              </div>
            ) : null}
          </div>
        </Card>

        {alunoSelecionado && (
          <Card>
            <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
              <div className="space-y-4">
                <div>
                  <h3 className="font-display text-base font-semibold text-text">
                    Situacao do aluno
                  </h3>
                  <p className="text-xs text-text-muted">
                    Materias atuais, carga e espacos livres da semana.
                  </p>
                </div>

                {ativas.isLoading ? (
                  <div className="flex items-center gap-2 rounded-card border border-surface-border bg-surface p-4 text-text-muted">
                    <Spinner /> Carregando grade do aluno...
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-2">
                      <StatPill label="Materias" value={materiasAtivas.length} />
                      <StatPill label="Carga" value={`${cargaAtual}h`} />
                      <StatPill
                        label="Dias ocupados"
                        value={`${diasOcupados.size}/${WEEK_DAYS.length}`}
                        tone={diasOcupados.size >= 4 ? 'warning' : 'default'}
                      />
                      <StatPill
                        label="Espacos livres"
                        value={espacosSemana}
                        tone={espacosSemana > 0 ? 'success' : 'warning'}
                      />
                    </div>

                    <div>
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                          Agenda
                        </span>
                        {WEEK_DAYS.map(day => (
                          <span
                            key={day}
                            className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${
                              diasOcupados.has(day)
                                ? 'border-primary bg-primary-light text-primary-dark'
                                : 'border-success/30 bg-success-light text-success-dark'
                            }`}
                          >
                            {day}
                          </span>
                        ))}
                      </div>
                      <MateriasAtivas matriculas={materiasAtivas} />
                    </div>
                  </>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-display text-base font-semibold text-text">
                      Workflow de matricula
                    </h3>
                    <p className="text-xs text-text-muted">
                      A turma selecionada na tabela alimenta a checagem abaixo.
                    </p>
                  </div>
                  <Badge variant={elegiveisCount > 0 ? 'success' : 'warning'}>
                    {elegiveisCount} elegiveis
                  </Badge>
                </div>

                {turmaSelecionada ? (
                  <div className="grid gap-3 rounded-card border border-surface-border bg-surface p-3 md:grid-cols-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                        Turma
                      </p>
                      <p className="font-semibold text-text">{turmaSelecionada.codigo}</p>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                        Disciplina
                      </p>
                      <p className="truncate font-semibold text-text">
                        {turmaSelecionada.disciplina?.nome ?? '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                        Horario
                      </p>
                      <p className="font-semibold text-text">
                        {turmaSelecionada.horario ?? '-'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-card border border-dashed border-surface-border bg-surface px-3 py-4 text-sm text-text-muted">
                    Escolha uma turma na tabela para checar a matricula.
                  </div>
                )}

                {analise.isError ? (
                  <div className="rounded-card border border-primary bg-primary-light px-3 py-2 text-sm text-primary-dark">
                    Nao foi possivel checar esta turma agora. Tente novamente em instantes.
                  </div>
                ) : (
                  <WorkflowTimeline
                    data={turmaSelecionada ? analise.data : undefined}
                    hasAluno={!!alunoSelecionado}
                    hasTurma={!!turmaSelecionada}
                    loading={!!turmaSelecionada && analise.isLoading}
                  />
                )}

                <div className="flex flex-wrap justify-end gap-2 border-t border-surface-border pt-4">
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={!turmaSelecionada || mutation.isPending}
                    onClick={() => setTurmaSelecionada(null)}
                  >
                    Limpar turma
                  </Button>
                  <Button
                    type="button"
                    disabled={!analise.data?.podeMatricular || !turmaSelecionada}
                    loading={mutation.isPending}
                    onClick={() =>
                      turmaSelecionada && mutation.mutate(turmaSelecionada.id)
                    }
                  >
                    Confirmar matricula
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}

        <Card
          title="Turmas disponiveis"
          subtitle={
            alunoSelecionado?.curso
              ? `Curso ${alunoSelecionado.curso.nome}; por padrao, apenas turmas elegiveis.`
              : 'Escolha um aluno com curso vinculado para carregar as turmas.'
          }
          actions={
            alunoId && !alunoSemCurso ? (
              <label className="flex items-center gap-2 text-sm font-semibold text-text">
                <input
                  type="checkbox"
                  checked={mostrarIndisponiveis}
                  onChange={e => {
                    setMostrarIndisponiveis(e.target.checked)
                    setPage(1)
                  }}
                />
                Mostrar indisponiveis ({indisponiveisCount})
              </label>
            ) : null
          }
          noPadding
        >
          {!alunoId ? (
            <div className="p-5 text-sm text-text-muted">
              Escolha um aluno acima para carregar as opcoes.
            </div>
          ) : alunoSemCurso ? (
            <div className="p-5 text-sm text-text-muted">
              Este aluno nao possui curso vinculado. Ajuste o cadastro antes de matricular.
            </div>
          ) : isLoading ? (
            <div className="flex items-center gap-2 p-5 text-text-muted">
              <Spinner /> Carregando turmas...
            </div>
          ) : (
            <div>
              <Table>
                <THead>
                  <TR>
                    <TH>Disciplina</TH>
                    <TH>Turma</TH>
                    <TH>Professor</TH>
                    <TH>Horario</TH>
                    <TH>Vagas</TH>
                    <TH>Status</TH>
                    <TH>Acao</TH>
                  </TR>
                </THead>
                <TBody>
                  {opcoesFiltradas.length === 0 && (
                    <EmptyRow colSpan={7}>
                      {mostrarIndisponiveis
                        ? 'Nenhuma turma encontrada para este aluno.'
                        : 'Nenhuma turma elegivel agora. Ative "Mostrar indisponiveis" para ver os bloqueios.'}
                    </EmptyRow>
                  )}
                  {opcoesPaginadas.map((opcao: MatriculaOpcao) => {
                    const turma = opcao.turma
                    const matriculado = idsAtivas.has(turma.id)
                    const elegivel = opcao.analise.podeMatricular
                    const selecionada = turmaSelecionada?.id === turma.id

                    return (
                      <TR key={turma.id}>
                        <TD>
                          <div className="font-medium text-text">
                            {turma.disciplina?.nome ?? '-'}
                          </div>
                          {!elegivel && (
                            <div className="max-w-md truncate text-xs text-text-muted">
                              {opcao.motivoBloqueio ?? opcao.analise.resumo}
                            </div>
                          )}
                        </TD>
                        <TD>{turma.codigo}</TD>
                        <TD>{turma.professor?.nome ?? '-'}</TD>
                        <TD>{turma.horario ?? '-'}</TD>
                        <TD>{turma.vagas}</TD>
                        <TD>
                          {matriculado ? (
                            <Badge variant="ativa">Matriculado</Badge>
                          ) : elegivel ? (
                            <Badge variant="success">Elegivel</Badge>
                          ) : (
                            <Badge variant="warning">Indisponivel</Badge>
                          )}
                        </TD>
                        <TD>
                          <Button
                            variant={selecionada ? 'success' : elegivel ? 'primary' : 'secondary'}
                            disabled={matriculado || mutation.isPending}
                            onClick={() => setTurmaSelecionada(turma)}
                          >
                            {selecionada ? 'Selecionada' : elegivel ? 'Checar' : 'Ver bloqueio'}
                          </Button>
                        </TD>
                      </TR>
                    )
                  })}
                </TBody>
              </Table>
              <div className="px-5 pb-5">
                <Pagination
                  page={page}
                  pageSize={PAGE_SIZE}
                  total={opcoesFiltradas.length}
                  onPageChange={setPage}
                />
              </div>
            </div>
          )}
        </Card>
      </div>
    </>
  )
}
