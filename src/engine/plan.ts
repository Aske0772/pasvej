import type { Question } from '../data/types'
import { TOPICS } from '../data/topics'
import { isDue, type CardState } from './srs'
import { topicMastery } from './readiness'
import { shuffle } from './exam'

export type StepKind = 'review' | 'weakest' | 'new' | 'mini-exam'

export interface PlanStep {
  kind: StepKind
  minutes: number
  questionIds: string[]
  topic?: string
}

const SECONDS_PER_QUESTION = 30
const take = (ids: string[], minutes: number) => ids.slice(0, Math.max(1, Math.floor((minutes * 60) / SECONDS_PER_QUESTION)))

/**
 * Today's plan: due reviews first, then the weakest topic, then new material.
 * In the final week before the exam no new material is introduced.
 * `questions` should already be limited to those relevant for the exam date.
 */
export function buildPlan(
  questions: Question[],
  cards: Record<string, CardState>,
  today: number,
  daysToExam: number,
  dailyMinutes: number,
): PlanStep[] {
  const pool = questions
  const steps: PlanStep[] = []
  let budget = dailyMinutes

  const due = pool.filter((q) => isDue(cards[q.id], today)).map((q) => q.id)
  if (due.length) {
    const ids = take(due, Math.min(5, budget))
    steps.push({ kind: 'review', minutes: Math.ceil((ids.length * SECONDS_PER_QUESTION) / 60), questionIds: ids })
    budget -= steps[0].minutes
  }

  const ranked = TOPICS.map((t) => ({ t, m: topicMastery(pool, cards, t.id) }))
    .filter((x): x is { t: (typeof TOPICS)[number]; m: number } => x.m !== null)
    .sort((a, b) => a.m - b.m)
  if (budget > 0 && ranked.length) {
    const topic = ranked[0].t.id
    const ids = take(shuffle(pool.filter((q) => q.topic === topic).map((q) => q.id)), Math.min(4, budget))
    steps.push({ kind: 'weakest', minutes: Math.ceil((ids.length * SECONDS_PER_QUESTION) / 60), questionIds: ids, topic })
    budget -= steps[steps.length - 1].minutes
  }

  const finalWeek = daysToExam <= 7
  const unseen = pool.filter((q) => !cards[q.id]).map((q) => q.id)
  if (budget > 0 && unseen.length && !finalWeek) {
    const ids = take(shuffle(unseen), Math.min(4, budget))
    steps.push({ kind: 'new', minutes: Math.ceil((ids.length * SECONDS_PER_QUESTION) / 60), questionIds: ids })
    budget -= steps[steps.length - 1].minutes
  }

  if (budget >= 3 || finalWeek) {
    const ids = take(shuffle(pool.map((q) => q.id)), Math.max(3, budget))
    steps.push({ kind: 'mini-exam', minutes: Math.ceil((ids.length * SECONDS_PER_QUESTION) / 60), questionIds: ids })
  }
  return steps
}
