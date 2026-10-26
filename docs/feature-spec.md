# Pasvej – clean-room feature spec

Dato: 26.10.2026

## Sådan er spec'en lavet

Konkurrenternes **offentlige forsider** blev observeret med REA (`capture_browser_scenario`,
kun accessibility-træ, ingen login, ingen betalte sider, ingen kode eller netværksindhold hentet).
Vi har kun noteret *hvilke funktioner* de beskriver – ikke deres kode, tekster, spørgsmål,
billeder eller design. Alt i Pasvej er skrevet fra bunden.

| Kilde | REA Evidence |
|---|---|
| indfodsretstest.dk | `ev_847890ca155a515eb98191953312246b4b932d0eeb2639bef6c13aad29161299` |
| borgerklar.dk | `ev_04a3b6048b7f695a60452b8a7d1636164857c3c74159e7e109e6976f3dc18105` |
| bestaaet.dk | `ev_39ad16cb72e5d8625943bf383bcadbd56e543024d44d58a67e170ec4d9873b39` |
| nyborger.dk | `ev_cac3fbd627b11830fee2a7d05e87c5ceaa0fec54669658e77baa0b1176cf2641` |

Regler for indhold i Pasvej:

- Ingen spørgsmål, forklaringer eller lydfiler kopieres fra konkurrenter.
- Officielt SIRI-materiale og offentliggjorte prøver må først importeres, når vilkårene er tjekket.
- Seed-spørgsmålene i `src/data/questions.ts` er egne formuleringer og skal faktatjekkes før lancering.

## Observeret feature-matrix

| Funktion | Indfødsretstest | Borgerklar | Bestået | Nyborger | Pasvej |
|---|---|---|---|---|---|
| Prøvesimulering 45 spm / 45 min | ✓ | ✓ | ✓ | ✓ | ✓ |
| Chance for at bestå / "klar"-mål | ✓ | ✓ (procent) | – | – | ✓ **delt op i begge krav** |
| Fejl kommer igen til de sidder | ✓ | ✓ (→ flashcards) | ✓ (fejlarkiv) | ✓ (→ flashcards) | ✓ spaced repetition |
| Daglig studieplan | – | ✓ (nævnt) | ✓ (4–5 trin, mål 5/10/15 min) | daglige mål | ✓ |
| Temaer / emnequiz | kapiteltræning | lektioner | 32 temaer | emner | ✓ |
| Nyhedsspørgsmål (5 af 45) | ✓ | ✓ | – | – | ✓ motor med udløbsdato |
| Lyd af læremateriale | ✓ | ✓ | ✓ (AI) | ✓ | senere |
| Oversæt ord | – | ✓ | – | – | ✓ **hele forklaringen** |
| XP / dage i træk | – | – | ✓ | ✓ | ✓ (kun dage i træk) |
| Nedtælling til prøven | ✓ | ✓ | – | ✓ | ✓ |
| Gratis test uden konto | ✓ | ✓ | ✓ | ✓ (5 spm) | ✓ diagnosetest |
| Flere prøver i samme profil | – | link til Medborgerskab | – | – | ✓ datamodel |

## Huller, vi kan udnytte

1. **De to beståkrav vises ikke hver for sig.** Nyborger viser selv, at 91 % klarer
   værdikravet, men kun 59 % når 36 rigtige. Pasvej viser sandsynligheden for begge krav hver for sig.
2. **Forklaringer findes kun på dansk.** Pasvej viser forklaringen på letlæst dansk *og* på brugerens sprog
   ved siden af. Selve spørgsmålet forbliver på dansk, ligesom på prøven.
3. **Ingen siger, hvor sikker vurderingen er.** Pasvej viser, hvor mange svar estimatet bygger på.
4. **Ingen følger brugeren videre.** Profilen har et `exam`-felt, så Medborgerskabsprøven og PD2/PD3
   kan tilføjes uden at bygge platformen om.

## Funktioner i MVP'en

### 1. Onboarding
- Prøvedato (standard: næste termin), dagligt mål 5/10/15 min, forklaringssprog.
- Diagnosetest med 10 spørgsmål → første readiness-estimat.

### 2. Readiness-motor (`src/engine/readiness.ts`)
- Hvert spørgsmål har en mestringsgrad mellem 0 og 1, som opdateres efter hvert svar.
- Mestring pr. del: læremateriale (35), aktuelle spørgsmål (5) og værdier (5).
- P(bestå) = P(i alt ≥ 36 og værdier ≥ 4), beregnet eksakt ved at folde tre binomialfordelinger sammen.
- Viser også P(værdikrav) og P(36 rigtige) hver for sig, plus hvor mange svar tallet bygger på.

### 3. Spaced repetition (`src/engine/srs.ts`)
- Leitner-bokse 0–5 med intervallerne 0, 1, 2, 4, 8 og 16 dage. Et forkert svar sender spørgsmålet tilbage til boks 0.

### 4. Daglig plan (`src/engine/plan.ts`)
- Trin, der vælges ud fra tid og data: forfaldne gentagelser → svageste tema → nye spørgsmål → mini-prøve.
- I sidste uge før prøven: ingen nye emner, kun repetition og prøver.

### 5. Prøvetilstand
- Samme struktur som den rigtige prøve: værdier og aktuelle spørgsmål tælles hver for sig, med tidsgrænse.
- Resultatet viser begge beståkrav og hvilke temaer, der trak ned.

### 6. Nyhedsmotor
- Spørgsmål har `validUntil`, og spørgsmål ældre end 6 måneder skjules automatisk.
- Kun redaktionelt faktatjekket indhold. Ingen AI-genererede nyheder uden kilde.

## Ikke med i MVP'en
Betaling, konti/synkronisering, lyd, AI-forklaringer i realtid, PD2/PD3.
