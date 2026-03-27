'use client'

import { useState } from 'react'
import { Plus, Pencil, Trash2, Loader2, X } from 'lucide-react'
import { EmptyState } from '@/components/ui/EmptyState'
import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query'
import type { ApiError } from '@/lib/api'

export interface ColumnDef<T> {
  header:  string
  render:  (item: T) => React.ReactNode
  width?:  string
}

interface VocabularyPageProps<T extends { id: string; name: string }> {
  title:        string
  useList:      () => UseQueryResult<T[]>
  useCreate:    () => UseMutationResult<T, ApiError, Record<string, unknown>>
  useUpdate:    () => UseMutationResult<T, ApiError, { id: string; req: Record<string, unknown> }>
  useDelete:    () => UseMutationResult<void, ApiError, string>
  columns?:     ColumnDef<T>[]
  CreateForm:   React.ComponentType<{ onSubmit: (data: Record<string, unknown>) => void; isLoading: boolean }>
  EditForm:     React.ComponentType<{ item: T; onSubmit: (data: Record<string, unknown>) => void; isLoading: boolean }>
}

export function VocabularyPage<T extends { id: string; name: string }>({
  title, useList, useCreate, useUpdate, useDelete,
  columns = [], CreateForm, EditForm,
}: VocabularyPageProps<T>) {
  const { data: itemsData = [], isLoading } = useList()
  const items = itemsData ?? []
  const createMutation = useCreate()
  const updateMutation = useUpdate()
  const deleteMutation = useDelete()

  const [showCreate, setShowCreate] = useState(false)
  const [editItem,   setEditItem]   = useState<T | null>(null)
  const [deleteItem, setDeleteItem] = useState<T | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const handleCreate = async (data: Record<string, unknown>) => {
    await createMutation.mutateAsync(data)
    setShowCreate(false)
  }

  const handleUpdate = async (data: Record<string, unknown>) => {
    if (!editItem) return
    await updateMutation.mutateAsync({ id: editItem.id, req: data })
    setEditItem(null)
  }

  const handleDelete = async () => {
    if (!deleteItem) return
    setDeleteError(null)
    try {
      await deleteMutation.mutateAsync(deleteItem.id)
      setDeleteItem(null)
    } catch (err) {
      setDeleteError((err as Error).message)
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-brand-text-dark">{title}</h1>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-brand-primary rounded-input hover:bg-brand-primary-hover transition-colors"
        >
          <Plus size={15} />
          Adicionar
        </button>
      </div>

      {/* Table */}
      {isLoading ? (
        <TableSkeleton cols={columns.length + 2} />
      ) : items.length === 0 ? (
        <EmptyState
          title={`Nenhum(a) ${title.toLowerCase()} cadastrado(a)`}
          action={{ label: 'Adicionar', onClick: () => setShowCreate(true) }}
        />
      ) : (
        <div className="bg-white rounded-card border border-gray-200 shadow-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-4 py-3 font-medium text-gray-600">Nome</th>
                {columns.map((col) => (
                  <th key={col.header} className={`text-left px-4 py-3 font-medium text-gray-600 ${col.width ?? ''}`}>
                    {col.header}
                  </th>
                ))}
                <th className="text-right px-4 py-3 font-medium text-gray-600 w-24">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-brand-text-dark font-medium">{item.name}</td>
                  {columns.map((col) => (
                    <td key={col.header} className="px-4 py-3 text-brand-text-muted">
                      {col.render(item)}
                    </td>
                  ))}
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => setEditItem(item)}
                        className="p-1.5 rounded text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        title="Editar"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => setDeleteItem(item)}
                        className="p-1.5 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Excluir"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create modal */}
      {showCreate && (
        <Modal title={`Adicionar ${title}`} onClose={() => setShowCreate(false)}>
          <CreateForm
            onSubmit={handleCreate}
            isLoading={createMutation.isPending}
          />
        </Modal>
      )}

      {/* Edit modal */}
      {editItem && (
        <Modal title={`Editar ${title}`} onClose={() => setEditItem(null)}>
          <EditForm
            item={editItem}
            onSubmit={handleUpdate}
            isLoading={updateMutation.isPending}
          />
        </Modal>
      )}

      {/* Delete confirmation */}
      {deleteItem && (
        <Modal title="Confirmar exclusão" onClose={() => { setDeleteItem(null); setDeleteError(null) }}>
          <div className="space-y-4">
            <p className="text-sm text-brand-text-muted">
              Deseja excluir <strong>{deleteItem.name}</strong>? Esta ação não pode ser desfeita.
            </p>
            {deleteError && (
              <p className="text-sm text-brand-error bg-red-50 border border-red-200 rounded-input px-3 py-2">
                {deleteError}
              </p>
            )}
            <div className="flex justify-end gap-2">
              <button
                onClick={() => { setDeleteItem(null); setDeleteError(null) }}
                className="px-3 py-2 text-sm text-gray-600 border border-gray-200 rounded-input hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-white bg-red-600 rounded-input hover:bg-red-700 disabled:opacity-50"
              >
                {deleteMutation.isPending && <Loader2 size={13} className="animate-spin" />}
                Excluir
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-modal shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-base font-semibold text-brand-text-dark">{title}</h2>
          <button onClick={onClose} className="p-1.5 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100">
            <X size={16} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

function TableSkeleton({ cols }: { cols: number }) {
  return (
    <div className="bg-white rounded-card border border-gray-200 shadow-card overflow-hidden animate-pulse">
      <div className="h-10 bg-gray-50 border-b border-gray-200" />
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex gap-4 px-4 py-3 border-b border-gray-100">
          {[...Array(cols)].map((_, j) => (
            <div key={j} className="h-4 bg-gray-100 rounded flex-1" />
          ))}
        </div>
      ))}
    </div>
  )
}
