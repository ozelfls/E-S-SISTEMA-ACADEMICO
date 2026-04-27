import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  atualizarTurma,
  criarTurma,
  deletarTurma,
  listarTurmas,
  type TurmaUpdatePayload
} from '../../api/turmas'
import { listarDisciplinas } from '../../api/disciplinas'
import { listarProfessores } from '../../api/professores'
import { PageHeader } from '../../components/layout/PageHeader'
import {
  EmptyRow,
  TBody,
  TD,
  TH,
  THead,
  TR,
  Table
} from '../../components/ui/Table'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Modal } from '../../components/ui/Modal'
import { Spinner } from '../../components/ui/Spinner'
import { AlocarProfessorModal } from '../../components/admin/AlocarProfessorModal'
import type { Turma } from '../../types'

const schema = z.object({
  codigo: z.string().min(1, 'Informe o código'),
  horario: z.string().optional(),
  vagas: z.coerce.number().int().min(0, 'Vagas >= 0'),
  semestre: z.string().min(1, 'Informe o semestre'),
  ano: z.coerce.number().int().min(2000),
  turno: z.enum(['MANHA', 'TARDE', 'NOITE']),
  sala: z.string().optional(),
  professorId: z
    .union([z.coerce.number().int().min(1), z.literal('')])
    .optional(),
  disciplinaId: z.coerce.number().int().min(1, 'Selecione a disciplina')
})

type FormData = z.input<typeof schema>

const SELECT_CLS =
  'w-full h-10 rounded-lg border border-surface-border bg-white px-3 text-sm text-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20'

export function AdminTurmas() {
  const qc = useQueryClient()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Turma | null>(null)
  const [alocarTurma, setAlocarTurma] = useState<Turma | null>(null)
  const [filtroSemestre, setFiltroSemestre] = useState<string>('')
  const [filtroAno, setFiltroAno] = useState<number | ''>('')
  const [alert, setAlert] = useState<{
    tone: 'success' | 'error'
    msg: string
  } | null>(null)

  const turmas = useQuery({
    queryKey: ['turmas-todas'],
    queryFn: () => listarTurmas()
  })
  const disciplinas = useQuery({
    queryKey: ['disciplinas'],
    queryFn: () => listarDisciplinas()
  })
  const professores = useQuery({
    queryKey: ['professores'],
    queryFn: listarProfessores
  })

  const filtered = useMemo(() => {
    const list = turmas.data ?? []
    return list.filter(t => {
      const matchSemestre = filtroSemestre ? t.semestre === filtroSemestre : true
      const matchAno = filtroAno ? t.ano === filtroAno : true
      return matchSemestre && matchAno
    })
  }, [turmas.data, filtroSemestre, filtroAno])

  const semestresDisponiveis = useMemo(
    () => Array.from(new Set((turmas.data ?? []).map(t => t.semestre))).sort(),
    [turmas.data]
  )
  const anosDisponiveis = useMemo(
    () =>
      Array.from(new Set((turmas.data ?? []).map(t => t.ano))).sort(
        (a, b) => b - a
      ),
    [turmas.data]
  )

  const form = useForm<FormData>({ resolver: zodResolver(schema) })

  const openCreate = () => {
    setEditing(null)
    form.reset({
      codigo: '',
      horario: '',
      vagas: 30,
      semestre: '2026.1',
      ano: 2026,
      turno: 'NOITE',
      sala: '',
      professorId: '',
      disciplinaId: disciplinas.data?.[0]?.id
    })
    setOpen(true)
  }

  const openEdit = (t: Turma) => {
    setEditing(t)
    const turnoRaw = (t as { turno?: string }).turno
    const turno: 'MANHA' | 'TARDE' | 'NOITE' =
      turnoRaw === 'MANHA' || turnoRaw === 'TARDE' || turnoRaw === 'NOITE'
        ? turnoRaw
        : 'NOITE'
    form.reset({
      codigo: t.codigo,
      horario: t.horario ?? '',
      vagas: t.vagas,
      semestre: t.semestre,
      ano: t.ano,
      turno,
      sala: t.sala ?? '',
      professorId: t.professor?.id ?? '',
      disciplinaId: t.disciplina?.id
    })
    setOpen(true)
  }

  const closeModal = () => {
    setOpen(false)
    setEditing(null)
  }

  const mutation = useMutation({
    mutationFn: (values: FormData) => {
      const disciplinaId = Number(values.disciplinaId)
      const payload: TurmaUpdatePayload = {
        codigo: values.codigo,
        horario: values.horario || undefined,
        vagas: Number(values.vagas),
        semestre: values.semestre,
        ano: Number(values.ano),
        turno: values.turno,
        sala: values.sala || undefined,
        professorId:
          values.professorId === '' || values.professorId === undefined
            ? undefined
            : Number(values.professorId),
        disciplinaId
      }
      return editing
        ? atualizarTurma(editing.id, payload)
        : criarTurma(disciplinaId, payload)
    },
    onSuccess: () => {
      setAlert({
        tone: 'success',
        msg: editing ? 'Turma atualizada.' : 'Turma criada.'
      })
      closeModal()
      qc.invalidateQueries({ queryKey: ['turmas-todas'] })
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      setAlert({
        tone: 'error',
        msg: err?.response?.data?.message ?? 'Erro ao salvar turma.'
      })
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deletarTurma(id),
    onSuccess: () => {
      setAlert({ tone: 'success', msg: 'Turma removida.' })
      qc.invalidateQueries({ queryKey: ['turmas-todas'] })
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      setAlert({
        tone: 'error',
        msg: err?.response?.data?.message ?? 'Erro ao remover.'
      })
    }
  })

  const handleDelete = (t: Turma) => {
    if (window.confirm(`Remover a turma ${t.codigo}?`)) {
      deleteMutation.mutate(t.id)
    }
  }

  const onSubmit = form.handleSubmit(values => mutation.mutate(values))

  return (
    <>
      <PageHeader
        title="Turmas"
        subtitle="Oferta de turmas e atribuição de professores."
        actions={<Button onClick={openCreate}>+ Nova turma</Button>}
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

      <Card className="mb-4" noPadding>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-5">
          <div>
            <label className="block text-xs font-semibold text-text-muted uppercase tracking-wide mb-1.5">
              Semestre
            </label>
            <select
              value={filtroSemestre}
              onChange={e => setFiltroSemestre(e.target.value)}
              className={SELECT_CLS}
            >
              <option value="">Todos</option>
              {semestresDisponiveis.map(s => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-text-muted uppercase tracking-wide mb-1.5">
              Ano
            </label>
            <select
              value={filtroAno}
              onChange={e =>
                setFiltroAno(e.target.value ? Number(e.target.value) : '')
              }
              className={SELECT_CLS}
            >
              <option value="">Todos</option>
              {anosDisponiveis.map(a => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {turmas.isLoading ? (
        <div className="flex items-center justify-center gap-2 text-text-muted py-10">
          <Spinner /> Carregando turmas...
        </div>
      ) : turmas.isError ? (
        <Card className="bg-primary-light border-primary">
          <p className="text-primary-dark text-sm">Erro ao carregar turmas.</p>
        </Card>
      ) : (
        <Table>
          <THead>
            <TR>
              <TH>Código</TH>
              <TH>Disciplina</TH>
              <TH>Professor</TH>
              <TH>Sem./Ano</TH>
              <TH>Vagas</TH>
              <TH>Ações</TH>
            </TR>
          </THead>
          <TBody>
            {filtered.length === 0 && (
              <EmptyRow colSpan={6}>Nenhuma turma cadastrada.</EmptyRow>
            )}
            {filtered.map(t => (
              <TR key={t.id}>
                <TD>
                  <span className="font-mono text-xs font-semibold">
                    {t.codigo}
                  </span>
                </TD>
                <TD>{t.disciplina?.nome ?? '—'}</TD>
                <TD>{t.professor?.nome ?? '—'}</TD>
                <TD>
                  {t.semestre}/{t.ano}
                </TD>
                <TD>{t.vagas}</TD>
                <TD>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(t)}>
                      Editar
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setAlocarTurma(t)}
                    >
                      Alocar professor
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(t)}
                      className="text-primary hover:bg-primary-light"
                    >
                      Excluir
                    </Button>
                  </div>
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      )}

      <Modal
        open={open}
        onClose={closeModal}
        size="lg"
        title={editing ? 'Editar turma' : 'Nova turma'}
      >
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-text mb-1">
              Disciplina
            </label>
            <select
              {...form.register('disciplinaId')}
              className={SELECT_CLS}
            >
              <option value="">— Selecione —</option>
              {disciplinas.data?.map(d => (
                <option key={d.id} value={d.id}>
                  {d.codigo} · {d.nome}
                </option>
              ))}
            </select>
            {form.formState.errors.disciplinaId && (
              <small className="text-primary text-xs">
                {form.formState.errors.disciplinaId.message}
              </small>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-text mb-1">
                Código
              </label>
              <Input
                {...form.register('codigo')}
                error={form.formState.errors.codigo?.message}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1">
                Vagas
              </label>
              <Input
                type="number"
                {...form.register('vagas')}
                error={form.formState.errors.vagas?.message}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1">
                Semestre
              </label>
              <Input
                {...form.register('semestre')}
                error={form.formState.errors.semestre?.message}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1">
                Ano
              </label>
              <Input
                type="number"
                {...form.register('ano')}
                error={form.formState.errors.ano?.message}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1">
                Turno
              </label>
              <select {...form.register('turno')} className={SELECT_CLS}>
                <option value="MANHA">Manhã</option>
                <option value="TARDE">Tarde</option>
                <option value="NOITE">Noite</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1">
                Sala
              </label>
              <Input {...form.register('sala')} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-1">
              Horário
            </label>
            <Input
              {...form.register('horario')}
              placeholder="2ª e 4ª 19h-22h"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-1">
              Professor
            </label>
            <select {...form.register('professorId')} className={SELECT_CLS}>
              <option value="">— Sem professor atribuído —</option>
              {professores.data?.map(p => (
                <option key={p.id} value={p.id}>
                  {p.nome}
                  {p.titulacao ? ` (${p.titulacao})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2 justify-end pt-2 border-t border-surface-border">
            <Button type="button" variant="secondary" onClick={closeModal}>
              Cancelar
            </Button>
            <Button type="submit" loading={mutation.isPending}>
              {editing ? 'Salvar alterações' : 'Criar turma'}
            </Button>
          </div>
        </form>
      </Modal>

      {alocarTurma && (
        <AlocarProfessorModal
          open={!!alocarTurma}
          onClose={() => setAlocarTurma(null)}
          turmaId={alocarTurma.id}
          turmaCodigo={alocarTurma.codigo}
          currentProfessorId={alocarTurma.professor?.id ?? null}
          onSuccess={() => {
            setAlert({ tone: 'success', msg: 'Professor atualizado.' })
            qc.invalidateQueries({ queryKey: ['turmas-todas'] })
          }}
        />
      )}
    </>
  )
}
