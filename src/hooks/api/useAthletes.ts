import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { apiFetch } from '@/lib/api'
import type { Athlete, CreateAthleteRequest, UpdateAthleteRequest } from '@/types/api'

export function useAthletes() {
  const { token } = useAuth()
  return useQuery({
    queryKey: ['athletes'],
    queryFn:  () => apiFetch<Athlete[]>('/api/v1/athletes', { token: token ?? undefined }),
    enabled:  !!token,
  })
}

export function useCreateAthlete() {
  const qc = useQueryClient()
  const { token } = useAuth()
  return useMutation({
    mutationFn: (req: CreateAthleteRequest) =>
      apiFetch<Athlete>('/api/v1/athletes', {
        method: 'POST', token: token ?? undefined, body: JSON.stringify(req),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['athletes'] }),
  })
}

export function useUpdateAthlete() {
  const qc = useQueryClient()
  const { token } = useAuth()
  return useMutation({
    mutationFn: ({ id, req }: { id: string; req: UpdateAthleteRequest }) =>
      apiFetch<Athlete>(`/api/v1/athletes/${id}`, {
        method: 'PATCH', token: token ?? undefined, body: JSON.stringify(req),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['athletes'] }),
  })
}

export function useDeleteAthlete() {
  const qc = useQueryClient()
  const { token } = useAuth()
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<void>(`/api/v1/athletes/${id}`, { method: 'DELETE', token: token ?? undefined }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['athletes'] }),
  })
}
