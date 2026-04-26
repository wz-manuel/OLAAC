import type { Metadata } from 'next'

import { CourseCard } from '@/components/courses/course-card'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Cursos de accesibilidad',
  description: 'Explora el catálogo de cursos de la Academia OLAAC sobre accesibilidad digital.',
}

export default async function CursosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: courses } = await supabase
    .from('courses')
    .select('id, slug, titulo, descripcion')
    .eq('published', true)
    .order('created_at', { ascending: true })

  // Lesson counts
  const { data: lessonCounts } = await supabase
    .from('lessons')
    .select('course_id')
    .eq('published', true)

  // User enrollments
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
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Catálogo de cursos</h1>
        <p className="mt-2 text-gray-600">
          Formación práctica en accesibilidad digital para equipos de toda Latinoamérica.
        </p>
      </header>

      {(!courses || courses.length === 0) ? (
        <p className="text-gray-500">No hay cursos disponibles por el momento.</p>
      ) : (
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
      )}
    </div>
  )
}
