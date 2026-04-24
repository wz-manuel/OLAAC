import { NextRequest, NextResponse } from 'next/server'

import { createClient } from '@/lib/supabase/server'

const NIVEL_COLORS: Record<string, { bg: string; ring: string; text: string; icon: string }> = {
  oro:      { bg: '#fefce8', ring: '#fbbf24', text: '#92400e', icon: '★' },
  platino:  { bg: '#f8fafc', ring: '#94a3b8', text: '#475569', icon: '◆' },
  diamante: { bg: '#eff6ff', ring: '#3b82f6', text: '#1d4ed8', icon: '◈' },
}

const NIVEL_LABEL: Record<string, string> = {
  oro: 'Oro', platino: 'Platino', diamante: 'Diamante',
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ folio: string }> }
) {
  const { folio } = await params
  // Strip .svg extension if present
  const cleanFolio = folio.replace(/\.svg$/i, '')

  const supabase = await createClient()
  const { data } = await supabase
    .from('distintivos_emitidos')
    .select('nivel, vigente, fecha_vencimiento, organizaciones_distintivo(nombre_organizacion)')
    .eq('folio', cleanFolio)
    .maybeSingle()

  const nivel = data?.nivel ?? 'oro'
  const c = NIVEL_COLORS[nivel] ?? NIVEL_COLORS['oro']!
  const label = NIVEL_LABEL[nivel] ?? nivel
  const vigente = data
    ? data.vigente && new Date((data as { fecha_vencimiento: string }).fecha_vencimiento) > new Date()
    : false

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120" role="img" aria-label="Distintivo de Accesibilidad OLAAC nivel ${label}">
  <title>Distintivo de Accesibilidad OLAAC — Nivel ${label}</title>
  <circle cx="60" cy="60" r="56" fill="${c.bg}" stroke="${c.ring}" stroke-width="4"/>
  <circle cx="60" cy="60" r="50" fill="none" stroke="${c.ring}" stroke-width="1" stroke-dasharray="4 3" opacity="0.5"/>
  <text x="60" y="46" text-anchor="middle" font-size="28" fill="${c.text}" font-family="system-ui,sans-serif">${c.icon}</text>
  <text x="60" y="68" text-anchor="middle" font-size="13" font-weight="700" fill="${c.text}" font-family="system-ui,sans-serif" letter-spacing="1">${label.toUpperCase()}</text>
  <text x="60" y="82" text-anchor="middle" font-size="7" fill="${c.text}" font-family="system-ui,sans-serif" opacity="0.8">ACCESIBILIDAD</text>
  <text x="60" y="91" text-anchor="middle" font-size="7" fill="${c.text}" font-family="system-ui,sans-serif" opacity="0.8">OLAAC</text>
  ${!vigente ? `<line x1="20" y1="20" x2="100" y2="100" stroke="#ef4444" stroke-width="2" opacity="0.4"/>` : ''}
</svg>`

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=86400',
    },
  })
}
