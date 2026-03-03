'use client'

import { useEffect } from 'react'

interface ShortcutHandlers {
  onSaveAndNext: () => void
  onSave:        () => void
  onSkip:        () => void
  onOpenDrive:   () => void
  isDirty:       boolean
}

function isTyping(): boolean {
  const el = document.activeElement
  if (!el) return false
  const tag = el.tagName.toLowerCase()
  return tag === 'input' || tag === 'textarea' || (el as HTMLElement).isContentEditable
}

export function useClassificationShortcuts({
  onSaveAndNext, onSave, onSkip, onOpenDrive, isDirty,
}: ShortcutHandlers) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (isTyping()) return

      const meta = e.metaKey || e.ctrlKey

      if (meta && e.key === 'Enter') { e.preventDefault(); onSaveAndNext(); return }
      if (e.key === 'ArrowRight')    { e.preventDefault(); onSaveAndNext(); return }
      if (e.key === 's' || e.key === 'S') { e.preventDefault(); if (isDirty) onSave(); return }
      if (e.key === 'p' || e.key === 'P') { e.preventDefault(); onSkip(); return }
      if (e.key === 'o' || e.key === 'O') { e.preventDefault(); onOpenDrive(); return }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onSaveAndNext, onSave, onSkip, onOpenDrive, isDirty])
}
