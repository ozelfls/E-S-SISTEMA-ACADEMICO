import { Navigate, Route, Routes } from 'react-router-dom'
import type { ReactNode } from 'react'
import { LoginPage } from './pages/login/LoginPage'
import { Layout } from './components/layout/Layout'
import { ProtectedRoute } from './components/layout/ProtectedRoute'
import { AlunoDashboard } from './pages/aluno/AlunoDashboard'
import { Matriculas } from './pages/aluno/Matriculas'
import { Historico } from './pages/aluno/Historico'
import { ProfessorDashboard } from './pages/professor/ProfessorDashboard'
import { LancarNotas } from './pages/professor/LancarNotas'
import { CoordenadorDashboard } from './pages/coordenador/CoordenadorDashboard'
import { Disciplinas } from './pages/coordenador/Disciplinas'
import { Turmas } from './pages/coordenador/Turmas'
import { SecretariaDashboard } from './pages/secretaria/SecretariaDashboard'
import { Alunos } from './pages/secretaria/Alunos'
import { DiretorDashboard } from './pages/diretor/DiretorDashboard'
import { Cursos } from './pages/diretor/Cursos'
import { AdminDashboard } from './pages/admin/AdminDashboard'
import { AdminCursos } from './pages/admin/AdminCursos'
import { AdminTurmas } from './pages/admin/AdminTurmas'
import { AdminMatriculas } from './pages/admin/AdminMatriculas'
import { AdminProvas } from './pages/admin/AdminProvas'
import { AdminProfessores } from './pages/admin/AdminProfessores'
import { AdminAlunos } from './pages/admin/AdminAlunos'
import { AdminExplorar } from './pages/admin/AdminExplorar'

function withLayout(children: ReactNode) {
  return <Layout>{children}</Layout>
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/aluno/dashboard"
        element={<ProtectedRoute allowed={['ALUNO']}>{withLayout(<AlunoDashboard />)}</ProtectedRoute>}
      />
      <Route
        path="/aluno/matriculas"
        element={<ProtectedRoute allowed={['ALUNO']}>{withLayout(<Matriculas />)}</ProtectedRoute>}
      />
      <Route
        path="/aluno/historico"
        element={<ProtectedRoute allowed={['ALUNO']}>{withLayout(<Historico />)}</ProtectedRoute>}
      />

      <Route
        path="/professor/dashboard"
        element={<ProtectedRoute allowed={['PROFESSOR']}>{withLayout(<ProfessorDashboard />)}</ProtectedRoute>}
      />
      <Route
        path="/professor/lancar-notas"
        element={<ProtectedRoute allowed={['PROFESSOR']}>{withLayout(<LancarNotas />)}</ProtectedRoute>}
      />

      <Route
        path="/coordenador/dashboard"
        element={<ProtectedRoute allowed={['COORDENADOR']}>{withLayout(<CoordenadorDashboard />)}</ProtectedRoute>}
      />
      <Route
        path="/coordenador/disciplinas"
        element={<ProtectedRoute allowed={['COORDENADOR']}>{withLayout(<Disciplinas />)}</ProtectedRoute>}
      />
      <Route
        path="/coordenador/turmas"
        element={<ProtectedRoute allowed={['COORDENADOR']}>{withLayout(<Turmas />)}</ProtectedRoute>}
      />

      <Route
        path="/secretaria/dashboard"
        element={<ProtectedRoute allowed={['SECRETARIA']}>{withLayout(<SecretariaDashboard />)}</ProtectedRoute>}
      />
      <Route
        path="/secretaria/alunos"
        element={<ProtectedRoute allowed={['SECRETARIA']}>{withLayout(<Alunos />)}</ProtectedRoute>}
      />

      <Route
        path="/diretor/dashboard"
        element={<ProtectedRoute allowed={['DIRETOR']}>{withLayout(<DiretorDashboard />)}</ProtectedRoute>}
      />
      <Route
        path="/diretor/cursos"
        element={<ProtectedRoute allowed={['DIRETOR']}>{withLayout(<Cursos />)}</ProtectedRoute>}
      />

      <Route
        path="/admin/dashboard"
        element={<ProtectedRoute allowed={['ADMIN']}>{withLayout(<AdminDashboard />)}</ProtectedRoute>}
      />
      <Route
        path="/admin/explorar"
        element={<ProtectedRoute allowed={['ADMIN']}>{withLayout(<AdminExplorar />)}</ProtectedRoute>}
      />
      <Route
        path="/admin/cursos"
        element={<ProtectedRoute allowed={['ADMIN']}>{withLayout(<AdminCursos />)}</ProtectedRoute>}
      />
      <Route
        path="/admin/disciplinas"
        element={<Navigate to="/admin/cursos" replace />}
      />
      <Route
        path="/admin/turmas"
        element={<ProtectedRoute allowed={['ADMIN']}>{withLayout(<AdminTurmas />)}</ProtectedRoute>}
      />
      <Route
        path="/admin/matriculas"
        element={<ProtectedRoute allowed={['ADMIN']}>{withLayout(<AdminMatriculas />)}</ProtectedRoute>}
      />
      <Route
        path="/admin/provas"
        element={<ProtectedRoute allowed={['ADMIN']}>{withLayout(<AdminProvas />)}</ProtectedRoute>}
      />
      <Route
        path="/admin/professores"
        element={<ProtectedRoute allowed={['ADMIN']}>{withLayout(<AdminProfessores />)}</ProtectedRoute>}
      />
      <Route
        path="/admin/alunos"
        element={<ProtectedRoute allowed={['ADMIN']}>{withLayout(<AdminAlunos />)}</ProtectedRoute>}
      />

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
