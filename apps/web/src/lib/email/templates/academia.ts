import { baseTemplate, bodyText, ctaButton, highlightBox, sectionHeading } from '../base'

const ACADEMY_URL = process.env.NEXT_PUBLIC_ACADEMY_URL ?? 'https://academia.olaac.org'

export function templateCertificadoEmitido(opts: {
  nombre: string
  tituloCurso: string
  folio: string
}): { subject: string; html: string; text: string } {
  const subject = `Tu certificado OLAAC está listo — ${opts.tituloCurso}`

  const html = baseTemplate(`
    ${sectionHeading('¡Certificado emitido!')}
    ${bodyText(`Hola ${opts.nombre}, completaste el curso <strong>${opts.tituloCurso}</strong> de la Academia OLAAC. Tu certificado ya está disponible para descarga.`)}
    ${highlightBox('Folio del certificado', opts.folio)}
    ${bodyText('Este certificado es verificable públicamente mediante el folio. Puedes compartirlo en tu perfil profesional, CV o LinkedIn.')}
    ${ctaButton('Descargar certificado', `${ACADEMY_URL}/certificados/${opts.folio}`)}
  `)

  const text = `¡Certificado emitido!

Curso: ${opts.tituloCurso}
Folio: ${opts.folio}

Descargar: ${ACADEMY_URL}/certificados/${opts.folio}`

  return { subject, html, text }
}

export function templateRolEstudianteAsignado(opts: {
  nombre: string
  tituloCurso: string
}): { subject: string; html: string; text: string } {
  const subject = `Inscripción confirmada: ${opts.tituloCurso}`

  const html = baseTemplate(`
    ${sectionHeading('Inscripción confirmada')}
    ${bodyText(`Hola ${opts.nombre}, tu inscripción al curso <strong>${opts.tituloCurso}</strong> de la Academia OLAAC ha sido confirmada.`)}
    ${bodyText('Puedes comenzar las lecciones cuando quieras, a tu propio ritmo. Al completar todas las lecciones recibirás un certificado verificable.')}
    ${ctaButton('Comenzar el curso', `${ACADEMY_URL}/cursos`)}
  `)

  const text = `Inscripción confirmada: ${opts.tituloCurso}

Hola ${opts.nombre}, estás inscrito/a en ${opts.tituloCurso}.

Comenzar: ${ACADEMY_URL}/cursos`

  return { subject, html, text }
}
