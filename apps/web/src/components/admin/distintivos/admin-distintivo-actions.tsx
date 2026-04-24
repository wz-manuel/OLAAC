'use client'

import { useState, useTransition } from 'react'
import { Button } from '@olaac/ui'

import {
  aprobarSolicitud,
  rechazarSolicitud,
  emitirDistintivo,
} from '@/lib/actions/distintivo'

interface Auditor {
  id: string
  nombre_completo: string
  estado: string
}

interface Ticket {
  id: string
  folio: string
  titulo: string
  estado: string
}

interface AdminDistintivoActionsProps {
  solicitudId: string
  estado: string
  nivelSolicitado: string
  auditores: Auditor[]
  tickets: Ticket[]
}

type BadgeNivel = 'oro' | 'platino' | 'diamante'

export function AdminDistintivoActions({
  solicitudId,
  estado,
  nivelSolicitado,
  auditores,
  tickets,
}: AdminDistintivoActionsProps) {
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)
  const [notasRechazo, setNotasRechazo] = useState('')
  const [showReject, setShowReject] = useState(false)
  const [showEmitir, setShowEmitir] = useState(false)
  const [nivelEmitir, setNivelEmitir] = useState<BadgeNivel>(nivelSolicitado as BadgeNivel)

  const [metricas, setMetricas] = useState({
    tareas_accesibles: 0, total_tareas: 0,
    flujos_accesibles: 0, total_flujos: 0,
    experiencias_accesibles: 0, total_experiencias: 0,
  })

  function handleAprobar() {
    startTransition(async () => {
      const res = await aprobarSolicitud(solicitudId)
      setMessage(res.error ? { type: 'err', text: res.error } : { type: 'ok', text: 'Solicitud aprobada. Se iniciaron las etapas del programa.' })
    })
  }

  function handleRechazar() {
    if (!notasRechazo.trim()) {
      setMessage({ type: 'err', text: 'Escribe el motivo del rechazo.' })
      return
    }
    startTransition(async () => {
      const res = await rechazarSolicitud(solicitudId, notasRechazo)
      setMessage(res.error ? { type: 'err', text: res.error } : { type: 'ok', text: 'Solicitud rechazada.' })
      setShowReject(false)
    })
  }

  function handleEmitir() {
    startTransition(async () => {
      const res = await emitirDistintivo(solicitudId, nivelEmitir, metricas)
      if (res.error) {
        setMessage({ type: 'err', text: res.error })
      } else {
        setMessage({ type: 'ok', text: `Distintivo emitido. Folio: ${res.folio}` })
        setShowEmitir(false)
      }
    })
  }

  const canAprobar  = ['enviada', 'en_revision'].includes(estado)
  const canRechazar = !['distintivo_emitido', 'rechazada', 'revocada'].includes(estado)
  const canEmitir   = ['en_programa', 'auditada', 'aprobada_para_programa'].includes(estado)

  return (
    <div className="space-y-5">
      {message && (
        <div
          role="alert"
          className={`rounded-lg border p-4 text-sm ${
            message.type === 'ok'
              ? 'border-green-200 bg-green-50 text-green-700'
              : 'border-red-200 bg-red-50 text-red-700'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        {canAprobar && (
          <Button onClick={handleAprobar} disabled={isPending}>
            {isPending ? 'Procesando…' : 'Aprobar e iniciar programa'}
          </Button>
        )}

        {canEmitir && (
          <Button
            variant="outline"
            onClick={() => setShowEmitir(v => !v)}
            disabled={isPending}
          >
            Emitir distintivo
          </Button>
        )}

        {canRechazar && (
          <Button
            variant="outline"
            onClick={() => setShowReject(v => !v)}
            disabled={isPending}
            className="text-red-600 hover:border-red-300 hover:bg-red-50"
          >
            Rechazar
          </Button>
        )}
      </div>

      {/* Panel rechazo */}
      {showReject && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 space-y-3">
          <label htmlFor="notas-rechazo" className="block text-sm font-medium text-red-700">
            Motivo del rechazo (visible para la organización)
          </label>
          <textarea
            id="notas-rechazo"
            rows={3}
            value={notasRechazo}
            onChange={e => setNotasRechazo(e.target.value)}
            className="w-full rounded-md border border-red-200 px-3 py-2 text-sm focus:border-red-400 focus:outline-none focus:ring-1 focus:ring-red-400"
            placeholder="Describe el motivo…"
          />
          <div className="flex gap-2">
            <Button onClick={handleRechazar} disabled={isPending} className="bg-red-600 hover:bg-red-700">
              Confirmar rechazo
            </Button>
            <Button variant="outline" onClick={() => setShowReject(false)}>Cancelar</Button>
          </div>
        </div>
      )}

      {/* Panel emisión */}
      {showEmitir && (
        <div className="rounded-lg border border-[#005fcc]/20 bg-blue-50 p-4 space-y-4">
          <h3 className="text-sm font-semibold text-gray-900">Datos para emitir el distintivo</h3>

          <div>
            <label htmlFor="nivel-emitir" className="block text-sm font-medium text-gray-700">
              Nivel a otorgar
            </label>
            <select
              id="nivel-emitir"
              value={nivelEmitir}
              onChange={e => setNivelEmitir(e.target.value as BadgeNivel)}
              className="mt-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#005fcc] focus:outline-none focus:ring-1 focus:ring-[#005fcc]"
            >
              <option value="oro">Oro</option>
              <option value="platino">Platino</option>
              <option value="diamante">Diamante</option>
            </select>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {([
              ['tareas_accesibles', 'total_tareas', 'Tareas accesibles / total'],
              ['flujos_accesibles', 'total_flujos', 'Flujos accesibles / total'],
              ['experiencias_accesibles', 'total_experiencias', 'Experiencias accesibles / total'],
            ] as const).map(([accField, totField, label]) => (
              <div key={accField} className="space-y-1">
                <p className="text-xs font-medium text-gray-600">{label}</p>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min={0}
                    value={metricas[accField]}
                    onChange={e => setMetricas(m => ({ ...m, [accField]: Number(e.target.value) }))}
                    aria-label={`${label} accesibles`}
                    className="w-16 rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-[#005fcc] focus:outline-none focus:ring-1 focus:ring-[#005fcc]"
                  />
                  <span className="self-center text-gray-400">/</span>
                  <input
                    type="number"
                    min={0}
                    value={metricas[totField]}
                    onChange={e => setMetricas(m => ({ ...m, [totField]: Number(e.target.value) }))}
                    aria-label={`${label} total`}
                    className="w-16 rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-[#005fcc] focus:outline-none focus:ring-1 focus:ring-[#005fcc]"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <Button onClick={handleEmitir} disabled={isPending}>
              {isPending ? 'Emitiendo…' : 'Emitir distintivo'}
            </Button>
            <Button variant="outline" onClick={() => setShowEmitir(false)}>Cancelar</Button>
          </div>
        </div>
      )}
    </div>
  )
}
