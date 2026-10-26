import { useId, useState } from 'react'
import { addMonths } from '../data/current'
import { Chevron } from './icons'
import { formatDate } from './ui'

/**
 * Fold-out on the exam intro: why the current-affairs questions for the learner's sitting are
 * missing, and what happens until they arrive. Shown only while some are missing.
 */
export function MissingCurrent({ examDate, missing, count, passTotal }: { examDate: string; missing: number; count: number; passTotal: number }) {
  const [open, setOpen] = useState(false)
  const id = useId()
  const from = formatDate(addMonths(examDate, -6), { month: 'long', year: 'numeric' })
  return (
    <div className={`disclosure ${open ? 'is-open' : ''}`}>
      <button type="button" className="disclosure-toggle" aria-expanded={open} aria-controls={id} onClick={() => setOpen(!open)}>
        Hvorfor mangler de aktuelle spørgsmål?
        <Chevron size={16} />
      </button>
      {open && (
        <ul id={id} className="disclosure-body">
          <li>Spørgsmål 36–40 til prøven handler om aktuelle begivenheder fra det sidste halve år før prøven.</li>
          <li>
            Din prøve er <b>{formatDate(examDate)}</b>, så de handler om tiden fra cirka <b>{from}</b> og frem. Meget af det er
            ikke sket endnu.
          </li>
          <li>
            Vi skriver dem løbende med kilde, når der sker noget. Så kommer de med her og under Aktuelle begivenheder i Træn.
          </li>
          <li>
            Indtil da mangler {missing}, og prøven er skaleret ned med samme krav: <b>{passTotal}</b> af <b>{count}</b> svarer
            til <b>36</b> af <b>45</b>.
          </li>
          <li>Tip: Følg med i nyhederne, fx om Folketinget, regeringen, kongehuset og Grønland.</li>
        </ul>
      )}
    </div>
  )
}
