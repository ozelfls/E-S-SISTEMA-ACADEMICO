import api from './client'
import type { ApiResponse } from '../types'

export interface ProfessorTurmasView {
  professor: {
    id: number
    nome: string
    email: string | null
    registro: string | null
    titulacao: string | null
  }
  totalTurmas: number
  turmas: Array<{
    id: number
    codigo: string
    semestre: string
    ano: number
    turno: string | null
    sala: string | null
    vagas: number
    horario: string | null
    disciplina: {
      id: number
      codigo: string
      nome: string
      creditos: number
      ch: number
      modalidade: string | null
    }
    curso: { id: number; nome: string } | null
    totalAlunos: number
    totalProvas: number
  }>
}

export interface AlunoTrajetoriaView {
  aluno: {
    id: number
    nome: string
    matriculaId: number
    cpf: string | null
    email: string | null
    turno: string | null
  }
  curso: {
    id: number
    nome: string
    chTotal: number
    prevTerminoAnos: number
  } | null
  totalMatriculas: number
  matriculasAtivas: number
  matriculasConcluidas: number
  matriculas: Array<{
    id: number
    dtInscricao: string
    situacao: string
    frequencia: number
    observacao: string | null
    turma: {
      id: number
      codigo: string
      semestre: string
      ano: number
      sala: string | null
      horario: string | null
    }
    disciplina: {
      id: number
      codigo: string
      nome: string
      creditos: number
      ch: number
    }
    professor: { id: number; nome: string } | null
    provas: Array<{
      id: number
      codigo: string
      peso: number
      conteudo: string | null
      resultado: {
        nota: number
        presente: boolean
        dataRealizacao: string | null
      } | null
    }>
    mediaPonderada: number | null
  }>
}

export interface TurmaDetalheView {
  turma: {
    id: number
    codigo: string
    semestre: string
    ano: number
    turno: string | null
    sala: string | null
    horario: string | null
    vagas: number
  }
  disciplina: {
    id: number
    codigo: string
    nome: string
    creditos: number
    ch: number
    modalidade: string | null
  }
  curso: { id: number; nome: string } | null
  professor: { id: number; nome: string; email: string | null } | null
  totalAlunos: number
  vagasRestantes: number
  alunos: Array<{
    matriculaId: number
    situacao: string
    frequencia: number
    aluno: { id: number; nome: string; matriculaId: number }
    mediaPonderada: number | null
  }>
  provas: Array<{
    id: number
    codigo: string
    peso: number
    conteudo: string | null
    totalResultados: number
    mediaTurma: number | null
  }>
}

export interface DisciplinaHistoricoView {
  disciplina: {
    id: number
    codigo: string
    nome: string
    creditos: number
    ch: number
    modalidade: string | null
    ementa: string | null
  }
  curso: { id: number; nome: string } | null
  preRequisito: { id: number; codigo: string; nome: string } | null
  totalTurmas: number
  turmas: Array<{
    id: number
    codigo: string
    semestre: string
    ano: number
    vagas: number
    professor: { id: number; nome: string } | null
    totalAlunos: number
    mediaTurma: number | null
  }>
  professoresQueLecionaram: Array<{
    id: number
    nome: string
    totalTurmas: number
  }>
}

export interface SemestreResumoView {
  semestre: string
  ano: number
  totalTurmas: number
  totalVagas: number
  totalMatriculas: number
  totalProfessoresAtivos: number
  ocupacaoMedia: number
  turmas: Array<{
    id: number
    codigo: string
    sala: string | null
    horario: string | null
    vagas: number
    ocupadas: number
    ocupacao: number
    disciplina: { id: number; codigo: string; nome: string }
    professor: { id: number; nome: string } | null
  }>
}

export interface BuscaGlobalView {
  q: string
  totalHits: number
  alunos: Array<{
    id: number
    nome: string
    matriculaId: number
    cursoNome: string | null
  }>
  professores: Array<{ id: number; nome: string; email: string | null }>
  disciplinas: Array<{ id: number; codigo: string; nome: string }>
  turmas: Array<{
    id: number
    codigo: string
    semestre: string
    ano: number
    disciplinaNome: string
  }>
  cursos: Array<{ id: number; nome: string }>
}

export interface RelatorioAcademicoRow {
  alunoId: number | null
  alunoNome: string | null
  alunoMatricula: number | null
  alunoEmail: string | null
  alunoTurno: string | null
  cursoId: number | null
  cursoNome: string | null
  cursoChTotal: number | null
  disciplinaId: number | null
  disciplinaCodigo: string | null
  disciplinaNome: string | null
  disciplinaCh: number | null
  disciplinaModalidade: string | null
  turmaId: number | null
  turmaCodigo: string | null
  turmaTurno: string | null
  turmaSemestre: string | null
  turmaAno: number | null
  turmaSala: string | null
  turmaHorario: string | null
  turmaVagas: number | null
  professorId: number | null
  professorNome: string | null
  professorEmail: string | null
  professorTitulacao: string | null
  matriculaId: number | null
  matriculaData: string | null
  matriculaSituacao: string | null
  matriculaFrequencia: number | null
  matriculaMediaFinal: number | null
  provaId: number | null
  provaCodigo: string | null
  provaPeso: number | null
  provaConteudo: string | null
  resultadoId: number | null
  resultadoNota: number | null
  resultadoPresente: boolean | null
  resultadoDataRealizacao: string | null
  resultadoDuracaoMin: number | null
}

export async function turmasDoProfessor(
  professorId: number
): Promise<ProfessorTurmasView> {
  const { data } = await api.get<ApiResponse<ProfessorTurmasView>>(
    `/consultas/professores/${professorId}/turmas`
  )
  return data.data
}

export async function trajetoriaDoAluno(
  alunoId: number
): Promise<AlunoTrajetoriaView> {
  const { data } = await api.get<ApiResponse<AlunoTrajetoriaView>>(
    `/consultas/alunos/${alunoId}/trajetoria`
  )
  return data.data
}

export async function detalhesDaTurma(
  turmaId: number
): Promise<TurmaDetalheView> {
  const { data } = await api.get<ApiResponse<TurmaDetalheView>>(
    `/consultas/turmas/${turmaId}/detalhes`
  )
  return data.data
}

export async function historicoDaDisciplina(
  disciplinaId: number
): Promise<DisciplinaHistoricoView> {
  const { data } = await api.get<ApiResponse<DisciplinaHistoricoView>>(
    `/consultas/disciplinas/${disciplinaId}/historico`
  )
  return data.data
}

export async function resumoSemestre(
  semestre: string,
  ano: number
): Promise<SemestreResumoView> {
  const params = new URLSearchParams()
  params.set('semestre', semestre)
  params.set('ano', String(ano))
  const { data } = await api.get<ApiResponse<SemestreResumoView>>(
    `/consultas/semestre?${params.toString()}`
  )
  return data.data
}

export async function buscarGlobal(q: string): Promise<BuscaGlobalView> {
  const params = new URLSearchParams()
  params.set('q', q)
  const { data } = await api.get<ApiResponse<BuscaGlobalView>>(
    `/consultas/buscar?${params.toString()}`
  )
  return data.data
}

export async function relatorioAcademico(): Promise<RelatorioAcademicoRow[]> {
  const { data } = await api.get<ApiResponse<RelatorioAcademicoRow[]>>(
    '/consultas/relatorio-academico'
  )
  return data.data
}
