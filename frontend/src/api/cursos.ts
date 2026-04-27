import api from './client'
import type { ApiResponse, Curso, Professor } from '../types'

export interface CursoPayload {
  nome: string
  chTotal: number
  prevTerminoAnos: number
  limiteConclusao: number
}

export interface CursoFull extends Curso {
  prevTerminoAnos: number
  limiteConclusao: number
  coordenador?: Professor | null
}

export async function listarCursos(): Promise<CursoFull[]> {
  const { data } = await api.get<ApiResponse<CursoFull[]>>('/cursos')
  return data.data
}

export async function buscarCurso(id: number): Promise<CursoFull> {
  const { data } = await api.get<ApiResponse<CursoFull>>(`/cursos/${id}`)
  return data.data
}

export async function criarCurso(payload: CursoPayload): Promise<CursoFull> {
  const { data } = await api.post<ApiResponse<CursoFull>>('/cursos', payload)
  return data.data
}

export async function atualizarCurso(
  id: number,
  payload: CursoPayload
): Promise<CursoFull> {
  const { data } = await api.put<ApiResponse<CursoFull>>(
    `/cursos/${id}`,
    payload
  )
  return data.data
}

export async function deletarCurso(id: number): Promise<void> {
  await api.delete(`/cursos/${id}`)
}

export async function nomearCoordenador(
  cursoId: number,
  professorId: number
): Promise<CursoFull> {
  const { data } = await api.put<ApiResponse<CursoFull>>(
    `/cursos/${cursoId}/coordenador`,
    professorId,
    { headers: { 'Content-Type': 'application/json' } }
  )
  return data.data
}
