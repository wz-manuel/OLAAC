import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { DownloadCertificateButton } from '@/components/courses/download-certificate-button'
import { ProgressBar } from '@/components/courses/progress-bar'
import { enrollCourse } from '@/lib/actions/courses'
import { createClient } from '@/lib/supabase/server'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data: course } = await supabase
    .from('courses')
    .select('titulo, descripcion')
    .eq('slug', slug)
    .eq('published', true)
    .single()

  if (!course) return {}
  return { title: course.titulo, description: course.descripcion ?? undefined }
}

export default async function CourseDetailPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: course } = await supabase
    .from('courses')
    .select('id, slug, titulo, descripcion')
    .eq('slug', slug)
    .eq('published', true)
    .single()

  if (!course) notFound()
  // After notFound() TypeScript still sees course as potentially null; asserting here is safe.
  const resolvedCourse = course!

  const { data: lessons } = await supabase
    .from('lessons')
    .select('id, titulo, tipo, orden, duracion_min')
    .eq('course_id', resolvedCourse.id)
    .eq('published', true)
    .order('orden', { ascending: true })

  const { data: enrollment } = user
    ? await supabase
        .from('enrollments')
        .select('id, progress, estado')
        .eq('course_id', resolvedCourse.id)
        .eq('user_id', user.id)
        .single()
    : { data: null }

  const { data: lessonProgress } = user && enrollment
    ? await supabase
        .from('lesson_progress')
        .select('lesson_id')
        .eq('user_id', user.id)
        .eq('completed', true)
    : { data: [] }

  const completedSet = new Set((lessonProgress ?? []).map((lp) => lp.lesson_id))

  const typeLabel: Record<string, string> = {
    lectura: 'Lectura',
    video: 'Video',
    ejercicio: 'Ejercicio',
    evaluacion: 'Evaluación',
  }

  async function handleEnroll() {
    'use server'
    await enrollCourse(resolvedCourse.id)
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      {/* Breadcrumb */}
      <nav aria-label="Migas de pan" className="mb-8 text-sm text-gray-500">
        <ol className="flex items-center gap-1.5">
          <li>
            <Link href="/cursos" className="hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005fcc] focus-visible:rounded">
              Cursos
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="text-gray-900" aria-current="page">{resolvedCourse.titulo}</li>
        </ol>
      </nav>

      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{resolvedCourse.titulo}</h1>
        {resolvedCourse.descripcion && (
          <p className="mt-3 text-gray-600">{resolvedCourse.descripcion}</p>
        )}

        <div className="mt-6">
          {enrollment ? (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Tu progreso</p>
              <ProgressBar value={enrollment.progress} />
              {enrollment.estado === 'completado' && (
                <div className="space-y-3 rounded-lg border border-green-200 bg-green-50 p-4">
                  <p className="flex items-center gap-2 text-sm font-semibold text-green-800">
                    <svg className="h-4 w-4 shrink-0" aria-hidden="true" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
                    </svg>
                    ¡Curso completado!
                  </p>
                  <p className="text-xs text-green-700">
                    Ya puedes descargar tu certificado de finalización.
                  </p>
                  <DownloadCertificateButton
                    courseId={course.id}
                    courseTitle={course.titulo}
                  />
                </div>
              )}
            </div>
          ) : user ? (
            <form action={handleEnroll}>
              <button
                type="submit"
                className="rounded-md bg-[#005fcc] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#004db3] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005fcc] focus-visible:ring-offset-2"
              >
                Inscribirme en este curso
              </button>
            </form>
          ) : (
            <Link
              href={`/login?next=/cursos/${slug}`}
              className="inline-block rounded-md bg-[#005fcc] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#004db3] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005fcc] focus-visible:ring-offset-2"
            >
              Inicia sesión para inscribirte
            </Link>
          )}
        </div>
      </header>

      {/* Lesson list */}
      <section aria-labelledby="lessons-heading">
        <h2 id="lessons-heading" className="mb-4 text-xl font-semibold text-gray-900">
          Contenido del curso
        </h2>

        <ol className="divide-y divide-gray-200 rounded-xl border border-gray-200">
          {(lessons ?? []).map((lesson, idx) => {
            const isCompleted = completedSet.has(lesson.id)
            const canAccess = !!enrollment || !!user

            return (
              <li key={lesson.id} className="flex items-center gap-4 px-4 py-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-medium text-gray-600" aria-hidden="true">
                  {isCompleted ? (
                    <svg className="h-4 w-4 text-green-600" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    idx + 1
                  )}
                </span>

                <div className="flex-1 min-w-0">
                  {canAccess ? (
                    <Link
                      href={`/cursos/${slug}/leccion/${lesson.id}`}
                      className="text-sm font-medium text-gray-900 hover:text-[#005fcc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005fcc] focus-visible:rounded"
                    >
                      {lesson.titulo}
                      {isCompleted && <span className="sr-only"> (completada)</span>}
                    </Link>
                  ) : (
                    <span className="text-sm font-medium text-gray-500">{lesson.titulo}</span>
                  )}
                  <p className="mt-0.5 text-xs text-gray-400">
                    {typeLabel[lesson.tipo] ?? lesson.tipo}
                    {lesson.duracion_min ? ` · ${lesson.duracion_min} min` : ''}
                  </p>
                </div>

                {!canAccess && (
                  <svg className="h-4 w-4 shrink-0 text-gray-400" aria-label="Bloqueado" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
                  </svg>
                )}
              </li>
            )
          })}
        </ol>
      </section>
    </div>
  )
}
