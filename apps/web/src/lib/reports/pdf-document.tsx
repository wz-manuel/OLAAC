/**
 * Documento PDF institucional OLAAC.
 * Usa @react-pdf/renderer — solo primitivos (Document, Page, View, Text).
 * Llamar desde Route Handlers con runtime = 'nodejs'.
 */

import {
  Document, Page, Text, View, StyleSheet,
} from '@react-pdf/renderer'

import type { ReportData } from './data'
import { scoreColor, scoreLabel, formatDateLong } from './data'

// ── Tokens de diseño ──────────────────────────────────────────────────────────
const C = {
  brand:    '#252858',
  accent:   '#30BCEE',
  white:    '#ffffff',
  gray50:   '#f9fafb',
  gray100:  '#f3f4f6',
  gray200:  '#e5e7eb',
  gray400:  '#9ca3af',
  gray500:  '#6b7280',
  gray700:  '#374151',
  gray900:  '#111827',
}

// ── Estilos ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  // Páginas
  coverPage: {
    backgroundColor: C.brand,
    padding: 0,
    fontFamily: 'Helvetica',
  },
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 9,
    color: C.gray700,
  },

  // Portada
  coverTop: {
    flex: 1,
    padding: 50,
    justifyContent: 'flex-end',
  },
  coverOrgLabel: {
    fontSize: 10,
    color: C.accent,
    letterSpacing: 2,
    marginBottom: 20,
    textTransform: 'uppercase',
  },
  coverTitle: {
    fontSize: 28,
    fontFamily: 'Helvetica-Bold',
    color: C.white,
    lineHeight: 1.3,
    marginBottom: 12,
  },
  coverSubtitle: {
    fontSize: 13,
    color: '#a5b4fc',
    marginBottom: 40,
  },
  coverAccentLine: {
    width: 48,
    height: 3,
    backgroundColor: C.accent,
    marginBottom: 40,
  },
  coverBottom: {
    borderTop: `1px solid rgba(255,255,255,0.15)`,
    padding: '16px 50px',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  coverMeta: {
    fontSize: 8,
    color: 'rgba(255,255,255,0.5)',
  },
  coverUrl: {
    fontSize: 9,
    color: C.accent,
  },

  // Cabecera de sección
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    borderBottom: `2px solid ${C.brand}`,
    paddingBottom: 6,
  },
  sectionAccent: {
    width: 4,
    height: 16,
    backgroundColor: C.accent,
    marginRight: 8,
    borderRadius: 2,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: C.brand,
  },

  // KPI cards (fila de 4)
  kpiRow: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 10,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: C.gray50,
    borderRadius: 6,
    padding: 12,
    borderLeft: `3px solid ${C.brand}`,
  },
  kpiValue: {
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    color: C.brand,
    marginBottom: 2,
  },
  kpiLabel: {
    fontSize: 8,
    color: C.gray500,
  },

  // Texto de resumen
  bodyText: {
    fontSize: 9,
    color: C.gray700,
    lineHeight: 1.6,
    marginBottom: 8,
  },

  // Tablas
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: C.brand,
    borderRadius: 4,
    marginBottom: 2,
    padding: '6px 8px',
  },
  tableHeaderCell: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: C.white,
  },
  tableRow: {
    flexDirection: 'row',
    padding: '5px 8px',
    borderBottom: `1px solid ${C.gray100}`,
  },
  tableRowAlt: {
    flexDirection: 'row',
    padding: '5px 8px',
    backgroundColor: C.gray50,
    borderBottom: `1px solid ${C.gray100}`,
  },
  tableCell: {
    fontSize: 8,
    color: C.gray700,
  },
  tableCellMono: {
    fontSize: 7,
    color: C.gray500,
    fontFamily: 'Courier',
  },

  // Score badge inline
  scoreBadge: {
    borderRadius: 4,
    padding: '2px 6px',
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: C.white,
  },

  // Footer fijo
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTop: `1px solid ${C.gray200}`,
    paddingTop: 6,
  },
  footerText: {
    fontSize: 7,
    color: C.gray400,
  },
})

// ── Sub-componentes ───────────────────────────────────────────────────────────

function Footer({ data }: { data: ReportData }) {
  return (
    <View style={s.footer} fixed>
      <Text style={s.footerText}>
        OLAAC — Observatorio Latinoamericano de Accesibilidad · olaac.org
      </Text>
      <Text
        style={s.footerText}
        render={({ pageNumber, totalPages }) =>
          `Generado ${formatDateLong(data.generated_at)} · Página ${pageNumber} de ${totalPages}`
        }
      />
    </View>
  )
}

function SectionHeading({ title }: { title: string }) {
  return (
    <View style={s.sectionHeader}>
      <View style={s.sectionAccent} />
      <Text style={s.sectionTitle}>{title}</Text>
    </View>
  )
}

function CoverPage({ data }: { data: ReportData }) {
  const year = new Date(data.generated_at).getFullYear()
  return (
    <Page size="A4" style={s.coverPage}>
      <View style={s.coverTop}>
        <Text style={s.coverOrgLabel}>Observatorio Latinoamericano de Accesibilidad</Text>
        <View style={s.coverAccentLine} />
        <Text style={s.coverTitle}>{data.title}</Text>
        <Text style={s.coverSubtitle}>{data.subtitle}</Text>
        <Text style={[s.coverMeta, { marginTop: 8 }]}>
          Licencia CC BY 4.0 · {year} · Datos disponibles en olaac.org/api/v1
        </Text>
      </View>
      <View style={s.coverBottom}>
        <Text style={s.coverMeta}>
          Generado: {formatDateLong(data.generated_at)}
        </Text>
        <Text style={s.coverUrl}>olaac.org</Text>
      </View>
    </Page>
  )
}

function SummaryPage({ data }: { data: ReportData }) {
  const { stats } = data
  const kpis = [
    { value: stats.avg_score !== null ? `${stats.avg_score}` : 'N/D', label: 'Score promedio /100' },
    { value: String(stats.total_sitios),   label: 'Sitios auditados' },
    { value: String(stats.countries_count), label: data.pais ? 'Categorías' : 'Países' },
    { value: String(stats.critical_sites),  label: 'Sitios críticos (<50)' },
  ]

  return (
    <Page size="A4" style={s.page}>
      <SectionHeading title="Resumen ejecutivo" />

      <View style={s.kpiRow}>
        {kpis.map((k) => (
          <View key={k.label} style={s.kpiCard}>
            <Text style={s.kpiValue}>{k.value}</Text>
            <Text style={s.kpiLabel}>{k.label}</Text>
          </View>
        ))}
      </View>

      <Text style={s.bodyText}>
        Este informe presenta los resultados de la auditoría automatizada de accesibilidad
        web realizada por el Observatorio Latinoamericano de Accesibilidad (OLAAC) sobre
        sitios web de instituciones públicas de América Latina. Los scores corresponden a la
        categoría de Accesibilidad obtenida mediante análisis automático (escala 0–100) y se actualizan cada
        semana de forma automática.
      </Text>

      <Text style={s.bodyText}>
        El umbral mínimo recomendado por OLAAC para sitios públicos es 95/100, conforme a
        los criterios de conformidad nivel AA de WCAG 2.1. Un score por debajo de 50
        indica barreras de acceso graves que impiden a personas con discapacidad usar el
        servicio digital.
      </Text>

      {stats.last_audit && (
        <Text style={[s.bodyText, { marginTop: 4, color: C.gray500 }]}>
          Última auditoría registrada: {formatDateLong(stats.last_audit)}
        </Text>
      )}

      <Footer data={data} />
    </Page>
  )
}

function CountriesPage({ data }: { data: ReportData }) {
  if (data.countries.length <= 1) return null

  const colWidths = { pais: '40%', sitios: '15%', score: '20%', label: '15%', criticos: '10%' }

  return (
    <Page size="A4" style={s.page}>
      <SectionHeading title="Ranking por país" />

      {/* Header */}
      <View style={s.tableHeader}>
        <Text style={[s.tableHeaderCell, { width: colWidths.pais }]}>País</Text>
        <Text style={[s.tableHeaderCell, { width: colWidths.sitios, textAlign: 'center' }]}>Sitios</Text>
        <Text style={[s.tableHeaderCell, { width: colWidths.score, textAlign: 'center' }]}>Score prom.</Text>
        <Text style={[s.tableHeaderCell, { width: colWidths.label, textAlign: 'center' }]}>Calificación</Text>
        <Text style={[s.tableHeaderCell, { width: colWidths.criticos, textAlign: 'center' }]}>Críticos</Text>
      </View>

      {data.countries.map((c, i) => (
        <View key={c.pais} style={i % 2 === 0 ? s.tableRow : s.tableRowAlt}>
          <Text style={[s.tableCell, { width: colWidths.pais, fontFamily: 'Helvetica-Bold' }]}>
            {c.pais}
          </Text>
          <Text style={[s.tableCell, { width: colWidths.sitios, textAlign: 'center' }]}>
            {c.total_sitios}
          </Text>
          <View style={{ width: colWidths.score, alignItems: 'center', justifyContent: 'center' }}>
            <View style={[s.scoreBadge, { backgroundColor: scoreColor(c.avg_score) }]}>
              <Text>{c.avg_score !== null ? `${c.avg_score}` : 'N/D'}</Text>
            </View>
          </View>
          <Text style={[s.tableCell, { width: colWidths.label, textAlign: 'center', color: scoreColor(c.avg_score) }]}>
            {scoreLabel(c.avg_score)}
          </Text>
          <Text style={[s.tableCell, { width: colWidths.criticos, textAlign: 'center', color: c.criticos > 0 ? '#dc2626' : C.gray700 }]}>
            {c.criticos}
          </Text>
        </View>
      ))}

      <Footer data={data} />
    </Page>
  )
}

function SitesPage({ data }: { data: ReportData }) {
  const colWidths = { num: '5%', sitio: '35%', pais: '15%', cat: '18%', score: '12%', fecha: '15%' }
  const showPais = !data.pais // Solo en reporte regional

  return (
    <Page size="A4" style={s.page} wrap>
      <SectionHeading title="Ranking de sitios auditados" />

      {/* Header */}
      <View style={s.tableHeader} fixed>
        <Text style={[s.tableHeaderCell, { width: colWidths.num }]}>#</Text>
        <Text style={[s.tableHeaderCell, { width: colWidths.sitio }]}>Sitio</Text>
        {showPais && (
          <Text style={[s.tableHeaderCell, { width: colWidths.pais }]}>País</Text>
        )}
        <Text style={[s.tableHeaderCell, { width: showPais ? colWidths.cat : '33%' }]}>Categoría</Text>
        <Text style={[s.tableHeaderCell, { width: colWidths.score, textAlign: 'center' }]}>Score</Text>
        <Text style={[s.tableHeaderCell, { width: colWidths.fecha, textAlign: 'right' }]}>Auditado</Text>
      </View>

      {data.sites.map((site, i) => (
        <View key={site.alias} style={i % 2 === 0 ? s.tableRow : s.tableRowAlt} wrap={false}>
          <Text style={[s.tableCell, { width: colWidths.num, color: C.gray400 }]}>{i + 1}</Text>
          <View style={{ width: colWidths.sitio }}>
            <Text style={[s.tableCell, { fontFamily: 'Helvetica-Bold', marginBottom: 1 }]}>
              {site.nombre_sitio}
            </Text>
            <Text style={s.tableCellMono}>{site.url}</Text>
          </View>
          {showPais && (
            <Text style={[s.tableCell, { width: colWidths.pais }]}>{site.pais}</Text>
          )}
          <Text style={[s.tableCell, { width: showPais ? colWidths.cat : '33%' }]}>
            {site.categoria}{site.subcategoria ? ` · ${site.subcategoria}` : ''}
          </Text>
          <View style={{ width: colWidths.score, alignItems: 'center' }}>
            {site.accessibility_score !== null ? (
              <View style={[s.scoreBadge, { backgroundColor: scoreColor(site.accessibility_score) }]}>
                <Text>{Math.round(site.accessibility_score)}</Text>
              </View>
            ) : (
              <Text style={[s.tableCell, { color: C.gray400 }]}>N/D</Text>
            )}
          </View>
          <Text style={[s.tableCell, { width: colWidths.fecha, textAlign: 'right', color: C.gray500 }]}>
            {new Date(site.measured_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: '2-digit' })}
          </Text>
        </View>
      ))}

      <Footer data={data} />
    </Page>
  )
}

function MethodologyPage({ data }: { data: ReportData }) {
  return (
    <Page size="A4" style={s.page}>
      <SectionHeading title="Metodología y notas de lectura" />

      <Text style={[s.bodyText, { fontFamily: 'Helvetica-Bold', color: C.gray900 }]}>
        Motor de auditoría
      </Text>
      <Text style={s.bodyText}>
        Los scores se obtienen mediante análisis automático de accesibilidad, evaluando
        únicamente la categoría de Accesibilidad sobre cada URL. La auditoría se realiza
        en modo escritorio (desktop), sin throttling artificial, usando Chrome headless.
        Cada sitio se audita una vez por semana, los domingos a las 00:00 UTC.
      </Text>

      <Text style={[s.bodyText, { fontFamily: 'Helvetica-Bold', color: C.gray900, marginTop: 8 }]}>
        Escala de scores
      </Text>
      {[
        { range: '90–100', label: 'Excelente', desc: 'Cumple o supera el umbral OLAAC (95). Barreras mínimas.' },
        { range: '80–89',  label: 'Bueno',     desc: 'Algunas barreras presentes. Mejora deseable.' },
        { range: '65–79',  label: 'Moderado',  desc: 'Barreras de impacto grave para usuarios con discapacidad.' },
        { range: '50–64',  label: 'Deficiente', desc: 'Barreras críticas múltiples. Dificulta acceso real.' },
        { range: '0–49',   label: 'Crítico',   desc: 'Inaccessible para la mayoría de tecnologías de asistencia.' },
      ].map((row) => (
        <View key={row.range} style={{ flexDirection: 'row', marginBottom: 4 }}>
          <View style={[s.scoreBadge, { backgroundColor: scoreColor(parseInt(row.range)), width: 36, textAlign: 'center', marginRight: 8 }]}>
            <Text>{row.range}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[s.tableCell, { fontFamily: 'Helvetica-Bold', marginBottom: 1 }]}>{row.label}</Text>
            <Text style={s.tableCell}>{row.desc}</Text>
          </View>
        </View>
      ))}

      <Text style={[s.bodyText, { fontFamily: 'Helvetica-Bold', color: C.gray900, marginTop: 12 }]}>
        Violaciones registradas
      </Text>
      <Text style={s.bodyText}>
        {`Solo se registran violaciones de impacto "critical" y "serious" según la taxonomía de axe-core, que corresponden a barreras que impiden o dificultan severamente el acceso. Violaciones de impacto "moderate" y "minor" no se incluyen en el score.`}
      </Text>

      <Text style={[s.bodyText, { fontFamily: 'Helvetica-Bold', color: C.gray900, marginTop: 12 }]}>
        Licencia y cita
      </Text>
      <Text style={s.bodyText}>
        Datos disponibles bajo licencia Creative Commons Attribution 4.0 International
        (CC BY 4.0). Cita sugerida:{'\n'}
        OLAAC — Observatorio Latinoamericano de Accesibilidad. ({new Date().getFullYear()}).
        Datos de accesibilidad web en América Latina. olaac.org/api/v1
      </Text>

      <Text style={[s.bodyText, { marginTop: 12, color: C.gray500 }]}>
        Contacto: datos@olaac.org · olaac.org/tickets/nuevo
      </Text>

      <Footer data={data} />
    </Page>
  )
}

// ── Documento principal ───────────────────────────────────────────────────────

export function ReportDocument({ data }: { data: ReportData }) {
  return (
    <Document
      title={data.title}
      author="OLAAC — Observatorio Latinoamericano de Accesibilidad"
      subject="Informe de accesibilidad web"
      keywords="accesibilidad, WCAG, LATAM, OLAAC, accesibilidad digital"
      creator="olaac.org"
    >
      <CoverPage data={data} />
      <SummaryPage data={data} />
      {!data.pais && <CountriesPage data={data} />}
      <SitesPage data={data} />
      <MethodologyPage data={data} />
    </Document>
  )
}
