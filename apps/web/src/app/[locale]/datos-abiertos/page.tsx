import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Datos Abiertos — API pública de accesibilidad | OLAAC',
  description:
    'API REST pública con scores de accesibilidad de más de 50 sitios ' +
    'de gobiernos y universidades de América Latina. Gratis, sin registro, CORS abierto.',
}

// La landing no cambia — se genera estáticamente
export const dynamic = 'force-static'

// ── Datos de los endpoints para las cards ─────────────────────────────────────
const ENDPOINTS = [
  {
    method: 'GET',
    path: '/api/v1/sites',
    description: 'Lista todos los sitios con su score actual.',
    params: '?country=México&limit=10',
  },
  {
    method: 'GET',
    path: '/api/v1/sites/:alias',
    description: 'Detalle de un sitio: score, categoría, violaciones detectadas.',
    params: 'gob-mx',
  },
  {
    method: 'GET',
    path: '/api/v1/sites/:alias/history',
    description: 'Serie temporal de auditorías para graficar tendencias.',
    params: 'gob-mx/history',
  },
  {
    method: 'GET',
    path: '/api/v1/countries',
    description: 'Score promedio, total de sitios y alertas críticas por país.',
    params: '',
  },
  {
    method: 'GET',
    path: '/api/v1/stats',
    description: 'Estadísticas globales: promedio, total sitios, última auditoría.',
    params: '',
  },
]

const EXAMPLES = [
  {
    label: 'cURL',
    lang: 'bash',
    code: `# Sitios de México ordenados por score
curl "https://olaac.org/api/v1/sites?country=México"

# Historial de un sitio
curl "https://olaac.org/api/v1/sites/gob-mx/history"

# Estadísticas globales
curl "https://olaac.org/api/v1/stats"`,
  },
  {
    label: 'JavaScript',
    lang: 'javascript',
    code: `const BASE = 'https://olaac.org/api/v1'

// Obtener todos los sitios
const { data } = await fetch(\`\${BASE}/sites\`)
  .then(r => r.json())

// Score de un sitio específico
const { data: site } = await fetch(\`\${BASE}/sites/gob-mx\`)
  .then(r => r.json())

console.log(site.accessibility_score) // 87.5`,
  },
  {
    label: 'Python',
    lang: 'python',
    code: `import requests

BASE = "https://olaac.org/api/v1"

# Ranking por país
countries = requests.get(f"{BASE}/countries").json()
for c in countries["data"]:
    print(f"{c['pais']}: {c['avg_score']}/100")

# Serie temporal para análisis
history = requests.get(f"{BASE}/sites/gob-mx/history").json()
scores  = [s["accessibility_score"] for s in history["data"]]`,
  },
]

// ── Componente principal ───────────────────────────────────────────────────────
export default function DatosAbiertosPage() {
  return (
    <div className="min-h-screen">

      {/* ── Hero ──────────────────────────────────────────────────────────────── */}
      <section className="bg-[#252858] text-white">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20">

          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium uppercase tracking-widest text-white/80">
            <span aria-hidden="true">●</span>
            <span>API pública · v1.0</span>
          </div>

          <h1 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Datos abiertos de accesibilidad
            <br />
            <span className="text-[#30BCEE]">en América Latina</span>
          </h1>

          <p className="mb-8 max-w-2xl text-base text-white/80 sm:text-lg">
            Scores Lighthouse, violaciones WCAG y tendencias históricas de más de
            50 sitios web de gobiernos y universidades de 14 países.
            <strong className="text-white"> Gratis. Sin registro. CORS abierto.</strong>
          </p>

          <div className="flex flex-wrap gap-3">
            <a
              href="/api/v1"
              className="inline-flex items-center gap-2 rounded-lg bg-[#30BCEE] px-5 py-2.5 text-sm font-semibold text-[#252858] shadow-sm hover:bg-[#26aad6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#252858] transition-colors"
            >
              Explorar API
              <svg className="h-4 w-4" aria-hidden="true" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10Z" clipRule="evenodd" />
              </svg>
            </a>
            <a
              href="https://github.com/olaac/webolaac/blob/main/docs/api-v1.md"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-white/30 px-5 py-2.5 text-sm font-medium text-white hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#252858] transition-colors"
            >
              Documentación completa
              <span className="sr-only">(abre en nueva pestaña)</span>
              <svg className="h-4 w-4" aria-hidden="true" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.25 5.5a.75.75 0 0 0-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 0 0 .75-.75v-4a.75.75 0 0 1 1.5 0v4A2.25 2.25 0 0 1 12.75 17h-8.5A2.25 2.25 0 0 1 2 14.75v-8.5A2.25 2.25 0 0 1 4.25 4h5a.75.75 0 0 1 0 1.5h-5Z" clipRule="evenodd" />
                <path fillRule="evenodd" d="M6.194 12.753a.75.75 0 0 0 1.06.053L16.5 4.44v2.81a.75.75 0 0 0 1.5 0v-4.5a.75.75 0 0 0-.75-.75h-4.5a.75.75 0 0 0 0 1.5h2.553l-9.056 8.194a.75.75 0 0 0-.053 1.06Z" clipRule="evenodd" />
              </svg>
            </a>
          </div>

          {/* Stats rápidas */}
          <dl className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: 'Sitios monitoreados', value: '51+' },
              { label: 'Países de LATAM',     value: '14'  },
              { label: 'Actualización',        value: 'Semanal' },
              { label: 'Licencia',             value: 'CC BY 4.0' },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl bg-white/10 px-4 py-3">
                <dt className="text-xs text-white/60">{stat.label}</dt>
                <dd className="mt-0.5 text-lg font-bold text-white">{stat.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ── Para quién es ─────────────────────────────────────────────────────── */}
      <section aria-labelledby="audiences-heading" className="bg-gray-50 py-14">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <h2 id="audiences-heading" className="mb-8 text-center text-xl font-semibold text-gray-900">
            Diseñado para quienes trabajan con datos
          </h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              {
                icon: '🔬',
                title: 'Investigadores y académicos',
                description:
                  'Descarga series temporales de scores para analizar la evolución de la accesibilidad digital en la región.',
              },
              {
                icon: '💻',
                title: 'Desarrolladores',
                description:
                  'Integra los datos en tus aplicaciones, dashboards o visualizaciones. CORS abierto, sin token.',
              },
              {
                icon: '📰',
                title: 'Periodistas y ONGs',
                description:
                  'Accede a rankings por país y alertas críticas para informar el estado de la accesibilidad en servicios públicos.',
              },
            ].map((card) => (
              <div
                key={card.title}
                className="rounded-xl border border-gray-200 bg-white p-6"
              >
                <div className="mb-3 text-2xl" aria-hidden="true">{card.icon}</div>
                <h3 className="mb-2 font-semibold text-gray-900">{card.title}</h3>
                <p className="text-sm text-gray-600">{card.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Endpoints ─────────────────────────────────────────────────────────── */}
      <section aria-labelledby="endpoints-heading" className="py-14">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <h2 id="endpoints-heading" className="mb-2 text-xl font-semibold text-gray-900">
            Endpoints disponibles
          </h2>
          <p className="mb-8 text-sm text-gray-700">
            URL base: <code className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs">https://olaac.org/api/v1</code>
          </p>

          <div className="space-y-3">
            {ENDPOINTS.map((ep) => (
              <div
                key={ep.path}
                className="rounded-xl border border-gray-200 bg-white p-4 sm:flex sm:items-start sm:gap-4"
              >
                <span className="mb-2 inline-flex shrink-0 items-center rounded-md bg-[#005fcc]/10 px-2 py-0.5 font-mono text-xs font-semibold text-[#005fcc] sm:mb-0">
                  {ep.method}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-sm text-gray-900">{ep.path}</p>
                  <p className="mt-0.5 text-sm text-gray-500">{ep.description}</p>
                </div>
                <a
                  href={`/api/v1/${ep.params ? ep.path.replace('/api/v1/', '').replace(':alias', ep.params.split('/')[0] ?? 'gob-mx').replace('/history', ep.params.includes('history') ? '/history' : '') : ep.path.replace('/api/v1/', '')}`}
                  className="mt-2 shrink-0 text-xs text-[#005fcc] underline hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005fcc] focus-visible:rounded sm:mt-0"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Probar →
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Ejemplos de código ────────────────────────────────────────────────── */}
      <section aria-labelledby="examples-heading" className="bg-gray-50 py-14">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <h2 id="examples-heading" className="mb-8 text-xl font-semibold text-gray-900">
            Ejemplos rápidos
          </h2>

          <div className="grid gap-6 lg:grid-cols-3">
            {EXAMPLES.map((ex) => (
              <div key={ex.label} className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                <div className="border-b border-gray-200 bg-gray-50 px-4 py-2">
                  <span className="text-xs font-semibold text-gray-700">{ex.label}</span>
                </div>
                {/* tabIndex permite navegación de teclado en la región scrollable */}
                <div
                  role="region"
                  aria-label={`Ejemplo de código: ${ex.label}`}
                  tabIndex={0}
                  className="overflow-x-auto bg-[#1e1e2e]"
                >
                  <pre className="p-4 text-xs leading-relaxed text-gray-300">
                    <code>{ex.code}</code>
                  </pre>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Políticas ─────────────────────────────────────────────────────────── */}
      <section aria-labelledby="policies-heading" className="py-14">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <h2 id="policies-heading" className="mb-8 text-xl font-semibold text-gray-900">
            Políticas de uso
          </h2>

          <dl className="grid gap-6 sm:grid-cols-2">
            {[
              {
                term: 'Autenticación',
                def:  'No requerida. La API es completamente pública.',
              },
              {
                term: 'CORS',
                def:  'Access-Control-Allow-Origin: * — puedes consumirla directamente desde el navegador.',
              },
              {
                term: 'Rate limit',
                def:  '120 peticiones por minuto por IP. Para usos de investigación, escríbenos.',
              },
              {
                term: 'Caché',
                def:  'Respuestas cacheadas 1 hora en CDN. Los datos se actualizan cada domingo.',
              },
              {
                term: 'Formato',
                def:  'JSON exclusivamente. Content-Type: application/json.',
              },
              {
                term: 'Licencia',
                def:  'CC BY 4.0 — libre para usar, distribuir y adaptar citando a OLAAC.',
              },
            ].map((item) => (
              <div key={item.term} className="rounded-xl border border-gray-200 bg-white p-5">
                <dt className="mb-1 text-sm font-semibold text-gray-900">{item.term}</dt>
                <dd className="text-sm text-gray-600">{item.def}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ── CTA final ─────────────────────────────────────────────────────────── */}
      <section className="border-t border-gray-200 bg-gray-50 py-12">
        <div className="mx-auto max-w-5xl px-4 text-center sm:px-6">
          <h2 className="mb-2 text-lg font-semibold text-gray-900">
            ¿Tienes preguntas o quieres más datos?
          </h2>
          <p className="mb-6 text-sm text-gray-600">
            Abre un ticket o escríbenos — trabajamos con investigadores, periodistas y OSC.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/tickets/nuevo"
              className="inline-flex items-center rounded-lg bg-[#252858] px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-[#2d3476] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005fcc] focus-visible:ring-offset-2 transition-colors"
            >
              Abrir ticket
            </Link>
            <a
              href="https://github.com/olaac/webolaac/blob/main/docs/api-v1.md"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005fcc] focus-visible:ring-offset-2 transition-colors"
            >
              Documentación completa
              <span className="sr-only">(abre en nueva pestaña)</span>
            </a>
          </div>
        </div>
      </section>

    </div>
  )
}
