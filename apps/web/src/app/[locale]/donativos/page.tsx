import { Button } from '@olaac/ui'
import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Apoya a OLAAC — Donativos',
  description:
    'Con tu donativo financiamos becas para organizaciones sin recursos, mantenemos la infraestructura del observatorio y formamos auditores voluntarios en toda América Latina.',
}

const USOS = [
  {
    porcentaje: '45 %',
    titulo: 'Becas del Distintivo',
    descripcion:
      'Financiamos el acceso gratuito al programa de certificación para ONGs, organizaciones de personas con discapacidad y organismos públicos sin presupuesto.',
  },
  {
    porcentaje: '30 %',
    titulo: 'Infraestructura y herramientas',
    descripcion:
      'Mantenemos el observatorio, el motor de auditorías Lighthouse, la base de datos pública y la Academia OLAAC operando sin interrupciones.',
  },
  {
    porcentaje: '25 %',
    titulo: 'Formación de auditores',
    descripcion:
      'Capacitamos y certificamos a la red de voluntarios que realizan evaluaciones independientes en toda la región.',
  },
]

const NIVELES = [
  {
    id: 'individual',
    nombre: 'Apoyo individual',
    monto: 'USD 10 / mes',
    descripcion: 'Cubre el costo mensual de auditar 3 sitios web en el observatorio.',
    destacado: false,
  },
  {
    id: 'colaborador',
    nombre: 'Colaborador',
    monto: 'USD 50 / mes',
    descripcion:
      'Financia una beca parcial para que una organización sin fines de lucro acceda al Distintivo.',
    destacado: true,
  },
  {
    id: 'patrocinador',
    nombre: 'Patrocinador',
    monto: 'USD 200 / mes',
    descripcion:
      'Cubre una beca completa del Distintivo y apareces como patrocinador activo en el observatorio.',
    destacado: false,
  },
]

export default function DonativosPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">

      {/* Hero */}
      <header className="mb-16 text-center">
        <p className="mb-3 text-sm font-medium uppercase tracking-widest text-[#005fcc]">
          Apoya la misión
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
          La accesibilidad en Latinoamérica<br className="hidden sm:block" /> necesita tu apoyo
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
          OLAAC es un observatorio independiente y sin fines de lucro. Los donativos nos
          permiten mantener la infraestructura pública, financiar becas para organizaciones
          sin recursos y seguir formando auditores voluntarios en toda la región.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Button asChild size="lg">
            <a href="#como-donar">Hacer un donativo</a>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/distintivo/solicitar">Solicitar beca del Distintivo</Link>
          </Button>
        </div>
      </header>

      {/* Impacto en números */}
      <section aria-labelledby="impacto-heading" className="mb-16">
        <h2 id="impacto-heading" className="sr-only">Impacto actual del observatorio</h2>
        <dl className="grid gap-6 sm:grid-cols-3">
          {[
            { cifra: '51', label: 'Sitios monitoreados', sublabel: 'en 14 países' },
            { cifra: '100 %', label: 'Código abierto', sublabel: 'y datos públicos' },
            { cifra: '0', label: 'Publicidad', sublabel: 'nunca la habrá' },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-xl border border-gray-200 bg-white p-6 text-center"
            >
              <dt className="text-4xl font-extrabold text-[#252858]">{item.cifra}</dt>
              <dd className="mt-2 text-sm font-semibold text-gray-900">{item.label}</dd>
              <dd className="text-xs text-gray-500">{item.sublabel}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Uso de fondos */}
      <section aria-labelledby="uso-heading" className="mb-16">
        <h2 id="uso-heading" className="mb-2 text-2xl font-bold text-gray-900">
          ¿En qué se usan los donativos?
        </h2>
        <p className="mb-8 text-gray-600">
          Publicamos nuestros informes financieros anualmente. Así funciona el 100 % de cada
          donativo recibido:
        </p>
        <div className="grid gap-6 sm:grid-cols-3">
          {USOS.map((uso) => (
            <div
              key={uso.titulo}
              className="rounded-xl border border-gray-200 bg-white p-6"
            >
              <p className="text-3xl font-extrabold text-[#005fcc]">{uso.porcentaje}</p>
              <h3 className="mt-3 text-sm font-semibold text-gray-900">{uso.titulo}</h3>
              <p className="mt-1.5 text-sm text-gray-600">{uso.descripcion}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Niveles de donación */}
      <section aria-labelledby="niveles-heading" className="mb-16">
        <h2 id="niveles-heading" className="mb-2 text-2xl font-bold text-gray-900">
          Elige cómo quieres contribuir
        </h2>
        <p className="mb-8 text-gray-600">
          Cualquier monto ayuda. Los niveles son sugeridos; puedes donar lo que prefieras.
        </p>
        <div className="grid gap-6 sm:grid-cols-3">
          {NIVELES.map((nivel) => (
            <div
              key={nivel.id}
              className={[
                'relative flex flex-col rounded-xl border p-6',
                nivel.destacado
                  ? 'border-[#005fcc] bg-[#005fcc]/5 ring-1 ring-[#005fcc]'
                  : 'border-gray-200 bg-white',
              ].join(' ')}
            >
              {nivel.destacado && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#005fcc] px-3 py-0.5 text-xs font-semibold text-white">
                  Más popular
                </span>
              )}
              <h3 className="text-sm font-semibold text-gray-900">{nivel.nombre}</h3>
              <p className="mt-2 text-2xl font-extrabold text-[#252858]">{nivel.monto}</p>
              <p className="mt-3 flex-1 text-sm text-gray-600">{nivel.descripcion}</p>
              <a
                href="#como-donar"
                className={[
                  'mt-6 inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005fcc] focus-visible:ring-offset-2',
                  nivel.destacado
                    ? 'bg-[#005fcc] text-white hover:bg-[#0050b0]'
                    : 'border border-[#005fcc] text-[#005fcc] hover:bg-blue-50',
                ].join(' ')}
              >
                Donar {nivel.monto.split(' ')[0]}
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* Cómo donar */}
      <section id="como-donar" aria-labelledby="metodos-heading" className="mb-16 scroll-mt-20">
        <h2 id="metodos-heading" className="mb-2 text-2xl font-bold text-gray-900">
          Cómo realizar tu donativo
        </h2>
        <p className="mb-8 text-gray-600">
          Aceptamos donativos en línea y transferencia bancaria. Todos los donativos son
          voluntarios y no deducibles de impuestos salvo que tu legislación local lo contemple.
        </p>
        <div className="grid gap-6 sm:grid-cols-2">

          {/* PayPal */}
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h3 className="text-base font-semibold text-gray-900">PayPal</h3>
            <p className="mt-2 text-sm text-gray-600">
              La forma más sencilla desde cualquier país de América Latina o del mundo.
              Sin necesidad de cuenta bancaria.
            </p>
            <a
              href="https://paypal.me/olaac"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#0070ba] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#005ea6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0070ba] focus-visible:ring-offset-2"
            >
              Donar con PayPal
            </a>
          </div>

          {/* Transferencia / Contacto */}
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h3 className="text-base font-semibold text-gray-900">Transferencia bancaria</h3>
            <p className="mt-2 text-sm text-gray-600">
              Para donativos corporativos, en especie o si prefieres coordinar una
              transferencia directa, contáctanos. Te enviamos los datos en 24 h.
            </p>
            <Link
              href="/contacto"
              className="mt-5 inline-flex items-center gap-2 rounded-lg border border-[#005fcc] px-4 py-2.5 text-sm font-semibold text-[#005fcc] transition-colors hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005fcc] focus-visible:ring-offset-2"
            >
              Contactar al equipo →
            </Link>
          </div>

        </div>
      </section>

      {/* Transparencia */}
      <section
        aria-labelledby="transparencia-heading"
        className="mb-16 rounded-xl border border-gray-200 bg-gray-50 p-8"
      >
        <h2 id="transparencia-heading" className="text-xl font-bold text-gray-900">
          Compromisos de transparencia
        </h2>
        <ul className="mt-5 space-y-3 text-sm text-gray-700">
          {[
            'Publicamos un informe financiero anual con el detalle de todos los donativos recibidos.',
            'Nunca usaremos donativos para publicidad propia ni para gastos no relacionados con la misión.',
            'Los donativos destinados a becas son asignados íntegramente a las organizaciones beneficiadas.',
            'Cualquier patrocinador activo es listado públicamente con su nombre y monto de contribución.',
          ].map((item) => (
            <li key={item} className="flex gap-3">
              <span className="mt-0.5 shrink-0 text-[#005fcc]" aria-hidden="true">✓</span>
              {item}
            </li>
          ))}
        </ul>
      </section>

      {/* CTA final */}
      <section
        aria-labelledby="cta-donativos-heading"
        className="rounded-xl bg-[#252858] px-8 py-12 text-center text-white"
      >
        <h2 id="cta-donativos-heading" className="text-2xl font-bold">
          Juntos hacemos Latinoamérica más accesible
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-blue-100">
          Cada donativo, por pequeño que sea, nos permite seguir auditando, publicando
          datos abiertos y acompañando a más organizaciones en su camino hacia la
          inclusión digital.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <a
            href="#como-donar"
            className="inline-flex items-center rounded-lg bg-white px-6 py-3 text-sm font-semibold text-[#252858] transition-colors hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#252858]"
          >
            Hacer mi donativo
          </a>
          <Link
            href="/sobre-el-observatorio"
            className="inline-flex items-center rounded-lg border border-white/40 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#252858]"
          >
            Conocer el observatorio
          </Link>
        </div>
      </section>
    </div>
  )
}
