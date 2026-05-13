'use client'

import { useState } from 'react'

// Handles oficiales de OLAAC (extraídos del footer)
const OLAAC_HANDLES = {
  x: 'a11yLatam',                              // https://x.com/a11yLatam
  linkedin: 'linkedin.com/company/olaac',       // https://www.linkedin.com/company/olaac/
  facebook: 'ObservatorioOLAC',                 // https://www.facebook.com/ObservatorioOLAC
} as const

interface Props {
  siteName: string
  pais: string
  score: number | null
  alias: string
  totalViolations: number
}

function buildTexts(
  siteName: string,
  pais: string,
  score: number | null,
  totalViolations: number,
  pageUrl: string,
) {
  const scoreText = score !== null ? `${score}/100` : 'sin dato'
  const countryTag = '#' + pais.replace(/\s+/g, '')

  const violLine =
    totalViolations > 0
      ? `⚠️ ${totalViolations} barrera${totalViolations !== 1 ? 's' : ''} de alto impacto detectada${totalViolations !== 1 ? 's' : ''}.`
      : '✅ Sin barreras críticas detectadas.'

  // ── X ──────────────────────────────────────────────────────────────────────
  // Límite: 280 chars. URLs cuentan siempre como 23. Emojis como 2.
  // El parámetro &via añade "vía @a11yLatam" automáticamente (+16 chars aprox.)
  // por eso el texto propio debe quedar en ~260 chars.
  const xText = [
    `📊 Estoy observando accesibilidad web en LATAM. Te invito a verlo:`,
    `${siteName} (${pais}): ${scoreText}`,
    violLine,
    `👉 ${pageUrl}`,
    `#OlaacScores #AccesibilidadWeb #WCAG #A11y #LATAM ${countryTag}`,
  ].join('\n\n')

  // ── LinkedIn ────────────────────────────────────────────────────────────────
  // /shareArticle acepta title + summary como parámetros de texto.
  const linkedInTitle =
    `Accesibilidad digital: ${siteName} (${pais}) — ${scoreText}`

  const linkedInSummary = [
    `Estoy observando los resultados de accesibilidad web en América Latina y te invito a conocerlos.`,
    `${siteName} (${pais}) obtuvo ${scoreText} en la prueba automática del Observatorio OLAAC.`,
    totalViolations > 0
      ? `Se detectaron ${totalViolations} barrera${totalViolations !== 1 ? 's' : ''} de alto impacto que pueden impedir el acceso a personas con discapacidad.`
      : 'No se detectaron barreras críticas en esta medición.',
    `La accesibilidad no es opcional: es un derecho que garantiza la inclusión digital de millones de personas en LATAM.`,
    `Sigue el observatorio → ${OLAAC_HANDLES.linkedin}`,
    `#OlaacScores #AccesibilidadWeb #WCAG #A11y #InclusionDigital #AccesibilidadDigital #LATAM ${countryTag}`,
  ].join('\n\n')

  // ── Facebook ────────────────────────────────────────────────────────────────
  // sharer.php acepta &quote= para pre-rellenar el texto del post.
  const facebookQuote = [
    `Estoy observando los resultados de accesibilidad digital en América Latina y te invito a conocerlos. 🌎`,
    `${siteName} (${pais}): ${scoreText} en la prueba automática de accesibilidad.`,
    violLine,
    `Sigue al observatorio: @${OLAAC_HANDLES.facebook}`,
    `#OlaacScores #AccesibilidadWeb #LATAM #InclusionDigital ${countryTag}`,
  ].join('\n\n')

  return { xText, linkedInTitle, linkedInSummary, facebookQuote }
}

export function ShareButtons({ siteName, pais, score, alias: _alias, totalViolations }: Props) {
  const [copied, setCopied] = useState(false)

  function openShare(buildUrl: (pageUrl: string) => string) {
    window.open(buildUrl(window.location.href), '_blank', 'noopener,noreferrer,width=620,height=520')
  }

  async function copyLink() {
    await navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  return (
    <section aria-labelledby="share-heading" className="mb-8">
      <h2 id="share-heading" className="mb-3 text-base font-semibold text-gray-900">
        Compartir este resultado
      </h2>

      <div className="flex flex-wrap items-center gap-3">

        {/* ── LinkedIn ───────────────────────────────────────────────────────── */}
        <button
          type="button"
          onClick={() =>
            openShare((pageUrl) => {
              const { linkedInTitle, linkedInSummary } = buildTexts(siteName, pais, score, totalViolations, pageUrl)
              return (
                'https://www.linkedin.com/shareArticle?mini=true' +
                `&url=${encodeURIComponent(pageUrl)}` +
                `&title=${encodeURIComponent(linkedInTitle)}` +
                `&summary=${encodeURIComponent(linkedInSummary)}` +
                `&source=${encodeURIComponent('OLAAC — Observatorio Latinoamericano de Accesibilidad')}`
              )
            })
          }
          className="inline-flex items-center gap-2 rounded-lg border border-[#0A66C2]/30 bg-[#0A66C2]/5 px-4 py-2 text-sm font-medium text-[#0A66C2] transition-colors hover:bg-[#0A66C2] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A66C2]"
          aria-label="Compartir en LinkedIn"
        >
          <LinkedInIcon />
          LinkedIn
        </button>

        {/* ── X ──────────────────────────────────────────────────────────────── */}
        <button
          type="button"
          onClick={() =>
            openShare((pageUrl) => {
              const { xText } = buildTexts(siteName, pais, score, totalViolations, pageUrl)
              // &via añade "vía @a11yLatam" al final del tweet
              return (
                `https://twitter.com/intent/tweet` +
                `?text=${encodeURIComponent(xText)}` +
                `&via=${OLAAC_HANDLES.x}`
              )
            })
          }
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-900 transition-colors hover:bg-gray-900 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-700"
          aria-label="Compartir en X (antes Twitter)"
        >
          <XIcon />
          X
        </button>

        {/* ── Facebook ───────────────────────────────────────────────────────── */}
        <button
          type="button"
          onClick={() =>
            openShare((pageUrl) => {
              const { facebookQuote } = buildTexts(siteName, pais, score, totalViolations, pageUrl)
              return (
                `https://www.facebook.com/sharer/sharer.php` +
                `?u=${encodeURIComponent(pageUrl)}` +
                `&quote=${encodeURIComponent(facebookQuote)}`
              )
            })
          }
          className="inline-flex items-center gap-2 rounded-lg border border-[#1877F2]/30 bg-[#1877F2]/5 px-4 py-2 text-sm font-medium text-[#1877F2] transition-colors hover:bg-[#1877F2] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1877F2]"
          aria-label="Compartir en Facebook"
        >
          <FacebookIcon />
          Facebook
        </button>

        {/* ── Copiar enlace ──────────────────────────────────────────────────── */}
        <button
          type="button"
          onClick={copyLink}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005fcc]"
          aria-label={copied ? 'Enlace copiado' : 'Copiar enlace al portapapeles'}
        >
          {copied ? <CheckIcon /> : <LinkIcon />}
          {copied ? 'Copiado' : 'Copiar enlace'}
        </button>

      </div>
    </section>
  )
}

// ── Iconos SVG ────────────────────────────────────────────────────────────────

function LinkedInIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  )
}

function XIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

function FacebookIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  )
}

function LinkIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 0 0-5.656 0l-4 4a4 4 0 1 0 5.656 5.656l1.102-1.101m-.758-4.899a4 4 0 0 0 5.656 0l4-4a4 4 0 0 0-5.656-5.656l-1.1 1.1" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4 shrink-0 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
    </svg>
  )
}
