import type { ReactNode } from 'react'
import { Arrow, Check, Minus, Plus } from './icons'

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

/**
 * Dark panel (ink layer) for settings and short lists: a title with an optional note, then
 * rows. One panel per topic keeps related controls in one region (common region).
 */
export function Panel({ title, sub, aside, children }: { title?: ReactNode; sub?: ReactNode; aside?: ReactNode; children: ReactNode }) {
  return (
    <section className="panel">
      {title && (
        <header className="panel-head">
          <div>
            <h2 className="panel-title">{title}</h2>
            {sub && <p className="panel-sub">{sub}</p>}
          </div>
          {aside}
        </header>
      )}
      {children}
    </section>
  )
}

/**
 * One panel row: icon tile, text and an action on the right, always in that order
 * (similarity). With onClick the whole row is the button; `on` marks the chosen option.
 */
export function Row({
  icon,
  title,
  sub,
  trailing,
  on,
  dim,
  onClick,
}: {
  icon: ReactNode
  title: ReactNode
  sub?: ReactNode
  /** Defaults to an arrow for rows that go somewhere, or a check box when `on` is set. */
  trailing?: ReactNode
  on?: boolean
  dim?: boolean
  onClick?: () => void
}) {
  const end =
    trailing ??
    (on === undefined ? (
      onClick && <span className="prow-action"><Arrow size={18} /></span>
    ) : (
      <span className="prow-action is-check">{on && <Check size={16} />}</span>
    ))
  const body = (
    <>
      <span className="prow-icon">{icon}</span>
      <span className="prow-text">
        <span className="prow-title">{title}</span>
        {sub && <span className="prow-sub">{sub}</span>}
      </span>
      {end}
    </>
  )
  const cls = `prow ${on ? 'is-on' : ''} ${dim ? 'is-dim' : ''}`
  return onClick ? (
    <button type="button" className={cls} aria-pressed={on} onClick={onClick}>
      {body}
    </button>
  ) : (
    <div className={cls}>{body}</div>
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
