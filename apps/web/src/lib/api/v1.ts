/**
 * Utilidades compartidas para los Route Handlers de la API pública v1.
 * Centraliza: cliente Supabase sin cookies, cabeceras CORS y helpers
 * de respuesta consistentes.
 */

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'

// ── Cliente público (anon key — lectura pública via RLS) ──────────────────────
export function publicDb() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// ── Cabeceras comunes ─────────────────────────────────────────────────────────
export const API_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  // Cache en CDN: 1 hora fresca, sirve stale hasta 24 h mientras revalida
  'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
} as const

// ── Helpers de respuesta ──────────────────────────────────────────────────────

export function apiOk<T>(data: T, meta?: Record<string, unknown>, status = 200) {
  const body = meta ? { data, meta } : { data }
  return NextResponse.json(body, { status, headers: API_HEADERS })
}

export function apiError(code: string, message: string, status: number) {
  return NextResponse.json(
    { error: { code, message } },
    {
      status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    }
  )
}

// ── Respuesta para OPTIONS preflight ─────────────────────────────────────────
export function apiOptions() {
  return new Response(null, { status: 204, headers: API_HEADERS })
}

// ── Tipos públicos de la API ──────────────────────────────────────────────────

export interface ApiIssue {
  audit_id: string
  title: string
  impact: 'critical' | 'serious'
  affected_count: number
}

export interface ApiSite {
  alias: string
  nombre_sitio: string
  url: string
  pais: string
  categoria: string
  subcategoria: string | null
  accessibility_score: number | null
  issues: { critical: number; serious: number }
  measured_at: string
}

export interface ApiSiteDetail extends Omit<ApiSite, 'issues'> {
  issues: ApiIssue[]
}

// ── Utilidad: mapear critical_issues JSONB → conteos o detalle ───────────────

interface RawIssue {
  auditId: string
  title: string
  impact: 'critical' | 'serious'
  affectedCount: number
}

export function issueCount(raw: unknown): ApiSite['issues'] {
  if (!Array.isArray(raw)) return { critical: 0, serious: 0 }
  return {
    critical: raw.filter((i: RawIssue) => i.impact === 'critical').length,
    serious:  raw.filter((i: RawIssue) => i.impact === 'serious').length,
  }
}

export function issueDetail(raw: unknown): ApiIssue[] {
  if (!Array.isArray(raw)) return []
  return (raw as RawIssue[]).map((i) => ({
    audit_id:      i.auditId,
    title:         i.title,
    impact:        i.impact,
    affected_count: i.affectedCount,
  }))
}
