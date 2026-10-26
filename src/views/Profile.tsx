import { PRICE_PERIOD, planById, type Tier } from '../data/plans'
import type { Profile as ProfileT } from '../store'
import { Check } from './icons'
import { LanguagePicker, SittingPicker } from './Onboarding'
import { Stepper } from './ui'

interface Props {
  profile: ProfileT
  onChange: (p: ProfileT) => void
  tier: Tier | null
  onChangePlan: () => void
  onReset: () => void
}

const LADDER = [
  { id: 'pd2', name: 'Prøve i Dansk 2', note: 'Sprogkrav for permanent ophold', active: false },
  { id: 'medborgerskab', name: 'Medborgerskabsprøven', note: 'Krav for permanent ophold', active: false },
  { id: 'indfodsret', name: 'Indfødsretsprøven', note: 'Krav for statsborgerskab', active: true },
]

export function Profile({ profile, onChange, tier, onChangePlan, onReset }: Props) {
  const plan = tier ? planById(tier) : null
  return (
    <div className="page">
      <header className="page-head">
        <h1>Profil</h1>
      </header>

      <section className="summary">
        <div className="page-head">
          <h2 className="section-title">Abonnement</h2>
          <span className="small muted">
            {plan ? (plan.price ? `${plan.price} kr./${PRICE_PERIOD}` : 'Gratis') : 'Ikke valgt'}
          </span>
        </div>
        <p className="box-title">{plan?.name ?? '–'}</p>
        <p className="small muted">{plan?.tagline}</p>
        <button type="button" className={tier === 'plus' ? 'secondary wide' : 'primary wide'} onClick={onChangePlan}>
          {tier === 'plus' ? 'Se abonnementer' : 'Opgrader'}
        </button>
      </section>

      <section className="summary">
        <h2 className="section-title">Prøvedato</h2>
        <SittingPicker value={profile.examDate} onChange={(examDate) => onChange({ ...profile, examDate })} />
      </section>

      <section className="summary">
        <Stepper
          label="Tid om dagen"
          value={profile.dailyMinutes}
          min={5}
          max={15}
          step={5}
          unit="min"
          onChange={(v) => onChange({ ...profile, dailyMinutes: v as ProfileT['dailyMinutes'] })}
        />
      </section>

      <section className="summary">
        <h2 className="section-title">Forklaringer</h2>
        <LanguagePicker value={profile.helpLang} onChange={(helpLang) => onChange({ ...profile, helpLang })} />
      </section>

      <h2 className="group-title">Din vej</h2>
      <p className="small muted" style={{ marginTop: -8 }}>
        Én profil på tværs af prøverne. Dine data følger med, når du går videre.
      </p>
      <ul className="box-list">
        {LADDER.map((s) => (
          <li key={s.id} className={`box ${s.active ? '' : 'is-empty'}`}>
            <span className="check" style={s.active ? { background: 'var(--ink)', color: '#fff', boxShadow: 'none' } : undefined}>
              {s.active && <Check size={14} />}
            </span>
            <span className="box-text">
              <span className="box-title">{s.name}</span>
              <span className="box-sub">{s.note}</span>
            </span>
            <span className="small muted">{s.active ? 'Aktiv' : tier === 'plus' ? 'I Plus · kommer snart' : 'Kommer snart'}</span>
          </li>
        ))}
      </ul>

      <button
        type="button"
        className="secondary danger wide"
        onClick={() => {
          if (confirm('Slet alle dine svar og start forfra?')) onReset()
        }}
      >
        Nulstil mine data
      </button>
      <p className="small muted center">Pasvej er et privat studieværktøj og har ingen tilknytning til SIRI eller andre myndigheder.</p>
    </div>
  )
}
