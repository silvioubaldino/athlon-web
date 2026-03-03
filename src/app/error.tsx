'use client'

import { useEffect } from 'react'
import { AlertTriangle, RotateCcw } from 'lucide-react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <html lang="pt-BR">
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="text-center max-w-sm">
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={28} className="text-red-400" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">Algo deu errado</h1>
            <p className="text-sm text-gray-500 mb-6">
              Ocorreu um erro inesperado. Tente novamente ou entre em contato com o suporte.
            </p>
            <button
              onClick={reset}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RotateCcw size={14} />
              Tentar novamente
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
