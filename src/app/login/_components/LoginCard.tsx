'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Loader2, Chrome, AlertCircle, CheckSquare, Square } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { getAuthErrorMessage } from '@/lib/firebase-errors'

// ─── Zod schema ──────────────────────────────────────────────────────────────

const loginSchema = z.object({
  email:    z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Senha deve ter ao menos 6 caracteres'),
})

type LoginFormValues = z.infer<typeof loginSchema>

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

// ─── EmailPasswordForm ────────────────────────────────────────────────────────

interface EmailPasswordFormProps {
  onSuccess: () => void
  onError:   (msg: string) => void
  disabled:  boolean
}

export function EmailPasswordForm({ onSuccess, onError, disabled }: EmailPasswordFormProps) {
  const { signInWithEmail } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) })

  const onSubmit = async (values: LoginFormValues) => {
    setIsSubmitting(true)
    try {
      await signInWithEmail(values.email, values.password)
      onSuccess()
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code ?? ''
      onError(getAuthErrorMessage(code))
    } finally {
      setIsSubmitting(false)
    }
  }

  const isLoading = isSubmitting || disabled

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {/* Email */}
      <div className="space-y-1.5">
        <label htmlFor="email" className="block text-sm font-medium text-brand-text-dark">
          E-mail
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          disabled={isLoading}
          placeholder="seu@email.com"
          {...register('email')}
          className="
            w-full rounded-input border border-brand-border bg-white
            px-3 py-2.5 text-sm text-brand-text-dark placeholder-gray-400
            focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary
            disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50
            transition-colors
          "
        />
        {errors.email && (
          <p className="text-xs text-brand-error">{errors.email.message}</p>
        )}
      </div>

      {/* Password */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor="password" className="block text-sm font-medium text-brand-text-dark">
            Senha
          </label>
          <button
            type="button"
            tabIndex={-1}
            className="text-xs text-brand-primary hover:text-brand-primary-hover transition-colors"
          >
            Esqueci minha senha
          </button>
        </div>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            disabled={isLoading}
            placeholder="••••••••"
            {...register('password')}
            className="
              w-full rounded-input border border-brand-border bg-white
              px-3 py-2.5 pr-10 text-sm text-brand-text-dark placeholder-gray-400
              focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary
              disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50
              transition-colors
            "
          />
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {errors.password && (
          <p className="text-xs text-brand-error">{errors.password.message}</p>
        )}
      </div>

      {/* Remember me */}
      <button
        type="button"
        onClick={() => setRememberMe((v) => !v)}
        className="flex items-center gap-2 text-sm text-brand-text-muted hover:text-brand-text-dark transition-colors"
      >
        {rememberMe
          ? <CheckSquare size={16} className="text-brand-primary" />
          : <Square size={16} className="text-gray-400" />
        }
        Lembrar-me
      </button>

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading}
        className="
          w-full flex items-center justify-center gap-2
          rounded-input bg-brand-primary hover:bg-brand-primary-hover
          px-4 py-2.5 text-sm font-semibold text-white
          transition-colors duration-150
          disabled:opacity-50 disabled:cursor-not-allowed
          focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2
        "
      >
        {isLoading && <Loader2 size={16} className="animate-spin" />}
        {isLoading ? 'Entrando...' : 'Entrar'}
      </button>
    </form>
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

      {/* Email/password form */}
      <EmailPasswordForm
        onSuccess={onSuccess}
        onError={setErrorMsg}
        disabled={googleLoading}
      />

      {/* Divider */}
      <div className="relative my-5">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-brand-border" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-brand-bg-card px-3 text-xs text-brand-text-muted">ou</span>
        </div>
      </div>

      {/* Google */}
      <GoogleSignInButton onClick={handleGoogleSignIn} loading={googleLoading} />
    </div>
  )
}
