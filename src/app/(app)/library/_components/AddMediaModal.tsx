'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, Loader2, AlertCircle } from 'lucide-react'
import { useCreateMedia } from '@/hooks/api/useMedia'
import { ApiError } from '@/lib/api'

const schema = z.object({
  drive_url:  z.string().url('URL inválida'),
  title:      z.string().max(300, 'Máximo 300 caracteres').optional(),
  caption:    z.string().optional(),
  media_date: z.string().optional(),
  author:     z.string().optional(),
})

type FormValues = z.infer<typeof schema>

interface AddMediaModalProps {
  onClose:   () => void
  onSuccess: () => void
}

export function AddMediaModal({ onClose, onSuccess }: AddMediaModalProps) {
  const createMedia = useCreateMedia()
  const [duplicateId, setDuplicateId] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (values: FormValues) => {
    setDuplicateId(null)
    try {
      await createMedia.mutateAsync({
        drive_url:  values.drive_url,
        title:      values.title || undefined,
        caption:    values.caption || undefined,
        media_date: values.media_date || undefined,
        author:     values.author || undefined,
      })
      onSuccess()
      onClose()
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        const existingId = (err.details as { existing_id?: string })?.existing_id ?? null
        setDuplicateId(existingId)
      }
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-modal shadow-xl w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-brand-text-dark">Adicionar mídia</h2>
          <button onClick={onClose} className="p-1.5 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {/* Duplicate error */}
          {duplicateId && (
            <div className="flex items-start gap-2 rounded-input bg-yellow-50 border border-yellow-200 px-4 py-3 text-sm text-yellow-800">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>
                Esta mídia já está cadastrada.{' '}
                <button
                  type="button"
                  className="underline font-medium"
                  onClick={() => { /* open detail modal */ }}
                >
                  Ver item existente
                </button>
              </span>
            </div>
          )}

          <Field label="URL do Drive *" error={errors.drive_url?.message}>
            <input
              {...register('drive_url')}
              type="url"
              placeholder="https://drive.google.com/..."
              className={inputCls(!!errors.drive_url)}
            />
          </Field>

          <Field label="Título" error={errors.title?.message}>
            <input
              {...register('title')}
              type="text"
              placeholder="Opcional"
              className={inputCls(!!errors.title)}
            />
          </Field>

          <Field label="Legenda">
            <textarea
              {...register('caption')}
              rows={3}
              placeholder="Opcional"
              className={inputCls(false) + ' resize-none'}
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Data da mídia">
              <input {...register('media_date')} type="date" className={inputCls(false)} />
            </Field>
            <Field label="Autor">
              <input {...register('author')} type="text" placeholder="Opcional" className={inputCls(false)} />
            </Field>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-input hover:bg-gray-50 transition-colors">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={createMedia.isPending}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-brand-primary rounded-input hover:bg-brand-primary-hover disabled:opacity-50 transition-colors"
            >
              {createMedia.isPending && <Loader2 size={14} className="animate-spin" />}
              Adicionar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-brand-text-dark">{label}</label>
      {children}
      {error && <p className="text-xs text-brand-error">{error}</p>}
    </div>
  )
}

function inputCls(hasError: boolean) {
  return `w-full rounded-input border ${hasError ? 'border-brand-error' : 'border-brand-border'} px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary`
}
