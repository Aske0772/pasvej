export type ExamId = 'indfodsret' | 'medborgerskab' | 'pd2' | 'pd3'

/** Which part of the exam a question counts towards. */
export type Section = 'material' | 'current' | 'values'

export type Lang = 'da' | 'en'

export interface Topic {
  id: string
  section: Section
  /** Chapter number in the official study material, for material topics. */
  chapter?: number
  name: Record<Lang, string>
  /** One line on what the theme covers, shown on its card in Practice. */
  blurb: Record<Lang, string>
}

/** Edition of SIRI's study material; the next one is due August 2027. */
export type Edition = '2026-08'

export interface Question {
  id: string
  exam: ExamId
  topic: string
  prompt: string
  /** Two (often Ja/Nej) or three options, as on the real exam. */
  options: string[]
  answer: number
  /** Short explanation in plain Danish plus the learner's language. */
  explain: Record<Lang, string>
  /** Section in the study material (e.g. "2.2"), or the external source for values/current questions. */
  source: string
  /** Study-material edition the question was checked against; null when not from the material. */
  edition: Edition | null
  /** Keep options in authored order (Ja/Nej, years, percentages) instead of shuffling. */
  fixedOrder?: boolean
  /** Link to the source, for current-affairs questions. */
  sourceUrl?: string
  /** Current affairs: the date the event happened (ISO). */
  eventDate?: string
  /** Current affairs: last exam date the question can appear on, six months after the event (ISO). */
  validUntil?: string
}
