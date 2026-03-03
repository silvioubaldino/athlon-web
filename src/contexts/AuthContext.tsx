'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react'
import {
  type User as FirebaseUser,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onIdTokenChanged,
} from 'firebase/auth'
import { auth } from '@/lib/firebase'

// ─── Types ───────────────────────────────────────────────────────────────────

interface AuthContextValue {
  user:              FirebaseUser | null
  token:             string | null   // current ID token — memory only, never localStorage
  loading:           boolean
  signInWithEmail:   (email: string, password: string) => Promise<void>
  signInWithGoogle:  () => Promise<void>
  signOut:           () => Promise<void>
}

// ─── Context ─────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null)

// ─── Provider ────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user,    setUser]    = useState<FirebaseUser | null>(null)
  const [token,   setToken]   = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Subscribe to token changes (covers sign-in, sign-out, and auto-refresh)
  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const idToken = await firebaseUser.getIdToken()
        setUser(firebaseUser)
        setToken(idToken)
      } else {
        setUser(null)
        setToken(null)
      }
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const signInWithEmail = useCallback(
    async (email: string, password: string) => {
      await signInWithEmailAndPassword(auth, email, password)
      // onIdTokenChanged will fire and update state automatically
    },
    []
  )

  const signInWithGoogle = useCallback(async () => {
    const provider = new GoogleAuthProvider()
    await signInWithPopup(auth, provider)
  }, [])

  const signOut = useCallback(async () => {
    await firebaseSignOut(auth)
  }, [])

  return (
    <AuthContext.Provider
      value={{ user, token, loading, signInWithEmail, signInWithGoogle, signOut }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used inside <AuthProvider>')
  }
  return ctx
}
