import api from './client'
import type { ApiResponse, Prova, ResultadoProva } from '../types'

export interface ProvaPayload {
  codigo: string
  peso: number
  conteudo?: string
}

export interface ResultadoPayload {
  nota: number
  presente: boolean
  data?: string
  duracao?: number
}

export async function cadastrarProva(
  turmaId: number,
  payload: ProvaPayload
): Promise<Prova> {
  const { data } = await api.post<ApiResponse<Prova>>(
    `/turmas/${turmaId}/provas`,
    payload
  )
  return data.data
}

export async function lancarResultado(
  resultadoId: number,
  payload: ResultadoPayload
): Promise<ResultadoProva> {
  const { data } = await api.put<ApiResponse<ResultadoProva>>(
    `/resultados/${resultadoId}`,
    payload
  )
  return data.data
}
