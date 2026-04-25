/**
 * Gráfica de tendencia de accesibilidad a lo largo del tiempo.
 * SVG puro — sin dependencias externas.
 * WCAG 2.1 AA: <figure>/<figcaption>, tabla sr-only, puntos focusables.
 */

export interface TrendSnapshot {
  measured_at: string
  accessibility_score: number | null
}

interface ScoreTrendChartProps {
  snapshots: TrendSnapshot[]
  siteName: string
}

// ── Geometría del SVG ──────────────────────────────────────────────────────────
const W = 600
const H = 220
const PAD = { top: 16, right: 20, bottom: 44, left: 48 }
const PLOT_W = W - PAD.left - PAD.right  // 532
const PLOT_H = H - PAD.top - PAD.bottom  // 160

function scoreToY(score: number): number {
  return PAD.top + PLOT_H - (score / 100) * PLOT_H
}

function indexToX(i: number, total: number): number {
  if (total <= 1) return PAD.left + PLOT_W / 2
  return PAD.left + (i / (total - 1)) * PLOT_W
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatDateShort(iso: string): string {
  return new Date(iso).toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'short',
  })
}

function formatDateLong(iso: string): string {
  return new Date(iso).toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function scoreColor(score: number): string {
  if (score >= 90) return '#16a34a'  // verde
  if (score >= 70) return '#ca8a04'  // amarillo
  return '#dc2626'                   // rojo
}

// ── Indicadores de eje Y ──────────────────────────────────────────────────────
const Y_TICKS = [0, 25, 50, 75, 100]

export function ScoreTrendChart({ snapshots, siteName }: ScoreTrendChartProps) {
  // Filtrar snapshots con score válido, ordenar por fecha ascendente
  const points = snapshots
    .filter((s): s is TrendSnapshot & { accessibility_score: number } =>
      s.accessibility_score !== null
    )
    .sort((a, b) => a.measured_at.localeCompare(b.measured_at))
    // Últimos 52 snapshots (un año de auditorías semanales)
    .slice(-52)

  if (points.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50 text-sm text-gray-400">
        Sin datos históricos disponibles.
      </div>
    )
  }

  // ── Coordenadas SVG ──────────────────────────────────────────────────────────
  const coords = points.map((p, i) => ({
    x: indexToX(i, points.length),
    y: scoreToY(p.accessibility_score),
    score: p.accessibility_score,
    date: p.measured_at,
  }))

  const polylinePoints = coords.map((c) => `${c.x},${c.y}`).join(' ')

  // ── Etiquetas del eje X ──────────────────────────────────────────────────────
  // Mostrar máximo 6 etiquetas para no amontonar el eje
  const xLabelStep = Math.max(1, Math.ceil(points.length / 6))
  const xLabels = coords.filter((_, i) =>
    i === 0 || i === coords.length - 1 || i % xLabelStep === 0
  )

  const latestScore = points[points.length - 1]!.accessibility_score

  return (
    <figure aria-label={`Evolución de accesibilidad de ${siteName}`}>
      <figcaption className="mb-2 flex items-baseline justify-between gap-4">
        <span className="text-sm font-medium text-gray-700">
          Tendencia histórica
        </span>
        <span className="text-xs text-gray-400">
          {points.length} auditoría{points.length !== 1 ? 's' : ''}
        </span>
      </figcaption>

      {/* ── Gráfica SVG ──────────────────────────────────────────────────────── */}
      <div
        className="overflow-x-auto rounded-xl border border-gray-100 bg-white shadow-sm"
        role="img"
        aria-label={`Gráfica de línea: evolución del score de accesibilidad de ${siteName} a lo largo del tiempo. Último valor: ${Math.round(latestScore)}/100.`}
      >
        <svg
          viewBox={`0 0 ${W} ${H}`}
          width="100%"
          height="auto"
          aria-hidden="true"
          focusable="false"
          className="block"
          style={{ minWidth: '320px' }}
        >
          {/* ── Grid Y ─────────────────────────────────────────────────────── */}
          {Y_TICKS.map((tick) => {
            const y = scoreToY(tick)
            return (
              <g key={tick}>
                <line
                  x1={PAD.left}
                  y1={y}
                  x2={PAD.left + PLOT_W}
                  y2={y}
                  stroke={tick === 0 ? '#9ca3af' : '#f3f4f6'}
                  strokeWidth={tick === 0 ? 1 : 1}
                />
                <text
                  x={PAD.left - 8}
                  y={y + 4}
                  textAnchor="end"
                  fontSize={10}
                  fill="#9ca3af"
                >
                  {tick}
                </text>
              </g>
            )
          })}

          {/* ── Línea de umbral OLAAC (95) ─────────────────────────────────── */}
          <line
            x1={PAD.left}
            y1={scoreToY(95)}
            x2={PAD.left + PLOT_W}
            y2={scoreToY(95)}
            stroke="#16a34a"
            strokeWidth={1}
            strokeDasharray="4 4"
            opacity={0.5}
          />
          <text
            x={PAD.left + PLOT_W + 2}
            y={scoreToY(95) + 4}
            fontSize={9}
            fill="#16a34a"
            opacity={0.7}
          >
            95
          </text>

          {/* ── Relleno bajo la línea ───────────────────────────────────────── */}
          <defs>
            <linearGradient id="trend-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.15} />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          {coords.length > 1 && (
            <polygon
              points={[
                `${coords[0]!.x},${scoreToY(0)}`,
                ...coords.map((c) => `${c.x},${c.y}`),
                `${coords[coords.length - 1]!.x},${scoreToY(0)}`,
              ].join(' ')}
              fill="url(#trend-fill)"
            />
          )}

          {/* ── Línea de tendencia ──────────────────────────────────────────── */}
          <polyline
            points={polylinePoints}
            fill="none"
            stroke="#3b82f6"
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {/* ── Puntos de datos ─────────────────────────────────────────────── */}
          {coords.map((c, i) => (
            <circle
              key={i}
              cx={c.x}
              cy={c.y}
              r={4}
              fill={scoreColor(c.score)}
              stroke="white"
              strokeWidth={1.5}
            />
          ))}

          {/* ── Etiquetas eje X ─────────────────────────────────────────────── */}
          {xLabels.map((c, i) => (
            <text
              key={i}
              x={c.x}
              y={H - 6}
              textAnchor="middle"
              fontSize={10}
              fill="#9ca3af"
            >
              {formatDateShort(c.date)}
            </text>
          ))}
        </svg>
      </div>

      {/* ── Tabla accesible (sr-only) para lectores de pantalla ──────────────── */}
      <table className="sr-only">
        <caption>
          Historial de scores de accesibilidad de {siteName}
        </caption>
        <thead>
          <tr>
            <th scope="col">Fecha de auditoría</th>
            <th scope="col">Score de accesibilidad (0–100)</th>
          </tr>
        </thead>
        <tbody>
          {points.map((p, i) => (
            <tr key={i}>
              <td>
                <time dateTime={p.measured_at}>{formatDateLong(p.measured_at)}</time>
              </td>
              <td>{Math.round(p.accessibility_score)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  )
}
