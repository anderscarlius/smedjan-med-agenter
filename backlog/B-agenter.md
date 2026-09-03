# Epic B: Agenter

**Beskrivning:** Alla fjorton agenter (A0–A13) med promptkontrakt, v0-prompter, I/O-scheman och golden-exempel.

**Mål:** Varje agent ska ha:
1. Promptkontrakt (mål, pool, input-schema, output-schema, förbud)
2. V0-systemprompt (körbar, inte bara TODO)
3. Minst ett golden-exempel (komplett input + förväntad output)

**Etapp:** 0 (kontrakt + v0), 1+ (refinement)  
**Ansvarig:** Processägare  
**Status:** Pågående

---

## Agent A0: Intag

### Story B.A0.1: Skapa A0-promptkontrakt

**Som** processägare  
**vill jag** ha ett promptkontrakt för A0 Intag  
**så att** alla förstår A0:s roll och gränssnitt

**Acceptanskriterier:**
- **Given** Smedjans process
- **When** en användare behöver förstå A0
- **Then** ska promptkontrakt finnas med:
  - Agentens mål och ansvar
  - Pool (A – Anthropic Claude)
  - Input-schema (förslagsspec markdown)
  - Output-schema (strukturerad spec markdown + JSON metadata)
  - Förbud (ej skriva kod, ej besluta om godkännande, ej hantera dataklass 2)
  - Exempel på input/output-format
- **And** kontraktet ska vara markdown i `prompter/A0.md`

**Spec-referens:** docs/process.md § A0  
**Dataklass:** 0  
**Beroenden:** A.mallar.1, A.mallar.2  
**Etapp:** 0  
**Status:** todo

---

### Story B.A0.2: Skriv A0 v0-systemprompt

**Som** orkestrator  
**vill jag** ha en körbar v0-systemprompt för A0  
**så att** jag kan anropa A0 via LLM-API

**Acceptanskriterier:**
- **Given** A0-promptkontraktet
- **When** prompten används i en LLM (Claude)
- **Then** ska den innehålla:
  - Rollbeskrivning ("Du är A0 Intag-agent i Smedjan")
  - Processbeskrivning (Smedjans steg 0)
  - Input-format (hur förslagsspec ser ut)
  - Output-format (strukturerad spec enligt mall)
  - Dataklass-validering (avvisa klass 2 i dev)
  - Förbud (explicit lista)
  - Exempel (minst ett komplett)
- **And** prompten ska vara ~2000–4000 tokens
- **And** prompten ska generera korrekt output för EWS-exemplet

**Spec-referens:** docs/process.md § A0  
**Dataklass:** 0  
**Beroenden:** B.A0.1  
**Etapp:** 0  
**Status:** todo

---

### Story B.A0.3: Skapa A0 golden-exempel

**Som** kvalitetscontroller  
**vill jag** ha ett golden-exempel för A0  
**så att** jag kan validera att A0-implementationer är korrekta

**Acceptanskriterier:**
- **Given** A0 v0-prompten
- **When** A0 körs med golden-input
- **Then** ska output matcha golden-output:
  - Input: EWS-förslagsspec (syntetisk, klass 0)
  - Output: Strukturerad spec enligt mall + JSON metadata
- **And** exemplet ska vara sparat i `prompter/A0.md`
- **And** exemplet ska vara reproducerbart (samma input → samma struktur)

**Spec-referens:** docs/process.md § A0  
**Dataklass:** 0  
**Beroenden:** B.A0.2  
**Etapp:** 0  
**Status:** todo

---

## Agent A1: Specgranskare

### Story B.A1.1: Skapa A1-promptkontrakt

**Som** processägare  
**vill jag** ha ett promptkontrakt för A1 Specgranskare  
**så att** A1:s granskningskriterier är tydliga

**Acceptanskriterier:**
- **Given** Smedjans process
- **When** en användare behöver förstå A1
- **Then** ska promptkontrakt finnas med:
  - Agentens mål (granska spec, rekommendera G1)
  - Pool (B – OpenAI GPT-4)
  - Input-schema (strukturerad spec från A0)
  - Output-schema (granskningsrapport enligt mall)
  - Granskningskriterier (fullständighet, dataklass, säkerhet, realiserbarhet)
  - Förbud (ej skriva om spec, ej fatta G1-beslut)
- **And** kontraktet ska vara markdown i `prompter/A1.md`

**Spec-referens:** docs/process.md § A1  
**Dataklass:** 0  
**Beroenden:** A.mallar.3  
**Etapp:** 0  
**Status:** todo

---

### Story B.A1.2: Skriv A1 v0-systemprompt

**Som** orkestrator  
**vill jag** ha en körbar v0-systemprompt för A1  
**så att** A1 kan granska specs konsekvent

**Acceptanskriterier:**
- **Given** A1-promptkontraktet
- **When** prompten används i en LLM (GPT-4)
- **Then** ska den innehålla:
  - Rollbeskrivning ("Du är A1 Specgranskare i Smedjan")
  - Granskningskriterier (lista med detaljer)
  - Dataklass-validering (särskild uppmärksamhet på klass 2)
  - Output-format (granskningsrapport enligt mall)
  - Rekommendationslogik (godkänn/återremittera/avslå)
  - Exempel (minst ett)
- **And** prompten ska identifiera brister i en medvetet bristfällig spec

**Spec-referens:** docs/process.md § A1  
**Dataklass:** 0  
**Beroenden:** B.A1.1  
**Etapp:** 0  
**Status:** todo

---

### Story B.A1.3: Skapa A1 golden-exempel

**Som** kvalitetscontroller  
**vill jag** ha två golden-exempel för A1  
**så att** jag kan testa både godkännande och avslag

**Acceptanskriterier:**
- **Given** A1 v0-prompten
- **When** A1 körs med:
  1. En komplett, väl strukturerad spec (från B.A0.3)
  2. En bristfällig spec (t.ex. saknar dataklass-märkning)
- **Then** ska output vara:
  1. Granskningsrapport med rekommendation "godkänn"
  2. Granskningsrapport med rekommendation "återremittera" + specifika brister
- **And** exemplen ska vara sparade i `prompter/A1.md`

**Spec-referens:** docs/process.md § A1  
**Dataklass:** 0  
**Beroenden:** B.A1.2, B.A0.3  
**Etapp:** 0  
**Status:** todo

---

## Agent A2: Nedbrytare

### Story B.A2.1: Skapa A2-promptkontrakt

**Som** processägare  
**vill jag** ha ett promptkontrakt för A2 Nedbrytare  
**så att** user stories blir konsekventa

**Acceptanskriterier:**
- **Given** Smedjans process
- **When** en användare behöver förstå A2
- **Then** ska promptkontrakt finnas med:
  - Agentens mål (bryta ner spec i testbara stories)
  - Pool (C – Mistral/diverse)
  - Input-schema (godkänd spec efter G1)
  - Output-schema (user stories enligt mall)
  - Story-storlek (Small = timmar, Medium = dag, Large = 2–3 dagar)
  - Förbud (ej implementera, ej fatta G2-beslut)
- **And** kontraktet ska vara markdown i `prompter/A2.md`

**Spec-referens:** docs/process.md § A2  
**Dataklass:** 0  
**Beroenden:** A.mallar.4  
**Etapp:** 0  
**Status:** todo

---

### Story B.A2.2: Skriv A2 v0-systemprompt

**Som** orkestrator  
**vill jag** ha en körbar v0-systemprompt för A2  
**så att** A2 kan bryta ner specs effektivt

**Acceptanskriterier:**
- **Given** A2-promptkontraktet
- **When** prompten används i en LLM (Mistral)
- **Then** ska den innehålla:
  - Rollbeskrivning ("Du är A2 Nedbrytare i Smedjan")
  - Nedbrytningsprinciper (testbarhet, INVEST-kriterier)
  - Story-format (enligt mall)
  - Acceptanskriterier-format (Given/When/Then)
  - Beroende-hantering (identifiera beroenden mellan stories)
  - Exempel (minst en spec → flera stories)
- **And** stories ska vara små nog att göras på timmar–dagar

**Spec-referens:** docs/process.md § A2  
**Dataklass:** 0  
**Beroenden:** B.A2.1  
**Etapp:** 0  
**Status:** todo

---

### Story B.A2.3: Skapa A2 golden-exempel

**Som** kvalitetscontroller  
**vill jag** ha ett golden-exempel för A2  
**så att** nedbrytning av EWS-spec blir referens

**Acceptanskriterier:**
- **Given** A2 v0-prompten och EWS-spec (från B.A0.3)
- **When** A2 bryter ner specen
- **Then** ska output vara:
  - 5–10 user stories
  - Varje story enligt mall (Given/When/Then AC)
  - Tydliga beroenden
  - Alla stories dataklass 0
- **And** exemplet ska vara sparat i `prompter/A2.md`

**Spec-referens:** docs/process.md § A2  
**Dataklass:** 0  
**Beroenden:** B.A2.2, B.A0.3  
**Etapp:** 0  
**Status:** todo

---

## Agent A3: Storygranskare

### Story B.A3.1: Skapa A3-promptkontrakt

**Som** processägare  
**vill jag** ha ett promptkontrakt för A3 Storygranskare  
**så att** stories granskas innan G2

**Acceptanskriterier:**
- **Given** Smedjans process
- **When** en användare behöver förstå A3
- **Then** ska promptkontrakt finnas med:
  - Agentens mål (granska stories, rekommendera G2)
  - Pool (B – OpenAI GPT-4)
  - Input-schema (stories från A2)
  - Output-schema (granskningsrapport)
  - Granskningskriterier (INVEST, testbarhet, beroenden)
  - Förbud (ej skriva om stories, ej fatta G2-beslut)
- **And** kontraktet ska vara markdown i `prompter/A3.md`

**Spec-referens:** docs/process.md § A3  
**Dataklass:** 0  
**Beroenden:** A.mallar.3  
**Etapp:** 0  
**Status:** todo

---

### Story B.A3.2: Skriv A3 v0-systemprompt

**Som** orkestrator  
**vill jag** ha en körbar v0-systemprompt för A3  
**så att** A3 kan granska stories systematiskt

**Acceptanskriterier:**
- **Given** A3-promptkontraktet
- **When** prompten används i en LLM (GPT-4)
- **Then** ska den innehålla:
  - Rollbeskrivning ("Du är A3 Storygranskare i Smedjan")
  - INVEST-kriterier (Independent, Negotiable, Valuable, Estimable, Small, Testable)
  - AC-granskning (Given/When/Then-kvalitet)
  - Beroende-validering (cykliska beroenden, saknade beroenden)
  - Output-format (granskningsrapport)
  - Exempel (minst ett)
- **And** prompten ska identifiera bristfälliga AC

**Spec-referens:** docs/process.md § A3  
**Dataklass:** 0  
**Beroenden:** B.A3.1  
**Etapp:** 0  
**Status:** todo

---

### Story B.A3.3: Skapa A3 golden-exempel

**Som** kvalitetscontroller  
**vill jag** ha ett golden-exempel för A3  
**så att** story-granskning blir konsekvent

**Acceptanskriterier:**
- **Given** A3 v0-prompten och stories från B.A2.3
- **When** A3 granskar stories
- **Then** ska output vara:
  - Granskningsrapport enligt mall
  - Identifiering av eventuella brister
  - Rekommendation för G2 (godkänn/återremittera)
- **And** exemplet ska vara sparat i `prompter/A3.md`

**Spec-referens:** docs/process.md § A3  
**Dataklass:** 0  
**Beroenden:** B.A3.2, B.A2.3  
**Etapp:** 0  
**Status:** todo

---

## Agent A4: Kodare

### Story B.A4.1: Skapa A4-promptkontrakt

**Som** processägare  
**vill jag** ha ett promptkontrakt för A4 Kodare  
**så att** kodning följer standarder

**Acceptanskriterier:**
- **Given** Smedjans process
- **When** en användare behöver förstå A4
- **Then** ska promptkontrakt finnas med:
  - Agentens mål (implementera story)
  - Pool (A – Anthropic Claude)
  - Input-schema (user story med AC)
  - Output-schema (PR med kod + grundläggande unit-tester)
  - Kodstandarder (språkspecifikt, t.ex. PEP8 för Python)
  - Förbud (ej merge, ej deploy, ej ändra spec)
- **And** kontraktet ska vara markdown i `prompter/A4.md`

**Spec-referens:** docs/process.md § A4  
**Dataklass:** 0  
**Beroenden:** A.mallar.4  
**Etapp:** 0  
**Status:** todo

---

### Story B.A4.2: Skriv A4 v0-systemprompt

**Som** orkestrator  
**vill jag** ha en körbar v0-systemprompt för A4  
**så att** A4 kan koda enligt best practices

**Acceptanskriterier:**
- **Given** A4-promptkontraktet
- **When** prompten används i en LLM (Claude)
- **Then** ska den innehålla:
  - Rollbeskrivning ("Du är A4 Kodare i Smedjan")
  - Story-tolkningsprinciper (AC = krav)
  - Kodstandarder (PEP8/ESLint/whatever per språk)
  - Test-driven development (skriv tester först om möjligt)
  - Commit-meddelanden (format)
  - PR-beskrivning (länka till story, sammanfatta ändringar)
  - Exempel (minst en story → kod)
- **And** koden ska vara produktionsklar

**Spec-referens:** docs/process.md § A4  
**Dataklass:** 0  
**Beroenden:** B.A4.1  
**Etapp:** 0  
**Status:** todo

---

### Story B.A4.3: Skapa A4 golden-exempel

**Som** kvalitetscontroller  
**vill jag** ha ett golden-exempel för A4  
**så att** kodkvalitet är tydlig

**Acceptanskriterier:**
- **Given** A4 v0-prompten och en story från B.A2.3
- **When** A4 kodar
- **Then** ska output vara:
  - Kod som uppfyller AC
  - Grundläggande unit-tester (minst en per AC)
  - PR-beskrivning
- **And** exemplet ska vara sparat i `prompter/A4.md` (pseudokod OK)

**Spec-referens:** docs/process.md § A4  
**Dataklass:** 0  
**Beroenden:** B.A4.2, B.A2.3  
**Etapp:** 0  
**Status:** todo

---

## Agent A5: Kodgranskare

### Story B.A5.1: Skapa A5-promptkontrakt

**Som** processägare  
**vill jag** ha ett promptkontrakt för A5 Kodgranskare  
**så att** kodgranskning blir systematisk

**Acceptanskriterier:**
- **Given** Smedjans process och separation S1
- **When** en användare behöver förstå A5
- **Then** ska promptkontrakt finnas med:
  - Agentens mål (granska kod, föreslå förbättringar)
  - Pool (B – OpenAI GPT-4, annan än A4)
  - Input-schema (PR från A4)
  - Output-schema (granskningskommentarer)
  - Granskningskriterier (korrekthet, läsbarhet, säkerhet, prestanda)
  - Förbud (ej merge, ej skriva kod själv)
- **And** kontraktet ska vara markdown i `prompter/A5.md`

**Spec-referens:** docs/process.md § A5, S1  
**Dataklass:** 0  
**Beroenden:** B.A4.1  
**Etapp:** 0  
**Status:** todo

---

### Story B.A5.2: Skriv A5 v0-systemprompt

**Som** orkestrator  
**vill jag** ha en körbar v0-systemprompt för A5  
**så att** kodgranskning är konsekvent

**Acceptanskriterier:**
- **Given** A5-promptkontraktet
- **When** prompten används i en LLM (GPT-4)
- **Then** ska den innehålla:
  - Rollbeskrivning ("Du är A5 Kodgranskare i Smedjan")
  - Granskningschecklista (korrekthet, säkerhet, testbarhet, läsbarhet)
  - AC-validering (kod uppfyller story-AC)
  - Säkerhetsfokus (SQL injection, XSS, secrets i kod)
  - Output-format (lista med kommentarer, varje med allvarlighet)
  - Exempel (minst ett)
- **And** prompten ska identifiera säkerhetsbrister

**Spec-referens:** docs/process.md § A5  
**Dataklass:** 0  
**Beroenden:** B.A5.1  
**Etapp:** 0  
**Status:** todo

---

### Story B.A5.3: Skapa A5 golden-exempel

**Som** kvalitetscontroller  
**vill jag** ha två golden-exempel för A5  
**så att** jag kan testa både godkänd och underkänd kod

**Acceptanskriterier:**
- **Given** A5 v0-prompten
- **When** A5 granskar:
  1. Kod från B.A4.3 (bra kod)
  2. Kod med medveten säkerhets brist (t.ex. SQL injection)
- **Then** ska output vara:
  1. Granskningsrapport med "godkänn" (eventuellt minor comments)
  2. Granskningsrapport med "återremittera" + specifik säkerhetsbrist
- **And** exemplen ska vara sparade i `prompter/A5.md`

**Spec-referens:** docs/process.md § A5  
**Dataklass:** 0  
**Beroenden:** B.A5.2, B.A4.3  
**Etapp:** 0  
**Status:** todo

---

## Agent A6: Testförfattare

### Story B.A6.1: Skapa A6-promptkontrakt

**Som** processägare  
**vill jag** ha ett promptkontrakt för A6 Testförfattare  
**så att** testtäckning blir hög

**Acceptanskriterier:**
- **Given** Smedjans process och separation S2
- **When** en användare behöver förstå A6
- **Then** ska promptkontrakt finnas med:
  - Agentens mål (skriva unit-tester, nå >80% täckning)
  - Pool (C – Mistral, annan än A4)
  - Input-schema (merged kod från steg 3)
  - Output-schema (PR med unit-tester)
  - Testkrav (täckning, edge cases, negativa tester)
  - Förbud (ej ändra produktionskod, ej merge)
- **And** kontraktet ska vara markdown i `prompter/A6.md`

**Spec-referens:** docs/process.md § A6, S2  
**Dataklass:** 0  
**Beroenden:** B.A4.1  
**Etapp:** 0  
**Status:** todo

---

### Story B.A6.2: Skriv A6 v0-systemprompt

**Som** orkestrator  
**vill jag** ha en körbar v0-systemprompt för A6  
**så att** tester blir omfattande

**Acceptanskriterier:**
- **Given** A6-promptkontraktet
- **When** prompten används i en LLM (Mistral)
- **Then** ska den innehålla:
  - Rollbeskrivning ("Du är A6 Testförfattare i Smedjan")
  - Testkrav (>80% line coverage, >70% branch coverage)
  - Testmönster (AAA: Arrange, Act, Assert)
  - Edge cases (null, empty, max values)
  - Negativa tester (fel input, exceptions)
  - Testramverk per språk (pytest, Jest, JUnit)
  - Exempel (minst ett)
- **And** tester ska vara oberoende (kan köras i valfri ordning)

**Spec-referens:** docs/process.md § A6  
**Dataklass:** 0  
**Beroenden:** B.A6.1  
**Etapp:** 0  
**Status:** todo

---

### Story B.A6.3: Skapa A6 golden-exempel

**Som** kvalitetscontroller  
**vill jag** ha ett golden-exempel för A6  
**så att** testkvalitet är tydlig

**Acceptanskriterier:**
- **Given** A6 v0-prompten och kod från B.A4.3
- **When** A6 skriver tester
- **Then** ska output vara:
  - Unit-tester med >80% täckning
  - Edge case-tester
  - Negativa tester
- **And** exemplet ska vara sparat i `prompter/A6.md`

**Spec-referens:** docs/process.md § A6  
**Dataklass:** 0  
**Beroenden:** B.A6.2, B.A4.3  
**Etapp:** 0  
**Status:** todo

---

## Agent A7: Integrationstestare

### Story B.A7.1: Skapa A7-promptkontrakt

**Som** processägare  
**vill jag** ha ett promptkontrakt för A7 Integrationstestare  
**så att** integrationer testas

**Acceptanskriterier:**
- **Given** Smedjans process
- **When** en användare behöver förstå A7
- **Then** ska promptkontrakt finnas med:
  - Agentens mål (testa API-kontrakt, databas, externa tjänster)
  - Pool (C – Mistral)
  - Input-schema (modul med unit-tester)
  - Output-schema (integrationstester + rapport)
  - Testscope (API, DB, externa tjänster, inte UI)
  - Förbud (ej ändra produktionskod)
- **And** kontraktet ska vara markdown i `prompter/A7.md`

**Spec-referens:** docs/process.md § A7  
**Dataklass:** 0  
**Beroenden:** B.A6.1  
**Etapp:** 0  
**Status:** todo

---

### Story B.A7.2: Skriv A7 v0-systemprompt

**Som** orkestrator  
**vill jag** ha en körbar v0-systemprompt för A7  
**så att** integrationer blir robusta

**Acceptanskriterier:**
- **Given** A7-promptkontraktet
- **When** prompten används i en LLM (Mistral)
- **Then** ska den innehålla:
  - Rollbeskrivning ("Du är A7 Integrationstestare i Smedjan")
  - Integrationstestmönster (API-tester, DB-tester, mocking)
  - Testmiljö-krav (Docker, testdatabas)
  - Kontrakttestning (API-kontrakt enligt spec)
  - Felhantering (timeout, connection errors)
  - Exempel (minst ett)
- **And** tester ska köras mot faktisk testmiljö

**Spec-referens:** docs/process.md § A7  
**Dataklass:** 0  
**Beroenden:** B.A7.1  
**Etapp:** 0  
**Status:** todo

---

### Story B.A7.3: Skapa A7 golden-exempel

**Som** kvalitetscontroller  
**vill jag** ha ett golden-exempel för A7  
**så att** integrationstester blir tydliga

**Acceptanskriterier:**
- **Given** A7 v0-prompten och en modul med API
- **When** A7 skriver integrationstester
- **Then** ska output vara:
  - Integrationstester för API-endpoints
  - DB-integrationstester
  - Mock för externa tjänster
- **And** exemplet ska vara sparat i `prompter/A7.md`

**Spec-referens:** docs/process.md § A7  
**Dataklass:** 0  
**Beroenden:** B.A7.2  
**Etapp:** 0  
**Status:** todo

---

## Agent A8: Deploy

### Story B.A8.1: Skapa A8-promptkontrakt

**Som** processägare  
**vill jag** ha ett promptkontrakt för A8 Deploy  
**så att** deployment blir konsekvent

**Acceptanskriterier:**
- **Given** Smedjans process och separation S6
- **When** en användare behöver förstå A8
- **Then** ska promptkontrakt finnas med:
  - Agentens mål (deploy till test/QA/prod enligt manifest)
  - Pool (C – Mistral)
  - Input-schema (testad kod + deploy-manifest)
  - Output-schema (deploy-rapport + miljö-URL)
  - Deploy-procedur (Docker Compose / K8s)
  - Förbud (ej ändra manifest, ej besluta om deploy, ej deploy utan godkänd grind)
- **And** kontraktet ska vara markdown i `prompter/A8.md`

**Spec-referens:** docs/process.md § A8, S6  
**Dataklass:** 0  
**Beroenden:** A.mallar.2  
**Etapp:** 0  
**Status:** todo

---

### Story B.A8.2: Skriv A8 v0-systemprompt

**Som** orkestrator  
**vill jag** ha en körbar v0-systemprompt för A8  
**så att** deploy blir säker

**Acceptanskriterier:**
- **Given** A8-promptkontraktet
- **When** prompten används i en LLM (Mistral)
- **Then** ska den innehålla:
  - Rollbeskrivning ("Du är A8 Deploy-agent i Smedjan")
  - Deploy-procedur (steg för steg)
  - Hälsokontroller (endpoints, readiness/liveness)
  - Rollback-plan (hur det sker om deploy felar)
  - Miljö-separation (test/QA/prod)
  - Secrets-hantering (aldrig logga secrets)
  - Exempel (minst ett)
- **And** prompten ska aldrig deploya utan giltigt manifest

**Spec-referens:** docs/process.md § A8  
**Dataklass:** 0  
**Beroenden:** B.A8.1  
**Etapp:** 0  
**Status:** todo

---

### Story B.A8.3: Skapa A8 golden-exempel

**Som** kvalitetscontroller  
**vill jag** ha ett golden-exempel för A8  
**så att** deploy-procedur är tydlig

**Acceptanskriterier:**
- **Given** A8 v0-prompten och ett deploy-manifest
- **When** A8 deployar till test-miljö
- **Then** ska output vara:
  - Deploy-rapport (framgång/misslyckande)
  - Miljö-URL
  - Hälsokontroll-resultat
- **And** exemplet ska vara sparat i `prompter/A8.md`

**Spec-referens:** docs/process.md § A8  
**Dataklass:** 0  
**Beroenden:** B.A8.2  
**Etapp:** 0  
**Status:** todo

---

## Agent A9: Systemtestare

### Story B.A9.1: Skapa A9-promptkontrakt

**Som** processägare  
**vill jag** ha ett promptkontrakt för A9 Systemtestare  
**så att** E2E-tester blir omfattande

**Acceptanskriterier:**
- **Given** Smedjans process och separation S3
- **When** en användare behöver förstå A9
- **Then** ska promptkontrakt finnas med:
  - Agentens mål (E2E-tester, användarflöden, säkerhet, prestanda)
  - Pool (B – OpenAI GPT-4, annan än A4, helst än A6)
  - Input-schema (körande test-deploy)
  - Output-schema (systemtestrapport enligt mall)
  - Testscope (hela stacken, UI om tillämpligt)
  - Förbud (ej ändra kod, ej besluta om G3)
- **And** kontraktet ska vara markdown i `prompter/A9.md`

**Spec-referens:** docs/process.md § A9, S3  
**Dataklass:** 0  
**Beroenden:** A.mallar.5  
**Etapp:** 0  
**Status:** todo

---

### Story B.A9.2: Skriv A9 v0-systemprompt

**Som** orkestrator  
**vill jag** ha en körbar v0-systemprompt för A9  
**så att** systemtester blir realistiska

**Acceptanskriterier:**
- **Given** A9-promptkontraktet
- **When** prompten används i en LLM (GPT-4)
- **Then** ska den innehålla:
  - Rollbeskrivning ("Du är A9 Systemtestare i Smedjan")
  - E2E-testmönster (användarflöden från story-AC)
  - Prestandatester (response time, load)
  - Säkerhetstester (auth, authorization, input validation)
  - Testverktyg (Playwright, Selenium, k6)
  - Output-format (systemtestrapport enligt mall)
  - Exempel (minst ett)
- **And** tester ska köras mot faktisk deploy

**Spec-referens:** docs/process.md § A9  
**Dataklass:** 0  
**Beroenden:** B.A9.1  
**Etapp:** 0  
**Status:** todo

---

### Story B.A9.3: Skapa A9 golden-exempel

**Som** kvalitetscontroller  
**vill jag** ha ett golden-exempel för A9  
**så att** E2E-tester blir tydliga

**Acceptanskriterier:**
- **Given** A9 v0-prompten och en körande test-deploy
- **When** A9 kör E2E-tester
- **Then** ska output vara:
  - Systemtestrapport med testscenarier
  - Resultat (pass/fail per scenario)
  - Prestanda-mätningar
  - Säkerhetskontroller
- **And** exemplet ska vara sparat i `prompter/A9.md`

**Spec-referens:** docs/process.md § A9  
**Dataklass:** 0  
**Beroenden:** B.A9.2  
**Etapp:** 0  
**Status:** todo

---

## Agent A10: Utfallsanalytiker

### Story B.A10.1: Skapa A10-promptkontrakt

**Som** processägare  
**vill jag** ha ett promptkontrakt för A10 Utfallsanalytiker  
**så att** utfallsanalys blir objektiv

**Acceptanskriterier:**
- **Given** Smedjans process och separation S4
- **When** en användare behöver förstå A10
- **Then** ska promptkontrakt finnas med:
  - Agentens mål (analysera testresultat, rekommendera G3)
  - Pool (C – Mistral, alltid annan instans än A4 och A9)
  - Input-schema (testrapporter från steg 4–7)
  - Output-schema (utfallsrapport enligt mall)
  - Analyskriterier (risker, kodkvalitet, prestanda, säkerhet)
  - Förbud (ej fatta G3-beslut, ej vara involverad i kodning/testning)
- **And** kontraktet ska vara markdown i `prompter/A10.md`

**Spec-referens:** docs/process.md § A10, S4  
**Dataklass:** 0  
**Beroenden:** A.mallar.7  
**Etapp:** 0  
**Status:** todo

---

### Story B.A10.2: Skriv A10 v0-systemprompt

**Som** orkestrator  
**vill jag** ha en körbar v0-systemprompt för A10  
**så att** riskbedömning blir konsekvent

**Acceptanskriterier:**
- **Given** A10-promptkontraktet
- **When** prompten används i en LLM (Mistral)
- **Then** ska den innehålla:
  - Rollbeskrivning ("Du är A10 Utfallsanalytiker i Smedjan")
  - Riskanalys-metod (allvarlighet × sannolikhet)
  - Analysområden (testresultat, kodkvalitet, prestanda, säkerhet)
  - Output-format (utfallsrapport enligt mall)
  - Rekommendationslogik (redo/ej redo för QA)
  - Exempel (minst ett)
- **And** prompten ska vara objektiv (ej påverkad av tidigare inblandning)

**Spec-referens:** docs/process.md § A10  
**Dataklass:** 0  
**Beroenden:** B.A10.1  
**Etapp:** 0  
**Status:** todo

---

### Story B.A10.3: Skapa A10 golden-exempel

**Som** kvalitetscontroller  
**vill jag** ha ett golden-exempel för A10  
**så att** utfallsanalys blir tydlig

**Acceptanskriterier:**
- **Given** A10 v0-prompten och testrapporter (från B.A6.3, B.A7.3, B.A9.3)
- **When** A10 analyserar
- **Then** ska output vara:
  - Utfallsrapport enligt mall
  - Riskbedömning
  - Rekommendation för G3
- **And** exemplet ska vara sparat i `prompter/A10.md`

**Spec-referens:** docs/process.md § A10  
**Dataklass:** 0  
**Beroenden:** B.A10.2, B.A9.3  
**Etapp:** 0  
**Status:** todo

---

## Agent A11: Driftvakt

### Story B.A11.1: Skapa A11-promptkontrakt

**Som** processägare  
**vill jag** ha ett promptkontrakt för A11 Driftvakt  
**så att** övervakning blir systematisk

**Acceptanskriterier:**
- **Given** Smedjans process och separation S5
- **When** en användare behöver förstå A11
- **Then** ska promptkontrakt finnas med:
  - Agentens mål (övervaka prod, larma, föreslå åtgärder)
  - Pool (D – Gemma4 lokal, kostnadseffektiv)
  - Input-schema (prod-loggar, metrics)
  - Output-schema (incidentrapport, larm)
  - Övervakningsområden (errors, latency, availability)
  - Förbud (ej ändra prod utan människa, dokumentera mandat)
- **And** kontraktet ska vara markdown i `prompter/A11.md`

**Spec-referens:** docs/process.md § A11, S5  
**Dataklass:** 0  
**Beroenden:** Inga  
**Etapp:** 0  
**Status:** todo

---

### Story B.A11.2: Skriv A11 v0-systemprompt

**Som** orkestrator  
**vill jag** ha en körbar v0-systemprompt för A11  
**så att** driftövervakning blir proaktiv

**Acceptanskriterier:**
- **Given** A11-promptkontraktet
- **When** prompten används i en LLM (Gemma4)
- **Then** ska den innehålla:
  - Rollbeskrivning ("Du är A11 Driftvakt i Smedjan")
  - Övervakningskriterier (error rate, latency, availability)
  - Larm-tröskel (när larma människor)
  - Incidenthantering (dokumentera, eskalera)
  - Förbud (ej auto-remediate utan mandat, öppen fråga)
  - Exempel (minst ett)
- **And** prompten ska vara försiktig (larma vid tvivel)

**Spec-referens:** docs/process.md § A11  
**Dataklass:** 0  
**Beroenden:** B.A11.1  
**Etapp:** 0  
**Status:** todo

---

### Story B.A11.3: Skapa A11 golden-exempel

**Som** kvalitetscontroller  
**vill jag** ha ett golden-exempel för A11  
**så att** driftövervakning blir tydlig

**Acceptanskriterier:**
- **Given** A11 v0-prompten och syntetiska prod-loggar med en incident
- **When** A11 övervakar
- **Then** ska output vara:
  - Incidentrapport
  - Larm till ansvarig
  - Förslag på åtgärd
- **And** exemplet ska vara sparat i `prompter/A11.md`

**Spec-referens:** docs/process.md § A11  
**Dataklass:** 0  
**Beroenden:** B.A11.2  
**Etapp:** 0  
**Status:** todo

---

## Agent A12: Förbättring

### Story B.A12.1: Skapa A12-promptkontrakt

**Som** processägare  
**vill jag** ha ett promptkontrakt för A12 Förbättring  
**så att** teknisk skuld identifieras

**Acceptanskriterier:**
- **Given** Smedjans process och separation S5
- **When** en användare behöver förstå A12
- **Then** ska promptkontrakt finnas med:
  - Agentens mål (identifiera teknisk skuld, föreslå refactoring)
  - Pool (C – Mistral, annan än A11)
  - Input-schema (prod-kod, metrics, feedback)
  - Output-schema (teknisk skuld-rapport, refactoring-förslag)
  - Analysområden (kod-komplexitet, duplicering, prestanda, säkerhet)
  - Förbud (ej implementera utan godkännande)
- **And** kontraktet ska vara markdown i `prompter/A12.md`

**Spec-referens:** docs/process.md § A12, S5  
**Dataklass:** 0  
**Beroenden:** Inga  
**Etapp:** 0  
**Status:** todo

---

### Story B.A12.2: Skriv A12 v0-systemprompt

**Som** orkestrator  
**vill jag** ha en körbar v0-systemprompt för A12  
**så att** förbättring blir kontinuerlig

**Acceptanskriterier:**
- **Given** A12-promptkontraktet
- **When** prompten används i en LLM (Mistral)
- **Then** ska den innehålla:
  - Rollbeskrivning ("Du är A12 Förbättring-agent i Smedjan")
  - Teknisk skuld-kategorier (arkitektur, kod, prestanda, säkerhet)
  - Prioritering (påverkan × kostnad att fixa)
  - Output-format (teknisk skuld-rapport)
  - Exempel (minst ett)
- **And** förslag ska vara konkreta (inte vaga)

**Spec-referens:** docs/process.md § A12  
**Dataklass:** 0  
**Beroenden:** B.A12.1  
**Etapp:** 0  
**Status:** todo

---

### Story B.A12.3: Skapa A12 golden-exempel

**Som** kvalitetscontroller  
**vill jag** ha ett golden-exempel för A12  
**så att** teknisk skuld-analys blir tydlig

**Acceptanskriterier:**
- **Given** A12 v0-prompten och en kodbas med identifierbar teknisk skuld
- **When** A12 analyserar
- **Then** ska output vara:
  - Teknisk skuld-rapport
  - Prioriterade förbättringsförslag
- **And** exemplet ska vara sparat i `prompter/A12.md`

**Spec-referens:** docs/process.md § A12  
**Dataklass:** 0  
**Beroenden:** B.A12.2  
**Etapp:** 0  
**Status:** todo

---

## Agent A13: Dokumentatör

### Story B.A13.1: Skapa A13-promptkontrakt

**Som** processägare  
**vill jag** ha ett promptkontrakt för A13 Dokumentatör  
**så att** dokumentation hålls uppdaterad

**Acceptanskriterier:**
- **Given** Smedjans process
- **When** en användare behöver förstå A13
- **Then** ska promptkontrakt finnas med:
  - Agentens mål (skriva/uppdatera användar- och driftdokumentation)
  - Pool (C – Mistral)
  - Input-schema (kod, specs, deployment)
  - Output-schema (markdown-dokumentation)
  - Dokumentationstyper (API-docs, användarguide, drift-runbook)
  - Förbud (ej ändra kod, ej besluta om dokumentationsstandard)
- **And** kontraktet ska vara markdown i `prompter/A13.md`

**Spec-referens:** docs/process.md § A13  
**Dataklass:** 0  
**Beroenden:** Inga  
**Etapp:** 0  
**Status:** todo

---

### Story B.A13.2: Skriv A13 v0-systemprompt

**Som** orkestrator  
**vill jag** ha en körbar v0-systemprompt för A13  
**så att** dokumentation blir användbar

**Acceptanskriterier:**
- **Given** A13-promptkontraktet
- **When** prompten används i en LLM (Mistral)
- **Then** ska den innehålla:
  - Rollbeskrivning ("Du är A13 Dokumentatör i Smedjan")
  - Dokumentationsstandard (struktur, tonalitet, exempel)
  - Målgrupper (användare, drift, utvecklare)
  - Output-format (markdown, API-doc-format)
  - Exempel (minst ett)
- **And** dokumentation ska vara tydlig och koncis

**Spec-referens:** docs/process.md § A13  
**Dataklass:** 0  
**Beroenden:** B.A13.1  
**Etapp:** 0  
**Status:** todo

---

### Story B.A13.3: Skapa A13 golden-exempel

**Som** kvalitetscontroller  
**vill jag** ha ett golden-exempel för A13  
**så att** dokumentation blir tydlig

**Acceptanskriterier:**
- **Given** A13 v0-prompten och en modul (t.ex. EWS från tidigare exempel)
- **When** A13 dokumenterar
- **Then** ska output vara:
  - Användardokumentation (hur man använder funktionen)
  - API-dokumentation (endpoints, parametrar)
  - Drift-runbook (hur man deployar, övervakar)
- **And** exemplet ska vara sparat i `prompter/A13.md`

**Spec-referens:** docs/process.md § A13  
**Dataklass:** 0  
**Beroenden:** B.A13.2  
**Etapp:** 0  
**Status:** todo

---

## Sammanfattning

**Totalt:** 42 stories (3 per agent: kontrakt, prompt, exempel)  
**Etapp 0:** Alla 42 stories  
**Prioritet vecka 3–9 sep:**
- **Fredag 4 sep:** A0–A3 (12 stories)
- **Lördag 5 sep:** A4–A7 (12 stories)
- **Söndag 6 sep:** A8 (3 stories)
- **Måndag 7 sep:** A9–A13 (15 stories)

**Status:** Alla todo, kan påbörjas efter mallar (A.mallar.*) är klara
