import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { apiFetch } from '@/lib/api'
import type { Sport, CreateSportRequest, UpdateSportRequest } from '@/types/api'

export function useSports() {
  const { token } = useAuth()
  return useQuery({
    queryKey: ['sports'],
    queryFn:  () => apiFetch<Sport[]>('/api/v1/sports', { token: token ?? undefined }),
    enabled:  !!token,
  })
}

export function useCreateSport() {
  const qc = useQueryClient()
  const { token } = useAuth()
  return useMutation({
    mutationFn: (req: CreateSportRequest) =>
      apiFetch<Sport>('/api/v1/sports', {
        method: 'POST', token: token ?? undefined, body: JSON.stringify(req),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sports'] }),
  })
}

export function useUpdateSport() {
  const qc = useQueryClient()
  const { token } = useAuth()
  return useMutation({
    mutationFn: ({ id, req }: { id: string; req: UpdateSportRequest }) =>
      apiFetch<Sport>(`/api/v1/sports/${id}`, {
        method: 'PATCH', token: token ?? undefined, body: JSON.stringify(req),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sports'] }),
  })
}

export function useDeleteSport() {
  const qc = useQueryClient()
  const { token } = useAuth()
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<void>(`/api/v1/sports/${id}`, { method: 'DELETE', token: token ?? undefined }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sports'] }),
  })
}
