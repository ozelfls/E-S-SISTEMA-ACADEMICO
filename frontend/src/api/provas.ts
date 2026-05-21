import api from './client'
import type { ApiResponse, Prova, ResultadoProva } from '../types'

const PROVA_WRITE_TIMEOUT = 60000

export interface ProvaPayload {
  codigo?: string
  peso: number
  conteudo?: string
}

export interface ResultadoPayload {
  nota: number
  presente: boolean
  data?: string
  duracao?: number
  motivoAlteracao?: string
}

export interface ProvaLancamentoView {
  prova: {
    id: number
    codigo: string
    peso: number
    conteudo: string | null
  }
  turma: {
    id: number
    codigo: string
    semestre: string
    ano: number
    turno: string | null
    disciplina: { id: number; codigo: string; nome: string } | null
    curso: { id: number; nome: string } | null
    professor: { id: number; nome: string } | null
  }
  resultados: Array<{
    id: number
    nota: number | null
    presente: boolean
    dataRealizacao: string | null
    duracaoMin: number | null
    matriculaId: number
    aluno: {
      id: number
      nome: string
      matriculaId: number
      curso: { id: number; nome: string } | null
    }
  }>
}

export interface ProvaImportadaView {
  titulo: string
  instrucoes: string
  questoes: Array<{
    tipo: 'Discursiva' | 'Objetiva' | 'Verdadeiro/Falso' | string
    enunciado: string
    pontos: number
    alternativas: string[]
    resposta: string
  }>
}

export async function cadastrarProva(
  turmaId: number,
  payload: ProvaPayload
): Promise<Prova> {
  const { data } = await api.post<ApiResponse<Prova>>(
    `/turmas/${turmaId}/provas`,
    payload,
    { timeout: PROVA_WRITE_TIMEOUT }
  )
  return data.data
}

export async function cadastrarProvasLote(
  turmaId: number,
  provas: ProvaPayload[]
): Promise<Prova[]> {
  const { data } = await api.post<ApiResponse<Prova[]>>(
    `/turmas/${turmaId}/provas/lote`,
    { provas },
    { timeout: PROVA_WRITE_TIMEOUT }
  )
  return data.data
}

export async function lancarResultado(
  resultadoId: number,
  payload: ResultadoPayload
): Promise<ResultadoProva> {
  const { data } = await api.put<ApiResponse<ResultadoProva>>(
    `/resultados/${resultadoId}`,
    payload,
    { timeout: PROVA_WRITE_TIMEOUT }
  )
  return data.data
}

export async function buscarProvaParaLancamento(
  codigo: string
): Promise<ProvaLancamentoView> {
  const { data } = await api.get<ApiResponse<ProvaLancamentoView>>(
    `/provas/${encodeURIComponent(codigo)}/lancamento`
  )
  return data.data
}

export async function importarArquivoProva(
  arquivo: File
): Promise<ProvaImportadaView> {
  const form = new FormData()
  form.append('arquivo', arquivo)
  const { data } = await api.post<ApiResponse<ProvaImportadaView>>(
    '/provas/importar-arquivo',
    form,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: PROVA_WRITE_TIMEOUT
    }
  )
  return data.data
}
