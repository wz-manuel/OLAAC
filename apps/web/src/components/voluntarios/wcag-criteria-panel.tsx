'use client'

import * as React from 'react'

import {
  calcularPuntajeWcag,
  getCriteriosByPrincipio,
  PRINCIPIO_META,
  PRINCIPIOS,
  type WcagPrincipio,
  type WcagResultado,
  type WcagResultadoEntry,
} from '@/lib/wcag/criterios'

// ─── Constantes de UI ────────────────────────────────────────────────────────

const OPCIONES: Array<{ value: WcagResultado; label: string; activeClass: string }> = [
  { value: 'cumple',       label: 'Cumple',      activeClass: 'bg-green-600 border-green-600 text-white'  },
  { value: 'no_cumple',    label: 'No cumple',   activeClass: 'bg-red-600 border-red-600 text-white'      },
  { value: 'no_aplica',    label: 'N/A',         activeClass: 'bg-gray-500 border-gray-500 text-white'    },
  { value: 'no_evaluado',  label: 'No evaluado', activeClass: 'bg-white border-gray-300 text-gray-500'    },
]

// ─── Tipos ───────────────────────────────────────────────────────────────────

type EstadoMap = Map<string, WcagResultadoEntry>

function initialState(): EstadoMap {
  const map: EstadoMap = new Map()
  // Las keys se añaden de forma lazy al interactuar — la ausencia de key = no_evaluado
  return map
}

function getResultado(estado: EstadoMap, codigo: string): WcagResultado {
  return estado.get(codigo)?.resultado ?? 'no_evaluado'
}

function getNotas(estado: EstadoMap, codigo: string): string {
  return estado.get(codigo)?.notas ?? ''
}

// ─── Sub-componente: fila de criterio ─────────────────────────────────────────

interface CriterioRowProps {
  codigo: string
  nombre: string
  nivel: 'A' | 'AA'
  es_21: boolean
  resultado: WcagResultado
  notas: string
  onResultado: (codigo: string, resultado: WcagResultado) => void
  onNotas: (codigo: string, notas: string) => void
}

function CriterioRow({
  codigo, nombre, nivel, es_21,
  resultado, notas,
  onResultado, onNotas,
}: CriterioRowProps) {
  const notasId   = `notas-${codigo}`
  const groupId   = `grupo-${codigo}`
  const showNotas = resultado !== 'no_evaluado'

  return (
    <div className="border-b border-gray-100 py-3 last:border-0">
      <div className="flex items-start gap-3">
        {/* Código */}
        <span className="w-12 shrink-0 font-mono text-xs text-gray-400 pt-0.5">{codigo}</span>

        {/* Nombre + badges + controles */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-sm font-medium text-gray-900">{nombre}</span>
            <span
              className={`rounded px-1.5 py-0.5 font-mono text-[10px] font-semibold ${
                nivel === 'A'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-purple-100 text-purple-700'
              }`}
            >
              {nivel}
            </span>
            {es_21 && (
              <span className="text-[10px] text-gray-400">2.1</span>
            )}
          </div>

          {/* Botones de resultado */}
          <div
            role="group"
            id={groupId}
            aria-label={`Resultado para ${codigo} — ${nombre}`}
            className="mt-2 flex flex-wrap gap-1.5"
          >
            {OPCIONES.map(op => (
              <button
                key={op.value}
                type="button"
                aria-pressed={resultado === op.value}
                onClick={() => onResultado(codigo, op.value)}
                className={`rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005fcc] focus-visible:ring-offset-1 ${
                  resultado === op.value
                    ? op.activeClass
                    : 'border-gray-200 text-gray-500 hover:border-gray-300'
                }`}
              >
                {op.label}
              </button>
            ))}
          </div>

          {/* Notas opcionales — visibles cuando el criterio fue evaluado */}
          {showNotas && (
            <div className="mt-2">
              <label htmlFor={notasId} className="sr-only">
                Notas para el criterio {codigo}
              </label>
              <textarea
                id={notasId}
                rows={2}
                value={notas}
                onChange={e => onNotas(codigo, e.target.value)}
                placeholder="Notas opcionales: describe el hallazgo o la razón del resultado…"
                className="w-full resize-none rounded border border-gray-200 px-2 py-1 text-xs text-gray-700 placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#005fcc]"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Sub-componente: sección de principio (details/summary) ──────────────────

interface PrincipalSectionProps {
  principio: WcagPrincipio
  estado: EstadoMap
  onResultado: (codigo: string, resultado: WcagResultado) => void
  onNotas: (codigo: string, notas: string) => void
}

function PrincipioSection({ principio, estado, onResultado, onNotas }: PrincipalSectionProps) {
  const criterios = getCriteriosByPrincipio(principio)
  const meta      = PRINCIPIO_META[principio]

  const evaluados = criterios.filter(c => (estado.get(c.codigo)?.resultado ?? 'no_evaluado') !== 'no_evaluado')
  const cumplen   = evaluados.filter(c => estado.get(c.codigo)?.resultado === 'cumple')
  const noCumplen = evaluados.filter(c => estado.get(c.codigo)?.resultado === 'no_cumple')

  return (
    <details className="group rounded-lg border border-gray-200 bg-white" name="wcag-principio">
      <summary
        className={`flex cursor-pointer list-none items-center justify-between gap-3 rounded-lg p-4 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#005fcc] ${meta.bg}`}
      >
        <div className="flex items-center gap-3">
          {/* Chevron */}
          <svg
            className="h-4 w-4 shrink-0 text-gray-400 transition-transform group-open:rotate-90"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 0 1 .02-1.06L11.168 10 7.23 6.29a.75.75 0 1 1 1.04-1.08l4.5 4.25a.75.75 0 0 1 0 1.08l-4.5 4.25a.75.75 0 0 1-1.06-.02Z" clipRule="evenodd" />
          </svg>
          <span className={`font-semibold ${meta.color}`}>{principio}</span>
          <span className="text-xs text-gray-500">{criterios.length} criterios</span>
        </div>

        {/* Mini stats */}
        <div className="flex items-center gap-2 text-xs" aria-label={`${evaluados.length} evaluados`}>
          {evaluados.length > 0 && (
            <>
              <span className="font-medium text-green-700">{cumplen.length}✓</span>
              {noCumplen.length > 0 && (
                <span className="font-medium text-red-600">{noCumplen.length}✗</span>
              )}
            </>
          )}
          <span className="text-gray-400">{evaluados.length}/{criterios.length}</span>
        </div>
      </summary>

      <div className="px-4 pb-2 pt-1">
        {criterios.map(c => (
          <CriterioRow
            key={c.codigo}
            codigo={c.codigo}
            nombre={c.nombre}
            nivel={c.nivel}
            es_21={c.es_21}
            resultado={getResultado(estado, c.codigo)}
            notas={getNotas(estado, c.codigo)}
            onResultado={onResultado}
            onNotas={onNotas}
          />
        ))}
      </div>
    </details>
  )
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function WcagCriteriaPanel() {
  const [estado, setEstado] = React.useState<EstadoMap>(initialState)

  const setResultado = React.useCallback((codigo: string, resultado: WcagResultado) => {
    setEstado(prev => {
      const next = new Map(prev)
      const entry = next.get(codigo) ?? { resultado: 'no_evaluado', notas: '' }
      next.set(codigo, { ...entry, resultado })
      return next
    })
  }, [])

  const setNotas = React.useCallback((codigo: string, notas: string) => {
    setEstado(prev => {
      const next = new Map(prev)
      const entry = next.get(codigo) ?? { resultado: 'no_evaluado', notas: '' }
      next.set(codigo, { ...entry, notas })
      return next
    })
  }, [])

  // Resumen global
  const total    = 50
  const evaluados = [...estado.values()].filter(e => e.resultado !== 'no_evaluado')
  const cumplen  = evaluados.filter(e => e.resultado === 'cumple').length
  const noCumplen = evaluados.filter(e => e.resultado === 'no_cumple').length
  const puntaje  = calcularPuntajeWcag(estado)

  const jsonValue = React.useMemo(() => {
    const obj: Record<string, { resultado: WcagResultado; notas: string }> = {}
    for (const [codigo, entry] of estado) {
      if (entry.resultado !== 'no_evaluado' || entry.notas) {
        obj[codigo] = { resultado: entry.resultado, notas: entry.notas }
      }
    }
    return JSON.stringify(obj)
  }, [estado])

  return (
    <fieldset className="space-y-3">
      <legend className="mb-3 text-sm font-semibold text-gray-900">
        Evaluación por criterio WCAG 2.1 AA
        <span className="ml-1.5 text-xs font-normal text-gray-500">(50 criterios — niveles A y AA)</span>
      </legend>

      {/* Barra de progreso global */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
          <div className="flex items-center gap-4">
            <span className="text-gray-600">
              <strong className="text-gray-900">{evaluados.length}</strong>
              <span className="text-gray-500">/{total} evaluados</span>
            </span>
            {evaluados.length > 0 && (
              <>
                <span className="text-green-700 font-medium">{cumplen} cumplen</span>
                {noCumplen > 0 && <span className="text-red-600 font-medium">{noCumplen} no cumplen</span>}
              </>
            )}
          </div>
          {puntaje !== null && (
            <span className={`font-semibold ${puntaje >= 0.9 ? 'text-green-700' : puntaje >= 0.7 ? 'text-amber-600' : 'text-red-600'}`}>
              {Math.round(puntaje * 100)}% de conformidad
            </span>
          )}
        </div>
        {evaluados.length > 0 && (
          <div
            role="progressbar"
            aria-valuenow={evaluados.length}
            aria-valuemin={0}
            aria-valuemax={total}
            aria-label={`${evaluados.length} de ${total} criterios evaluados`}
            className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-200"
          >
            <div
              className="h-full rounded-full bg-[#005fcc] transition-all"
              style={{ width: `${(evaluados.length / total) * 100}%` }}
              aria-hidden="true"
            />
          </div>
        )}
      </div>

      {/* Secciones por principio */}
      {PRINCIPIOS.map(p => (
        <PrincipioSection
          key={p}
          principio={p}
          estado={estado}
          onResultado={setResultado}
          onNotas={setNotas}
        />
      ))}

      {/* Hidden input serializado — lo lee el server action */}
      <input type="hidden" name="wcag_results" value={jsonValue} />
    </fieldset>
  )
}
