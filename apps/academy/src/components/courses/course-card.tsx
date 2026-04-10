import Link from 'next/link'

import { ProgressBar } from './progress-bar'

interface CourseCardProps {
  slug: string
  titulo: string
  descripcion: string | null
  lessonCount: number
  progress?: number // undefined = not enrolled
}

export function CourseCard({ slug, titulo, descripcion, lessonCount, progress }: CourseCardProps) {
  return (
    <article className="flex flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex-1">
        <h2 className="text-base font-semibold text-gray-900">
          <Link
            href={`/cursos/${slug}`}
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005fcc] focus-visible:rounded"
          >
            {titulo}
          </Link>
        </h2>
        {descripcion && (
          <p className="mt-2 text-sm text-gray-600 line-clamp-3">{descripcion}</p>
        )}
      </div>

      <div className="mt-4 space-y-3">
        <p className="text-xs text-gray-500">
          {lessonCount} {lessonCount === 1 ? 'lección' : 'lecciones'}
        </p>

        {progress !== undefined ? (
          <ProgressBar value={progress} />
        ) : (
          <Link
            href={`/cursos/${slug}`}
            className="inline-block rounded-md bg-[#005fcc] px-4 py-2 text-sm font-medium text-white hover:bg-[#004db3] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005fcc] focus-visible:ring-offset-2"
          >
            Ver curso
          </Link>
        )}
      </div>
    </article>
  )
}
