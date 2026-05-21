import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { useUiStore } from '../../store/uiStore'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'

export function Header() {
  const { nome, perfil, logout } = useAuthStore()
  const toggleSidebar = useUiStore(s => s.toggleSidebar)
  const theme = useUiStore(s => s.theme)
  const setTheme = useUiStore(s => s.setTheme)
  const displayName = useUiStore(s => s.displayName)
  const setDisplayName = useUiStore(s => s.setDisplayName)
  const [profileOpen, setProfileOpen] = useState(false)
  const [draftName, setDraftName] = useState(displayName || nome || '')
  const profileRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const shownName = displayName.trim() || nome

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  useEffect(() => {
    if (profileOpen) {
      setDraftName(displayName || nome || '')
    }
  }, [displayName, nome, profileOpen])

  useEffect(() => {
    if (!profileOpen) return
    const onClick = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [profileOpen])

  const initials = (shownName ?? '?')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(s => s.charAt(0).toUpperCase())
    .join('')

  return (
    <header className="sticky top-0 z-30 border-b border-surface-border bg-surface-card">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleSidebar}
            aria-label="Abrir menu"
            className="inline-flex h-10 w-10 items-center justify-center rounded-card text-text transition-colors hover:bg-surface md:hidden"
          >
            <span
              aria-hidden
              className="relative block h-0.5 w-5 bg-text before:absolute before:-top-1.5 before:left-0 before:right-0 before:h-0.5 before:bg-text before:content-[''] after:absolute after:left-0 after:right-0 after:top-1.5 after:h-0.5 after:bg-text after:content-['']"
            />
          </button>
          <div className="flex items-baseline gap-1 text-primary">
            <span className="font-display text-xl font-bold tracking-tight">GH</span>
            <span className="font-display text-xl font-semibold tracking-tight">Flusao</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div ref={profileRef} className="relative">
            <button
              type="button"
              onClick={() => setProfileOpen(open => !open)}
              className="flex items-center gap-3 rounded-card px-2 py-1.5 text-left transition-colors hover:bg-surface"
            >
              <span className="grid h-9 w-9 place-items-center rounded-full bg-primary text-sm font-semibold text-white shadow-sm">
                {initials || '?'}
              </span>
              {shownName && (
                <span className="hidden flex-col items-start leading-tight sm:flex">
                  <span className="text-sm font-semibold text-text">{shownName}</span>
                  {perfil && (
                    <span className="mt-0.5 inline-flex items-center rounded-full bg-primary-light px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary-dark">
                      {perfil}
                    </span>
                  )}
                </span>
              )}
            </button>

            {profileOpen && (
              <div className="absolute right-0 top-12 z-50 w-[min(320px,calc(100vw-24px))] rounded-card border border-surface-border bg-surface-card p-4 shadow-card">
                <div className="mb-3">
                  <p className="text-sm font-semibold text-text">Perfil</p>
                  <p className="text-xs text-text-muted">{perfil ?? 'Usuario'}</p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-text-muted">
                      Nome de exibicao
                    </label>
                    <Input
                      value={draftName}
                      onChange={event => setDraftName(event.target.value)}
                      placeholder={nome ?? 'Seu nome'}
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-text-muted">
                      Tema
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setTheme('light')}
                        className={`h-10 rounded-card border text-sm font-semibold transition-colors ${
                          theme === 'light'
                            ? 'border-primary bg-primary text-white'
                            : 'border-surface-border bg-white text-text hover:bg-surface'
                        }`}
                      >
                        Claro
                      </button>
                      <button
                        type="button"
                        onClick={() => setTheme('dark')}
                        className={`h-10 rounded-card border text-sm font-semibold transition-colors ${
                          theme === 'dark'
                            ? 'border-primary bg-primary text-white'
                            : 'border-surface-border bg-white text-text hover:bg-surface'
                        }`}
                      >
                        Escuro
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex justify-end gap-2 border-t border-surface-border pt-3">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setDisplayName('')
                      setDraftName(nome ?? '')
                    }}
                  >
                    Limpar
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      setDisplayName(draftName.trim())
                      setProfileOpen(false)
                    }}
                  >
                    Salvar
                  </Button>
                </div>
              </div>
            )}
          </div>

          <Button variant="ghost" size="sm" onClick={handleLogout}>
            Sair
          </Button>
        </div>
      </div>
    </header>
  )
}
