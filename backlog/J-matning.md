# Epic J: Mätning

**Beskrivning:** Metrics, KPI:er, dashboards för processmätning (cykeltid, loopfrekvens, grindtid).

**Mål:** Mäta processens effektivitet så att förbättringar kan identifieras. Etapp 0: definitioner, etapp 1+: implementation.

**Etapp:** 0 (definitioner), 1–2 (implementation)  
**Ansvarig:** Processägare  
**Status:** Ej påbörjad

---

## Stories

### Story J.kpier.1: Definiera process-KPI:er

**Som** processägare  
**vill jag** ha KPI:er för att mäta processen  
**så att** jag kan förbättra den

**Acceptanskriterier:**
- **Given** Smedjans steg och loopar
- **When** KPI:er definieras
- **Then** ska de innehålla:
  - **Cykeltid:** Tid från steg 0 till steg 10 (spec → prod)
  - **Loopfrekvens:** Hur ofta L1/L2/L3 används (mål: <1.5 varv i snitt)
  - **Grindtid:** Tid från agent-rekommendation till mänskligt beslut (G1–G4)
  - **CI-pass-rate:** Andel CI-körningar som är gröna första gången
  - **Defect escape rate:** Buggar funna i prod som borde fångats i test
  - **Agent-kostnad:** Tokens + kostnad per steg
- **And** definitionen ska vara markdown

**Spec-referens:** docs/process.md  
**Dataklass:** 0  
**Beroenden:** Inga  
**Etapp:** 0  
**Status:** todo

---

### Story J.datakallor.1: Definiera datakällor för metrics

**Som** systemarkitekt  
**vill jag** veta var metrics samlas  
**så att** dashboard kan byggas

**Acceptanskriterier:**
- **Given** KPI-definitioner
- **When** datakällor definieras
- **Then** ska de innehålla:
  - Git-metadata (commits, timestamps från proveniens)
  - CI-loggar (GitHub Actions eller Temporal)
  - Agent-loggar (tokens, kostnad från OpenRouter)
  - Grindbeslut (timestamps från `decisions/`)
- **And** definitionen ska vara markdown

**Spec-referens:** J.kpier.1  
**Dataklass:** 0  
**Beroenden:** J.kpier.1  
**Etapp:** 0  
**Status:** todo

---

### Story J.dashboard.1: Skapa metrics-dashboard-spec

**Som** processägare  
**vill jag** ha en spec för metrics-dashboard  
**så att** jag kan visualisera KPI:er

**Acceptanskriterier:**
- **Given** KPI-definitioner
- **When** dashboard-spec skapas
- **Then** ska den innehålla:
  - Widgets: Cykeltid-histogram, loopfrekvens per steg, grindtid per grind
  - Filters: Per modul, per dataklass, per tidsperiod
  - Integration: Läser Git + CI-loggar
  - Verktyg: Grafana eller inbyggd i portal
- **And** specen ska vara markdown

**Spec-referens:** J.kpier.1  
**Dataklass:** 0  
**Beroenden:** J.kpier.1, J.datakallor.1  
**Etapp:** 0  
**Status:** todo

---

### Story J.implementera-metrics.1: Implementera metrics-insamling

**Som** utvecklare  
**vill jag** samla in metrics  
**så att** dashboard kan visa dem

**Acceptanskriterier:**
- **Given** Datakällor-spec
- **When** metrics-insamling implementeras
- **Then** ska den:
  - Läsa Git-metadata (via GitHub API)
  - Läsa CI-loggar (via GitHub Actions API)
  - Läsa agent-loggar (från OpenRouter-klient)
  - Spara metrics i Prometheus / InfluxDB
  - Exponera metrics-endpoint
- **And** implementation sker i etapp 1+

**Spec-referens:** J.datakallor.1  
**Dataklass:** 0  
**Beroenden:** J.datakallor.1  
**Etapp:** 1  
**Status:** todo

---

### Story J.implementera-dashboard.1: Implementera metrics-dashboard

**Som** processägare  
**vill jag** ha ett körbart dashboard  
**så att** jag kan följa processen

**Acceptanskriterier:**
- **Given** Dashboard-spec och metrics-insamling
- **When** dashboard implementeras
- **Then** ska det:
  - Visa alla KPI:er
  - Vara responsivt (desktop + mobile)
  - Uppdateras i realtid (eller varje minut)
  - Vara integrerat i portalen
- **And** implementation sker i etapp 2

**Spec-referens:** J.dashboard.1  
**Dataklass:** 0  
**Beroenden:** J.dashboard.1, J.implementera-metrics.1  
**Etapp:** 2  
**Status:** todo

---

## Sammanfattning

**Totalt:** 5 stories  
**Etapp 0:** 3 stories (definitioner)  
**Etapp 1+:** 2 stories (implementation)

**Prioritet vecka 3–9 sep:**
- **Onsdag 9 sep:** J.kpier.1, J.datakallor.1, J.dashboard.1 (3 stories, definitioner)

**Status:** Ej påbörjad (startar onsdag 9 sep)
