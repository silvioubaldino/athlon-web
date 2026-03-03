'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, User, Menu } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

interface AppBarProps {
  onMenuClick?: () => void
}

export function AppBar({ onMenuClick }: AppBarProps) {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const [open, setOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    router.replace('/login')
  }

  const initial = (user?.displayName ?? user?.email ?? 'U')[0].toUpperCase()

  return (
    <header className="h-16 bg-white border-b border-gray-200 shadow-appbar px-6 flex items-center justify-between shrink-0 z-30 relative">
      {/* Left: hamburger (mobile) + logo */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-1.5 rounded-md text-gray-500 hover:bg-gray-100 transition-colors"
          aria-label="Toggle menu"
        >
          <Menu size={20} />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-brand-primary flex items-center justify-center">
            <span className="text-white text-sm font-bold">A</span>
          </div>
          <span className="text-lg font-bold text-brand-text-dark tracking-tight">Athlon</span>
        </div>
      </div>

      {/* Right: avatar dropdown */}
      <div className="relative">
        <button
          onClick={() => setOpen((v) => !v)}
          className="w-9 h-9 rounded-full bg-brand-primary text-white text-sm font-semibold flex items-center justify-center hover:bg-brand-primary-hover transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2"
          aria-label="Menu do usuário"
        >
          {initial}
        </button>

        {open && (
          <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            {/* Dropdown */}
            <div className="absolute right-0 top-11 z-20 w-48 bg-white rounded-card border border-gray-200 shadow-card py-1">
              <div className="px-3 py-2 border-b border-gray-100">
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
              <button
                disabled
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-400 cursor-not-allowed"
              >
                <User size={14} />
                Meu perfil
              </button>
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <LogOut size={14} />
                Sair
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  )
}

