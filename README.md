# Pasvej

**Live:** https://aske0772.github.io/pasvej/

MVP-prototype af en app til Indfødsretsprøven. Den er bygget fra bunden ud fra en clean-room feature-spec ([docs/feature-spec.md](docs/feature-spec.md)).

```bash
npm install
npm run dev     # http://localhost:5180
npm test        # tests af readiness, spaced repetition, prøve, plan og spørgsmålsbank
npm run aktuelt # hvilke aktuelle spørgsmål tæller til de kommende prøver
```

Aktuelle spørgsmål tilføjes i `src/data/current.ts`. Se [docs/aktuelt.md](docs/aktuelt.md).

- `src/engine/` – logikken: fremgang og forventet score (begge krav), Leitner-repetition, daglig plan og prøvebygger.
- `src/data/` – lærematerialets 6 kapitler som temaer og 88 egne spørgsmål. Hvert spørgsmål har et kildeafsnit og en udgave (se [docs/proeve-research.md](docs/proeve-research.md)).
- `src/views/` – onboarding/diagnose, hjem, øv, prøvesimulering og profil.

Data gemmes kun lokalt i browseren (localStorage). Der er endnu ingen konti, betaling, lyd eller nyhedsspørgsmål.
