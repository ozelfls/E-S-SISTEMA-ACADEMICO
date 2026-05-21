import api from './client'
import type {
  ApiResponse,
  MatriculaEmTurma,
  StatusTurma,
  Turma,
  Turno
} from '../types'

export interface TurmaPayload {
  codigo: string
  horario?: string
  vagas: number
  semestre: string
  ano: number
  turno: Turno
  sala?: string
  professorId?: number
  status?: StatusTurma
}

export async function listarTurmas(
  semestre?: string,
  ano?: number,
  cursoId?: number
): Promise<Turma[]> {
  const params = new URLSearchParams()
  if (semestre) params.set('semestre', semestre)
  if (ano !== undefined) params.set('ano', String(ano))
  if (cursoId !== undefined) params.set('cursoId', String(cursoId))
  const query = params.toString()
  const { data } = await api.get<ApiResponse<Turma[]>>(
    query ? `/turmas?${query}` : '/turmas'
  )
  return data.data
}

export async function buscarTurma(id: number): Promise<Turma> {
  const { data } = await api.get<ApiResponse<Turma>>(`/turmas/${id}`)
  return data.data
}

export async function criarTurma(
  disciplinaId: number,
  payload: TurmaPayload
): Promise<Turma> {
  const { data } = await api.post<ApiResponse<Turma>>(
    `/disciplinas/${disciplinaId}/turmas`,
    payload
  )
  return data.data
}

export interface TurmaUpdatePayload extends TurmaPayload {
  disciplinaId?: number
}

export async function atualizarTurma(
  id: number,
  payload: TurmaUpdatePayload
): Promise<Turma> {
  const { data } = await api.put<ApiResponse<Turma>>(`/turmas/${id}`, payload)
  return data.data
}

export async function deletarTurma(id: number): Promise<void> {
  await api.delete(`/turmas/${id}`)
}

export async function listarAlunosDaTurma(
  turmaId: number
): Promise<MatriculaEmTurma[]> {
  const { data } = await api.get<ApiResponse<MatriculaEmTurma[]>>(
    `/turmas/${turmaId}/alunos`
  )
  return data.data
}

export async function alocarProfessor(
  turmaId: number,
  professorId: number | null
): Promise<Turma> {
  const { data } = await api.put<ApiResponse<Turma>>(
    `/turmas/${turmaId}/professor`,
    { professorId }
  )
  return data.data
}
