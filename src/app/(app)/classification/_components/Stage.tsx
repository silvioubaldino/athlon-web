'use client'

import { useEffect, useRef } from 'react'
import { ExternalLink, Image } from 'lucide-react'
import type { Media } from '@/types/api'

interface StageProps {
  media:           Media
  title:           string
  caption:         string
  onTitleChange:   (v: string) => void
  onCaptionChange: (v: string) => void
  imageUrl?:       string
}

export function Stage({ media, title, caption, onTitleChange, onCaptionChange, imageUrl }: StageProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = `${ta.scrollHeight}px`
  }, [caption])

  const displayDate = media.media_date
    ? new Date(media.media_date).toLocaleDateString('pt-BR')
    : null

  return (
    <div className="flex-1 flex flex-col gap-4 min-w-0">
      {/* Image Preview */}
      <div
        className="w-full rounded-card overflow-hidden flex items-center justify-center bg-gray-100 relative"
        style={{
          maxHeight: '70vh',
          minHeight: 200,
        }}
      >
        {imageUrl || media.drive_url ? (
          <img
            src={imageUrl || media.drive_url}
            alt="Mídia"
            className="w-full h-full object-contain max-h-[70vh]"
          />
        ) : (
          <div className="bg-white/80 rounded-full p-6">
            <Image size={48} className="text-gray-300" />
          </div>
        )}
      </div>

      {/* Editable title */}
      <input
        type="text"
        value={title}
        onChange={(e) => onTitleChange(e.target.value)}
        placeholder="Título da mídia..."
        className="text-xl font-semibold text-brand-text-dark bg-transparent border-b border-transparent hover:border-gray-200 focus:border-brand-primary focus:outline-none pb-1 transition-colors w-full"
      />

      {/* Editable caption */}
      <textarea
        ref={textareaRef}
        value={caption}
        onChange={(e) => onCaptionChange(e.target.value)}
        placeholder="Legenda..."
        rows={2}
        className="text-sm text-brand-text-muted bg-transparent border border-transparent hover:border-gray-200 focus:border-brand-primary focus:outline-none rounded-input px-2 py-1 resize-none transition-colors w-full"
      />

      {/* Metadata row */}
      <div className="flex items-center gap-3 text-sm text-brand-text-muted">
        {displayDate && <span>{displayDate}</span>}
        {media.author && <span>• {media.author}</span>}
        <a
          href={media.drive_url}
          target="_blank"
          rel="noreferrer"
          className="ml-auto flex items-center gap-1 text-brand-primary hover:underline text-xs"
        >
          <ExternalLink size={12} />
          Abrir no Drive
        </a>
      </div>
    </div>
  )
}
