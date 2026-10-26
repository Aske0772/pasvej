import { useEffect, useMemo, useState } from 'react'
import { QUESTIONS } from './data/questions'
import { TOPICS, topicById } from './data/topics'
import { buildExam, isActive, shuffle, type ExamPaper } from './engine/exam'
import { FREE_DAILY_QUESTIONS, access, type Tier } from './data/plans'
import { buildFreePlan, buildPlan, type PlanStep } from './engine/plan'
import { readiness } from './engine/readiness'
import { dayNumber } from './engine/srs'
import { daysUntil, nextOpenSitting, streak, useAppState } from './store'
import { Exam } from './views/Exam'
import { Home } from './views/Home'
import { Book, Clock, Home as HomeIcon, User } from './views/icons'
import { Onboarding } from './views/Onboarding'
import { Paywall } from './views/Paywall'
import { Practice } from './views/Practice'
import { Profile } from './views/Profile'
import { Session } from './views/Session'
import { STEP_TITLE } from './views/ui'

type Tab = 'home' | 'practice' | 'exam' | 'profile'
type Overlay =
  | { kind: 'session'; title: string; ids: string[]; logKind: string }
  | { kind: 'exam'; paper: ExamPaper }
  | { kind: 'paywall'; focus?: Tier }
  | null

function diagnosticIds() {
  const values = shuffle(QUESTIONS.filter((q) => topicById(q.topic).section === 'values')).slice(0, 3)
  const material = shuffle(QUESTIONS.filter((q) => topicById(q.topic).section === 'material')).slice(0, 7)
  return shuffle([...material, ...values]).map((q) => q.id)
}

export function App() {
  const { state, setProfile, answer, logSession, setPlan, setSubscription, reset } = useAppState()
  const [tab, setTab] = useState<Tab>('home')
  const [overlay, setOverlay] = useState<Overlay>(null)
  const today = dayNumber()
  const tier = state.subscription
  const can = access(tier)
  const upsell = (focus: Tier = 'basis') => setOverlay({ kind: 'paywall', focus })

  const examDate = state.profile?.examDate ?? nextOpenSitting().date
  // Only questions that can come up at the learner's sitting (current affairs expire).
  const relevant = useMemo(() => QUESTIONS.filter((q) => isActive(q, examDate)), [examDate])
  const r = useMemo(() => readiness(relevant, state.cards), [relevant, state.cards])
  const daysToExam = state.profile ? daysUntil(state.profile.examDate) : 0

  // A saved plan is stale if it is from another day or points at questions or
  // topics that no longer exist after a question-bank update.
  const planIsValid =
    state.plan?.day === today &&
    (state.plan.tier ?? null) === tier &&
    state.plan.steps.every(
      (s) => (!s.topic || TOPICS.some((t) => t.id === s.topic)) && s.questionIds.every((id) => QUESTIONS.some((q) => q.id === id)),
    )

  // Build today's plan when the home screen is shown and no valid one exists.
  useEffect(() => {
    if (state.profile && !overlay && !planIsValid) {
      const steps = can.fullPlan
        ? buildPlan(relevant, state.cards, today, daysToExam, state.profile.dailyMinutes)
        : buildFreePlan(relevant, state.cards, today, FREE_DAILY_QUESTIONS)
      setPlan({ day: today, steps, tier: tier ?? undefined })
    }
  }, [state.profile, planIsValid, relevant, state.cards, overlay, today, daysToExam, setPlan, can.fullPlan, tier])
  const plan: PlanStep[] = planIsValid && state.plan ? state.plan.steps : []
  // The free mini-test is logged on its own, so upgrading the same day doesn't tick off a step.
  const doneSteps = can.fullPlan
    ? new Set(state.log.filter((l) => l.day === today && l.kind.startsWith('plan:')).map((l) => Number(l.kind.slice(5))))
    : new Set(state.log.some((l) => l.day === today && l.kind === 'daily-free') ? [0] : [])
  const firstTest = [...state.log].reverse().find((l) => l.kind === 'diagnostic')

  const startSession = (title: string, ids: string[], logKind = 'practice') =>
    setOverlay({ kind: 'session', title, ids, logKind })

  const content = (() => {
    if (!state.profile) {
      return (
        <Onboarding
          onDone={(p) => {
            setProfile(p)
            startSession('Diagnosetest', diagnosticIds(), 'diagnostic')
          }}
        />
      )
    }
    if (overlay?.kind === 'session') {
      // After a plan step, offer the next unfinished one so the day flows without going home.
      const current = overlay.logKind.startsWith('plan:') ? Number(overlay.logKind.slice(5)) : null
      const nextIndex = current === null ? -1 : plan.findIndex((_, j) => j !== current && !doneSteps.has(j))
      const next =
        overlay.logKind === 'diagnostic'
          ? { label: 'Fortsæt', start: () => setOverlay(null) }
          : nextIndex >= 0
            ? {
                label: `Næste: ${STEP_TITLE[plan[nextIndex].kind].toLowerCase()}`,
                start: () => startSession('Dagens plan', plan[nextIndex].questionIds, `plan:${nextIndex}`),
              }
            : undefined
      return (
        <Session
          key={overlay.ids.join()}
          title={overlay.title}
          questionIds={overlay.ids}
          helpLang={state.profile.helpLang}
          score={r.expectedTotal}
          next={next}
          onAnswer={answer}
          onDone={(c, t) => logSession(overlay.logKind, c, t)}
          onExit={() => setOverlay(null)}
        />
      )
    }
    if (overlay?.kind === 'paywall') {
      return (
        <Paywall
          focus={overlay.focus}
          current={tier}
          onChoose={(t) => {
            setSubscription(t)
            setOverlay(null)
          }}
          onClose={() => setOverlay(null)}
        />
      )
    }
    // Right after the first test (or for anyone who hasn't chosen yet), a plan must be picked.
    if (tier === null && !overlay) {
      return (
        <Paywall
          firstTest={firstTest ? { correct: firstTest.correct, total: firstTest.total } : undefined}
          current={null}
          onChoose={(t) => {
            setSubscription(t)
            setTab('home')
          }}
        />
      )
    }
    if (overlay?.kind === 'exam') {
      return (
        <Exam
          paper={overlay.paper}
          onAnswer={answer}
          onDone={(c, t) => logSession('exam', c, t)}
          onExit={() => {
            setOverlay(null)
            setTab('home')
          }}
        />
      )
    }
    switch (tab) {
      case 'home':
        return (
          <Home
            readiness={r}
            plan={plan}
            doneSteps={doneSteps}
            daysToExam={daysToExam}
            streak={streak(state.log)}
            practicedDays={new Set(state.log.map((l) => l.day))}
            today={today}
            freeTier={!can.fullPlan}
            onStartStep={(step, i) =>
              startSession(STEP_TITLE[step.kind], step.questionIds, can.fullPlan ? `plan:${i}` : 'daily-free')
            }
            onPractice={() => (can.practice ? setTab('practice') : upsell())}
          />
        )
      case 'practice':
        return (
          <Practice
            cards={state.cards}
            questions={relevant}
            examDate={examDate}
            locked={!can.practice}
            onLocked={() => upsell()}
            onStart={(title, ids) => startSession(title, ids)}
          />
        )
      case 'exam':
        return (
          <ExamIntro
            examDate={examDate}
            locked={!can.exam}
            onUnlock={() => upsell()}
            onStart={(paper) => setOverlay({ kind: 'exam', paper })}
          />
        )
      case 'profile':
        return (
          <Profile
            profile={state.profile}
            onChange={(p) => {
              setProfile(p)
              setPlan(null)
            }}
            tier={tier}
            onChangePlan={() => upsell(tier ?? 'basis')}
            onReset={reset}
          />
        )
    }
  })()

  if (!state.profile) return content

  const showChrome = !overlay && tier !== null

  return (
    <div className="app">
      {/* No header: each screen has its own large title, and the tab bar shows where you are. */}
      <main className="main">{content}</main>
      {showChrome && <TabBar tab={tab} onTab={setTab} />}
    </div>
  )
}

function ExamIntro({
  examDate,
  locked,
  onUnlock,
  onStart,
}: {
  examDate: string
  locked: boolean
  onUnlock: () => void
  onStart: (paper: ExamPaper) => void
}) {
  const paper = useMemo(() => buildExam(QUESTIONS, examDate), [examDate])
  const rows: [string, string][] = [
    ['Tid', `${paper.minutes} min`],
    ['Krav i alt', `${paper.passTotal} rigtige`],
    ['Værdikrav', `${paper.passValues} af ${paper.valuesCount}`],
    ['Aktuelle spørgsmål', `${paper.currentCount} af 5`],
  ]
  return (
    <div className="page">
      <header className="page-head">
        <h1>Prøve</h1>
        <span className="muted">Simulering</span>
      </header>

      <section className="hero is-ink">
        <p className="hero-label">Som på prøvedagen</p>
        <p className="hero-num">
          {paper.ids.length}
          <small>spørgsmål</small>
        </p>
        <p className="hero-note">
          Ét minut pr. spørgsmål og ingen svar undervejs. Du kan gå tilbage og ændre dine svar, før du afleverer.
        </p>
      </section>

      <section className="summary">
        {rows.map(([k, v]) => (
          <div key={k} className="req-head">
            <span>{k}</span>
            <b>{v}</b>
          </div>
        ))}
        {paper.ids.length < 45 && (
          <p className="small muted">
            Den rigtige prøve har 45 spørgsmål og kræver 36 rigtige.
            {paper.currentCount < 5 && ' Aktuelle spørgsmål til din prøvedato kommer løbende frem mod prøven.'} Prøven her er skaleret ned.
          </p>
        )}
      </section>

      {locked ? (
        <>
          <button type="button" className="primary wide" onClick={onUnlock}>
            Lås op med Basis
          </button>
          <p className="small muted center">Den fulde prøve er med i Basis og Plus. Gratis har 1 mini-prøve om dagen.</p>
        </>
      ) : (
        <button type="button" className="primary wide" onClick={() => onStart(buildExam(QUESTIONS, examDate))}>
          Start prøven
        </button>
      )}
    </div>
  )
}

const TABS: { id: Tab; label: string; Icon: (p: { size?: number }) => JSX.Element }[] = [
  { id: 'home', label: 'Hjem', Icon: HomeIcon },
  { id: 'practice', label: 'Træn', Icon: Book },
  { id: 'exam', label: 'Prøve', Icon: Clock },
  { id: 'profile', label: 'Profil', Icon: User },
]

function TabBar({ tab, onTab }: { tab: Tab; onTab: (t: Tab) => void }) {
  return (
    <nav className="tabbar" aria-label="Hovedmenu">
      {TABS.map(({ id, label, Icon }) => (
        <button
          key={id}
          type="button"
          className={`tab ${tab === id ? 'is-on' : ''}`}
          aria-current={tab === id ? 'page' : undefined}
          onClick={() => onTab(id)}
        >
          <Icon />
          <span className="tab-label">{label}</span>
        </button>
      ))}
    </nav>
  )
}
