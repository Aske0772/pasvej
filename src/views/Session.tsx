import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import type { Lang } from '../data/types'
import { QUESTIONS } from '../data/questions'
import { sourceLabel } from '../data/source'
import { topicById } from '../data/topics'
import { withShuffledOptions } from '../engine/exam'
import { Check, Flame, Link, Redo, X } from './icons'
import { buzz } from './ui'

const KEYS = ['A', 'B', 'C', 'D']
const LANG_NAME: Record<Lang, string> = { da: 'Dansk', en: 'English' }
/** Correct answers in a row before the streak badge shows. */
const COMBO_FROM = 3
/** From here the badge burns brighter. */
const COMBO_HOT = 5
/** Particles in the burst on a correct answer: alternating white, green and red. */
const BURST = Array.from({ length: 12 }, (_, k) => ({ a: `${k * 30}deg`, c: ['#fff', 'var(--good)', '#ff3b55'][k % 3], d: `${26 + (k % 3) * 8}px` }))

interface Props {
  title: string
  questionIds: string[]
  helpLang: Lang | null
  /** Expected score out of 45 right now; the value at the start is kept to show progress at the end. */
  score: number
  /** Where to go after the result, e.g. the next step of today's plan. */
  next?: { label: string; start: () => void }
  onAnswer: (id: string, correct: boolean) => void
  onDone: (correct: number, total: number) => void
  onExit: () => void
}

const one = (x: number) => x.toLocaleString("da-DK", { minimumFractionDigits: 1, maximumFractionDigits: 1 })

export function Session({ title, questionIds, helpLang, score, next, onAnswer, onDone, onExit }: Props) {
  const questions = useMemo(
    () => questionIds.map((id) => withShuffledOptions(QUESTIONS.find((q) => q.id === id)!)),
    [questionIds],
  )
  const [scoreBefore] = useState(score)
  const [index, setIndex] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const [results, setResults] = useState<boolean[]>([])
  const [finished, setFinished] = useState(false)

  const q = questions[index]
  const correctCount = results.filter(Boolean).length
  const combo = results.length - 1 - results.lastIndexOf(false)

  const pick = (i: number) => {
    if (picked !== null) return
    setPicked(i)
    const ok = i === q.answer
    // A longer tick once a streak is running, so the run is felt as well as seen.
    buzz(ok ? (combo + 1 >= COMBO_FROM ? [14, 50, 22] : 14) : [30, 40, 30])
    setResults((r) => [...r, ok])
    onAnswer(q.id, ok)
  }

  const advance = () => {
    if (index + 1 < questions.length) {
      setIndex(index + 1)
      setPicked(null)
    } else {
      setFinished(true)
      onDone(correctCount, questions.length)
    }
  }

  if (finished) {
    return (
      <Result
        title={title}
        questions={questions}
        results={results}
        scoreBefore={scoreBefore}
        scoreAfter={score}
        next={next}
        onExit={onExit}
      />
    )
  }

  const answered = picked !== null
  return (
    <div className="q-screen">
      <div className="q-top">
        <button type="button" className="round" aria-label="Afbryd" onClick={onExit}>
          <X size={18} />
        </button>
        <div className="segments thin" aria-hidden>
          {questions.map((_, i) => (
            <span key={i} className={i < results.length ? (results[i] ? 'is-ok' : 'is-no') : i === index ? 'is-now' : ''} />
          ))}
        </div>
        <span className="q-count">
          {index + 1}/{questions.length}
        </span>
      </div>

      <div className="page flush-bottom">
        <section className="hero is-ink q-card">
          <div className="hero-chips">
            <span className="glass-chip">{topicById(q.topic).name.da}</span>
            {combo >= COMBO_FROM && (
              // Keyed on the count so the badge pops and shines each time the run grows.
              <span key={combo} className={`streak ${combo >= COMBO_HOT ? 'is-hot' : ''}`} aria-live="polite">
                <Flame size={16} />
                <b>{combo}</b> rigtige i træk
              </span>
            )}
          </div>
          <p className="hero-title">{q.prompt}</p>
        </section>

        <div className="options" role="group" aria-label="Svarmuligheder">
          {q.options.map((opt, i) => {
            const state = !answered ? '' : i === q.answer ? 'is-correct' : i === picked ? 'is-wrong' : 'is-dim'
            // Only a right pick celebrates; revealing the answer after a wrong pick stays quiet.
            const win = state === 'is-correct' && picked === i
            return (
              <button key={i} type="button" className={`option ${state} ${win ? 'is-win' : ''}`} disabled={answered} onClick={() => pick(i)}>
                <span className="key">{KEYS[i]}</span>
                <span>{opt}</span>
                <span className="check">
                  {state === 'is-correct' ? <Check size={14} /> : state === 'is-wrong' ? <X size={14} /> : null}
                  {win && (
                    <span className="burst" aria-hidden>
                      {BURST.map((b, k) => (
                        <i key={k} style={{ '--a': b.a, '--c': b.c, '--d': b.d } as CSSProperties} />
                      ))}
                    </span>
                  )}
                </span>
              </button>
            )
          })}
        </div>

        {answered && (
          <div className={`summary explain ${picked === q.answer ? 'is-ok' : 'is-no'}`} aria-live="polite">
            <p className={`verdict ${picked === q.answer ? 'ok' : 'no'}`}>
              {picked === q.answer ? 'Rigtigt' : `Ikke helt – svaret er ${KEYS[q.answer]}`}
            </p>
            <p>{q.explain.da}</p>
            {helpLang && helpLang !== 'da' && (
              <p className="translation">
                <span className="tag">{LANG_NAME[helpLang]}</span>
                {q.explain[helpLang]}
              </p>
            )}
            <p className="source">
              Kilde:{' '}
              {q.sourceUrl ? (
                <a href={q.sourceUrl} target="_blank" rel="noreferrer">
                  {sourceLabel(q)} <Link size={12} />
                </a>
              ) : (
                sourceLabel(q)
              )}
            </p>
          </div>
        )}
      </div>

      <div className="actions">
        {answered ? (
          <button type="button" className="primary" onClick={advance}>
            {index + 1 < questions.length ? 'Næste' : 'Se resultat'}
          </button>
        ) : (
          <p className="small muted center" style={{ flex: 1 }}>
            Vælg et svar
          </p>
        )}
      </div>
    </div>
  )
}

function Result({
  title,
  questions,
  results,
  scoreBefore,
  scoreAfter,
  next,
  onExit,
}: {
  title: string
  questions: { id: string; prompt: string; options: string[]; answer: number }[]
  results: boolean[]
  scoreBefore: number
  scoreAfter: number
  next?: Props['next']
  onExit: () => void
}) {
  const correct = results.filter(Boolean).length
  const wrong = questions.filter((_, i) => !results[i])
  const perfect = wrong.length === 0
  const delta = Math.round((scoreAfter - scoreBefore) * 10) / 10
  // Start the bar at the old value, then let it grow to the new one.
  const [shown, setShown] = useState(scoreBefore)
  useEffect(() => {
    const t = setTimeout(() => setShown(scoreAfter), 250)
    return () => clearTimeout(t)
  }, [scoreAfter])
  const w = (x: number) => `${(x / 45) * 100}%`

  return (
    <div className="q-screen">
      <div className="page" style={{ paddingTop: 16 }}>
        <section className={`hero ${perfect ? 'is-good' : 'is-ink'}`}>
          <p className="hero-label">{title}</p>
          <p className="hero-num" aria-label={`${correct} af ${questions.length} rigtige`}>
            {correct}
            <small>/{questions.length}</small>
          </p>
          {/* One cell per question, in the order they came: the result at a glance. */}
          <ol className="answer-strip" style={{ '--n': Math.min(questions.length, 10) } as CSSProperties} aria-hidden>
            {results.map((r, i) => (
              <li key={i} className={r ? 'is-right' : 'is-wrong'} style={{ '--i': i } as CSSProperties}>
                {r ? <Check size={14} /> : <X size={14} />}
              </li>
            ))}
          </ol>

          <div className="req">
            <div className="req-head">
              <span>Du står til</span>
              <b>
                {delta !== 0 && (
                  <span className="delta">
                    {delta > 0 ? '↑' : '↓'} {one(Math.abs(delta))}
                  </span>
                )}
                {one(scoreAfter)}
                <small> /45</small>
              </b>
            </div>
            <div className="meter meter-ghost goal-meter">
              <span className="was" style={{ width: w(scoreBefore) }} />
              <span style={{ width: w(shown) }} />
              <i className="mark" style={{ left: w(36) }} aria-hidden />
            </div>
            {/* Right under the bar it explains the mark, so the gap to 36 is plain. */}
            <p className="req-note">Til prøven skal du have <b>36</b> af <b>45</b> rigtige.</p>
          </div>

          <span className="glass-chip result-chip">
            {perfect ? <Check size={14} /> : <Redo size={14} />}
            {perfect ? 'Alt rigtigt' : `${wrong.length} fejl kommer igen`}
          </span>
        </section>

        {wrong.length > 0 && (
          <>
            <h2 className="group-title">Det skal du huske</h2>
            <ul className="box-list">
              {wrong.map((w) => (
                <li key={w.id} className="box">
                  <span className="box-text">
                    <span className="box-title">{w.prompt}</span>
                    <span className="answer-line">{w.options[w.answer]}</span>
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
      <div className="actions">
        {next ? (
          <>
            <button type="button" className="secondary" onClick={onExit}>
              Hjem
            </button>
            <button type="button" className="primary" onClick={next.start}>
              {next.label}
            </button>
          </>
        ) : (
          <button type="button" className="primary" onClick={onExit}>
            Tilbage
          </button>
        )}
      </div>
    </div>
  )
}
