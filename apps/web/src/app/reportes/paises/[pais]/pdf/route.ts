import React from 'react'
import { renderToBuffer, type DocumentProps } from '@react-pdf/renderer'
import type { ReactElement } from 'react'
import { fetchReportData } from '@/lib/reports/data'
import { ReportDocument } from '@/lib/reports/pdf-document'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(
  _request: Request,
  { params }: { params: { pais: string } }
) {
  const pais = decodeURIComponent(params.pais)
  const data = await fetchReportData(pais)

  if (data.sites.length === 0) {
    return new Response(JSON.stringify({ error: 'País no encontrado o sin datos.' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const doc = React.createElement(ReportDocument, { data }) as ReactElement<DocumentProps>
  const buffer = await renderToBuffer(doc)

  const year = new Date().getFullYear()
  const slug = pais.toLowerCase().replace(/\s+/g, '-').normalize('NFD').replace(/[̀-ͯ]/g, '')
  const filename = `olaac-reporte-${slug}-${year}.pdf`

  return new Response(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  })
}
