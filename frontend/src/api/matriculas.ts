import api from './client'
import type { ApiResponse, MatriculaEmTurma, Turma } from '../types'

export interface MatriculaWorkflow {
  podeMatricular: boolean
  resumo: string
  etapas: Array<{
    chave: string
    titulo: string
    detalhe: string
    status: 'OK' | 'BLOQUEADO' | string
  }>
}

export interface MatriculaAutomaticaResultado {
  matriculasCriadas: number
  turmasAvaliadas: number
  turmasIgnoradas: number
  resumo: string
  alocadas: Array<{
    turmaId: number
    turmaCodigo: string
    disciplina: string
    motivo: string
  }>
  ignoradas: Array<{
    turmaId: number
    turmaCodigo: string
    disciplina: string
    motivo: string
  }>
}

export interface MatriculaOpcao {
  turma: Turma
  analise: MatriculaWorkflow
  motivoBloqueio: string | null
}

export async function listarMatriculasAtivas(
  alunoId: number
): Promise<MatriculaEmTurma[]> {
  const { data } = await api.get<ApiResponse<MatriculaEmTurma[]>>(
    `/alunos/${alunoId}/turmas-ativas`
  )
  return data.data
}

export async function analisarMatricula(
  alunoId: number,
  turmaId: number
): Promise<MatriculaWorkflow> {
  const { data } = await api.get<ApiResponse<MatriculaWorkflow>>(
    `/alunos/${alunoId}/matriculas/${turmaId}/analise`
  )
  return data.data
}

export async function listarOpcoesMatricula(
  alunoId: number
): Promise<MatriculaOpcao[]> {
  const { data } = await api.get<ApiResponse<MatriculaOpcao[]>>(
    `/alunos/${alunoId}/matriculas/opcoes`
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

export async function alocarAutomaticamente(
  alunoId: number
): Promise<MatriculaAutomaticaResultado> {
  const { data } = await api.post<ApiResponse<MatriculaAutomaticaResultado>>(
    `/alunos/${alunoId}/matriculas/alocacao-automatica`
  )
  return data.data
}
