import { Button } from '@olaac/ui'
import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Que el formato no limite el acceso a la lectura — FIL Culiacán 2026',
  description:
    'Invitación a las casas editoriales de la FIL Culiacán 2026: toma gratis el curso de libros accesibles en EPUB de la Academia OLAAC y publica tus títulos en la Biblioteca Inclusiva de Léelo.',
}

const CURSO_EPUB_URL = 'https://academia.olaac.org/cursos/leelo-creacion-epub-accesible'

const FICHA = [
  { dato: 'Costo', valor: 'Gratuito' },
  { dato: 'Duración', valor: '8 a 10 horas, a tu ritmo' },
  { dato: 'Modalidad', valor: 'En línea, autoaprendizaje' },
  { dato: 'Certificado', valor: 'Sí, al aprobar el examen final' },
  { dato: 'Requisitos', valor: 'Manejar un procesador de texto; no hace falta programar' },
]

const APRENDERAS = [
  'Preparar el manuscrito con estructura, idioma y texto alternativo correctos.',
  'Convertirlo en EPUB 3 con WordToEPUB.',
  'Completar navegación, descripciones de imágenes y metadatos de accesibilidad.',
  'Validar el libro con EPUBCheck y Ace by DAISY.',
  'Entregarlo siguiendo el flujo de publicación de Léelo.',
]

const PASOS = [
  {
    titulo: 'Toma el curso',
    descripcion: 'Regístrate gratis en la Academia OLAAC y cursa «Creación de libros accesibles en EPUB».',
  },
  {
    titulo: 'Produce tu EPUB accesible',
    descripcion: 'Aplica EPUB Accessibility 1.1 del W3C a tus títulos y valídalos con Ace by DAISY.',
  },
  {
    titulo: 'Publícalo en Léelo',
    descripcion: 'Súmate a la Red como institución aliada y comparte tus libros en la Biblioteca Inclusiva.',
  },
]

export default function Fil2026Page() {
  return (
    <div lang="es" className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <header className="mb-12">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logos/leelo-simple-positivo.svg"
          alt="Léelo"
          width={220}
          height={51}
          className="mb-6 h-auto w-48"
        />
        <p className="mb-3 text-sm font-medium uppercase tracking-widest text-[#005fcc]">
          4.ª Feria Internacional del Libro de Culiacán · 2026
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Que el formato no limite el acceso a la lectura
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          Ciegos Sinaloa IAP y el Observatorio Latinoamericano de Accesibilidad (OLAAC) invitan a las
          casas editoriales a publicar sus libros en formatos que todas las personas puedan leer.
        </p>
      </header>

      <section aria-labelledby="importa-heading" className="mb-12">
        <h2 id="importa-heading" className="mb-4 text-2xl font-semibold text-gray-900">
          ¿Por qué importa?
        </h2>
        <p className="text-gray-700">
          Hay más de <strong>180 millones</strong> de personas con discapacidad visual en el mundo y
          <strong> menos del 7 %</strong> de los libros publicados existe en un formato que puedan
          leer. Un libro accesible también sirve a personas con baja visión, dislexia, a quienes
          escuchan en voz alta y a quienes ajustan tamaño y contraste del texto.
        </p>
      </section>

      <section aria-labelledby="leelo-heading" className="mb-12">
        <h2 id="leelo-heading" className="mb-4 text-2xl font-semibold text-gray-900">
          Proyecto Léelo
        </h2>
        <p className="text-gray-700">
          Léelo es la Red por la Lectura Accesible que impulsan Ciegos Sinaloa IAP y OLAAC. Su
          Biblioteca Inclusiva ofrece cada libro en siete formatos (EPUB, audio MP3, video MP4, TXT,
          PDF, DOCX y RTF), gratis para lectores con discapacidad, y crece gracias a instituciones,
          editoriales y personas voluntarias que producen los títulos. Opera al amparo del Tratado de
          Marrakesh (2013).
        </p>
        <p className="mt-4">
          <Link className="font-medium text-[#005fcc] underline" href="/leelo">
            Conoce el Proyecto Léelo
          </Link>
        </p>
      </section>

      <section aria-labelledby="curso-heading" className="mb-12">
        <h2 id="curso-heading" className="mb-4 text-2xl font-semibold text-gray-900">
          Academia OLAAC: Creación de libros accesibles en EPUB
        </h2>
        <p className="text-gray-700">
          Del manuscrito a un EPUB 3 que cumple EPUB Accessibility 1.1 del W3C, con herramientas
          gratuitas del Consorcio DAISY.
        </p>
        <dl className="mt-6 grid gap-x-6 gap-y-3 rounded-lg border border-gray-200 bg-gray-50 p-6 text-sm sm:grid-cols-[auto_1fr]">
          {FICHA.map(f => (
            <div key={f.dato} className="contents">
              <dt className="font-semibold text-gray-900">{f.dato}</dt>
              <dd className="text-gray-700">{f.valor}</dd>
            </div>
          ))}
        </dl>
        <h3 className="mt-6 text-lg font-semibold text-gray-900">Qué aprenderás</h3>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-gray-700">
          {APRENDERAS.map(a => (
            <li key={a}>{a}</li>
          ))}
        </ul>
        <div className="mt-6">
          <Button asChild>
            <Link href={CURSO_EPUB_URL}>Ir al curso gratuito</Link>
          </Button>
        </div>
      </section>

      <section
        aria-labelledby="pasos-heading"
        className="rounded-lg border border-[#005fcc]/20 bg-[#005fcc]/5 p-8"
      >
        <h2 id="pasos-heading" className="mb-6 text-2xl font-semibold text-gray-900">
          Tu editorial en tres pasos
        </h2>
        <ol className="space-y-4">
          {PASOS.map((paso, i) => (
            <li key={paso.titulo} className="flex gap-4">
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#252858] font-bold text-white"
                aria-hidden="true"
              >
                {i + 1}
              </span>
              <div>
                <h3 className="font-semibold text-gray-900">{paso.titulo}</h3>
                <p className="text-sm text-gray-700">{paso.descripcion}</p>
              </div>
            </li>
          ))}
        </ol>
        <p className="mt-6 text-sm text-gray-700">
          ¿Dudas? Escríbenos desde la página de{' '}
          <Link className="font-medium text-[#005fcc] underline" href="/contacto">
            contacto
          </Link>{' '}
          o visita{' '}
          <Link className="font-medium text-[#005fcc] underline" href="https://proyectoleelo.org/unete.html">
            Únete a la Red Léelo
          </Link>
          .
        </p>
      </section>
    </div>
  )
}
