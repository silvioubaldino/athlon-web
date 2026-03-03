import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { apiFetch } from '@/lib/api'
import type { Project, Sport, CreateProjectRequest, UpdateProjectRequest } from '@/types/api'

export function useProjects() {
  const { token } = useAuth()
  return useQuery({
    queryKey: ['projects'],
    queryFn:  () => apiFetch<Project[]>('/api/v1/projects', { token: token ?? undefined }),
    enabled:  !!token,
  })
}

export function useProjectSports(projectId: string | null) {
  const { token } = useAuth()
  return useQuery({
    queryKey: ['projects', projectId, 'sports'],
    queryFn:  () =>
      apiFetch<Sport[]>(`/api/v1/projects/${projectId}/sports`, { token: token ?? undefined }),
    enabled:  !!token && !!projectId,
  })
}

export function useCreateProject() {
  const qc = useQueryClient()
  const { token } = useAuth()
  return useMutation({
    mutationFn: (req: CreateProjectRequest) =>
      apiFetch<Project>('/api/v1/projects', {
        method: 'POST', token: token ?? undefined, body: JSON.stringify(req),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['projects'] }),
  })
}

export function useUpdateProject() {
  const qc = useQueryClient()
  const { token } = useAuth()
  return useMutation({
    mutationFn: ({ id, req }: { id: string; req: UpdateProjectRequest }) =>
      apiFetch<Project>(`/api/v1/projects/${id}`, {
        method: 'PATCH', token: token ?? undefined, body: JSON.stringify(req),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['projects'] }),
  })
}

export function useDeleteProject() {
  const qc = useQueryClient()
  const { token } = useAuth()
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<void>(`/api/v1/projects/${id}`, { method: 'DELETE', token: token ?? undefined }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['projects'] }),
  })
}
