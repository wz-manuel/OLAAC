export type WcagNivel = 'A' | 'AA'
export type WcagPrincipio = 'Perceptible' | 'Operable' | 'Comprensible' | 'Robusto'
export type WcagResultado = 'cumple' | 'no_cumple' | 'no_aplica' | 'no_evaluado'

export interface WcagCriterio {
  codigo: string
  nivel: WcagNivel
  principio: WcagPrincipio
  directriz: string
  nombre: string
  es_21: boolean
}

export interface WcagResultadoEntry {
  resultado: WcagResultado
  notas: string
}

export const WCAG_CRITERIOS: WcagCriterio[] = [
  // ── Perceptible ─────────────────────────────────────────────────────────────
  { codigo: '1.1.1',  nivel: 'A',  principio: 'Perceptible', directriz: 'Alternativas textuales',   nombre: 'Contenido no textual',                                    es_21: false },
  { codigo: '1.2.1',  nivel: 'A',  principio: 'Perceptible', directriz: 'Medios tempodependientes', nombre: 'Solo audio y solo vídeo (pregrabado)',                     es_21: false },
  { codigo: '1.2.2',  nivel: 'A',  principio: 'Perceptible', directriz: 'Medios tempodependientes', nombre: 'Subtítulos (pregrabado)',                                  es_21: false },
  { codigo: '1.2.3',  nivel: 'A',  principio: 'Perceptible', directriz: 'Medios tempodependientes', nombre: 'Audiodescripción o medio alternativo (pregrabado)',        es_21: false },
  { codigo: '1.2.4',  nivel: 'AA', principio: 'Perceptible', directriz: 'Medios tempodependientes', nombre: 'Subtítulos (en directo)',                                  es_21: false },
  { codigo: '1.2.5',  nivel: 'AA', principio: 'Perceptible', directriz: 'Medios tempodependientes', nombre: 'Audiodescripción (pregrabado)',                            es_21: false },
  { codigo: '1.3.1',  nivel: 'A',  principio: 'Perceptible', directriz: 'Adaptable',                nombre: 'Información y relaciones',                                es_21: false },
  { codigo: '1.3.2',  nivel: 'A',  principio: 'Perceptible', directriz: 'Adaptable',                nombre: 'Secuencia significativa',                                 es_21: false },
  { codigo: '1.3.3',  nivel: 'A',  principio: 'Perceptible', directriz: 'Adaptable',                nombre: 'Características sensoriales',                             es_21: false },
  { codigo: '1.3.4',  nivel: 'AA', principio: 'Perceptible', directriz: 'Adaptable',                nombre: 'Orientación',                                             es_21: true  },
  { codigo: '1.3.5',  nivel: 'AA', principio: 'Perceptible', directriz: 'Adaptable',                nombre: 'Identificación del propósito de la entrada',              es_21: true  },
  { codigo: '1.4.1',  nivel: 'A',  principio: 'Perceptible', directriz: 'Distinguible',             nombre: 'Uso del color',                                           es_21: false },
  { codigo: '1.4.2',  nivel: 'A',  principio: 'Perceptible', directriz: 'Distinguible',             nombre: 'Control de audio',                                        es_21: false },
  { codigo: '1.4.3',  nivel: 'AA', principio: 'Perceptible', directriz: 'Distinguible',             nombre: 'Contraste (mínimo)',                                      es_21: false },
  { codigo: '1.4.4',  nivel: 'AA', principio: 'Perceptible', directriz: 'Distinguible',             nombre: 'Cambio de tamaño del texto',                              es_21: false },
  { codigo: '1.4.5',  nivel: 'AA', principio: 'Perceptible', directriz: 'Distinguible',             nombre: 'Imágenes de texto',                                       es_21: false },
  { codigo: '1.4.10', nivel: 'AA', principio: 'Perceptible', directriz: 'Distinguible',             nombre: 'Reajuste del contenido',                                  es_21: true  },
  { codigo: '1.4.11', nivel: 'AA', principio: 'Perceptible', directriz: 'Distinguible',             nombre: 'Contraste en componentes no textuales',                   es_21: true  },
  { codigo: '1.4.12', nivel: 'AA', principio: 'Perceptible', directriz: 'Distinguible',             nombre: 'Espaciado del texto',                                     es_21: true  },
  { codigo: '1.4.13', nivel: 'AA', principio: 'Perceptible', directriz: 'Distinguible',             nombre: 'Contenido en hover o focus',                              es_21: true  },
  // ── Operable ────────────────────────────────────────────────────────────────
  { codigo: '2.1.1',  nivel: 'A',  principio: 'Operable', directriz: 'Accesible por teclado',  nombre: 'Teclado',                                   es_21: false },
  { codigo: '2.1.2',  nivel: 'A',  principio: 'Operable', directriz: 'Accesible por teclado',  nombre: 'Sin trampa para el foco del teclado',        es_21: false },
  { codigo: '2.1.4',  nivel: 'A',  principio: 'Operable', directriz: 'Accesible por teclado',  nombre: 'Atajos de tecla de carácter',                es_21: true  },
  { codigo: '2.2.1',  nivel: 'A',  principio: 'Operable', directriz: 'Tiempo suficiente',      nombre: 'Tiempo ajustable',                          es_21: false },
  { codigo: '2.2.2',  nivel: 'A',  principio: 'Operable', directriz: 'Tiempo suficiente',      nombre: 'Poner en pausa, detener, ocultar',          es_21: false },
  { codigo: '2.3.1',  nivel: 'A',  principio: 'Operable', directriz: 'Convulsiones',           nombre: 'Tres destellos o por debajo del umbral',    es_21: false },
  { codigo: '2.4.1',  nivel: 'A',  principio: 'Operable', directriz: 'Navegable',              nombre: 'Evitar bloques',                            es_21: false },
  { codigo: '2.4.2',  nivel: 'A',  principio: 'Operable', directriz: 'Navegable',              nombre: 'Página titulada',                           es_21: false },
  { codigo: '2.4.3',  nivel: 'A',  principio: 'Operable', directriz: 'Navegable',              nombre: 'Orden del foco',                            es_21: false },
  { codigo: '2.4.4',  nivel: 'A',  principio: 'Operable', directriz: 'Navegable',              nombre: 'Propósito del enlace (en contexto)',        es_21: false },
  { codigo: '2.4.5',  nivel: 'AA', principio: 'Operable', directriz: 'Navegable',              nombre: 'Múltiples vías',                            es_21: false },
  { codigo: '2.4.6',  nivel: 'AA', principio: 'Operable', directriz: 'Navegable',              nombre: 'Encabezados y etiquetas',                   es_21: false },
  { codigo: '2.4.7',  nivel: 'AA', principio: 'Operable', directriz: 'Navegable',              nombre: 'Foco visible',                              es_21: false },
  { codigo: '2.5.1',  nivel: 'A',  principio: 'Operable', directriz: 'Modalidades de entrada', nombre: 'Gestos del puntero',                        es_21: true  },
  { codigo: '2.5.2',  nivel: 'A',  principio: 'Operable', directriz: 'Modalidades de entrada', nombre: 'Cancelación del puntero',                   es_21: true  },
  { codigo: '2.5.3',  nivel: 'A',  principio: 'Operable', directriz: 'Modalidades de entrada', nombre: 'Etiqueta en el nombre',                     es_21: true  },
  { codigo: '2.5.4',  nivel: 'A',  principio: 'Operable', directriz: 'Modalidades de entrada', nombre: 'Actuación por movimiento',                  es_21: true  },
  // ── Comprensible ────────────────────────────────────────────────────────────
  { codigo: '3.1.1',  nivel: 'A',  principio: 'Comprensible', directriz: 'Legible',                   nombre: 'Idioma de la página',                                          es_21: false },
  { codigo: '3.1.2',  nivel: 'AA', principio: 'Comprensible', directriz: 'Legible',                   nombre: 'Idioma de las partes',                                         es_21: false },
  { codigo: '3.2.1',  nivel: 'A',  principio: 'Comprensible', directriz: 'Predecible',                nombre: 'Con foco',                                                     es_21: false },
  { codigo: '3.2.2',  nivel: 'A',  principio: 'Comprensible', directriz: 'Predecible',                nombre: 'Con entrada de datos',                                         es_21: false },
  { codigo: '3.2.3',  nivel: 'AA', principio: 'Comprensible', directriz: 'Predecible',                nombre: 'Navegación coherente',                                         es_21: false },
  { codigo: '3.2.4',  nivel: 'AA', principio: 'Comprensible', directriz: 'Predecible',                nombre: 'Identificación coherente',                                     es_21: false },
  { codigo: '3.3.1',  nivel: 'A',  principio: 'Comprensible', directriz: 'Entrada de datos asistida', nombre: 'Identificación de errores',                                    es_21: false },
  { codigo: '3.3.2',  nivel: 'A',  principio: 'Comprensible', directriz: 'Entrada de datos asistida', nombre: 'Etiquetas o instrucciones',                                    es_21: false },
  { codigo: '3.3.3',  nivel: 'AA', principio: 'Comprensible', directriz: 'Entrada de datos asistida', nombre: 'Sugerencia tras error',                                        es_21: false },
  { codigo: '3.3.4',  nivel: 'AA', principio: 'Comprensible', directriz: 'Entrada de datos asistida', nombre: 'Prevención de errores (legales, financieros, de datos)',       es_21: false },
  // ── Robusto ──────────────────────────────────────────────────────────────────
  { codigo: '4.1.1',  nivel: 'A',  principio: 'Robusto', directriz: 'Compatible', nombre: 'Procesamiento',          es_21: false },
  { codigo: '4.1.2',  nivel: 'A',  principio: 'Robusto', directriz: 'Compatible', nombre: 'Nombre, función, valor', es_21: false },
  { codigo: '4.1.3',  nivel: 'AA', principio: 'Robusto', directriz: 'Compatible', nombre: 'Mensajes de estado',     es_21: true  },
]

export const PRINCIPIOS: WcagPrincipio[] = ['Perceptible', 'Operable', 'Comprensible', 'Robusto']

export const PRINCIPIO_META: Record<WcagPrincipio, { color: string; bg: string; descripcion: string }> = {
  Perceptible:  { color: 'text-blue-700',   bg: 'bg-blue-50',   descripcion: 'La información y los componentes de la UI deben ser perceptibles.' },
  Operable:     { color: 'text-violet-700', bg: 'bg-violet-50', descripcion: 'Los componentes de la UI y la navegación deben ser operables.' },
  Comprensible: { color: 'text-amber-700',  bg: 'bg-amber-50',  descripcion: 'La información y el manejo de la UI deben ser comprensibles.' },
  Robusto:      { color: 'text-emerald-700',bg: 'bg-emerald-50',descripcion: 'El contenido debe ser interpretable por tecnologías de asistencia.' },
}

export function getCriteriosByPrincipio(principio: WcagPrincipio): WcagCriterio[] {
  return WCAG_CRITERIOS.filter(c => c.principio === principio)
}

export function calcularPuntajeWcag(
  resultados: Map<string, WcagResultadoEntry>
): number | null {
  let cumple = 0
  let noCumple = 0
  for (const [, entry] of resultados) {
    if (entry.resultado === 'cumple') cumple++
    else if (entry.resultado === 'no_cumple') noCumple++
  }
  const total = cumple + noCumple
  return total > 0 ? cumple / total : null
}
