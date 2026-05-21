import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  atualizarAluno,
  criarAluno,
  deletarAluno,
  listarAlunos,
  type AlunoPayload
} from '../../api/alunos'
import { listarCursos } from '../../api/cursos'
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
import { Pagination } from '../../components/ui/Pagination'
import { Spinner } from '../../components/ui/Spinner'
import type { Aluno, Turno } from '../../types'

const cpfRegex = /^(\d{11}|\d{3}\.\d{3}\.\d{3}-\d{2})$/

const schema = z.object({
  nome: z.string().min(3, 'Mínimo 3 caracteres'),
  cpf: z.string().regex(cpfRegex, 'CPF inválido'),
  turno: z.enum(['MANHA', 'TARDE', 'NOITE', 'INTEGRAL']),
  cursoId: z.coerce.number().int().min(1, 'Selecione o curso'),
  email: z
    .string()
    .email('E-mail inválido')
    .optional()
    .or(z.literal(''))
    .transform(v => (v ? v : undefined))
})

type FormData = z.input<typeof schema>

const SELECT_CLS =
  'w-full h-10 rounded-lg border border-surface-border bg-white px-3 text-sm text-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20'
const PAGE_SIZE = 12
const formatMatricula = (value: number) => String(value).padStart(6, '0')

export function AdminAlunos() {
  const qc = useQueryClient()
  const [searchParams] = useSearchParams()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Aluno | null>(null)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [alert, setAlert] = useState<{
    tone: 'success' | 'error'
    msg: string
  } | null>(null)

  const alunos = useQuery({ queryKey: ['alunos'], queryFn: listarAlunos })
  const cursos = useQuery({ queryKey: ['cursos'], queryFn: listarCursos })
  const filtroCurso = searchParams.get('curso')?.toLowerCase() ?? ''
  const filtroAluno = searchParams.get('aluno')?.toLowerCase() ?? ''

  const filteredAlunos = useMemo(() => {
    const list = alunos.data ?? []
    const term = search.trim().toLowerCase()
    return list.filter(a => {
      const matchCurso = filtroCurso
        ? a.curso?.nome?.toLowerCase() === filtroCurso
        : true
      const matchAluno = filtroAluno
        ? a.nome.toLowerCase().includes(filtroAluno)
        : true
      const matchSearch = !term
        ? true
        : [a.nome, a.email, String(a.matriculaId), a.curso?.nome, a.turno]
            .filter(Boolean)
            .some(value => String(value).toLowerCase().includes(term))
      return matchCurso && matchAluno && matchSearch
    })
  }, [alunos.data, filtroAluno, filtroCurso, search])

  const currentPage = Math.min(
    page,
    Math.max(1, Math.ceil(filteredAlunos.length / PAGE_SIZE))
  )
  const pagedAlunos = filteredAlunos.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  )

  const form = useForm<FormData>({ resolver: zodResolver(schema) })

  const openCreate = () => {
    setEditing(null)
    form.reset({
      nome: '',
      cpf: '',
      turno: 'NOITE',
      cursoId: cursos.data?.[0]?.id,
      email: ''
    })
    setOpen(true)
  }

  const openEdit = (a: Aluno) => {
    setEditing(a)
    form.reset({
      nome: a.nome,
      cpf: '',
      turno: a.turno,
      cursoId: a.curso?.id ?? cursos.data?.[0]?.id,
      email: a.email ?? ''
    })
    setOpen(true)
  }

  const closeModal = () => {
    setOpen(false)
    setEditing(null)
  }

  const mutation = useMutation({
    mutationFn: (payload: AlunoPayload) =>
      editing ? atualizarAluno(editing.id, payload) : criarAluno(payload),
    onSuccess: data => {
      setAlert({
        tone: 'success',
        msg: editing
          ? 'Aluno atualizado.'
          : `Aluno cadastrado. Matricula ${formatMatricula(data.matriculaId)}.`
      })
      closeModal()
      qc.invalidateQueries({ queryKey: ['alunos'] })
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      setAlert({
        tone: 'error',
        msg: err?.response?.data?.message ?? 'Erro ao salvar aluno.'
      })
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deletarAluno(id),
    onSuccess: () => {
      setAlert({ tone: 'success', msg: 'Aluno removido.' })
      qc.invalidateQueries({ queryKey: ['alunos'] })
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      setAlert({
        tone: 'error',
        msg: err?.response?.data?.message ?? 'Erro ao remover.'
      })
    }
  })

  const handleDelete = (a: Aluno) => {
    if (window.confirm(`Remover o aluno ${a.nome}?`)) {
      deleteMutation.mutate(a.id)
    }
  }

  const onSubmit = form.handleSubmit(values => {
    const payload: AlunoPayload = {
      nome: values.nome,
      cpf: values.cpf,
      turno: values.turno as Turno,
      cursoId: Number(values.cursoId),
      email: values.email || undefined
    }
    mutation.mutate(payload)
  })

  return (
    <>
      <PageHeader
        title="Alunos"
        subtitle="Cadastro e gestão de alunos."
        actions={<Button onClick={openCreate}>+ Novo aluno</Button>}
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

      {(filtroCurso || filtroAluno) && (
        <Card className="mb-4">
          <p className="text-sm text-text">
            Filtro da dashboard:{' '}
            <span className="font-semibold">
              {filtroCurso ? `curso ${searchParams.get('curso')}` : ''}
              {filtroCurso && filtroAluno ? ' · ' : ''}
              {filtroAluno ? `aluno ${searchParams.get('aluno')}` : ''}
            </span>
          </p>
        </Card>
      )}

      <Card className="mb-4" noPadding>
        <div className="grid grid-cols-1 gap-3 p-5 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <label className="block text-xs font-semibold text-text-muted uppercase tracking-wide mb-1.5">
              Pesquisar alunos
            </label>
            <Input
              placeholder="Nome, email, matricula, curso ou turno..."
              value={search}
              onChange={e => {
                setSearch(e.target.value)
                setPage(1)
              }}
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

      {alunos.isLoading ? (
        <div className="flex items-center justify-center gap-2 text-text-muted py-10">
          <Spinner /> Carregando alunos...
        </div>
      ) : alunos.isError ? (
        <Card className="bg-primary-light border-primary">
          <p className="text-primary-dark text-sm">Erro ao carregar alunos.</p>
        </Card>
      ) : (
        <>
        <Table>
          <THead>
            <TR>
              <TH>Matrícula</TH>
              <TH>Nome</TH>
              <TH>Curso</TH>
              <TH>Turno</TH>
              <TH>E-mail</TH>
              <TH>Ações</TH>
            </TR>
          </THead>
          <TBody>
            {filteredAlunos.length === 0 && (
              <EmptyRow colSpan={6}>Nenhum aluno encontrado.</EmptyRow>
            )}
            {pagedAlunos.map(a => (
              <TR key={a.id}>
                <TD>
                  <span className="font-mono text-xs font-semibold">
                    {formatMatricula(a.matriculaId)}
                  </span>
                </TD>
                <TD>{a.nome}</TD>
                <TD>{a.curso?.nome ?? '—'}</TD>
                <TD>{a.turno}</TD>
                <TD>{a.email ?? '—'}</TD>
                <TD>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(a)}>
                      Editar
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(a)}
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
        <Pagination
          page={currentPage}
          pageSize={PAGE_SIZE}
          total={filteredAlunos.length}
          onPageChange={setPage}
        />
        </>
      )}

      <Modal
        open={open}
        onClose={closeModal}
        size="lg"
        title={editing ? 'Editar aluno' : 'Cadastrar aluno'}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-text mb-1">
                CPF
              </label>
              <Input
                {...form.register('cpf')}
                error={form.formState.errors.cpf?.message}
                placeholder="000.000.000-00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1">
                Matricula
              </label>
              <div className="flex h-10 items-center rounded-lg border border-surface-border bg-surface px-3 text-sm text-text-muted">
                {editing ? formatMatricula(editing.matriculaId) : 'Gerada automaticamente'}
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-text mb-1">
              E-mail
            </label>
            <Input
              type="email"
              {...form.register('email')}
              error={form.formState.errors.email?.message}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-text mb-1">
                Curso
              </label>
              <select {...form.register('cursoId')} className={SELECT_CLS}>
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
            <div>
              <label className="block text-sm font-medium text-text mb-1">
                Turno
              </label>
              <select {...form.register('turno')} className={SELECT_CLS}>
                <option value="MANHA">Manhã</option>
                <option value="TARDE">Tarde</option>
                <option value="NOITE">Noite</option>
                <option value="INTEGRAL">Integral</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-2 border-t border-surface-border">
            <Button type="button" variant="secondary" onClick={closeModal}>
              Cancelar
            </Button>
            <Button type="submit" loading={mutation.isPending}>
              {editing ? 'Salvar alterações' : 'Cadastrar'}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  )
}
