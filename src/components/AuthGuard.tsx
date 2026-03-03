'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

interface AuthGuardProps {
  children: React.ReactNode
}

/**
 * Wraps protected layouts.
 * - While loading → full-page spinner
 * - No user       → redirect to /login
 * - Authenticated → render children
 */
export function AuthGuard({ children }: AuthGuardProps) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login')
    }
  }, [loading, user, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-bg-page">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-4 border-brand-primary border-t-transparent animate-spin" />
          <p className="text-sm text-brand-text-muted">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    // redirect in progress — render nothing
    return null
  }

  return <>{children}</>
}
