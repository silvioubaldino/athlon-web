'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { LoginCard } from './_components/LoginCard'

export default function LoginPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  // If already authenticated, go straight to the app
  useEffect(() => {
    if (!loading && user) {
      router.replace('/')
    }
  }, [loading, user, router])

  const handleSuccess = () => {
    router.replace('/')
  }

  // While checking auth state, show nothing (avoids flash)
  if (loading) return null

  // Already logged in — redirect in progress
  if (user) return null

  return (
    <main className="min-h-screen bg-brand-bg-page flex items-center justify-center p-4">
      <LoginCard onSuccess={handleSuccess} />
    </main>
  )
}
