'use server'

import { revalidatePath } from 'next/cache'
import { getLocale } from 'next-intl/server'

import { redirect } from '@/i18n/navigation'
import { createClient } from '@/lib/supabase/server'

export interface QuizFeedback {
  id: string
  acierto: boolean
  explicacion: string
  /** Índice de la opción correcta; solo llega cuando el cuestionario se aprueba */
  correcta: number | null
}

export interface QuizResult {
  aprobado: boolean
  aciertos: number
  total: number
  min_pct: number
  detalle: QuizFeedback[]
}

export async function submitQuiz(
  lessonId: string,
  slug: string,
  respuestas: Record<string, number>,
): Promise<{ result?: QuizResult; error?: true }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return redirect({ href: '/login', locale: await getLocale() })

  const limpias: Record<string, number> = {}
  for (const [id, opcion] of Object.entries(respuestas)) {
    if (Number.isInteger(opcion) && opcion >= 0) limpias[id] = opcion
  }

  // La calificación ocurre en la base: las respuestas correctas nunca llegan al servidor web
  const { data, error } = await supabase.rpc('submit_lesson_quiz', {
    p_lesson_id: lessonId,
    p_respuestas: limpias,
  })

  if (error || !data) return { error: true }

  const result = data as unknown as QuizResult
  if (result.aprobado) revalidatePath(`/cursos/${slug}`)
  return { result }
}
