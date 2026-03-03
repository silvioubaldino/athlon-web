'use client'

import { useCallback, useMemo } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import type { MediaListParams } from '@/types/api'

export interface LibraryFilters {
  q:               string
  fundingSourceIds: string[]
  projectIds:      string[]
  sportIds:        string[]
  athleteIds:      string[]
  eventIds:        string[]
  dateFrom?:       string
  dateTo?:         string
  page:            number
  pageSize:        number
  orderBy:         'media_date_desc' | 'media_date_asc' | 'created_at_desc'
}

const DEFAULTS: LibraryFilters = {
  q:               '',
  fundingSourceIds: [],
  projectIds:      [],
  sportIds:        [],
  athleteIds:      [],
  eventIds:        [],
  dateFrom:        undefined,
  dateTo:          undefined,
  page:            1,
  pageSize:        24,
  orderBy:         'media_date_desc',
}

function parseArray(params: URLSearchParams, key: string): string[] {
  return params.getAll(key).filter(Boolean)
}

export function useLibraryFilters() {
  const searchParams = useSearchParams()
  const router       = useRouter()
  const pathname     = usePathname()

  const filters: LibraryFilters = useMemo(() => ({
    q:               searchParams.get('q')        ?? DEFAULTS.q,
    fundingSourceIds: parseArray(searchParams, 'fs'),
    projectIds:      parseArray(searchParams, 'proj'),
    sportIds:        parseArray(searchParams, 'sport'),
    athleteIds:      parseArray(searchParams, 'athlete'),
    eventIds:        parseArray(searchParams, 'event'),
    dateFrom:        searchParams.get('from')     ?? undefined,
    dateTo:          searchParams.get('to')       ?? undefined,
    page:            Number(searchParams.get('page'))     || 1,
    pageSize:        Number(searchParams.get('pageSize')) || 24,
    orderBy:         (searchParams.get('orderBy') as LibraryFilters['orderBy']) ?? DEFAULTS.orderBy,
  }), [searchParams])

  const setFilter = useCallback(
    <K extends keyof LibraryFilters>(key: K, value: LibraryFilters[K]) => {
      const params = new URLSearchParams(searchParams.toString())

      const paramMap: Record<keyof LibraryFilters, string> = {
        q: 'q', fundingSourceIds: 'fs', projectIds: 'proj',
        sportIds: 'sport', athleteIds: 'athlete', eventIds: 'event',
        dateFrom: 'from', dateTo: 'to', page: 'page', pageSize: 'pageSize', orderBy: 'orderBy',
      }

      const paramKey = paramMap[key]

      if (Array.isArray(value)) {
        params.delete(paramKey)
        ;(value as string[]).forEach((v) => params.append(paramKey, v))
      } else if (value === undefined || value === '' || value === null) {
        params.delete(paramKey)
      } else {
        params.set(paramKey, String(value))
      }

      // Reset to page 1 on filter change (not when changing page itself)
      if (key !== 'page') params.set('page', '1')

      router.push(`${pathname}?${params.toString()}`)
    },
    [searchParams, router, pathname]
  )

  const clearAll = useCallback(() => {
    router.push(pathname)
  }, [router, pathname])

  const activeCount = useMemo(() => {
    let count = 0
    if (filters.q)                         count++
    if (filters.fundingSourceIds.length)   count++
    if (filters.projectIds.length)         count++
    if (filters.sportIds.length)           count++
    if (filters.athleteIds.length)         count++
    if (filters.eventIds.length)           count++
    if (filters.dateFrom || filters.dateTo) count++
    if (filters.orderBy !== DEFAULTS.orderBy) count++
    return count
  }, [filters])

  const toApiParams = (): MediaListParams => ({
    q:                  filters.q || undefined,
    funding_source_ids: filters.fundingSourceIds.length ? filters.fundingSourceIds : undefined,
    project_ids:        filters.projectIds.length  ? filters.projectIds  : undefined,
    sport_ids:          filters.sportIds.length    ? filters.sportIds    : undefined,
    athlete_ids:        filters.athleteIds.length  ? filters.athleteIds  : undefined,
    event_ids:          filters.eventIds.length    ? filters.eventIds    : undefined,
    date_from:          filters.dateFrom,
    date_to:            filters.dateTo,
    page:               filters.page,
    page_size:          filters.pageSize,
    order_by:           filters.orderBy,
  })

  return { filters, setFilter, clearAll, activeCount, toApiParams }
}
