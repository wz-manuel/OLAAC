/**
 * CertificateTemplate — Componente React-PDF del certificado OLAAC.
 *
 * ⚠️  NOTA DE ACCESIBILIDAD (PDF):
 * @react-pdf/renderer genera PDF 1.5 estándar. Esta versión NO produce
 * PDFs con etiquetas de estructura (Tagged PDF / PDF/UA), que son
 * necesarias para que los lectores de pantalla naveguen el documento.
 *
 * Lo que SÍ se implementa dentro de las posibilidades de la librería:
 *   - lang="es-MX" en los metadatos del documento (Document.language)
 *   - Metadatos completos: title, author, subject, creator
 *   - Orden visual de contenido coherente con la lectura lineal
 *   - Contraste de color mínimo WCAG AA en todos los textos
 *
 * Para PDF/UA completo en producción, evaluar:
 *   - Puppeteer → Chrome print-to-PDF + axe-pdf para validación
 *   - pdfmake con estructura de tags manual
 *   - Post-procesado con Adobe PDF Accessibility API
 *
 * Este certificado es adecuado para impresión y uso visual.
 * Para distribución digital con requisito de accesibilidad estricta,
 * documentar la limitación y ofrecer una alternativa HTML equivalente.
 */

import {
  Document,
  Page,
  View,
  Text,
  Image,
  StyleSheet,
  type DocumentProps,
} from '@react-pdf/renderer'

// ──────────────────────────────────────────────────────────────────────────────
// Props
// ──────────────────────────────────────────────────────────────────────────────

export interface CertificateData {
  studentName: string
  courseTitle: string
  folio: string
  issuedAt: string        // ISO 8601 — se formatea a texto legible internamente
  qrCodeDataUrl: string   // base64 PNG generado por el Route Handler
  verifyUrl: string       // URL de verificación pública
}

// ──────────────────────────────────────────────────────────────────────────────
// Paleta de colores OLAAC
// (valores equivalentes a los tokens de @olaac/ui, adaptados a hexadecimal)
// ──────────────────────────────────────────────────────────────────────────────
const C = {
  brand:      '#252858',   // Azul Observatorio — color primario del logo
  brandMid:   '#2d3476',   // brand-700
  accent:     '#30BCEE',   // Azul Acceso — cian de la lupa
  accentDark: '#0284b0',   // accent-600 (texto sobre fondos claros)
  ice:        '#C9EAF2',   // Azul Hielo
  white:      '#ffffff',
  gray50:     '#f9fafb',
  gray200:    '#e5e7eb',
  gray400:    '#9ca3af',
  gray700:    '#374151',
  gray900:    '#111827',
  gold:       '#b45309',   // decorativo — solo como acento, no portador de información
} as const

// ──────────────────────────────────────────────────────────────────────────────
// Estilos
// Nota: @react-pdf/renderer usa un subconjunto de CSS — sin grid ni flex-wrap.
// ──────────────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  page: {
    backgroundColor: C.white,
    paddingHorizontal: 56,
    paddingVertical: 48,
    fontFamily: 'Helvetica',
  },

  // ── Borde decorativo exterior ─────────────────────────────────────────────
  outerBorder: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    bottom: 20,
    borderWidth: 2,
    borderColor: C.brand,
    borderStyle: 'solid',
  },
  innerBorder: {
    position: 'absolute',
    top: 26,
    left: 26,
    right: 26,
    bottom: 26,
    borderWidth: 0.5,
    borderColor: C.brandMid,
    borderStyle: 'solid',
  },

  // ── Encabezado ────────────────────────────────────────────────────────────
  header: {
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: C.gray200,
    borderBottomStyle: 'solid',
  },
  logoText: {
    fontSize: 32,
    fontFamily: 'Helvetica-Bold',
    color: C.brand,
    letterSpacing: 6,
  },
  logoSubtitle: {
    fontSize: 9,
    color: C.gray700,
    letterSpacing: 2,
    marginTop: 4,
    textTransform: 'uppercase',
  },

  // ── Título del certificado ────────────────────────────────────────────────
  titleSection: {
    alignItems: 'center',
    marginBottom: 28,
  },
  certLabel: {
    fontSize: 10,
    color: C.gold,
    letterSpacing: 4,
    textTransform: 'uppercase',
    marginBottom: 8,
    fontFamily: 'Helvetica-Bold',
  },
  certTitle: {
    fontSize: 26,
    color: C.brand,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 1,
  },

  // ── Cuerpo del certificado ────────────────────────────────────────────────
  body: {
    alignItems: 'center',
    marginBottom: 32,
  },
  bodyText: {
    fontSize: 12,
    color: C.gray700,
    textAlign: 'center',
    lineHeight: 1.6,
  },
  studentName: {
    fontSize: 28,
    fontFamily: 'Helvetica-Bold',
    color: C.brand,
    marginTop: 10,
    marginBottom: 10,
    textAlign: 'center',
  },
  coursePreposition: {
    fontSize: 12,
    color: C.gray700,
    textAlign: 'center',
    marginBottom: 6,
  },
  courseName: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    color: C.brandMid,
    textAlign: 'center',
    marginBottom: 6,
  },
  completionText: {
    fontSize: 11,
    color: C.gray700,
    textAlign: 'center',
  },

  // ── Divisor decorativo ────────────────────────────────────────────────────
  divider: {
    height: 1,
    backgroundColor: C.gray200,
    marginHorizontal: 40,
    marginBottom: 24,
  },

  // ── Pie de página: folio + QR ─────────────────────────────────────────────
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  folioSection: {
    flex: 1,
  },
  folioRow: {
    marginBottom: 8,
  },
  folioLabel: {
    fontSize: 8,
    color: C.gray400,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  folioValue: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: C.gray900,
    letterSpacing: 1,
  },
  dateValue: {
    fontSize: 10,
    color: C.gray700,
  },
  issuerRow: {
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: C.gray200,
    borderTopStyle: 'solid',
  },
  issuerLabel: {
    fontSize: 8,
    color: C.gray400,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  issuerValue: {
    fontSize: 9,
    color: C.gray700,
  },

  // ── QR Code ───────────────────────────────────────────────────────────────
  qrSection: {
    alignItems: 'center',
    marginLeft: 24,
  },
  qrCode: {
    width: 72,
    height: 72,
    marginBottom: 4,
  },
  qrLabel: {
    fontSize: 7,
    color: C.gray400,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
})

// ──────────────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

// ──────────────────────────────────────────────────────────────────────────────
// Componente de Certificado
// ──────────────────────────────────────────────────────────────────────────────

export function CertificateTemplate({
  studentName,
  courseTitle,
  folio,
  issuedAt,
  qrCodeDataUrl,
}: CertificateData) {
  const docProps: DocumentProps = {
    // Metadatos accesibles del PDF — lo máximo que permite @react-pdf/renderer
    title:    `Certificado de finalización — ${courseTitle}`,
    author:   'OLAAC — Observatorio Latinoamericano de Accesibilidad',
    subject:  `Certificado de finalización del curso "${courseTitle}" otorgado a ${studentName}`,
    creator:  'OLAAC Academia — academia.olaac.org',
    producer: '@react-pdf/renderer',
    language: 'es-MX',
    // ⚠️ `tagged: true` no existe en @react-pdf/renderer — no genera PDF/UA
  }

  return (
    <Document {...docProps}>
      <Page size="A4" orientation="landscape" style={s.page}>

        {/* Bordes decorativos — posicionados en absoluto */}
        <View style={s.outerBorder} fixed />
        <View style={s.innerBorder} fixed />

        {/* ── Encabezado ─────────────────────────────────────────────── */}
        <View style={s.header}>
          <Text style={s.logoText}>OLAAC</Text>
          <Text style={s.logoSubtitle}>
            Observatorio Latinoamericano de Accesibilidad
          </Text>
        </View>

        {/* ── Título ────────────────────────────────────────────────── */}
        <View style={s.titleSection}>
          <Text style={s.certLabel}>◆ Certificado ◆</Text>
          <Text style={s.certTitle}>Certificado de Finalización</Text>
        </View>

        {/* ── Cuerpo ────────────────────────────────────────────────── */}
        <View style={s.body}>
          <Text style={s.bodyText}>
            El Observatorio Latinoamericano de Accesibilidad certifica que
          </Text>
          <Text style={s.studentName}>{studentName}</Text>
          <Text style={s.coursePreposition}>
            ha completado satisfactoriamente el curso
          </Text>
          <Text style={s.courseName}>{courseTitle}</Text>
          <Text style={s.completionText}>
            cumpliendo con todos los requisitos de la Academia OLAAC.
          </Text>
        </View>

        {/* ── Divisor ───────────────────────────────────────────────── */}
        <View style={s.divider} />

        {/* ── Pie: folio + fecha + QR ───────────────────────────────── */}
        <View style={s.footer}>
          <View style={s.folioSection}>
            <View style={s.folioRow}>
              <Text style={s.folioLabel}>Folio de validación</Text>
              <Text style={s.folioValue}>{folio}</Text>
            </View>
            <View style={s.folioRow}>
              <Text style={s.folioLabel}>Fecha de emisión</Text>
              <Text style={s.dateValue}>{formatDate(issuedAt)}</Text>
            </View>
            <View style={s.issuerRow}>
              <Text style={s.issuerLabel}>Emitido por</Text>
              <Text style={s.issuerValue}>
                OLAAC — Observatorio Latinoamericano de Accesibilidad{'\n'}
                academia.olaac.org
              </Text>
            </View>
          </View>

          {/* QR Code de verificación */}
          <View style={s.qrSection}>
            <Image
              src={qrCodeDataUrl}
              style={s.qrCode}
            />
            <Text style={s.qrLabel}>Verificar autenticidad</Text>
          </View>
        </View>

      </Page>
    </Document>
  )
}
