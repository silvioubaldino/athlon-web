'use client'

import { useState } from 'react'
import { CheckCircle, Library } from 'lucide-react'
import Link from 'next/link'
import { useNextUnclassified, useUpdateMedia } from '@/hooks/api/useMedia'
import { useProjects } from '@/hooks/api/useProjects'
import { useSports } from '@/hooks/api/useSports'
import { useAthletes } from '@/hooks/api/useAthletes'
import { useEvents } from '@/hooks/api/useEvents'
import { EmptyState } from '@/components/ui/EmptyState'
import { Stage } from './_components/Stage'
import { ClassificationDock } from './_components/ClassificationDock'
import { useClassification } from './_hooks/useClassification'
import { useClassificationShortcuts } from './_hooks/useClassificationShortcuts'

export default function ClassificationPage() {
  const { data: media, isLoading, error, refetch } = useNextUnclassified()
  const updateMedia = useUpdateMedia()
  const [isSaving, setIsSaving] = useState(false)
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false)

  const { state, setValue, reset, isDirty, derivedFundingSources, allowedSportIds } =
    useClassification(media)

  const { data: allProjects = [] } = useProjects()
  const { data: allSports   = [] } = useSports()
  const { data: athletes    = [] } = useAthletes()
  const { data: events      = [] } = useEvents()

  const projectOptions = allProjects.map((p) => ({ value: p.id, label: p.name }))
  const sportOptions   = allSports.map((s)   => ({ value: s.id, label: s.name }))
  const athleteOptions = athletes.map((a)    => ({ value: a.id, label: a.name }))
  const eventOptions   = events.map((e)      => ({ value: e.id, label: e.name }))

  const handleSave = async (advance = false) => {
    if (!media || !isDirty) return
    setIsSaving(true)
    try {
      await updateMedia.mutateAsync({
        id: media.id,
        req: {
          title:       state.title       || undefined,
          caption:     state.caption     || undefined,
          media_date:  state.mediaDate   || undefined,
          author:      state.author      || undefined,
          project_ids: state.projectIds,
          sport_ids:   state.sportIds,
          athlete_ids: state.athleteIds,
          event_ids:   state.eventIds,
        },
      })
      if (advance) refetch()
    } finally {
      setIsSaving(false)
    }
  }

  const handleSkip = () => refetch()

  useClassificationShortcuts({
    onSaveAndNext: () => handleSave(true),
    onSave:        () => handleSave(false),
    onSkip:        handleSkip,
    onOpenDrive:   () => media && window.open(media.drive_url, '_blank'),
    isDirty,
  })

  // Loading
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-10 h-10 rounded-full border-4 border-brand-primary border-t-transparent animate-spin" />
      </div>
    )
  }

  // Empty — all classified
  const is404 = (error as { status?: number })?.status === 404 || (!isLoading && !media)
  if (is404) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center">
          <EmptyState
            icon={CheckCircle}
            title="Todas as mídias foram classificadas!"
            description="Não há itens pendentes de classificação."
          />
          <Link href="/library" className="inline-flex items-center gap-1 text-sm text-brand-primary hover:underline">
            <Library size={14} />
            Ver Biblioteca
          </Link>
        </div>
      </div>
    )
  }

  if (!media) return null

  return (
    <div className="pb-32">
      {/* Progress header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-brand-text-dark">Classificação</h1>
        <span className="text-sm text-brand-text-muted bg-white border border-gray-200 rounded-full px-3 py-1">
          Próxima disponível
        </span>
      </div>

      {/* Stage */}
      <div className="max-w-3xl mx-auto">
        <Stage
          media={media}
          title={state.title ?? ''}
          caption={state.caption ?? ''}
          onTitleChange={(v) => setValue('title', v)}
          onCaptionChange={(v) => setValue('caption', v)}
        />
      </div>

      {/* Dock */}
      <ClassificationDock
        state={state}
        setValue={setValue}
        isDirty={isDirty}
        isSaving={isSaving}
        isLast={false}
        derivedFundingSources={derivedFundingSources}
        allowedSportIds={allowedSportIds}
        projectOptions={projectOptions}
        sportOptions={sportOptions}
        athleteOptions={athleteOptions}
        eventOptions={eventOptions}
        onSaveAndNext={() => handleSave(true)}
        onSave={() => handleSave(false)}
        onSkip={handleSkip}
        onReset={reset}
      />

      {/* Unsaved dialog */}
      {showUnsavedDialog && (
        <UnsavedDialog
          onSaveAndContinue={async () => { await handleSave(true); setShowUnsavedDialog(false) }}
          onDiscardAndContinue={() => { reset(); setShowUnsavedDialog(false); handleSkip() }}
          onCancel={() => setShowUnsavedDialog(false)}
        />
      )}
    </div>
  )
}

function UnsavedDialog({
  onSaveAndContinue, onDiscardAndContinue, onCancel,
}: {
  onSaveAndContinue:   () => void
  onDiscardAndContinue: () => void
  onCancel:            () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onCancel} />
      <div className="relative bg-white rounded-modal shadow-xl w-full max-w-md p-6">
        <h3 className="text-base font-semibold text-brand-text-dark mb-2">
          Alterações não salvas
        </h3>
        <p className="text-sm text-brand-text-muted mb-6">
          Você tem alterações não salvas. Deseja salvar antes de continuar?
        </p>
        <div className="flex justify-end gap-2">
          <button onClick={onCancel} className="px-3 py-2 text-sm text-gray-600 border border-gray-200 rounded-input hover:bg-gray-50">
            Cancelar
          </button>
          <button onClick={onDiscardAndContinue} className="px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-input">
            Descartar e continuar
          </button>
          <button onClick={onSaveAndContinue} className="px-3 py-2 text-sm font-semibold text-white bg-brand-primary rounded-input hover:bg-brand-primary-hover">
            Salvar e continuar
          </button>
        </div>
      </div>
    </div>
  )
}
