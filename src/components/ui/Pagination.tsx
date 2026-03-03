import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PaginationProps {
  page:         number
  totalPages:   number
  total:        number
  pageSize:     number
  onPageChange: (page: number) => void
}

export function Pagination({ page, totalPages, total, pageSize, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null

  const from = (page - 1) * pageSize + 1
  const to   = Math.min(page * pageSize, total)

  const pages = buildPages(page, totalPages)

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4">
      <p className="text-sm text-brand-text-muted">
        Exibindo {from}–{to} de {total} mídias
      </p>
      <div className="flex items-center gap-1">
        <PageBtn
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          aria-label="Página anterior"
        >
          <ChevronLeft size={16} />
        </PageBtn>

        {pages.map((p, i) =>
          p === '…' ? (
            <span key={`ellipsis-${i}`} className="px-2 text-gray-400 text-sm select-none">
              …
            </span>
          ) : (
            <PageBtn
              key={p}
              onClick={() => onPageChange(p as number)}
              active={p === page}
            >
              {p}
            </PageBtn>
          )
        )}

        <PageBtn
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          aria-label="Próxima página"
        >
          <ChevronRight size={16} />
        </PageBtn>
      </div>
    </div>
  )
}

function PageBtn({
  children,
  onClick,
  disabled,
  active,
  ...rest
}: {
  children:  React.ReactNode
  onClick:   () => void
  disabled?: boolean
  active?:   boolean
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'min-w-[32px] h-8 px-2 text-sm rounded-md transition-colors',
        active
          ? 'bg-brand-primary text-white font-semibold'
          : 'text-gray-600 hover:bg-gray-100',
        disabled && 'opacity-40 cursor-not-allowed'
      )}
      {...rest}
    >
      {children}
    </button>
  )
}

function buildPages(current: number, total: number): (number | '…')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)

  const pages: (number | '…')[] = []

  if (current <= 4) {
    pages.push(1, 2, 3, 4, 5, '…', total)
  } else if (current >= total - 3) {
    pages.push(1, '…', total - 4, total - 3, total - 2, total - 1, total)
  } else {
    pages.push(1, '…', current - 1, current, current + 1, '…', total)
  }

  return pages
}
