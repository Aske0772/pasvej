// Leitner-style spaced repetition. Days are counted as whole local days.

export interface CardState {
  box: number
  /** Day number when the card is next due. */
  due: number
  seen: number
  correct: number
}

export const INTERVALS = [0, 1, 2, 4, 8, 16]
export const MAX_BOX = INTERVALS.length - 1

export const dayNumber = (d: Date = new Date()) =>
  Math.floor((d.getTime() - d.getTimezoneOffset() * 60_000) / 86_400_000)

export function review(prev: CardState | undefined, correct: boolean, today: number): CardState {
  const s = prev ?? { box: 0, due: today, seen: 0, correct: 0 }
  const box = correct ? Math.min(s.box + 1, MAX_BOX) : 0
  return {
    box,
    due: today + INTERVALS[box],
    seen: s.seen + 1,
    correct: s.correct + (correct ? 1 : 0),
  }
}

export const isDue = (s: CardState | undefined, today: number) => !!s && s.due <= today

/**
 * Estimated probability of answering correctly on exam day. Blends the answer
 * record (Beta prior centred on 0.5) with how far the card has climbed.
 */
export function mastery(s: CardState | undefined): number {
  if (!s) return 0.5
  const record = (s.correct + 1.5) / (s.seen + 3)
  const retention = 0.45 + 0.1 * s.box
  return Math.min(0.98, 0.5 * record + 0.5 * retention)
}
