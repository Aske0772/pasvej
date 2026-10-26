import { useEffect, useMemo, useState } from 'react'
import { QUESTIONS } from './data/questions'
import { TOPICS, topicById } from './data/topics'
import { buildExam, isActive, shuffle, type ExamPaper } from './engine/exam'
import { buildPlan, type PlanStep } from './engine/plan'
import { readiness } from './engine/readiness'
import { dayNumber } from './engine/srs'
import { daysUntil, nextOpenSitting, streak, useAppState } from './store'
import { Exam } from './views/Exam'
import { Home } from './views/Home'
import { Book, Calendar, Clock, Home as HomeIcon, User } from './views/icons'
import { Onboarding } from './views/Onboarding'
import { Practice } from './views/Practice'
import { Profile } from './views/Profile'
import { Session } from './views/Session'
import { STEP_TITLE } from './views/ui'

type Tab = 'home' | 'practice' | 'exam' | 'profile'
type Overlay =
  | { kind: 'session'; title: string; ids: string[]; logKind: string }
  | { kind: 'exam'; paper: ExamPaper }
  | null

function diagnosticIds() {
  const values = shuffle(QUESTIONS.filter((q) => topicById(q.topic).section === 'values')).slice(0, 3)
  const material = shuffle(QUESTIONS.filter((q) => topicById(q.topic).section === 'material')).slice(0, 7)
  return shuffle([...material, ...values]).map((q) => q.id)
}

export function App() {
  const { state, setProfile, answer, logSession, setPlan, reset } = useAppState()
  const [tab, setTab] = useState<Tab>('home')
  const [overlay, setOverlay] = useState<Overlay>(null)
  const today = dayNumber()

  const examDate = state.profile?.examDate ?? nextOpenSitting().date
  // Only questions that can come up at the learner's sitting (current affairs expire).
  const relevant = useMemo(() => QUESTIONS.filter((q) => isActive(q, examDate)), [examDate])
  const r = useMemo(() => readiness(relevant, state.cards), [relevant, state.cards])
  const daysToExam = state.profile ? daysUntil(state.profile.examDate) : 0

  // A saved plan is stale if it is from another day or points at questions or
  // topics that no longer exist after a question-bank update.
  const planIsValid =
    state.plan?.day === today &&
    state.plan.steps.every(
      (s) => (!s.topic || TOPICS.some((t) => t.id === s.topic)) && s.questionIds.every((id) => QUESTIONS.some((q) => q.id === id)),
    )

  // Build today's plan when the home screen is shown and no valid one exists.
  useEffect(() => {
    if (state.profile && !overlay && !planIsValid) {
      setPlan({ day: today, steps: buildPlan(relevant, state.cards, today, daysToExam, state.profile.dailyMinutes) })
    }
  }, [state.profile, planIsValid, relevant, state.cards, overlay, today, daysToExam, setPlan])
  const plan: PlanStep[] = planIsValid && state.plan ? state.plan.steps : []
  const doneSteps = new Set(
    state.log.filter((l) => l.day === today && l.kind.startsWith('plan:')).map((l) => Number(l.kind.slice(5))),
  )

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
          ? { label: 'Se din plan', start: () => setOverlay(null) }
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
            examDate={state.profile.examDate}
            streak={streak(state.log)}
            practicedDays={new Set(state.log.map((l) => l.day))}
            today={today}
            onStartStep={(step, i) => startSession('Dagens plan', step.questionIds, `plan:${i}`)}
            onPractice={() => setTab('practice')}
          />
        )
      case 'practice':
        return (
          <Practice
            cards={state.cards}
            questions={relevant}
            examDate={examDate}
            onStart={(title, ids) => startSession(title, ids)}
          />
        )
      case 'exam':
        return <ExamIntro examDate={examDate} onStart={(paper) => setOverlay({ kind: 'exam', paper })} />
      case 'profile':
        return (
          <Profile
            profile={state.profile}
            onChange={(p) => {
              setProfile(p)
              setPlan(null)
            }}
            onReset={reset}
          />
        )
    }
  })()

  if (!state.profile) return content

  const showChrome = !overlay

  return (
    <div className="app">
      {showChrome && (
        <header className="topbar">
          <span className="brand">Pasvej</span>
          <span className="pill">
            <Calendar size={18} />
            {daysToExam > 0 ? `${daysToExam} dage` : 'I dag'}
          </span>
        </header>
      )}
      <main className="main">{content}</main>
      {showChrome && <TabBar tab={tab} onTab={setTab} />}
    </div>
  )
}

function ExamIntro({ examDate, onStart }: { examDate: string; onStart: (paper: ExamPaper) => void }) {
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

      <button type="button" className="primary wide" onClick={() => onStart(buildExam(QUESTIONS, examDate))}>
        Start prøven
      </button>
    </div>
  )
}

const TABS: { id: Tab; label: string; Icon: (p: { size?: number }) => JSX.Element }[] = [
  { id: 'home', label: 'Hjem', Icon: HomeIcon },
  { id: 'practice', label: 'Øv', Icon: Book },
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
