/**
 * emit-certificate.ts — Prueba de fuego: primer certificado oficial OLAAC
 * ========================================================================
 * Replica el flujo del Route Handler /api/certificados/generar sin
 * necesitar el servidor Next.js en ejecución.
 *
 * Uso (desde la raíz del monorepo):
 *   pnpm --filter @olaac/academy cert:emit
 *
 * Requisitos:
 *   NEXT_PUBLIC_SUPABASE_URL     — .env.local del workspace academy
 *   SUPABASE_SERVICE_ROLE_KEY    — ídem
 */

import React               from 'react'
import { createClient }   from '@supabase/supabase-js'
import { renderToBuffer } from '@react-pdf/renderer'
import QRCode             from 'qrcode'
import { writeFileSync }  from 'node:fs'
import { resolve }        from 'node:path'
import { CertificateTemplate } from '../src/components/certificate/certificate-template.js'

// Asegura que React esté disponible globalmente para el transform clásico de JSX
// que usa tsx/esbuild al importar componentes @react-pdf/renderer
;(globalThis as Record<string, unknown>)['React'] = React

// ── Datos del presidente fundador ─────────────────────────────────────────────
const USER_ID     = '03cdceac-1c46-4acb-9fbc-61b8b4bb6e0f'
const COURSE_ID   = 'c0a11ac0-0000-0000-0000-000000000001'
const BUCKET      = 'certificates'
const VERIFY_BASE = process.env['NEXT_PUBLIC_ACADEMY_URL'] ?? 'http://localhost:3001'

// ── Helpers ───────────────────────────────────────────────────────────────────
function env(name: string): string {
  const v = process.env[name]
  if (!v) throw new Error(`Variable de entorno requerida: ${name}`)
  return v
}

function generateFolio(courseSlug: string): string {
  const year = new Date().getFullYear()
  const slug = courseSlug.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6)
  const hex  = [...crypto.getRandomValues(new Uint8Array(4))]
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase()
  return `CERT-${year}-${slug}-${hex}`
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main(): Promise<void> {
  console.log('\n━━━  OLAAC — Emisión de Certificado Oficial  ━━━\n')

  const admin = createClient(
    env('NEXT_PUBLIC_SUPABASE_URL'),
    env('SUPABASE_SERVICE_ROLE_KEY'),
    { auth: { persistSession: false } }
  )

  // ── 1. Verificar enrollment ────────────────────────────────────────────────
  process.stdout.write('1. Verificando enrollment...')
  const { data: enrollment, error: enrollErr } = await admin
    .from('enrollments')
    .select('estado, progress')
    .eq('user_id', USER_ID)
    .eq('course_id', COURSE_ID)
    .single()

  if (enrollErr || !enrollment) throw new Error(`Enrollment no encontrado: ${enrollErr?.message}`)
  if (enrollment.estado !== 'completado') throw new Error(`Estado '${enrollment.estado}', se requiere 'completado'`)
  console.log(` ✓  estado=${enrollment.estado} | progreso=${enrollment.progress}%`)

  // ── 2. Datos del curso ─────────────────────────────────────────────────────
  process.stdout.write('2. Leyendo datos del curso...')
  const { data: course, error: courseErr } = await admin
    .from('courses')
    .select('titulo, slug')
    .eq('id', COURSE_ID)
    .single()

  if (courseErr || !course) throw new Error(`Curso no encontrado: ${courseErr?.message}`)
  console.log(` ✓  "${course.titulo}"`)

  // ── 3. Certificado idempotente ─────────────────────────────────────────────
  process.stdout.write('3. Verificando certificado previo...')
  const { data: existing } = await admin
    .from('certificates')
    .select('id, folio, issued_at')
    .eq('user_id', USER_ID)
    .eq('course_id', COURSE_ID)
    .single()

  const studentName = 'Manuel Valdez Valenzuela'
  let folio: string
  let issuedAt: string
  let certId: string

  if (existing) {
    folio    = existing.folio
    issuedAt = existing.issued_at
    certId   = existing.id
    console.log(` ✓  folio existente reutilizado: ${folio}`)
  } else {
    folio    = generateFolio(course.slug)
    issuedAt = new Date().toISOString()

    const { data: inserted, error: insertErr } = await admin
      .from('certificates')
      .insert({ folio, user_id: USER_ID, course_id: COURSE_ID, student_name: studentName, course_title: course.titulo, issued_at: issuedAt })
      .select('id')
      .single()

    if (insertErr || !inserted) throw new Error(`Insert fallido: ${insertErr?.message}`)
    certId = inserted.id
    console.log(` ✓  nuevo registro — folio: ${folio}`)
  }

  // ── 4. QR code ────────────────────────────────────────────────────────────
  const verifyUrl = `${VERIFY_BASE}/certificados/${folio}`
  process.stdout.write(`4. Generando QR → ${verifyUrl} ...`)

  const qrCodeDataUrl = await QRCode.toDataURL(verifyUrl, {
    errorCorrectionLevel: 'M',
    margin: 1,
    width: 200,
    color: { dark: '#252858', light: '#ffffff' },
  })
  console.log(' ✓')

  // ── 5. Renderizar PDF ──────────────────────────────────────────────────────
  process.stdout.write('5. Renderizando PDF (@react-pdf/renderer)...')
  const pdfBuffer = await renderToBuffer(
    CertificateTemplate({ studentName, courseTitle: course.titulo, folio, issuedAt, qrCodeDataUrl, verifyUrl })
  )
  console.log(` ✓  ${pdfBuffer.byteLength.toLocaleString()} bytes`)

  // ── 6. Upload a Storage ───────────────────────────────────────────────────
  const storagePath = `${USER_ID}/${folio}.pdf`
  process.stdout.write(`6. Subiendo a certificates/${storagePath} ...`)

  const { error: uploadErr } = await admin.storage
    .from(BUCKET)
    .upload(storagePath, pdfBuffer, { contentType: 'application/pdf', upsert: true, cacheControl: '3600' })

  if (uploadErr) throw new Error(`Upload fallido: ${uploadErr.message}`)
  console.log(' ✓')

  await admin.from('certificates').update({ storage_path: storagePath }).eq('id', certId)
  console.log('   ✓  storage_path actualizado en tabla certificates')

  // ── 7. Copia local ────────────────────────────────────────────────────────
  const localPath = resolve(`certificado-${folio}.pdf`)
  writeFileSync(localPath, pdfBuffer)
  console.log(`   ✓  Copia local: ${localPath}`)

  // ── 8. Signed URL (60 min) ────────────────────────────────────────────────
  process.stdout.write('7. Generando Signed URL (60 min)...')
  const { data: signed, error: signErr } = await admin.storage
    .from(BUCKET)
    .createSignedUrl(storagePath, 3600)

  if (signErr || !signed) throw new Error(`Signed URL fallida: ${signErr?.message}`)
  console.log(' ✓')

  // ── 9. Verificar registro final ───────────────────────────────────────────
  const { data: cert } = await admin
    .from('certificates')
    .select('id, folio, student_name, course_title, storage_path, issued_at')
    .eq('id', certId)
    .single()

  const emitido = new Date(cert?.issued_at ?? '').toLocaleDateString('es-MX', {
    day: 'numeric', month: 'long', year: 'numeric'
  })

  // ── Resultado ─────────────────────────────────────────────────────────────
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('  CERTIFICADO OFICIAL EMITIDO — OLAAC')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`  Folio        : ${cert?.folio}`)
  console.log(`  Estudiante   : ${cert?.student_name}`)
  console.log(`  Curso        : ${cert?.course_title}`)
  console.log(`  Emitido      : ${emitido}`)
  console.log(`  Storage      : certificates/${cert?.storage_path}`)
  console.log(`  Verificar    : ${verifyUrl}`)
  console.log(`  Archivo      : certificado-${folio}.pdf`)
  console.log('\n  SIGNED URL (válida 60 min):')
  console.log(`  ${signed.signedUrl}`)
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
}

main().catch((err: unknown) => {
  console.error(`\n  ✗ ERROR: ${err instanceof Error ? err.message : String(err)}\n`)
  process.exit(1)
})
