import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryResult,
} from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { apiFetch } from '@/lib/api'
import type {
  Media,
  MediaListItem,
  PaginatedResponse,
  CreateMediaRequest,
  UpdateMediaRequest,
  MediaListParams,
} from '@/types/api'

function buildMediaQuery(params: MediaListParams): string {
  const p = new URLSearchParams()
  if (params.q)          p.set('q', params.q)
  if (params.page)       p.set('page', String(params.page))
  if (params.page_size)  p.set('page_size', String(params.page_size))
  if (params.order_by)   p.set('order_by', params.order_by)
  if (params.date_from)  p.set('date_from', params.date_from)
  if (params.date_to)    p.set('date_to', params.date_to)
  if (params.classified !== undefined) p.set('classified', String(params.classified))
  ;(params.funding_source_ids ?? []).forEach((id) => p.append('funding_source_ids', id))
  ;(params.project_ids ?? []).forEach((id) => p.append('project_ids', id))
  ;(params.sport_ids ?? []).forEach((id) => p.append('sport_ids', id))
  ;(params.athlete_ids ?? []).forEach((id) => p.append('athlete_ids', id))
  ;(params.event_ids ?? []).forEach((id) => p.append('event_ids', id))
  const qs = p.toString()
  return qs ? `?${qs}` : ''
}

export function useMediaList(
  params: MediaListParams
): UseQueryResult<PaginatedResponse<MediaListItem>> {
  const { token } = useAuth()
  return useQuery({
    queryKey: ['media', params],
    queryFn:  () =>
      apiFetch<PaginatedResponse<MediaListItem>>(
        `/api/v1/media${buildMediaQuery(params)}`,
        { token: token ?? undefined }
      ),
    enabled: !!token,
  })
}

export function useMediaDetail(id: string | null) {
  const { token } = useAuth()
  return useQuery({
    queryKey: ['media', id],
    queryFn:  () => apiFetch<Media>(`/api/v1/media/${id}`, { token: token ?? undefined }),
    enabled:  !!token && !!id,
  })
}

export function useNextUnclassified() {
  const { token } = useAuth()
  return useQuery({
    queryKey: ['media', 'next-unclassified'],
    queryFn:  () =>
      apiFetch<Media>('/api/v1/media/classification/next', { token: token ?? undefined }),
    enabled:  !!token,
    staleTime: 0,
    retry: false,
  })
}

export function useCreateMedia() {
  const qc = useQueryClient()
  const { token } = useAuth()
  return useMutation({
    mutationFn: (req: CreateMediaRequest) =>
      apiFetch<Media>('/api/v1/media', {
        method: 'POST',
        token:  token ?? undefined,
        body:   JSON.stringify(req),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['media'] }),
  })
}

export function useUpdateMedia() {
  const qc = useQueryClient()
  const { token } = useAuth()
  return useMutation({
    mutationFn: ({ id, req }: { id: string; req: UpdateMediaRequest }) =>
      apiFetch<Media>(`/api/v1/media/${id}`, {
        method: 'PATCH',
        token:  token ?? undefined,
        body:   JSON.stringify(req),
      }),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['media'] })
      qc.invalidateQueries({ queryKey: ['media', id] })
    },
  })
}

export function useDeleteMedia() {
  const qc = useQueryClient()
  const { token } = useAuth()
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<void>(`/api/v1/media/${id}`, {
        method: 'DELETE',
        token:  token ?? undefined,
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['media'] }),
  })
}
