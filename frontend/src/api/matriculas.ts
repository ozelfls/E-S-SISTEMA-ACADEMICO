import api from './client'
import type { ApiResponse, MatriculaEmTurma } from '../types'

export async function listarMatriculasAtivas(
  alunoId: number
): Promise<MatriculaEmTurma[]> {
  const { data } = await api.get<ApiResponse<MatriculaEmTurma[]>>(
    `/alunos/${alunoId}/turmas-ativas`
  )
  return data.data
}

export async function matricular(
  alunoId: number,
  turmaId: number
): Promise<MatriculaEmTurma> {
  const { data } = await api.post<ApiResponse<MatriculaEmTurma>>(
    `/alunos/${alunoId}/matriculas`,
    { turmaId }
  )
  return data.data
}
