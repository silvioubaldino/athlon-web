'use client'

import { useState } from 'react'
import { X, ExternalLink, Copy, Check, Image } from 'lucide-react'
import { useMediaDetail } from '@/hooks/api/useMedia'
import { cn } from '@/lib/utils'

interface MediaDetailModalProps {
  mediaId: string | null
  onClose: () => void
}

export function MediaDetailModal({ mediaId, onClose }: MediaDetailModalProps) {
  const { data: media, isLoading } = useMediaDetail(mediaId)
  const [copied, setCopied] = useState(false)

  if (!mediaId) return null

  const copyLink = async () => {
    if (!media) return
    await navigator.clipboard.writeText(media.drive_url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-modal shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h2 className="text-lg font-semibold text-brand-text-dark">Detalhes da mídia</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {isLoading ? (
            <ModalSkeleton />
          ) : !media ? (
            <p className="text-center text-gray-400 py-8">Mídia não encontrada.</p>
          ) : (
            <div className="space-y-6">
              {/* Thumbnail placeholder */}
              <div className="w-full aspect-video bg-gray-100 rounded-card flex items-center justify-center overflow-hidden">
                {media.thumbnail_url ? (
                  <img 
                    src={media.thumbnail_url} 
                    alt={media.title || 'Thumbnail'} 
                    className="w-full h-full object-contain"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <Image size={40} className="text-gray-300" />
                )}
              </div>

              {/* URL */}
              <div>
                <Label>Link do Drive</Label>
                <div className="flex items-center gap-2 mt-1">
                  <a
                    href={media.drive_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-brand-primary hover:underline flex items-center gap-1 truncate"
                  >
                    <ExternalLink size={13} />
                    {media.drive_url}
                  </a>
                  <button
                    onClick={copyLink}
                    className="shrink-0 flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 border border-gray-200 px-2 py-1 rounded transition-colors"
                  >
                    {copied ? <Check size={12} className="text-green-600" /> : <Copy size={12} />}
                    {copied ? 'Copiado' : 'Copiar'}
                  </button>
                </div>
              </div>

              {/* Metadata */}
              <div className="grid grid-cols-2 gap-4">
                <Field label="Título"    value={media.title}    />
                <Field label="Autor"     value={media.author}   />
                <Field label="Data"      value={media.media_date ? new Date(media.media_date).toLocaleDateString('pt-BR') : undefined} />
                <Field label="Classificada" value={media.classified ? 'Sim' : 'Não'} />
              </div>

              {/* Caption */}
              {media.caption && (
                <div>
                  <Label>Legenda</Label>
                  <p className="mt-1 text-sm text-brand-text-muted whitespace-pre-wrap">{media.caption}</p>
                </div>
              )}

              {/* Tags */}
              {(media.funding_sources?.length ?? 0) > 0 && (
                <TagSection label="Fontes de Renda" items={(media.funding_sources ?? []).map((f) => f.name)} color="purple" />
              )}
              {(media.projects?.length ?? 0) > 0 && (
                <TagSection label="Projetos" items={(media.projects ?? []).map((p) => p.name)} color="blue" />
              )}
              {(media.sports?.length ?? 0) > 0 && (
                <TagSection label="Modalidades" items={(media.sports ?? []).map((s) => s.name)} color="green" />
              )}
              {(media.athletes?.length ?? 0) > 0 && (
                <TagSection label="Atletas" items={(media.athletes ?? []).map((a) => a.name)} color="orange" />
              )}
              {(media.events?.length ?? 0) > 0 && (
                <TagSection label="Eventos" items={(media.events ?? []).map((e) => e.name)} color="pink" />
              )}

              {/* Audit */}
              <div className="pt-4 border-t border-gray-100 grid grid-cols-2 gap-2 text-xs text-gray-400">
                <span>Criado por: {media.created_by}</span>
                <span>Criado em: {new Date(media.created_at).toLocaleDateString('pt-BR')}</span>
                <span className="col-span-2">
                  Atualizado em: {new Date(media.updated_at).toLocaleDateString('pt-BR')}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Label({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{children}</p>
}

function Field({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <Label>{label}</Label>
      <p className="mt-0.5 text-sm text-brand-text-dark">{value ?? <span className="text-gray-300 italic">—</span>}</p>
    </div>
  )
}

const tagColors: Record<string, string> = {
  purple: 'bg-purple-50 text-purple-700',
  blue:   'bg-blue-50 text-blue-700',
  green:  'bg-green-50 text-green-700',
  orange: 'bg-orange-50 text-orange-700',
  pink:   'bg-pink-50 text-pink-700',
}

function TagSection({ label, items, color }: { label: string; items: string[]; color: string }) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="flex flex-wrap gap-1.5 mt-1.5">
        {items.map((item) => (
          <span key={item} className={cn('text-xs px-2 py-0.5 rounded-md font-medium', tagColors[color] ?? tagColors.blue)}>
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}

function ModalSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="w-full aspect-video bg-gray-200 rounded-card" />
      <div className="h-4 bg-gray-200 rounded w-2/3" />
      <div className="grid grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="space-y-1">
            <div className="h-3 bg-gray-100 rounded w-1/3" />
            <div className="h-4 bg-gray-200 rounded w-2/3" />
          </div>
        ))}
      </div>
    </div>
  )
}
