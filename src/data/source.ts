import type { Question } from './types'

const EDITION_LABEL: Record<NonNullable<Question['edition']>, string> = { '2026-08': 'aug. 2026' }

/** Human-readable reference, e.g. "Læremateriale (aug. 2026), afsnit 2.2". */
export const sourceLabel = (q: Question) =>
  q.edition ? `Læremateriale (${EDITION_LABEL[q.edition]}), afsnit ${q.source}` : q.source
