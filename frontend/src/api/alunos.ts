import api from './client'
import type { Aluno, ApiResponse, MatriculaEmTurma, Turno } from '../types'

interface AlunoResponse {
  id: number
  nome: string
  matriculaId: number
  turno: Turno
  cursoId: number | null
  cursoNome: string | null
  email: string | null
}

export interface AlunoPayload {
  nome: string
  cpf: string
  matriculaId?: number
  turno: Turno
  cursoId: number
  email?: string
}

function normalizeAluno(aluno: AlunoResponse): Aluno {
  return {
    id: aluno.id,
    nome: aluno.nome,
    matriculaId: aluno.matriculaId,
    turno: aluno.turno,
    curso:
      aluno.cursoId && aluno.cursoNome
        ? {
            id: aluno.cursoId,
            nome: aluno.cursoNome,
            chTotal: 0
          }
        : null,
    email: aluno.email
  }
}

export async function listarAlunos(): Promise<Aluno[]> {
  const { data } = await api.get<ApiResponse<AlunoResponse[]>>('/alunos')
  return data.data.map(normalizeAluno)
}

export async function buscarAluno(id: number): Promise<Aluno> {
  const { data } = await api.get<ApiResponse<AlunoResponse>>(`/alunos/${id}`)
  return normalizeAluno(data.data)
}

export async function criarAluno(payload: AlunoPayload): Promise<Aluno> {
  const { data } = await api.post<ApiResponse<AlunoResponse>>('/alunos', payload)
  return normalizeAluno(data.data)
}

export async function atualizarAluno(
  id: number,
  payload: AlunoPayload
): Promise<Aluno> {
  const { data } = await api.put<ApiResponse<AlunoResponse>>(`/alunos/${id}`, payload)
  return normalizeAluno(data.data)
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
