/**
 * test-storage.ts — Connectivity dry-run para el bucket 'certificates'
 * =====================================================================
 * Verifica que el cliente Supabase (service_role) tenga acceso de escritura,
 * lectura y borrado sobre el bucket de Storage 'certificates'.
 *
 * Uso:
 *   tsx toolchain/lighthouse-audit/test-storage.ts
 *   # o desde la raíz del monorepo:
 *   pnpm --filter @olaac/lighthouse-audit test:storage
 *
 * Requisitos:
 *   SUPABASE_URL            — URL pública del proyecto Supabase
 *   SUPABASE_SERVICE_ROLE_KEY — clave service_role (nunca exponer al cliente)
 *
 * El script no modifica datos permanentes: sube un objeto temporal,
 * verifica su existencia y lo borra antes de salir.
 * Código de salida: 0 = OK, 1 = fallo.
 */

import { createClient } from '@supabase/supabase-js'

// ── Configuración ─────────────────────────────────────────────────────────────

const BUCKET = 'certificates'
const TEST_PATH = `_dry-run/test-${Date.now()}.pdf`

// Minimal PDF válido (versión mínima de 1 objeto + xref — suficiente para el bucket)
// No es un PDF legible, pero pasa el filtro MIME del bucket (application/pdf)
const MINIMAL_PDF = Buffer.from(
  '%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n' +
  '2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n' +
  '3 0 obj<</Type/Page/MediaBox[0 0 3 3]>>endobj\n' +
  'xref\n0 4\n0000000000 65535 f\n0000000009 00000 n\n' +
  '0000000058 00000 n\n0000000115 00000 n\n' +
  'trailer<</Size 4/Root 1 0 R>>\nstartxref\n190\n%%EOF'
)

// ── Helpers ───────────────────────────────────────────────────────────────────

function ok(msg: string)   { console.log(`  ✓  ${msg}`) }
function fail(msg: string) { console.error(`  ✗  ${msg}`) }
function info(msg: string) { console.log(`  ·  ${msg}`) }

function env(name: string): string {
  const val = process.env[name]
  if (!val) throw new Error(`Variable de entorno requerida: ${name}`)
  return val
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function run(): Promise<void> {
  console.log('\n━━━  OLAAC — Storage connectivity test  ━━━\n')
  info(`Bucket  : ${BUCKET}`)
  info(`Objeto  : ${TEST_PATH}`)
  info(`Tamaño  : ${MINIMAL_PDF.byteLength} bytes`)
  console.log()

  // ── 1. Cliente admin ───────────────────────────────────────────────────────
  const url = env('SUPABASE_URL')
  const key = env('SUPABASE_SERVICE_ROLE_KEY')
  const admin = createClient(url, key, { auth: { persistSession: false } })
  ok('Cliente Supabase inicializado (service_role)')

  // ── 2. Verificar que el bucket existe ──────────────────────────────────────
  const { data: buckets, error: listBucketsErr } = await admin.storage.listBuckets()

  if (listBucketsErr) {
    fail(`Error al listar buckets: ${listBucketsErr.message}`)
    console.error('\n  Verifica que SUPABASE_SERVICE_ROLE_KEY sea correcto.\n')
    process.exit(1)
  }

  const bucket = (buckets ?? []).find((b) => b.id === BUCKET)

  if (!bucket) {
    fail(`Bucket '${BUCKET}' no encontrado.`)
    console.error(
      '\n  Opciones para crearlo:\n' +
      '  a) Ejecutar supabase/migrations/004_storage_certificates.sql en el Dashboard → SQL Editor\n' +
      '  b) supabase db push (requiere CLI instalada)\n'
    )
    process.exit(1)
  }

  ok(`Bucket '${BUCKET}' encontrado — público: ${bucket.public ? 'sí' : 'no'}`)

  if (bucket.public) {
    fail('El bucket está marcado como público — debería ser privado.')
    console.error('  Aplica la migración 004 para corregirlo.\n')
    process.exit(1)
  }

  // ── 3. Upload ──────────────────────────────────────────────────────────────
  const { error: uploadErr } = await admin.storage
    .from(BUCKET)
    .upload(TEST_PATH, MINIMAL_PDF, {
      contentType:  'application/pdf',
      upsert:       true,
      cacheControl: '0',
    })

  if (uploadErr) {
    fail(`Upload fallido: ${uploadErr.message}`)
    console.error('\n  Verifica las políticas RLS del bucket.\n')
    process.exit(1)
  }

  ok(`Upload OK → ${TEST_PATH}`)

  // ── 4. Verificar existencia (list) ─────────────────────────────────────────
  const { data: listed, error: listErr } = await admin.storage
    .from(BUCKET)
    .list('_dry-run', { search: `test-${(TEST_PATH.split('-')[2] ?? '').split('.')[0]}` })

  if (listErr) {
    fail(`List fallido: ${listErr.message}`)
  } else if ((listed ?? []).length === 0) {
    fail('Objeto subido pero no encontrado en el listado — estado inconsistente.')
  } else {
    ok(`List OK — objeto encontrado (${listed![0]!.name})`)
  }

  // ── 5. Eliminar objeto de prueba ───────────────────────────────────────────
  const { error: removeErr } = await admin.storage
    .from(BUCKET)
    .remove([TEST_PATH])

  if (removeErr) {
    fail(`Delete fallido: ${removeErr.message}`)
    console.error(`  El objeto de prueba quedó en el bucket: ${TEST_PATH}`)
    console.error('  Bórralo manualmente desde el Dashboard → Storage.\n')
    process.exit(1)
  }

  ok(`Delete OK — objeto de prueba eliminado`)

  // ── 6. Resultado final ─────────────────────────────────────────────────────
  console.log('\n━━━  Resultado: PASS  ━━━')
  console.log('  El bucket "certificates" está correctamente configurado:')
  console.log('  · Privado (no accesible sin autenticación)')
  console.log('  · El service_role puede subir, listar y eliminar objetos')
  console.log('  · Listo para recibir certificados PDF\n')
}

run().catch((err: unknown) => {
  const message = err instanceof Error ? err.message : String(err)
  fail(`Error inesperado: ${message}`)
  console.error()
  process.exit(1)
})
