import { Button } from '@olaac/ui'
import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Proyecto Léelo — Red por la Lectura Accesible',
  description:
    'Léelo es la Red por la Lectura Accesible que impulsan Ciegos Sinaloa IAP y OLAAC. Editoriales, bibliotecas y universidades producen libros accesibles para la Biblioteca Inclusiva LÉELO.',
}

const CURSO_EPUB_URL = 'https://academia.olaac.org/cursos/leelo-creacion-epub-accesible'

const CIFRAS = [
  { valor: '+180 M', label: 'personas con discapacidad visual en el mundo' },
  { valor: '<7 %', label: 'de los libros publicados existe en formato accesible' },
  { valor: '7', label: 'formatos en la Biblioteca Inclusiva: EPUB, MP3, MP4, TXT, PDF, DOCX y RTF' },
]

const PASOS = [
  {
    numero: '01',
    titulo: 'Toma el curso gratuito',
    descripcion:
      'En la Academia OLAAC, «Creación de libros accesibles en EPUB» te lleva del manuscrito a un EPUB 3 que cumple EPUB Accessibility 1.1 del W3C.',
  },
  {
    numero: '02',
    titulo: 'Produce tus libros accesibles',
    descripcion:
      'Con herramientas gratuitas del Consorcio DAISY (WordToEPUB, EPUBCheck, Ace by DAISY) conviertes y validas cada título antes de publicarlo.',
  },
  {
    numero: '03',
    titulo: 'Publícalos en Léelo',
    descripcion:
      'Súmate a la Red como institución aliada y comparte tus títulos en la Biblioteca Inclusiva LÉELO, gratuita para lectores con discapacidad.',
  },
]

const BENEFICIOS = [
  'Tu catálogo llega a lectores con ceguera, baja visión, dislexia y otras dificultades lectoras.',
  'Un EPUB bien hecho funciona con lectores de pantalla, líneas braille y síntesis de voz.',
  'El Tratado de Marrakesh (2013), ratificado por México, respalda la difusión de obras en formatos accesibles.',
  'Producir accesible desde el origen cuesta menos que corregir después.',
]

export default function LeeloPage() {
  return (
    <div lang="es" className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <header className="mb-12 text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logos/leelo-simple-positivo.svg"
          alt="Léelo"
          width={220}
          height={51}
          className="mx-auto mb-6 h-auto w-56"
        />
        <p className="mb-3 text-sm font-medium uppercase tracking-widest text-[#005fcc]">
          Ciegos Sinaloa IAP · OLAAC
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Proyecto Léelo: Red por la Lectura Accesible
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
          Una red colaborativa que produce y difunde libros en múltiples formatos para personas con
          discapacidad visual o dificultad lectora. Su Biblioteca Inclusiva crece libro a libro gracias
          a instituciones, editoriales y personas voluntarias.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Button asChild>
            <Link href={CURSO_EPUB_URL}>Tomar el curso gratuito</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="https://proyectoleelo.org/unete.html">Unirme a la Red Léelo</Link>
          </Button>
        </div>
      </header>

      <section aria-labelledby="cifras-heading" className="mb-14">
        <h2 id="cifras-heading" className="mb-6 text-xl font-semibold text-gray-900">
          La «hambruna de libros» sigue siendo real
        </h2>
        <ul className="grid gap-6 sm:grid-cols-3">
          {CIFRAS.map(c => (
            <li key={c.valor} className="rounded-lg border border-gray-200 bg-white p-6 text-center">
              <p className="text-3xl font-bold text-[#252858]">{c.valor}</p>
              <p className="mt-1 text-sm text-gray-600">{c.label}</p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="editoriales-heading" className="mb-14">
        <h2 id="editoriales-heading" className="mb-8 text-xl font-semibold text-gray-900">
          Tu editorial en tres pasos
        </h2>
        <ol className="grid gap-6 sm:grid-cols-3">
          {PASOS.map(paso => (
            <li key={paso.numero} className="rounded-lg border border-gray-200 bg-white p-6">
              <span className="mb-3 block text-2xl font-bold text-[#005fcc]" aria-hidden="true">
                {paso.numero}
              </span>
              <h3 className="text-base font-semibold text-gray-900">{paso.titulo}</h3>
              <p className="mt-2 text-sm text-gray-600">{paso.descripcion}</p>
            </li>
          ))}
        </ol>
      </section>

      <section
        aria-labelledby="beneficios-heading"
        className="mb-14 rounded-lg border border-gray-200 bg-gray-50 p-8"
      >
        <h2 id="beneficios-heading" className="mb-4 text-lg font-semibold text-gray-900">
          ¿Por qué publicar en formato accesible?
        </h2>
        <ul className="list-disc space-y-2 pl-5 text-sm text-gray-700">
          {BENEFICIOS.map(b => (
            <li key={b}>{b}</li>
          ))}
        </ul>
      </section>

      <section
        aria-labelledby="mas-heading"
        className="rounded-lg border border-[#005fcc]/20 bg-[#005fcc]/5 p-8"
      >
        <h2 id="mas-heading" className="text-lg font-semibold text-gray-900">
          Conoce más
        </h2>
        <ul className="mt-4 space-y-2 text-sm">
          <li>
            <Link className="font-medium text-[#005fcc] underline" href="https://proyectoleelo.org">
              Biblioteca Inclusiva LÉELO (proyectoleelo.org)
            </Link>
          </li>
          <li>
            <Link className="font-medium text-[#005fcc] underline" href="https://proyectoleelo.org/metodologia.html">
              Metodología LÉELO
            </Link>
          </li>
          <li>
            <Link className="font-medium text-[#005fcc] underline" href={CURSO_EPUB_URL}>
              Curso «Creación de libros accesibles en EPUB» — Academia OLAAC
            </Link>
          </li>
          <li>
            <Link className="font-medium text-[#005fcc] underline" href="https://ciegossinaloa.org">
              Ciegos Sinaloa IAP
            </Link>
          </li>
        </ul>
      </section>

      <section aria-labelledby="impulsan-heading" className="mt-14">
        <h2 id="impulsan-heading" className="mb-4 text-center text-sm font-medium uppercase tracking-widest text-gray-600">
          Impulsan
        </h2>
        <ul className="flex flex-wrap items-stretch justify-center gap-4">
          <li className="flex h-28 w-56 items-center justify-center rounded-lg bg-[#252858] p-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logos/logo-ciegos-sinaloa.png" alt="ASCIS, Asociación de Ciegos Sinaloa" width={300} height={223} className="h-20 w-auto" />
          </li>
          <li className="flex h-28 w-56 items-center justify-center rounded-lg border border-gray-200 bg-white p-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logos/olaac.svg" alt="OLAAC, Observatorio Latinoamericano de Accesibilidad" width={335} height={135} className="h-auto w-40" />
          </li>
        </ul>
      </section>
    </div>
  )
}
