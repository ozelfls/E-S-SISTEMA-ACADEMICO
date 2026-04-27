import api from './client'
import type { Aluno, ApiResponse, MatriculaEmTurma, Turno } from '../types'

export interface AlunoPayload {
  nome: string
  cpf: string
  matriculaId: number
  turno: Turno
  cursoId: number
  email?: string
}

export async function listarAlunos(): Promise<Aluno[]> {
  const { data } = await api.get<ApiResponse<Aluno[]>>('/alunos')
  return data.data
}

export async function buscarAluno(id: number): Promise<Aluno> {
  const { data } = await api.get<ApiResponse<Aluno>>(`/alunos/${id}`)
  return data.data
}

export async function criarAluno(payload: AlunoPayload): Promise<Aluno> {
  const { data } = await api.post<ApiResponse<Aluno>>('/alunos', payload)
  return data.data
}

export async function atualizarAluno(
  id: number,
  payload: AlunoPayload
): Promise<Aluno> {
  const { data } = await api.put<ApiResponse<Aluno>>(`/alunos/${id}`, payload)
  return data.data
}

export async function deletarAluno(id: number): Promise<void> {
  await api.delete(`/alunos/${id}`)
}

export async function listarHistorico(
  alunoId: number
): Promise<MatriculaEmTurma[]> {
  const { data } = await api.get<ApiResponse<MatriculaEmTurma[]>>(
    `/alunos/${alunoId}/historico`
  )
  return data.data
}
