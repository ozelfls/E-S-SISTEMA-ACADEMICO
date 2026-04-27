import type { PropsWithChildren } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import type { Perfil } from '../../types'

interface ProtectedRouteProps extends PropsWithChildren {
  allowed: Perfil[]
}

export function ProtectedRoute({ allowed, children }: ProtectedRouteProps) {
  const { isAuthenticated, perfil } = useAuthStore()
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  if (perfil === 'ADMIN') {
    return <>{children}</>
  }
  if (!perfil || !allowed.includes(perfil)) {
    return <Navigate to="/login" replace />
  }
  return <>{children}</>
}
