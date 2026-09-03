# Epic E: Git-artefakter

**Beskrivning:** Hur specs, stories, testrapporter, grindbeslut och deploy-manifest versionshanteras i Git.

**Mål:** Git är sanningen (P1). Allt ska vara spårbart, versionshanterat och maskinläsbart.

**Etapp:** 0  
**Ansvarig:** Processägare  
**Status:** Pågående

---

## Stories

### Story E.struktur.1: Definiera Git-mappstruktur

**Som** processägare  
**vill jag** ha en tydlig mappstruktur i Git  
**så att** alla artefakter har en plats

**Acceptanskriterier:**
- **Given** Smedjans artefakter (specs, stories, tester, beslut)
- **When** mappstrukturen definieras
- **Then** ska den innehålla:
  - `specs/` (strukturerade specs från A0, per funktion)
  - `stories/` (user stories från A2, per funktion)
  - `reviews/` (granskningsrapporter från A1, A3, A5)
  - `tests/` (testrapporter från A6, A7, A9, A10)
  - `decisions/` (grindbeslut G1–G4)
  - `deploys/` (deploy-manifest och rapporter)
  - `incidents/` (incidentrapporter från A11)
  - `improvements/` (teknisk skuld-rapporter från A12)
- **And** strukturen ska vara dokumenterad i markdown

**Spec-referens:** docs/process.md § Git-struktur  
**Dataklass:** 0  
**Beroenden:** Inga  
**Etapp:** 0  
**Status:** todo

---

### Story E.naming.1: Definiera naming-konvention

**Som** processägare  
**vill jag** ha naming-konvention för artefakter  
**så att** filer är lätta att hitta

**Acceptanskriterier:**
- **Given** Git-mappstrukturen
- **When** naming-konventionen definieras
- **Then** ska den innehålla:
  - Specs: `specs/<funktion-id>/<version>.md` (t.ex. `specs/EWS-001/v1.md`)
  - Stories: `stories/<funktion-id>/<story-id>.yaml` (t.ex. `stories/EWS-001/EWS-001-1.yaml`)
  - Reviews: `reviews/<artefakt-id>-<reviewer-id>-<timestamp>.md`
  - Grindbeslut: `decisions/<grind>-<funktion-id>-<timestamp>.md`
  - Testrapporter: `tests/<steg>-<funktion-id>-<timestamp>.md`
- **And** konventionen ska vara dokumenterad i markdown

**Spec-referens:** E.struktur.1  
**Dataklass:** 0  
**Beroenden:** E.struktur.1  
**Etapp:** 0  
**Status:** todo

---

### Story E.metadata.1: Definiera metadata-krav

**Som** processägare  
**vill jag** att alla artefakter har metadata  
**så att** proveniens är spårbar

**Acceptanskriterier:**
- **Given** Proveniens-schema från C.proveniens.1
- **When** metadata-kraven definieras
- **Then** ska varje artefakt ha:
  - YAML frontmatter (för markdown-filer)
  - JSON-metadata-fil (för binära artefakter)
  - Fält enligt proveniens-schema
- **And** kraven ska vara dokumenterade i markdown

**Spec-referens:** C.proveniens.1  
**Dataklass:** 0  
**Beroenden:** C.proveniens.1  
**Etapp:** 0  
**Status:** todo

---

### Story E.branches.1: Definiera branch-strategi

**Som** utvecklare  
**vill jag** veta vilka branches som används  
**så att** jag kan arbeta korrekt

**Acceptanskriterier:**
- **Given** Smedjans process
- **When** branch-strategin definieras
- **Then** ska den innehålla:
  - `main`: Stabil process och godkända specs
  - `feature/<funktion-id>`: Feature-utveckling (spec → stories → kod)
  - `release/<version>`: Releaseförberedelser
  - PR-krav: A5-granskning + CI grönt + mänsklig signatur
- **And** strategin ska vara dokumenterad i markdown

**Spec-referens:** docs/process.md  
**Dataklass:** 0  
**Beroenden:** Inga  
**Etapp:** 0  
**Status:** todo

---

### Story E.commits.1: Definiera commit-konvention

**Som** utvecklare  
**vill jag** ha en commit-konvention  
**så att** commit-historiken blir läsbar

**Acceptanskriterier:**
- **Given** Git best practices
- **When** commit-konventionen definieras
- **Then** ska den innehålla:
  - Format: `<typ>(<scope>): <beskrivning>` (Conventional Commits)
  - Typer: feat, fix, docs, test, refactor, chore
  - Scope: funktion-id eller steg (t.ex. `feat(EWS-001): lägg till spec`)
  - Body: Referens till story eller beslut
  - Signatur: Mänsklig signatur för prod-commits
- **And** konventionen ska vara dokumenterad i markdown

**Spec-referens:** docs/process.md  
**Dataklass:** 0  
**Beroenden:** Inga  
**Etapp:** 0  
**Status:** todo

---

### Story E.spårbarhet.1: Skapa spårbarhetsmodell

**Som** processägare  
**vill jag** ha en spårbarhetsmodell  
**så att** jag kan följa spec → story → kod → test → deploy

**Acceptanskriterier:**
- **Given** Git-artefakter och metadata
- **When** spårbarhetsmodellen skapas
- **Then** ska den definiera:
  - Länkning: story refererar spec, kod refererar story, test refererar kod
  - Queries: "Vilka tester täcker denna spec?", "Vilken spec motiverar denna kod?"
  - Visualisering: Graf från spec till deploy
- **And** modellen ska vara dokumenterad i markdown med exempel

**Spec-referens:** docs/process.md § Verifieringsvy  
**Dataklass:** 0  
**Beroenden:** E.metadata.1  
**Etapp:** 0  
**Status:** todo

---

### Story E.portal-sync.1: Definiera portal-synkronisering

**Som** portalutvecklare  
**vill jag** veta hur portalen läser Git  
**så att** vyer kan byggas

**Acceptanskriterier:**
- **Given** Git-artefakter och portalen
- **When** synk-strategin definieras
- **Then** ska den innehålla:
  - Portalen läser Git direkte (via GitHub API eller lokal clone)
  - Ingen separat databas (Git är sanningen, P1)
  - Caching-strategi (för prestanda)
  - Refresh-trigger (webhook vid push)
- **And** strategin ska vara dokumenterad i markdown

**Spec-referens:** docs/process.md § P1  
**Dataklass:** 0  
**Beroenden:** E.struktur.1  
**Etapp:** 0  
**Status:** todo

---

### Story E.deploy-manifest.1: Skapa deploy-manifest-mall

**Som** A8-agent  
**vill jag** ha en mall för deploy-manifest  
**så att** deploy blir konsekvent

**Acceptanskriterier:**
- **Given** Docker Compose och K8s-krav
- **When** manifest-mallen skapas
- **Then** ska den innehålla:
  - Miljö (test/QA/prod)
  - Image (registry + digest, ej latest för prod)
  - Environment variables (ej secrets i manifest)
  - Resources (CPU, memory limits)
  - Health checks
  - Rollback-plan
- **And** mallen ska vara YAML med kommentarer

**Spec-referens:** docs/process.md § Steg 6, 10  
**Dataklass:** 0  
**Beroenden:** D.skelett.1  
**Etapp:** 0  
**Status:** todo

---

### Story E.grindbeslut.1: Skapa grindbeslut-format

**Som** beslutsfattare  
**vill jag** ha ett format för grindbeslut  
**så att** beslut blir maskinläsbara

**Acceptanskriterier:**
- **Given** Grindbeslut-mallen från A.mallar.6
- **When** formatet definieras
- **Then** ska det innehålla:
  - YAML frontmatter med metadata (grind, beslut, beslutsfattare, datum)
  - Markdown-body med motivering
  - Signatur (GPG-signerad commit)
  - Länk till granskad artefakt
- **And** formatet ska vara dokumenterat med exempel

**Spec-referens:** A.mallar.6  
**Dataklass:** 0  
**Beroenden:** A.mallar.6  
**Etapp:** 0  
**Status:** todo

---

### Story E.testrapporter.1: Skapa testrapport-format

**Som** A6/A7/A9-agent  
**vill jag** ha ett format för testrapporter  
**så att** CI kan läsa dem

**Acceptanskriterier:**
- **Given** Testkrav från process.md
- **When** testrapport-formatet definieras
- **Then** ska det innehålla:
  - Metadata (steg, funktion-id, timestamp, agent)
  - Test-resultat (pass/fail, täckning, exekveringstid)
  - JUnit XML (för CI-integration)
  - Markdown-sammanfattning (för människa)
- **And** formatet ska vara dokumenterat med exempel

**Spec-referens:** docs/process.md § Steg 4–7  
**Dataklass:** 0  
**Beroenden:** A.mallar.5  
**Etapp:** 0  
**Status:** todo

---

## Sammanfattning

**Totalt:** 10 stories  
**Etapp 0:** Alla 10 stories  

**Prioritet vecka 3–9 sep:**
- **Måndag 7 sep:** E.struktur.1, E.naming.1, E.metadata.1, E.spårbarhet.1 (4 stories)
- **Tisdag 8 sep:** E.branches.1, E.commits.1, E.deploy-manifest.1, E.grindbeslut.1, E.testrapporter.1 (5 stories)

**Status:** Pågående
