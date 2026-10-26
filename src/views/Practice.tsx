import type { Question } from '../data/types'
import { addMonths } from '../data/current'
import { TOPICS } from '../data/topics'
import type { CardState } from '../engine/srs'
import { topicMastery } from '../engine/readiness'
import { shuffle } from '../engine/exam'
import { Check, Lock } from './icons'

/** Topic mastery at which a chapter counts as mastered. */
const MASTERED = 0.8
import { formatDate, Panel } from './ui'

interface Props {
  cards: Record<string, CardState>
  /** Questions that can come up at the learner's sitting. */
  questions: Question[]
  examDate: string
  /** Free tier: themes and mistakes are visible but open the plans instead. */
  locked: boolean
  onLocked: () => void
  onStart: (title: string, ids: string[]) => void
}

const GROUPS = [
  { title: 'Lærematerialet', sections: ['material'] },
  { title: 'Uden for lærematerialet', sections: ['values', 'current'] },
]

export function Practice({ cards, questions, examDate, locked, onLocked, onStart }: Props) {
  const mistakes = questions.filter((q) => cards[q.id] && cards[q.id].box === 0).map((q) => q.id)

  return (
    <div className="page">
      <header className="page-head">
        <h1>Træn</h1>
        <span className="muted">{questions.length} spørgsmål</span>
      </header>

      {/* Title and count share one line, the explanation sits under them, the button closes the card. */}
      <Panel title="Dine fejl" sub="Spørgsmål, du har svaret forkert på for nylig" aside={<span className="panel-num">{mistakes.length}</span>}>
        {locked ? (
          <button type="button" className="primary wide" onClick={onLocked}>
            <Lock size={16} /> Træn dine fejl med Basis
          </button>
        ) : (
          <button type="button" className="primary wide" disabled={!mistakes.length} onClick={() => onStart('Dine fejl', shuffle(mistakes))}>
            {mistakes.length ? 'Træn dine fejl' : 'Ingen fejl lige nu'}
          </button>
        )}
      </Panel>

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
                  {qs.length > 0 && (
                    <span className="glass-chip tile-count">
                      {locked && <Lock size={12} />}
                      {qs.length} spm
                    </span>
                  )}
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
                <button
                  key={t.id}
                  type="button"
                  className={`tile ${locked ? 'is-locked' : ''}`}
                  aria-label={locked ? `${t.name.da} – låst, kræver Basis` : undefined}
                  onClick={() => (locked ? onLocked() : onStart(t.name.da, shuffle(qs.map((q) => q.id))))}
                >
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
