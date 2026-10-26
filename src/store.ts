import { useCallback, useEffect, useState } from 'react'
import type { Tier } from './data/plans'
import type { ExamId, Lang } from './data/types'
import type { PlanStep } from './engine/plan'
import { dayNumber, review, type CardState } from './engine/srs'

export interface Profile {
  exam: ExamId
  examDate: string
  dailyMinutes: 5 | 10 | 15
  /** Second language shown next to the plain-Danish explanation. */
  helpLang: Lang | null
}

export interface SessionLog {
  day: number
  kind: string
  correct: number
  total: number
}

export interface AppState {
  profile: Profile | null
  cards: Record<string, CardState>
  log: SessionLog[]
  /** Built once per day so finished steps stay ticked off. */
  plan: { day: number; steps: PlanStep[]; tier?: Tier } | null
  /** Chosen on the paywall after the first test; null until then. No payment is taken yet. */
  subscription: Tier | null
}

/**
 * Sittings per danskogproever.dk. Sign-up closes about 5 weeks before, so new
 * users are offered the first sitting whose deadline hasn't passed.
 */
export const SITTINGS = [
  { date: '2026-11-25', deadline: '2026-10-21' },
  { date: '2027-05-26', deadline: '2027-04-21' },
]

export const nextOpenSitting = (today = new Date().toISOString().slice(0, 10)) =>
  SITTINGS.find((s) => s.deadline >= today) ?? SITTINGS[SITTINGS.length - 1]

const KEY = 'pasvej:v1'
const empty: AppState = { profile: null, cards: {}, log: [], plan: null, subscription: null }

function load(): AppState {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? { ...empty, ...JSON.parse(raw) } : empty
  } catch {
    return empty
  }
}

export function useAppState() {
  const [state, setState] = useState<AppState>(load)

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state))
    } catch {
      // Storage can be unavailable (private mode); the app still works for the session.
    }
  }, [state])

  const setProfile = useCallback((profile: Profile) => setState((s) => ({ ...s, profile })), [])

  const answer = useCallback((id: string, correct: boolean) => {
    const today = dayNumber()
    setState((s) => ({ ...s, cards: { ...s.cards, [id]: review(s.cards[id], correct, today) } }))
  }, [])

  const logSession = useCallback((kind: string, correct: number, total: number) => {
    setState((s) => ({ ...s, log: [...s.log, { day: dayNumber(), kind, correct, total }] }))
  }, [])

  const setPlan = useCallback((plan: AppState['plan']) => setState((s) => ({ ...s, plan })), [])

  const setSubscription = useCallback((subscription: Tier) => setState((s) => ({ ...s, subscription, plan: null })), [])

  const reset = useCallback(() => setState(empty), [])

  return { state, setProfile, answer, logSession, setPlan, setSubscription, reset }
}

export function streak(log: SessionLog[], today = dayNumber()): number {
  const days = new Set(log.map((l) => l.day))
  let n = 0
  for (let d = days.has(today) ? today : today - 1; days.has(d); d--) n++
  return n
}

export const daysUntil = (iso: string) => dayNumber(new Date(iso + 'T12:00:00')) - dayNumber()
