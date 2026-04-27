import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Perfil } from '../types'

interface AuthState {
  token: string | null
  perfil: Perfil | null
  pessoaId: number | null
  nome: string | null
  isAuthenticated: boolean
  setAuth: (token: string, perfil: Perfil, pessoaId: number, nome: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    set => ({
      token: null,
      perfil: null,
      pessoaId: null,
      nome: null,
      isAuthenticated: false,
      setAuth: (token, perfil, pessoaId, nome) => {
        localStorage.setItem('ghflusao_token', token)
        set({ token, perfil, pessoaId, nome, isAuthenticated: true })
      },
      logout: () => {
        localStorage.removeItem('ghflusao_token')
        set({ token: null, perfil: null, pessoaId: null, nome: null, isAuthenticated: false })
      }
    }),
    { name: 'ghflusao-auth' }
  )
)
