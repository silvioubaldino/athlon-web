import { notFound } from 'next/navigation'
import { tokens } from '@/lib/tokens'

export default function TokensPage() {
  if (process.env.NODE_ENV !== 'development') {
    notFound()
  }

  const colorEntries = Object.entries(tokens.color) as [string, string][]
  const radiusEntries = Object.entries(tokens.radius) as [string, string][]
  const shadowEntries = Object.entries(tokens.shadow) as [string, string][]

  return (
    <main className="min-h-screen bg-gray-50 p-10">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <div>
          <p className="text-xs font-mono text-gray-400 uppercase tracking-widest mb-1">
            Dev Only — Design System
          </p>
          <h1 className="text-4xl font-bold text-gray-900">Token Palette</h1>
          <p className="text-gray-500 mt-2">
            Single source of truth em{' '}
            <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded font-mono">
              src/lib/tokens.ts
            </code>
          </p>
        </div>

        {/* Color Tokens */}
        <section>
          <h2 className="text-xs font-mono font-semibold uppercase tracking-widest text-gray-400 mb-4">
            Colors
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {colorEntries.map(([name, value]) => (
              <div key={name} className="group">
                <div
                  className="h-20 rounded-card border border-black/5 shadow-card transition-transform group-hover:scale-105"
                  style={{ backgroundColor: value }}
                />
                <div className="mt-2 space-y-0.5">
                  <p className="text-sm font-medium text-gray-800">{camelToLabel(name)}</p>
                  <p className="text-xs font-mono text-gray-400">{value}</p>
                  <p className="text-xs font-mono text-gray-300">tokens.color.{name}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Border Radius */}
        <section>
          <h2 className="text-xs font-mono font-semibold uppercase tracking-widest text-gray-400 mb-4">
            Border Radius
          </h2>
          <div className="flex gap-6 flex-wrap">
            {radiusEntries.map(([name, value]) => (
              <div key={name} className="flex flex-col items-center gap-2">
                <div
                  className="w-20 h-20 bg-blue-100 border-2 border-blue-300"
                  style={{ borderRadius: value }}
                />
                <p className="text-sm font-medium text-gray-700">{name}</p>
                <p className="text-xs font-mono text-gray-400">{value}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Shadows */}
        <section>
          <h2 className="text-xs font-mono font-semibold uppercase tracking-widest text-gray-400 mb-4">
            Shadows
          </h2>
          <div className="flex gap-8 flex-wrap">
            {shadowEntries.map(([name, value]) => (
              <div key={name} className="flex flex-col items-center gap-3">
                <div
                  className="w-32 h-20 bg-white rounded-card"
                  style={{ boxShadow: value }}
                />
                <p className="text-sm font-medium text-gray-700">{name}</p>
                <p className="text-xs font-mono text-gray-400 max-w-[128px] text-center break-all">
                  {value}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Typography Scale */}
        <section>
          <h2 className="text-xs font-mono font-semibold uppercase tracking-widest text-gray-400 mb-4">
            Typography Scale
          </h2>
          <div className="bg-white rounded-card shadow-card p-8 space-y-4 border border-gray-100">
            {[
              { cls: 'text-4xl font-bold',   label: 'text-4xl / bold',   sample: 'Athlon — Gestão de Mídias' },
              { cls: 'text-3xl font-semibold', label: 'text-3xl / semibold', sample: 'Biblioteca de Mídias' },
              { cls: 'text-2xl font-semibold', label: 'text-2xl / semibold', sample: 'Classificação de Conteúdo' },
              { cls: 'text-xl font-medium',  label: 'text-xl / medium',  sample: 'Vocabulários e Categorias' },
              { cls: 'text-lg',              label: 'text-lg',           sample: 'Filtros avançados por modalidade' },
              { cls: 'text-base',            label: 'text-base',         sample: 'Texto padrão do sistema, legível em todos os contextos.' },
              { cls: 'text-sm text-gray-600', label: 'text-sm / muted',  sample: 'Metadados, datas, autores e informações secundárias.' },
              { cls: 'text-xs font-mono text-gray-400', label: 'text-xs / mono', sample: 'tokens.color.primary · #2563EB · UUID-v4' },
            ].map(({ cls, label, sample }) => (
              <div key={label} className="flex items-baseline gap-6">
                <span className="text-xs font-mono text-gray-300 w-40 shrink-0">{label}</span>
                <span className={cls}>{sample}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Status Colors */}
        <section>
          <h2 className="text-xs font-mono font-semibold uppercase tracking-widest text-gray-400 mb-4">
            Status / Semantic
          </h2>
          <div className="flex gap-3 flex-wrap">
            {[
              { label: 'Success', bg: tokens.color.success,  text: '#fff' },
              { label: 'Warning', bg: tokens.color.warning,  text: '#fff' },
              { label: 'Error',   bg: tokens.color.error,    text: '#fff' },
              { label: 'Info',    bg: tokens.color.info,     text: '#fff' },
            ].map(({ label, bg, text }) => (
              <div
                key={label}
                className="px-4 py-2 rounded-input text-sm font-medium"
                style={{ backgroundColor: bg, color: text }}
              >
                {label}
              </div>
            ))}
          </div>
        </section>

        <footer className="text-xs font-mono text-gray-300 border-t border-gray-100 pt-6">
          Athlon Design Tokens · Phase 0 · {new Date().getFullYear()}
        </footer>
      </div>
    </main>
  )
}

function camelToLabel(str: string): string {
  return str
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (s) => s.toUpperCase())
    .trim()
}
