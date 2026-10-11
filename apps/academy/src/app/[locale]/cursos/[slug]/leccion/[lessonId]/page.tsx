import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { getLocale, getTranslations } from 'next-intl/server'
import { MDXRemote } from 'next-mdx-remote/rsc'
import remarkGfm from 'remark-gfm'

import { CompleteLessonButton } from '@/components/courses/complete-lesson-button'
import { ProgressBar } from '@/components/courses/progress-bar'
import { getPathname, Link } from '@/i18n/navigation'
import { createClient } from '@/lib/supabase/server'

interface Props {
  params: Promise<{ slug: string; lessonId: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lessonId } = await params
  const supabase = await createClient()
  const { data: lesson } = await supabase
    .from('lessons')
    .select('titulo')
    .eq('id', lessonId)
    .single()
  return lesson ? { title: lesson.titulo } : {}
}

export default async function LessonPage({ params }: Props) {
  const { slug, lessonId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const locale = await getLocale()
  const t = await getTranslations('lesson')
  const tCourses = await getTranslations('courses')

  if (!user) {
    const lessonPath = getPathname({ href: `/cursos/${slug}/leccion/${lessonId}`, locale })
    redirect(`${getPathname({ href: '/login', locale })}?next=${encodeURIComponent(lessonPath)}`)
  }

  // Fetch course
  const { data: course } = await supabase
    .from('courses')
    .select('id, slug, titulo')
    .eq('slug', slug)
    .eq('published', true)
    .single()

  if (!course) notFound()

  // Verify enrollment
  const { data: enrollment } = await supabase
    .from('enrollments')
    .select('id, progress')
    .eq('course_id', course.id)
    .eq('user_id', user.id)
    .single()

  if (!enrollment) redirect(getPathname({ href: `/cursos/${slug}`, locale }))

  // Fetch lesson
  const { data: lesson } = await supabase
    .from('lessons')
    .select('id, titulo, tipo, contenido, orden, duracion_min')
    .eq('id', lessonId)
    .eq('course_id', course.id)
    .eq('published', true)
    .single()

  if (!lesson) notFound()

  // Fetch all published lessons for navigation
  const { data: allLessons } = await supabase
    .from('lessons')
    .select('id, titulo, orden')
    .eq('course_id', course.id)
    .eq('published', true)
    .order('orden', { ascending: true })

  const lessons = allLessons ?? []
  const currentIndex = lessons.findIndex((l) => l.id === lesson.id)
  const prevLesson = currentIndex > 0 ? lessons[currentIndex - 1] : null
  const nextLesson = currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : null

  // Lesson progress
  const { data: progressRecord } = await supabase
    .from('lesson_progress')
    .select('completed')
    .eq('lesson_id', lesson.id)
    .eq('user_id', user.id)
    .single()

  const isCompleted = progressRecord?.completed ?? false

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      {/* Breadcrumb */}
      <nav aria-label={tCourses('migasAria')} className="mb-6 text-sm text-gray-500">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <Link href="/cursos" className="hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005fcc] focus-visible:rounded">
              {tCourses('migasCursos')}
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link href={`/cursos/${slug}`} className="hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005fcc] focus-visible:rounded">
              {course.titulo}
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="text-gray-900" aria-current="page">{lesson.titulo}</li>
        </ol>
      </nav>

      {/* Progress */}
      <div className="mb-6">
        <ProgressBar value={enrollment.progress} label={t('progresoCurso', { value: enrollment.progress })} />
      </div>

      <article aria-labelledby="lesson-title">
        <header className="mb-8">
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-[#005fcc]">
            {t('leccion', { number: lesson.orden })}
            {lesson.duracion_min ? ` · ${tCourses('duracion', { min: lesson.duracion_min })}` : ''}
          </p>
          <h1 id="lesson-title" className="text-2xl font-bold text-gray-900 sm:text-3xl">
            {lesson.titulo}
          </h1>
        </header>

        {lesson.contenido ? (
          <div className="prose prose-gray max-w-none prose-headings:font-semibold prose-a:text-[#005fcc] prose-a:no-underline hover:prose-a:underline prose-blockquote:border-[#005fcc] prose-code:text-sm">
            <MDXRemote
              source={lesson.contenido}
              options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }}
            />
          </div>
        ) : (
          <p className="text-gray-500">{t('sinContenido')}</p>
        )}

        {/* Complete lesson action */}
        <div className="mt-10 flex items-center justify-between border-t border-gray-200 pt-6">
          <CompleteLessonButton
            lessonId={lesson.id}
            courseId={course.id}
            slug={slug}
            completed={isCompleted}
          />
        </div>
      </article>

      {/* Prev / Next navigation */}
      <nav aria-label={t('navAria')} className="mt-8">
        <div className="flex items-center justify-between gap-4">
          {prevLesson ? (
            <Link
              href={`/cursos/${slug}/leccion/${prevLesson.id}`}
              className="flex items-center gap-2 rounded-md border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005fcc]"
            >
              <svg aria-hidden="true" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
              <span className="truncate">{prevLesson.titulo}</span>
            </Link>
          ) : (
            <div />
          )}

          {nextLesson ? (
            <Link
              href={`/cursos/${slug}/leccion/${nextLesson.id}`}
              className="flex items-center gap-2 rounded-md border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005fcc]"
            >
              <span className="truncate">{nextLesson.titulo}</span>
              <svg aria-hidden="true" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </Link>
          ) : (
            <Link
              href={`/cursos/${slug}`}
              className="flex items-center gap-2 rounded-md bg-[#005fcc] px-4 py-2 text-sm font-medium text-white hover:bg-[#004db3] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005fcc] focus-visible:ring-offset-2"
            >
              {t('volverAlCurso')}
              <svg aria-hidden="true" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </Link>
          )}
        </div>
      </nav>
    </div>
  )
}
