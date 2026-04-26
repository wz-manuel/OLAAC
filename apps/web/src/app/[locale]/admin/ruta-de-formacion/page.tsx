import type { Metadata } from 'next'

import {
  AddToPathButton,
  RemoveFromPathButton,
  UpdatePathCourseForm,
} from '@/components/admin/learning-path-editor'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = { title: 'Ruta de formación — Admin OLAAC' }

export default async function AdminRutaFormacionPage() {
  const supabase = await createClient()

  const [pathResult, allCoursesResult] = await Promise.all([
    supabase
      .from('auditor_learning_path')
      .select('id, orden, obligatorio, course_id, courses(id, titulo, slug, descripcion)')
      .order('orden'),
    supabase
      .from('courses')
      .select('id, titulo, slug, descripcion')
      .eq('published', true)
      .order('titulo'),
  ])

  const pathCourses    = pathResult.data ?? []
  const allCourses     = allCoursesResult.data ?? []
  const pathCourseIds  = new Set(pathCourses.map(p => p.course_id))
  const availableCourses = allCourses.filter(c => !pathCourseIds.has(c.id))

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Ruta de formación</h2>
        <p className="mt-1 text-sm text-gray-500">
          Define qué cursos de la Academia deben completarse para obtener la certificación de auditor.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Ruta actual */}
        <section aria-labelledby="ruta-actual-heading">
          <div className="mb-4 flex items-center justify-between">
            <h3 id="ruta-actual-heading" className="text-base font-semibold text-gray-900">
              Ruta actual
            </h3>
            <span className="text-sm text-gray-500">{pathCourses.length} cursos</span>
          </div>

          {pathCourses.length === 0 ? (
            <div className="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
              <p className="text-sm text-gray-500">
                Aún no hay cursos en la ruta. Añade cursos desde el panel de la derecha.
              </p>
            </div>
          ) : (
            <ol className="space-y-3">
              {pathCourses.map((item, idx) => {
                const course = item.courses as {
                  id: string
                  titulo: string
                  slug: string
                  descripcion: string | null
                } | null

                return (
                  <li
                    key={item.id}
                    className="rounded-lg border border-gray-200 bg-white p-4"
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#005fcc] text-xs font-bold text-white"
                        aria-hidden="true"
                      >
                        {idx + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{course?.titulo ?? item.course_id}</p>
                        {course?.descripcion && (
                          <p className="mt-0.5 text-xs text-gray-500 line-clamp-1">{course.descripcion}</p>
                        )}
                        <div className="mt-3 flex flex-wrap items-center gap-3">
                          <UpdatePathCourseForm
                            pathId={item.id}
                            currentOrden={item.orden}
                            currentObligatorio={item.obligatorio}
                          />
                          <RemoveFromPathButton pathId={item.id} />
                        </div>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ol>
          )}
        </section>

        {/* Cursos disponibles */}
        <section aria-labelledby="disponibles-heading">
          <div className="mb-4 flex items-center justify-between">
            <h3 id="disponibles-heading" className="text-base font-semibold text-gray-900">
              Cursos disponibles
            </h3>
            <span className="text-sm text-gray-500">{availableCourses.length} cursos</span>
          </div>

          {availableCourses.length === 0 ? (
            <div className="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
              <p className="text-sm text-gray-500">
                Todos los cursos publicados ya están en la ruta.
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {availableCourses.map(course => (
                <li
                  key={course.id}
                  className="flex items-start justify-between gap-4 rounded-lg border border-gray-200 bg-white p-4"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900">{course.titulo}</p>
                    {course.descripcion && (
                      <p className="mt-0.5 text-xs text-gray-500 line-clamp-2">{course.descripcion}</p>
                    )}
                  </div>
                  <div className="shrink-0">
                    <AddToPathButton courseId={course.id} />
                  </div>
                </li>
              ))}
            </ul>
          )}

          {allCourses.length === 0 && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-5">
              <p className="text-sm text-amber-800">
                No hay cursos publicados en la Academia. Primero crea y publica cursos desde el panel
                de la Academia.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
