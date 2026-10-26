import type { Question } from './types'

/**
 * Current-affairs questions (exam questions 36-40). SIRI only asks about
 * events from the six months before each sitting, so every item expires six
 * months after its event. How to add one: see docs/aktuelt.md.
 */
export interface CurrentItem {
  /** Stable id: a-YYYY-MM-<slug>. Never reuse an id; learners' progress is stored by it. */
  id: string
  /** When the event happened (ISO date). Expiry is computed from this. */
  event: string
  prompt: string
  options: string[]
  answer: number
  explain: { da: string; en: string }
  /** Outlet and date shown to the learner, e.g. "DR, 3. juni 2026". */
  sourceName: string
  /** Primary source the answer was checked against. */
  sourceUrl: string
  /** When a person last checked the answer against the source (ISO date). */
  checked: string
}

export const CURRENT: CurrentItem[] = [
  {
    id: 'a-2026-06-regering',
    event: '2026-06-03',
    prompt: 'Hvilke partier dannede regering den 3. juni 2026?',
    options: [
      'Socialdemokratiet, Venstre og Moderaterne',
      'Socialdemokratiet, SF, Radikale Venstre og Moderaterne',
      'Venstre, Det Konservative Folkeparti og Liberal Alliance',
    ],
    answer: 1,
    explain: {
      da: 'Efter 69 dages forhandlinger dannede Mette Frederiksen (S) en regering med SF, Radikale Venstre og Moderaterne. Den afløste regeringen med Venstre og Moderaterne.',
      en: 'After 69 days of talks, Mette Frederiksen (S) formed a government with SF, the Social Liberals and the Moderates, replacing the coalition with Venstre and the Moderates.',
    },
    sourceName: 'DR, 3. juni 2026',
    sourceUrl: 'https://www.dr.dk/ligetil/indland/danmark-har-faaet-en-ny-regering-2',
    checked: '2026-10-26',
  },
  {
    id: 'a-2026-06-finansminister',
    event: '2026-06-03',
    prompt: 'Hvem blev finansminister i den regering, der blev dannet i juni 2026?',
    options: ['Nicolai Wammen', 'Peter Hummelgaard', 'Troels Lund Poulsen'],
    answer: 1,
    explain: {
      da: 'Peter Hummelgaard (S) blev finansminister den 3. juni 2026. Han havde tidligere været justitsminister.',
      en: 'Peter Hummelgaard (Social Democrats) became finance minister on 3 June 2026. He had previously been justice minister.',
    },
    sourceName: 'Finansministeriet, 3. juni 2026',
    sourceUrl: 'https://fm.dk/nyheder/nyhedsarkiv/2026/juni/peter-hummelgaard-bliver-ny-finansminister/',
    checked: '2026-10-26',
  },
  {
    id: 'a-2026-06-varmerekord',
    event: '2026-06-27',
    prompt: 'Hvilken rekord blev sat i Danmark den 27. juni 2026?',
    options: [
      'Den højeste temperatur, der nogensinde er målt i Danmark',
      'Den største regnmængde på ét døgn',
      'Det højeste antal solskinstimer på én dag',
    ],
    answer: 0,
    explain: {
      da: 'I Ødum nord for Aarhus og Beldringe nord for Odense blev der målt 37,0 grader. Det er den højeste temperatur, der nogensinde er målt i Danmark.',
      en: 'Ødum near Aarhus and Beldringe near Odense reached 37.0°C, the highest temperature ever recorded in Denmark.',
    },
    sourceName: 'DR, 1. juli 2026',
    sourceUrl: 'https://www.dr.dk/nyheder/vejret/juni-2026-blev-en-maaned-til-historieboegerne',
    checked: '2026-10-26',
  },
  {
    id: 'a-2026-09-groenlandsaftale',
    event: '2026-09-22',
    prompt: 'Hvad indeholder aftalen mellem Danmark, Grønland og USA, som blev underskrevet i New York i september 2026?',
    options: [
      'At Grønland bliver selvstændigt fra 2027',
      'At USA bygger to nye militærbaser i Grønland',
      'At Danmark sælger Pituffik-basen til USA',
    ],
    answer: 1,
    explain: {
      da: 'Mette Frederiksen, Jens-Frederik Nielsen og Donald Trump underskrev aftalen ved FN\'s generalforsamling. USA bygger baser ved Narsarsuaq og Mestersvig, og aftalen bekræfter rigets suverænitet.',
      en: 'Mette Frederiksen, Jens-Frederik Nielsen and Donald Trump signed it at the UN General Assembly. The US will build bases at Narsarsuaq and Mestersvig, and the deal reaffirms the realm\'s sovereignty.',
    },
    sourceName: 'DR, 22. september 2026',
    sourceUrl: 'https://www.dr.dk/nyheder/indland/groenland/officielt-aftale-mellem-danmark-groenland-og-usa-er-underskrevet',
    checked: '2026-10-26',
  },
  {
    id: 'a-2026-10-folketingsformand',
    event: '2026-10-06',
    prompt: 'Hvem blev valgt som formand for Folketinget den 6. oktober 2026?',
    options: ['Søren Gade', 'Henrik Frandsen', 'Pia Kjærsgaard'],
    answer: 1,
    explain: {
      da: 'Henrik Frandsen fra Moderaterne blev valgt ved Folketingets åbning. Han afløste Søren Gade fra Venstre.',
      en: 'Henrik Frandsen of the Moderates was elected when parliament opened. He replaced Søren Gade of Venstre.',
    },
    sourceName: 'DR, 6. oktober 2026',
    sourceUrl: 'https://www.dr.dk/nyheder/politik/folketinget-vaelger-henrik-frandsen-som-formand-efter-kritik',
    checked: '2026-10-26',
  },
]

/** ISO date `months` months after `iso`, clamped to the month's last day (31 Aug + 6 → 28 Feb). */
export function addMonths(iso: string, months: number): string {
  const [y, m, d] = iso.split('-').map(Number)
  const target = new Date(Date.UTC(y, m - 1 + months, 1))
  const lastDay = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate()
  target.setUTCDate(Math.min(d, lastDay))
  return target.toISOString().slice(0, 10)
}

export const toQuestion = (c: CurrentItem): Question => ({
  id: c.id,
  exam: 'indfodsret',
  topic: 'aktuelt',
  prompt: c.prompt,
  options: c.options,
  answer: c.answer,
  explain: c.explain,
  source: c.sourceName,
  sourceUrl: c.sourceUrl,
  edition: null,
  eventDate: c.event,
  validUntil: addMonths(c.event, 6),
})

export const CURRENT_QUESTIONS = CURRENT.map(toQuestion)
