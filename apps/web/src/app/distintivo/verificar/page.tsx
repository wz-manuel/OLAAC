import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Verificar Distintivo — OLAAC',
}

export default async function VerificarPage({
  searchParams,
}: {
  searchParams: Promise<{ folio?: string }>
}) {
  const { folio } = await searchParams

  if (folio?.trim()) {
    redirect(`/distintivo/verificar/${folio.trim().toUpperCase()}`)
  }

  return (
    <div className="mx-auto max-w-md px-4 py-14 sm:px-6">
      <header className="mb-8 text-center">
        <p className="mb-2 text-sm font-medium uppercase tracking-widest text-[#005fcc]">
          Distintivo de Accesibilidad
        </p>
        <h1 className="text-2xl font-bold text-gray-900">Verificar autenticidad</h1>
        <p className="mt-2 text-gray-600">
          Ingresa el folio del distintivo para verificar su validez y vigencia.
        </p>
      </header>

      <form
        action="/distintivo/verificar"
        method="GET"
        className="space-y-4"
      >
        <div>
          <label htmlFor="folio" className="block text-sm font-medium text-gray-700">
            Folio del distintivo
          </label>
          <input
            id="folio"
            name="folio"
            type="text"
            required
            placeholder="BADGE-2025-XXXXXXXX"
            autoComplete="off"
            spellCheck={false}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-sm uppercase tracking-widest shadow-sm focus:border-[#005fcc] focus:outline-none focus:ring-1 focus:ring-[#005fcc]"
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-md bg-[#005fcc] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#004fa0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005fcc] focus-visible:ring-offset-2"
        >
          Verificar distintivo
        </button>
      </form>
    </div>
  )
}
