import { binomial, passProbability, practiceStats, readiness } from './readiness'
import { review, mastery, INTERVALS } from './srs'
import { buildExam, withShuffledOptions } from './exam'
import { buildFreePlan, buildPlan } from './plan'
import { FREE_DAILY_QUESTIONS, PLANS, access } from '../data/plans'
import { QUESTIONS } from '../data/questions'
import { CHAPTER_QUOTA, topicById } from '../data/topics'
import { CURRENT, addMonths } from '../data/current'
import { isActive } from './exam'

const NOV_2026 = '2026-11-25'
const MAY_2027 = '2027-05-26'

describe('current affairs', () => {
  it('has well-formed, sourced items with unique ids', () => {
    expect(new Set(CURRENT.map((c) => c.id)).size).toBe(CURRENT.length)
    for (const c of CURRENT) {
      expect(c.id).toMatch(/^a-\d{4}-\d{2}-[a-z0-9-]+$/)
      expect(c.id.slice(2, 9)).toBe(c.event.slice(0, 7))
      expect(c.event).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(c.checked >= c.event).toBe(true)
      expect(c.sourceUrl).toMatch(/^https:\/\//)
      expect(c.answer).toBeLessThan(c.options.length)
    }
  })

  it('expires six months after the event, clamping to month end', () => {
    expect(addMonths('2026-06-03', 6)).toBe('2026-12-03')
    expect(addMonths('2026-08-31', 6)).toBe('2027-02-28')
    expect(addMonths('2026-11-25', -6)).toBe('2026-05-25')
  })

  it('only counts events from the six months before the exam', () => {
    const current = QUESTIONS.filter((q) => q.topic === 'aktuelt')
    expect(current.filter((q) => isActive(q, NOV_2026)).length).toBe(5)
    expect(current.filter((q) => isActive(q, MAY_2027)).length).toBe(0)
    // An event after the exam can't be asked about.
    expect(isActive({ ...current[0], eventDate: '2026-12-01', validUntil: '2027-06-01' }, NOV_2026)).toBe(false)
  })

  it('gives a full 45-question paper for November 2026', () => {
    const p = buildExam(QUESTIONS, NOV_2026)
    expect(p.ids.length).toBe(45)
    expect(p.currentCount).toBe(5)
    expect(p.passTotal).toBe(36)
  })
})

describe('readiness', () => {
  it('binomial sums to 1', () => {
    expect(binomial(45, 0.73).reduce((a, b) => a + b, 0)).toBeCloseTo(1, 10)
  })

  it('perfect knowledge passes, coin-flip knowledge fails', () => {
    expect(passProbability({ material: 1, current: 1, values: 1 }).pass).toBeCloseTo(1)
    expect(passProbability({ material: 0.5, current: 0.5, values: 0.5 }).pass).toBeLessThan(0.001)
  })

  it('expected score rises with every correct answer, even while the pass chance is still ~0', () => {
    const qs = QUESTIONS.filter((q) => q.topic !== 'aktuelt')
    const before = readiness(qs, {})
    const after = readiness(qs, { [qs[0].id]: review(undefined, true, 0) })
    expect(before.expectedTotal).toBeCloseTo(22.5, 1)
    expect(after.expectedTotal).toBeGreaterThan(before.expectedTotal)
    expect(after.pass).toBeLessThan(0.001)
  })

  it('weak values cap the pass chance even with strong knowledge', () => {
    const r = passProbability({ material: 0.95, current: 0.9, values: 0.6 })
    expect(r.pValues).toBeLessThan(0.4)
    expect(r.pass).toBeLessThanOrEqual(r.pValues)
    expect(r.pass).toBeLessThanOrEqual(r.pTotal)
  })

  it('counts distinct questions covered and right answers out of all answers', () => {
    const [a, b] = QUESTIONS
    const twice = review(review(undefined, false, 0), true, 1)
    const stats = practiceStats(QUESTIONS, { [a.id]: twice, [b.id]: review(undefined, true, 0) })
    expect(stats).toEqual({ covered: 2, total: QUESTIONS.length, answers: 3, correct: 2 })
  })
})

describe('srs', () => {
  it('climbs on correct answers and resets on mistakes', () => {
    let s = review(undefined, true, 100)
    s = review(s, true, 101)
    expect(s.box).toBe(2)
    expect(s.due).toBe(101 + INTERVALS[2])
    s = review(s, false, 103)
    expect(s.box).toBe(0)
    expect(s.due).toBe(103)
  })

  it('mastery rises with practice', () => {
    const fresh = mastery(undefined)
    let s = review(undefined, true, 0)
    for (let i = 1; i < 5; i++) s = review(s, true, i)
    expect(mastery(s)).toBeGreaterThan(fresh)
  })
})

describe('question bank', () => {
  it('has unique ids and valid answers with two or three options', () => {
    expect(new Set(QUESTIONS.map((q) => q.id)).size).toBe(QUESTIONS.length)
    for (const q of QUESTIONS) {
      expect([2, 3]).toContain(q.options.length)
      expect(q.answer).toBeGreaterThanOrEqual(0)
      expect(q.answer).toBeLessThan(q.options.length)
    }
  })

  it('ties every material question to a section in its own chapter and edition', () => {
    for (const q of QUESTIONS) {
      const t = topicById(q.topic)
      if (t.section === 'material') {
        expect(q.edition).toBe('2026-08')
        expect(q.source.startsWith(`${t.chapter}.`)).toBe(true)
      } else {
        expect(q.edition).toBeNull()
        expect(q.source.length).toBeGreaterThan(0)
      }
    }
  })

  it('covers every chapter and uses the exam formats', () => {
    for (const chapter of Object.keys(CHAPTER_QUOTA)) {
      expect(QUESTIONS.filter((q) => q.topic === chapter).length).toBeGreaterThanOrEqual(CHAPTER_QUOTA[chapter])
    }
    const yesNo = QUESTIONS.filter((q) => q.options.join() === 'Ja,Nej')
    expect(yesNo.length).toBeGreaterThanOrEqual(10)
    expect(yesNo.every((q) => q.fixedOrder)).toBe(true)
    expect(QUESTIONS.some((q) => q.prompt.startsWith('Cirka hvor'))).toBe(true)
  })

  it('keeps Ja/Nej and ordered options in place but shuffles the rest', () => {
    const yn = QUESTIONS.find((q) => q.fixedOrder)!
    expect(withShuffledOptions(yn).options).toEqual(yn.options)
    const free = QUESTIONS.find((q) => !q.fixedOrder)!
    const shuffled = withShuffledOptions(free)
    expect(shuffled.options[shuffled.answer]).toBe(free.options[free.answer])
  })
})

describe('exam and plan', () => {
  it('fills the material part by chapter quota', () => {
    const p = buildExam(QUESTIONS, MAY_2027)
    const topics = p.ids.map((id) => QUESTIONS.find((q) => q.id === id)!.topic)
    for (const [chapter, quota] of Object.entries(CHAPTER_QUOTA)) {
      expect(topics.filter((t) => t === chapter).length).toBe(quota)
    }
    expect(topics.slice(-5).every((t) => t === 'vaerdier')).toBe(true)
  })

  it('builds a paper that keeps the values section and scales the pass mark', () => {
    const p = buildExam(QUESTIONS, MAY_2027)
    expect(p.valuesCount).toBe(5)
    expect(p.passValues).toBe(4)
    expect(new Set(p.ids).size).toBe(p.ids.length)
    expect(p.passTotal).toBeLessThanOrEqual(p.ids.length)
  })

  it('skips new material in the final week', () => {
    const plan = buildPlan(QUESTIONS, {}, 0, 5, 15)
    expect(plan.some((s) => s.kind === 'new')).toBe(false)
    expect(plan.some((s) => s.kind === 'mini-exam')).toBe(true)
  })
})

describe('subscriptions', () => {
  it('gives the free tier one mini-test of 10 different questions a day', () => {
    const steps = buildFreePlan(QUESTIONS, {}, 0, FREE_DAILY_QUESTIONS)
    expect(steps).toHaveLength(1)
    expect(steps[0].kind).toBe('daily-free')
    expect(new Set(steps[0].questionIds).size).toBe(FREE_DAILY_QUESTIONS)
  })

  it('puts due mistakes first in the free mini-test', () => {
    const wrong = review(undefined, false, 5)
    const steps = buildFreePlan(QUESTIONS, { [QUESTIONS[3].id]: wrong }, 5, FREE_DAILY_QUESTIONS)
    expect(steps[0].questionIds[0]).toBe(QUESTIONS[3].id)
  })

  it('opens practice and the full exam only on paid plans, residence exams only on Plus', () => {
    expect(access('free')).toEqual({ practice: false, exam: false, fullPlan: false, residence: false })
    expect(access('basis')).toEqual({ practice: true, exam: true, fullPlan: true, residence: false })
    expect(access('plus').residence).toBe(true)
    expect(PLANS.map((p) => p.price)).toEqual([0, 59, 109])
    expect(PLANS.map((p) => p.level)).toEqual([1, 2, 3])
  })
})
