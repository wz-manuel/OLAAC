import Link from 'next/link'

import { CourseCard } from '@/components/courses/course-card'
import { createClient } from '@/lib/supabase/server'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: courses } = await supabase
    .from('courses')
    .select('id, slug, titulo, descripcion')
    .eq('published', true)
    .order('created_at', { ascending: true })
    .limit(3)

  const { data: lessonCounts } = await supabase
    .from('lessons')
    .select('course_id')
    .eq('published', true)

  const { data: enrollments } = user
    ? await supabase
        .from('enrollments')
        .select('course_id, progress')
        .eq('user_id', user.id)
    : { data: [] }

  const countMap = (lessonCounts ?? []).reduce<Record<string, number>>((acc, l) => {
    acc[l.course_id] = (acc[l.course_id] ?? 0) + 1
    return acc
  }, {})

  const enrollMap = (enrollments ?? []).reduce<Record<string, number>>((acc, e) => {
    acc[e.course_id] = e.progress
    return acc
  }, {})

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-b from-blue-50 to-white py-16 sm:py-20">
        <div className="mx-auto max-w-5xl px-4 text-center sm:px-6">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
            Academia OLAAC
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
            Formación práctica en accesibilidad digital para equipos de diseño, desarrollo y políticas públicas en Latinoamérica.
          </p>
          <Link
            href="/cursos"
            className="mt-8 inline-block rounded-md bg-[#005fcc] px-6 py-3 text-base font-semibold text-white hover:bg-[#004db3] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005fcc] focus-visible:ring-offset-2"
          >
            Ver todos los cursos
          </Link>
        </div>
      </section>

      {/* Featured courses */}
      {courses && courses.length > 0 && (
        <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6" aria-labelledby="featured-heading">
          <h2 id="featured-heading" className="mb-6 text-2xl font-bold text-gray-900">
            Cursos disponibles
          </h2>
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <li key={course.id}>
                <CourseCard
                  slug={course.slug}
                  titulo={course.titulo}
                  descripcion={course.descripcion}
                  lessonCount={countMap[course.id] ?? 0}
                  progress={enrollMap[course.id]}
                />
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  )
}
