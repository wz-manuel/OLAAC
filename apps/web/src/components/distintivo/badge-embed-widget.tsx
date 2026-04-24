'use client'

import { useState } from 'react'
import { DistintivoBadge } from './distintivo-badge'

type BadgeNivel = 'oro' | 'platino' | 'diamante'

interface BadgeEmbedWidgetProps {
  nivel: BadgeNivel
  folio: string
  nombreOrganizacion: string
}

export function BadgeEmbedWidget({ nivel, folio, nombreOrganizacion }: BadgeEmbedWidgetProps) {
  const [copied, setCopied] = useState(false)

  const verificationUrl = `https://olaac.org/distintivo/verificar/${folio}`
  const badgeImageUrl   = `https://olaac.org/api/distintivo/badge/${folio}.svg`

  const embedCode = `<a href="${verificationUrl}" target="_blank" rel="noopener noreferrer" title="Distintivo de Accesibilidad OLAAC — Nivel ${nivel}">
  <img src="${badgeImageUrl}" alt="Distintivo de Accesibilidad OLAAC nivel ${nivel} — ${nombreOrganizacion}" width="120" height="120" />
</a>`

  function copyCode() {
    navigator.clipboard.writeText(embedCode).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    })
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <h3 className="mb-4 text-base font-semibold text-gray-900">
        Tu sello de accesibilidad
      </h3>

      <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
        {/* Preview */}
        <div className="flex flex-col items-center gap-2">
          <DistintivoBadge nivel={nivel} nombreOrganizacion={nombreOrganizacion} size="lg" />
          <p className="text-xs text-gray-500">Vista previa del sello</p>
        </div>

        {/* Embed code */}
        <div className="flex-1 space-y-3">
          <p className="text-sm text-gray-600">
            Copia este código HTML e insértalo en tu sitio web para mostrar tu distinción de accesibilidad.
            El sello enlaza a la página de verificación pública.
          </p>

          <div className="relative">
            <label htmlFor="embed-code" className="mb-1 block text-xs font-medium text-gray-500">
              Código de inserción
            </label>
            <textarea
              id="embed-code"
              readOnly
              value={embedCode}
              rows={5}
              className="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 font-mono text-xs text-gray-700 focus:border-[#005fcc] focus:outline-none focus:ring-1 focus:ring-[#005fcc]"
            />
          </div>

          <button
            type="button"
            onClick={copyCode}
            aria-live="polite"
            className="inline-flex items-center gap-2 rounded-md bg-[#005fcc] px-4 py-2 text-sm font-medium text-white hover:bg-[#004fa0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005fcc] focus-visible:ring-offset-2"
          >
            {copied ? (
              <>
                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                </svg>
                ¡Copiado!
              </>
            ) : (
              <>
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <rect x="9" y="9" width="13" height="13" rx="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                Copiar código
              </>
            )}
          </button>

          <p className="text-xs text-gray-500">
            Folio de verificación: <strong className="font-mono">{folio}</strong>
          </p>
        </div>
      </div>
    </div>
  )
}
