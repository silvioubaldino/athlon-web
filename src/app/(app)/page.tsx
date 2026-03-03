'use client'

import Link from 'next/link'
import { Image, Tag, ArrowRight } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useMediaList } from '@/hooks/api/useMedia'

export default function HomePage() {
  const { user } = useAuth()
  const { data } = useMediaList({ page: 1, page_size: 1 })

  const name = user?.displayName ?? user?.email ?? 'usuário'
  const hasMedia = (data?.total ?? 0) > 0

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-brand-text-dark">
          Bem-vindo(a), {name}
        </h1>
        <p className="text-brand-text-muted mt-2 max-w-xl">
          O Athlon centraliza a gestão de mídias para relatórios de projetos de
          paradesporto. Adicione, classifique e pesquise fotos e vídeos com agilidade.
        </p>
      </div>

      {!hasMedia && (
        <div className="rounded-card border border-dashed border-gray-300 bg-white p-6 text-center max-w-lg">
          <p className="text-brand-text-muted text-sm">
            Nenhuma mídia cadastrada. Comece adicionando links na Biblioteca.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
        <ShortcutCard
          href="/library"
          icon={Image}
          title="Biblioteca"
          description="Pesquise e gerencie todas as mídias cadastradas."
          color="blue"
        />
        <ShortcutCard
          href="/classification"
          icon={Tag}
          title="Classificação"
          description="Classifique as mídias pendentes sequencialmente."
          color="green"
        />
      </div>
    </div>
  )
}

function ShortcutCard({
  href, icon: Icon, title, description, color,
}: {
  href: string
  icon: React.ElementType
  title: string
  description: string
  color: 'blue' | 'green'
}) {
  const colors = {
    blue:  { bg: 'bg-blue-50',  text: 'text-blue-600',  border: 'hover:border-blue-300' },
    green: { bg: 'bg-green-50', text: 'text-green-600', border: 'hover:border-green-300' },
  }
  const c = colors[color]

  return (
    <Link
      href={href}
      className={`group block rounded-card bg-white border border-gray-200 ${c.border} p-6 shadow-card hover:shadow-md transition-all`}
    >
      <div className={`w-10 h-10 rounded-lg ${c.bg} flex items-center justify-center mb-4`}>
        <Icon size={20} className={c.text} />
      </div>
      <h2 className="text-base font-semibold text-brand-text-dark">{title}</h2>
      <p className="text-sm text-brand-text-muted mt-1">{description}</p>
      <div className={`flex items-center gap-1 mt-3 text-xs font-medium ${c.text}`}>
        Acessar <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
      </div>
    </Link>
  )
}
