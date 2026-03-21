'use client'

import { useState } from 'react'
import { Loader2, Chrome, AlertCircle } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { getAuthErrorMessage } from '@/lib/firebase-errors'

// ─── ErrorAlert ──────────────────────────────────────────────────────────────

export function ErrorAlert({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-input bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700"
    >
      <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-500" />
      <span>{message}</span>
    </div>
  )
}

// ─── GoogleSignInButton ───────────────────────────────────────────────────────

interface GoogleSignInButtonProps {
  onClick: () => void
  loading: boolean
}

export function GoogleSignInButton({ onClick, loading }: GoogleSignInButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="
        w-full flex items-center justify-center gap-3
        rounded-input border border-brand-border bg-white
        px-4 py-2.5 text-sm font-medium text-brand-text-dark
        hover:bg-gray-50 active:bg-gray-100
        transition-colors duration-150
        disabled:opacity-50 disabled:cursor-not-allowed
        focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2
      "
    >
      {loading ? (
        <Loader2 size={18} className="animate-spin text-gray-400" />
      ) : (
        <Chrome size={18} className="text-gray-500" />
      )}
      Entrar com Google
    </button>
  )
}


// ─── LoginCard ────────────────────────────────────────────────────────────────

interface LoginCardProps {
  onSuccess: () => void
}

export function LoginCard({ onSuccess }: LoginCardProps) {
  const { signInWithGoogle } = useAuth()
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [googleLoading, setGoogleLoading] = useState(false)

  const clearError = () => setErrorMsg(null)

  const handleGoogleSignIn = async () => {
    clearError()
    setGoogleLoading(true)
    try {
      await signInWithGoogle()
      onSuccess()
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code ?? ''
      setErrorMsg(getAuthErrorMessage(code))
    } finally {
      setGoogleLoading(false)
    }
  }

  return (
    <div
      className="
        w-full max-w-[480px]
        rounded-modal bg-brand-bg-card
        border border-brand-border shadow-card
        px-8 py-10
      "
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 mb-8">
        <div className="w-9 h-9 rounded-full bg-brand-primary flex items-center justify-center">
          <span className="text-white text-sm font-bold">A</span>
        </div>
        <span className="text-xl font-bold text-brand-text-dark tracking-tight">Athlon</span>
      </div>

      {/* Title */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-brand-text-dark">Entrar</h1>
        <p className="text-sm text-brand-text-muted mt-1">Acesse sua conta</p>
      </div>

      {/* Error */}
      {errorMsg && (
        <div className="mb-4">
          <ErrorAlert message={errorMsg} />
        </div>
      )}

      {/* Google */}
      <h3 className="text-sm font-medium text-brand-text-dark mb-3">
        Utilize sua conta corporativa
      </h3>
      <GoogleSignInButton onClick={handleGoogleSignIn} loading={googleLoading} />
    </div>
  )
}
