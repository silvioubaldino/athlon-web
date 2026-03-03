import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { apiFetch } from '@/lib/api'
import type {
  FundingSource,
  CreateFundingSourceRequest,
  UpdateFundingSourceRequest,
} from '@/types/api'

export function useFundingSources() {
  const { token } = useAuth()
  return useQuery({
    queryKey: ['funding-sources'],
    queryFn:  () =>
      apiFetch<FundingSource[]>('/api/v1/funding-sources', { token: token ?? undefined }),
    enabled: !!token,
  })
}

export function useCreateFundingSource() {
  const qc = useQueryClient()
  const { token } = useAuth()
  return useMutation({
    mutationFn: (req: CreateFundingSourceRequest) =>
      apiFetch<FundingSource>('/api/v1/funding-sources', {
        method: 'POST', token: token ?? undefined, body: JSON.stringify(req),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['funding-sources'] }),
  })
}

export function useUpdateFundingSource() {
  const qc = useQueryClient()
  const { token } = useAuth()
  return useMutation({
    mutationFn: ({ id, req }: { id: string; req: UpdateFundingSourceRequest }) =>
      apiFetch<FundingSource>(`/api/v1/funding-sources/${id}`, {
        method: 'PATCH', token: token ?? undefined, body: JSON.stringify(req),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['funding-sources'] }),
  })
}

export function useDeleteFundingSource() {
  const qc = useQueryClient()
  const { token } = useAuth()
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<void>(`/api/v1/funding-sources/${id}`, {
        method: 'DELETE', token: token ?? undefined,
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['funding-sources'] }),
  })
}
