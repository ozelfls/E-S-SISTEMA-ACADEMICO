import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { listarAlunos, criarAluno, type AlunoPayload } from '../../api/alunos'
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
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Modal } from '../../components/ui/Modal'
import { useToast } from '../../hooks/useToast'
import type { Turno } from '../../types'

const initialForm: AlunoPayload = {
  nome: '',
  cpf: '',
  matriculaId: 0,
  turno: 'NOITE' as Turno,
  cursoId: 0,
  email: ''
}

const onlyDigits = (value: string) => value.replace(/\D/g, '').slice(0, 11)

export function Alunos() {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<AlunoPayload>(initialForm)
  const qc = useQueryClient()
  const { showError, showSuccess } = useToast()

  const alunos = useQuery({ queryKey: ['alunos'], queryFn: listarAlunos })
  const cursos = useQuery({ queryKey: ['cursos'], queryFn: listarCursos })

  const mutation = useMutation({
    mutationFn: () => criarAluno(form),
    onSuccess: () => {
      showSuccess('Aluno cadastrado.')
      setOpen(false)
      setForm(initialForm)
      qc.invalidateQueries({ queryKey: ['alunos'] })
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      showError(err?.response?.data?.message ?? 'Erro ao cadastrar aluno.')
    }
  })

  return (
    <>
      <PageHeader
        title="Alunos"
        subtitle="Cadastro e listagem de alunos."
        action={<Button onClick={() => setOpen(true)}>+ Novo aluno</Button>}
      />

      <Table>
        <THead>
          <TR>
            <TH>Matrícula</TH>
            <TH>Nome</TH>
            <TH>Curso</TH>
            <TH>Turno</TH>
            <TH>Email</TH>
          </TR>
        </THead>
        <TBody>
          {(!alunos.data || alunos.data.length === 0) && (
            <EmptyRow colSpan={5} />
          )}
          {alunos.data?.map(a => (
            <TR key={a.id}>
              <TD>{a.matriculaId}</TD>
              <TD>{a.nome}</TD>
              <TD>{a.curso?.nome ?? '–'}</TD>
              <TD>{a.turno}</TD>
              <TD>{a.email ?? '–'}</TD>
            </TR>
          ))}
        </TBody>
      </Table>

      <Modal open={open} onClose={() => setOpen(false)} title="Cadastrar aluno">
        <div className="flex flex-col gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">Nome</label>
            <Input
              value={form.nome}
              onChange={e => setForm({ ...form, nome: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">CPF</label>
              <Input
                value={form.cpf}
                onChange={e => setForm({ ...form, cpf: onlyDigits(e.target.value) })}
                inputMode="numeric"
                maxLength={11}
                placeholder="Somente numeros"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Nº Matrícula
              </label>
              <Input
                value="Gerada automaticamente"
                disabled
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <Input
              type="email"
              value={form.email ?? ''}
              onChange={e => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Curso</label>
              <select
                value={form.cursoId || ''}
                onChange={e =>
                  setForm({ ...form, cursoId: Number(e.target.value) })
                }
                className="w-full rounded-card border border-surface-border bg-white px-3 py-2.5 text-sm"
              >
                <option value="">— Selecione —</option>
                {cursos.data?.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.nome}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Turno</label>
              <select
                value={form.turno}
                onChange={e =>
                  setForm({ ...form, turno: e.target.value as Turno })
                }
                className="w-full rounded-card border border-surface-border bg-white px-3 py-2.5 text-sm"
              >
                <option value="MANHA">Manhã</option>
                <option value="TARDE">Tarde</option>
                <option value="NOITE">Noite</option>
                <option value="INTEGRAL">Integral</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2 justify-end mt-2">
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button
              disabled={
                !form.nome ||
                !form.cpf ||
                !form.cursoId ||
                mutation.isPending
              }
              onClick={() => mutation.mutate()}
            >
              {mutation.isPending ? 'Salvando...' : 'Cadastrar'}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
