'use client'

import { useTransition } from 'react'

import { completeLesson } from '@/lib/actions/courses'

interface CompleteLessonButtonProps {
  lessonId: string
  courseId: string
  slug: string
  completed: boolean
}

export function CompleteLessonButton({ lessonId, courseId, slug, completed }: CompleteLessonButtonProps) {
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    startTransition(async () => {
      await completeLesson(lessonId, courseId, slug)
    })
  }

  if (completed) {
    return (
      <span className="inline-flex items-center gap-2 rounded-md bg-green-50 px-4 py-2 text-sm font-medium text-green-700 ring-1 ring-green-200">
        <svg aria-hidden="true" className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
        </svg>
        Lección completada
      </span>
    )
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      aria-busy={isPending}
      className="inline-flex items-center gap-2 rounded-md bg-[#005fcc] px-4 py-2 text-sm font-medium text-white hover:bg-[#004db3] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005fcc] focus-visible:ring-offset-2 disabled:opacity-60"
    >
      {isPending ? 'Guardando…' : 'Marcar como completada'}
    </button>
  )
}
