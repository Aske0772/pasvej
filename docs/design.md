# Pasvej – designregler

Pasvej følger samme designfamilie som idebankens mad-app (Mæt): Bricolage Grotesque til overskrifter, Bodoni-ordmærket,
boksene og knapperne formet som piller. Men den er bygget som flaget: **hvidt på rødt**.

## To lag
| Lag | Hvad | Tekst på det |
|---|---|---|
| **Grund** | Rød gradient fra `#D4152F` øverst til `#9A0C24` nederst | Hvid. Sekundær tekst er hvid med 92 % dækning |
| **Kort** | Alle kort og bokse (chancen for at bestå, plan, spørgsmål, svar, forklaringer, valg, paneler): grafit med en blød lodret gradient (`#2C2D31` til `#1E1F22`), en hårfin kant og en lys kant foroven | Hvid. Sekundær tekst er hvid med 62 % dækning |

Kortene var tidligere hvidt papir. Inde i et kort er papirets farvetokens byttet om (`--ink` er hvid, `--line` er
hvid med 10 %, grøn er lysere `#2FBF6B`), så valg, streger og svarfarver læses rigtigt på mørkt. Svarfelter har altid en
fast bund, så en gennemsigtig grøn eller grå aldrig lader det røde skinne igennem.

**Spørgsmålsskærme har tre toner**, så delene ikke flyder sammen: spørgsmålet er det mørkeste kort (`#101113`, fladt,
det skal læses), svarmulighederne er de hævede grafitkort (de kan trykkes på), og forklaringen er det lyseste kort med en
stribe foroven i dommens farve: grøn ved rigtigt, lys grå ved forkert.

**Paneler** (Profil og "Dine fejl" under Træn) har samme grafitflade. Hver række er bygget ens (lighed): rød ikonflise,
titel og undertekst, og en kvadratisk handling til højre (pil, afkrydsning, − og +). Den valgte række får en lys ramme og
en hvid afkrydsning. Hovedhandlingen på et kort er den røde pille.

**Ingen header.** Som i en app starter hver skærm med sin egen store titel, og dagene til prøven står i Hjems titellinje.
Toppen holder afstand til telefonens statuslinje (`env(safe-area-inset-top)`). **Fanebjælken** i bunden er det eneste faste
element: hvidt papir, der rammer den røde grund ind (5,3:1 til 8,6:1 mod det røde). Den aktive fane er rød, inaktive er grå
(5,4:1 på hvid). Fanerne hedder Hjem, Træn, Prøve og Profil.

Succes (prøve bestået, dagen klaret, alt rigtigt) vises som **grønt på et grafitkort**, ikke som et grønt kort. Grønt direkte på rødt
står dårligt i kontrast og ligner jul.

## Hovedknappen vender sig efter underlaget
- **På den røde grund:** hvid pille med rød tekst og en lille skygge, fx "Næste", "Start prøven" og "Start testen".
- **På et kort:** rød pille med hvid tekst, fx "Start dagens plan" og "Træn dine fejl".
- **Sekundære knapper:** glas (hvid med 16 % dækning og hvid tekst) på grunden, lys grå glas på et kort.

Det giver altid størst kontrast og gentager flaget: hvid på rød, rød på hvid.

## Farvernes roller
| Farve | Betyder | Bruges aldrig til |
|---|---|---|
| Rød | Pasvej (grunden) og hovedknappen på kort | Forkerte svar og fejl |
| Hvid | Hovedknappen på grunden. På grunden betyder hvid også "rigtigt" (fx i fremskridtsbjælken øverst), fordi grønt ikke kan læses på rødt | – |
| Grøn | Rigtigt, klaret, mestret (på kort) | Knapper |
| Sort og grå | Neutral: valgt svar, fremskridt, forkert svar (sort kryds og overstreget grå tekst) | – |

Når rød er brandfarven, må rød ikke også betyde "forkert". Ellers kommer brugeren til at forbinde appen med at fejle.
Et forkert svar vises derfor i sort og grå, og teksten er "Ikke helt" i stedet for "Forkert".

## Kontrast (målt)
| | Kontrast |
|---|---|
| Hvid tekst på grunden | 5,3:1 (øverst) til 8,6:1 (nederst) |
| Sekundær hvid tekst (92 %) på grunden | 4,65:1 til 7,4:1 |
| Inaktive faner (grå) på den hvide fanebjælke | 5,4:1 |
| Rød knaptekst på hvid | 5,9:1 |

## Ydeevne
Den røde baggrund er statiske CSS-gradienter på `body`. Siden scroller aldrig (indholdet scroller inde i `.main`), så
baggrunden males kun én gang. Der bruges ingen `backdrop-filter`: fanebjælken har en fast farve i stedet for blur.
Svage elementer gøres svage ved at gøre teksten grå, ikke ved at sænke boksens dækning. Ellers skinner det røde igennem og gør boksen lyserød.

## Dagens plan og Din uge (efter en gennemgang med gestaltprincipperne)
Problemer i den første version, og hvordan de er løst:

| Problem | Princip | Løsning |
|---|---|---|
| Trin 1 og knappen "Start dagens plan" gjorde det samme, så der var to ting at trykke på | Fokuspunkt, lighed | Knappen ligger nu **inde i** det aktuelle trin ("Start · 4 min"), og der er kun én knap |
| Trinnene var separate bokse med en næsten usynlig streg | Kontinuitet | Én sammenhængende linje, som prikkerne hænger på. Linjen er grøn bag klarede trin og stopper ved sidste trin |
| Alle trin lignede hinanden | Figur og grund, lighed | Klaret: grøn prik og "Klaret". Aktuelt: sort prik, rosa felt og "Start her" eller "Næste". Senere: hul prik og almindelig tekst |
| "Din uge" lå i samme kort som planen | Fælles område | Ugen har sit eget kort |
| Etiketten var grå og status var fed, så status lignede en overskrift eller en knap | Lighed (hierarki) | "Din uge" har samme stil som "Dagens plan", og status står i grå til højre |
| Ugens bjælker lignede fremskridtsbjælker og startede på en tilfældig dag | Prägnanz | Cirkler som en kalender fra mandag til søndag: grøn med flueben for øvet, ring om i dag, stiplet for kommende dage |

## Gestaltprincipper, og hvor de bruges
| Princip | Hvor | Hvad det gør |
|---|---|---|
| **Figur og grund** | Hver skærm har ét mørkt kort: chancen for at bestå, spørgsmålet eller resultatet | Øjet lander først på det vigtigste |
| **Fokuspunkt** | Én rød knap pr. skærm, fx "Start dagens plan", "Næste" eller "Start prøven" | Brugeren ved altid, hvad næste skridt er |
| **Nærhed og fælles område** | Dagens plan og "Din uge" ligger i samme boks. Prøvens fejl grupperes pr. kapitel | Det daglige og vanen hører sammen, og det man skal læse op på, samles ét sted |
| **Kontinuitet** | Planens trin er forbundet af en linje, og linjen bliver grøn, når trinnet er klaret. Efter et trin tilbydes næste trin direkte | Dagen føles som én vej, ikke tre opgaver |
| **Lighed** | Alt, der kan trykkes på, er et grafitkort med pil. Ting, der ikke er klar endnu, har stiplet kant uden pil (aktuelt, låste prøver) | Det er tydeligt, hvad der er interaktivt |
| **Fælles skæbne** | Det rigtige svar, flueben og "rigtige i træk" animeres samtidigt | Belønningen opleves som én begivenhed |
| **Lukning** | Ugens syv felter og planens segmenter "fyldes op". Bjælkerne på kortet med chancen for at bestå har en streg ved kravet (36 af 45 og 4 af 5) | Et ufærdigt mønster motiverer, og afstanden til målet kan ses |
| **Prägnanz (enkelhed)** | Statistikfelterne med "svar i alt" og "læremateriale %" er fjernet, fordi de gentog kortet | Mindre støj og ét tal at forholde sig til |

## Gamification: kun det, der hænger sammen med målet
Alt, der belønner brugeren, peger tilbage på at bestå prøven. Der er ingen point, XP eller ranglister.

| Element | Hvornår | Hvorfor det ikke er pynt |
|---|---|---|
| Fluebenet "popper", og telefonen giver et kort vib | Når man svarer rigtigt | Øjeblikkelig feedback. Ved forkert svar vibrerer den i stedet kort to gange |
| Chippen "3 rigtige i træk" | Ved 3 eller flere rigtige i træk i en øvelse | Synlig fremgang i øvelsen, som forsvinder ved første fejl |
| Forventet score før og efter (fx "22,7 → 23,1 af 45, +0,3 rigtige"), med en streg ved 36 | Når en øvelse er slut | Viser, at øvelsen flytter det, der betyder noget. Vi bruger forventet score, fordi chancen for at bestå står på næsten 0 %, indtil man er tæt på 36, og derfor ikke ville vise nogen fremgang i starten |
| "Næste: …" | Efter hvert trin i planen | Holder brugeren i flowet uden at sende dem tilbage til forsiden |
| Grønt kort med "Klaret for i dag" og ugen | Når dagens plan er gennemført | Tydelig afslutning på dagen, der bygger en vane |
| Ugen med 7 felter og dage i træk | På forsiden | Vane uden straf. Der er ingen "du mistede din stime"-besked |
| Stemplet "BESTÅET" | Når prøvesimuleringen er bestået | Øjeblikket, der ligner det rigtige mål mest |
| "Mestret ✓" pr. kapitel | Når mestringen er 80 % eller mere | Viser, hvad man kan, og hvad der mangler |

Alle animationer slås fra ved `prefers-reduced-motion`.

## Temabilleder: fotofliser
Hvert tema under "Træn" er en **fotoflise**: et næsten kvadratisk kort (4:5) med runde hjørner, to pr. række. Fotoet
fylder hele flisen, og en mørk gradient nedefra holder teksten læselig i hvidt. Øverst ligger små glas-chips med
kapitel og antal spørgsmål. Nederst står titlen, en kort forklaring af, hvad temaet handler om (fra kapitlernes
afsnit i lærematerialet, `blurb` i `topics.ts`), og fremskridtsbjælken med procent. Alle fliser er bygget ens (lighed).
Billederne er kun pynt (`alt=""`). Et tema uden spørgsmål endnu (fx aktuelt før næste prøve) vises med gråtonet foto
og tættere gradient og kan ikke trykkes på.

| Tema | Foto |
|---|---|
| 1. Danmarks historie | Runesten på en dansk kirkegård |
| 2. Det danske demokrati | Christiansborg set over kanalen |
| 3. Den danske økonomi | Havvindmøllepark ved solnedgang |
| 4. Danmark og omverdenen | Øresundsbroen set fra luften |
| 5. Dansk kulturliv | Nyhavn i skumringen |
| 6. Temaopslag | Fyrtårn i klitterne |
| Danske værdier | Dannebrog på en flagstang |
| Aktuelle begivenheder | Aviser og kaffe på et cafébord |

Fotoene er **AI-genererede** i Figma Weave med Nano Banana 2.1 (1K, 16:9). De er ikke rigtige fotografier og skal ikke
bruges som dokumentation af stederne. De ligger i `public/topics/<tema-id>.webp` i 720 px bredde, ca. 19-50 KB hver og
250 KB i alt, og de indlæses først, når de skal vises (`loading="lazy"`). Til et nyt tema skal man bruge samme slags
prompt: fotorealistisk, bredformat, motiv i højre halvdel, mørkere og roligere venstre side, ingen personer og ingen tekst.
