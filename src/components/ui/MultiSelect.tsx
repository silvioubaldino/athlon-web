'use client'

import { useState, useRef, useCallback } from 'react'
import { X, ChevronDown, Check, Search } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface MultiSelectOption {
  value:           string
  label:           string
  disabled?:       boolean
  disabledReason?: string
}

interface MultiSelectProps {
  options:           MultiSelectOption[]
  value:             string[]
  onChange:          (values: string[]) => void
  placeholder?:      string
  searchPlaceholder?: string
  disabled?:         boolean
  maxHeight?:        number
  className?:        string
}

export function MultiSelect({
  options,
  value,
  onChange,
  placeholder      = 'Selecionar...',
  searchPlaceholder = 'Buscar...',
  disabled,
  maxHeight = 240,
  className,
}: MultiSelectProps) {
  const [open,   setOpen]   = useState(false)
  const [search, setSearch] = useState('')
  const searchRef = useRef<HTMLInputElement>(null)

  const selectedSet = new Set(value)

  const filtered = options.filter((o) =>
    o.label.toLowerCase().includes(search.toLowerCase())
  )

  const toggle = useCallback(
    (val: string) => {
      if (selectedSet.has(val)) {
        onChange(value.filter((v) => v !== val))
      } else {
        onChange([...value, val])
      }
    },
    [value, onChange, selectedSet]
  )

  const remove = (val: string, e: React.MouseEvent) => {
    e.stopPropagation()
    onChange(value.filter((v) => v !== val))
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') { setOpen(false); return }
    if (e.key === 'Backspace' && search === '' && value.length > 0) {
      onChange(value.slice(0, -1))
    }
  }

  const selectedLabels = value.map(
    (v) => options.find((o) => o.value === v)?.label ?? v
  )

  return (
    <div className={cn('relative', className)}>
      {/* Trigger */}
      <div
        onClick={() => !disabled && setOpen((v) => !v)}
        className={cn(
          'min-h-[38px] flex flex-wrap items-center gap-1 rounded-input border border-brand-border bg-white px-2 py-1.5 cursor-pointer transition-colors',
          open && 'ring-2 ring-brand-primary border-brand-primary',
          disabled && 'opacity-50 cursor-not-allowed bg-gray-50'
        )}
      >
        {selectedLabels.length === 0 && (
          <span className="text-sm text-gray-400 px-1">{placeholder}</span>
        )}
        {selectedLabels.map((label, i) => (
          <span
            key={value[i]}
            className="flex items-center gap-1 bg-blue-50 text-blue-700 text-xs font-medium px-2 py-0.5 rounded-md"
          >
            {label}
            <button
              onClick={(e) => remove(value[i], e)}
              className="hover:text-blue-900 transition-colors"
              aria-label={`Remover ${label}`}
            >
              <X size={11} />
            </button>
          </span>
        ))}
        <ChevronDown
          size={14}
          className={cn(
            'ml-auto text-gray-400 shrink-0 transition-transform',
            open && 'rotate-180'
          )}
        />
      </div>

      {/* Dropdown */}
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-card shadow-card overflow-hidden">
            {/* Search */}
            <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100">
              <Search size={13} className="text-gray-400 shrink-0" />
              <input
                ref={searchRef}
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={searchPlaceholder}
                className="flex-1 text-sm outline-none placeholder-gray-400"
              />
            </div>

            {/* Options list */}
            <div style={{ maxHeight }} className="overflow-y-auto">
              {filtered.length === 0 ? (
                <p className="px-3 py-4 text-sm text-center text-gray-400">
                  Nenhum resultado
                </p>
              ) : (
                filtered.map((opt) => {
                  const selected = selectedSet.has(opt.value)
                  return (
                    <div key={opt.value} className="relative group">
                      <button
                        onClick={() => !opt.disabled && toggle(opt.value)}
                        disabled={opt.disabled}
                        className={cn(
                          'w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors',
                          selected    ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50',
                          opt.disabled && 'opacity-40 cursor-not-allowed'
                        )}
                      >
                        <span
                          className={cn(
                            'w-4 h-4 rounded border flex items-center justify-center shrink-0',
                            selected
                              ? 'bg-brand-primary border-brand-primary'
                              : 'border-gray-300'
                          )}
                        >
                          {selected && <Check size={10} className="text-white" />}
                        </span>
                        {opt.label}
                      </button>
                      {/* Tooltip for disabled */}
                      {opt.disabled && opt.disabledReason && (
                        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 z-30 hidden group-hover:block">
                          <div className="bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap max-w-[200px]">
                            {opt.disabledReason}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
