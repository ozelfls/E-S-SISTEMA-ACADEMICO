import api from './client'
import type { ApiResponse, Professor } from '../types'

export type RegimeTrabalho = 'INTEGRAL' | 'PARCIAL' | 'HORISTA'

export interface ProfessorPayload {
  nome: string
  cpf: string
  email: string
  telefone?: string
  registro?: string
  titulacao?: string
  regimeTrabalho?: RegimeTrabalho
}

export async function listarProfessores(): Promise<Professor[]> {
  const { data } = await api.get<ApiResponse<Professor[]>>('/professores')
  return data.data
}

export async function buscarProfessor(id: number): Promise<Professor> {
  const { data } = await api.get<ApiResponse<Professor>>(`/professores/${id}`)
  return data.data
}

export async function criarProfessor(
  payload: ProfessorPayload
): Promise<Professor> {
  const { data } = await api.post<ApiResponse<Professor>>(
    '/professores',
    payload
  )
  return data.data
}

export async function atualizarProfessor(
  id: number,
  payload: ProfessorPayload
): Promise<Professor> {
  const { data } = await api.put<ApiResponse<Professor>>(
    `/professores/${id}`,
    payload
  )
  return data.data
}

export async function deletarProfessor(id: number): Promise<void> {
  await api.delete(`/professores/${id}`)
}
