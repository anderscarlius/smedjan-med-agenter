# Smedjan – Processbeskrivning v0.1

**Datum:** 2026-09-02  
**Författare:** Anders Carlius  
**För:** VGR Datahubb utvecklingsprocess

## Översikt

Smedjan är en agentbaserad utvecklingsprocess där **människan beslutar, LLM-agenter utför**. Processen säkerställer:

- **Spårbarhet:** Varje artefakt har känd proveniens
- **Kvalitet:** Separation mellan roller, systematiska granskningar
- **Reproducerbarhet:** Git är sanningen, allt är versionshanterat
- **Dataskydd:** Tydlig klassning (0/1/2), inga hemligheter i repos

## Sju principer (P1–P7)

**P1. Git är sanningen**  
All kod, all spec, alla beslut versionshanteras. Processportalen är en vy på Git, inte en separat databas.

**P2. Människan beslutar, agenten utför**  
Agenter föreslår, analyserar och implementerar. Människor godkänner vid grindar (G1–G4) och signerar PR:er.

**P3. Separation av roller**  
Ingen agent granskar sitt eget arbete. Olika pooler för olika steg (S1–S6).

**P4. CI är facit**  
Automatiserade tester avgör om kod är korrekt. Inga manuella "det fungerar på min maskin"-godkännanden.

**P5. Minimal dataklass för uppgiften**  
Använd syntetisk data (klass 0) när möjligt. Klass 2 endast i produktion, aldrig i utvecklingsrepos.

**P6. Loopar är explicita**  
L1 (kod), L2 (test), L3 (spec). Max 3 varv innan eskalering.

**P7. Grindar är blockande**  
G1–G4 måste passeras. Ingen överhopp.

## Sex separationsregler (S1–S6)

**S1:** Kodare (A4) och kodgranskare (A5) är olika pooler  
**S2:** Testförfattare (A6) är annan pool än kodare (A4)  
**S3:** Systemtestare (A9) är annan pool än kodare (A4), helst även än testförfattare (A6)  
**S4:** Utfallsanalytiker (A10) är alltid annan instans än kodare (A4) och systemtestare (A9)  
**S5:** Driftvakt (A11) och Förbättring (A12) är olika pooler  
**S6:** Deploy (A8) är funktionell roll, inte beslutsfattande – separeras genom att köra exakta manifest

## Tolv steg (0–11)

### Fas 1: Forma (0–2)

**Steg 0: Intag (A0)**  
- Agent: A0 Intag (pool A – Anthropic Claude)
- Input: Förslagsspec från verksamhet/product owner
- Output: Strukturerad spec enligt mall, dataklass-märkt, JSON-metadata
- Grind: Ingen (men A0 validerar format och dataklass innan vidare)

**Steg 1: Specgranskning (A1, G1)**  
- Agent: A1 Specgranskare (pool B – OpenAI GPT-4)
- Input: Spec från A0
- Output: Granskningsrapport, rekommendation (godkänn/återremittera/avslå)
- Grind: **G1** – Människa beslutar om spec går vidare

**Steg 2: Nedbrytning (A2+A3, G2)**  
- Agent: A2 Nedbrytare (pool C – Mistral/diverse) + A3 Storygranskare (pool B)
- Input: Godkänd spec
- Output: User stories med AC (Given/When/Then), beroenden, dataklass
- Grind: **G2** – Människa godkänner stories innan kodning

### Fas 2: Bygga (3–7)

**Steg 3: Kodning (A4+A5, mänsklig PR-signatur)**  
- Agent: A4 Kodare (pool A) + A5 Kodgranskare (pool B)
- Input: User story
- Output: PR med kod, unit-tester (grundläggande), commit signerad
- Process: A4 kodar → A5 granskar → människa signerar PR → merge till main/dev

**Steg 4: Enhetstester (A6)**  
- Agent: A6 Testförfattare (pool C, annan än A4)
- Input: Merged kod från steg 3
- Output: Utökade unit-tester, kodtäckning >80%
- Validering: CI kör testerna, grönt = godkänt

**Steg 5: Integrationstester (A7)**  
- Agent: A7 Integrationstestare (pool C)
- Input: Modul med unit-tester
- Output: Integrationstester (API-kontrakt, databaskopplingar, externa tjänster)
- Validering: CI kör, grönt = godkänt

**Steg 6: Testdeploy (A8)**  
- Agent: A8 Deploy (pool C)
- Input: Testad kod + miljömanifest
- Output: Deploy till test-miljö (Docker Compose / K8s)
- Validering: Hälsokontroller passerar

**Steg 7: Test av testdeploy (A9)**  
- Agent: A9 Systemtestare (pool B, annan än A4 och helst än A6)
- Input: Körande test-deploy
- Output: End-to-end-testrapport (användarflöden, prestanda, säkerhet)
- Validering: Alla E2E-tester gröna

### Fas 3: Leverera (8–9)

**Steg 8: Utfall/triage (A10, G3)**  
- Agent: A10 Utfallsanalytiker (pool C, alltid annan än A4 och A9)
- Input: Testrapporter från steg 4–7
- Output: Utfallsrapport (sammanfattning, identifierade risker, rekommendation)
- Grind: **G3** – Människa beslutar om funktionen går till QA

**Steg 9: QA+verksamhetsverifiering (A7/A8/A9, G4)**  
- Agent: A7, A8, A9 i QA-miljö
- Input: Funktionalitet godkänd i G3
- Output: QA-rapport + verksamhetsverifiering (faktiska användare testar)
- Grind: **G4** – Formellt godkännande för produktion

### Fas 4: Driva (10–11)

**Steg 10: Prod-deploy (A8)**  
- Agent: A8 Deploy (pool C)
- Input: G4-godkänd funktionalitet + prod-manifest
- Output: Deploy till produktion
- Validering: Smoke tests, hälsokontroller, rollback-plan klar

**Steg 11: Övervakning (A11, A12, A13)**  
- Agent: A11 Driftvakt (pool D – Gemma4 lokal), A12 Förbättring (pool C), A13 Dokumentatör (pool C)
- Input: Produktion + loggar/metrics
- Output:
  - A11: Incidentrapporter, larm, förslag på åtgärder
  - A12: Teknisk skuldrapport, refactoring-förslag
  - A13: Användar- och driftdokumentation

## Tre loopar (L1–L3)

**L1: Kodloop (steg 3)**  
Om A5 hittar problem → tillbaka till A4. Max 3 varv, sen eskalering till människa.

**L2: Testloop (steg 4–7)**  
Om tester felar → tillbaka till kodning (steg 3). Max 3 varv.

**L3: Specloop (steg 1–2)**  
Om A1 vill ha förtydligande → tillbaka till specförfattare. Max 3 varv.

## Fyra grindar (G1–G4)

**G1: Specgodkännande** (efter steg 1)  
Människa läser A1:s granskning och beslutar: godkänn / återremittera / avslå.

**G2: Storygodkännande** (efter steg 2)  
Människa godkänner nedbrytningen. Kontrollerar att stories är testbara och spårbara.

**G3: Utfallsgodkännande** (efter steg 8)  
Människa läser A10:s utfallsanalys och beslutar om funktionen är redo för QA.

**G4: Produktionsgodkännande** (efter steg 9)  
Formellt godkännande från verksamhet + QA. Krävs för prod-deploy.

## Fjorton agenter (A0–A13)

| Agent | Namn | Pool | Steg | Ansvar |
|-------|------|------|------|--------|
| A0 | Intag | A (Anthropic) | 0 | Strukturera förslag, validera dataklass |
| A1 | Specgranskare | B (OpenAI) | 1 | Granska spec, rekommendera G1 |
| A2 | Nedbrytare | C (Mistral) | 2 | Skapa user stories |
| A3 | Storygranskare | B (OpenAI) | 2 | Granska stories, rekommendera G2 |
| A4 | Kodare | A (Anthropic) | 3 | Implementera stories |
| A5 | Kodgranskare | B (OpenAI) | 3 | Granska kod innan PR-signatur |
| A6 | Testförfattare | C (Mistral) | 4 | Skriva enhetstester |
| A7 | Integrationstestare | C (Mistral) | 5, 9 | Integrationstester, QA |
| A8 | Deploy | C (Mistral) | 6, 9, 10 | Deploya till test/QA/prod |
| A9 | Systemtestare | B (OpenAI) | 7, 9 | E2E-tester, QA |
| A10 | Utfallsanalytiker | C (Mistral) | 8 | Analysera testutfall, riskbedömning |
| A11 | Driftvakt | D (Gemma4) | 11 | Övervaka produktion, larm |
| A12 | Förbättring | C (Mistral) | 11 | Identifiera teknisk skuld |
| A13 | Dokumentatör | C (Mistral) | 11 | Skriva/uppdatera dokumentation |

**Pooler:**
- **A (Anthropic Claude):** Kreativt arbete (intag, kodning)
- **B (OpenAI GPT-4):** Granskning och kritiskt tänkande
- **C (Mistral/diverse):** Strukturerat arbete (nedbrytning, test, deploy)
- **D (Gemma4 lokal):** Kostnadseffektiv övervakning

## Dataklass (0/1/2)

**Klass 0: Syntetiskt**  
- Ingen skyddad data
- Används för processutveckling, tester, demos
- Får lagras i publika GitHub-repos

**Klass 1: Pseudonymiserat**  
- Ingen PII (personnummer, namn, adresser)
- Kan användas i test-miljöer
- Kräver intern VGR-miljö (ej publika repos)

**Klass 2: Känsligt**  
- Patientdata, nycklar, produktionshemligheter
- Endast i produktionsmiljö
- Kräver fullständig audit-logg
- Får ALDRIG lämna VGR-miljö

## Git-struktur och artefakter

**Repos:**
- **Processrepo** (detta): Process, prompter, mallar, konfiguration
- **Modulrepos** (kommer): Faktisk kod för VGR Datahubb-komponenter

**Branches:**
- `main`: Stabil process/kod
- `feature/*`: Feature-utveckling
- `release/*`: Releaseförberedelser

**Artefakter i Git:**
- Specs (markdown)
- Stories (YAML eller markdown med frontmatter)
- Granskningsrapporter (markdown)
- Grindbeslut (markdown + signatur)
- Testrapporter (markdown + CI-loggar som artefakter)
- Deploy-manifest (YAML)

## Processportalen – tio vyer

Portalen är en webbaserad vy på Git-repot. Ingen separat databas.

1. **Översikt:** Sammanfattning av aktiva funktioner, grindstatus, senaste builds
2. **Min inkorg:** Åtgärder som väntar på användaren (grindbeslut, PR-signaturer)
3. **Modulvy:** Status per modul (spec, stories, tester, deploy)
4. **Funktionskatalog:** Alla funktioner, filterbara på status/dataklass/ansvarig
5. **Testkatalog:** Alla tester, täckning, senaste körningar
6. **Grindvy:** Historik för G1–G4, vem beslutade vad när
7. **Verifieringsvy:** Spårbarhet från spec → story → kod → test → deploy
8. **Driftvy:** Prod-status, incidenter, A11-rapporter
9. **Agentlogg:** Vilken agent körde vad, proveniens
10. **Dokumentation:** Genererad av A13, länkad till moduler

## Etapper (0–6)

**Etapp 0: Process + manuell körning** (vecka 36, 3–9 sep 2026)  
Målet för denna vecka. Skelett, prompter, mallar, konfiguration. Körs manuellt i LLM-chatt.

**Etapp 1: GitHub Actions-orkestrering** (vecka 37–38)  
Steg 0–3 automatiseras. CI kör A4–A9. Grindar (G1–G2) fortfarande manuella.

**Etapp 2: Temporal-orkestrering** (vecka 39–42)  
Full orkestrering. Loopar (L1–L3) automatiseras. Portalen läser från Temporal state.

**Etapp 3: Första PoC genom processen** (vecka 43–46)  
EWS (Early Warning Score) från Philips → VGR Datahubb. Första riktiga last.

**Etapp 4: Andra PoC (vecka 47–50)**  
Patientöversikt eller Axel FHIR.

**Etapp 5: Produktionssättning** (Q1 2027)  
MDR-dokumentation, CE-märkning (om tillämpligt), drift.

**Etapp 6: Skalning** (Q2 2027+)  
Fler moduler, fler team, fler loopar.

## Öppna frågor (dokumenterade)

Dessa ska INTE låsas i etapp 0, men dokumenteras som öppna:

1. **GitHub Actions vs Temporal:** Börja med Actions (etapp 1), utvärdera Temporal för etapp 2
2. **Tunn OpenRouter-klient vs ramverk:** Rekommendation = tunn klient (färre beroenden)
3. **QA-miljöns ägande:** Vem äger test-miljöer i VGR? IT-drift eller utvecklingsteam?
4. **Verksamhetsverifieringens formella status:** Är det del av G4 eller rådgivande?
5. **MDR-gräns:** Exakt vilka komponenter kräver medicinteknisk dokumentation?
6. **Driftvaktens mandat:** Hur mycket får A11 ändra autonomt? Alerting vs auto-remediation?

## Kontakt och förändring

Detta är en levande process. Förslag på förändringar: öppna issue i processrepot, märk med `process-change`.

Större förändringar (t.ex. nya agenter, nya grindar) kräver godkännande från Anders Carlius.

---

**Version:** 0.1  
**Senast uppdaterad:** 2026-09-02  
**Nästa review:** 2026-09-09 (efter etapp 0)
