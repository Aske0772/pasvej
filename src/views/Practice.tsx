import type { Question } from '../data/types'
import { addMonths } from '../data/current'
import { TOPICS } from '../data/topics'
import type { CardState } from '../engine/srs'
import { topicMastery } from '../engine/readiness'
import { shuffle } from '../engine/exam'
import { Check } from './icons'

/** Topic mastery at which a chapter counts as mastered. */
const MASTERED = 0.8
import { formatDate } from './ui'

interface Props {
  cards: Record<string, CardState>
  /** Questions that can come up at the learner's sitting. */
  questions: Question[]
  examDate: string
  onStart: (title: string, ids: string[]) => void
}

const GROUPS = [
  { title: 'Lærematerialet', sections: ['material'] },
  { title: 'Uden for lærematerialet', sections: ['values', 'current'] },
]

export function Practice({ cards, questions, examDate, onStart }: Props) {
  const mistakes = questions.filter((q) => cards[q.id] && cards[q.id].box === 0).map((q) => q.id)

  return (
    <div className="page">
      <header className="page-head">
        <h1>Øv</h1>
        <span className="muted">{questions.length} spørgsmål</span>
      </header>

      <section className="summary">
        <div className="page-head">
          <div>
            <h2 className="section-title">Dine fejl</h2>
            <p className="small muted">Spørgsmål, du har svaret forkert på for nylig</p>
          </div>
          <span className="display-num" style={{ fontSize: 34 }}>
            {mistakes.length}
          </span>
        </div>
        <button type="button" className="primary wide" disabled={!mistakes.length} onClick={() => onStart('Dine fejl', shuffle(mistakes))}>
          {mistakes.length ? 'Øv dine fejl' : 'Ingen fejl lige nu'}
        </button>
      </section>

      {GROUPS.map((g) => (
        <section key={g.title} className="box-list">
          <h2 className="group-title">{g.title}</h2>
          {/* Two-up grid of photo tiles: the same build for every theme (similarity). */}
          <div className="tile-grid">
            {TOPICS.filter((t) => g.sections.includes(t.section)).map((t) => {
              const qs = questions.filter((q) => q.topic === t.id)
              const m = topicMastery(qs, cards, t.id)
              const chips = (
                <span className="tile-chips">
                  {t.chapter && <span className="glass-chip">Kap. {t.chapter}</span>}
                  {qs.length > 0 && <span className="glass-chip tile-count">{qs.length} spm</span>}
                </span>
              )
              if (!qs.length) {
                return (
                  <div key={t.id} className="tile is-empty">
                    <TopicPhoto id={t.id} />
                    {chips}
                    <span className="tile-body">
                      <span className="tile-title">{t.name.da}</span>
                      <span className="tile-blurb">
                        Kommer løbende: nyheder fra {formatDate(addMonths(examDate, -6), { day: 'numeric', month: 'short' })} og frem.
                      </span>
                    </span>
                  </div>
                )
              }
              const mastered = m !== null && m >= MASTERED
              return (
                <button key={t.id} type="button" className="tile" onClick={() => onStart(t.name.da, shuffle(qs.map((q) => q.id)))}>
                  <TopicPhoto id={t.id} />
                  {chips}
                  <span className="tile-body">
                    <span className="tile-title">{t.name.da}</span>
                    <span className="tile-blurb">{t.blurb.da}</span>
                    {/* Progress and its number on one line, so they read as one thing (proximity). */}
                    <span className="topic-progress">
                      <span className="meter">
                        <span style={{ width: `${(m ?? 0) * 100}%` }} />
                      </span>
                      {mastered ? (
                        <span className="badge-done">
                          <Check size={12} /> Mestret
                        </span>
                      ) : (
                        <span className="box-sub">{Math.round((m ?? 0) * 100)} %</span>
                      )}
                    </span>
                  </span>
                </button>
              )
            })}
          </div>
        </section>
      ))}
    </div>
  )
}

/**
 * Photo that fills the theme card behind the text (AI-generated with Figma Weave, Nano Banana
 * 2.1), with a dark shade from the left so the white text stays readable. Decorative: the
 * title carries the meaning.
 */
function TopicPhoto({ id }: { id: string }) {
  return (
    <>
      <img
        className="photo-bg"
        src={`${import.meta.env.BASE_URL}topics/${id}.webp`}
        alt=""
        width={720}
        height={402}
        loading="lazy"
        decoding="async"
      />
      <span className="photo-shade" aria-hidden />
    </>
  )
}
