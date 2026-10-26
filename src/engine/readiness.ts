import type { Question, Section } from '../data/types'
import { topicById } from '../data/topics'
import { mastery, type CardState } from './srs'

/** Official layout of Indfødsretsprøven. */
export const EXAM_LAYOUT: Record<Section, number> = { material: 35, current: 5, values: 5 }
export const PASS_TOTAL = 36
export const PASS_VALUES = 4

export function binomial(n: number, p: number): number[] {
  const out = new Array(n + 1).fill(0)
  out[0] = 1
  for (let i = 0; i < n; i++) {
    for (let k = i + 1; k > 0; k--) out[k] = out[k] * (1 - p) + out[k - 1] * p
    out[0] *= 1 - p
  }
  return out
}

export function convolve(a: number[], b: number[]): number[] {
  const out = new Array(a.length + b.length - 1).fill(0)
  a.forEach((x, i) => b.forEach((y, j) => (out[i + j] += x * y)))
  return out
}

const tail = (dist: number[], from: number) => dist.slice(Math.max(0, from)).reduce((s, x) => s + x, 0)

export interface Readiness {
  pass: number
  pValues: number
  pTotal: number
  /** Expected correct answers on a full paper (0-45). Moves with every session, unlike `pass`. */
  expectedTotal: number
  /** Expected correct values answers (0-5). */
  expectedValues: number
  sectionMastery: Record<Section, number>
  answers: number
  confidence: 'low' | 'medium' | 'high'
}

/** Probability of passing, given per-section mastery: total ≥ 36 and values ≥ 4. */
export function passProbability(m: Record<Section, number>) {
  const values = binomial(EXAM_LAYOUT.values, m.values)
  const knowledge = convolve(binomial(EXAM_LAYOUT.material, m.material), binomial(EXAM_LAYOUT.current, m.current))
  let pass = 0
  for (let v = PASS_VALUES; v <= EXAM_LAYOUT.values; v++) pass += values[v] * tail(knowledge, PASS_TOTAL - v)
  return {
    pass,
    pValues: tail(values, PASS_VALUES),
    pTotal: tail(convolve(knowledge, values), PASS_TOTAL),
  }
}

export function readiness(questions: Question[], cards: Record<string, CardState>): Readiness {
  const sums: Record<Section, [number, number]> = { material: [0, 0], current: [0, 0], values: [0, 0] }
  for (const q of questions) {
    const s = topicById(q.topic).section
    sums[s][0] += mastery(cards[q.id])
    sums[s][1] += 1
  }
  const sectionMastery = Object.fromEntries(
    Object.entries(sums).map(([k, [sum, n]]) => [k, n ? sum / n : 0.5]),
  ) as Record<Section, number>

  const answers = Object.values(cards).reduce((s, c) => s + c.seen, 0)
  const confidence = answers < 20 ? 'low' : answers < 80 ? 'medium' : 'high'
  const expectedTotal = (Object.keys(EXAM_LAYOUT) as Section[]).reduce((s, k) => s + EXAM_LAYOUT[k] * sectionMastery[k], 0)
  const expectedValues = EXAM_LAYOUT.values * sectionMastery.values
  return { ...passProbability(sectionMastery), expectedTotal, expectedValues, sectionMastery, answers, confidence }
}

export function topicMastery(questions: Question[], cards: Record<string, CardState>, topic: string) {
  const qs = questions.filter((q) => q.topic === topic)
  if (!qs.length) return null
  return qs.reduce((s, q) => s + mastery(cards[q.id]), 0) / qs.length
}

/** Plain counts for Home: distinct questions answered out of the bank, and right answers out of all answers. */
export function practiceStats(questions: Question[], cards: Record<string, CardState>) {
  let covered = 0
  let answers = 0
  let correct = 0
  for (const q of questions) {
    const c = cards[q.id]
    if (!c || !c.seen) continue
    covered += 1
    answers += c.seen
    correct += c.correct
  }
  return { covered, total: questions.length, answers, correct }
}
