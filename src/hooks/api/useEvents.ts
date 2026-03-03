import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { apiFetch } from '@/lib/api'
import type { Event, CreateEventRequest, UpdateEventRequest } from '@/types/api'

export function useEvents() {
  const { token } = useAuth()
  return useQuery({
    queryKey: ['events'],
    queryFn:  () => apiFetch<Event[]>('/api/v1/events', { token: token ?? undefined }),
    enabled:  !!token,
  })
}

export function useCreateEvent() {
  const qc = useQueryClient()
  const { token } = useAuth()
  return useMutation({
    mutationFn: (req: CreateEventRequest) =>
      apiFetch<Event>('/api/v1/events', {
        method: 'POST', token: token ?? undefined, body: JSON.stringify(req),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['events'] }),
  })
}

export function useUpdateEvent() {
  const qc = useQueryClient()
  const { token } = useAuth()
  return useMutation({
    mutationFn: ({ id, req }: { id: string; req: UpdateEventRequest }) =>
      apiFetch<Event>(`/api/v1/events/${id}`, {
        method: 'PATCH', token: token ?? undefined, body: JSON.stringify(req),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['events'] }),
  })
}

export function useDeleteEvent() {
  const qc = useQueryClient()
  const { token } = useAuth()
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<void>(`/api/v1/events/${id}`, { method: 'DELETE', token: token ?? undefined }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['events'] }),
  })
}
