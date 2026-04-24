import { baseTemplate, bodyText, ctaButton, divider, highlightBox, sectionHeading } from '../base'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://olaac.org'

export function templateVoluntarioRecibido(opts: {
  nombre: string
}): { subject: string; html: string; text: string } {
  const subject = 'Tu solicitud como auditor voluntario fue recibida'

  const html = baseTemplate(`
    ${sectionHeading('Solicitud recibida')}
    ${bodyText(`Hola ${opts.nombre}, recibimos tu solicitud para unirte al programa de auditores voluntarios del OLAAC.`)}
    ${bodyText('Nuestro equipo revisará tu perfil y te notificaremos en los próximos días hábiles con la resolución.')}
    ${divider}
    ${bodyText('Mientras tanto, te recomendamos tomar los cursos de nuestra Academia para prepararte para las auditorías.')}
    ${ctaButton('Explorar la Academia', `${APP_URL.replace('3000', '3001') || 'https://academia.olaac.org'}`)}
  `)

  const text = `Solicitud de auditor voluntario recibida

Hola ${opts.nombre}, recibimos tu solicitud para el programa de auditores voluntarios.
Te notificaremos cuando sea revisada.

Academia OLAAC: ${APP_URL}`

  return { subject, html, text }
}

export function templateVoluntarioAprobado(opts: {
  nombre: string
}): { subject: string; html: string; text: string } {
  const subject = '¡Bienvenido/a al equipo de auditores OLAAC!'

  const html = baseTemplate(`
    ${sectionHeading('¡Solicitud aprobada!')}
    ${bodyText(`Hola ${opts.nombre}, nos alegra comunicarte que tu solicitud para unirte como auditor voluntario del OLAAC ha sido <strong>aprobada</strong>.`)}
    ${bodyText('Tu perfil ha sido creado en el sistema. El siguiente paso es completar la ruta de formación obligatoria en nuestra Academia para obtener tu certificación como auditor.')}
    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin:16px 0;">
      <tr>
        <td bgcolor="#ecf9fe" style="padding:16px 20px;border-radius:8px;border-left:4px solid #30BCEE;">
          <p style="margin:0;font-size:14px;color:#065675;font-family:Arial,sans-serif;line-height:1.6;">
            <strong>Próximo paso:</strong> Completa los cursos de la ruta de formación en la Academia OLAAC para obtener tu certificación como auditor.
          </p>
        </td>
      </tr>
    </table>
    ${ctaButton('Ir a mi panel de voluntario', `${APP_URL}/voluntarios/mi-panel`)}
  `)

  const text = `¡Solicitud aprobada!

Hola ${opts.nombre}, tu solicitud como auditor voluntario OLAAC fue aprobada.
Completa la ruta de formación para obtener tu certificación.

Panel de voluntario: ${APP_URL}/voluntarios/mi-panel`

  return { subject, html, text }
}

export function templateVoluntarioRechazado(opts: {
  nombre: string
  motivo?: string
}): { subject: string; html: string; text: string } {
  const subject = 'Actualización sobre tu solicitud de voluntariado'

  const html = baseTemplate(`
    ${sectionHeading('Actualización de tu solicitud')}
    ${bodyText(`Hola ${opts.nombre}, revisamos tu solicitud para el programa de auditores voluntarios del OLAAC.`)}
    ${bodyText('En esta ocasión no pudimos continuar con tu incorporación. Agradecemos tu interés y compromiso con la accesibilidad digital.')}
    ${opts.motivo ? `<table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin:0 0 16px;"><tr><td bgcolor="#f9fafb" style="padding:14px 18px;border-radius:6px;border:1px solid #e5e7eb;"><p style="margin:0;font-size:14px;color:#374151;font-family:Arial,sans-serif;"><strong>Comentario:</strong> ${opts.motivo}</p></td></tr></table>` : ''}
    ${bodyText('Puedes seguir contribuyendo reportando barreras de accesibilidad a través del sistema de tickets.')}
    ${ctaButton('Reportar una barrera', `${APP_URL}/tickets/nuevo`)}
  `)

  const text = `Actualización de tu solicitud de voluntariado

Hola ${opts.nombre}, en esta ocasión no pudimos continuar con tu incorporación al programa.
${opts.motivo ? `Comentario: ${opts.motivo}` : ''}

Puedes seguir contribuyendo en: ${APP_URL}/tickets/nuevo`

  return { subject, html, text }
}

export function templateAuditorCertificado(opts: {
  nombre: string
}): { subject: string; html: string; text: string } {
  const subject = '¡Felicitaciones! Eres auditor certificado OLAAC'

  const html = baseTemplate(`
    ${sectionHeading('¡Certificación obtenida!')}
    ${bodyText(`Hola ${opts.nombre}, completaste exitosamente la ruta de formación del OLAAC. A partir de hoy eres <strong>auditor certificado</strong> del Observatorio Latinoamericano de Accesibilidad.`)}
    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin:16px 0 24px;">
      <tr>
        <td align="center" bgcolor="#252858" style="padding:24px;border-radius:10px;">
          <p style="margin:0;font-size:32px;color:#30BCEE;font-family:Arial,sans-serif;">◎</p>
          <p style="margin:8px 0 0;font-size:13px;color:#C9EAF2;font-family:Arial,sans-serif;text-transform:uppercase;letter-spacing:1px;">Auditor Certificado</p>
          <p style="margin:4px 0 0;font-size:18px;font-weight:bold;color:#ffffff;font-family:Arial,sans-serif;">${opts.nombre}</p>
        </td>
      </tr>
    </table>
    ${bodyText('Ya puedes recibir y realizar auditorías de accesibilidad para organizaciones que soliciten el Distintivo OLAAC.')}
    ${ctaButton('Ver mi panel', `${APP_URL}/voluntarios/mi-panel`)}
  `)

  const text = `¡Certificación obtenida!

Hola ${opts.nombre}, completaste la ruta de formación OLAAC.
Eres auditor certificado del Observatorio Latinoamericano de Accesibilidad.

Panel de auditor: ${APP_URL}/voluntarios/mi-panel`

  return { subject, html, text }
}
