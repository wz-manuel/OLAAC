import React from 'react'
import { renderToBuffer, type DocumentProps } from '@react-pdf/renderer'
import type { ReactElement } from 'react'
import { fetchReportData } from '@/lib/reports/data'
import { ReportDocument } from '@/lib/reports/pdf-document'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  const data = await fetchReportData()

  const doc = React.createElement(ReportDocument, { data }) as ReactElement<DocumentProps>
  const buffer = await renderToBuffer(doc)

  const year = new Date().getFullYear()
  const filename = `olaac-reporte-regional-${year}.pdf`

  return new Response(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  })
}
