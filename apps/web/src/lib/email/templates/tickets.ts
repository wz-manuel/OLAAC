import { baseTemplate, bodyText, ctaButton, highlightBox, sectionHeading } from '../base'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://olaac.org'

export function templateTicketCreado(opts: {
  nombre: string
  folio: string
  titulo: string
  categoria: string
  prioridad: string
}): { subject: string; html: string; text: string } {
  const subject = `Ticket recibido: ${opts.folio}`

  const html = baseTemplate(`
    ${sectionHeading('Ticket registrado')}
    ${bodyText(`Hola ${opts.nombre}, hemos recibido tu reporte de accesibilidad. Nuestro equipo lo revisará a la brevedad.`)}
    ${highlightBox('Folio', opts.folio)}
    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin:0 0 16px;">
      <tr>
        <td style="font-size:14px;color:#6b7280;font-family:Arial,sans-serif;padding:4px 0;"><strong style="color:#374151;">Título:</strong> ${opts.titulo}</td>
      </tr>
      <tr>
        <td style="font-size:14px;color:#6b7280;font-family:Arial,sans-serif;padding:4px 0;"><strong style="color:#374151;">Categoría:</strong> ${opts.categoria}</td>
      </tr>
      <tr>
        <td style="font-size:14px;color:#6b7280;font-family:Arial,sans-serif;padding:4px 0;"><strong style="color:#374151;">Prioridad:</strong> ${opts.prioridad}</td>
      </tr>
    </table>
    ${bodyText('Puedes dar seguimiento a tu ticket en cualquier momento desde el portal.')}
    ${ctaButton('Ver mi ticket', `${APP_URL}/tickets/mis-reportes`)}
  `)

  const text = `Ticket registrado — ${opts.folio}

Hola ${opts.nombre}, recibimos tu reporte de accesibilidad.

Folio: ${opts.folio}
Título: ${opts.titulo}
Categoría: ${opts.categoria}
Prioridad: ${opts.prioridad}

Seguimiento: ${APP_URL}/tickets/mis-reportes`

  return { subject, html, text }
}

export function templateTicketEstadoCambio(opts: {
  nombre: string
  folio: string
  titulo: string
  estadoAnterior: string
  estadoNuevo: string
  notas?: string
}): { subject: string; html: string; text: string } {
  const ESTADO_LABEL: Record<string, string> = {
    abierto:      'Abierto',
    en_revision:  'En revisión',
    en_progreso:  'En progreso',
    resuelto:     'Resuelto',
    cerrado:      'Cerrado',
  }

  const nuevoLabel = ESTADO_LABEL[opts.estadoNuevo] ?? opts.estadoNuevo
  const subject = `Tu ticket ${opts.folio} cambió a: ${nuevoLabel}`

  const html = baseTemplate(`
    ${sectionHeading(`Estado actualizado: ${nuevoLabel}`)}
    ${bodyText(`Hola ${opts.nombre}, el estado de tu reporte ha sido actualizado.`)}
    ${highlightBox('Folio', opts.folio)}
    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin:0 0 20px;">
      <tr>
        <td align="center" style="padding:12px;background:#f3f4f6;border-radius:6px;">
          <span style="font-size:14px;color:#6b7280;font-family:Arial,sans-serif;">${ESTADO_LABEL[opts.estadoAnterior] ?? opts.estadoAnterior}</span>
          <span style="font-size:18px;color:#30BCEE;margin:0 12px;font-weight:bold;">→</span>
          <span style="font-size:14px;font-weight:bold;color:#252858;font-family:Arial,sans-serif;">${nuevoLabel}</span>
        </td>
      </tr>
    </table>
    ${opts.notas ? bodyText(`<em>Nota del equipo:</em> ${opts.notas}`) : ''}
    ${ctaButton('Ver ticket', `${APP_URL}/tickets/mis-reportes`)}
  `)

  const text = `Ticket ${opts.folio} — Estado actualizado

Hola ${opts.nombre}, el estado de tu reporte cambió de "${opts.estadoAnterior}" a "${nuevoLabel}".
${opts.notas ? `\nNota: ${opts.notas}` : ''}

Ver ticket: ${APP_URL}/tickets/mis-reportes`

  return { subject, html, text }
}

export function templateTicketAsignadoAdmin(opts: {
  nombreAdmin: string
  folio: string
  titulo: string
  prioridad: string
}): { subject: string; html: string; text: string } {
  const subject = `[Admin] Ticket asignado: ${opts.folio}`

  const html = baseTemplate(`
    ${sectionHeading('Ticket asignado a ti')}
    ${bodyText(`Hola ${opts.nombreAdmin}, se te ha asignado el siguiente ticket para revisión.`)}
    ${highlightBox('Folio', opts.folio)}
    ${bodyText(`<strong>Título:</strong> ${opts.titulo}<br><strong>Prioridad:</strong> ${opts.prioridad}`)}
    ${ctaButton('Gestionar ticket', `${APP_URL}/admin/tickets`)}
  `)

  const text = `Ticket asignado: ${opts.folio}

Hola ${opts.nombreAdmin}, se te asignó el ticket ${opts.folio}.
Título: ${opts.titulo}
Prioridad: ${opts.prioridad}

Gestionar: ${APP_URL}/admin/tickets`

  return { subject, html, text }
}
