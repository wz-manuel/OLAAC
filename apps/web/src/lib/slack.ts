// Sends structured messages to a Slack Incoming Webhook URL.
// Set SLACK_WEBHOOK_URL in env to enable; if absent, calls are silently skipped.

export type SlackColor = 'good' | 'warning' | 'danger' | string

export interface SlackAttachment {
  fallback: string
  color?: SlackColor
  title?: string
  title_link?: string
  text?: string
  fields?: Array<{ title: string; value: string; short?: boolean }>
  footer?: string
  ts?: number
}

export interface SlackMessage {
  text?: string
  username?: string
  icon_emoji?: string
  attachments?: SlackAttachment[]
}

export async function sendSlackMessage(message: SlackMessage): Promise<void> {
  const url = process.env.SLACK_WEBHOOK_URL
  if (!url) return

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'OLAAC Bot', icon_emoji: ':shield:', ...message }),
  })

  if (!res.ok) {
    console.error('[slack] webhook failed', res.status, await res.text())
  }
}

// ── Mensajes de dominio ──────────────────────────────────────────────────────

export function slackRegresionDetectada(opts: {
  folio: string
  organizacion: string
  nivel: string
  scoreActual: number
  scoreMinimo: number
  url: string
}): SlackMessage {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://olaac.org'
  return {
    text: `⚠️ *Regresión de accesibilidad detectada*`,
    attachments: [
      {
        fallback: `Regresión en ${opts.organizacion} (${opts.folio})`,
        color: 'danger',
        title: `${opts.organizacion} — ${opts.folio}`,
        title_link: `${appUrl}/admin/distintivos`,
        fields: [
          { title: 'Nivel', value: opts.nivel, short: true },
          { title: 'Score actual', value: `${opts.scoreActual}%`, short: true },
          { title: 'Score mínimo', value: `${opts.scoreMinimo}%`, short: true },
          { title: 'URL verificada', value: opts.url, short: false },
        ],
        footer: 'OLAAC · Cron check-badges',
        ts: Math.floor(Date.now() / 1000),
      },
    ],
  }
}

export function slackDistintivoEmitido(opts: {
  folio: string
  organizacion: string
  nivel: string
}): SlackMessage {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://olaac.org'
  return {
    text: `✅ *Distintivo emitido*`,
    attachments: [
      {
        fallback: `Distintivo emitido a ${opts.organizacion} (${opts.folio})`,
        color: 'good',
        title: `${opts.organizacion} — ${opts.folio}`,
        title_link: `${appUrl}/distintivo/verificar/${opts.folio}`,
        fields: [
          { title: 'Nivel', value: opts.nivel, short: true },
        ],
        footer: 'OLAAC · Distintivo de Accesibilidad',
        ts: Math.floor(Date.now() / 1000),
      },
    ],
  }
}

export function slackDistintivoRevocado(opts: {
  folio: string
  organizacion: string
  motivo?: string
}): SlackMessage {
  return {
    text: `🚫 *Distintivo revocado*`,
    attachments: [
      {
        fallback: `Distintivo revocado: ${opts.organizacion} (${opts.folio})`,
        color: 'warning',
        title: `${opts.organizacion} — ${opts.folio}`,
        fields: [
          ...(opts.motivo ? [{ title: 'Motivo', value: opts.motivo, short: false }] : []),
        ],
        footer: 'OLAAC · Distintivo de Accesibilidad',
        ts: Math.floor(Date.now() / 1000),
      },
    ],
  }
}

export function slackSolicitudRecibida(opts: {
  folio: string
  organizacion: string
  nivel: string
  pais: string
}): SlackMessage {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://olaac.org'
  return {
    text: `📬 *Nueva solicitud de distintivo*`,
    attachments: [
      {
        fallback: `Nueva solicitud de ${opts.organizacion} (${opts.folio})`,
        color: '#005fcc',
        title: `${opts.organizacion} — ${opts.folio}`,
        title_link: `${appUrl}/admin/distintivos`,
        fields: [
          { title: 'Nivel solicitado', value: opts.nivel, short: true },
          { title: 'País', value: opts.pais, short: true },
        ],
        footer: 'OLAAC · Distintivo de Accesibilidad',
        ts: Math.floor(Date.now() / 1000),
      },
    ],
  }
}
