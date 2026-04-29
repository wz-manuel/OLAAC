import { baseTemplate, bodyText, highlightBox, sectionHeading, textFooter } from '../base'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://olaac.org'

export function templateContactoRecibido(opts: {
  nombre: string
  folio: string
  asunto: string
  mensaje: string
}): { subject: string; html: string; text: string } {
  const subject = `Mensaje recibido: ${opts.folio} — OLAAC`

  const html = baseTemplate(`
    ${sectionHeading(`Hemos recibido tu mensaje, ${opts.nombre}`)}
    ${bodyText('Gracias por contactar al Observatorio Latinoamericano de Accesibilidad. Hemos registrado tu mensaje y le asignamos el siguiente folio de seguimiento:')}
    ${highlightBox('Folio de seguimiento', opts.folio)}
    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin:0 0 20px;">
      <tr>
        <td style="font-size:14px;color:#6b7280;font-family:Arial,sans-serif;padding:4px 0;">
          <strong style="color:#374151;">Asunto:</strong> ${opts.asunto}
        </td>
      </tr>
    </table>
    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin:0 0 20px;">
      <tr>
        <td bgcolor="#f9fafb" style="padding:16px 20px;border-radius:8px;border:1px solid #e5e7eb;">
          <p style="margin:0 0 6px;font-size:12px;color:#606bb8;font-family:Arial,sans-serif;text-transform:uppercase;letter-spacing:0.5px;">Tu mensaje</p>
          <p style="margin:0;font-size:14px;color:#374151;font-family:Arial,sans-serif;line-height:1.7;white-space:pre-wrap;">${opts.mensaje}</p>
        </td>
      </tr>
    </table>
    ${bodyText('Nuestro equipo revisará tu mensaje y te responderá al correo con el que escribiste. Guarda tu folio para cualquier consulta futura.')}
  `)

  const text = `Mensaje recibido — ${opts.folio}

Hola ${opts.nombre}, hemos recibido tu mensaje.

Folio de seguimiento: ${opts.folio}
Asunto: ${opts.asunto}

Tu mensaje:
${opts.mensaje}

Nuestro equipo revisará tu mensaje y te responderá a la brevedad.
Portal: ${APP_URL}
${textFooter}`

  return { subject, html, text }
}
