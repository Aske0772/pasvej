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
  /** Two short lines next to the price, like "pr. måned / indfødsretsprøven". */
  priceNote: [string, string]
  tagline: string
  /** The plan's full feature list. Lists are cumulative, so they grow from plan to plan. */
  features: Feature[]
  level: 1 | 2 | 3
}

const FREE_FEATURES: Feature[] = [
  { text: 'Forklaringer på dansk og engelsk' },
  { text: 'Din chance for at bestå' },
]

const BASIS_FEATURES: Feature[] = [
  { text: 'Ubegrænset øvelse i alle spørgsmål' },
  { text: 'Prøven som på prøvedagen: 45 spørgsmål på 45 min' },
  { text: 'De 6 kapitler fra lærematerialet' },
  { text: '2 ekstra kapitler: Danske værdier og Aktuelle begivenheder' },
  { text: 'Dagens plan og øvelse af dine fejl' },
  ...FREE_FEATURES,
]

export const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Gratis',
    price: 0,
    priceNote: ['for altid', 'ingen betaling'],
    tagline: 'Kom i gang med lidt øvelse hver dag.',
    level: 1,
    features: [{ text: '1 mini-prøve om dagen med 10 spørgsmål' }, ...FREE_FEATURES],
  },
  {
    id: 'basis',
    name: 'Basis',
    price: 59,
    priceNote: ['pr. måned', 'indfødsretsprøven'],
    tagline: 'Alt til indfødsretsprøven.',
    level: 2,
    features: BASIS_FEATURES,
  },
  {
    id: 'plus',
    name: 'Plus',
    price: 109,
    priceNote: ['pr. måned', 'pas og ophold'],
    tagline: 'Hele vejen: statsborgerskab og permanent ophold.',
    level: 3,
    features: [
      ...BASIS_FEATURES,
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
