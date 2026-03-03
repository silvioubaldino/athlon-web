'use client'

import { useParams, notFound } from 'next/navigation'
import { VocabularyPage } from '../_components/VocabularyPage'
import {
  useFundingSources, useCreateFundingSource,
  useUpdateFundingSource, useDeleteFundingSource,
} from '@/hooks/api/useFundingSources'
import {
  useProjects, useCreateProject, useUpdateProject, useDeleteProject,
} from '@/hooks/api/useProjects'
import {
  useSports, useCreateSport, useUpdateSport, useDeleteSport,
} from '@/hooks/api/useSports'
import {
  useAthletes, useCreateAthlete, useUpdateAthlete, useDeleteAthlete,
} from '@/hooks/api/useAthletes'
import {
  useEvents, useCreateEvent, useUpdateEvent, useDeleteEvent,
} from '@/hooks/api/useEvents'
import type { FundingSource, Project, Sport, Athlete, Event } from '@/types/api'

// ─── Simple form components ───────────────────────────────────────────────────

function NameForm({ onSubmit, isLoading, defaultValue = '' }: {
  onSubmit: (data: Record<string, unknown>) => void
  isLoading: boolean
  defaultValue?: string
}) {
  return (
    <form
      onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); onSubmit({ name: fd.get('name') }) }}
      className="space-y-4"
    >
      <div>
        <label className="block text-sm font-medium text-brand-text-dark mb-1">Nome *</label>
        <input name="name" defaultValue={defaultValue} required className="w-full rounded-input border border-brand-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary" />
      </div>
      <SubmitBtn isLoading={isLoading} />
    </form>
  )
}

function FundingSourceForm({ onSubmit, isLoading, item }: { onSubmit: (d: Record<string, unknown>) => void; isLoading: boolean; item?: FundingSource }) {
  return (
    <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); onSubmit({ name: fd.get('name'), type: fd.get('type') }) }} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-brand-text-dark mb-1">Nome *</label>
        <input name="name" defaultValue={item?.name} required className="w-full rounded-input border border-brand-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary" />
      </div>
      <div>
        <label className="block text-sm font-medium text-brand-text-dark mb-1">Tipo *</label>
        <select name="type" defaultValue={item?.type} required className="w-full rounded-input border border-brand-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary">
          <option value="municipal">Municipal</option>
          <option value="state">Estadual</option>
          <option value="federal">Federal</option>
          <option value="sponsorship">Patrocínio</option>
        </select>
      </div>
      <SubmitBtn isLoading={isLoading} />
    </form>
  )
}

function ProjectForm({ onSubmit, isLoading, item, fundingSources }: {
  onSubmit: (d: Record<string, unknown>) => void
  isLoading: boolean
  item?: Project
  fundingSources?: FundingSource[]
}) {
  return (
    <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); onSubmit({ name: fd.get('name'), funding_source_id: fd.get('funding_source_id'), active: fd.get('active') === 'on' }) }} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-brand-text-dark mb-1">Nome *</label>
        <input name="name" defaultValue={item?.name} required className="w-full rounded-input border border-brand-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary" />
      </div>
      <div>
        <label className="block text-sm font-medium text-brand-text-dark mb-1">Fonte de Renda *</label>
        <select name="funding_source_id" defaultValue={item?.funding_source_id} required className="w-full rounded-input border border-brand-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary">
          <option value="">Selecionar...</option>
          {(fundingSources ?? []).map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
        </select>
      </div>
      {item && (
        <label className="flex items-center gap-2 text-sm text-brand-text-dark cursor-pointer">
          <input type="checkbox" name="active" defaultChecked={item.active} className="rounded" />
          Ativo
        </label>
      )}
      <SubmitBtn isLoading={isLoading} />
    </form>
  )
}

function AthleteForm({ onSubmit, isLoading, item, sports }: { onSubmit: (d: Record<string, unknown>) => void; isLoading: boolean; item?: Athlete; sports?: Sport[] }) {
  return (
    <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); onSubmit({ name: fd.get('name'), primary_sport_id: fd.get('primary_sport_id') || undefined }) }} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-brand-text-dark mb-1">Nome *</label>
        <input name="name" defaultValue={item?.name} required className="w-full rounded-input border border-brand-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary" />
      </div>
      <div>
        <label className="block text-sm font-medium text-brand-text-dark mb-1">Modalidade principal</label>
        <select name="primary_sport_id" defaultValue={item?.primary_sport_id ?? ''} className="w-full rounded-input border border-brand-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary">
          <option value="">Nenhuma</option>
          {(sports ?? []).map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>
      <SubmitBtn isLoading={isLoading} />
    </form>
  )
}

function EventForm({ onSubmit, isLoading, item }: { onSubmit: (d: Record<string, unknown>) => void; isLoading: boolean; item?: Event }) {
  return (
    <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); onSubmit({ name: fd.get('name'), start_date: fd.get('start_date') || undefined, end_date: fd.get('end_date') || undefined }) }} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-brand-text-dark mb-1">Nome *</label>
        <input name="name" defaultValue={item?.name} required className="w-full rounded-input border border-brand-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-brand-text-dark mb-1">Data início</label>
          <input type="date" name="start_date" defaultValue={item?.start_date} className="w-full rounded-input border border-brand-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary" />
        </div>
        <div>
          <label className="block text-sm font-medium text-brand-text-dark mb-1">Data fim</label>
          <input type="date" name="end_date" defaultValue={item?.end_date} className="w-full rounded-input border border-brand-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary" />
        </div>
      </div>
      <SubmitBtn isLoading={isLoading} />
    </form>
  )
}

function SubmitBtn({ isLoading }: { isLoading: boolean }) {
  return (
    <div className="flex justify-end">
      <button type="submit" disabled={isLoading} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-brand-primary rounded-input hover:bg-brand-primary-hover disabled:opacity-50">
        {isLoading && <span className="w-3 h-3 rounded-full border-2 border-white border-t-transparent animate-spin" />}
        Salvar
      </button>
    </div>
  )
}

// ─── Type badge ───────────────────────────────────────────────────────────────

const typeLabels: Record<string, string> = {
  municipal: 'Municipal', state: 'Estadual', federal: 'Federal', sponsorship: 'Patrocínio',
}
const typeColors: Record<string, string> = {
  municipal: 'bg-blue-50 text-blue-700', state: 'bg-green-50 text-green-700',
  federal: 'bg-purple-50 text-purple-700', sponsorship: 'bg-orange-50 text-orange-700',
}

// ─── Page router ─────────────────────────────────────────────────────────────

export default function VocabularyResourcePage() {
  const params   = useParams()
  const resource = params.resource as string

  const { data: fundingSources = [] } = useFundingSources()
  const { data: sports         = [] } = useSports()

  switch (resource) {
    case 'funding-sources':
      return (
        <VocabularyPage
          title="Fontes de Renda"
          useList={useFundingSources}
          useCreate={useCreateFundingSource as never}
          useUpdate={useUpdateFundingSource as never}
          useDelete={useDeleteFundingSource as never}
          columns={[{
            header: 'Tipo',
            render: (item: FundingSource) => (
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeColors[item.type]}`}>
                {typeLabels[item.type]}
              </span>
            ),
          }]}
          CreateForm={({ onSubmit, isLoading }) => <FundingSourceForm onSubmit={onSubmit} isLoading={isLoading} />}
          EditForm={({ item, onSubmit, isLoading }) => <FundingSourceForm onSubmit={onSubmit} isLoading={isLoading} item={item as FundingSource} />}
        />
      )

    case 'projects':
      return (
        <VocabularyPage
          title="Projetos"
          useList={useProjects}
          useCreate={useCreateProject as never}
          useUpdate={useUpdateProject as never}
          useDelete={useDeleteProject as never}
          columns={[
            {
              header: 'Fonte de Renda',
              render: (item: Project) => fundingSources.find((f) => f.id === item.funding_source_id)?.name ?? '—',
            },
            {
              header: 'Status',
              render: (item: Project) => (
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${item.active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {item.active ? 'Ativo' : 'Inativo'}
                </span>
              ),
            },
          ]}
          CreateForm={({ onSubmit, isLoading }) => <ProjectForm onSubmit={onSubmit} isLoading={isLoading} fundingSources={fundingSources} />}
          EditForm={({ item, onSubmit, isLoading }) => <ProjectForm onSubmit={onSubmit} isLoading={isLoading} item={item as Project} fundingSources={fundingSources} />}
        />
      )

    case 'sports':
      return (
        <VocabularyPage
          title="Modalidades"
          useList={useSports}
          useCreate={useCreateSport as never}
          useUpdate={useUpdateSport as never}
          useDelete={useDeleteSport as never}
          CreateForm={({ onSubmit, isLoading }) => <NameForm onSubmit={onSubmit} isLoading={isLoading} />}
          EditForm={({ item, onSubmit, isLoading }) => <NameForm onSubmit={onSubmit} isLoading={isLoading} defaultValue={(item as Sport).name} />}
        />
      )

    case 'athletes':
      return (
        <VocabularyPage
          title="Atletas"
          useList={useAthletes}
          useCreate={useCreateAthlete as never}
          useUpdate={useUpdateAthlete as never}
          useDelete={useDeleteAthlete as never}
          columns={[
            {
              header: 'Modalidade principal',
              render: (item: Athlete) => sports.find((s) => s.id === item.primary_sport_id)?.name ?? '—',
            },
            {
              header: 'Status',
              render: (item: Athlete) => (
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${item.active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {item.active ? 'Ativo' : 'Inativo'}
                </span>
              ),
            },
          ]}
          CreateForm={({ onSubmit, isLoading }) => <AthleteForm onSubmit={onSubmit} isLoading={isLoading} sports={sports} />}
          EditForm={({ item, onSubmit, isLoading }) => <AthleteForm onSubmit={onSubmit} isLoading={isLoading} item={item as Athlete} sports={sports} />}
        />
      )

    case 'events':
      return (
        <VocabularyPage
          title="Eventos"
          useList={useEvents}
          useCreate={useCreateEvent as never}
          useUpdate={useUpdateEvent as never}
          useDelete={useDeleteEvent as never}
          columns={[
            { header: 'Início', render: (item: Event) => item.start_date ? new Date(item.start_date).toLocaleDateString('pt-BR') : '—' },
            { header: 'Fim',    render: (item: Event) => item.end_date   ? new Date(item.end_date).toLocaleDateString('pt-BR')   : '—' },
          ]}
          CreateForm={({ onSubmit, isLoading }) => <EventForm onSubmit={onSubmit} isLoading={isLoading} />}
          EditForm={({ item, onSubmit, isLoading }) => <EventForm onSubmit={onSubmit} isLoading={isLoading} item={item as Event} />}
        />
      )

    default:
      notFound()
  }
}
