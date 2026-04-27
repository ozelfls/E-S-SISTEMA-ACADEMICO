import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  atualizarCurso,
  criarCurso,
  deletarCurso,
  listarCursos,
  nomearCoordenador,
  type CursoFull,
  type CursoPayload
} from '../../api/cursos'
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

const schema = z.object({
  nome: z.string().min(3, 'Mínimo 3 caracteres'),
  chTotal: z.coerce.number().int().min(60),
  prevTerminoAnos: z.coerce.number().int().min(1).max(10),
  limiteConclusao: z.coerce.number().int().min(1).max(15)
})

type FormData = z.input<typeof schema>

const SELECT_CLS =
  'w-full h-10 rounded-lg border border-surface-border bg-white px-3 text-sm text-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20'

export function AdminCursos() {
  const qc = useQueryClient()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<CursoFull | null>(null)
  const [openCoord, setOpenCoord] = useState<number | null>(null)
  const [profSelecionado, setProfSelecionado] = useState<number | ''>('')
  const [alert, setAlert] = useState<{
    tone: 'success' | 'error'
    msg: string
  } | null>(null)

  const cursos = useQuery({ queryKey: ['cursos'], queryFn: listarCursos })
  const professores = useQuery({
    queryKey: ['professores'],
    queryFn: listarProfessores
  })

  const form = useForm<FormData>({ resolver: zodResolver(schema) })

  const openCreate = () => {
    setEditing(null)
    form.reset({
      nome: '',
      chTotal: 3200,
      prevTerminoAnos: 4,
      limiteConclusao: 7
    })
    setOpen(true)
  }

  const openEdit = (c: CursoFull) => {
    setEditing(c)
    form.reset({
      nome: c.nome,
      chTotal: c.chTotal,
      prevTerminoAnos: c.prevTerminoAnos,
      limiteConclusao: c.limiteConclusao
    })
    setOpen(true)
  }

  const closeModal = () => {
    setOpen(false)
    setEditing(null)
  }

  const mutation = useMutation({
    mutationFn: (payload: CursoPayload) =>
      editing ? atualizarCurso(editing.id, payload) : criarCurso(payload),
    onSuccess: () => {
      setAlert({
        tone: 'success',
        msg: editing ? 'Curso atualizado.' : 'Curso criado.'
      })
      closeModal()
      qc.invalidateQueries({ queryKey: ['cursos'] })
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      setAlert({
        tone: 'error',
        msg: err?.response?.data?.message ?? 'Erro ao salvar curso.'
      })
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deletarCurso(id),
    onSuccess: () => {
      setAlert({ tone: 'success', msg: 'Curso removido.' })
      qc.invalidateQueries({ queryKey: ['cursos'] })
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      setAlert({
        tone: 'error',
        msg: err?.response?.data?.message ?? 'Erro ao remover.'
      })
    }
  })

  const coordMutation = useMutation({
    mutationFn: () => nomearCoordenador(openCoord!, profSelecionado as number),
    onSuccess: () => {
      setAlert({ tone: 'success', msg: 'Coordenador atualizado.' })
      setOpenCoord(null)
      setProfSelecionado('')
      qc.invalidateQueries({ queryKey: ['cursos'] })
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      setAlert({
        tone: 'error',
        msg: err?.response?.data?.message ?? 'Erro ao nomear.'
      })
    }
  })

  const handleDelete = (c: CursoFull) => {
    if (window.confirm(`Remover o curso ${c.nome}?`)) {
      deleteMutation.mutate(c.id)
    }
  }

  const onSubmit = form.handleSubmit(values => {
    const payload: CursoPayload = {
      nome: values.nome,
      chTotal: Number(values.chTotal),
      prevTerminoAnos: Number(values.prevTerminoAnos),
      limiteConclusao: Number(values.limiteConclusao)
    }
    mutation.mutate(payload)
  })

  return (
    <>
      <PageHeader
        title="Cursos"
        subtitle="Cadastro de cursos e nomeação de coordenadores."
        actions={<Button onClick={openCreate}>+ Novo curso</Button>}
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

      {cursos.isLoading ? (
        <div className="flex items-center justify-center gap-2 text-text-muted py-10">
          <Spinner /> Carregando cursos...
        </div>
      ) : cursos.isError ? (
        <Card className="bg-primary-light border-primary">
          <p className="text-primary-dark text-sm">Erro ao carregar cursos.</p>
        </Card>
      ) : (
        <Table>
          <THead>
            <TR>
              <TH>Nome</TH>
              <TH>CH Total</TH>
              <TH>Prev. (anos)</TH>
              <TH>Limite (anos)</TH>
              <TH>Coordenador</TH>
              <TH>Ações</TH>
            </TR>
          </THead>
          <TBody>
            {(!cursos.data || cursos.data.length === 0) && (
              <EmptyRow colSpan={6}>Nenhum curso cadastrado.</EmptyRow>
            )}
            {cursos.data?.map(c => (
              <TR key={c.id}>
                <TD>{c.nome}</TD>
                <TD>{c.chTotal}h</TD>
                <TD>{c.prevTerminoAnos}</TD>
                <TD>{c.limiteConclusao}</TD>
                <TD>
                  {c.coordenador?.nome ?? (
                    <span className="text-text-muted text-xs">— sem nomeação</span>
                  )}
                </TD>
                <TD>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(c)}>
                      Editar
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setOpenCoord(c.id)}
                    >
                      Coordenador
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(c)}
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
        title={editing ? 'Editar curso' : 'Novo curso'}
      >
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-text mb-1">
              Nome
            </label>
            <Input
              {...form.register('nome')}
              error={form.formState.errors.nome?.message}
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-text mb-1">
                CH total
              </label>
              <Input
                type="number"
                {...form.register('chTotal')}
                error={form.formState.errors.chTotal?.message}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1">
                Prev. anos
              </label>
              <Input
                type="number"
                {...form.register('prevTerminoAnos')}
                error={form.formState.errors.prevTerminoAnos?.message}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1">
                Limite anos
              </label>
              <Input
                type="number"
                {...form.register('limiteConclusao')}
                error={form.formState.errors.limiteConclusao?.message}
              />
            </div>
          </div>
          <div className="flex gap-2 justify-end pt-2 border-t border-surface-border">
            <Button type="button" variant="secondary" onClick={closeModal}>
              Cancelar
            </Button>
            <Button type="submit" loading={mutation.isPending}>
              {editing ? 'Salvar alterações' : 'Criar curso'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={openCoord !== null}
        onClose={() => setOpenCoord(null)}
        title="Nomear coordenador"
      >
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-text mb-1">
              Professor
            </label>
            <select
              value={profSelecionado}
              onChange={e =>
                setProfSelecionado(
                  e.target.value ? Number(e.target.value) : ''
                )
              }
              className={SELECT_CLS}
            >
              <option value="">— Selecione —</option>
              {professores.data?.map(p => (
                <option key={p.id} value={p.id}>
                  {p.nome} {p.titulacao ? `(${p.titulacao})` : ''}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2 justify-end pt-2 border-t border-surface-border">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setOpenCoord(null)}
            >
              Cancelar
            </Button>
            <Button
              disabled={!profSelecionado}
              loading={coordMutation.isPending}
              onClick={() => coordMutation.mutate()}
            >
              Confirmar
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
