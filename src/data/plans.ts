export type Tier = 'free' | 'basis' | 'plus'

/** Billing period shown after the price. Monthly, like the competitors' subscriptions. */
export const PRICE_PERIOD = 'md.'

export interface Feature {
  text: string
  /** Promised but not built yet; shown with a "kommer snart" tag. */
  soon?: boolean
}

export interface Plan {
  id: Tier
  name: string
  price: number
  tagline: string
  /** Name of the plan whose features this one also includes ("Alt i Basis, plus:"). */
  includes?: string
  features: Feature[]
  /** How much of the app the plan opens, 1-3; drawn as a fill bar so the step-up is visible. */
  level: 1 | 2 | 3
}

export const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Gratis',
    price: 0,
    tagline: 'Kom i gang med lidt øvelse hver dag.',
    level: 1,
    features: [
      { text: '1 mini-prøve om dagen med 10 spørgsmål' },
      { text: 'Forklaringer på dansk og engelsk' },
      { text: 'Din chance for at bestå' },
    ],
  },
  {
    id: 'basis',
    name: 'Basis',
    price: 59,
    tagline: 'Alt til indfødsretsprøven.',
    includes: 'Gratis',
    level: 2,
    features: [
      { text: 'Alle spørgsmål, bygget på de tidligere prøver' },
      { text: 'Prøven som på prøvedagen: 45 spørgsmål på 45 minutter' },
      { text: 'De 6 kapitler fra lærematerialet' },
      { text: '2 ekstra kapitler: Danske værdier og Aktuelle begivenheder' },
      { text: 'Dagens plan uden loft og øvelse af dine fejl' },
    ],
  },
  {
    id: 'plus',
    name: 'Plus',
    price: 109,
    tagline: 'Hele vejen: statsborgerskab og permanent ophold.',
    includes: 'Basis',
    level: 3,
    features: [
      { text: 'Medborgerskabsprøven', soon: true },
      { text: 'Prøve i Dansk 2 til permanent ophold', soon: true },
      { text: 'Én profil, der følger dig fra ophold til pas' },
    ],
  },
]

export const planById = (id: Tier) => PLANS.find((p) => p.id === id)!

/** What each tier opens. Free gets one 10-question mini-test a day and nothing else. */
export const access = (tier: Tier | null) => {
  const paid = tier === 'basis' || tier === 'plus'
  return { practice: paid, exam: paid, fullPlan: paid, residence: tier === 'plus' }
}

/** Questions in the free daily mini-test. */
export const FREE_DAILY_QUESTIONS = 10
