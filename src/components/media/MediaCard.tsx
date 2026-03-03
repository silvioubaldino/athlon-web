'use client'

import { useState } from 'react'
import { Image, ExternalLink, Copy, Download, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { MediaListItem } from '@/types/api'

interface MediaCardProps {
  media:        MediaListItem
  onOpenDetail: (id: string) => void
}

export function MediaCard({ media, onOpenDetail }: MediaCardProps) {
  const [copied, setCopied] = useState(false)

  const copyLink = async (e: React.MouseEvent) => {
    e.stopPropagation()
    await navigator.clipboard.writeText(media.drive_url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const openDrive = (e: React.MouseEvent) => {
    e.stopPropagation()
    window.open(media.drive_url, '_blank')
  }

  const displayDate = media.media_date
    ? new Date(media.media_date).toLocaleDateString('pt-BR')
    : null

  const visibleProjects = media.projects.slice(0, 3)

  return (
    <div
      onClick={() => onOpenDetail(media.id)}
      className="group bg-white rounded-card border border-gray-200 shadow-card hover:shadow-md hover:border-gray-300 transition-all cursor-pointer overflow-hidden"
    >
      <div className="flex sm:flex-col">
        {/* Thumbnail */}
        <div className="w-24 sm:w-full aspect-square sm:aspect-video bg-gray-100 flex items-center justify-center shrink-0">
          <Image size={28} className="text-gray-300" />
        </div>

        {/* Content */}
        <div className="flex-1 p-3 min-w-0">
          {/* Action rail */}
          <div className="flex gap-1 mb-2" onClick={(e) => e.stopPropagation()}>
            <ActionBtn onClick={openDrive} title="Abrir no Drive">
              <ExternalLink size={13} />
            </ActionBtn>
            <ActionBtn onClick={copyLink} title={copied ? 'Copiado!' : 'Copiar link'}>
              {copied ? <Check size={13} className="text-green-600" /> : <Copy size={13} />}
            </ActionBtn>
            <ActionBtn
              onClick={(e) => { e.stopPropagation(); window.open(media.drive_url) }}
              title="Download indisponível nesta versão"
              disabled
            >
              <Download size={13} />
            </ActionBtn>
          </div>

          {/* Title */}
          <p className="text-sm font-medium text-brand-text-dark line-clamp-2 leading-snug">
            {media.title ?? <span className="text-gray-400 italic">Sem título</span>}
          </p>

          {/* Date */}
          {displayDate && (
            <p className="text-xs text-brand-text-muted mt-1">{displayDate}</p>
          )}

          {/* Project tags */}
          {visibleProjects.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {visibleProjects.map((p) => (
                <span
                  key={p.id}
                  className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-md"
                >
                  {p.name}
                </span>
              ))}
              {media.projects.length > 3 && (
                <span className="text-xs text-gray-400">+{media.projects.length - 3}</span>
              )}
            </div>
          )}

          {/* Classified badge */}
          {!media.classified && (
            <span className="inline-block mt-2 text-xs bg-yellow-50 text-yellow-700 border border-yellow-200 px-1.5 py-0.5 rounded-md">
              Não classificada
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

function ActionBtn({
  children, onClick, title, disabled,
}: {
  children:  React.ReactNode
  onClick:   (e: React.MouseEvent) => void
  title:     string
  disabled?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        'p-1.5 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors',
        disabled && 'opacity-40 cursor-not-allowed'
      )}
    >
      {children}
    </button>
  )
}
