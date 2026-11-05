/**
 * import-course.mjs — Valida, documenta y carga un curso de /cursos en la academia
 * ================================================================================
 * Lee una carpeta de curso con esta estructura:
 *
 *   curso.json           slug, título, descripción y lista de lecciones
 *   cuestionarios.json   preguntas de control por lección ({ "<orden>": [...] })
 *   lecciones/*.mdx      contenido de cada lección (lessons.contenido)
 *   presentacion.md      ficha y secciones de presentación (solo para el .md)
 *   cierre.md            evaluación final, recursos, glosario y pie (solo para el .md)
 *
 * Uso (desde apps/academy):
 *   pnpm course:import ../../cursos/wcag-2-2-a-fondo              valida (no escribe nada)
 *   pnpm course:import ../../cursos/wcag-2-2-a-fondo --build-md   regenera curso-<slug>.md
 *   pnpm course:import ../../cursos/wcag-2-2-a-fondo --apply      carga en Supabase
 *   pnpm course:import ../../cursos/wcag-2-2-a-fondo --apply --publish
 *
 * --apply requiere NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY
 * (.env.local del workspace academy) y la migración 024 aplicada.
 * La carga es idempotente: curso por slug, lecciones y preguntas por orden.
 * Sin --publish el curso queda como borrador (published = false).
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { basename, resolve } from 'node:path'

import { createClient } from '@supabase/supabase-js'
import { serialize } from 'next-mdx-remote/serialize'
import remarkGfm from 'remark-gfm'

const args = process.argv.slice(2)
const dir = args.find((a) => !a.startsWith('--'))
const flags = new Set(args.filter((a) => a.startsWith('--')))

if (!dir) {
  console.error('Uso: pnpm course:import <carpeta-del-curso> [--build-md] [--apply] [--publish]')
  process.exit(1)
}

const root = resolve(dir)
const read = (file) => readFileSync(resolve(root, file), 'utf8')

const course = JSON.parse(read('curso.json'))
const quizzes = JSON.parse(read('cuestionarios.json'))
const lessons = course.lecciones.map((l) => ({
  ...l,
  contenido: read(`lecciones/${l.archivo}`).trim(),
  preguntas: quizzes[String(l.orden)] ?? [],
}))

// ── Validación ────────────────────────────────────────────────────────────────

const errors = []
const mediaUrls = new Set()

for (const lesson of lessons) {
  const where = `Lección ${lesson.orden} (${lesson.archivo})`

  try {
    // Misma canalización que la página de la lección (MDX + GFM)
    await serialize(lesson.contenido, { mdxOptions: { remarkPlugins: [remarkGfm] } })
  } catch (error) {
    errors.push(`${where}: MDX no válido — ${error.message.split('\n')[0]}`)
  }

  for (const [, url] of lesson.contenido.matchAll(/\bsrc="(https:[^"]+)"/g)) mediaUrls.add(url)
  for (const [, id] of lesson.contenido.matchAll(/<Video\s+id="([^"]+)"/g)) {
    mediaUrls.add(`https://www.youtube.com/oembed?format=json&url=https://www.youtube.com/watch?v=${id}`)
  }

  if (lesson.cuestionario !== false && lesson.preguntas.length === 0) {
    errors.push(`${where}: no tiene preguntas de control`)
  }

  lesson.preguntas.forEach((q, i) => {
    const label = `${where}, pregunta ${i + 1}`
    if (!q.enunciado || !q.explicacion) errors.push(`${label}: falta enunciado o explicación`)
    if (!Array.isArray(q.opciones) || q.opciones.length !== 4) errors.push(`${label}: debe tener 4 opciones`)
    if (!Number.isInteger(q.correcta) || q.correcta < 0 || q.correcta >= (q.opciones?.length ?? 0)) {
      errors.push(`${label}: índice de respuesta correcta fuera de rango`)
    }
  })
}

for (const key of Object.keys(quizzes)) {
  if (!lessons.some((l) => String(l.orden) === key)) {
    errors.push(`cuestionarios.json: la clave "${key}" no corresponde a ninguna lección`)
  }
}

if (flags.has('--check-media')) {
  for (const url of mediaUrls) {
    const res = await fetch(url, { method: url.includes('oembed') ? 'GET' : 'HEAD' }).catch(() => null)
    if (!res?.ok) errors.push(`Recurso no disponible (${res?.status ?? 'sin respuesta'}): ${url}`)
  }
}

const totalQuestions = lessons.reduce((sum, l) => sum + l.preguntas.length, 0)
const totalMinutes = lessons.reduce((sum, l) => sum + (l.duracion_min ?? 0), 0)
console.log(`\n${course.titulo}`)
console.log(`  ${lessons.length} lecciones · ${totalQuestions} preguntas · ${totalMinutes} min · ${mediaUrls.size} recursos externos`)

if (errors.length > 0) {
  console.error(`\n${errors.length} problema(s):`)
  for (const e of errors) console.error(`  ✗ ${e}`)
  process.exit(1)
}
console.log('  ✓ contenido válido')

// ── Documento Markdown (formato-cursos.md) ───────────────────────────────────

if (flags.has('--build-md')) {
  const attr = (tag, name) => tag.match(new RegExp(`${name}="([^"]*)"`))?.[1] ?? ''

  const toMarkdown = (mdx) =>
    mdx
      .replace(/<Video\b[^>]*\/>/g, (tag) =>
        `**Video**: [${attr(tag, 'titulo')}](https://www.youtube.com/watch?v=${attr(tag, 'id')}) — ${attr(tag, 'credito')}. Transcripción: ${attr(tag, 'fuente')}`)
      .replace(/<Figura\b[^>]*\/>/g, (tag) =>
        `![${attr(tag, 'alt')}](${attr(tag, 'src')})\n\n*${attr(tag, 'pie')} Fuente: [${attr(tag, 'credito')}](${attr(tag, 'fuente')}).*`)
      // En la academia el título de la lección es el H1; en el documento el módulo es H2
      .replace(/^(#{2,5}) /gm, '#$1 ')

  const letters = ['a', 'b', 'c', 'd']
  const quizToMarkdown = (lesson) => {
    if (lesson.preguntas.length === 0) return ''
    const numero = lesson.titulo.match(/^Módulo (\d+)/)?.[1]
    const heading = numero ? `### Preguntas de control del módulo ${numero}` : '### Preguntas del examen'
    const items = lesson.preguntas.map((q, i) =>
      `${i + 1}. ${q.enunciado}\n${q.opciones.map((o, j) => `    - ${letters[j]}) ${o}`).join('\n')}`)
    return `\n\n${heading}\n\n${items.join('\n\n')}`
  }

  const answerKey = lessons
    .filter((l) => l.preguntas.length > 0)
    .map((l) => {
      const rows = l.preguntas.map((q, i) => `| ${i + 1} | ${letters[q.correcta]} | ${q.explicacion} |`)
      return `### ${l.titulo}\n\n| Pregunta | Respuesta | Explicación |\n|---|---|---|\n${rows.join('\n')}`
    })
    .join('\n\n')

  const modules = lessons
    .map((l) => `## ${l.titulo}\n\n${toMarkdown(l.contenido)}${quizToMarkdown(l)}`)
    .join('\n\n---\n\n')

  const document = [
    read('presentacion.md').trim(),
    modules,
    `## Clave de respuestas\n\n${answerKey}`,
    read('cierre.md').trim(),
  ].join('\n\n---\n\n')

  const output = resolve(root, `curso-${basename(root)}.md`)
  writeFileSync(output, `${document}\n`)
  console.log(`  ✓ documento generado: ${output}`)
}

// ── Carga en Supabase ────────────────────────────────────────────────────────

if (!flags.has('--apply')) {
  console.log('\nSin --apply no se escribe nada en la base de datos.\n')
  process.exit(0)
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) {
  console.error('Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const admin = createClient(url, key, { auth: { persistSession: false } })
const fail = (step, error) => {
  console.error(`\n✗ ${step}: ${error.message}`)
  process.exit(1)
}

console.log(`\nDestino: ${url}`)

const { data: courseRow, error: courseError } = await admin
  .from('courses')
  .upsert(
    {
      slug: course.slug,
      titulo: course.titulo,
      descripcion: course.descripcion,
      ...(flags.has('--publish') ? { published: true } : {}),
    },
    { onConflict: 'slug' },
  )
  .select('id, published')
  .single()
if (courseError) fail('curso', courseError)

const { data: existing, error: existingError } = await admin
  .from('lessons')
  .select('id, orden')
  .eq('course_id', courseRow.id)
if (existingError) fail('lecciones existentes', existingError)

for (const lesson of lessons) {
  const row = {
    course_id: courseRow.id,
    titulo: lesson.titulo,
    tipo: lesson.tipo,
    contenido: lesson.contenido,
    orden: lesson.orden,
    duracion_min: lesson.duracion_min,
    quiz_min_pct: lesson.quiz_min_pct ?? 80,
    published: true,
  }
  const current = existing.find((l) => l.orden === lesson.orden)
  const { data: saved, error } = current
    ? await admin.from('lessons').update(row).eq('id', current.id).select('id').single()
    : await admin.from('lessons').insert(row).select('id').single()
  if (error) fail(`lección ${lesson.orden}`, error)

  if (lesson.preguntas.length > 0) {
    const { error: quizError } = await admin.from('quiz_questions').upsert(
      lesson.preguntas.map((q, i) => ({
        lesson_id: saved.id,
        orden: i + 1,
        enunciado: q.enunciado,
        opciones: q.opciones,
        correcta: q.correcta,
        explicacion: q.explicacion,
      })),
      { onConflict: 'lesson_id,orden' },
    )
    if (quizError) fail(`preguntas de la lección ${lesson.orden}`, quizError)
  }

  // Preguntas sobrantes de una versión anterior del cuestionario
  const { error: pruneError } = await admin
    .from('quiz_questions')
    .delete()
    .eq('lesson_id', saved.id)
    .gt('orden', lesson.preguntas.length)
  if (pruneError) fail(`limpieza de preguntas de la lección ${lesson.orden}`, pruneError)

  console.log(`  ✓ ${lesson.titulo} (${lesson.preguntas.length} preguntas)`)
}

const stale = existing.filter((l) => !lessons.some((n) => n.orden === l.orden))
if (stale.length > 0) {
  console.log(`\nAviso: hay ${stale.length} lección(es) en la base que ya no están en curso.json (orden ${stale.map((l) => l.orden).join(', ')}); no se borraron.`)
}

console.log(`\nCurso ${courseRow.published ? 'PUBLICADO' : 'en borrador'}: /cursos/${course.slug}\n`)
