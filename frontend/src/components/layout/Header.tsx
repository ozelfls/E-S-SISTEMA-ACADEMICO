import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { useUiStore } from '../../store/uiStore'
import { Button } from '../ui/Button'

export function Header() {
  const { nome, perfil, logout } = useAuthStore()
  const toggleSidebar = useUiStore(s => s.toggleSidebar)
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const initials = (nome ?? '?')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(s => s.charAt(0).toUpperCase())
    .join('')

  return (
    <header className="bg-surface-card border-b border-surface-border sticky top-0 z-30">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleSidebar}
            aria-label="Abrir menu"
            className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-card text-text hover:bg-surface transition-colors"
          >
            <span
              aria-hidden
              className="block w-5 h-0.5 bg-text relative before:content-[''] before:absolute before:-top-1.5 before:left-0 before:right-0 before:h-0.5 before:bg-text after:content-[''] after:absolute after:top-1.5 after:left-0 after:right-0 after:h-0.5 after:bg-text"
            />
          </button>
          <div className="flex items-baseline gap-1 text-primary">
            <span className="font-display font-bold text-xl tracking-tight">GH</span>
            <span className="font-display font-semibold text-xl tracking-tight">Flusão</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="grid place-items-center w-9 h-9 rounded-full bg-primary text-white text-sm font-semibold shadow-sm">
            {initials || '?'}
          </div>
          {nome && (
            <div className="hidden sm:flex flex-col items-start leading-tight">
              <span className="text-sm font-semibold text-text">{nome}</span>
              {perfil && (
                <span className="inline-flex items-center rounded-full bg-primary-light text-primary-dark text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 mt-0.5">
                  {perfil}
                </span>
              )}
            </div>
          )}
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            Sair
          </Button>
        </div>
      </div>
    </header>
  )
}
