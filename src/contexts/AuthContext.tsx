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
  driveToken:        string | null   // Google OAuth token for Drive API
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
  const [driveToken, setDriveToken] = useState<string | null>(null)
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
        setDriveToken(null)
        localStorage.removeItem('drive_token')
      }
      setLoading(false)
    })

    // Load drive token from local storage
    const storedDriveToken = localStorage.getItem('drive_token')
    if (storedDriveToken) {
      setDriveToken(storedDriveToken)
    }

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
    provider.addScope('https://www.googleapis.com/auth/drive.readonly')
    const result = await signInWithPopup(auth, provider)
    const credential = GoogleAuthProvider.credentialFromResult(result)
    if (credential?.accessToken) {
      localStorage.setItem('drive_token', credential.accessToken)
      setDriveToken(credential.accessToken)
    }
  }, [])

  const signOut = useCallback(async () => {
    setDriveToken(null)
    localStorage.removeItem('drive_token')
    await firebaseSignOut(auth)
  }, [])

  return (
    <AuthContext.Provider
      value={{ user, token, driveToken, loading, signInWithEmail, signInWithGoogle, signOut }}
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
