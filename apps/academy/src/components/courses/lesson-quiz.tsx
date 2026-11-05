'use client'

import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useEffect, useRef, useState, useTransition } from 'react'

import { type QuizResult, submitQuiz } from '@/lib/actions/quiz'

export interface QuizQuestion {
  id: string
  enunciado: string
  opciones: string[]
}

interface LessonQuizProps {
  lessonId: string
  slug: string
  questions: QuizQuestion[]
  minPct: number
  /** La lección ya estaba aprobada al cargar la página */
  passed: boolean
}

export function LessonQuiz({ lessonId, slug, questions, minPct, passed }: LessonQuizProps) {
  const t = useTranslations('quiz')
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [result, setResult] = useState<QuizResult | null>(null)
  const [missing, setMissing] = useState<string[]>([])
  const [failed, setFailed] = useState(false)
  const [open, setOpen] = useState(!passed)
  const resultRef = useRef<HTMLHeadingElement>(null)
  const errorRef = useRef<HTMLParagraphElement>(null)
  const firstQuestionRef = useRef<HTMLFieldSetElement>(null)

  const total = questions.length
  const required = Math.ceil((total * minPct) / 100)
  const feedback = new Map(result?.detalle.map((d) => [d.id, d]))
  const locked = isPending || !!result?.aprobado

  // Al calificar, el foco va al resultado para que se anuncie y quede a la vista
  useEffect(() => {
    if (result) resultRef.current?.focus()
  }, [result])

  useEffect(() => {
    if (missing.length > 0 || failed) errorRef.current?.focus()
  }, [missing, failed])

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    const sinResponder = questions.filter((q) => answers[q.id] === undefined).map((q) => q.id)
    setMissing(sinResponder)
    setFailed(false)
    if (sinResponder.length > 0) return

    startTransition(async () => {
      const response = await submitQuiz(lessonId, slug, answers)
      if (!response.result) {
        setFailed(true)
        return
      }
      setResult(response.result)
      if (response.result.aprobado) router.refresh()
    })
  }

  function handleRetry() {
    setAnswers({})
    setResult(null)
    setMissing([])
    setFailed(false)
    setOpen(true)
    // Espera al render para que el primer grupo de opciones vuelva a estar habilitado
    requestAnimationFrame(() => firstQuestionRef.current?.querySelector('input')?.focus())
  }

  return (
    <section aria-labelledby="quiz-title" className="mt-12 border-t border-gray-200 pt-8">
      <h2 id="quiz-title" className="text-xl font-semibold text-gray-900">
        {t('titulo')}
      </h2>

      {passed && !result && (
        <p className="mt-4 flex items-center gap-2 rounded-md bg-green-50 px-4 py-3 text-sm font-medium text-green-800 ring-1 ring-green-200">
          <CheckIcon />
          {t('yaAprobado')}
        </p>
      )}

      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-4 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005fcc]"
        >
          {t('repasar')}
        </button>
      ) : (
        <>
          <p className="mt-2 text-sm text-gray-600">
            {t('instrucciones', { total, required })}
          </p>

          <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-8">
            {questions.map((question, index) => {
              const item = feedback.get(question.id)
              const isMissing = missing.includes(question.id)
              const feedbackId = `quiz-feedback-${question.id}`

              return (
                <fieldset
                  key={question.id}
                  ref={index === 0 ? firstQuestionRef : undefined}
                  disabled={locked}
                  aria-describedby={item || isMissing ? feedbackId : undefined}
                  className="min-w-0"
                >
                  <legend className="text-base font-medium text-gray-900">
                    <span className="sr-only">{t('pregunta', { number: index + 1, total })}: </span>
                    <span aria-hidden="true">{index + 1}. </span>
                    {question.enunciado}
                  </legend>

                  <div className="mt-3 space-y-2">
                    {question.opciones.map((opcion, optionIndex) => {
                      const inputId = `quiz-${question.id}-${optionIndex}`
                      const isCorrect = item?.correcta === optionIndex
                      return (
                        <label
                          key={inputId}
                          htmlFor={inputId}
                          className="flex cursor-pointer items-start gap-3 rounded-md border border-gray-500 px-3 py-2.5 text-sm text-gray-800 has-[:checked]:border-[#005fcc] has-[:checked]:bg-blue-50 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[#005fcc] has-[:disabled]:cursor-default"
                        >
                          <input
                            id={inputId}
                            type="radio"
                            name={`quiz-${question.id}`}
                            value={optionIndex}
                            checked={answers[question.id] === optionIndex}
                            onChange={() => setAnswers((prev) => ({ ...prev, [question.id]: optionIndex }))}
                            className="mt-0.5 h-4 w-4 shrink-0 accent-[#005fcc]"
                          />
                          <span>
                            {opcion}
                            {isCorrect && (
                              <strong className="ml-2 font-semibold text-green-800">
                                {t('respuestaCorrecta')}
                              </strong>
                            )}
                          </span>
                        </label>
                      )
                    })}
                  </div>

                  {isMissing && !item && (
                    <p id={feedbackId} className="mt-2 text-sm font-medium text-red-800">
                      {t('sinResponder')}
                    </p>
                  )}

                  {item && (
                    <p
                      id={feedbackId}
                      className={`mt-3 flex items-start gap-2 rounded-md px-3 py-2.5 text-sm ring-1 ${
                        item.acierto
                          ? 'bg-green-50 text-green-900 ring-green-200'
                          : 'bg-red-50 text-red-900 ring-red-200'
                      }`}
                    >
                      {item.acierto ? <CheckIcon /> : <CrossIcon />}
                      <span>
                        <strong className="font-semibold">
                          {item.acierto ? t('correcta') : t('incorrecta')}
                        </strong>{' '}
                        {item.explicacion}
                      </span>
                    </p>
                  )}
                </fieldset>
              )
            })}

            {(missing.length > 0 || failed) && (
              <p
                ref={errorRef}
                tabIndex={-1}
                role="alert"
                className="rounded-md bg-red-50 px-4 py-3 text-sm font-medium text-red-900 ring-1 ring-red-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005fcc]"
              >
                {failed ? t('error') : t('faltan', { count: missing.length })}
              </p>
            )}

            {result && (
              <div
                className={`rounded-lg px-4 py-4 ring-1 ${
                  result.aprobado ? 'bg-green-50 ring-green-200' : 'bg-amber-50 ring-amber-300'
                }`}
              >
                <h3
                  ref={resultRef}
                  tabIndex={-1}
                  className="text-base font-semibold text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005fcc] focus-visible:ring-offset-2"
                >
                  {result.aprobado ? t('aprobadoTitulo') : t('reprobadoTitulo')}
                </h3>
                <p className="mt-1 text-sm text-gray-800">
                  {t('puntaje', { aciertos: result.aciertos, total: result.total })}{' '}
                  {result.aprobado ? t('aprobadoTexto') : t('reprobadoTexto', { required })}
                </p>
              </div>
            )}

            {result ? (
              <button
                type="button"
                onClick={handleRetry}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005fcc]"
              >
                {result.aprobado ? t('repasar') : t('reintentar')}
              </button>
            ) : (
              <button
                type="submit"
                disabled={isPending}
                aria-busy={isPending}
                className="rounded-md bg-[#005fcc] px-4 py-2 text-sm font-medium text-white hover:bg-[#004db3] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005fcc] focus-visible:ring-offset-2 disabled:opacity-60"
              >
                {isPending ? t('calificando') : t('enviar')}
              </button>
            )}
          </form>
        </>
      )}
    </section>
  )
}

function CheckIcon() {
  return (
    <svg aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
    </svg>
  )
}

function CrossIcon() {
  return (
    <svg aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
      <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
    </svg>
  )
}
