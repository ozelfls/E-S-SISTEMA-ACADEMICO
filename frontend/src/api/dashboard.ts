import api from './client'
import type { ApiResponse } from '../types'

export interface DashboardChartItem {
  label: string
  value: number
}

export interface DashboardTimelineItem {
  title: string
  detail: string
  href: string
  tone: 'primary' | 'success' | 'warning' | 'neutral'
}

export interface AdminDashboardResumo {
  metricas: {
    totalCursos: number
    totalDisciplinas: number
    totalProfessores: number
    totalAlunos: number
    totalTurmas: number
    totalMatriculas: number
    totalProvas: number
    totalResultados: number
  }
  turmasSemProfessor: number
  turmasNoturnas: number
  vagasTotais: number
  cursosSemCoordenador: number
  alunosSemEmail: number
  alunosPorCurso: DashboardChartItem[]
  turmasPorTurno: DashboardChartItem[]
  turmasPorStatus: DashboardChartItem[]
  disciplinasPorCurso: DashboardChartItem[]
  timeline: DashboardTimelineItem[]
  alunosRisco: Array<{
    alunoId: number
    alunoNome: string
    alunoMatricula: number
    cursoNome: string | null
    turmaCodigo: string
    disciplinaNome: string
    media: number | null
    frequencia: number | null
  }>
  pendenciasNotas: Array<{
    turmaId: number
    turmaCodigo: string
    disciplinaNome: string | null
    professorNome: string | null
    provaId: number
    provaCodigo: string
    resultadosSemNota: number
  }>
  ocupacaoTurmas: Array<{
    turmaId: number
    turmaCodigo: string
    cursoNome: string | null
    disciplinaNome: string | null
    vagas: number
    ocupadas: number
    ocupacao: number
    status: string | null
  }>
  auditoriasNotas: Array<{
    id: number
    resultadoId: number
    provaId: number
    provaCodigo: string
    alunoNome: string
    notaAnterior: number | null
    notaNova: number | null
    usuarioLogin: string | null
    motivo: string | null
    alteradoEm: string
  }>
}

export async function buscarAdminDashboardResumo(): Promise<AdminDashboardResumo> {
  const { data } = await api.get<ApiResponse<AdminDashboardResumo>>(
    '/dashboard/admin-resumo'
  )
  return data.data
}
