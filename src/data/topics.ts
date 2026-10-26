import type { Topic } from './types'

// The six chapters of "Læremateriale til indfødsretsprøven" (August 2026),
// plus the two parts of the exam that are not based on the material.
// Blurbs summarise each chapter's sections in the material's table of contents.
export const TOPICS: Topic[] = [
  {
    id: 'kap1', section: 'material', chapter: 1,
    name: { da: 'Danmarks historie', en: 'Danish history' },
    blurb: { da: 'Fra vikingetid og enevælde til besættelsen og EU.', en: 'From the Vikings and absolute monarchy to the occupation and the EU.' },
  },
  {
    id: 'kap2', section: 'material', chapter: 2,
    name: { da: 'Det danske demokrati', en: 'Danish democracy' },
    blurb: { da: 'Grundloven, Folketinget, valg og retssamfundet.', en: 'The constitution, parliament, elections and the rule of law.' },
  },
  {
    id: 'kap3', section: 'material', chapter: 3,
    name: { da: 'Den danske økonomi', en: 'The Danish economy' },
    blurb: { da: 'Velfærd, erhvervsliv og arbejdsmarkedet.', en: 'Welfare, business and the labour market.' },
  },
  {
    id: 'kap4', section: 'material', chapter: 4,
    name: { da: 'Danmark og omverdenen', en: 'Denmark and the world' },
    blurb: { da: 'EU, NATO, FN og Danmarks rolle i verden.', en: 'The EU, NATO, the UN and Denmark’s role in the world.' },
  },
  {
    id: 'kap5', section: 'material', chapter: 5,
    name: { da: 'Dansk kulturliv', en: 'Danish cultural life' },
    blurb: { da: 'Litteratur, kunst, musik, design og film.', en: 'Literature, art, music, design and film.' },
  },
  {
    id: 'kap6', section: 'material', chapter: 6,
    name: { da: 'Temaopslag', en: 'Themes' },
    blurb: { da: 'Geografi, kongehus, Rigsfællesskabet, skikke og meget mere.', en: 'Geography, the royal family, the Realm, customs and more.' },
  },
  {
    id: 'vaerdier', section: 'values',
    name: { da: 'Danske værdier', en: 'Danish values' },
    blurb: { da: 'Frihed, ligestilling og dansk lov. 4 af 5 skal være rigtige.', en: 'Freedom, equality and Danish law. 4 of 5 must be right.' },
  },
  {
    id: 'aktuelt', section: 'current',
    name: { da: 'Aktuelle begivenheder', en: 'Current affairs' },
    blurb: { da: 'Nyheder fra det seneste halve år før prøven.', en: 'News from the six months before the exam.' },
  },
]

/**
 * Questions per chapter on a full paper (35 in total), from our count of the
 * November 2025 and June 2026 exams.
 */
export const CHAPTER_QUOTA: Record<string, number> = { kap1: 10, kap2: 8, kap3: 2, kap4: 4, kap5: 4, kap6: 7 }

export const topicById = (id: string) => TOPICS.find((t) => t.id === id)!
