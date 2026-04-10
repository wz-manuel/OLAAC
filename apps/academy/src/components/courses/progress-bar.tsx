interface ProgressBarProps {
  value: number // 0–100
  label?: string
}

export function ProgressBar({ value, label }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value))
  const displayLabel = label ?? `${clamped}% completado`

  return (
    <div className="flex items-center gap-3">
      <div
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={displayLabel}
        className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200"
      >
        <div
          className="h-full rounded-full bg-[#005fcc] transition-all duration-300"
          style={{ width: `${clamped}%` }}
        />
      </div>
      <span className="min-w-[3.5rem] text-right text-sm tabular-nums text-gray-600">
        {clamped}%
      </span>
    </div>
  )
}
