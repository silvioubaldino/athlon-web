'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CalendarIcon, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface DateRange {
  from?: Date
  to?:   Date
}

interface DateRangePickerProps {
  value?:    DateRange
  onChange:  (range: DateRange) => void
  disabled?: boolean
  className?: string
}

export function DateRangePicker({ value, onChange, disabled, className }: DateRangePickerProps) {
  const [open, setOpen] = useState(false)
  const [hovered, setHovered] = useState<Date | null>(null)
  const [selecting, setSelecting] = useState<'from' | 'to'>('from')

  const [viewMonth, setViewMonth] = useState(() => {
    const d = new Date()
    return { year: d.getFullYear(), month: d.getMonth() }
  })

  const from = value?.from
  const to   = value?.to

  const label = from && to
    ? `${format(from, 'dd/MM/yyyy')} – ${format(to, 'dd/MM/yyyy')}`
    : from
    ? `${format(from, 'dd/MM/yyyy')} – ...`
    : 'Selecionar período'

  const handleDayClick = (day: Date) => {
    if (selecting === 'from' || !from) {
      onChange({ from: day, to: undefined })
      setSelecting('to')
    } else {
      if (day < from) {
        onChange({ from: day, to: from })
      } else {
        onChange({ from, to: day })
      }
      setSelecting('from')
      setOpen(false)
    }
  }

  const clear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange({})
    setSelecting('from')
  }

  const daysInMonth = (year: number, month: number) =>
    new Date(year, month + 1, 0).getDate()

  const firstDayOfMonth = (year: number, month: number) =>
    new Date(year, month, 1).getDay()

  const { year, month } = viewMonth
  const totalDays   = daysInMonth(year, month)
  const startOffset = firstDayOfMonth(year, month)

  const prevMonth = () => {
    setViewMonth((v) => {
      if (v.month === 0) return { year: v.year - 1, month: 11 }
      return { year: v.year, month: v.month - 1 }
    })
  }

  const nextMonth = () => {
    setViewMonth((v) => {
      if (v.month === 11) return { year: v.year + 1, month: 0 }
      return { year: v.year, month: v.month + 1 }
    })
  }

  const monthLabel = format(new Date(year, month, 1), 'MMMM yyyy', { locale: ptBR })

  return (
    <div className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => !disabled && setOpen((v) => !v)}
        disabled={disabled}
        className={cn(
          'flex items-center gap-2 rounded-input border border-brand-border bg-white px-3 py-2 text-sm transition-colors w-full',
          open && 'ring-2 ring-brand-primary border-brand-primary',
          (from || to) ? 'text-brand-text-dark' : 'text-gray-400',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <CalendarIcon size={14} className="text-gray-400 shrink-0" />
        <span className="flex-1 text-left">{label}</span>
        {(from || to) && (
          <X size={13} className="text-gray-400 hover:text-gray-600" onClick={clear} />
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute z-20 mt-1 bg-white border border-gray-200 rounded-card shadow-card p-4 w-72">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <button onClick={prevMonth} className="p-1 rounded hover:bg-gray-100 text-gray-500 text-sm">‹</button>
              <span className="text-sm font-medium text-gray-700 capitalize">{monthLabel}</span>
              <button onClick={nextMonth} className="p-1 rounded hover:bg-gray-100 text-gray-500 text-sm">›</button>
            </div>

            {/* Day names */}
            <div className="grid grid-cols-7 mb-1">
              {['D','S','T','Q','Q','S','S'].map((d, i) => (
                <div key={i} className="text-center text-xs text-gray-400 py-1">{d}</div>
              ))}
            </div>

            {/* Days */}
            <div className="grid grid-cols-7 gap-y-0.5">
              {Array.from({ length: startOffset }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}
              {Array.from({ length: totalDays }).map((_, i) => {
                const day    = new Date(year, month, i + 1)
                const isFrom = from && isSameDay(day, from)
                const isTo   = to   && isSameDay(day, to)
                const isInRange = from && to && day > from && day < to
                const isHoverRange = from && !to && hovered && day > from && day <= hovered

                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleDayClick(day)}
                    onMouseEnter={() => setHovered(day)}
                    onMouseLeave={() => setHovered(null)}
                    className={cn(
                      'text-xs h-8 w-full rounded transition-colors',
                      (isFrom || isTo) && 'bg-brand-primary text-white font-semibold',
                      (isInRange || isHoverRange) && !isFrom && !isTo && 'bg-blue-50 text-blue-700',
                      !isFrom && !isTo && !isInRange && !isHoverRange && 'hover:bg-gray-100 text-gray-700'
                    )}
                  >
                    {i + 1}
                  </button>
                )
              })}
            </div>

            <p className="text-xs text-gray-400 text-center mt-3">
              {selecting === 'from' ? 'Selecione a data inicial' : 'Selecione a data final'}
            </p>
          </div>
        </>
      )}
    </div>
  )
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth()    === b.getMonth()    &&
    a.getDate()     === b.getDate()
  )
}
