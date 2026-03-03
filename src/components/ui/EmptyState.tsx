import { type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon?:        LucideIcon
  title:        string
  description?: string
  action?:      { label: string; onClick: () => void }
  className?:   string
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 text-center', className)}>
      {Icon && (
        <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-4">
          <Icon size={24} className="text-gray-400" />
        </div>
      )}
      <h3 className="text-base font-semibold text-brand-text-dark">{title}</h3>
      {description && (
        <p className="text-sm text-brand-text-muted mt-1 max-w-sm">{description}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="mt-4 px-4 py-2 text-sm font-medium rounded-input bg-brand-primary text-white hover:bg-brand-primary-hover transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
