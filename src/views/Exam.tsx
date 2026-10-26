import { useEffect, useMemo, useState } from 'react'
import { QUESTIONS } from '../data/questions'
import { sourceLabel } from '../data/source'
import { TOPICS, topicById } from '../data/topics'
import { withShuffledOptions, type ExamPaper } from '../engine/exam'
import { Check, Clock, X } from './icons'
import { buzz } from './ui'

const KEYS = ['A', 'B', 'C', 'D']

interface Props {
  paper: ExamPaper
  onAnswer: (id: string, correct: boolean) => void
  onDone: (correct: number, total: number) => void
  onExit: () => void
}

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

export function Exam({ paper, onAnswer, onDone, onExit }: Props) {
  const questions = useMemo(
    () => paper.ids.map((id) => withShuffledOptions(QUESTIONS.find((q) => q.id === id)!)),
    [paper],
  )
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<(number | null)[]>(() => questions.map(() => null))
  const [secondsLeft, setSecondsLeft] = useState(paper.minutes * 60)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    if (submitted) return
    if (secondsLeft <= 0) {
      submit()
      return
    }
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000)
    return () => clearTimeout(t)
  })

  function submit() {
    if (submitted) return
    let correct = 0
    questions.forEach((q, i) => {
      const ok = answers[i] === q.answer
      if (ok) correct++
      onAnswer(q.id, ok)
    })
    buzz([20, 60, 20])
    setSubmitted(true)
    onDone(correct, questions.length)
  }

  if (submitted) {
    const isOk = (i: number) => answers[i] === questions[i].answer
    const total = questions.filter((_, i) => isOk(i)).length
    const valuesOk = questions.filter((q, i) => topicById(q.topic).section === 'values' && isOk(i)).length
    const passedTotal = total >= paper.passTotal
    const passedValues = valuesOk >= paper.passValues
    const passed = passedTotal && passedValues
    const byTopic = TOPICS.map((t) => {
      const idx = questions.map((q, i) => (q.topic === t.id ? i : -1)).filter((i) => i >= 0)
      return { t, n: idx.length, ok: idx.filter(isOk).length }
    }).filter((x) => x.n > 0)

    return (
      <div className="q-screen">
        <div className="page" style={{ paddingTop: 16 }}>
          <section className={`hero ${passed ? 'is-good' : 'is-ink'}`}>
            {passed && (
              <span className="stamp" aria-hidden>
                BESTÅET
              </span>
            )}
            <p className="hero-label">{passed ? 'Prøveresultat' : 'Prøveresultat · Ikke bestået endnu'}</p>
            <p className="hero-num">
              {total}
              <small>af {questions.length} rigtige</small>
            </p>
            <Requirement label={`Mindst ${paper.passTotal} rigtige i alt`} value={total} target={paper.passTotal} max={questions.length} />
            <Requirement
              label={`Mindst ${paper.passValues} af ${paper.valuesCount} værdispørgsmål`}
              value={valuesOk}
              target={paper.passValues}
              max={paper.valuesCount}
            />
          </section>

          <section className="summary">
            <h2 className="section-title">Pr. tema</h2>
            {byTopic.map(({ t, n, ok }) => (
              <div key={t.id} className="req">
                <div className="req-head">
                  <span>{t.name.da}</span>
                  <b>
                    {ok}/{n}
                  </b>
                </div>
                <div className={`meter ${ok === n ? 'is-good' : ''}`}>
                  <span style={{ width: `${(ok / n) * 100}%` }} />
                </div>
              </div>
            ))}
          </section>

          {/* Mistakes grouped by chapter, so what to read is one region per chapter (proximity). */}
          {byTopic
            .filter(({ n, ok }) => ok < n)
            .map(({ t }) => (
              <section key={t.id} className="box-list">
                <h2 className="group-title">Læs op på · {t.name.da}</h2>
                {questions.map((wq, i) =>
                  wq.topic !== t.id || isOk(i) ? null : (
                    <div key={wq.id} className="box">
                      <span className="box-text">
                        <span className="box-title">{wq.prompt}</span>
                        <span className="answer-line">{wq.options[wq.answer]}</span>
                        <span className="source">{sourceLabel(wq)}</span>
                      </span>
                    </div>
                  ),
                )}
              </section>
            ))}
        </div>
        <div className="actions">
          <button type="button" className="primary" onClick={onExit}>
            Tilbage til forsiden
          </button>
        </div>
      </div>
    )
  }

  const q = questions[index]
  const answeredCount = answers.filter((a) => a !== null).length
  const last = index + 1 === questions.length

  return (
    <div className="q-screen">
      <div className="q-top">
        <button type="button" className="round" aria-label="Afbryd prøve" onClick={onExit}>
          <X size={18} />
        </button>
        <div className="meter" style={{ flex: 1 }} aria-hidden>
          <span style={{ width: `${(answeredCount / questions.length) * 100}%` }} />
        </div>
        <span className={`pill ${secondsLeft < 120 ? 'is-low' : ''}`} aria-label="Tid tilbage">
          <Clock size={16} />
          {fmt(secondsLeft)}
        </span>
      </div>

      <div className="page flush-bottom">
        <section className="hero is-ink">
          <div className="hero-chips">
            <span className="glass-chip">
              {index + 1} af {questions.length}
            </span>
            <span className="glass-chip">{topicById(q.topic).name.da}</span>
          </div>
          <p className="hero-title">{q.prompt}</p>
        </section>

        <div className="options" role="radiogroup" aria-label="Svarmuligheder">
          {q.options.map((opt, i) => {
            const on = answers[index] === i
            return (
              <button
                key={i}
                type="button"
                role="radio"
                aria-checked={on}
                className={`option ${on ? 'is-picked' : ''}`}
                onClick={() => setAnswers((a) => a.map((x, j) => (j === index ? i : x)))}
              >
                <span className="key">{KEYS[i]}</span>
                <span>{opt}</span>
                <span className="check">{on && <Check size={14} />}</span>
              </button>
            )
          })}
        </div>

        <section className="summary">
          <div className="page-head">
            <span className="small muted">
              {answeredCount} af {questions.length} besvaret
            </span>
            <button type="button" className="small" style={{ fontWeight: 650, textDecoration: 'underline' }} onClick={submit}>
              Aflevér nu
            </button>
          </div>
          <div className="grid-nav">
            {questions.map((_, i) => (
              <button
                key={i}
                type="button"
                className={`${answers[i] !== null ? 'is-answered' : ''} ${i === index ? 'is-current' : ''}`}
                onClick={() => setIndex(i)}
                aria-label={`Gå til spørgsmål ${i + 1}`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </section>
      </div>

      <div className="actions">
        <button type="button" className="secondary" disabled={index === 0} onClick={() => setIndex(index - 1)}>
          Forrige
        </button>
        <button type="button" className="primary" onClick={() => (last ? submit() : setIndex(index + 1))}>
          {last ? 'Aflevér' : 'Næste'}
        </button>
      </div>
    </div>
  )
}

function Requirement({ label, value, target, max }: { label: string; value: number; target: number; max: number }) {
  const ok = value >= target
  return (
    <div className="req">
      <div className="req-head">
        <span>{label}</span>
        <b>{ok ? `${value} ✓` : `${value} · mangler ${target - value}`}</b>
      </div>
      <div className={`meter ${ok ? '' : 'is-no'}`}>
        <span style={{ width: `${(value / max) * 100}%` }} />
      </div>
    </div>
  )
}
