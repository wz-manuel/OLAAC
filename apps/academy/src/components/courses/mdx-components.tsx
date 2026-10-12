import { useTranslations } from 'next-intl'

// Componentes disponibles dentro del MDX de las lecciones (lessons.contenido).
// next-mdx-remote bloquea las expresiones JS, así que todas las props son cadenas.

interface VideoProps {
  /** ID del video en YouTube */
  id: string
  titulo: string
  /** Autoría y licencia, p. ej. "W3C Web Accessibility Initiative (WAI)" */
  credito: string
  /** URL de la página original, donde está la transcripción */
  fuente: string
}

export function Video({ id, titulo, credito, fuente }: VideoProps) {
  const t = useTranslations('lesson')

  return (
    <figure className="not-prose my-8">
      <div className="aspect-video overflow-hidden rounded-lg border border-gray-200 bg-gray-900">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${id}?rel=0&hl=es&cc_lang_pref=es&cc_load_policy=1`}
          title={t('videoTitulo', { titulo })}
          loading="lazy"
          allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
          className="h-full w-full"
        />
      </div>
      <figcaption className="mt-2 text-sm text-gray-600">
        <span className="font-medium text-gray-900">{titulo}</span> · {credito} ·{' '}
        <a
          href={fuente}
          className="text-[#005fcc] underline hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005fcc] focus-visible:rounded"
        >
          {t('videoTranscripcion')}
        </a>
      </figcaption>
    </figure>
  )
}

interface FiguraProps {
  src: string
  alt: string
  /** Pie visible: qué muestra la imagen y por qué importa */
  pie: string
  credito: string
  /** URL del documento de origen */
  fuente: string
}

export function Figura({ src, alt, pie, credito, fuente }: FiguraProps) {
  const t = useTranslations('lesson')

  return (
    <figure className="not-prose my-8">
      {/* Imágenes remotas de terceros (W3C): next/image exigiría declarar cada host */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className="mx-auto max-h-[28rem] w-auto max-w-full rounded-lg border border-gray-200 bg-white p-3"
      />
      <figcaption className="mt-2 text-sm text-gray-600">
        {pie}{' '}
        <span className="text-gray-500">
          {t('imagenFuente')}{' '}
          <a
            href={fuente}
            className="text-[#005fcc] underline hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005fcc] focus-visible:rounded"
          >
            {credito}
          </a>
          .
        </span>
      </figcaption>
    </figure>
  )
}

// Las tablas anchas se desplazan dentro de su propio contenedor (enfocable con teclado)
// para que la página no necesite desplazamiento horizontal en pantallas estrechas.
function Tabla(props: React.ComponentProps<'table'>) {
  const t = useTranslations('lesson')

  return (
    <div
      role="region"
      aria-label={t('tablaDesplazable')}
      tabIndex={0}
      className="overflow-x-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005fcc]"
    >
      <table {...props} />
    </div>
  )
}

export const lessonMdxComponents = { Video, Figura, table: Tabla }
