import type { Metadata } from 'next'
import Link from 'next/link'

import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Cobertura geográfica — OLAAC',
  description:
    'Criterios de representatividad del Observatorio Latinoamericano de Accesibilidad: ' +
    'cuántos sitios auditamos por país y sector para que los datos sean estadísticamente válidos.',
}

// ─── Utilidades ───────────────────────────────────────────────────────────────

function flagEmoji(iso: string) {
  return [...iso.toUpperCase()].map(c => String.fromCodePoint(0x1f1e6 + c.charCodeAt(0) - 65)).join('')
}

const CATEGORIA_LABEL: Record<string, string> = {
  gobierno:      'Gobierno',
  educacion:     'Educación',
  privado:       'Sector privado',
  salud:         'Salud',
  sociedad_civil:'Sociedad civil',
}

// ─── Tipos ───────────────────────────────────────────────────────────────────

interface ResumenRow {
  pais: string | null
  iso_code: string | null
  meta_total: number | null
  auditados_total: number | null
  porcentaje_global: number | null
  categorias_completas: number | null
  categorias_total: number | null
}

interface DetalleRow {
  pais: string | null
  iso_code: string | null
  categoria: string | null
  umbral_minimo: number | null
  sitios_auditados: number | null
  porcentaje: number | null
  cumple_umbral: boolean | null
}

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function StatusChip({ pct }: { pct: number }) {
  if (pct >= 100) return <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">Completa</span>
  if (pct >= 50)  return <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">En progreso</span>
  if (pct > 0)    return <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700">Iniciando</span>
  return               <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">Sin datos</span>
}

function ProgressBar({ value, max, label }: { value: number; max: number; label: string }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0
  const color = pct >= 100 ? 'bg-green-500' : pct >= 50 ? 'bg-amber-500' : pct > 0 ? 'bg-orange-400' : 'bg-gray-200'
  return (
    <div
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-label={label}
      className="h-2 w-full overflow-hidden rounded-full bg-gray-100"
    >
      <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} aria-hidden="true" />
    </div>
  )
}

// ─── Página ───────────────────────────────────────────────────────────────────

export default async function CoberturaPage() {
  const supabase = await createClient()

  const [resumenResult, detalleResult] = await Promise.all([
    supabase.from('v_cobertura_resumen').select('*'),
    supabase.from('v_cobertura_pais').select('*').order('pais').order('categoria'),
  ])

  const paises  = (resumenResult.data ?? []) as ResumenRow[]
  const detalle = (detalleResult.data ?? []) as DetalleRow[]

  // Estadísticas globales
  const totalPaises    = paises.length
  const totalAuditados = paises.reduce((s, p) => s + (p.auditados_total ?? 0), 0)
  const totalMeta      = paises.reduce((s, p) => s + (p.meta_total ?? 0), 0)
  const pctGlobal      = totalMeta > 0 ? Math.min(100, Math.round((totalAuditados / totalMeta) * 100)) : 0
  const paisesCompletos = paises.filter(p => (p.porcentaje_global ?? 0) >= 100).length

  // Agrupar detalle por país para la tabla breakdown
  const detalleByPais = detalle.reduce<Record<string, DetalleRow[]>>((acc, row) => {
    const key = row.pais ?? 'unknown'
    if (!acc[key]) acc[key] = []
    acc[key].push(row)
    return acc
  }, {})

  const categorias = [...new Set(detalle.map(d => d.categoria ?? ''))].filter(Boolean).sort()

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      {/* Breadcrumb */}
      <nav aria-label="Migas de pan" className="mb-6 text-sm text-gray-500">
        <ol className="flex items-center gap-1.5">
          <li><Link href="/" className="hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005fcc] focus-visible:rounded">Inicio</Link></li>
          <li aria-hidden="true">/</li>
          <li className="font-medium text-gray-900" aria-current="page">Cobertura geográfica</li>
        </ol>
      </nav>

      {/* Encabezado */}
      <header className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900">Cobertura geográfica</h1>
        <p className="mt-3 max-w-2xl text-base text-gray-600">
          Para ser un observatorio creíble, los datos deben ser representativos. Aquí publicamos cuántos
          sitios estamos auditando por país y sector, y cuántos necesitamos para alcanzar umbrales
          estadísticamente válidos.
        </p>
      </header>

      {/* Estadísticas globales */}
      <section aria-labelledby="stats-heading" className="mb-10">
        <h2 id="stats-heading" className="sr-only">Estadísticas globales de cobertura</h2>
        <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-xl border border-gray-200 bg-white p-5 text-center">
            <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">Países</dt>
            <dd className="mt-1 text-3xl font-bold text-gray-900">{totalPaises}</dd>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-5 text-center">
            <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">Sitios auditados</dt>
            <dd className="mt-1 text-3xl font-bold text-gray-900">{totalAuditados}</dd>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-5 text-center">
            <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">Meta global</dt>
            <dd className="mt-1 text-3xl font-bold text-gray-900">{totalMeta}</dd>
          </div>
          <div className={`rounded-xl border p-5 text-center ${pctGlobal >= 100 ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-white'}`}>
            <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">Cobertura alcanzada</dt>
            <dd className={`mt-1 text-3xl font-bold ${pctGlobal >= 100 ? 'text-green-700' : pctGlobal >= 50 ? 'text-amber-600' : 'text-gray-900'}`}>
              {pctGlobal}%
            </dd>
          </div>
        </dl>
      </section>

      {/* Cards de países */}
      <section aria-labelledby="paises-heading" className="mb-12">
        <div className="mb-5 flex items-center justify-between">
          <h2 id="paises-heading" className="text-lg font-semibold text-gray-900">
            Cobertura por país
          </h2>
          <span className="text-sm text-gray-500">
            {paisesCompletos} de {totalPaises} con cobertura completa
          </span>
        </div>

        {paises.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
            <p className="text-gray-500">Aún no hay datos de cobertura configurados.</p>
          </div>
        ) : (
          <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {paises.map(p => {
              const pais = p.pais ?? ''
              const iso  = p.iso_code ?? ''
              const pct  = p.porcentaje_global ?? 0
              const aud  = p.auditados_total ?? 0
              const meta = p.meta_total ?? 0
              const catCompletas = p.categorias_completas ?? 0
              const catTotal     = p.categorias_total ?? 0

              return (
                <li
                  key={pais}
                  className="rounded-xl border border-gray-200 bg-white p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl" role="img" aria-label={`Bandera de ${pais}`}>
                          {flagEmoji(iso)}
                        </span>
                        <span className="font-semibold text-gray-900">{pais}</span>
                      </div>
                      <p className="mt-0.5 text-xs text-gray-500">
                        {catCompletas}/{catTotal} sectores completos
                      </p>
                    </div>
                    <StatusChip pct={pct} />
                  </div>

                  <div className="mt-4">
                    <ProgressBar value={aud} max={meta} label={`Cobertura de ${pais}: ${aud} de ${meta} sitios`} />
                    <p className="mt-1.5 text-right text-xs text-gray-500">
                      <strong className="text-gray-800">{aud}</strong> / {meta} sitios
                    </p>
                  </div>
                </li>
              )
            })}
          </ol>
        )}
      </section>

      {/* Desglose por sector */}
      {detalle.length > 0 && (
        <section aria-labelledby="desglose-heading" className="mb-12">
          <h2 id="desglose-heading" className="mb-5 text-lg font-semibold text-gray-900">
            Desglose por sector
          </h2>
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200 bg-white text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">País</th>
                  {categorias.map(cat => (
                    <th key={cat} scope="col" className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wide text-gray-500">
                      {CATEGORIA_LABEL[cat] ?? cat}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {Object.entries(detalleByPais).map(([pais, filas]) => (
                  <tr key={pais} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-4 py-3 font-medium text-gray-900">
                      <span className="mr-1.5" role="img" aria-hidden="true">
                        {flagEmoji(filas[0]?.iso_code ?? '')}
                      </span>
                      {pais}
                    </td>
                    {categorias.map(cat => {
                      const fila = filas.find(f => f.categoria === cat)
                      if (!fila) return <td key={cat} className="px-4 py-3 text-center text-gray-500">—</td>
                      const aud  = fila.sitios_auditados ?? 0
                      const meta = fila.umbral_minimo ?? 0
                      return (
                        <td key={cat} className="px-4 py-3 text-center">
                          <span className={`font-medium ${fila.cumple_umbral ? 'text-green-700' : aud > 0 ? 'text-amber-700' : 'text-gray-500'}`}>
                            {aud}
                          </span>
                          <span className="text-gray-500">/{meta}</span>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-xs text-gray-500">
            Los valores en <span className="font-medium text-green-700">verde</span> indican que se alcanzó el umbral mínimo de representatividad.
          </p>
        </section>
      )}

      {/* Metodología */}
      <section aria-labelledby="metodologia-heading" className="mb-10 rounded-xl border border-gray-200 bg-gray-50 p-6">
        <h2 id="metodologia-heading" className="mb-3 text-base font-semibold text-gray-900">
          ¿Cómo se definen los umbrales?
        </h2>
        <p className="text-sm text-gray-600">
          Los umbrales mínimos se establecen por país y sector considerando el tamaño del ecosistema digital
          de cada nación. Para países grandes (Brasil, México, Colombia, Argentina) se requieren al menos
          20 sitios de gobierno, 15 de educación y 10 del sector privado. Para países medianos, los
          umbrales son 10/8/5, y para los menores, 5/5/3.
        </p>
        <p className="mt-2 text-sm text-gray-600">
          Un país alcanza cobertura completa en un sector cuando supera su umbral mínimo. El porcentaje
          global por país se calcula como el total de sitios auditados dividido entre el total de sitios
          meta en todos los sectores configurados.
        </p>
      </section>

      {/* CTA */}
      <div className="rounded-xl border border-[#005fcc]/20 bg-blue-50 p-6">
        <h2 className="mb-1 text-base font-semibold text-[#005fcc]">
          ¿Tu sitio no está en el observatorio?
        </h2>
        <p className="mb-4 text-sm text-blue-700">
          Puedes solicitar que incluyamos tu organización en el siguiente ciclo de auditorías Lighthouse.
        </p>
        <Link
          href="/scores/solicitar-url"
          className="inline-flex items-center rounded-lg bg-[#005fcc] px-4 py-2 text-sm font-medium text-white hover:bg-[#004eaa] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005fcc] focus-visible:ring-offset-2"
        >
          Solicitar inclusión
        </Link>
      </div>
    </div>
  )
}
