import { useState } from 'react'
import type { Lang } from '../data/types'
import { nextOpenSitting, SITTINGS, type Profile } from '../store'
import { Chip, formatDate, Stepper } from './ui'

interface Props {
  onDone: (profile: Profile) => void
}

export function Onboarding({ onDone }: Props) {
  const [examDate, setExamDate] = useState(nextOpenSitting().date)
  const [dailyMinutes, setDailyMinutes] = useState<Profile['dailyMinutes']>(10)
  const [helpLang, setHelpLang] = useState<Lang | null>('en')

  return (
    <div className="onboarding">
      <div className="onboarding-head">
        <div className="brand brand--big">Pasvej</div>
        <h1>Bliv klar til indfødsretsprøven.</h1>
        <p className="muted">Tre valg, og så en kort test på 10 spørgsmål. Bagefter ved du, hvor tæt du er på at bestå.</p>
      </div>

      <section>
        <h2 className="section-title">Hvornår skal du til prøve?</h2>
        <SittingPicker value={examDate} onChange={setExamDate} />
      </section>

      <section>
        <Stepper label="Tid om dagen" value={dailyMinutes} min={5} max={15} step={5} unit="min" onChange={(v) => setDailyMinutes(v as Profile['dailyMinutes'])} />
      </section>

      <section>
        <div>
          <h2 className="section-title">Forklaringer</h2>
          <p className="small muted">Spørgsmålene er på dansk, ligesom til prøven. Forklaringen kan også stå på dit sprog.</p>
        </div>
        <LanguagePicker value={helpLang} onChange={setHelpLang} />
      </section>

      <button type="button" className="primary wide" onClick={() => onDone({ exam: 'indfodsret', examDate, dailyMinutes, helpLang })}>
        Start testen
      </button>
    </div>
  )
}

const today = () => new Date().toISOString().slice(0, 10)

export function SittingPicker({ value, onChange }: { value: string; onChange: (date: string) => void }) {
  return (
    <div className="chip-grid">
      {SITTINGS.filter((s) => s.date >= today()).map((s) => (
        <Chip
          key={s.date}
          on={value === s.date}
          title={formatDate(s.date, { day: 'numeric', month: 'short', year: 'numeric' })}
          sub={s.deadline >= today() ? `Tilmelding senest ${formatDate(s.deadline, { day: 'numeric', month: 'short' })}` : 'Tilmelding lukket'}
          onClick={() => onChange(s.date)}
        />
      ))}
    </div>
  )
}

export function LanguagePicker({ value, onChange }: { value: Lang | null; onChange: (l: Lang | null) => void }) {
  return (
    <div className="chip-grid">
      <Chip on={value === null} title="Kun dansk" onClick={() => onChange(null)} />
      <Chip on={value === 'en'} title="Dansk + English" onClick={() => onChange('en')} />
    </div>
  )
}
