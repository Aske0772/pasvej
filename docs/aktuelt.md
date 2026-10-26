# Aktuelle spørgsmål – sådan tilføjer du dem

Prøvens spørgsmål 36-40 handler om begivenheder fra **de seneste seks måneder før prøven**. Det kan fx være politik, samfund,
kultur, sport og vejr, som de danske medier har dækket bredt. I Pasvej ligger de i [`src/data/current.ts`](../src/data/current.ts).

## 1. Find begivenheden
- Den skal være fra vinduet til en kommende prøve. `npm run aktuelt` viser vinduet og hvor mange spørgsmål der mangler.
- Brug en **primær kilde**: DR, TV 2, Ritzau, ministerier, ft.dk eller DMI. Brug ikke andre prep-apps eller AI-opsummeringer.
- Svaret skal fremgå direkte af kilden. Er der tvivl om svaret, så drop spørgsmålet.

## 2. Tilføj et element i `CURRENT`

```ts
{
  id: 'a-2026-11-kort-navn',      // a-ÅÅÅÅ-MM-<slug>. Genbrug aldrig et id.
  event: '2026-11-03',            // datoen begivenheden skete. Udløb beregnes herfra (+6 mdr.)
  prompt: 'Hvad …?',
  options: ['…', '…', '…'],       // 2-3 muligheder, ligesom på prøven
  answer: 1,                      // index i options (0 = første)
  explain: { da: 'Letlæst dansk forklaring.', en: 'English explanation.' },
  sourceName: 'DR, 3. november 2026',
  sourceUrl: 'https://www.dr.dk/…',
  checked: '2026-11-04',          // dato for faktatjek
},
```

## 3. Tjek
```bash
npm test          # validerer id, datoer, link og svar
npm run aktuelt   # viser, hvilke prøver spørgsmålet tæller til
```

## Sådan virker udløbet
- Spørgsmålet tæller til en prøve, hvis begivenheden ligger inden for de seks måneder før prøvedatoen.
  Appen bruger **brugerens egen prøvedato**, ikke dagens dato.
- Et spørgsmål fra september 2026 indgår derfor i prøven 25. november 2026, men ikke i prøven 26. maj 2027.
- Udløbne spørgsmål skjules automatisk. De kan slettes, men deres id må ikke genbruges, fordi brugernes fremskridt er gemt under id'et.

## Gode emner (sådan har SIRI spurgt)
Regeringsdannelse og ministre, valg, Folketingets åbning, aftaler med Grønland/USA/EU, priser og økonomi, vejrrekorder (DMI),
danske sportsresultater og store kulturbegivenheder.
