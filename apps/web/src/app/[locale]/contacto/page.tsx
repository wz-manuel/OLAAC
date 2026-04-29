import type { Metadata } from 'next'

import { ContactForm } from '@/components/contacto/contact-form'

export const metadata: Metadata = {
  title: 'Contacto — OLAAC',
  description: 'Contáctanos para reportar barreras de accesibilidad, hacer consultas sobre el Distintivo, la Academia o el programa de voluntarios.',
}

export default function ContactoPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">

      {/* Encabezado */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Contacta con el Observatorio</h1>
        <p className="mt-3 text-base text-gray-600 leading-relaxed">
          Queremos leerte. Usa este formulario para reportar barreras de accesibilidad, hacer consultas o enviarnos una propuesta. Recibirás un folio de seguimiento en tu correo.
        </p>
      </div>

      {/* Formulario */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <ContactForm />
      </div>

      {/* Otras vías de contacto */}
      <div className="mt-8 rounded-lg bg-gray-50 px-6 py-5 border border-gray-200">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Otras formas de contactarnos</h2>
        <ul className="space-y-2 text-sm text-gray-600">
          <li>
            <span className="font-medium text-gray-700">Correo general:</span>{' '}
            <a href="mailto:hola@olaac.org" className="text-brand-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005fcc] focus-visible:rounded">
              hola@olaac.org
            </a>
          </li>
          <li>
            <span className="font-medium text-gray-700">LinkedIn:</span>{' '}
            <a href="https://www.linkedin.com/company/olaac/" target="_blank" rel="noopener noreferrer" className="text-brand-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005fcc] focus-visible:rounded">
              linkedin.com/company/olaac
            </a>
          </li>
          <li>
            <span className="font-medium text-gray-700">X / Twitter:</span>{' '}
            <a href="https://x.com/a11yLatam" target="_blank" rel="noopener noreferrer" className="text-brand-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005fcc] focus-visible:rounded">
              @a11yLatam
            </a>
          </li>
        </ul>
      </div>

    </div>
  )
}
