import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  listarCursos,
  criarCurso,
  nomearCoordenador,
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
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Modal } from '../../components/ui/Modal'
import { useToast } from '../../hooks/useToast'

const initialForm: CursoPayload = {
  nome: '',
  chTotal: 3200,
  prevTerminoAnos: 4,
  limiteConclusao: 7
}

export function Cursos() {
  const [openCriar, setOpenCriar] = useState(false)
  const [openCoord, setOpenCoord] = useState<number | null>(null)
  const [form, setForm] = useState<CursoPayload>(initialForm)
  const [profSelecionado, setProfSelecionado] = useState<number | ''>('')

  const qc = useQueryClient()
  const { showError, showSuccess } = useToast()

  const cursos = useQuery({ queryKey: ['cursos'], queryFn: listarCursos })
  const professores = useQuery({
    queryKey: ['professores'],
    queryFn: listarProfessores
  })

  const criarMutation = useMutation({
    mutationFn: () => criarCurso(form),
    onSuccess: () => {
      showSuccess('Curso criado.')
      setOpenCriar(false)
      setForm(initialForm)
      qc.invalidateQueries({ queryKey: ['cursos'] })
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      showError(err?.response?.data?.message ?? 'Erro ao criar curso.')
    }
  })

  const coordMutation = useMutation({
    mutationFn: () =>
      nomearCoordenador(openCoord!, profSelecionado as number),
    onSuccess: () => {
      showSuccess('Coordenador atualizado.')
      setOpenCoord(null)
      setProfSelecionado('')
      qc.invalidateQueries({ queryKey: ['cursos'] })
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      showError(err?.response?.data?.message ?? 'Erro ao nomear.')
    }
  })

  return (
    <>
      <PageHeader
        title="Cursos"
        subtitle="Cadastro de cursos e nomeação de coordenadores."
        action={<Button onClick={() => setOpenCriar(true)}>+ Novo curso</Button>}
      />

      <Table>
        <THead>
          <TR>
            <TH>Nome</TH>
            <TH>CH Total</TH>
            <TH>Prev. (anos)</TH>
            <TH>Limite (anos)</TH>
            <TH>Coordenador</TH>
            <TH>Ação</TH>
          </TR>
        </THead>
        <TBody>
          {(!cursos.data || cursos.data.length === 0) && (
            <EmptyRow colSpan={6} />
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
                <Button
                  variant="secondary"
                  onClick={() => setOpenCoord(c.id)}
                >
                  Nomear
                </Button>
              </TD>
            </TR>
          ))}
        </TBody>
      </Table>

      <Modal
        open={openCriar}
        onClose={() => setOpenCriar(false)}
        title="Novo curso"
      >
        <div className="flex flex-col gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">Nome</label>
            <Input
              value={form.nome}
              onChange={e => setForm({ ...form, nome: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">CH total</label>
              <Input
                type="number"
                value={form.chTotal}
                onChange={e =>
                  setForm({ ...form, chTotal: Number(e.target.value) })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Prev. anos
              </label>
              <Input
                type="number"
                value={form.prevTerminoAnos}
                onChange={e =>
                  setForm({
                    ...form,
                    prevTerminoAnos: Number(e.target.value)
                  })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Limite anos
              </label>
              <Input
                type="number"
                value={form.limiteConclusao}
                onChange={e =>
                  setForm({
                    ...form,
                    limiteConclusao: Number(e.target.value)
                  })
                }
              />
            </div>
          </div>
          <div className="flex gap-2 justify-end mt-2">
            <Button variant="secondary" onClick={() => setOpenCriar(false)}>
              Cancelar
            </Button>
            <Button
              disabled={!form.nome || criarMutation.isPending}
              onClick={() => criarMutation.mutate()}
            >
              {criarMutation.isPending ? 'Salvando...' : 'Criar curso'}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={openCoord !== null}
        onClose={() => setOpenCoord(null)}
        title="Nomear coordenador"
      >
        <div className="flex flex-col gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">Professor</label>
            <select
              value={profSelecionado}
              onChange={e =>
                setProfSelecionado(
                  e.target.value ? Number(e.target.value) : ''
                )
              }
              className="w-full rounded-card border border-surface-border bg-white px-3 py-2.5 text-sm"
            >
              <option value="">— Selecione —</option>
              {professores.data?.map(p => (
                <option key={p.id} value={p.id}>
                  {p.nome} {p.titulacao ? `(${p.titulacao})` : ''}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2 justify-end mt-2">
            <Button variant="secondary" onClick={() => setOpenCoord(null)}>
              Cancelar
            </Button>
            <Button
              disabled={!profSelecionado || coordMutation.isPending}
              onClick={() => coordMutation.mutate()}
            >
              {coordMutation.isPending ? 'Salvando...' : 'Confirmar'}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
