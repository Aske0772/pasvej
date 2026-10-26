import type { Question, Section } from '../data/types'
import { CHAPTER_QUOTA, topicById } from '../data/topics'
import { EXAM_LAYOUT, PASS_TOTAL, PASS_VALUES } from './readiness'

export const shuffle = <T,>(xs: T[]): T[] => {
  const a = [...xs]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/**
 * Shuffles answer options so their position can't be memorised. Ja/Nej and
 * ordered options (years, percentages) keep their order, as on the exam.
 */
export function withShuffledOptions(q: Question): Question {
  if (q.fixedOrder) return q
  const order = shuffle(q.options.map((_, i) => i))
  return { ...q, options: order.map((i) => q.options[i]), answer: order.indexOf(q.answer) }
}

/**
 * Whether a question can come up at the sitting on `examDate` (ISO). Current
 * affairs only count if the event falls in the six months before the exam.
 */
export const isActive = (q: Question, examDate: string) =>
  !q.validUntil || (q.validUntil >= examDate && (!q.eventDate || q.eventDate <= examDate))

export interface ExamPaper {
  ids: string[]
  minutes: number
  passTotal: number
  passValues: number
  valuesCount: number
  currentCount: number
}

/**
 * Material questions in chapter order, filling each chapter up to its quota
 * first and topping up from any chapter if one runs short.
 */
function pickMaterial(pool: Question[], total: number): Question[] {
  const chapters = Object.keys(CHAPTER_QUOTA)
  const byChapter = Object.fromEntries(chapters.map((c) => [c, shuffle(pool.filter((q) => q.topic === c))]))
  const picked = chapters.flatMap((c) => byChapter[c].slice(0, CHAPTER_QUOTA[c]))
  const rest = shuffle(chapters.flatMap((c) => byChapter[c].slice(CHAPTER_QUOTA[c])))
  const all = [...picked, ...rest].slice(0, total)
  return chapters.flatMap((c) => all.filter((q) => q.topic === c))
}

/**
 * Builds a paper with the official layout: questions 1-35 from the material
 * (weighted by chapter), then current affairs, then values. With a small bank
 * the paper shrinks and the pass marks scale with it.
 */
export function buildExam(questions: Question[], examDate: string): ExamPaper {
  const pool = questions.filter((q) => isActive(q, examDate))
  const bySection = (s: Section) => shuffle(pool.filter((q) => topicById(q.topic).section === s))
  const values = bySection('values').slice(0, EXAM_LAYOUT.values)
  const current = bySection('current').slice(0, EXAM_LAYOUT.current)
  const material = pickMaterial(bySection('material'), EXAM_LAYOUT.material)
  const ids = [...material, ...current, ...values].map((q) => q.id)
  const scale = ids.length / 45
  return {
    ids,
    minutes: ids.length,
    passTotal: Math.ceil(PASS_TOTAL * scale),
    passValues: values.length === EXAM_LAYOUT.values ? PASS_VALUES : Math.max(0, values.length - 1),
    valuesCount: values.length,
    currentCount: current.length,
  }
}
