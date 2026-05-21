import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { login } from '../../api/auth'
import { useAuthStore } from '../../store/authStore'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Card } from '../../components/ui/Card'
import type { Perfil } from '../../types'

const schema = z.object({
  login: z.string().min(1, 'Informe o usuário'),
  senha: z.string().min(1, 'Informe a senha')
})

type FormData = z.infer<typeof schema>

const routeByPerfil: Record<Perfil, string> = {
  ALUNO: '/aluno/dashboard',
  PROFESSOR: '/professor/dashboard',
  COORDENADOR: '/coordenador/dashboard',
  SECRETARIA: '/secretaria/dashboard',
  DIRETOR: '/diretor/dashboard',
  ADMIN: '/admin/dashboard'
}

const integrantes = [
  'Daniel de Oliveira',
  'Pedro Artur',
  'Hiago Arruda',
  'Dagner Leal',
  'Kaleo Lemos'
]

export function LoginPage() {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()
  const [apiError, setApiError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (form: FormData) => {
    setApiError(null)
    try {
      const response = await login(form)
      setAuth(response.token, response.perfil, response.pessoaId, response.nome)
      navigate(routeByPerfil[response.perfil], { replace: true })
    } catch {
      setApiError('Credenciais inválidas.')
    }
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-surface">
      <section
        className="relative overflow-hidden text-white px-8 py-10 md:py-0 md:w-2/5 md:min-h-screen flex flex-col justify-center md:px-12"
        style={{
          backgroundImage:
            'linear-gradient(135deg, #DC143C 0%, #B91C3C 45%, #16A34A 100%)'
        }}
      >
        <div
          aria-hidden
          className="absolute inset-0 opacity-30 pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(circle at 25% 30%, rgba(255,255,255,0.18), transparent 40%), radial-gradient(circle at 80% 70%, rgba(255,255,255,0.12), transparent 45%)'
          }}
        />
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.07] pointer-events-none mix-blend-overlay"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")"
          }}
        />
        <div className="relative max-w-sm">
          <h1 className="font-display text-4xl md:text-5xl font-bold leading-tight">
            GHFlusão
          </h1>
          <p className="mt-3 text-white/90 text-base md:text-lg">
            Sistema de Controle Acadêmico
          </p>
          <p className="mt-12 text-white/70 text-xs hidden md:block">
            Unilasalle-RJ &middot; 2026
          </p>
        </div>
      </section>

      <section className="md:w-3/5 flex items-center justify-center px-6 py-10 md:py-0">
        <div className="w-full max-w-md">
          <Card>
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
              <div>
                <h2 className="font-display text-3xl font-semibold text-text">
                  Bem-vindo de volta
                </h2>
                <p className="text-text-muted text-sm mt-1">
                  Entre para acessar o sistema.
                </p>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="login" className="text-sm font-medium text-text">
                  Usuário
                </label>
                <Input
                  id="login"
                  autoComplete="username"
                  placeholder="seu.usuario"
                  error={errors.login?.message}
                  {...register('login')}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="senha" className="text-sm font-medium text-text">
                  Senha
                </label>
                <Input
                  id="senha"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  error={errors.senha?.message}
                  {...register('senha')}
                />
              </div>

              {apiError && (
                <div className="bg-primary-light border border-primary text-primary-dark rounded-card px-3 py-2 text-sm">
                  {apiError}
                </div>
              )}

              <Button type="submit" loading={isSubmitting} fullWidth size="lg">
                {isSubmitting ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>
          </Card>
          <div className="mt-5 rounded-card border border-surface-border bg-surface px-4 py-3">
            <p className="text-center text-[11px] font-semibold uppercase tracking-wide text-text-muted">
              Integrantes
            </p>
            <div className="mt-2 flex flex-wrap justify-center gap-2">
              {integrantes.map(integrante => (
                <span
                  key={integrante}
                  className="rounded-full border border-surface-border bg-white px-3 py-1 text-xs font-semibold text-text"
                >
                  {integrante}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
