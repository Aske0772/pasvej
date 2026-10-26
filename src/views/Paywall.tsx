import { useEffect, useRef } from 'react'
import { PLANS, type Plan, type Tier } from '../data/plans'
import { Check, X } from './icons'

interface Props {
  /** Result of the first 10-question test, if that is what brought the user here. */
  firstTest?: { correct: number; total: number }
  /** Plan to scroll into view when the sheet opens (e.g. the one that unlocks what was tapped). */
  focus?: Tier
  current: Tier | null
  onChoose: (tier: Tier) => void
  /** Missing when a choice is required (right after the first test). */
  onClose?: () => void
}

const PHOTOS = ['kap1', 'kap2', 'kap5', 'kap6']

/**
 * Three plans on identical glass cards: same colour, same build (similarity). Each card is
 * one region holding the plan's name, price and its own button in an inner panel, with the
 * features underneath (common region, proximity). Only the text differs: the lists are
 * cumulative, so they get longer from Gratis to Plus and the cards show "more for more".
 */
export function Paywall({ firstTest, focus, current, onChoose, onClose }: Props) {
  const focusRef = useRef<HTMLElement | null>(null)
  useEffect(() => {
    focusRef.current?.scrollIntoView({ block: 'center' })
  }, [])

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
              <p className="hero-label">Din første test · {firstTest.correct} af {firstTest.total} rigtige</p>
              <h1>Vælg, hvor meget du vil øve.</h1>
              <p>Til prøven skal du have 36 af 45 rigtige.</p>
            </>
          ) : (
            <>
              <p className="hero-label">Abonnementer</p>
              <h1>Få mere ud af Pasvej.</h1>
            </>
          )}
        </header>

        <div className="tiers">
          {PLANS.map((p) => (
            <TierCard
              key={p.id}
              plan={p}
              current={current === p.id}
              innerRef={p.id === focus ? (el) => (focusRef.current = el) : undefined}
              onChoose={() => onChoose(p.id)}
            />
          ))}
        </div>

        <p className="pw-note">Prototype: der trækkes ingen betaling endnu. Du kan skifte abonnement under Profil.</p>
      </div>
    </div>
  )
}

function TierCard({
  plan,
  current,
  innerRef,
  onChoose,
}: {
  plan: Plan
  current: boolean
  innerRef?: (el: HTMLElement | null) => void
  onChoose: () => void
}) {
  return (
    <section className="tier" ref={innerRef} aria-labelledby={`tier-${plan.id}`}>
      <div className="tier-panel">
        <h2 id={`tier-${plan.id}`} className="tier-name">
          {plan.name}
          {current && <span className="tier-tag">Dit abonnement</span>}
        </h2>
        <div className="tier-price">
          <span className="tier-amount">
            {plan.price}
            <sup>kr.</sup>
          </span>
          <span className="tier-price-note">
            {plan.priceNote[0]}
            <br />
            {plan.priceNote[1]}
          </span>
        </div>
        <button type="button" className="tier-button" disabled={current} onClick={onChoose}>
          {current ? 'Valgt' : plan.price === 0 ? 'Fortsæt gratis' : `Vælg ${plan.name}`}
        </button>
      </div>

      <ul className="tier-features">
        {plan.features.map((f) => (
          <li key={f.text}>
            <Check size={15} />
            <span>
              {f.text}
              {f.soon && <span className="tier-soon">Kommer snart</span>}
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}
