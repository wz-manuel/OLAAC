/**
 * Route Handler: GET /api/certificados/generar?courseId={uuid}
 * ============================================================
 * Genera y entrega el certificado PDF de un usuario para un curso
 * que haya completado. Si el certificado ya fue emitido previamente,
 * se regenera el PDF con los mismos datos (folio idempotente).
 *
 * Flujo:
 *  1. Verificar autenticación (Supabase SSR)
 *  2. Verificar que el enrollment.estado === 'completado'
 *  3. Resolver nombre del estudiante y título del curso
 *  4. Crear o recuperar registro en `certificates` (upsert por user+course)
 *  5. Generar QR code como base64 PNG
 *  6. Renderizar PDF con CertificateTemplate (renderToBuffer)
 *  7. Subir PDF a Supabase Storage (bucket: certificates)
 *  8. Retornar el PDF como respuesta application/pdf
 */

import { type NextRequest, NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import QRCode from 'qrcode'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { CertificateTemplate } from '@/components/certificate/certificate-template'

// ──────────────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────────────

/** Genera un folio único: CERT-YYYY-SLUG6-HEX8 */
function generateFolio(courseSlug: string): string {
  const year  = new Date().getFullYear()
  const slug  = courseSlug.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6)
  const hex   = [...crypto.getRandomValues(new Uint8Array(4))]
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase()
  return `CERT-${year}-${slug}-${hex}`
}

/** Crea el cliente Supabase con service_role para operaciones privilegiadas */
function adminClient() {
  const url = process.env['NEXT_PUBLIC_SUPABASE_URL']
  const key = process.env['SUPABASE_SERVICE_ROLE_KEY']
  if (!url || !key) throw new Error('Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY')
  return createAdminClient(url, key, { auth: { persistSession: false } })
}

// ──────────────────────────────────────────────────────────────────────────────
// Route Handler
// ──────────────────────────────────────────────────────────────────────────────

export async function GET(request: NextRequest): Promise<NextResponse> {
  // ── 1. Parámetros ──────────────────────────────────────────────────────
  const { searchParams } = request.nextUrl
  const courseId = searchParams.get('courseId')?.trim()

  if (!courseId) {
    return NextResponse.json(
      { error: 'Se requiere el parámetro courseId' },
      { status: 400 }
    )
  }

  // ── 2. Autenticación ───────────────────────────────────────────────────
  const supabase = await createServerClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json(
      { error: 'No autorizado. Inicia sesión para generar tu certificado.' },
      { status: 401 }
    )
  }

  // ── 3. Verificar que el curso esté completado ──────────────────────────
  const { data: enrollment } = await supabase
    .from('enrollments')
    .select('estado, progress')
    .eq('course_id', courseId)
    .eq('user_id', user.id)
    .single()

  if (!enrollment) {
    return NextResponse.json(
      { error: 'No estás inscrito en este curso.' },
      { status: 403 }
    )
  }

  if (enrollment.estado !== 'completado') {
    return NextResponse.json(
      {
        error: 'El curso aún no está completado.',
        progress: enrollment.progress,
      },
      { status: 403 }
    )
  }

  // ── 4. Datos del curso ─────────────────────────────────────────────────
  const { data: course } = await supabase
    .from('courses')
    .select('titulo, slug')
    .eq('id', courseId)
    .single()

  if (!course) {
    return NextResponse.json({ error: 'Curso no encontrado.' }, { status: 404 })
  }

  // ── 5. Nombre del estudiante ───────────────────────────────────────────
  // Preferencia: full_name → name → parte local del email
  const studentName: string =
    (user.user_metadata?.['full_name'] as string | undefined) ??
    (user.user_metadata?.['name'] as string | undefined) ??
    (user.email?.split('@')[0] ?? 'Estudiante')

  // ── 6. Crear o recuperar certificado (idempotente) ─────────────────────
  const admin = adminClient()

  // Intentar recuperar un certificado existente para este par user+course
  const { data: existing } = await admin
    .from('certificates')
    .select('id, folio, issued_at, student_name, course_title')
    .eq('user_id', user.id)
    .eq('course_id', courseId)
    .single()

  let folio:       string
  let issuedAt:    string
  let certId:      string

  if (existing) {
    // El certificado ya fue emitido — reutilizar el folio original
    folio      = existing.folio
    issuedAt   = existing.issued_at
    certId     = existing.id
  } else {
    // Primera emisión
    folio    = generateFolio(course.slug)
    issuedAt = new Date().toISOString()

    const { data: inserted, error: insertError } = await admin
      .from('certificates')
      .insert({
        folio,
        user_id:      user.id,
        course_id:    courseId,
        student_name: studentName,
        course_title: course.titulo,
        issued_at:    issuedAt,
      })
      .select('id')
      .single()

    if (insertError || !inserted) {
      console.error('[certificados/generar] insert error:', insertError)
      return NextResponse.json(
        { error: 'No se pudo registrar el certificado. Intenta de nuevo.' },
        { status: 500 }
      )
    }

    certId = inserted.id
  }

  // ── 7. URL de verificación ─────────────────────────────────────────────
  const baseUrl =
    process.env['NEXT_PUBLIC_ACADEMY_URL'] ??
    `http://localhost:${process.env['PORT'] ?? 3001}`

  const verifyUrl = `${baseUrl}/certificados/${folio}`

  // ── 8. Generar QR Code (base64 PNG) ───────────────────────────────────
  let qrCodeDataUrl: string
  try {
    qrCodeDataUrl = await QRCode.toDataURL(verifyUrl, {
      errorCorrectionLevel: 'M',
      margin: 1,
      width: 200,
      color: { dark: '#252c83', light: '#ffffff' },
    })
  } catch (err) {
    console.error('[certificados/generar] QR generation error:', err)
    // Fallback: QR vacío (el certificado se genera igualmente)
    qrCodeDataUrl = ''
  }

  // ── 9. Renderizar PDF ──────────────────────────────────────────────────
  let pdfBuffer: Buffer
  try {
    pdfBuffer = await renderToBuffer(
      CertificateTemplate({
        studentName,
        courseTitle: course.titulo,
        folio,
        issuedAt,
        qrCodeDataUrl,
        verifyUrl,
      })
    )
  } catch (err) {
    console.error('[certificados/generar] PDF render error:', err)
    return NextResponse.json(
      { error: 'Error al generar el PDF. Intenta de nuevo.' },
      { status: 500 }
    )
  }

  // ── 10. Subir PDF a Supabase Storage ──────────────────────────────────
  // Path: certificates/{userId}/{folio}.pdf
  const storagePath = `${user.id}/${folio}.pdf`

  const { error: uploadError } = await admin.storage
    .from('certificates')
    .upload(storagePath, pdfBuffer, {
      contentType:  'application/pdf',
      upsert:       true,           // sobreescribir si ya existe (re-generación)
      cacheControl: '3600',
    })

  if (uploadError) {
    // Loguear pero no bloquear — el PDF se entrega igualmente
    console.error('[certificados/generar] Storage upload error:', uploadError.message)
  } else {
    // Actualizar la ruta en la tabla certificates
    await admin
      .from('certificates')
      .update({ storage_path: storagePath })
      .eq('id', certId)
  }

  // ── 11. Retornar el PDF ────────────────────────────────────────────────
  const filename = `certificado-${folio}.pdf`

  // Buffer → Uint8Array para compatibilidad con el constructor de NextResponse
  return new NextResponse(new Uint8Array(pdfBuffer), {
    status:  200,
    headers: {
      'Content-Type':        'application/pdf',
      // `attachment` → el navegador fuerza descarga en lugar de preview inline
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length':      String(pdfBuffer.byteLength),
      // No cachear en CDN — cada generación puede ser la primera emisión
      'Cache-Control':       'no-store',
    },
  })
}
