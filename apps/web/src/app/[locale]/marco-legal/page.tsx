import Link from 'next/link'

import { createClient } from '@/lib/supabase/server'
import type { Tables } from '@/lib/supabase/types'

export const metadata = {
  title: 'Marco legal de accesibilidad web — OLAAC',
  description:
    'Mapa de legislación de accesibilidad digital en América Latina: leyes, normas y obligaciones por país.',
}

export const revalidate = 3600

type LegislacionRow = Tables<'legislacion_pais'>

const SANCION_STYLES: Record<string, { badge: string; label: string }> = {
  alto:    { badge: 'bg-red-100 text-red-800 border border-red-200',     label: 'Sanción alta' },
  medio:   { badge: 'bg-amber-100 text-amber-800 border border-amber-200', label: 'Sanción media' },
  bajo:    { badge: 'bg-blue-100 text-blue-800 border border-blue-200',    label: 'Sanción baja' },
  ninguno: { badge: 'bg-gray-100 text-gray-600 border border-gray-200',    label: 'Sin sanción definida' },
}

const SECTOR_LABEL: Record<string, string> = {
  gobierno:   'Gobierno',
  privado:    'Sector privado',
  educacion:  'Educación',
  transporte: 'Transporte',
}

export default async function MarcoLegalPage() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('legislacion_pais')
    .select('*')
    .eq('vigente', true)
    .order('nivel_sancion', { ascending: false })
    .order('pais', { ascending: true })

  const leyes = (data ?? []) as LegislacionRow[]

  const byNivel = {
    alto:    leyes.filter((l) => l.nivel_sancion === 'alto'),
    medio:   leyes.filter((l) => l.nivel_sancion === 'medio'),
    bajo:    leyes.filter((l) => l.nivel_sancion === 'bajo'),
    ninguno: leyes.filter((l) => l.nivel_sancion === 'ninguno'),
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">

      {/* Encabezado */}
      <header className="mb-10">
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#005fcc]">
          Observatorio OLAAC
        </p>
        <h1 className="text-3xl font-bold text-gray-900">
          Marco legal de accesibilidad web en América Latina
        </h1>
        <p className="mt-3 max-w-2xl text-base text-gray-600">
          Mapa de legislación vigente sobre accesibilidad digital en la región. Cada auditoría
          del observatorio señala si el sitio tiene obligación legal de cumplir estándares WCAG.
        </p>
        {error && (
          <p role="alert" className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            No fue posible cargar la información. Por favor intenta más tarde.
          </p>
        )}
      </header>

      {/* KPI resumen */}
      <section aria-label="Resumen de cobertura legal" className="mb-10">
        <ul className="grid gap-4 sm:grid-cols-3" >
          <li className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Países con legislación</p>
            <p className="mt-2 text-3xl font-bold text-[#252858]">{leyes.length}</p>
            <p className="mt-1 text-xs text-gray-500">en la base de datos OLAAC</p>
          </li>
          <li className="rounded-lg border border-red-200 bg-red-50 p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-red-700">Sanción alta</p>
            <p className="mt-2 text-3xl font-bold text-red-800">{byNivel.alto.length}</p>
            <p className="mt-1 text-xs text-red-600">
              {byNivel.alto.map((l) => l.pais).join(', ') || '—'}
            </p>
          </li>
          <li className="rounded-lg border border-amber-200 bg-amber-50 p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-amber-700">Sanción media</p>
            <p className="mt-2 text-3xl font-bold text-amber-800">{byNivel.medio.length}</p>
            <p className="mt-1 text-xs text-amber-600">
              {byNivel.medio.map((l) => l.pais).join(', ') || '—'}
            </p>
          </li>
        </ul>
      </section>

      {/* Tabla de legislación */}
      <section aria-labelledby="tabla-leyes-heading">
        <h2 id="tabla-leyes-heading" className="mb-4 text-lg font-semibold text-gray-900">
          Legislación por país
        </h2>

        {leyes.length === 0 ? (
          <p className="py-12 text-center text-sm text-gray-500" role="status">
            No hay legislación registrada aún.
          </p>
        ) : (
          <div className="grid gap-4 sm:gap-6">
            {leyes.map((ley) => {
              const sancionKey = ley.nivel_sancion in SANCION_STYLES ? ley.nivel_sancion : 'ninguno'
              const sancion = SANCION_STYLES[sancionKey]!
              return (
                <article
                  key={ley.id}
                  aria-label={`${ley.pais}: ${ley.ley_nombre}`}
                  className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {/* Flag emoji via regional indicator symbols */}
                      <span
                        className="text-2xl leading-none select-none"
                        aria-hidden="true"
                        title={ley.pais}
                      >
                        {getFlagEmoji(ley.iso_code)}
                      </span>
                      <div>
                        <h3 className="font-semibold text-gray-900">{ley.pais}</h3>
                        <p className="text-sm text-gray-500">{ley.ley_nombre}</p>
                      </div>
                    </div>
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${sancion.badge}`}
                    >
                      {sancion.label}
                    </span>
                  </div>

                  <p className="mt-3 text-sm text-gray-700">{ley.ley_descripcion}</p>

                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-500">
                    <span>
                      Sectores obligados:{' '}
                      <span className="font-medium text-gray-700">
                        {ley.obliga_sector.map((s) => SECTOR_LABEL[s] ?? s).join(', ')}
                      </span>
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>
                      Ámbito:{' '}
                      <span className="font-medium text-gray-700 capitalize">{ley.ambito}</span>
                    </span>
                    {ley.url_referencia && (
                      <>
                        <span aria-hidden="true">·</span>
                        <a
                          href={ley.url_referencia}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#005fcc] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005fcc] focus-visible:rounded"
                        >
                          Ver texto oficial
                          <span className="sr-only"> (abre en nueva pestaña)</span>
                        </a>
                      </>
                    )}
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>

      {/* Nota metodológica */}
      <aside
        aria-label="Nota metodológica"
        className="mt-10 rounded-xl border border-[#005fcc]/20 bg-[#f0f4ff] p-5 text-sm text-[#252858]"
      >
        <p className="font-semibold">Nota metodológica</p>
        <p className="mt-1">
          OLAAC muestra si un sitio auditado tiene obligación legal de cumplir WCAG basándose en el
          país y tipo de organización registrado. La información legal es referencial y no constituye
          asesoramiento jurídico. Para casos específicos, consulta a un profesional del derecho.
        </p>
        <p className="mt-2">
          ¿Tu país tiene legislación de accesibilidad que no aparece aquí?{' '}
          <Link
            href="/contacto"
            className="underline underline-offset-2 hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#252858] focus-visible:rounded"
          >
            Escríbenos
          </Link>
          .
        </p>
      </aside>

      {/* CTA scores */}
      <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
        ¿Quieres ver el cumplimiento de accesibilidad por país?{' '}
        <Link
          href="/scores"
          className="text-[#005fcc] underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005fcc] focus-visible:rounded"
        >
          Ver scores del observatorio →
        </Link>
      </div>
    </div>
  )
}

function getFlagEmoji(isoCode: string): string {
  const codePoints = [...isoCode.toUpperCase()].map(
    (c) => 0x1f1e6 + c.charCodeAt(0) - 65,
  )
  return String.fromCodePoint(...codePoints)
}
