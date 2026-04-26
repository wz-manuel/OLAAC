'use client'

import { Button } from '@olaac/ui'
import { useState, useActionState } from 'react'

import { enviarSolicitud, type SolicitudState } from '@/lib/actions/distintivo'

import { BadgeLevelCard } from './badge-level-card'

type BadgeNivel = 'oro' | 'platino' | 'diamante'

interface Criterio {
  nivel: BadgeNivel
  min_tareas_accesibles: number
  min_flujos_accesibles: number
  min_experiencias_accesibles: number
  min_porcentaje_accesibilidad: number
  descripcion: string | null
  beneficios: string[]
}

interface SolicitudNivelFormProps {
  criterios: Criterio[]
  orgNombre: string
}

const INITIAL: SolicitudState = { error: null }

export function SolicitudNivelForm({ criterios, orgNombre }: SolicitudNivelFormProps) {
  const [nivelSeleccionado, setNivel] = useState<BadgeNivel | null>(null)
  const [state, action, pending] = useActionState(enviarSolicitud, INITIAL)

  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-600">
        Selecciona el nivel al que aspira <strong>{orgNombre}</strong>. Puedes comenzar por el nivel
        Oro e ir ascendiendo en solicitudes futuras.
      </p>

      {state.error && (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {state.error}
        </div>
      )}

      <div className="grid gap-4">
        {criterios.map(c => (
          <BadgeLevelCard
            key={c.nivel}
            criterio={c}
            selected={nivelSeleccionado === c.nivel}
            onSelect={setNivel}
            interactive
          />
        ))}
      </div>

      {nivelSeleccionado && (
        <form action={action}>
          <input type="hidden" name="nivel_solicitado" value={nivelSeleccionado} />
          <div className="rounded-lg border border-[#005fcc]/20 bg-[#005fcc]/5 p-4">
            <p className="mb-3 text-sm text-gray-700">
              Solicitarás el{' '}
              <strong>
                Distintivo Nivel{' '}
                {{ oro: 'Oro', platino: 'Platino', diamante: 'Diamante' }[nivelSeleccionado]}
              </strong>{' '}
              para <strong>{orgNombre}</strong>. El equipo OLAAC revisará tu solicitud y te
              contactará para iniciar el programa.
            </p>
            <Button type="submit" disabled={pending}>
              {pending ? 'Enviando solicitud…' : 'Confirmar y enviar solicitud'}
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}
