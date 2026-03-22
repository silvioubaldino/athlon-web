'use client'

import { Suspense, useState } from 'react'
import { Plus, Image, RefreshCw } from 'lucide-react'
import { useMediaList } from '@/hooks/api/useMedia'
import { MediaCard } from '@/components/media/MediaCard'
import { MediaCardSkeleton } from '@/components/media/MediaCardSkeleton'
import { MediaDetailModal } from '@/components/media/MediaDetailModal'
import { EmptyState } from '@/components/ui/EmptyState'
import { Pagination } from '@/components/ui/Pagination'
import { FilterBar } from './_components/FilterBar'
import { AddMediaModal } from './_components/AddMediaModal'
import { useLibraryFilters } from './_hooks/useLibraryFilters'

function LibraryContent() {
  const { filters, setFilter, clearAll, activeCount, toApiParams } = useLibraryFilters()
  const { data, isLoading, isError, refetch } = useMediaList(toApiParams())
  const [selectedMediaId, setSelectedMediaId] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)

  return (
    <div>
      {/* Page header */}
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold text-brand-text-dark">Biblioteca</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-brand-primary rounded-input hover:bg-brand-primary-hover transition-colors"
        >
          <Plus size={16} />
          Adicionar mídia
        </button>
      </div>

      <FilterBar
        filters={filters}
        setFilter={setFilter}
        clearAll={clearAll}
        activeCount={activeCount}
      />

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <MediaCardSkeleton key={i} />)}
        </div>
      ) : isError ? (
        <EmptyState
          icon={RefreshCw}
          title="Erro ao carregar mídias"
          description="Tente novamente ou verifique sua conexão."
          action={{ label: 'Tentar novamente', onClick: () => refetch() }}
        />
      ) : !data || !data.items || data.items.length === 0 ? (
        <EmptyState
          icon={Image}
          title="Nenhuma mídia encontrada"
          description={activeCount > 0 ? 'Ajuste os filtros ou limpe a busca.' : 'Comece adicionando links na Biblioteca.'}
          action={activeCount > 0 ? { label: 'Limpar filtros', onClick: clearAll } : undefined}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {data.items.map((media) => (
              <MediaCard
                key={media.id}
                media={media}
                onOpenDetail={setSelectedMediaId}
              />
            ))}
          </div>

          <Pagination
            page={filters.page}
            totalPages={data.pages}
            total={data.total}
            pageSize={filters.pageSize}
            onPageChange={(p) => setFilter('page', p)}
          />
        </>
      )}

      {/* Modals */}
      <MediaDetailModal
        mediaId={selectedMediaId}
        onClose={() => setSelectedMediaId(null)}
      />

      {showAddModal && (
        <AddMediaModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {}}
        />
      )}
    </div>
  )
}

export default function LibraryPage() {
  return (
    <Suspense>
      <LibraryContent />
    </Suspense>
  )
}
