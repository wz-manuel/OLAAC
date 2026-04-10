import { getScoreColor, getScoreLabel } from '@olaac/ui'

interface KpiCardsProps {
  avgA11y: number | null
  totalSites: number
  lastMeasuredAt: string | null
  criticalCount: number
}

/**
 * KpiCards — 4 métricas clave del dashboard de scores.
 * Accesibilidad: cada card tiene role="region" con aria-label descriptivo.
 */
export function KpiCards({ avgA11y, totalSites, lastMeasuredAt, criticalCount }: KpiCardsProps) {
  const a11yScore = avgA11y !== null ? Math.round(avgA11y) : null
  const a11yColor = a11yScore !== null ? getScoreColor(a11yScore) : '#9ca3af'
  const a11yLabel = a11yScore !== null ? getScoreLabel(a11yScore) : 'Sin datos'

  const lastDate = lastMeasuredAt
    ? new Date(lastMeasuredAt).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })
    : 'Sin datos'

  const cards = [
    {
      id: 'promedio-a11y',
      label: 'Promedio de accesibilidad',
      value: a11yScore !== null ? `${a11yScore}/100` : '—',
      sub: a11yLabel,
      accent: a11yColor,
      description: a11yScore !== null
        ? `Promedio de score de accesibilidad: ${a11yScore} de 100, calificado como ${a11yLabel}`
        : 'No hay datos de accesibilidad registrados',
    },
    {
      id: 'sitios-monitoreados',
      label: 'Sitios monitoreados',
      value: totalSites.toString(),
      sub: totalSites === 1 ? 'URL auditada' : 'URLs auditadas',
      accent: '#3240e7',
      description: `${totalSites} ${totalSites === 1 ? 'sitio monitoredo' : 'sitios monitoreados'} en total`,
    },
    {
      id: 'ultima-auditoria',
      label: 'Última auditoría',
      value: lastMeasuredAt
        ? new Date(lastMeasuredAt).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })
        : '—',
      sub: lastMeasuredAt ? lastDate : 'Sin auditorías',
      accent: '#1a7a4a',
      description: lastMeasuredAt
        ? `Última auditoría realizada el ${lastDate}`
        : 'No se han registrado auditorías',
    },
    {
      id: 'alertas-criticas',
      label: 'Alertas críticas',
      value: criticalCount.toString(),
      sub: criticalCount === 1 ? 'sitio con score < 50' : 'sitios con score < 50',
      accent: criticalCount > 0 ? '#dc2626' : '#1a7a4a',
      description: `${criticalCount} ${criticalCount === 1 ? 'sitio con score crítico (menor a 50)' : 'sitios con score crítico (menor a 50)'}`,
    },
  ]

  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="Métricas clave de accesibilidad">
      {cards.map((card) => (
        <li
          key={card.id}
          role="region"
          aria-label={card.description}
          className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm"
        >
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{card.label}</p>
          <p
            className="mt-2 text-3xl font-bold tabular-nums"
            style={{ color: card.accent }}
            aria-hidden="true"
          >
            {card.value}
          </p>
          <p className="mt-1 text-xs text-gray-500" aria-hidden="true">{card.sub}</p>
        </li>
      ))}
    </ul>
  )
}
