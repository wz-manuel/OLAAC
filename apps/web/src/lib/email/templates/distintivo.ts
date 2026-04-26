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

export function templateRegresionDetectada(opts: {
  nombreContacto: string
  nombreOrganizacion: string
  folio: string
  nivel: string
  scoreActual: number
  scoreMinimo: number
  urlVerificada: string
}): { subject: string; html: string; text: string } {
  const subject = `Alerta: Score de accesibilidad bajo el umbral — ${opts.folio}`
  const nv = NIVEL_LABEL[opts.nivel] ?? opts.nivel

  const html = baseTemplate(`
    ${sectionHeading('Alerta de regresión en accesibilidad')}
    ${bodyText(`Hola ${opts.nombreContacto}, detectamos que el sitio de <strong>${opts.nombreOrganizacion}</strong> tiene un score de accesibilidad por debajo del umbral mínimo requerido para el Distintivo ${nv}.`)}
    ${highlightBox('Folio del Distintivo', opts.folio)}
    ${bodyText(`<strong>Score actual:</strong> ${opts.scoreActual.toFixed(1)}<br><strong>Score mínimo requerido:</strong> ${opts.scoreMinimo.toFixed(1)}<br><strong>URL verificada:</strong> ${opts.urlVerificada}`)}
    ${divider}
    ${bodyText('Si no se corrige antes de la próxima auditoría, el Distintivo podría ser suspendido. Te recomendamos revisar los criterios WCAG que están fallando y corregirlos.')}
    ${ctaButton('Ver scores en OLAAC', `${APP_URL}/scores`)}
    ${bodyText('Si tienes dudas, responde a este correo o contáctanos a través del formulario de contacto.')}
  `)

  const text = `Alerta de regresión — Distintivo ${opts.folio}

Organización: ${opts.nombreOrganizacion}
Score actual: ${opts.scoreActual.toFixed(1)}
Score mínimo requerido: ${opts.scoreMinimo.toFixed(1)}
URL verificada: ${opts.urlVerificada}

Ver scores: ${APP_URL}/scores`

  return { subject, html, text }
}

export function templateRenovacionProxima(opts: {
  nombreContacto: string
  nombreOrganizacion: string
  folio: string
  nivel: string
  diasRestantes: number
  fechaVencimiento: string
}): { subject: string; html: string; text: string } {
  const subject = `Tu Distintivo OLAAC vence en ${opts.diasRestantes} días — ${opts.folio}`
  const nv = NIVEL_LABEL[opts.nivel] ?? opts.nivel

  const html = baseTemplate(`
    ${sectionHeading(`Renovación de Distintivo ${nv}`)}
    ${bodyText(`Hola ${opts.nombreContacto}, el Distintivo de Accesibilidad OLAAC de <strong>${opts.nombreOrganizacion}</strong> vencerá en <strong>${opts.diasRestantes} días</strong> (${opts.fechaVencimiento}).`)}
    ${highlightBox('Folio del Distintivo', opts.folio)}
    ${bodyText('Para mantener el Distintivo vigente, solicita la renovación a través de tu panel de organización. El proceso de renovación incluye una nueva verificación del score de accesibilidad de tu sitio.')}
    ${ctaButton('Solicitar renovación', `${APP_URL}/distintivo/mi-organizacion`)}
    ${bodyText('Si tu sitio mantiene los estándares de accesibilidad requeridos, la renovación es expedita. Si necesitas apoyo, el equipo OLAAC está disponible para orientarte.')}
  `)

  const text = `Renovación de Distintivo — ${opts.folio}

Organización: ${opts.nombreOrganizacion}
Nivel: ${nv}
Vence en: ${opts.diasRestantes} días (${opts.fechaVencimiento})

Solicitar renovación: ${APP_URL}/distintivo/mi-organizacion`

  return { subject, html, text }
}
