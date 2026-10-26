import type { Readiness } from '../engine/readiness'
import type { PlanStep } from '../engine/plan'
import { topicById } from '../data/topics'
import { Check } from './icons'
import { STEP_TITLE } from './ui'

interface Props {
  readiness: Readiness
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

const pct = (x: number) => Math.round(x * 100)
const WEEKDAY = ['S', 'M', 'T', 'O', 'T', 'F', 'L']

export function Home({ readiness, plan, doneSteps, daysToExam, streak, practicedDays, today, freeTier, onStartStep, onPractice }: Props) {
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

      {/* The goal: one figure on the page, as a ring. The two requirements sit underneath as
          twin tiles (similarity); the one holding you back is marked "Fokus" instead of a sentence. */}
      <section className="hero" aria-labelledby="readiness-h">
        <div className="ready-top">
          <Ring value={readiness.pass} />
          <div className="ready-meta">
            <p id="readiness-h" className="hero-label">Chance for at bestå</p>
            <Confidence level={readiness.confidence} answers={readiness.answers} />
          </div>
        </div>
        <div className="goal-tiles">
          <GoalTile label="Rigtige i alt" value={readiness.expectedTotal} goal={36} max={45} focus={weak === 'total'} />
          <GoalTile label="Værdispørgsmål" value={readiness.expectedValues} goal={4} max={5} focus={weak === 'values'} />
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
/** Pass chance as a ring with the percentage inside; green once it is likely (70 % or more). */
function Ring({ value }: { value: number }) {
  const r = 44
  const c = 2 * Math.PI * r
  return (
    <div className={`ring ${value >= 0.7 ? 'is-good' : ''}`} role="img" aria-label={`${pct(value)} % chance for at bestå`}>
      <svg viewBox="0 0 104 104" width="104" height="104" aria-hidden>
        <circle className="ring-track" cx="52" cy="52" r={r} />
        {/* At 0 % the round line cap would still draw a dot, so leave the fill out. */}
        {pct(value) > 0 && <circle className="ring-fill" cx="52" cy="52" r={r} strokeDasharray={c} strokeDashoffset={c * (1 - value)} />}
      </svg>
      <span className="ring-num" aria-hidden>
        {pct(value)}
        <small>%</small>
      </span>
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

function Confidence({ level, answers }: { level: Readiness['confidence']; answers: number }) {
  const on = level === 'low' ? 1 : level === 'medium' ? 2 : 3
  const label = level === 'low' ? 'Foreløbigt' : level === 'medium' ? 'Rimeligt sikkert' : 'Sikkert'
  return (
    <span className="glass-chip" title={`Bygger på ${answers} svar`}>
      <span className="dots" aria-hidden>
        {[1, 2, 3].map((n) => (
          <i key={n} className={n <= on ? 'on' : ''} />
        ))}
      </span>
      {label}
    </span>
  )
}
