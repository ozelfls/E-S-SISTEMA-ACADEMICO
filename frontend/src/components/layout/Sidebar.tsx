import { NavLink } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { useUiStore } from '../../store/uiStore'
import type { Perfil } from '../../types'

interface MenuItem {
  to: string
  label: string
  icon: IconKey
}

type IconKey =
  | 'dashboard'
  | 'matriculas'
  | 'historico'
  | 'notas'
  | 'disciplinas'
  | 'turmas'
  | 'alunos'
  | 'cursos'
  | 'professores'
  | 'explorar'

const MENU_BY_PERFIL: Record<Perfil, MenuItem[]> = {
  ALUNO: [
    { to: '/aluno/dashboard', label: 'Dashboard', icon: 'dashboard' },
    { to: '/aluno/matriculas', label: 'Matrículas', icon: 'matriculas' },
    { to: '/aluno/historico', label: 'Histórico', icon: 'historico' }
  ],
  PROFESSOR: [
    { to: '/professor/dashboard', label: 'Dashboard', icon: 'dashboard' },
    { to: '/professor/lancar-notas', label: 'Lançar Notas', icon: 'notas' }
  ],
  COORDENADOR: [
    { to: '/coordenador/dashboard', label: 'Dashboard', icon: 'dashboard' },
    { to: '/coordenador/disciplinas', label: 'Disciplinas', icon: 'disciplinas' },
    { to: '/coordenador/turmas', label: 'Turmas', icon: 'turmas' }
  ],
  SECRETARIA: [
    { to: '/secretaria/dashboard', label: 'Dashboard', icon: 'dashboard' },
    { to: '/secretaria/alunos', label: 'Alunos', icon: 'alunos' }
  ],
  DIRETOR: [
    { to: '/diretor/dashboard', label: 'Dashboard', icon: 'dashboard' },
    { to: '/diretor/cursos', label: 'Cursos', icon: 'cursos' }
  ],
  ADMIN: [
    { to: '/admin/dashboard', label: 'Dashboard', icon: 'dashboard' },
    { to: '/admin/explorar', label: 'Explorar', icon: 'explorar' },
    { to: '/admin/cursos', label: 'Cursos', icon: 'cursos' },
    { to: '/admin/disciplinas', label: 'Disciplinas', icon: 'disciplinas' },
    { to: '/admin/turmas', label: 'Turmas', icon: 'turmas' },
    { to: '/admin/professores', label: 'Professores', icon: 'professores' },
    { to: '/admin/alunos', label: 'Alunos', icon: 'alunos' }
  ]
}

function MenuIcon({ icon }: { icon: IconKey }) {
  const base = 'h-4 w-4 stroke-current fill-none stroke-2'
  switch (icon) {
    case 'dashboard':
      return (
        <svg viewBox="0 0 24 24" className={base} aria-hidden>
          <rect x="3" y="3" width="8" height="8" rx="1.5" />
          <rect x="13" y="3" width="8" height="5" rx="1.5" />
          <rect x="13" y="10" width="8" height="11" rx="1.5" />
          <rect x="3" y="13" width="8" height="8" rx="1.5" />
        </svg>
      )
    case 'matriculas':
      return (
        <svg viewBox="0 0 24 24" className={base} aria-hidden>
          <path d="M7 4h10v16H7z" />
          <path d="M9 8h6M9 12h6M9 16h4" />
        </svg>
      )
    case 'historico':
      return (
        <svg viewBox="0 0 24 24" className={base} aria-hidden>
          <circle cx="12" cy="12" r="8" />
          <path d="M12 8v4l3 2" />
        </svg>
      )
    case 'notas':
      return (
        <svg viewBox="0 0 24 24" className={base} aria-hidden>
          <path d="M4 17.5V20h2.5L18 8.5 15.5 6 4 17.5z" />
          <path d="M14 7.5 16.5 10" />
        </svg>
      )
    case 'disciplinas':
      return (
        <svg viewBox="0 0 24 24" className={base} aria-hidden>
          <path d="M5 4h10a3 3 0 0 1 3 3v13H8a3 3 0 0 0-3 3z" />
          <path d="M8 8h7M8 12h7" />
        </svg>
      )
    case 'turmas':
      return (
        <svg viewBox="0 0 24 24" className={base} aria-hidden>
          <circle cx="8" cy="9" r="3" />
          <circle cx="16" cy="9" r="3" />
          <path d="M3 19c1.5-2.5 3.5-4 5-4s3.5 1.5 5 4M11 19c1.5-2.5 3.5-4 5-4s3.5 1.5 5 4" />
        </svg>
      )
    case 'alunos':
      return (
        <svg viewBox="0 0 24 24" className={base} aria-hidden>
          <circle cx="12" cy="8" r="4" />
          <path d="M5 20c1.7-3.3 4.2-5 7-5s5.3 1.7 7 5" />
        </svg>
      )
    case 'cursos':
      return (
        <svg viewBox="0 0 24 24" className={base} aria-hidden>
          <path d="M4 7h16v12H4z" />
          <path d="M9 7V5h6v2" />
        </svg>
      )
    case 'professores':
      return (
        <svg viewBox="0 0 24 24" className={base} aria-hidden>
          <path d="M3 9 12 4l9 5-9 5-9-5z" />
          <path d="M7 11v4c0 1.8 2.2 3 5 3s5-1.2 5-3v-4" />
        </svg>
      )
    case 'explorar':
      return (
        <svg viewBox="0 0 24 24" className={base} aria-hidden>
          <circle cx="11" cy="11" r="6" />
          <path d="m16 16 5 5" />
        </svg>
      )
  }
}

export function Sidebar() {
  const perfil = useAuthStore(s => s.perfil)
  const { sidebarOpen, closeSidebar } = useUiStore()
  const items = perfil ? MENU_BY_PERFIL[perfil] : []

  const linkClasses = ({ isActive }: { isActive: boolean }) =>
    [
      'group relative flex items-center gap-3 rounded-lg pl-5 pr-4 py-2.5 text-sm transition-colors',
      isActive
        ? 'bg-primary-light text-primary-dark font-semibold'
        : 'text-text hover:bg-surface font-medium'
    ].join(' ')

  return (
    <>
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Fechar menu"
          onClick={closeSidebar}
          className="md:hidden fixed inset-0 z-30 bg-black/40"
        />
      )}
      <aside
        className={[
          'fixed md:sticky z-40 top-0 md:top-16 left-0 h-full md:h-[calc(100vh-4rem)]',
          'w-[260px] bg-surface-card border-r border-surface-border',
          'flex flex-col transition-transform duration-200',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        ].join(' ')}
      >
        <nav className="flex flex-col gap-1 p-4 pt-6 flex-1 overflow-y-auto scrollbar-thin">
          {items.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={linkClasses}
              onClick={closeSidebar}
              end
            >
              {({ isActive }) => (
                <>
                  <span
                    aria-hidden
                    className={[
                      'absolute left-0 top-2 bottom-2 w-1 rounded-r-full transition-colors',
                      isActive ? 'bg-primary' : 'bg-transparent group-hover:bg-surface-border'
                    ].join(' ')}
                  />
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-surface-border bg-white text-black">
                    <MenuIcon icon={item.icon} />
                  </span>
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="px-5 py-3 border-t border-surface-border text-text-muted text-xs">
          v1.0 &middot; GHFlusão
        </div>
      </aside>
    </>
  )
}
