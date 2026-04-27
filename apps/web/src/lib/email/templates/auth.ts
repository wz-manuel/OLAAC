import { baseTemplate, bodyText, ctaButton, sectionHeading, textFooter } from '../base'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://olaac.org'

export function templateBienvenida(nombre: string): { subject: string; html: string; text: string } {
  const subject = `Bienvenido/a a OLAAC, ${nombre}`

  const html = baseTemplate(`
    ${sectionHeading(`¡Bienvenido/a, ${nombre}!`)}
    ${bodyText('Tu cuenta en el Observatorio Latinoamericano de Accesibilidad ha sido creada y verificada exitosamente.')}
    ${bodyText('Desde OLAAC puedes reportar barreras de accesibilidad, participar como auditor voluntario, acceder a formación especializada y obtener el Distintivo de Accesibilidad para tu organización.')}
    ${ctaButton('Explorar el observatorio', APP_URL)}
  `)

  const text = `¡Bienvenido/a, ${nombre}!

Tu cuenta en OLAAC ha sido creada y verificada.

Accede al observatorio en: ${APP_URL}
${textFooter}`

  return { subject, html, text }
}
