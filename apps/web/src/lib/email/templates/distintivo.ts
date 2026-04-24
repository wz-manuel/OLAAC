import { baseTemplate, bodyText, ctaButton, divider, highlightBox, sectionHeading } from '../base'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://olaac.org'

const NIVEL_LABEL: Record<string, string>  = { oro: 'Oro ✦', platino: 'Platino ✦✦', diamante: 'Diamante ✦✦✦' }
const ETAPA_LABEL: Record<string, string> = {
  concientizacion: 'Concientización',
  capacitacion:    'Capacitación',
  auditoria:       'Auditoría',
  remediacion:     'Remediación',
  design_ops:      'Design & Ops',
  politicas:       'Políticas internas',
  declaratoria:    'Declaratoria',
}

export function templateDistintivoSolicitado(opts: {
  nombreContacto: string
  nombreOrganizacion: string
  folio: string
  nivel: string
}): { subject: string; html: string; text: string } {
  const subject = `Solicitud de Distintivo recibida — ${opts.folio}`

  const html = baseTemplate(`
    ${sectionHeading('Solicitud de Distintivo recibida')}
    ${bodyText(`Hola ${opts.nombreContacto}, recibimos la solicitud de <strong>${opts.nombreOrganizacion}</strong> para obtener el Distintivo de Accesibilidad OLAAC.`)}
    ${highlightBox('Folio', opts.folio)}
    ${bodyText(`<strong>Nivel solicitado:</strong> ${NIVEL_LABEL[opts.nivel] ?? opts.nivel}`)}
    ${bodyText('Nuestro equipo revisará tu solicitud e iniciará el proceso de evaluación. Te mantendremos informado/a en cada etapa del programa.')}
    ${ctaButton('Ver estado de mi solicitud', `${APP_URL}/distintivo/mi-organizacion`)}
  `)

  const text = `Solicitud de Distintivo recibida

Folio: ${opts.folio}
Organización: ${opts.nombreOrganizacion}
Nivel: ${opts.nivel}

Ver estado: ${APP_URL}/distintivo/mi-organizacion`

  return { subject, html, text }
}

export function templateDistintivoEtapaCompletada(opts: {
  nombreContacto: string
  nombreOrganizacion: string
  folio: string
  etapaCompletada: string
  siguienteEtapa?: string
}): { subject: string; html: string; text: string } {
  const etapa = ETAPA_LABEL[opts.etapaCompletada] ?? opts.etapaCompletada
  const siguiente = opts.siguienteEtapa ? ETAPA_LABEL[opts.siguienteEtapa] ?? opts.siguienteEtapa : null
  const subject = `Etapa completada: ${etapa} — ${opts.folio}`

  const html = baseTemplate(`
    ${sectionHeading(`Etapa completada: ${etapa}`)}
    ${bodyText(`Hola ${opts.nombreContacto}, <strong>${opts.nombreOrganizacion}</strong> ha completado la etapa de <strong>${etapa}</strong> del programa Distintivo OLAAC.`)}
    ${highlightBox('Folio', opts.folio)}
    ${siguiente ? `<table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin:16px 0;"><tr><td bgcolor="#ecf9fe" style="padding:14px 18px;border-radius:6px;border-left:4px solid #30BCEE;"><p style="margin:0;font-size:14px;color:#065675;font-family:Arial,sans-serif;"><strong>Siguiente etapa:</strong> ${siguiente}</p></td></tr></table>` : ''}
    ${ctaButton('Ver progreso', `${APP_URL}/distintivo/mi-organizacion`)}
  `)

  const text = `Etapa completada: ${etapa}

Folio: ${opts.folio}
Organización: ${opts.nombreOrganizacion}
${siguiente ? `Siguiente etapa: ${siguiente}` : '¡Programa completado!'}

Ver progreso: ${APP_URL}/distintivo/mi-organizacion`

  return { subject, html, text }
}

export function templateDistintivoEmitido(opts: {
  nombreContacto: string
  nombreOrganizacion: string
  folio: string
  nivel: string
  badgeUrl: string
  vigenciaAnios: number
}): { subject: string; html: string; text: string } {
  const nivelLabel = NIVEL_LABEL[opts.nivel] ?? opts.nivel
  const subject = `🎖 Distintivo ${nivelLabel} emitido para ${opts.nombreOrganizacion}`

  const html = baseTemplate(`
    ${sectionHeading(`¡Distintivo ${nivelLabel} emitido!`)}
    ${bodyText(`Hola ${opts.nombreContacto}, nos complace comunicarte que <strong>${opts.nombreOrganizacion}</strong> ha obtenido oficialmente el Distintivo de Accesibilidad OLAAC nivel <strong>${nivelLabel}</strong>.`)}
    ${highlightBox('Folio del distintivo', opts.badgeUrl.split('/').pop() ?? opts.folio)}
    ${bodyText(`El distintivo tiene una vigencia de <strong>${opts.vigenciaAnios} año${opts.vigenciaAnios > 1 ? 's' : ''}</strong>. Pasado este período, deberás renovarlo mediante una nueva auditoría.`)}
    ${bodyText('Puedes descargar el badge para usar en tu sitio web y materiales de comunicación.')}
    ${divider}
    ${ctaButton('Descargar mi Distintivo', `${APP_URL}/distintivo/verificar/${opts.folio}`)}
  `)

  const text = `¡Distintivo ${nivelLabel} emitido!

Organización: ${opts.nombreOrganizacion}
Folio: ${opts.folio}
Vigencia: ${opts.vigenciaAnios} año(s)

Descargar: ${APP_URL}/distintivo/verificar/${opts.folio}`

  return { subject, html, text }
}

export function templateDistintivoRechazado(opts: {
  nombreContacto: string
  nombreOrganizacion: string
  folio: string
  motivo?: string
}): { subject: string; html: string; text: string } {
  const subject = `Actualización del Distintivo ${opts.folio}`

  const html = baseTemplate(`
    ${sectionHeading('Actualización de tu solicitud')}
    ${bodyText(`Hola ${opts.nombreContacto}, hemos completado la evaluación de <strong>${opts.nombreOrganizacion}</strong> para el Distintivo de Accesibilidad OLAAC.`)}
    ${highlightBox('Folio', opts.folio)}
    ${bodyText('En esta evaluación no fue posible emitir el distintivo en el nivel solicitado. Te invitamos a revisar los hallazgos y continuar trabajando en la accesibilidad de tu organización.')}
    ${opts.motivo ? `<table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin:0 0 16px;"><tr><td bgcolor="#f9fafb" style="padding:14px 18px;border-radius:6px;border:1px solid #e5e7eb;"><p style="margin:0;font-size:14px;color:#374151;font-family:Arial,sans-serif;"><strong>Observaciones:</strong> ${opts.motivo}</p></td></tr></table>` : ''}
    ${bodyText('Puedes solicitar un nuevo proceso una vez realizadas las mejoras necesarias.')}
    ${ctaButton('Reportar mejoras con un ticket', `${APP_URL}/tickets/nuevo`)}
  `)

  const text = `Actualización del Distintivo ${opts.folio}

Organización: ${opts.nombreOrganizacion}
${opts.motivo ? `Observaciones: ${opts.motivo}` : ''}

Nueva solicitud: ${APP_URL}/distintivo/mi-organizacion`

  return { subject, html, text }
}
