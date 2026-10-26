import { useState } from 'react'
import { PLANS, PRICE_PERIOD, type Plan, type Tier } from '../data/plans'
import { Check, X } from './icons'

interface Props {
  /** Result of the first 10-question test, if that is what brought the user here. */
  firstTest?: { correct: number; total: number }
  /** Plan to have selected when the sheet opens (e.g. the one that unlocks what was tapped). */
  focus?: Tier
  current: Tier | null
  onChoose: (tier: Tier) => void
  /** Missing when a choice is required (right after the first test). */
  onClose?: () => void
}

const PHOTOS = ['kap1', 'kap2', 'kap5', 'kap6']

/**
 * Three plans on glass cards. Every card is built the same way (similarity) and holds its own
 * name, price, fill bar and features (common region). Each plan lists only what it adds on top of
 * the one before ("Alt i Basis, plus:"), so the cards grow down the page and the fill bar steps
 * up 1/3 → 2/3 → 3/3: you can see you get more the further down you go. One button acts on the
 * selected card (focal point).
 */
export function Paywall({ firstTest, focus, current, onChoose, onClose }: Props) {
  const [selected, setSelected] = useState<Tier>(focus ?? current ?? 'basis')
  const plan = PLANS.find((p) => p.id === selected)!

  return (
    <div className="paywall">
      <div className="pw-photos" aria-hidden>
        {PHOTOS.map((id) => (
          <img key={id} src={`${import.meta.env.BASE_URL}topics/${id}.webp`} alt="" />
        ))}
      </div>

      <div className="pw-content">
        {onClose && (
          <button type="button" className="round pw-close" aria-label="Luk" onClick={onClose}>
            <X size={18} />
          </button>
        )}

        <header className="pw-head">
          {firstTest ? (
            <>
              <p className="hero-label">Din første test</p>
              <h1>
                {firstTest.correct} af {firstTest.total} rigtige.
              </h1>
              <p>Til prøven skal du have 36 af 45. Vælg, hvor meget du vil øve med.</p>
            </>
          ) : (
            <>
              <p className="hero-label">Abonnement</p>
              <h1>Få mere ud af Pasvej.</h1>
              <p>Jo længere ned, jo mere er med.</p>
            </>
          )}
        </header>

        <div className="tiers" role="radiogroup" aria-label="Abonnementer">
          {PLANS.map((p) => (
            <TierCard key={p.id} plan={p} selected={selected === p.id} current={current === p.id} onSelect={() => setSelected(p.id)} />
          ))}
        </div>
      </div>

      <div className="actions pw-actions">
        <button type="button" className="primary" onClick={() => onChoose(selected)}>
          {plan.price === 0 ? 'Fortsæt gratis' : `Vælg ${plan.name} · ${plan.price} kr./${PRICE_PERIOD}`}
        </button>
      </div>
      <p className="pw-note">Prototype: der trækkes ingen betaling endnu. Du kan skifte abonnement under Profil.</p>
    </div>
  )
}

function TierCard({ plan, selected, current, onSelect }: { plan: Plan; selected: boolean; current: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      className={`tier tier-${plan.id} ${selected ? 'is-selected' : ''}`}
      onClick={onSelect}
    >
      <span className="tier-top">
        <span className="tier-radio" aria-hidden>
          {selected && <Check size={14} />}
        </span>
        <span className="tier-name">
          {plan.name}
          {current && <span className="tier-tag">Dit nuværende</span>}
        </span>
        <span className="tier-price">
          {plan.price === 0 ? (
            '0 kr.'
          ) : (
            <>
              {plan.price} kr.<small>/{PRICE_PERIOD}</small>
            </>
          )}
        </span>
      </span>

      {/* How much of the app the plan opens: 1, 2 or 3 of 3 (closure: the bar fills up). */}
      <span className="tier-fill" aria-label={`Indhold ${plan.level} af 3`}>
        {[1, 2, 3].map((n) => (
          <i key={n} className={n <= plan.level ? 'on' : ''} />
        ))}
      </span>

      <span className="tier-tagline">{plan.tagline}</span>

      <span className="tier-features">
        {plan.includes && <span className="tier-includes">Alt i {plan.includes}, plus:</span>}
        {plan.features.map((f) => (
          <span key={f.text} className="tier-feature">
            <Check size={15} />
            <span>
              {f.text}
              {f.soon && <span className="tier-soon">Kommer snart</span>}
            </span>
          </span>
        ))}
      </span>
    </button>
  )
}
