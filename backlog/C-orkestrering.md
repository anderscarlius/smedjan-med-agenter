# Epic C: Orkestrering

**Beskrivning:** Tillståndsmaskin för steg 0–11, loopar L1–L3, OpenRouter-klient, proveniens-schema och körningslogik.

**Mål:** Definiera hur processen exekveras, först manuellt (etapp 0), sen via GitHub Actions (etapp 1), slutligen Temporal (etapp 2+).

**Etapp:** 0 (spec + stubs), 1–2 (implementation)  
**Ansvarig:** Systemarkitekt  
**Status:** Spec pågående

---

## Stories

### Story C.steg.1: Definiera tillståndsmaskin för steg 0–11

**Som** systemarkitekt  
**vill jag** ha en formell tillståndsmaskin  
**så att** processteg och övergångar är tydliga

**Acceptanskriterier:**
- **Given** Smedjans 12 steg (0–11)
- **When** tillståndsmaskinen definieras
- **Then** ska den innehålla:
  - Tillstånd (step_0_intake, step_1_spec_review, ..., step_11_monitoring)
  - Övergångar (vilka steg som kan följas av vilka)
  - Triggers (vad startar en övergång: grind-godkännande, CI-pass, människa)
  - Loopar (L1, L2, L3 med max-varv)
- **And** definitionen ska vara maskinläsbar (YAML eller JSON)

**Spec-referens:** docs/process.md § Steg  
**Dataklass:** 0  
**Beroenden:** Inga  
**Etapp:** 0  
**Status:** todo

---

### Story C.loopar.1: Definiera looplogik L1–L3

**Som** systemarkitekt  
**vill jag** ha formell looplogik  
**så att** feedbackloopar är explicita

**Acceptanskriterier:**
- **Given** Smedjans tre loopar (L1 kod, L2 test, L3 spec)
- **When** looplogiken definieras
- **Then** ska den innehålla:
  - L1: A4 → A5 → (fail) → A4, max 3 varv
  - L2: Steg 3 → 4–7 → (fail) → steg 3, max 3 varv
  - L3: Förslagsspec → A1 → (återremittera) → spec-författare, max 3 varv
  - Eskalering: Efter max varv → människa beslutar
- **And** definitionen ska vara maskinläsbar

**Spec-referens:** docs/process.md § Loopar  
**Dataklass:** 0  
**Beroenden:** C.steg.1  
**Etapp:** 0  
**Status:** todo

---

### Story C.openrouter.1: Skapa OpenRouter-klient API-kontrakt

**Som** systemarkitekt  
**vill jag** ha ett API-kontrakt för OpenRouter-klienten  
**så att** orkestratorn kan anropa agenter

**Acceptanskriterier:**
- **Given** OpenRouter API-dokumentation
- **When** klienten specificeras
- **Then** ska kontraktet innehålla:
  - Metoder: `call_agent(agent_id, prompt, input, pool)`
  - Pool-mapping (A→claude-3-opus, B→gpt-4, C→mistral, D→local-gemma4)
  - Autentisering (API-nyckel, ej i repo)
  - Retry-logik (exponential backoff)
  - Rate limiting
- **And** kontraktet ska vara dokumenterat i markdown

**Spec-referens:** docs/process.md § Agenter  
**Dataklass:** 0  
**Beroenden:** Inga  
**Etapp:** 0  
**Status:** todo

---

### Story C.openrouter.2: Implementera OpenRouter-klient stub

**Som** utvecklare  
**vill jag** ha en stub för OpenRouter-klienten  
**så att** jag kan testa orkestrering utan riktiga API-anrop

**Acceptanskriterier:**
- **Given** OpenRouter-klient-kontraktet
- **When** stubben implementeras
- **Then** ska den:
  - Ha samma API som riktig klient
  - Returnera mock-svar (läsbar från filer)
  - Logga alla anrop
  - Kunna köras lokalt utan API-nycklar
- **And** stubben ska vara Python eller Node.js

**Spec-referens:** C.openrouter.1  
**Dataklass:** 0  
**Beroenden:** C.openrouter.1  
**Etapp:** 0  
**Status:** todo

---

### Story C.openrouter.3: Implementera riktig OpenRouter-klient

**Som** utvecklare  
**vill jag** ha en riktig OpenRouter-klient  
**så att** orkestratorn kan anropa faktiska LLM:er

**Acceptanskriterier:**
- **Given** OpenRouter-klient-kontraktet
- **When** klienten implementeras
- **Then** ska den:
  - Anropa OpenRouter API
  - Hantera autentisering (från env-var)
  - Implementera retry + rate limiting
  - Logga tokens och kostnad
  - Casta undantag vid fel
- **And** klienten ska köras i etapp 1+

**Spec-referens:** C.openrouter.1  
**Dataklass:** 0  
**Beroenden:** C.openrouter.1  
**Etapp:** 1  
**Status:** todo

---

### Story C.proveniens.1: Definiera proveniens-schema

**Som** systemarkitekt  
**vill jag** ha ett proveniens-schema  
**så att** varje artefakt har spårbar historik

**Acceptanskriterier:**
- **Given** Smedjans krav på spårbarhet
- **When** proveniens-schemat definieras
- **Then** ska det innehålla:
  - `artifact_id` (UUID)
  - `artifact_type` (spec/story/code/test/report/decision)
  - `created_by` (agent_id eller human_id)
  - `created_at` (ISO 8601 timestamp)
  - `input_artifacts` (lista av artifact_id:n)
  - `git_commit` (commit SHA)
  - `data_class` (0/1/2)
  - `pool` (A/B/C/D om agent)
- **And** schemat ska vara JSON Schema

**Spec-referens:** docs/process.md § Git-struktur  
**Dataklass:** 0  
**Beroenden:** A.format.1  
**Etapp:** 0  
**Status:** todo

---

### Story C.orkestrering.1: Skriv orkestrator-spec för etapp 0

**Som** systemarkitekt  
**vill jag** ha en spec för manuell orkestrering  
**så att** användare kan köra processen steg för steg

**Acceptanskriterier:**
- **Given** Smedjans steg och grindar
- **When** orkestrator-spec för etapp 0 skrivs
- **Then** ska den innehålla:
  - Instruktioner för varje steg (vilken prompt, vilken input, var output sparas)
  - Grind-instruktioner (vem beslutar, vilket format)
  - Loop-instruktioner (hur man itererar manuellt)
  - Exempel (EWS steg 0–2)
- **And** specen ska vara markdown

**Spec-referens:** docs/process.md  
**Dataklass:** 0  
**Beroenden:** C.steg.1, C.loopar.1  
**Etapp:** 0  
**Status:** todo

---

### Story C.orkestrering.2: Skriv orkestrator-spec för etapp 1 (GitHub Actions)

**Som** systemarkitekt  
**vill jag** ha en spec för GitHub Actions-orkestrering  
**så att** steg 0–7 kan automatiseras

**Acceptanskriterier:**
- **Given** GitHub Actions-dokumentation
- **When** orkestrator-spec för etapp 1 skrivs
- **Then** ska den innehålla:
  - Workflow-triggers (PR open, commit push)
  - Jobs per steg (intake, spec_review, breakdown, coding, testing)
  - Grind-integration (manuella approve-steg för G1–G4)
  - Secrets-hantering (OpenRouter API-nyckel)
  - Artefakt-lagring (GitHub Artifacts eller Git commits)
- **And** specen ska vara markdown + exempel-YAML

**Spec-referens:** docs/process.md  
**Dataklass:** 0  
**Beroenden:** C.orkestrering.1  
**Etapp:** 0 (spec), 1 (implementation)  
**Status:** todo

---

### Story C.orkestrering.3: Skriv orkestrator-spec för etapp 2+ (Temporal)

**Som** systemarkitekt  
**vill jag** ha en spec för Temporal-orkestrering  
**så att** hela processen kan köras som workflows

**Acceptanskriterier:**
- **Given** Temporal-dokumentation
- **When** orkestrator-spec för etapp 2+ skrivs
- **Then** ska den innehålla:
  - Workflow-definition (steg som activities)
  - Loop-implementation (med max-varv)
  - Grind-implementation (human-in-the-loop signals)
  - State-persistens (Temporal tar hand om)
  - Retry-strategier per activity
- **And** specen ska vara markdown + exempel-pseudokod

**Spec-referens:** docs/process.md  
**Dataklass:** 0  
**Beroenden:** C.orkestrering.2  
**Etapp:** 0 (spec), 2+ (implementation)  
**Status:** todo

---

### Story C.ci-facit.1: Dokumentera CI-är-facit-principen

**Som** processägare  
**vill jag** ha dokumentation för P4 (CI är facit)  
**så att** alla förstår att automatiska tester avgör

**Acceptanskriterier:**
- **Given** Princip P4 från process.md
- **When** dokumentationen skrivs
- **Then** ska den innehålla:
  - Vad "CI är facit" betyder
  - Vilka tester som är bindande (unit, integration, E2E)
  - Vad som inte är facit (manuella tester utan AC, subjektiva bedömningar)
  - Hur man eskalerar om CI är fel (ändra testet, inte override:a)
- **And** dokumentationen ska vara markdown

**Spec-referens:** docs/process.md § P4  
**Dataklass:** 0  
**Beroenden:** Inga  
**Etapp:** 0  
**Status:** todo

---

### Story C.korning.1: Dokumentera körningsmodell för etapp 0

**Som** användare  
**vill jag** veta hur jag kör en story manuellt  
**så att** jag kan exekvera processen innan automatisering

**Acceptanskriterier:**
- **Given** Smedjans process och prompter
- **When** körningsmodellen dokumenteras
- **Then** ska den innehålla:
  - Steg-för-steg-instruktioner (välj story, hämta prompt, kör i LLM, validera output)
  - Var input/output sparas (i `korningar/<funktion>/`)
  - Hur man dokumenterar proveniens (metadata-fil)
  - Exempel (EWS steg 0)
- **And** dokumentationen ska vara markdown i `docs/`

**Spec-referens:** docs/process.md, backlog/INDEX.md  
**Dataklass:** 0  
**Beroenden:** C.orkestrering.1  
**Etapp:** 0  
**Status:** todo

---

### Story C.etapp1.1: Skapa GitHub Actions workflow-skelett

**Som** utvecklare  
**vill jag** ha ett workflow-skelett för etapp 1  
**så att** jag kan påbörja automatisering

**Acceptanskriterier:**
- **Given** Orkestrator-spec för etapp 1
- **When** workflow-skelettet skapas
- **Then** ska det innehålla:
  - `.github/workflows/smedjan.yml`
  - Jobs för steg 0–3 (intake, spec_review, breakdown, coding)
  - Stub-steg (loggar "TODO: implementera steg X")
  - Manual-approve för G1–G2
- **And** workflow ska köras på PR-events

**Spec-referens:** C.orkestrering.2  
**Dataklass:** 0  
**Beroenden:** C.orkestrering.2  
**Etapp:** 1  
**Status:** todo

---

## Sammanfattning

**Totalt:** 12 stories  
**Etapp 0:** 7 stories (spec + stubs)  
**Etapp 1+:** 5 stories (implementation)

**Prioritet vecka 3–9 sep:**
- **Onsdag 9 sep:** C.steg.1, C.loopar.1, C.openrouter.1–2, C.proveniens.1, C.orkestrering.1 (6 stories)

**Status:** Spec pågående, implementation väntar på etapp 1
