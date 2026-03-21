'use client'

import { useState, useRef, useEffect } from 'react'
import { Loader2, MoreVertical, RotateCcw } from 'lucide-react'
import { MultiSelect, type MultiSelectOption } from '@/components/ui/MultiSelect'
import type { FundingSource } from '@/types/api'
import type { ClassificationState } from '../_hooks/useClassification'

interface ClassificationDockProps {
  state:                ClassificationState
  setValue:             (key: keyof Omit<ClassificationState, 'isDirty' | 'mediaId'>, value: string | string[]) => void
  isDirty:              boolean
  isSaving:            boolean
  isLast:              boolean
  derivedFundingSources: FundingSource[]
  allowedSportIds:     string[]
  projectOptions:      MultiSelectOption[]
  sportOptions:        MultiSelectOption[]
  athleteOptions:      MultiSelectOption[]
  eventOptions:        MultiSelectOption[]
  onSaveAndNext:       () => void
  onSave:              () => void
  onSkip:              () => void
  onReset:             () => void
}

export function ClassificationDock({
  state, setValue, isDirty, isSaving, isLast,
  derivedFundingSources, allowedSportIds,
  projectOptions, sportOptions, athleteOptions, eventOptions,
  onSaveAndNext, onSave, onSkip, onReset,
}: ClassificationDockProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!menuOpen) return
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [menuOpen])

  const allSportOptions = sportOptions.map((opt) => ({
    ...opt,
    disabled:       allowedSportIds.length > 0 && !allowedSportIds.includes(opt.value),
    disabledReason: 'Modalidade não associada aos projetos selecionados',
  }))

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-200 shadow-[0_-2px_8px_rgba(0,0,0,0.08)]">
      <div className="max-w-[1280px] mx-auto px-6 py-3">
        <div className="flex flex-wrap gap-3 items-end">
          {/* Fonte de Renda — read-only chips */}
          <DockField label="Fonte de Renda">
            <div className="flex flex-wrap gap-1 min-h-[38px] items-center bg-gray-50 border border-transparent px-3 py-1.5 rounded-input min-w-[110px]">
              {derivedFundingSources.length === 0 ? (
                <span className="text-sm text-gray-400 italic">Automático</span>
              ) : (
                derivedFundingSources.map((f) => (
                  <span key={f.id} className="text-xs bg-purple-50 border border-purple-100 text-purple-700 px-2 py-0.5 rounded-md font-medium">
                    {f.name}
                  </span>
                ))
              )}
            </div>
          </DockField>

          <DockField label="Projeto(s)">
            <MultiSelect
              options={projectOptions}
              value={state.projectIds ?? []}
              onChange={(v) => setValue('projectIds', v)}
              placeholder="Selecionar..."
              className="w-44"
              placement="top"
            />
          </DockField>

          <DockField label="Modalidade(s)">
            <MultiSelect
              options={allSportOptions}
              value={state.sportIds ?? []}
              onChange={(v) => setValue('sportIds', v)}
              placeholder="Selecionar..."
              className="w-44"
              placement="top"
            />
          </DockField>

          <DockField label="Evento/Competição">
            <MultiSelect
              options={eventOptions}
              value={state.eventIds ?? []}
              onChange={(v) => setValue('eventIds', v)}
              placeholder="Selecionar..."
              className="w-44"
              placement="top"
            />
          </DockField>

          <DockField label="Atleta(s)">
            <MultiSelect
              options={athleteOptions}
              value={state.athleteIds ?? []}
              onChange={(v) => setValue('athleteIds', v)}
              placeholder="Selecionar..."
              className="w-44"
              placement="top"
            />
          </DockField>

          <DockField label="Data da mídia">
            <input
              type="date"
              value={state.mediaDate ?? ''}
              onChange={(e) => setValue('mediaDate', e.target.value)}
              className="rounded-input border border-brand-border px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary w-36"
            />
          </DockField>

          <DockField label="Autor">
            <input
              type="text"
              value={state.author ?? ''}
              onChange={(e) => setValue('author', e.target.value)}
              placeholder="Opcional"
              className="rounded-input border border-brand-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary w-36"
            />
          </DockField>

          {/* Action buttons */}
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={onSkip}
              className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-input transition-colors"
            >
              Pular
            </button>
            <button
              onClick={onSave}
              disabled={!isDirty || isSaving}
              className="px-3 py-2 text-sm font-medium text-brand-primary border border-brand-primary rounded-input hover:bg-blue-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Salvar
            </button>
            <button
              onClick={onSaveAndNext}
              disabled={!isDirty || isSaving}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-brand-primary rounded-input hover:bg-brand-primary-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {isSaving && <Loader2 size={14} className="animate-spin" />}
              {isLast ? 'Salvar e finalizar' : 'Salvar e ir para a próxima'}
            </button>

            {/* Overflow menu */}
            <div ref={menuRef} className="relative">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="p-2 rounded-input text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <MoreVertical size={16} />
              </button>
              {menuOpen && (
                <>
                  <div className="absolute bottom-full right-0 mb-1 z-20 bg-white border border-gray-200 rounded-card shadow-card w-48 py-1">
                    <button
                      onClick={() => { onReset(); setMenuOpen(false) }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <RotateCcw size={13} />
                      Descartar alterações
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function DockField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="block text-xs font-medium text-gray-500">{label}</label>
      {children}
    </div>
  )
}
