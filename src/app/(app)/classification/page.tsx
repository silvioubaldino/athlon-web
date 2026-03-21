'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, FolderOpen, Library } from 'lucide-react'
import Link from 'next/link'
import Script from 'next/script'
import { useCreateMedia, useUpdateMedia } from '@/hooks/api/useMedia'
import { useProjects } from '@/hooks/api/useProjects'
import { useSports } from '@/hooks/api/useSports'
import { useAthletes } from '@/hooks/api/useAthletes'
import { useEvents } from '@/hooks/api/useEvents'
import { EmptyState } from '@/components/ui/EmptyState'
import { Stage } from './_components/Stage'
import { ClassificationDock } from './_components/ClassificationDock'
import { useClassification, ClassificationState } from './_hooks/useClassification'
import { useClassificationShortcuts } from './_hooks/useClassificationShortcuts'
import { useGoogleDrive, DriveFile } from '@/hooks/useGoogleDrive'
import type { Media } from '@/types/api'
import { toast } from 'sonner'

export default function ClassificationPage() {
  const [driveFiles, setDriveFiles] = useState<DriveFile[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)

  const { openPicker, fetchFilesInFolder, isLoadingFiles } = useGoogleDrive()
  const createMedia = useCreateMedia()
  const updateMedia = useUpdateMedia()
  
  const [isSaving, setIsSaving] = useState(false)
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false)

  // Map current DriveFile to a pseudo Media object so `useClassification` can work
  const currentFile = driveFiles[currentIndex]
  const pseudoMedia: Media | undefined = currentFile
    ? {
        id: currentFile.id,
        drive_url: currentFile.webViewLink,
        title: currentFile.name,
        classified: false,
        projects: [],
        sports: [],
        athletes: [],
        events: [],
        funding_sources: [],
        created_by: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    : undefined

  const { state, setValue, reset, isDirty, derivedFundingSources, allowedSportIds } =
    useClassification(pseudoMedia)

  const { data: allProjects = [] } = useProjects()
  const { data: allSports   = [] } = useSports()
  const { data: athletes    = [] } = useAthletes()
  const { data: events      = [] } = useEvents()

  const projectOptions = allProjects.map((p) => ({ value: p.id, label: p.name }))
  const sportOptions   = allSports.map((s)   => ({ value: s.id, label: s.name }))
  const athleteOptions = athletes.map((a)    => ({ value: a.id, label: a.name }))
  const eventOptions   = events.map((e)      => ({ value: e.id, label: e.name }))

  const handleSave = async (advance = false) => {
    if (!pseudoMedia) return
    setIsSaving(true)
    try {
      // Step 1: Create Media with Drive URL
      const created = await createMedia.mutateAsync({
        drive_url: pseudoMedia.drive_url,
        title: state.title || undefined,
        caption: state.caption || undefined,
        media_date: state.mediaDate || undefined,
        author: state.author || undefined,
      })

      // Step 2: Update classifications (project, sport, athlete, event) and set classified=true
      // Note: Backend might automatically infer 'classified: true' based on the update, or we send it.
      await updateMedia.mutateAsync({
        id: created.id,
        req: {
          project_ids: state.projectIds.length > 0 ? state.projectIds : undefined,
          sport_ids: state.sportIds.length > 0 ? state.sportIds : undefined,
          athlete_ids: state.athleteIds.length > 0 ? state.athleteIds : undefined,
          event_ids: state.eventIds.length > 0 ? state.eventIds : undefined,
          // Since UpdateMediaRequest doesn't explicitly expose 'classified', the backend
          // presumably computes it, or the initial POST does. We send the tags at least.
        },
      })
      
      toast.success('Mídia importada e classificada com sucesso!')

      if (advance) {
        handleNextFile()
      } else {
        // Just remove from list and keep index? Or advance?
        handleNextFile()
      }
    } catch (e) {
      toast.error('Erro ao salvar classificação da mídia.')
      console.error(e)
    } finally {
      setIsSaving(false)
    }
  }

  const handleNextFile = () => {
    // Remove current file from the pending array to clear memory and step forward
    setDriveFiles((prev) => prev.filter((_, i) => i !== currentIndex))
    // We stay at the same index because the array shifted left
    // Re-run reset on pseudoMedia when it updates!
    reset()
  }

  const handleSkip = () => {
    // Skip without saving
    handleNextFile()
  }

  useClassificationShortcuts({
    onSaveAndNext: () => handleSave(true),
    onSave:        () => handleSave(false),
    onSkip:        handleSkip,
    onOpenDrive:   () => pseudoMedia && window.open(pseudoMedia.drive_url, '_blank'),
    isDirty,
  })

  // Start Picker
  const handleImportDrive = () => {
    openPicker(async (folderId: string) => {
      try {
        const files = await fetchFilesInFolder(folderId)
        if (files.length === 0) {
          toast.info('Nenhuma imagem encontrada nesta pasta.')
          return
        }
        setDriveFiles(files)
        setCurrentIndex(0)
      } catch (err) {
        toast.error('Ocorreu um erro ao listar as imagens.')
      }
    })
  }

  // Scripts ready state
  const [googleScriptsLoaded, setGoogleScriptsLoaded] = useState(false)

  const Scripts = (
    <>
      <Script 
        src="https://apis.google.com/js/api.js" 
        strategy="lazyOnload" 
        onLoad={() => setGoogleScriptsLoaded(true)} 
      />
      <Script 
        src="https://accounts.google.com/gsi/client" 
        strategy="lazyOnload" 
        onLoad={() => setGoogleScriptsLoaded(true)} 
      />
    </>
  )

  // Loading fetching files
  if (isLoadingFiles) {
    return (
      <div className="flex items-center justify-center py-32">
        {Scripts}
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-4 border-brand-primary border-t-transparent animate-spin" />
          <p className="text-brand-text-muted">Buscando imagens do Google Drive...</p>
        </div>
      </div>
    )
  }

  // Not classifying anything right now
  if (driveFiles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        {Scripts}
        <div className="text-center">
          <EmptyState
            icon={FolderOpen}
            title="Importe mídias do Google Drive"
            description="Selecione um diretório para classificar em lote."
          />

          <button 
            onClick={handleImportDrive}
            className="mt-6 px-4 py-2 inline-flex items-center gap-2 text-sm font-semibold text-white bg-brand-primary rounded-input hover:bg-brand-primary-hover transition-colors"
          >
            Importar Diretório
          </button>
        </div>
      </div>
    )
  }

      // Classifying current file
  return (
    <div className="pb-32">
      {Scripts}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-brand-text-dark">Classificação em Lote (Drive)</h1>
        <span className="text-sm text-brand-text-muted bg-white border border-gray-200 rounded-full px-3 py-1 font-mono">
          {driveFiles.length} pendente(s)
        </span>
      </div>

      <div className="max-w-3xl mx-auto">
        {pseudoMedia && (
          <Stage
            media={pseudoMedia}
            imageUrl={currentFile.thumbnailLink?.replace('=s220', '=s800')}
            title={state.title ?? ''}
            caption={state.caption ?? ''}
            onTitleChange={(v) => setValue('title', v)}
            onCaptionChange={(v) => setValue('caption', v)}
          />
        )}
      </div>

      <ClassificationDock
        state={state}
        setValue={setValue}
        isDirty={isDirty}
        isSaving={isSaving}
        isLast={driveFiles.length === 1}
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
