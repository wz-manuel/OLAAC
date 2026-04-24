// Logo oficial OLAAC — extraído del SVG vectorial (OLAAC_final_daeg.svg)
// Colores: #252858 Azul Observatorio · #30BCEE Azul Acceso · #C9EAF2 Azul Hielo
import type { SVGProps } from 'react'

interface OlaacLogoProps extends SVGProps<SVGSVGElement> {
  variant?: 'full' | 'symbol'
  width?: number
  height?: number
}

export function OlaacLogo({
  variant = 'full',
  width,
  height,
  className,
  ...props
}: OlaacLogoProps) {
  if (variant === 'symbol') {
    return (
      <svg
        role="img"
        aria-label="OLAAC — Observatorio Latinoamericano de Accesibilidad"
        viewBox="0 0 110 110"
        width={width ?? 40}
        height={height ?? 40}
        className={className}
        xmlns="http://www.w3.org/2000/svg"
        {...props}
      >
        {/* Círculo exterior de la lupa */}
        <circle cx="50" cy="50" r="44" fill="none" stroke="#252858" strokeWidth="9" />
        {/* Relleno cian */}
        <circle cx="50" cy="50" r="35" fill="#30BCEE" />
        {/* Grilla de puntos blancos — patrón de datos */}
        {[22, 30, 38, 46, 54, 62, 70, 78].map((x) =>
          [22, 30, 38, 46, 54, 62, 70, 78].map((y) => {
            const dist = Math.sqrt((x - 50) ** 2 + (y - 50) ** 2)
            return dist <= 35 ? (
              <circle key={`${x}-${y}`} cx={x} cy={y} r={2.2} fill="#ffffff" />
            ) : null
          })
        )}
        {/* Mango de la lupa */}
        <line x1="80" y1="80" x2="104" y2="104" stroke="#252858" strokeWidth="9" strokeLinecap="round" />
      </svg>
    )
  }

  return (
    <svg
      role="img"
      aria-label="OLAAC — Observatorio Latinoamericano de Accesibilidad"
      viewBox="0 0 335 95"
      width={width ?? 180}
      height={height ?? 51}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      {/* Símbolo: lupa */}
      <circle cx="50" cy="44" r="36" fill="none" stroke="#252858" strokeWidth="7.5" />
      <circle cx="50" cy="44" r="28" fill="#30BCEE" />
      {/* Puntos blancos internos */}
      {[28, 36, 44, 52, 60, 68].map((x) =>
        [22, 30, 38, 46, 54, 66].map((y) => {
          const dist = Math.sqrt((x - 50) ** 2 + (y - 44) ** 2)
          return dist <= 27 ? (
            <circle key={`${x}-${y}`} cx={x} cy={y} r={2} fill="#ffffff" />
          ) : null
        })
      )}
      {/* Mango de la lupa */}
      <line x1="70" y1="64" x2="90" y2="84" stroke="#252858" strokeWidth="7.5" strokeLinecap="round" />

      {/* Acento cian sobre las A (puntos decorativos del logo original) */}
      <circle cx="192" cy="12" r="4" fill="#30BCEE" />
      <circle cx="246" cy="12" r="4" fill="#30BCEE" />

      {/* Tipografía OLAAC — L */}
      <path
        d="M109 22h-6c-.86 0-1.55.69-1.55 1.55v50.27c0 .86.69 1.55 1.55 1.55h33.06c.86 0 1.55-.69 1.55-1.55v-6.55c0-.86-.69-1.55-1.55-1.55H109V22z"
        fill="#252858"
      />
      {/* A1 */}
      <polygon points="133.59,52 148.48,52 141.07,34.08" fill="none" />
      <path
        d="M145.88 21.55c-.24-.57-.8-.94-1.42-.94h-6.84c-.62 0-1.18.37-1.42.94L114.88 71.82c-.2.48-.15 1.03.13 1.46.29.43.77.69 1.29.69h7.13c.62 0 1.19-.37 1.43-.95l5-11.94h22.36l5 11.94c.24.57.8.95 1.43.95h7.13c.52 0 1-.26 1.29-.69.29-.43.34-.98.13-1.46L145.88 21.55zm-12.29 30.45 7.47-17.92 7.42 17.92h-14.89z"
        fill="#252858"
      />
      {/* A2 */}
      <polygon points="190,52 204.89,52 197.48,34.08" fill="none" />
      <path
        d="M203.01 21.55c-.24-.57-.8-.94-1.42-.94h-6.84c-.62 0-1.18.37-1.42.94L172.01 71.82c-.2.48-.15 1.03.13 1.46.29.43.77.69 1.29.69h7.13c.62 0 1.19-.37 1.43-.95l5-11.94h22.36l5 11.94c.24.57.8.95 1.43.95h7.13c.52 0 1-.26 1.29-.69.29-.43.34-.98.13-1.46L203.01 21.55zM190 52l7.47-17.92 7.42 17.92H190z"
        fill="#252858"
      />
      {/* C */}
      <path
        d="M247.43 29.24c5.62 0 10.83 1.56 15.49 4.64.25.17.55.26.85.26h.36c.86 0 1.55-.69 1.55-1.55v-6.48c0-.54-.28-1.05-.75-1.33-5.4-3.25-11.42-4.9-17.87-4.9-7.73 0-14.2 2.51-19.2 7.47-5.01 4.96-7.55 11.67-7.55 19.93s2.54 14.97 7.55 19.93c5.01 4.95 11.47 7.47 19.2 7.47 6.45 0 12.46-1.65 17.87-4.9.47-.28.75-.78.75-1.33v-6.48c0-.86-.69-1.55-1.55-1.55h-.36c-.3 0-.6.09-.85.26-4.66 3.08-9.88 4.64-15.49 4.64-5.55 0-9.75-1.63-12.83-4.97-3.07-3.33-4.63-7.73-4.63-13.07 0-5.41 1.52-9.68 4.63-13.07 3.08-3.37 7.28-5 12.83-5z"
        fill="#252858"
      />
    </svg>
  )
}
