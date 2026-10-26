// Shows which current-affairs questions count for each upcoming sitting.
// Run: npm run aktuelt
import { CURRENT, addMonths } from '../src/data/current'
import { SITTINGS } from '../src/store'

const today = new Date().toISOString().slice(0, 10)

for (const s of SITTINGS.filter((s) => s.date >= today)) {
  const from = addMonths(s.date, -6)
  const items = CURRENT.filter((c) => c.event >= from && c.event <= s.date)
  console.log(`\nPrøve ${s.date} (tilmelding senest ${s.deadline}) – nyheder fra ${from}: ${items.length}/5`)
  for (const c of items) console.log(`  ✓ ${c.event}  ${c.id}`)
  if (items.length < 5) console.log(`  ! Mangler ${5 - items.length} spørgsmål`)
}

const expired = CURRENT.filter((c) => addMonths(c.event, 6) < today)
if (expired.length) {
  console.log(`\nUdløbet (kan slettes, men behold id'et ubrugt): ${expired.map((c) => c.id).join(', ')}`)
}
