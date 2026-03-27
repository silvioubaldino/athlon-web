'use client'

import { useEffect, useMemo, useReducer } from 'react'
import type { Media, FundingSource } from '@/types/api'
import { useProjects, useProjectSports } from '@/hooks/api/useProjects'
import { useFundingSources } from '@/hooks/api/useFundingSources'

export interface ClassificationState {
  mediaId:    string
  title:      string
  caption:    string
  mediaDate:  string
  author:     string
  projectIds: string[]
  sportIds:   string[]
  athleteIds: string[]
  eventIds:   string[]
  isDirty:    boolean
}

type Action =
  | { type: 'SET_FIELD'; key: keyof Omit<ClassificationState, 'isDirty' | 'mediaId'>; value: string | string[] }
  | { type: 'RESET'; media: Media }

function makeInitial(media: Media): ClassificationState {
  return {
    mediaId:    media.id,
    title:      media.title      ?? '',
    caption:    media.caption    ?? '',
    mediaDate:  media.media_date ?? '',
    author:     media.author     ?? '',
    projectIds: (media.projects ?? []).map((p) => p.id),
    sportIds:   (media.sports   ?? []).map((s) => s.id),
    athleteIds: media.athletes?.map((a) => a.id) ?? [],
    eventIds:   media.events?.map((e) => e.id)   ?? [],
    isDirty:    false,
  }
}

function reducer(state: ClassificationState, action: Action): ClassificationState {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.key]: action.value, isDirty: true }
    case 'RESET':
      return makeInitial(action.media)
    default:
      return state
  }
}

export function useClassification(media: Media | undefined) {
  const [state, dispatch] = useReducer(
    reducer,
    media ? makeInitial(media) : ({} as ClassificationState)
  )

  useEffect(() => {
    if (media) dispatch({ type: 'RESET', media })
  }, [media])

  const setValue = (
    key: keyof Omit<ClassificationState, 'isDirty' | 'mediaId'>,
    value: string | string[]
  ) => dispatch({ type: 'SET_FIELD', key, value })

  const reset = () => { if (media) dispatch({ type: 'RESET', media }) }

  // Derive funding sources from selected projects
  const { data: apData } = useProjects()
  const { data: fsData } = useFundingSources()

  const derivedFundingSources: FundingSource[] = useMemo(() => {
    const allProjects    = apData ?? []
    const fundingSources = fsData ?? []
    const fsIds = new Set(
      allProjects
        .filter((p) => state.projectIds?.includes(p.id))
        .map((p) => p.funding_source_id)
    )
    return fundingSources.filter((f) => fsIds.has(f.id))
  }, [state.projectIds, apData, fsData])

  // Derive allowed sport IDs from selected projects
  const p0 = useProjectSports(state.projectIds?.[0] ?? null)
  const p1 = useProjectSports(state.projectIds?.[1] ?? null)
  const p2 = useProjectSports(state.projectIds?.[2] ?? null)
  const p3 = useProjectSports(state.projectIds?.[3] ?? null)
  const p4 = useProjectSports(state.projectIds?.[4] ?? null)

  const allowedSportIds: string[] = useMemo(() => {
    if (!state.projectIds?.length) return []
    const union = new Set<string>()
    ;[p0.data, p1.data, p2.data, p3.data, p4.data].forEach((data, i) => {
      if (state.projectIds[i] && data) {
        data.forEach((s) => union.add(s.id))
      }
    })
    return Array.from(union)
  }, [state.projectIds, p0.data, p1.data, p2.data, p3.data, p4.data])

  return {
    state,
    setValue,
    reset,
    isDirty: state.isDirty ?? false,
    derivedFundingSources,
    allowedSportIds,
  }
}
