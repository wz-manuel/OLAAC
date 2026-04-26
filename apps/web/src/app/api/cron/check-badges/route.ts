import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

import { notifyRegresionDetectada, notifyRenovacionProxima } from '@/lib/email'
import type { Database } from '@/lib/supabase/types'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

// ─── Tipos locales ────────────────────────────────────────────────────────────

interface BadgeRow {
  id: string
  folio: string
  nivel: string
  fecha_vencimiento: string
  alerta_regresion: boolean
  alerta_vencimiento_enviada: boolean
  organizaciones_distintivo: {
    sitio_web: string
    contacto_email: string
    contacto_nombre: string
    nombre_organizacion: string
  } | null
}

interface CriterioRow {
  nivel: string
  min_porcentaje_accesibilidad: number
}

interface MetricRow {
  url: string
  accessibility_score: number | null
}

// ─── Normaliza URL para comparar ignorando protocolo, www y trailing slash ────

function normalizeUrl(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/$/, '')
}

// ─── Handler ──────────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  // Autenticación: Vercel inyecta el header en producción; en dev se pasa manualmente
  const authHeader = request.headers.get('Authorization')
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ error: 'Supabase env vars missing' }, { status: 500 })
  }

  // Service role bypasa RLS — necesario para leer y escribir como sistema
  const supabase = createClient<Database>(supabaseUrl, serviceKey)

  // ── 1. Cargar badges vigentes con org + criterio ──────────────────────────

  const [
    { data: badges, error: badgesError },
    { data: criterios },
    { data: metrics },
  ] = await Promise.all([
    supabase
      .from('distintivos_emitidos')
      .select(`
        id,
        folio,
        nivel,
        fecha_vencimiento,
        alerta_regresion,
        alerta_vencimiento_enviada,
        organizaciones_distintivo ( sitio_web, contacto_email, contacto_nombre, nombre_organizacion )
      `)
      .eq('vigente', true)
      .gt('fecha_vencimiento', new Date().toISOString()),
    supabase
      .from('criterios_distintivo')
      .select('nivel, min_porcentaje_accesibilidad'),
    supabase
      .from('lighthouse_metrics')
      .select('url, accessibility_score'),
  ])

  if (badgesError) {
    return NextResponse.json({ error: badgesError.message }, { status: 500 })
  }

  // ── 2. Indexar criterios por nivel y scores por URL normalizada ───────────

  const criteriosByNivel = new Map<string, number>()
  for (const c of (criterios ?? []) as CriterioRow[]) {
    criteriosByNivel.set(c.nivel, c.min_porcentaje_accesibilidad)
  }

  const metricsByNorm = new Map<string, number>()
  for (const m of (metrics ?? []) as MetricRow[]) {
    if (m.accessibility_score !== null) {
      metricsByNorm.set(normalizeUrl(m.url), m.accessibility_score)
    }
  }

  // ── 3. Procesar cada badge ────────────────────────────────────────────────

  const results = {
    total: 0, ok: 0, regresion: 0, renovacion: 0, sin_datos: 0, errors: 0,
  }

  const ahora          = new Date()
  const DIAS_AVISO     = 30
  const MS_POR_DIA     = 86_400_000

  for (const badge of (badges ?? []) as BadgeRow[]) {
    results.total++
    const org    = badge.organizaciones_distintivo
    const scoreMin = criteriosByNivel.get(badge.nivel) ?? null
    if (!org || scoreMin === null) { results.errors++; continue }

    const urlNorm    = normalizeUrl(org.sitio_web)
    const scoreActual = metricsByNorm.get(urlNorm) ?? null

    const vencimiento    = new Date(badge.fecha_vencimiento)
    const diasRestantes  = Math.ceil((vencimiento.getTime() - ahora.getTime()) / MS_POR_DIA)
    const proximoVencer  = diasRestantes <= DIAS_AVISO

    // ─── Determinar tipo de resultado ─────────────────────────────────────

    let tipo: 'ok' | 'regresion' | 'renovacion' | 'sin_datos' = 'ok'
    let cumpleScore: boolean | null = null
    let alertaEnviada = false

    if (scoreActual === null) {
      tipo = 'sin_datos'
    } else {
      cumpleScore = scoreActual >= scoreMin
      if (!cumpleScore) tipo = 'regresion'
    }

    // ─── Alerta de regresión ──────────────────────────────────────────────

    if (tipo === 'regresion' && !badge.alerta_regresion) {
      try {
        await notifyRegresionDetectada({
          to:                   org.contacto_email,
          nombreContacto:       org.contacto_nombre,
          nombreOrganizacion:   org.nombre_organizacion,
          folio:                badge.folio,
          nivel:                badge.nivel,
          scoreActual:          scoreActual!,
          scoreMinimo:          scoreMin,
          urlVerificada:        org.sitio_web,
        })
        alertaEnviada = true
        results.regresion++
      } catch {
        results.errors++
      }

      await supabase
        .from('distintivos_emitidos')
        .update({ alerta_regresion: true, ultimo_score: scoreActual, ultimo_check_at: ahora.toISOString() })
        .eq('id', badge.id)

    } else if (tipo === 'ok' && badge.alerta_regresion) {
      // El sitio se recuperó — limpiamos la alerta
      await supabase
        .from('distintivos_emitidos')
        .update({ alerta_regresion: false, ultimo_score: scoreActual, ultimo_check_at: ahora.toISOString() })
        .eq('id', badge.id)
      results.ok++

    } else {
      // Actualizar score sin cambiar estado de alerta
      await supabase
        .from('distintivos_emitidos')
        .update({ ultimo_score: scoreActual, ultimo_check_at: ahora.toISOString() })
        .eq('id', badge.id)
      if (tipo === 'ok') results.ok++
      if (tipo === 'sin_datos') results.sin_datos++
    }

    // ─── Recordatorio de renovación ───────────────────────────────────────

    if (proximoVencer && !badge.alerta_vencimiento_enviada) {
      try {
        await notifyRenovacionProxima({
          to:                   org.contacto_email,
          nombreContacto:       org.contacto_nombre,
          nombreOrganizacion:   org.nombre_organizacion,
          folio:                badge.folio,
          nivel:                badge.nivel,
          diasRestantes,
          fechaVencimiento:     vencimiento.toLocaleDateString('es-MX', { dateStyle: 'long' }),
        })
        results.renovacion++
      } catch {
        results.errors++
      }

      await supabase
        .from('distintivos_emitidos')
        .update({ alerta_vencimiento_enviada: true })
        .eq('id', badge.id)

      tipo = 'renovacion'
      alertaEnviada = true
    }

    // ─── Registrar en el log de re-auditorías ─────────────────────────────

    await supabase.from('distintivo_reauditorias').insert({
      distintivo_id:    badge.id,
      tipo,
      url_verificada:   org.sitio_web,
      score_encontrado: scoreActual,
      score_minimo:     scoreMin,
      cumple_score:     cumpleScore,
      alerta_enviada:   alertaEnviada,
    })
  }

  return NextResponse.json({ success: true, checked_at: ahora.toISOString(), results })
}
