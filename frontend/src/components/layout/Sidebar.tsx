import { useMemo, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { useUiStore } from '../../store/uiStore'
import type { Perfil } from '../../types'

const DEFAULT_SPOTIFY_LINK =
  'https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M'
const SPOTIFY_LINK_STORAGE = 'ghflusao-spotify-link'
const SPOTIFY_OPEN_STORAGE = 'ghflusao-spotify-open'

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
  | 'provas'
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
    { to: '/admin/explorar', label: 'Consulta Avancada', icon: 'explorar' },
    { to: '/admin/cursos', label: 'Cursos', icon: 'cursos' },
    { to: '/admin/turmas', label: 'Turmas', icon: 'turmas' },
    { to: '/admin/matriculas', label: 'Matriculas', icon: 'matriculas' },
    { to: '/admin/provas', label: 'Provas', icon: 'provas' },
    { to: '/admin/professores', label: 'Professores', icon: 'professores' },
    { to: '/admin/alunos', label: 'Alunos', icon: 'alunos' }
  ]
}

function storedValue(key: string, fallback: string) {
  try {
    return localStorage.getItem(key) ?? fallback
  } catch {
    return fallback
  }
}

function spotifyEmbedUrl(value: string) {
  const raw = value.trim() || DEFAULT_SPOTIFY_LINK
  const uriMatch = raw.match(/^spotify:(album|artist|episode|playlist|show|track):([^?]+)$/i)
  if (uriMatch) {
    return `https://open.spotify.com/embed/${uriMatch[1].toLowerCase()}/${uriMatch[2]}?utm_source=generator&theme=0`
  }

  try {
    const url = new URL(raw)
    if (!url.hostname.includes('spotify.com')) return spotifyEmbedUrl(DEFAULT_SPOTIFY_LINK)
    const parts = url.pathname.split('/').filter(Boolean)
    const embedIndex = parts[0] === 'embed' ? 1 : 0
    const type = parts[embedIndex]
    const id = parts[embedIndex + 1]
    if (!type || !id) return spotifyEmbedUrl(DEFAULT_SPOTIFY_LINK)
    return `https://open.spotify.com/embed/${type}/${id}?utm_source=generator&theme=0`
  } catch {
    return spotifyEmbedUrl(DEFAULT_SPOTIFY_LINK)
  }
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
    case 'provas':
      return (
        <svg viewBox="0 0 24 24" className={base} aria-hidden>
          <path d="M6 4h12v16H6z" />
          <path d="M9 8h6M9 12h6M9 16h3" />
          <path d="m15 16 1.5 1.5L20 14" />
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

function SpotifySidebarPlayer() {
  const [open, setOpen] = useState(
    () => storedValue(SPOTIFY_OPEN_STORAGE, 'false') === 'true'
  )
  const [editing, setEditing] = useState(false)
  const [link, setLink] = useState(() =>
    storedValue(SPOTIFY_LINK_STORAGE, DEFAULT_SPOTIFY_LINK)
  )
  const [draft, setDraft] = useState(link)
  const embedUrl = useMemo(() => spotifyEmbedUrl(link), [link])

  const toggleOpen = () => {
    const next = !open
    setOpen(next)
    localStorage.setItem(SPOTIFY_OPEN_STORAGE, String(next))
  }

  const applyLink = () => {
    const next = draft.trim() || DEFAULT_SPOTIFY_LINK
    setLink(next)
    setDraft(next)
    localStorage.setItem(SPOTIFY_LINK_STORAGE, next)
  }

  return (
    <section className="spotify-sidebar-panel">
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={toggleOpen}
          className="flex min-w-0 flex-1 items-center gap-2 text-left"
        >
          <span className="spotify-sidebar-logo" aria-hidden>
            <svg viewBox="0 0 24 24" className="spotify-sidebar-mark">
              <circle cx="12" cy="12" r="12" />
              <path d="M17.52 17.34c-0.24 0.36-0.66 0.48-1.02 0.24-2.82-1.74-6.36-2.1-10.56-1.14-0.42 0.12-0.78-0.18-0.9-0.54-0.12-0.42 0.18-0.78 0.54-0.9 4.56-1.02 8.52-0.6 11.64 1.32 0.42 0.18 0.48 0.66 0.3 1.02z" />
              <path d="M18.96 14.04c-0.3 0.42-0.84 0.6-1.26 0.3-3.24-1.98-8.16-2.58-11.94-1.38-0.48 0.12-1.02-0.12-1.14-0.6-0.12-0.48 0.12-1.02 0.6-1.14 4.38-1.32 9.78-0.66 13.5 1.62 0.36 0.18 0.54 0.78 0.24 1.2z" />
              <path d="M19.08 10.68c-3.84-2.28-10.26-2.52-13.92-1.38-0.6 0.18-1.2-0.18-1.38-0.72-0.18-0.6 0.18-1.2 0.72-1.38 4.26-1.26 11.28-1.02 15.72 1.62 0.54 0.3 0.72 1.02 0.42 1.56-0.3 0.42-1.02 0.6-1.56 0.3z" />
            </svg>
          </span>
          <span className="min-w-0">
            <span className="block truncate text-xs font-bold uppercase tracking-wide text-text">
              Spotify
            </span>
            <span className="block truncate text-xs text-text-muted">
              player integrado
            </span>
          </span>
        </button>
        <button
          type="button"
          onClick={toggleOpen}
          aria-label={open ? 'Recolher Spotify' : 'Abrir Spotify'}
          className="grid h-7 w-7 place-items-center rounded-full border border-surface-border bg-white text-xs font-bold text-text-muted hover:border-primary hover:text-primary"
        >
          {open ? 'x' : '>'}
        </button>
      </div>

      {!open && (
        <div className="mt-3 flex items-center justify-between gap-2">
          <span className="truncate text-xs font-medium text-text-muted">
            Playlist pronta para tocar
          </span>
          <button
            type="button"
            onClick={toggleOpen}
            className="spotify-sidebar-play"
          >
            Abrir
          </button>
        </div>
      )}

      {open && (
        <div className="mt-3 space-y-3">
          <a
            href={link}
            target="_blank"
            rel="noreferrer"
            className="spotify-sidebar-action"
          >
            <span className="spotify-sidebar-action-icon" aria-hidden>
              <svg viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
            Tocar no Spotify
          </a>
          <iframe
            title="Spotify player"
            src={embedUrl}
            className="spotify-sidebar-frame"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
          />
          <div className="flex items-center justify-between gap-2">
            <span className="truncate text-[11px] font-semibold uppercase tracking-wide text-text-muted">
              Link ativo
            </span>
            <button
              type="button"
              onClick={() => setEditing(current => !current)}
              className="text-xs font-bold text-primary hover:text-primary-dark"
            >
              {editing ? 'fechar' : 'trocar'}
            </button>
          </div>
          {editing && (
            <div className="grid grid-cols-[1fr_auto] gap-2">
              <input
                value={draft}
                onChange={e => setDraft(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    applyLink()
                    setEditing(false)
                  }
                }}
                className="h-8 min-w-0 rounded-lg border border-surface-border bg-white px-2 text-xs text-text placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="Cole um link do Spotify"
              />
              <button
                type="button"
                onClick={() => {
                  applyLink()
                  setEditing(false)
                }}
                className="h-8 rounded-lg bg-primary px-2 text-xs font-bold text-white hover:bg-primary-dark"
              >
                OK
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  )
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
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-surface-border bg-white text-current">
                    <MenuIcon icon={item.icon} />
                  </span>
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-surface-border p-3">
          <SpotifySidebarPlayer />
        </div>
        <div className="px-5 py-3 border-t border-surface-border text-text-muted text-xs">
          v1.0 &middot; GHFlusão
        </div>
      </aside>
    </>
  )
}
