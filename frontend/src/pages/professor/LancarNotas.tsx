import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { listarTurmas, listarAlunosDaTurma } from '../../api/turmas'
import { cadastrarProva } from '../../api/provas'
import { useAuthStore } from '../../store/authStore'
import { PageHeader } from '../../components/layout/PageHeader'
import { Card } from '../../components/ui/Card'
import { Modal } from '../../components/ui/Modal'
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

export function LancarNotas() {
  const pessoaId = useAuthStore(s => s.pessoaId)
  const [turmaSelecionada, setTurmaSelecionada] = useState<number | null>(null)
  const [provaModalOpen, setProvaModalOpen] = useState(false)
  const [codigo, setCodigo] = useState('')
  const [peso, setPeso] = useState('1.0')
  const [conteudo, setConteudo] = useState('')

  const { showError, showSuccess } = useToast()
  const qc = useQueryClient()

  const turmas = useQuery({
    queryKey: ['turmas-prof'],
    queryFn: () => listarTurmas()
  })

  const alunos = useQuery({
    queryKey: ['alunos-turma', turmaSelecionada],
    queryFn: () => listarAlunosDaTurma(turmaSelecionada!),
    enabled: !!turmaSelecionada
  })

  const minhasTurmas =
    turmas.data?.filter(t => t.professor?.id === pessoaId) ?? []

  const provaMutation = useMutation({
    mutationFn: () =>
      cadastrarProva(turmaSelecionada!, {
        codigo,
        peso: Number(peso),
        conteudo: conteudo || undefined
      }),
    onSuccess: () => {
      showSuccess('Prova cadastrada e resultados criados para alunos ativos.')
      setProvaModalOpen(false)
      setCodigo('')
      setPeso('1.0')
      setConteudo('')
      qc.invalidateQueries({ queryKey: ['alunos-turma', turmaSelecionada] })
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      showError(
        err?.response?.data?.message ?? 'Não foi possível cadastrar a prova.'
      )
    }
  })

  return (
    <>
      <PageHeader
        title="Lançar Notas"
        subtitle="Selecione uma turma para ver os alunos e cadastrar provas."
      />

      <Card className="mb-6">
        <label className="block text-sm font-medium mb-2">
          Selecione uma turma
        </label>
        <select
          value={turmaSelecionada ?? ''}
          onChange={e =>
            setTurmaSelecionada(e.target.value ? Number(e.target.value) : null)
          }
          className="w-full md:w-96 rounded-card border border-surface-border bg-white px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="">— Selecione —</option>
          {minhasTurmas.map(t => (
            <option key={t.id} value={t.id}>
              {t.codigo} · {t.disciplina?.nome ?? ''} · {t.semestre}/{t.ano}
            </option>
          ))}
        </select>
      </Card>

      {turmaSelecionada && (
        <>
          <div className="flex justify-end mb-3">
            <Button onClick={() => setProvaModalOpen(true)}>
              + Cadastrar prova
            </Button>
          </div>
          <Table>
            <THead>
              <TR>
                <TH>Aluno</TH>
                <TH>Matrícula</TH>
                <TH>Situação</TH>
                <TH>Frequência</TH>
              </TR>
            </THead>
            <TBody>
              {(!alunos.data || alunos.data.length === 0) && (
                <EmptyRow colSpan={4}>
                  Nenhum aluno matriculado nesta turma.
                </EmptyRow>
              )}
              {alunos.data?.map(m => (
                <TR key={m.id}>
                  <TD>{m.turma?.disciplina?.nome ?? '–'}</TD>
                  <TD>#{m.id}</TD>
                  <TD>{m.situacao}</TD>
                  <TD>{m.frequencia?.toFixed?.(1) ?? '0.0'}%</TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </>
      )}

      <Modal
        open={provaModalOpen}
        onClose={() => setProvaModalOpen(false)}
        title="Cadastrar nova prova"
      >
        <div className="flex flex-col gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">Código</label>
            <Input
              value={codigo}
              onChange={e => setCodigo(e.target.value)}
              placeholder="P1-2026-1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Peso</label>
            <Input
              type="number"
              step="0.1"
              min="0.1"
              value={peso}
              onChange={e => setPeso(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Conteúdo (opcional)
            </label>
            <Input
              value={conteudo}
              onChange={e => setConteudo(e.target.value)}
              placeholder="Capítulos 1 a 4"
            />
          </div>
          <div className="flex gap-2 justify-end mt-2">
            <Button
              variant="secondary"
              onClick={() => setProvaModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              disabled={!codigo || !peso || provaMutation.isPending}
              onClick={() => provaMutation.mutate()}
            >
              {provaMutation.isPending ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
