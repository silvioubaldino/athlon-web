'use client'

import { useEffect, useRef, useState } from 'react'
import { X, HelpCircle } from 'lucide-react'
import { MultiSelect } from '@/components/ui/MultiSelect'
import { DateRangePicker } from '@/components/ui/DateRangePicker'
import { useFundingSources } from '@/hooks/api/useFundingSources'
import { useProjects, useProjectSports } from '@/hooks/api/useProjects'
import { useSports } from '@/hooks/api/useSports'
import { useAthletes } from '@/hooks/api/useAthletes'
import { useEvents } from '@/hooks/api/useEvents'
import type { LibraryFilters } from '../_hooks/useLibraryFilters'

interface FilterBarProps {
  filters:   LibraryFilters
  setFilter: <K extends keyof LibraryFilters>(key: K, value: LibraryFilters[K]) => void
  clearAll:  () => void
  activeCount: number
}

export function FilterBar({ filters, setFilter, clearAll, activeCount }: FilterBarProps) {
  const [q, setQ] = useState(filters.q)
  const debounceRef = useRef<NodeJS.Timeout>()

  // Sync q field when URL changes externally
  useEffect(() => { setQ(filters.q) }, [filters.q])

  const handleQChange = (val: string) => {
    setQ(val)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => setFilter('q', val), 300)
  }

  const { data: fundingSources = [] } = useFundingSources()
  const { data: allProjects    = [] } = useProjects()
  const { data: allSports      = [] } = useSports()
  const { data: athletes       = [] } = useAthletes()
  const { data: events         = [] } = useEvents()

  // Derive allowed projects based on selected funding sources
  const allowedProjectIds = filters.fundingSourceIds.length
    ? new Set(
        allProjects
          .filter((p) => filters.fundingSourceIds.includes(p.funding_source_id))
          .map((p) => p.id)
      )
    : null

  // Derive allowed sports from selected projects (using all projects data)
  // We'll use per-project sports queries — simplified to checking sports list
  // For MVP, allowed sports derive from the backend filtering; here we show all
  // and disable with tooltip when projects are selected but sport not matching.
  // A full implementation would require fetching sports per project.
  const projectSportIds = useProjectSportsUnion(filters.projectIds)

  const fsOptions = fundingSources.map((f) => ({ value: f.id, label: f.name }))

  const projectOptions = allProjects.map((p) => ({
    value:          p.id,
    label:          p.name,
    disabled:       allowedProjectIds !== null && !allowedProjectIds.has(p.id),
    disabledReason: 'Não pertence à fonte de renda selecionada',
  }))

  const sportOptions = allSports.map((s) => ({
    value:          s.id,
    label:          s.name,
    disabled:       projectSportIds !== null && !projectSportIds.has(s.id),
    disabledReason: filters.projectIds.length ? 'Modalidade não associada aos projetos selecionados' : 'Selecione um projeto primeiro',
  }))

  const athleteOptions = athletes.map((a) => ({ value: a.id, label: a.name }))
  const eventOptions   = events.map((e)   => ({ value: e.id, label: e.name }))

  const dateRange = {
    from: filters.dateFrom ? new Date(filters.dateFrom) : undefined,
    to:   filters.dateTo   ? new Date(filters.dateTo)   : undefined,
  }

  // Build chip labels
  const chips: { label: string; onRemove: () => void }[] = []
  if (filters.q) chips.push({ label: `"${filters.q}"`, onRemove: () => setFilter('q', '') })
  filters.fundingSourceIds.forEach((id) => {
    const name = fundingSources.find((f) => f.id === id)?.name ?? id
    chips.push({ label: name, onRemove: () => setFilter('fundingSourceIds', filters.fundingSourceIds.filter((v) => v !== id)) })
  })
  filters.projectIds.forEach((id) => {
    const name = allProjects.find((p) => p.id === id)?.name ?? id
    chips.push({ label: name, onRemove: () => setFilter('projectIds', filters.projectIds.filter((v) => v !== id)) })
  })
  filters.sportIds.forEach((id) => {
    const name = allSports.find((s) => s.id === id)?.name ?? id
    chips.push({ label: name, onRemove: () => setFilter('sportIds', filters.sportIds.filter((v) => v !== id)) })
  })
  filters.athleteIds.forEach((id) => {
    const name = athletes.find((a) => a.id === id)?.name ?? id
    chips.push({ label: name, onRemove: () => setFilter('athleteIds', filters.athleteIds.filter((v) => v !== id)) })
  })
  filters.eventIds.forEach((id) => {
    const name = events.find((e) => e.id === id)?.name ?? id
    chips.push({ label: name, onRemove: () => setFilter('eventIds', filters.eventIds.filter((v) => v !== id)) })
  })

  return (
    <div className="sticky top-0 z-20 bg-brand-bg-page border-b border-gray-200 pb-3 pt-3 -mx-6 px-6 mb-4">
      {/* Filter inputs row */}
      <div className="flex flex-wrap gap-2 items-center">
        {/* Search */}
        <input
          type="text"
          value={q}
          onChange={(e) => handleQChange(e.target.value)}
          placeholder="Buscar mídias..."
          className="rounded-input border border-brand-border px-3 py-2 text-sm w-48 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary"
        />

        <MultiSelect
          options={fsOptions}
          value={filters.fundingSourceIds}
          onChange={(v) => setFilter('fundingSourceIds', v)}
          placeholder="Fonte de Renda"
          className="w-48"
        />

        <MultiSelect
          options={projectOptions}
          value={filters.projectIds}
          onChange={(v) => setFilter('projectIds', v)}
          placeholder="Projeto"
          className="w-48"
        />

        <MultiSelect
          options={sportOptions}
          value={filters.sportIds}
          onChange={(v) => setFilter('sportIds', v)}
          placeholder="Modalidade"
          className="w-44"
        />

        <MultiSelect
          options={athleteOptions}
          value={filters.athleteIds}
          onChange={(v) => setFilter('athleteIds', v)}
          placeholder="Atleta"
          className="w-44"
        />

        <MultiSelect
          options={eventOptions}
          value={filters.eventIds}
          onChange={(v) => setFilter('eventIds', v)}
          placeholder="Evento"
          className="w-44"
        />

        <DateRangePicker
          value={dateRange}
          onChange={(range) => {
            setFilter('dateFrom', range.from ? range.from.toISOString().split('T')[0] : undefined as unknown as string)
            setFilter('dateTo',   range.to   ? range.to.toISOString().split('T')[0]   : undefined as unknown as string)
          }}
          className="w-56"
        />

        {/* Sort */}
        <select
          value={filters.orderBy}
          onChange={(e) => setFilter('orderBy', e.target.value as LibraryFilters['orderBy'])}
          className="rounded-input border border-brand-border px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
        >
          <option value="media_date_desc">Mais recentes</option>
          <option value="media_date_asc">Mais antigas</option>
          <option value="created_at_desc">Cadastro recente</option>
        </select>

        {/* Help tooltip */}
        <div className="relative group">
          <HelpCircle size={16} className="text-gray-400 cursor-help" />
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-30 w-72 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 leading-relaxed">
            Filtros diferentes se combinam com <strong>E (AND)</strong>. Dentro do mesmo filtro, múltiplas seleções usam <strong>OU (OR)</strong>.
          </div>
        </div>
      </div>

      {/* Active chips */}
      {chips.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2 items-center">
          {chips.map((chip, i) => (
            <span
              key={i}
              className="flex items-center gap-1 bg-blue-50 text-blue-700 text-xs font-medium px-2 py-0.5 rounded-full border border-blue-200"
            >
              {chip.label}
              <button onClick={chip.onRemove} className="hover:text-blue-900">
                <X size={10} />
              </button>
            </span>
          ))}
          {activeCount > 0 && (
            <button
              onClick={clearAll}
              className="text-xs text-gray-500 hover:text-gray-700 underline ml-1"
            >
              Limpar tudo
            </button>
          )}
        </div>
      )}
    </div>
  )
}

// Helper hook: union of sport IDs across multiple selected projects
function useProjectSportsUnion(projectIds: string[]): Set<string> | null {
  // We do individual queries per project - limited to first 5 for performance
  const p0 = useProjectSports(projectIds[0] ?? null)
  const p1 = useProjectSports(projectIds[1] ?? null)
  const p2 = useProjectSports(projectIds[2] ?? null)
  const p3 = useProjectSports(projectIds[3] ?? null)
  const p4 = useProjectSports(projectIds[4] ?? null)

  if (projectIds.length === 0) return null

  const union = new Set<string>()
  ;[p0, p1, p2, p3, p4].forEach((q, i) => {
    if (projectIds[i] && q.data) {
      q.data.forEach((s) => union.add(s.id))
    }
  })

  return union
}
