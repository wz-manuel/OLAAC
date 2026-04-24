'use client'

import * as React from 'react'

interface DownloadCertificateButtonProps {
  courseId: string
  courseTitle: string
}

type State = 'idle' | 'loading' | 'error'

/**
 * DownloadCertificateButton
 * ─────────────────────────
 * Botón que llama a GET /api/certificados/generar?courseId=xxx
 * y fuerza la descarga del PDF resultante en el navegador.
 *
 * Solo se muestra cuando el enrollment.estado === 'completado';
 * la lógica de visibilidad vive en el Server Component padre.
 *
 * WCAG:
 *  - 2.1.1: operable por teclado (botón nativo)
 *  - 4.1.3: estado de carga anunciado con aria-busy + aria-label dinámico
 *  - 1.4.3: contraste mínimo AA en todos los estados
 */
export function DownloadCertificateButton({
  courseId,
  courseTitle,
}: DownloadCertificateButtonProps) {
  const [state, setState] = React.useState<State>('idle')
  const [errorMsg, setErrorMsg] = React.useState<string>('')

  async function handleDownload() {
    setState('loading')
    setErrorMsg('')

    try {
      const response = await fetch(
        `/api/certificados/generar?courseId=${encodeURIComponent(courseId)}`
      )

      if (!response.ok) {
        const body = await response.json().catch(() => ({})) as { error?: string }
        throw new Error(body.error ?? `Error ${response.status}`)
      }

      // Disparar descarga desde el Blob retornado
      const blob = await response.blob()
      const url  = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href     = url
      link.download = `certificado-olaac-${courseTitle.slice(0, 30).replace(/\s+/g, '-').toLowerCase()}.pdf`
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)

      setState('idle')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error desconocido'
      setErrorMsg(msg)
      setState('error')
    }
  }

  return (
    <div className="space-y-2">
      <button
        onClick={handleDownload}
        disabled={state === 'loading'}
        aria-busy={state === 'loading'}
        aria-label={
          state === 'loading'
            ? 'Generando certificado, por favor espera…'
            : `Descargar certificado del curso ${courseTitle}`
        }
        className="inline-flex items-center gap-2 rounded-lg bg-[#252858] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#2d3476] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005fcc] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {state === 'loading' ? (
          <>
            {/* Spinner accesible */}
            <svg
              className="h-4 w-4 animate-spin"
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
            <span aria-hidden="true">Generando PDF…</span>
          </>
        ) : (
          <>
            <svg
              className="h-4 w-4 shrink-0"
              aria-hidden="true"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M10.75 2.75a.75.75 0 0 0-1.5 0v8.614L6.295 8.235a.75.75 0 1 0-1.09 1.03l4.25 4.5a.75.75 0 0 0 1.09 0l4.25-4.5a.75.75 0 0 0-1.09-1.03l-2.955 3.129V2.75Z" />
              <path d="M3.5 12.75a.75.75 0 0 0-1.5 0v2.5A2.75 2.75 0 0 0 4.75 18h10.5A2.75 2.75 0 0 0 18 15.25v-2.5a.75.75 0 0 0-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5Z" />
            </svg>
            Descargar certificado (PDF)
          </>
        )}
      </button>

      {/* Mensaje de error — anunciado por lectores de pantalla */}
      {state === 'error' && (
        <p
          role="alert"
          aria-live="assertive"
          className="text-sm text-red-700"
        >
          No se pudo generar el certificado: {errorMsg}. Intenta de nuevo.
        </p>
      )}
    </div>
  )
}
