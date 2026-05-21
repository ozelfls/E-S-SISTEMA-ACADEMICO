export type Perfil = 'SECRETARIA' | 'DIRETOR' | 'COORDENADOR' | 'PROFESSOR' | 'ALUNO' | 'ADMIN'
export type Situacao = 'ATIVA' | 'TRANCADA' | 'CONCLUIDA' | 'REPROVADA'
export type Turno = 'MANHA' | 'TARDE' | 'NOITE' | 'INTEGRAL'
export type Modalidade = 'PRESENCIAL' | 'EAD' | 'HIBRIDA'
export type StatusTurma = 'OPEN' | 'IN_PROGRESS' | 'CLOSED'

export interface ApiResponse<T> {
  data: T
  message: string
  timestamp: string
}

export interface LoginResponse {
  token: string
  perfil: Perfil
  pessoaId: number
  nome: string
}

export interface Professor {
  id: number
  nome: string
  registro: string
  titulacao: string
  cpf?: string
  email?: string
  telefone?: string
  regimeTrabalho?: 'INTEGRAL' | 'PARCIAL' | 'HORISTA'
}

export interface Curso {
  id: number
  nome: string
  chTotal: number
}

export interface Disciplina {
  id: number
  codigo: string
  nome: string
  creditos: number
  ch: number
  modalidade?: Modalidade
  ementa?: string
  curso?: Pick<Curso, 'id' | 'nome'>
  preRequisito?: Pick<Disciplina, 'id' | 'codigo' | 'nome'>
}

export interface Turma {
  id: number
  codigo: string
  horario?: string
  vagas: number
  semestre: string
  ano: number
  sala?: string
  turno?: Turno
  status?: StatusTurma
  cargaHoraria?: number
  professor?: Professor | null
  disciplina?: Disciplina | null
}

export interface Aluno {
  id: number
  nome: string
  cpf?: string
  matriculaId: number
  turno: Turno
  curso: Curso | null
  email: string | null
}

export interface MatriculaEmTurma {
  id: number
  turma: Turma
  situacao: Situacao
  frequencia: number
  dtInscricao: string
  mediaFinal?: number | null
}

export interface Prova {
  id: number
  codigo: string
  peso: number
  conteudo: string
}

export interface ResultadoProva {
  id: number
  nota: number | null
  presente: boolean
  dataRealizacao: string | null
}

export interface HistoricoItem {
  matricula: MatriculaEmTurma
  media: number | null
  resultados: ResultadoProva[]
}
