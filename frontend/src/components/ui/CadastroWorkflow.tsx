import { Spinner } from './Spinner'

export type CadastroWorkflowStatus = 'OK' | 'PENDENTE' | 'BLOQUEADO'

export interface CadastroWorkflowStep {
  chave: string
  titulo: string
  detalhe: string
  status: CadastroWorkflowStatus
}

interface CadastroWorkflowProps {
  steps: CadastroWorkflowStep[]
  summary: string
  ready?: boolean
  loading?: boolean
}

export function CadastroWorkflow({
  steps,
  summary,
  ready = false,
  loading = false
}: CadastroWorkflowProps) {
  const firstPending = steps.findIndex(item => item.status !== 'OK')

  return (
    <div className="rounded-card border border-surface-border bg-surface/60 p-4">
      <div
        className={`mb-4 rounded-card border px-3 py-2 text-sm ${
          ready
            ? 'border-success bg-success-light text-success-dark'
            : 'border-primary/30 bg-primary-light text-primary-dark'
        }`}
      >
        <div className="flex items-center gap-2">
          {loading && <Spinner />}
          <span>{summary}</span>
        </div>
      </div>

      <ol className="relative grid grid-cols-1 gap-3 md:grid-cols-4">
        <div className="pointer-events-none absolute left-8 right-8 top-5 hidden h-0.5 bg-surface-border md:block" />
        {steps.map((etapa, index) => {
          const ok = etapa.status === 'OK'
          const blocked = etapa.status === 'BLOQUEADO'
          const current = firstPending >= 0 && index === firstPending

          return (
            <li
              key={etapa.chave}
              className="relative z-10 flex flex-col items-center text-center"
              style={{
                animation: 'workflowStepIn 220ms ease-out both',
                animationDelay: `${index * 70}ms`
              }}
            >
              <span className="relative grid h-10 w-10 place-items-center">
                {current && (
                  <span className="workflow-current-pulse absolute inset-0 rounded-full bg-primary/20" />
                )}
                <span
                  className={`relative z-10 grid h-10 w-10 place-items-center rounded-full border-2 text-xs font-bold shadow-sm ${
                    ok
                      ? 'border-success bg-success text-white'
                      : blocked
                        ? 'border-warning bg-warning text-white'
                        : current
                          ? 'border-primary bg-primary text-white'
                          : 'border-surface-border bg-white text-text-muted'
                  }`}
                >
                  {ok ? 'OK' : blocked ? '!' : index + 1}
                </span>
              </span>
              <div className="mt-2 max-w-[180px]">
                <p className="text-sm font-semibold text-text">{etapa.titulo}</p>
                <p className="mt-1 text-xs leading-snug text-text-muted">
                  {etapa.detalhe}
                </p>
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
