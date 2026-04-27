import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent
} from 'react'

interface ComboboxOption {
  id: number
  label: string
  sublabel?: string
}

interface ComboboxProps {
  label?: string
  placeholder?: string
  value: number | null
  onChange: (id: number | null) => void
  options: ComboboxOption[]
  emptyMessage?: string
  size?: 'md' | 'lg'
}

export function Combobox({
  label,
  placeholder = 'Pesquisar...',
  value,
  onChange,
  options,
  emptyMessage = 'Nenhum resultado.',
  size = 'md'
}: ComboboxProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [highlight, setHighlight] = useState(0)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const selected = useMemo(
    () => options.find(o => o.id === value) ?? null,
    [options, value]
  )

  useEffect(() => {
    if (!open) {
      setQuery(selected ? selected.label : '')
    }
  }, [selected, open])

  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [open])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q || (selected && q === selected.label.toLowerCase())) return options
    return options.filter(o => {
      const hay = `${o.label} ${o.sublabel ?? ''}`.toLowerCase()
      return hay.includes(q)
    })
  }, [query, options, selected])

  useEffect(() => {
    setHighlight(0)
  }, [query, open])

  const heightCls = size === 'lg' ? 'h-11 text-base' : 'h-10 text-sm'

  const select = (id: number) => {
    onChange(id)
    setOpen(false)
    inputRef.current?.blur()
  }

  const clear = () => {
    onChange(null)
    setQuery('')
    setOpen(false)
  }

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (!open) setOpen(true)
      setHighlight(h => Math.min(h + 1, filtered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlight(h => Math.max(h - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const opt = filtered[highlight]
      if (opt) select(opt.id)
    } else if (e.key === 'Escape') {
      e.preventDefault()
      setOpen(false)
    }
  }

  return (
    <div ref={wrapperRef} className="flex flex-col gap-1 w-full">
      {label && (
        <label className="text-text-muted text-xs uppercase tracking-wide font-semibold">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          placeholder={placeholder}
          onChange={e => {
            setQuery(e.target.value)
            if (!open) setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          className={`w-full ${heightCls} rounded-lg border border-surface-border bg-white px-3 pr-9 text-text placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20`}
        />
        {value !== null && (
          <button
            type="button"
            aria-label="Limpar seleção"
            onClick={clear}
            className="absolute right-2 top-1/2 -translate-y-1/2 grid place-items-center w-6 h-6 rounded-full text-text-muted hover:bg-surface hover:text-text transition-colors"
          >
            <span aria-hidden className="text-base leading-none">
              &times;
            </span>
          </button>
        )}

        {open && (
          <div className="absolute z-30 left-0 right-0 mt-1 bg-surface-card border border-surface-border rounded-lg shadow-card max-h-72 overflow-auto scrollbar-thin">
            {filtered.length === 0 ? (
              <div className="px-3 py-3 text-sm text-text-muted">
                {emptyMessage}
              </div>
            ) : (
              filtered.map((opt, idx) => {
                const isSelected = opt.id === value
                const isHighlight = idx === highlight
                const cls = isSelected
                  ? 'bg-primary-light text-primary-dark'
                  : isHighlight
                    ? 'bg-surface text-text'
                    : 'text-text hover:bg-surface'
                return (
                  <button
                    type="button"
                    key={opt.id}
                    onMouseEnter={() => setHighlight(idx)}
                    onClick={() => select(opt.id)}
                    className={`w-full text-left px-3 py-2 transition-colors ${cls}`}
                  >
                    <div className="text-sm font-medium">{opt.label}</div>
                    {opt.sublabel && (
                      <div className="text-xs text-text-muted">
                        {opt.sublabel}
                      </div>
                    )}
                  </button>
                )
              })
            )}
          </div>
        )}
      </div>
    </div>
  )
}
