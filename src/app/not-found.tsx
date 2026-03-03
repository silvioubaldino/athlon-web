import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-bg-page p-4">
      <div className="text-center">
        <p className="text-8xl font-black text-gray-200 leading-none">404</p>
        <h1 className="text-2xl font-bold text-brand-text-dark mt-4 mb-2">
          Página não encontrada
        </h1>
        <p className="text-brand-text-muted text-sm mb-8">
          A página que você está procurando não existe ou foi movida.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-brand-primary rounded-input hover:bg-brand-primary-hover transition-colors"
        >
          Voltar ao início
        </Link>
      </div>
    </div>
  )
}
