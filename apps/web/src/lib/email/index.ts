import { sendEmail } from './ses'
import { templateCertificadoEmitido } from './templates/academia'
import { templateBienvenida } from './templates/auth'
import {
  templateDistintivoEmitido,
  templateDistintivoEtapaCompletada,
  templateDistintivoRechazado,
  templateDistintivoSolicitado,
  templateRegresionDetectada,
  templateRenovacionProxima,
} from './templates/distintivo'
import {
  templateTicketAsignadoAdmin,
  templateTicketCreado,
  templateTicketEstadoCambio,
} from './templates/tickets'
import {
  templateAuditorCertificado,
  templateVoluntarioAprobado,
  templateVoluntarioRechazado,
  templateVoluntarioRecibido,
} from './templates/voluntarios'

// ── Auth ──────────────────────────────────────────────────────────────────────

export async function notifyBienvenida(opts: { to: string; nombre: string; userId?: string }) {
  const t = templateBienvenida(opts.nombre)
  await sendEmail({ to: opts.to, ...t, type: 'bienvenida', userId: opts.userId })
}

// ── Tickets ───────────────────────────────────────────────────────────────────

export async function notifyTicketCreado(opts: {
  to: string; userId?: string
  nombre: string; folio: string; titulo: string; categoria: string; prioridad: string
}) {
  const t = templateTicketCreado(opts)
  await sendEmail({ to: opts.to, ...t, type: 'ticket_creado', userId: opts.userId, metadata: { folio: opts.folio } })
}

export async function notifyTicketEstadoCambio(opts: {
  to: string; userId?: string
  nombre: string; folio: string; titulo: string; estadoAnterior: string; estadoNuevo: string; notas?: string
}) {
  const t = templateTicketEstadoCambio(opts)
  await sendEmail({ to: opts.to, ...t, type: 'ticket_estado', userId: opts.userId, metadata: { folio: opts.folio, estado: opts.estadoNuevo } })
}

export async function notifyTicketAsignadoAdmin(opts: {
  to: string; userId?: string
  nombreAdmin: string; folio: string; titulo: string; prioridad: string
}) {
  const t = templateTicketAsignadoAdmin(opts)
  await sendEmail({ to: opts.to, ...t, type: 'ticket_asignado_admin', userId: opts.userId, metadata: { folio: opts.folio } })
}

// ── Voluntarios ───────────────────────────────────────────────────────────────

export async function notifyVoluntarioRecibido(opts: { to: string; userId?: string; nombre: string }) {
  const t = templateVoluntarioRecibido(opts)
  await sendEmail({ to: opts.to, ...t, type: 'voluntario_recibido', userId: opts.userId })
}

export async function notifyVoluntarioAprobado(opts: { to: string; userId?: string; nombre: string }) {
  const t = templateVoluntarioAprobado(opts)
  await sendEmail({ to: opts.to, ...t, type: 'voluntario_aprobado', userId: opts.userId })
}

export async function notifyVoluntarioRechazado(opts: { to: string; userId?: string; nombre: string; motivo?: string }) {
  const t = templateVoluntarioRechazado(opts)
  await sendEmail({ to: opts.to, ...t, type: 'voluntario_rechazado', userId: opts.userId })
}

export async function notifyAuditorCertificado(opts: { to: string; userId?: string; nombre: string }) {
  const t = templateAuditorCertificado(opts)
  await sendEmail({ to: opts.to, ...t, type: 'auditor_certificado', userId: opts.userId })
}

// ── Distintivo ────────────────────────────────────────────────────────────────

export async function notifyDistintivoSolicitado(opts: {
  to: string; userId?: string
  nombreContacto: string; nombreOrganizacion: string; folio: string; nivel: string
}) {
  const t = templateDistintivoSolicitado(opts)
  await sendEmail({ to: opts.to, ...t, type: 'distintivo_solicitado', userId: opts.userId, metadata: { folio: opts.folio } })
}

export async function notifyDistintivoEtapa(opts: {
  to: string; userId?: string
  nombreContacto: string; nombreOrganizacion: string; folio: string; etapaCompletada: string; siguienteEtapa?: string
}) {
  const t = templateDistintivoEtapaCompletada(opts)
  await sendEmail({ to: opts.to, ...t, type: 'distintivo_etapa', userId: opts.userId, metadata: { folio: opts.folio, etapa: opts.etapaCompletada } })
}

export async function notifyDistintivoEmitido(opts: {
  to: string; userId?: string
  nombreContacto: string; nombreOrganizacion: string; folio: string; nivel: string; badgeUrl: string; vigenciaAnios: number
}) {
  const t = templateDistintivoEmitido(opts)
  await sendEmail({ to: opts.to, ...t, type: 'distintivo_emitido', userId: opts.userId, metadata: { folio: opts.folio } })
}

export async function notifyDistintivoRechazado(opts: {
  to: string; userId?: string
  nombreContacto: string; nombreOrganizacion: string; folio: string; motivo?: string
}) {
  const t = templateDistintivoRechazado(opts)
  await sendEmail({ to: opts.to, ...t, type: 'distintivo_rechazado', userId: opts.userId, metadata: { folio: opts.folio } })
}

export async function notifyRegresionDetectada(opts: {
  to: string
  nombreContacto: string; nombreOrganizacion: string; folio: string; nivel: string
  scoreActual: number; scoreMinimo: number; urlVerificada: string
}) {
  const t = templateRegresionDetectada(opts)
  await sendEmail({ to: opts.to, ...t, type: 'distintivo_regresion', metadata: { folio: opts.folio } })
}

export async function notifyRenovacionProxima(opts: {
  to: string
  nombreContacto: string; nombreOrganizacion: string; folio: string; nivel: string
  diasRestantes: number; fechaVencimiento: string
}) {
  const t = templateRenovacionProxima(opts)
  await sendEmail({ to: opts.to, ...t, type: 'distintivo_renovacion', metadata: { folio: opts.folio } })
}

// ── Academia ──────────────────────────────────────────────────────────────────

export async function notifyCertificadoAcademia(opts: {
  to: string; userId?: string
  nombre: string; tituloCurso: string; folio: string
}) {
  const t = templateCertificadoEmitido(opts)
  await sendEmail({ to: opts.to, ...t, type: 'certificado_academia', userId: opts.userId, metadata: { folio: opts.folio } })
}
