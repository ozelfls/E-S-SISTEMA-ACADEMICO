import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UiState {
  sidebarOpen: boolean
  theme: 'light' | 'dark'
  displayName: string
  toggleSidebar: () => void
  closeSidebar: () => void
  setTheme: (theme: 'light' | 'dark') => void
  setDisplayName: (displayName: string) => void
}

function applyTheme(theme: 'light' | 'dark') {
  document.body.classList.toggle('theme-dark', theme === 'dark')
}

export const useUiStore = create<UiState>()(
  persist(
    set => ({
      sidebarOpen: false,
      theme: 'light',
      displayName: '',
      toggleSidebar: () => set(state => ({ sidebarOpen: !state.sidebarOpen })),
      closeSidebar: () => set({ sidebarOpen: false }),
      setTheme: theme => {
        applyTheme(theme)
        set({ theme })
      },
      setDisplayName: displayName => set({ displayName })
    }),
    {
      name: 'ghflusao-ui',
      onRehydrateStorage: () => state => {
        applyTheme(state?.theme ?? 'light')
      }
    }
  )
)
