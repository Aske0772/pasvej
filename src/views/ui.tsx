import type { ReactNode } from 'react'
import { Check, Minus, Plus } from './icons'

export function Stepper({
  label,
  value,
  min,
  max,
  step = 1,
  unit,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  step?: number
  unit?: string
  onChange: (v: number) => void
}) {
  return (
    <div className="stepper">
      <span className="stepper-label">{label}</span>
      <div className="stepper-controls">
        <button type="button" className="round" aria-label={`Mindre: ${label}`} disabled={value <= min} onClick={() => onChange(value - step)}>
          <Minus size={18} />
        </button>
        <span className="stepper-value" aria-live="polite">
          {value}
          {unit && <small> {unit}</small>}
        </span>
        <button type="button" className="round" aria-label={`Mere: ${label}`} disabled={value >= max} onClick={() => onChange(value + step)}>
          <Plus size={18} />
        </button>
      </div>
    </div>
  )
}

/** A box-shaped choice with a check circle; one per option in a `.chip-grid`. */
export function Chip({ on, title, sub, onClick }: { on: boolean; title: ReactNode; sub?: ReactNode; onClick: () => void }) {
  return (
    <button type="button" className={`chip ${on ? 'is-on' : ''}`} aria-pressed={on} onClick={onClick}>
      <span className="chip-name">{title}</span>
      {sub && <span className="chip-sub">{sub}</span>}
      <span className="check">{on && <Check size={14} />}</span>
    </button>
  )
}

export const STEP_TITLE: Record<'review' | 'weakest' | 'new' | 'mini-exam' | 'daily-free', string> = {
  review: 'Gentag dine fejl',
  weakest: 'Dit svageste tema',
  new: 'Nye spørgsmål',
  'mini-exam': 'Mini-prøve',
  'daily-free': 'Dagens mini-prøve',
}

/** Short haptic tick on phones that support it; silent elsewhere. */
export const buzz = (pattern: number | number[]) => {
  try {
    navigator.vibrate?.(pattern)
  } catch {
    // Not supported.
  }
}

export const formatDate =(iso: string, opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' }) =>
  new Date(iso + 'T12:00:00').toLocaleDateString('da-DK', opts)
