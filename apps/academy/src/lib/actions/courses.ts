'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'

export async function enrollCourse(courseId: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check if already enrolled
  const { data: existing } = await supabase
    .from('enrollments')
    .select('id')
    .eq('course_id', courseId)
    .eq('user_id', user.id)
    .single()

  if (existing) return {}

  const { error } = await supabase.from('enrollments').insert({
    course_id: courseId,
    user_id: user.id,
    estado: 'inscrito' as const,
    progress: 0,
  })

  if (error) return { error: 'No se pudo inscribir al curso. Inténtalo de nuevo.' }

  revalidatePath('/cursos')
  return {}
}

export async function completeLesson(
  lessonId: string,
  courseId: string,
  slug: string,
): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Upsert lesson progress
  const { error: progressError } = await supabase.from('lesson_progress').upsert(
    { lesson_id: lessonId, user_id: user.id, completed: true, completed_at: new Date().toISOString() },
    { onConflict: 'lesson_id,user_id' },
  )

  if (progressError) return { error: 'No se pudo marcar la lección como completada.' }

  // Recalculate enrollment progress
  const [{ count: totalLessons }, { count: completedLessons }] = await Promise.all([
    supabase.from('lessons').select('*', { count: 'exact', head: true }).eq('course_id', courseId).eq('published', true),
    supabase.from('lesson_progress')
      .select('lesson_id, lessons!inner(course_id)', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('completed', true)
      .eq('lessons.course_id', courseId),
  ])

  const progress =
    totalLessons && completedLessons
      ? Math.round((completedLessons / totalLessons) * 100)
      : 0

  const estado = (progress === 100 ? 'completado' : 'en_curso') as 'completado' | 'en_curso'

  await supabase
    .from('enrollments')
    .update({ progress, estado, ...(estado === 'completado' ? { completed_at: new Date().toISOString() } : {}) })
    .eq('course_id', courseId)
    .eq('user_id', user.id)

  revalidatePath(`/cursos/${slug}`)
  return {}
}
