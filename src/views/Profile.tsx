import { PRICE_PERIOD, planById, type Tier } from '../data/plans'
import { SITTINGS, type Profile as ProfileT } from '../store'
import { Calendar, Clock, Flag, Globe, Lock, Minus, Plus, Star, Text } from './icons'
import { formatDate, Panel, Row } from './ui'

interface Props {
  profile: ProfileT
  onChange: (p: ProfileT) => void
  tier: Tier | null
  onChangePlan: () => void
  onReset: () => void
}

const today = () => new Date().toISOString().slice(0, 10)

const LADDER = [
  { id: 'pd2', name: 'Prøve i Dansk 2', note: 'Sprogkrav for permanent ophold', active: false },
  { id: 'medborgerskab', name: 'Medborgerskabsprøven', note: 'Krav for permanent ophold', active: false },
  { id: 'indfodsret', name: 'Indfødsretsprøven', note: 'Krav for statsborgerskab', active: true },
]

export function Profile({ profile, onChange, tier, onChangePlan, onReset }: Props) {
  const plan = tier ? planById(tier) : null
  const setMinutes = (v: number) => onChange({ ...profile, dailyMinutes: v as ProfileT['dailyMinutes'] })
  return (
    <div className="page">
      <header className="page-head">
        <h1>Profil</h1>
      </header>

      <Panel
        title="Abonnement"
        aside={<span className="panel-aside">{plan ? (plan.price ? `${plan.price} kr./${PRICE_PERIOD}` : 'Gratis') : 'Ikke valgt'}</span>}
      >
        <Row icon={<Star size={20} />} title={plan?.name ?? '–'} sub={plan?.tagline} />
        <button type="button" className="primary wide" onClick={onChangePlan}>
          {tier === 'plus' ? 'Se abonnementer' : 'Opgrader'}
        </button>
      </Panel>

      <Panel title="Prøvedato">
        <div className="panel-list">
          {SITTINGS.filter((s) => s.date >= today()).map((s) => (
            <Row
              key={s.date}
              icon={<Calendar size={20} />}
              title={formatDate(s.date, { day: 'numeric', month: 'long', year: 'numeric' })}
              sub={s.deadline >= today() ? `Tilmelding senest ${formatDate(s.deadline, { day: 'numeric', month: 'short' })}` : 'Tilmelding lukket'}
              on={profile.examDate === s.date}
              onClick={() => onChange({ ...profile, examDate: s.date })}
            />
          ))}
        </div>
      </Panel>

      <Panel>
        <Row
          icon={<Clock size={20} />}
          title="Tid om dagen"
          trailing={
            <span className="prow-steps">
              <button
                type="button"
                className="prow-action"
                aria-label="Mindre: Tid om dagen"
                disabled={profile.dailyMinutes <= 5}
                onClick={() => setMinutes(profile.dailyMinutes - 5)}
              >
                <Minus size={18} />
              </button>
              <span className="prow-value" aria-live="polite">
                {profile.dailyMinutes}
                <small> min</small>
              </span>
              <button
                type="button"
                className="prow-action"
                aria-label="Mere: Tid om dagen"
                disabled={profile.dailyMinutes >= 15}
                onClick={() => setMinutes(profile.dailyMinutes + 5)}
              >
                <Plus size={18} />
              </button>
            </span>
          }
        />
      </Panel>

      <Panel title="Forklaringer">
        <div className="panel-list">
          <Row icon={<Text size={20} />} title="Kun dansk" on={profile.helpLang === null} onClick={() => onChange({ ...profile, helpLang: null })} />
          <Row icon={<Globe size={20} />} title="Dansk + English" on={profile.helpLang === 'en'} onClick={() => onChange({ ...profile, helpLang: 'en' })} />
        </div>
      </Panel>

      <Panel title="Din vej" sub="Én profil på tværs af prøverne. Dine data følger med, når du går videre.">
        <div className="panel-list">
          {LADDER.map((s) => (
            <Row
              key={s.id}
              dim={!s.active}
              icon={s.active ? <Flag size={20} /> : <Lock size={18} />}
              title={s.name}
              sub={s.note}
              trailing={
                <span className={`prow-tag ${s.active ? 'is-on' : ''}`}>
                  {s.active ? 'Aktiv' : tier === 'plus' ? 'I Plus · snart' : 'Kommer snart'}
                </span>
              }
            />
          ))}
        </div>
      </Panel>

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
