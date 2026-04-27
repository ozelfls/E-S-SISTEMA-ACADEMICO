import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { listarTurmas, criarTurma, type TurmaPayload } from '../../api/turmas'
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
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Modal } from '../../components/ui/Modal'
import { useToast } from '../../hooks/useToast'
import type { StatusTurma, Turno } from '../../types'

const initialForm: TurmaPayload & { disciplinaId: number | '' } = {
  disciplinaId: '',
  codigo: '',
  horario: '',
  vagas: 30,
  semestre: '2026.1',
  ano: 2026,
  turno: 'NOITE' as Turno,
  sala: '',
  professorId: undefined,
  status: 'OPEN' as StatusTurma
}

export function Turmas() {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(initialForm)
  const qc = useQueryClient()
  const { showError, showSuccess } = useToast()

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
    queryFn: () => listarProfessores()
  })

  const mutation = useMutation({
    mutationFn: () => {
      const { disciplinaId, ...payload } = form
      return criarTurma(disciplinaId as number, payload)
    },
    onSuccess: () => {
      showSuccess('Turma criada.')
      setOpen(false)
      setForm(initialForm)
      qc.invalidateQueries({ queryKey: ['turmas-todas'] })
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      showError(err?.response?.data?.message ?? 'Erro ao criar turma.')
    }
  })

  return (
    <>
      <PageHeader
        title="Turmas"
        subtitle="Oferta de turmas no semestre."
        action={<Button onClick={() => setOpen(true)}>+ Nova turma</Button>}
      />

      <Table>
        <THead>
          <TR>
            <TH>Código</TH>
            <TH>Disciplina</TH>
            <TH>Professor</TH>
            <TH>Sem./Ano</TH>
            <TH>Turno</TH>
            <TH>Vagas</TH>
            <TH>Status</TH>
            <TH>Sala</TH>
          </TR>
        </THead>
        <TBody>
          {(!turmas.data || turmas.data.length === 0) && (
            <EmptyRow colSpan={8} />
          )}
          {turmas.data?.map(t => (
            <TR key={t.id}>
              <TD>{t.codigo}</TD>
              <TD>{t.disciplina?.nome ?? '–'}</TD>
              <TD>{t.professor?.nome ?? '–'}</TD>
              <TD>
                {t.semestre}/{t.ano}
              </TD>
              <TD>{(t as { turno?: string }).turno ?? '–'}</TD>
              <TD>{t.vagas}</TD>
              <TD>{t.status ?? 'OPEN'}</TD>
              <TD>{t.sala ?? '–'}</TD>
            </TR>
          ))}
        </TBody>
      </Table>

      <Modal open={open} onClose={() => setOpen(false)} title="Nova turma">
        <div className="flex flex-col gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">Disciplina</label>
            <select
              value={form.disciplinaId}
              onChange={e =>
                setForm({
                  ...form,
                  disciplinaId: e.target.value ? Number(e.target.value) : ''
                })
              }
              className="w-full rounded-card border border-surface-border bg-white px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">— Selecione —</option>
              {disciplinas.data?.map(d => (
                <option key={d.id} value={d.id}>
                  {d.codigo} · {d.nome}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Código</label>
              <Input
                value={form.codigo}
                onChange={e => setForm({ ...form, codigo: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Vagas</label>
              <Input
                type="number"
                value={form.vagas}
                onChange={e =>
                  setForm({ ...form, vagas: Number(e.target.value) })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Semestre</label>
              <Input
                value={form.semestre}
                onChange={e => setForm({ ...form, semestre: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Ano</label>
              <Input
                type="number"
                value={form.ano}
                onChange={e =>
                  setForm({ ...form, ano: Number(e.target.value) })
                }
              />
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
            <div>
              <label className="block text-sm font-medium mb-1">Sala</label>
              <Input
                value={form.sala ?? ''}
                onChange={e => setForm({ ...form, sala: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Horário</label>
            <Input
              value={form.horario ?? ''}
              onChange={e => setForm({ ...form, horario: e.target.value })}
              placeholder="2ª e 4ª 19h-22h"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Status inicial</label>
            <select
              value={form.status ?? 'OPEN'}
              onChange={e =>
                setForm({
                  ...form,
                  status: e.target.value as StatusTurma
                })
              }
              className="w-full rounded-card border border-surface-border bg-white px-3 py-2.5 text-sm"
            >
              <option value="OPEN">OPEN</option>
              <option value="IN_PROGRESS">IN_PROGRESS</option>
              <option value="CLOSED">CLOSED</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Professor</label>
            <select
              value={form.professorId ?? ''}
              onChange={e =>
                setForm({
                  ...form,
                  professorId: e.target.value
                    ? Number(e.target.value)
                    : undefined
                })
              }
              className="w-full rounded-card border border-surface-border bg-white px-3 py-2.5 text-sm"
            >
              <option value="">— Sem professor atribuído —</option>
              {professores.data?.map(p => (
                <option key={p.id} value={p.id}>
                  {p.nome}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2 justify-end mt-2">
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button
              disabled={
                !form.disciplinaId || !form.codigo || mutation.isPending
              }
              onClick={() => mutation.mutate()}
            >
              {mutation.isPending ? 'Salvando...' : 'Criar turma'}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
