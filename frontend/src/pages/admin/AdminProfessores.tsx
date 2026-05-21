import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  atualizarProfessor,
  criarProfessor,
  deletarProfessor,
  listarProfessores,
  type ProfessorPayload
} from '../../api/professores'
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
import type { Professor } from '../../types'

const cpfRegex = /^(\d{11}|\d{3}\.\d{3}\.\d{3}-\d{2})$/

const schema = z.object({
  nome: z.string().min(3, 'Mínimo 3 caracteres'),
  cpf: z.string().regex(cpfRegex, 'CPF inválido (11 dígitos ou formatado)'),
  email: z.string().email('E-mail inválido'),
  telefone: z.string().optional(),
  registro: z.string().optional(),
  titulacao: z.string().optional(),
  regimeTrabalho: z.string().optional()
})

type FormData = z.input<typeof schema>

const SELECT_CLS =
  'w-full h-10 rounded-lg border border-surface-border bg-white px-3 text-sm text-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20'
const PAGE_SIZE = 12

export function AdminProfessores() {
  const qc = useQueryClient()
  const [searchParams] = useSearchParams()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Professor | null>(null)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [alert, setAlert] = useState<{
    tone: 'success' | 'error'
    msg: string
  } | null>(null)

  const professores = useQuery({
    queryKey: ['professores'],
    queryFn: listarProfessores
  })
  const filtroProfessor = searchParams.get('professor')?.toLowerCase() ?? ''

  const filteredProfessores = useMemo(() => {
    const list = professores.data ?? []
    const term = search.trim().toLowerCase()
    return list.filter(p => {
      const matchDashboard = filtroProfessor
        ? p.nome.toLowerCase().includes(filtroProfessor)
        : true
      const matchSearch = !term
        ? true
        : [
            p.nome,
            p.email,
            p.cpf,
            p.telefone,
            p.registro,
            p.titulacao,
            p.regimeTrabalho
          ]
            .filter(Boolean)
            .some(value => String(value).toLowerCase().includes(term))
      return matchDashboard && matchSearch
    })
  }, [filtroProfessor, professores.data, search])

  const currentPage = Math.min(
    page,
    Math.max(1, Math.ceil(filteredProfessores.length / PAGE_SIZE))
  )
  const pagedProfessores = filteredProfessores.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  )

  const form = useForm<FormData>({ resolver: zodResolver(schema) })

  const openCreate = () => {
    setEditing(null)
    form.reset({
      nome: '',
      cpf: '',
      email: '',
      telefone: '',
      registro: '',
      titulacao: '',
      regimeTrabalho: ''
    })
    setOpen(true)
  }

  const openEdit = (p: Professor) => {
    setEditing(p)
    form.reset({
      nome: p.nome,
      cpf: p.cpf ?? '',
      email: p.email ?? '',
      telefone: p.telefone ?? '',
      registro: p.registro ?? '',
      titulacao: p.titulacao ?? '',
      regimeTrabalho: p.regimeTrabalho ?? ''
    })
    setOpen(true)
  }

  const closeModal = () => {
    setOpen(false)
    setEditing(null)
  }

  const mutation = useMutation({
    mutationFn: (payload: ProfessorPayload) =>
      editing
        ? atualizarProfessor(editing.id, payload)
        : criarProfessor(payload),
    onSuccess: () => {
      setAlert({
        tone: 'success',
        msg: editing ? 'Professor atualizado.' : 'Professor cadastrado.'
      })
      closeModal()
      qc.invalidateQueries({ queryKey: ['professores'] })
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      setAlert({
        tone: 'error',
        msg: err?.response?.data?.message ?? 'Erro ao salvar professor.'
      })
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deletarProfessor(id),
    onSuccess: () => {
      setAlert({ tone: 'success', msg: 'Professor removido.' })
      qc.invalidateQueries({ queryKey: ['professores'] })
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      setAlert({
        tone: 'error',
        msg: err?.response?.data?.message ?? 'Erro ao remover.'
      })
    }
  })

  const handleDelete = (p: Professor) => {
    if (window.confirm(`Remover o professor ${p.nome}?`)) {
      deleteMutation.mutate(p.id)
    }
  }

  const onSubmit = form.handleSubmit(values => {
    const payload: ProfessorPayload = {
      nome: values.nome,
      cpf: values.cpf,
      email: values.email,
      telefone: values.telefone || undefined,
      registro: values.registro || undefined,
      titulacao: values.titulacao || undefined,
      regimeTrabalho:
        values.regimeTrabalho === 'INTEGRAL' ||
        values.regimeTrabalho === 'PARCIAL' ||
        values.regimeTrabalho === 'HORISTA'
          ? values.regimeTrabalho
          : undefined
    }
    mutation.mutate(payload)
  })

  return (
    <>
      <PageHeader
        title="Professores"
        subtitle="Cadastro e edição do corpo docente."
        actions={<Button onClick={openCreate}>+ Novo professor</Button>}
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

      {filtroProfessor && (
        <Card className="mb-4">
          <p className="text-sm text-text">
            Filtro da dashboard:{' '}
            <span className="font-semibold">
              professor {searchParams.get('professor')}
            </span>
          </p>
        </Card>
      )}

      <Card className="mb-4" noPadding>
        <div className="grid grid-cols-1 gap-3 p-5 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <label className="block text-xs font-semibold text-text-muted uppercase tracking-wide mb-1.5">
              Pesquisar professores
            </label>
            <Input
              placeholder="Nome, email, registro, telefone ou titulacao..."
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

      {professores.isLoading ? (
        <div className="flex items-center justify-center gap-2 text-text-muted py-10">
          <Spinner /> Carregando...
        </div>
      ) : professores.isError ? (
        <Card className="bg-primary-light border-primary">
          <p className="text-primary-dark text-sm">Erro ao carregar professores.</p>
        </Card>
      ) : (
        <>
        <Table>
          <THead>
            <TR>
              <TH>Nome</TH>
              <TH>CPF</TH>
              <TH>E-mail</TH>
              <TH>Telefone</TH>
              <TH>Registro</TH>
              <TH>Titulação</TH>
              <TH>Ações</TH>
            </TR>
          </THead>
          <TBody>
            {filteredProfessores.length === 0 && (
              <EmptyRow colSpan={7}>Nenhum professor encontrado.</EmptyRow>
            )}
            {pagedProfessores.map(p => (
              <TR key={p.id}>
                <TD>{p.nome}</TD>
                <TD>
                  <span className="font-mono text-xs">{p.cpf ?? '—'}</span>
                </TD>
                <TD>{p.email ?? '—'}</TD>
                <TD>{p.telefone ?? '—'}</TD>
                <TD>{p.registro ?? '—'}</TD>
                <TD>{p.titulacao ?? '—'}</TD>
                <TD>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(p)}>
                      Editar
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(p)}
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
          total={filteredProfessores.length}
          onPageChange={setPage}
        />
        </>
      )}

      <Modal
        open={open}
        onClose={closeModal}
        size="lg"
        title={editing ? 'Editar professor' : 'Novo professor'}
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
                E-mail
              </label>
              <Input
                type="email"
                {...form.register('email')}
                error={form.formState.errors.email?.message}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1">
                Telefone
              </label>
              <Input {...form.register('telefone')} placeholder="(00) 00000-0000" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1">
                Registro
              </label>
              <Input {...form.register('registro')} />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1">
                Titulação
              </label>
              <Input {...form.register('titulacao')} placeholder="Doutor(a)..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1">
                Regime de trabalho
              </label>
              <select {...form.register('regimeTrabalho')} className={SELECT_CLS}>
                <option value="">— Não definido —</option>
                <option value="INTEGRAL">Integral</option>
                <option value="PARCIAL">Parcial</option>
                <option value="HORISTA">Horista</option>
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
