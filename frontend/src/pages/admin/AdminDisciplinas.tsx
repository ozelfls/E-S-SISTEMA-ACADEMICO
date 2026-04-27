import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  atualizarDisciplina,
  criarDisciplina,
  deletarDisciplina,
  listarDisciplinas,
  type DisciplinaPayload
} from '../../api/disciplinas'
import { listarCursos } from '../../api/cursos'
import { PageHeader } from '../../components/layout/PageHeader'
import { Card } from '../../components/ui/Card'
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
import { Input } from '../../components/ui/Input'
import { Modal } from '../../components/ui/Modal'
import { Spinner } from '../../components/ui/Spinner'
import { Badge } from '../../components/ui/Badge'
import type { Disciplina } from '../../types'

const schema = z.object({
  codigo: z.string().min(1, 'Informe o código'),
  nome: z.string().min(3, 'Mínimo 3 caracteres'),
  creditos: z.coerce.number().int().min(1).max(20),
  ch: z.coerce.number().int().min(15),
  modalidade: z.enum(['PRESENCIAL', 'EAD', 'HIBRIDA']),
  cursoId: z.coerce.number().int().min(1, 'Selecione um curso'),
  preRequisitoId: z
    .union([z.coerce.number().int().min(1), z.literal('')])
    .optional()
    .transform(v => (v === '' || v === undefined ? undefined : Number(v))),
  ementa: z.string().optional()
})

type FormData = z.input<typeof schema>

const SELECT_CLS =
  'w-full h-10 rounded-lg border border-surface-border bg-white px-3 text-sm text-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20'

export function AdminDisciplinas() {
  const qc = useQueryClient()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Disciplina | null>(null)
  const [filterCurso, setFilterCurso] = useState<number | ''>('')
  const [search, setSearch] = useState('')
  const [alert, setAlert] = useState<{
    tone: 'success' | 'error'
    msg: string
  } | null>(null)

  const cursos = useQuery({ queryKey: ['cursos'], queryFn: listarCursos })
  const disciplinas = useQuery({
    queryKey: ['disciplinas'],
    queryFn: () => listarDisciplinas()
  })

  const filtered = useMemo(() => {
    const list = disciplinas.data ?? []
    return list.filter(d => {
      const matchCurso = filterCurso ? d.curso?.id === filterCurso : true
      const term = search.trim().toLowerCase()
      const matchTerm = !term
        ? true
        : d.codigo.toLowerCase().includes(term) ||
          d.nome.toLowerCase().includes(term)
      return matchCurso && matchTerm
    })
  }, [disciplinas.data, filterCurso, search])

  const form = useForm<FormData>({ resolver: zodResolver(schema) })

  const openCreate = () => {
    setEditing(null)
    form.reset({
      codigo: '',
      nome: '',
      creditos: 4,
      ch: 60,
      modalidade: 'PRESENCIAL',
      cursoId: cursos.data?.[0]?.id,
      preRequisitoId: undefined,
      ementa: ''
    })
    setOpen(true)
  }

  const openEdit = (d: Disciplina) => {
    setEditing(d)
    form.reset({
      codigo: d.codigo,
      nome: d.nome,
      creditos: d.creditos,
      ch: d.ch,
      modalidade: d.modalidade ?? 'PRESENCIAL',
      cursoId: d.curso?.id ?? cursos.data?.[0]?.id,
      preRequisitoId: d.preRequisito?.id,
      ementa: d.ementa ?? ''
    })
    setOpen(true)
  }

  const closeModal = () => {
    setOpen(false)
    setEditing(null)
  }

  const mutation = useMutation({
    mutationFn: (payload: DisciplinaPayload) =>
      editing
        ? atualizarDisciplina(editing.id, payload)
        : criarDisciplina(payload),
    onSuccess: () => {
      setAlert({
        tone: 'success',
        msg: editing ? 'Disciplina atualizada.' : 'Disciplina criada.'
      })
      closeModal()
      qc.invalidateQueries({ queryKey: ['disciplinas'] })
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      setAlert({
        tone: 'error',
        msg: err?.response?.data?.message ?? 'Erro ao salvar disciplina.'
      })
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deletarDisciplina(id),
    onSuccess: () => {
      setAlert({ tone: 'success', msg: 'Disciplina removida.' })
      qc.invalidateQueries({ queryKey: ['disciplinas'] })
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      setAlert({
        tone: 'error',
        msg: err?.response?.data?.message ?? 'Erro ao remover.'
      })
    }
  })

  const handleDelete = (d: Disciplina) => {
    if (window.confirm(`Remover a disciplina ${d.codigo} — ${d.nome}?`)) {
      deleteMutation.mutate(d.id)
    }
  }

  const onSubmit = form.handleSubmit(values => {
    const payload: DisciplinaPayload = {
      codigo: values.codigo,
      nome: values.nome,
      creditos: Number(values.creditos),
      ch: Number(values.ch),
      modalidade: values.modalidade,
      cursoId: Number(values.cursoId),
      preRequisitoId:
        values.preRequisitoId === undefined || values.preRequisitoId === ''
          ? undefined
          : Number(values.preRequisitoId),
      ementa: values.ementa || undefined
    }
    mutation.mutate(payload)
  })

  return (
    <>
      <PageHeader
        title="Disciplinas"
        subtitle="Gestão completa do catálogo de disciplinas."
        actions={<Button onClick={openCreate}>+ Nova disciplina</Button>}
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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-5">
          <div>
            <label className="block text-xs font-semibold text-text-muted uppercase tracking-wide mb-1.5">
              Curso
            </label>
            <select
              value={filterCurso}
              onChange={e =>
                setFilterCurso(e.target.value ? Number(e.target.value) : '')
              }
              className={SELECT_CLS}
            >
              <option value="">Todos os cursos</option>
              {cursos.data?.map(c => (
                <option key={c.id} value={c.id}>
                  {c.nome}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-text-muted uppercase tracking-wide mb-1.5">
              Buscar
            </label>
            <Input
              placeholder="Código ou nome..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
      </Card>

      {disciplinas.isLoading ? (
        <div className="flex items-center justify-center gap-2 text-text-muted py-10">
          <Spinner /> Carregando disciplinas...
        </div>
      ) : disciplinas.isError ? (
        <Card className="bg-primary-light border-primary">
          <p className="text-primary-dark text-sm">
            Erro ao carregar disciplinas.
          </p>
        </Card>
      ) : (
        <Table>
          <THead>
            <TR>
              <TH>Código</TH>
              <TH>Nome</TH>
              <TH>Créditos</TH>
              <TH>CH</TH>
              <TH>Modalidade</TH>
              <TH>Curso</TH>
              <TH>Ações</TH>
            </TR>
          </THead>
          <TBody>
            {filtered.length === 0 && (
              <EmptyRow colSpan={7}>Nenhuma disciplina cadastrada.</EmptyRow>
            )}
            {filtered.map(d => (
              <TR key={d.id}>
                <TD>
                  <span className="font-mono text-xs font-semibold text-text">
                    {d.codigo}
                  </span>
                </TD>
                <TD>{d.nome}</TD>
                <TD>{d.creditos}</TD>
                <TD>{d.ch}h</TD>
                <TD>
                  {d.modalidade ? (
                    <Badge variant="neutral">{d.modalidade}</Badge>
                  ) : (
                    <span className="text-text-muted text-xs">—</span>
                  )}
                </TD>
                <TD>
                  {d.curso?.nome ?? (
                    <span className="text-text-muted text-xs">—</span>
                  )}
                </TD>
                <TD>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(d)}>
                      Editar
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(d)}
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
        title={editing ? 'Editar disciplina' : 'Nova disciplina'}
      >
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-text mb-1">
                Código
              </label>
              <Input
                {...form.register('codigo')}
                error={form.formState.errors.codigo?.message}
                placeholder="MAT101"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1">
                Nome
              </label>
              <Input
                {...form.register('nome')}
                error={form.formState.errors.nome?.message}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-sm font-medium text-text mb-1">
                Créditos
              </label>
              <Input
                type="number"
                {...form.register('creditos')}
                error={form.formState.errors.creditos?.message}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1">
                CH
              </label>
              <Input
                type="number"
                {...form.register('ch')}
                error={form.formState.errors.ch?.message}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1">
                Modalidade
              </label>
              <select
                {...form.register('modalidade')}
                className={SELECT_CLS}
              >
                <option value="PRESENCIAL">Presencial</option>
                <option value="EAD">EAD</option>
                <option value="HIBRIDA">Híbrida</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1">
                Curso
              </label>
              <select
                {...form.register('cursoId')}
                className={SELECT_CLS}
              >
                <option value="">— Selecione —</option>
                {cursos.data?.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.nome}
                  </option>
                ))}
              </select>
              {form.formState.errors.cursoId && (
                <small className="text-primary text-xs">
                  {form.formState.errors.cursoId.message}
                </small>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-1">
              Pré-requisito (opcional)
            </label>
            <select
              {...form.register('preRequisitoId')}
              className={SELECT_CLS}
            >
              <option value="">— Sem pré-requisito —</option>
              {disciplinas.data
                ?.filter(d => d.id !== editing?.id)
                .map(d => (
                  <option key={d.id} value={d.id}>
                    {d.codigo} · {d.nome}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-1">
              Ementa (opcional)
            </label>
            <textarea
              {...form.register('ementa')}
              rows={3}
              className="w-full rounded-lg border border-surface-border bg-white px-3 py-2 text-sm text-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
            />
          </div>

          <div className="flex gap-2 justify-end pt-2 border-t border-surface-border">
            <Button type="button" variant="secondary" onClick={closeModal}>
              Cancelar
            </Button>
            <Button type="submit" loading={mutation.isPending}>
              {editing ? 'Salvar alterações' : 'Criar disciplina'}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  )
}
