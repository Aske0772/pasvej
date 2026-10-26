import type { Readiness, practiceStats } from '../engine/readiness'
import type { PlanStep } from '../engine/plan'
import { topicById } from '../data/topics'
import { Check } from './icons'
import { STEP_TITLE } from './ui'

interface Props {
  readiness: Readiness
  stats: ReturnType<typeof practiceStats>
  plan: PlanStep[]
  doneSteps: Set<number>
  daysToExam: number
  streak: number
  /** Day numbers with at least one finished session. */
  practicedDays: Set<number>
  today: number
  /** Free tier: one mini-test a day, and "practise more" leads to the plans. */
  freeTier: boolean
  onStartStep: (step: PlanStep, index: number) => void
  onPractice: () => void
}

const WEEKDAY = ['S', 'M', 'T', 'O', 'T', 'F', 'L']

export function Home({ readiness, stats, plan, doneSteps, daysToExam, streak, practicedDays, today, freeTier, onStartStep, onPractice }: Props) {
  const weak = readiness.pValues < readiness.pTotal ? 'values' : 'total'
  const done = plan.filter((_, i) => doneSteps.has(i)).length
  const nextIndex = plan.findIndex((_, i) => !doneSteps.has(i))
  const allDone = plan.length > 0 && nextIndex === -1

  return (
    <div className="page">
      <header className="page-head">
        <h1>I dag</h1>
        <span className="muted">
          {daysToExam > 1 ? `${daysToExam} dage til prøven` : daysToExam === 1 ? 'Prøven er i morgen' : 'Prøven er i dag'}
        </span>
      </header>

      {/* Progress in plain counts, no promises: two rings side by side (similarity), then the
          expected score per requirement as twin tiles. The one holding you back is marked "Fokus". */}
      <section className="hero" aria-labelledby="progress-h">
        <p id="progress-h" className="hero-label">Din fremgang</p>
        <div className="count-rings">
          <Ring value={stats.covered / Math.max(stats.total, 1)} num={stats.covered} of={stats.total} label="Spørgsmål gennemgået" />
          <Ring
            value={stats.answers ? stats.correct / stats.answers : 0}
            num={stats.correct}
            of={stats.answers}
            label="Rigtige svar"
            good
          />
        </div>
        <p className="hero-label">Forventet til prøven</p>
        <div className="goal-tiles">
          <GoalTile label="I alt" value={readiness.expectedTotal} goal={36} max={45} focus={weak === 'total'} />
          <GoalTile label="Danske værdier" value={readiness.expectedValues} goal={4} max={5} focus={weak === 'values'} />
        </div>
      </section>

      {allDone ? (
        <section className="hero is-good">
          <p className="hero-label">Dagens plan</p>
          <p className="hero-title">Klaret for i dag.</p>
          <p className="hero-note">
            {freeTier
              ? 'Din næste mini-prøve er klar i morgen. Vil du øve mere i dag, er alle spørgsmål med i Basis.'
              : 'Planen for i morgen er klar, når du kommer tilbage.'}
          </p>
          <button type="button" className={freeTier ? 'primary' : 'secondary'} onClick={onPractice}>
            {freeTier ? 'Se abonnementer' : 'Træn mere'}
          </button>
        </section>
      ) : (
        <section className="summary" aria-labelledby="plan-h">
          <div className="page-head">
            <h2 id="plan-h" className="section-title">Dagens plan</h2>
            <span className="small muted">
              {done} af {plan.length} · ca. {plan.reduce((s, p) => s + p.minutes, 0)} min
            </span>
          </div>
          {/* One path (continuity): the steps hang on a single line. The action sits inside the
              current step (proximity, common region), so there is only one thing to press. */}
          <ol className="path">
            {plan.map((step, i) => {
              const state = doneSteps.has(i) ? 'is-done' : i === nextIndex ? 'is-current' : 'is-upcoming'
              const meta = `${step.topic ? `${topicById(step.topic).name.da} · ` : ''}${step.questionIds.length} spørgsmål · ${step.minutes} min`
              return (
                <li key={i} className={`path-step ${state}`}>
                  <span className="path-dot" aria-hidden>
                    {state === 'is-done' ? <Check size={14} /> : i + 1}
                  </span>
                  {state === 'is-current' ? (
                    <div className="path-body">
                      <span className="path-kicker">{done === 0 ? 'Start her' : 'Næste'}</span>
                      <span className="box-title">{STEP_TITLE[step.kind]}</span>
                      <span className="box-sub">{meta}</span>
                      <button type="button" className="primary wide" onClick={() => onStartStep(step, i)}>
                        Start · {step.minutes} min
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="path-body"
                      onClick={() => onStartStep(step, i)}
                      aria-label={`${STEP_TITLE[step.kind]}${state === 'is-done' ? ', klaret – tag igen' : ''}`}
                    >
                      <span className="box-title">{STEP_TITLE[step.kind]}</span>
                      <span className="box-sub">{state === 'is-done' ? 'Klaret' : meta}</span>
                    </button>
                  )}
                </li>
              )
            })}
          </ol>
        </section>
      )}

      {/* The habit is its own region, so it isn't read as part of today's plan. */}
      <section className="summary" aria-labelledby="week-h">
        <div className="page-head">
          <h2 id="week-h" className="section-title">Din uge</h2>
          <span className="small muted">
            {streak > 0 ? `${streak} ${streak === 1 ? 'dag' : 'dage'} i træk` : 'Ingen dage i træk endnu'}
          </span>
        </div>
        <Week practicedDays={practicedDays} today={today} />
      </section>
    </div>
  )
}

/** This calendar week, Monday to Sunday: practised days filled, today ringed, future days dashed. */
function Week({ practicedDays, today }: { practicedDays: Set<number>; today: number }) {
  // Day numbers count from 1 Jan 1970, a Thursday; Monday = 0 here.
  const monday = today - ((today + 3) % 7)
  const days = Array.from({ length: 7 }, (_, i) => monday + i)
  return (
    <ol className="week" aria-label={`Øvet ${days.filter((d) => practicedDays.has(d)).length} dage i denne uge`}>
      {days.map((d, i) => {
        const state = practicedDays.has(d) ? 'is-on' : d > today ? 'is-future' : d === today ? '' : 'is-missed'
        return (
          <li key={d} className={`day ${state} ${d === today ? 'is-today' : ''}`}>
            <span className="day-dot">{practicedDays.has(d) ? <Check size={14} /> : null}</span>
            <span className="day-label">{WEEKDAY[(i + 1) % 7]}</span>
          </li>
        )
      })}
    </ol>
  )
}

/** Expected score against the pass mark, which is drawn as a line on the bar. */
/** A count as a ring: the number inside, the share as the filled arc, the label underneath. */
function Ring({ value, num, of, label, good }: { value: number; num: number; of: number; label: string; good?: boolean }) {
  const r = 40
  const c = 2 * Math.PI * r
  return (
    <div className={`count-ring ${good ? 'is-good' : ''}`}>
      <div className="ring" role="img" aria-label={`${label}: ${num} af ${of}`}>
        <svg viewBox="0 0 96 96" width="96" height="96" aria-hidden>
          <circle className="ring-track" cx="48" cy="48" r={r} />
          {/* At 0 the round line cap would still draw a dot, so leave the fill out. */}
          {value > 0.005 && <circle className="ring-fill" cx="48" cy="48" r={r} strokeDasharray={c} strokeDashoffset={c * (1 - value)} />}
        </svg>
        <span className="ring-num" aria-hidden>
          {num}
          <small>/{of}</small>
        </span>
      </div>
      <span className="count-label">{label}</span>
    </div>
  )
}

/** One requirement: expected score, a bar with the pass mark, and the requirement. */
function GoalTile({ label, value, goal, max, focus }: { label: string; value: number; goal: number; max: number; focus: boolean }) {
  const shown = max > 10 ? Math.round(value) : Math.round(value * 10) / 10
  return (
    <div className={`goal-tile ${focus ? 'is-focus' : ''}`}>
      <div className="goal-tile-head">
        <span>{label}</span>
        {focus && <span className="goal-tile-tag">Fokus</span>}
      </div>
      <p className="goal-tile-num">
        {shown.toLocaleString('da-DK')}
        <small>/{max}</small>
      </p>
      <div className="meter goal-meter">
        <span style={{ width: `${(value / max) * 100}%` }} />
        <i className="mark" style={{ left: `${(goal / max) * 100}%` }} aria-hidden />
      </div>
      <p className="goal-tile-foot">
        krav <b>{goal}</b>
      </p>
    </div>
  )
}
