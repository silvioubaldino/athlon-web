'use client'

import { useState } from 'react'
import { AuthGuard } from '@/components/AuthGuard'
import { AppBar } from '@/components/layout/AppBar'
import { Sidebar } from '@/components/layout/Sidebar'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <AuthGuard>
      <div className="min-h-screen flex flex-col bg-brand-bg-page">
        <AppBar onMenuClick={() => setSidebarCollapsed((v) => !v)} />
        <div className="flex flex-1 overflow-hidden">
          <div className="hidden lg:block h-[calc(100vh-64px)] sticky top-16">
            <Sidebar collapsed={sidebarCollapsed} />
          </div>
          <main className="flex-1 overflow-auto p-6">
            <div className="max-w-[1280px] mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </AuthGuard>
  )
}
