import api from './client'
import type { ApiResponse, Disciplina, Modalidade } from '../types'

export interface DisciplinaPayload {
  codigo: string
  nome: string
  creditos: number
  ch: number
  modalidade: Modalidade
  cursoId: number
  preRequisitoId?: number
  ementa?: string
}

export async function listarDisciplinas(
  cursoId?: number
): Promise<Disciplina[]> {
  const url = cursoId ? `/disciplinas?cursoId=${cursoId}` : '/disciplinas'
  const { data } = await api.get<ApiResponse<Disciplina[]>>(url)
  return data.data
}

export async function buscarDisciplina(id: number): Promise<Disciplina> {
  const { data } = await api.get<ApiResponse<Disciplina>>(`/disciplinas/${id}`)
  return data.data
}

export async function adicionarDisciplina(
  cursoId: number,
  payload: Omit<DisciplinaPayload, 'cursoId'>
): Promise<Disciplina> {
  const { data } = await api.post<ApiResponse<Disciplina>>(
    `/cursos/${cursoId}/disciplinas`,
    payload
  )
  return data.data
}

export async function criarDisciplina(
  payload: DisciplinaPayload
): Promise<Disciplina> {
  const { data } = await api.post<ApiResponse<Disciplina>>(
    '/disciplinas',
    payload
  )
  return data.data
}

export async function atualizarDisciplina(
  id: number,
  payload: DisciplinaPayload
): Promise<Disciplina> {
  const { data } = await api.put<ApiResponse<Disciplina>>(
    `/disciplinas/${id}`,
    payload
  )
  return data.data
}

export async function deletarDisciplina(id: number): Promise<void> {
  await api.delete(`/disciplinas/${id}`)
}
