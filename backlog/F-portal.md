# Epic F: Portal

**Beskrivning:** Processportalens tio vyer: arkitektur, sitemap, vykontrakt, dataflöde.

**Mål:** Definiera portalen som vy på Git (ingen separat databas). Etapp 0: kontrakt, etapp 2: implementation.

**Etapp:** 0 (kontrakt), 2 (implementation)  
**Ansvarig:** Produktägare + frontend-arkitekt  
**Status:** Pågående

---

## Stories

### Story F.sitemap.1: Skapa portal-sitemap

**Som** produktägare  
**vill jag** ha en sitemap för portalen  
**så att** alla förstår strukturen

**Acceptanskriterier:**
- **Given** Portalens tio vyer
- **When** sitemap skapas
- **Then** ska den innehålla:
  - Översikt → Min inkorg → Modulvy → ...
  - Rollbaserad access (vad syns för vem)
  - Navigation (meny-struktur)
  - URL-struktur (t.ex. `/portal/overview`, `/portal/gates/G1`)
- **And** sitemap ska vara markdown med ASCII-graf

**Spec-referens:** docs/process.md § Processportalen  
**Dataklass:** 0  
**Beroenden:** Inga  
**Etapp:** 0  
**Status:** todo

---

### Story F.vy01.1: Skapa kontrakt för vy 1 (Översikt)

**Som** användare  
**vill jag** se en översiktsvy  
**så att** jag snabbt förstår systemstatus

**Acceptanskriterier:**
- **Given** Portal-sitemap
- **When** Översikt-vykontrakt skapas
- **Then** ska det innehålla:
  - Syfte: Sammanfattning av aktiva funktioner, grindstatus, senaste builds
  - Roller: Alla (filtrerat per roll)
  - Data: Specs (från Git), grindstatus (från `decisions/`), CI-status
  - Layout: Dashboard med widgets (aktiva funktioner, väntande grindar, senaste events)
  - Mock: Markdown-tabell eller ASCII-layout
- **And** kontraktet ska vara markdown

**Spec-referens:** docs/process.md § Processportalen  
**Dataklass:** 0  
**Beroenden:** F.sitemap.1  
**Etapp:** 0  
**Status:** todo

---

### Story F.vy02.1: Skapa kontrakt för vy 2 (Min inkorg)

**Som** användare  
**vill jag** se åtgärder som väntar på mig  
**så att** jag kan prioritera mitt arbete

**Acceptanskriterier:**
- **Given** Portal-sitemap
- **When** Min inkorg-vykontrakt skapas
- **Then** ska det innehålla:
  - Syfte: Visa pending-items (grindbeslut, PR-signaturer, återremitteringar)
  - Roller: Per användare
  - Data: Grindar (från `decisions/`), PR:er (från Git), återremitteringar (från `reviews/`)
  - Layout: Lista sorterad på priority/datum
  - Interaktion: Klicka för att öppna beslut/PR
- **And** kontraktet ska vara markdown

**Spec-referens:** docs/process.md § Processportalen  
**Dataklass:** 0  
**Beroenden:** F.sitemap.1  
**Etapp:** 0  
**Status:** todo

---

### Story F.vy03.1: Skapa kontrakt för vy 3 (Modulvy)

**Som** utvecklare  
**vill jag** se status per modul  
**så att** jag förstår var modulen är i processen

**Acceptanskriterier:**
- **Given** Portal-sitemap
- **When** Modulvy-kontrakt skapas
- **Then** ska det innehålla:
  - Syfte: Visa spec, stories, tester, deploy-status för en modul
  - Roller: Utvecklare, produktägare
  - Data: Spec (från `specs/`), stories (från `stories/`), tester (från `tests/`), deploy (från `deploys/`)
  - Layout: Tidslinje (steg 0–11) med status per steg
  - Interaktion: Klicka för att se detaljer
- **And** kontraktet ska vara markdown

**Spec-referens:** docs/process.md § Processportalen  
**Dataklass:** 0  
**Beroenden:** F.sitemap.1  
**Etapp:** 0  
**Status:** todo

---

### Story F.vy04.1: Skapa kontrakt för vy 4 (Funktionskatalog)

**Som** produktägare  
**vill jag** se alla funktioner  
**så att** jag kan filtrera och söka

**Acceptanskriterier:**
- **Given** Portal-sitemap
- **When** Funktionskatalog-kontrakt skapas
- **Then** ska det innehålla:
  - Syfte: Visa alla funktioner (specs)
  - Roller: Alla
  - Data: Specs (från `specs/`), metadata (status, dataklass, ansvarig)
  - Layout: Tabell med filter (status, dataklass, ansvarig)
  - Interaktion: Klicka för att öppna spec eller modulvy
- **And** kontraktet ska vara markdown

**Spec-referens:** docs/process.md § Processportalen  
**Dataklass:** 0  
**Beroenden:** F.sitemap.1  
**Etapp:** 0  
**Status:** todo

---

### Story F.vy05.1: Skapa kontrakt för vy 5 (Testkatalog)

**Som** QA-ansvarig  
**vill jag** se alla tester  
**så att** jag kan bedöma testtäckning

**Acceptanskriterier:**
- **Given** Portal-sitemap
- **When** Testkatalog-kontrakt skapas
- **Then** ska det innehålla:
  - Syfte: Visa alla tester (unit, integration, E2E)
  - Roller: QA, utvecklare
  - Data: Testrapporter (från `tests/`), täckning, senaste körningar
  - Layout: Tabell med filter (typ, status, modul)
  - Interaktion: Klicka för att se testrapport
- **And** kontraktet ska vara markdown

**Spec-referens:** docs/process.md § Processportalen  
**Dataklass:** 0  
**Beroenden:** F.sitemap.1  
**Etapp:** 0  
**Status:** todo

---

### Story F.vy06.1: Skapa kontrakt för vy 6 (Grindvy)

**Som** beslutsfattare  
**vill jag** se grindhistorik  
**så att** jag förstår vilka beslut som fattats

**Acceptanskriterier:**
- **Given** Portal-sitemap
- **When** Grindvy-kontrakt skapas
- **Then** ska det innehålla:
  - Syfte: Visa historik för G1–G4 (vem beslutade vad när)
  - Roller: Alla (read-only för icke-beslutsfattare)
  - Data: Grindbeslut (från `decisions/`)
  - Layout: Tidslinje eller tabell per grind, filtrerbara
  - Interaktion: Klicka för att se grindbeslut + motivering
- **And** kontraktet ska vara markdown

**Spec-referens:** docs/process.md § Grindar  
**Dataklass:** 0  
**Beroenden:** F.sitemap.1  
**Etapp:** 0  
**Status:** todo

---

### Story F.vy07.1: Skapa kontrakt för vy 7 (Verifieringsvy)

**Som** auditör  
**vill jag** kunna spåra från spec till deploy  
**så att** compliance uppfylls

**Acceptanskriterier:**
- **Given** Portal-sitemap och spårbarhetsmodell (E.spårbarhet.1)
- **When** Verifieringsvy-kontrakt skapas
- **Then** ska det innehålla:
  - Syfte: Visa spårbarhet (spec → story → kod → test → deploy)
  - Roller: Auditör, produktägare
  - Data: Metadata från alla artefakter, proveniens-länkar
  - Layout: Graf eller träd som visualiserar kedjan
  - Interaktion: Klicka för att se artefakt-detaljer
- **And** kontraktet ska vara markdown

**Spec-referens:** docs/process.md § Verifieringsvy  
**Dataklass:** 0  
**Beroenden:** F.sitemap.1, E.spårbarhet.1  
**Etapp:** 0  
**Status:** todo

---

### Story F.vy08.1: Skapa kontrakt för vy 8 (Driftvy)

**Som** driftansvarig  
**vill jag** se prod-status  
**så att** jag kan reagera på incidenter

**Acceptanskriterier:**
- **Given** Portal-sitemap
- **When** Driftvy-kontrakt skapas
- **Then** ska det innehålla:
  - Syfte: Visa prod-status, incidenter, A11-rapporter
  - Roller: Drift, produktägare
  - Data: Incidentrapporter (från `incidents/`), metrics, larm
  - Layout: Dashboard med status-widgets + incident-lista
  - Interaktion: Klicka för att se incident-detaljer
- **And** kontraktet ska vara markdown

**Spec-referens:** docs/process.md § Steg 11  
**Dataklass:** 0  
**Beroenden:** F.sitemap.1  
**Etapp:** 0  
**Status:** todo

---

### Story F.vy09.1: Skapa kontrakt för vy 9 (Agentlogg)

**Som** processägare  
**vill jag** se vilken agent körde vad  
**så att** jag kan granska proveniens

**Acceptanskriterier:**
- **Given** Portal-sitemap och proveniens-schema
- **When** Agentlogg-vykontrakt skapas
- **Then** ska det innehålla:
  - Syfte: Visa alla agent-körningar (vem, när, input, output)
  - Roller: Processägare, auditör
  - Data: Metadata från alla artefakter (från Git)
  - Layout: Tabell med filter (agent, datum, pool)
  - Interaktion: Klicka för att se input/output
- **And** kontraktet ska vara markdown

**Spec-referens:** docs/process.md § Proveniens  
**Dataklass:** 0  
**Beroenden:** F.sitemap.1, C.proveniens.1  
**Etapp:** 0  
**Status:** todo

---

### Story F.vy10.1: Skapa kontrakt för vy 10 (Dokumentation)

**Som** användare  
**vill jag** hitta dokumentation  
**så att** jag förstår hur systemet fungerar

**Acceptanskriterier:**
- **Given** Portal-sitemap
- **When** Dokumentations-vykontrakt skapas
- **Then** ska det innehålla:
  - Syfte: Visa användar- och driftdokumentation (från A13)
  - Roller: Alla
  - Data: Markdown-docs (från Git, genererad av A13)
  - Layout: Hierarki med sökfunktion
  - Interaktion: Klicka för att läsa, länka till moduler
- **And** kontraktet ska vara markdown

**Spec-referens:** docs/process.md § A13  
**Dataklass:** 0  
**Beroenden:** F.sitemap.1  
**Etapp:** 0  
**Status:** todo

---

### Story F.arkitektur.1: Dokumentera portal-arkitektur

**Som** frontend-arkitekt  
**vill jag** ha en arkitektur-spec  
**så att** implementation blir rätt

**Acceptanskriterier:**
- **Given** Vykontrakt
- **When** arkitekturen dokumenteras
- **Then** ska den innehålla:
  - Frontend: React/Vue/Svelte (TBD etapp 2)
  - Backend: API-server som läser Git (eller direkt GitHub API)
  - Autentisering: SSO/SAML (VGR)
  - State management: Ingen separat databas (Git är sanningen)
  - Deployment: Statisk site + API-server
- **And** arkitekturen ska vara markdown

**Spec-referens:** docs/process.md § P1  
**Dataklass:** 0  
**Beroenden:** F.sitemap.1  
**Etapp:** 0  
**Status:** todo

---

### Story F.dataflöde.1: Dokumentera portal-dataflöde

**Som** backend-utvecklare  
**vill jag** förstå hur portalen läser data  
**så att** API:t kan byggas

**Acceptanskriterier:**
- **Given** Portal-arkitektur
- **When** dataflödet dokumenteras
- **Then** ska det innehålla:
  - Portalen läser Git (GitHub API eller lokal clone)
  - Caching-strategi (Redis/in-memory för prestanda)
  - Webhook för refresh (vid push till Git)
  - Query-exempel ("Hämta alla specs med status=godkänd")
- **And** flödet ska vara diagram + markdown

**Spec-referens:** F.arkitektur.1  
**Dataklass:** 0  
**Beroenden:** F.arkitektur.1  
**Etapp:** 0  
**Status:** todo

---

### Story F.mock.1: Skapa portal-mock för Översikt

**Som** produktägare  
**vill jag** se en mock av Översikt-vyn  
**så att** jag kan validera UX

**Acceptanskriterier:**
- **Given** Översikt-vykontrakt (F.vy01.1)
- **When** mock skapas
- **Then** ska den innehålla:
  - Markdown-tabell eller ASCII-layout med mockdata
  - Widgets: Aktiva funktioner (3 st), väntande grindar (2 st), senaste events (5 st)
  - Data är syntetisk (dataklass 0)
- **And** mocken ska vara markdown-fil

**Spec-referens:** F.vy01.1  
**Dataklass:** 0  
**Beroenden:** F.vy01.1  
**Etapp:** 0  
**Status:** todo

---

### Story F.implementera.1: Implementera portal frontend

**Som** frontend-utvecklare  
**vill jag** implementera portalen  
**så att** användare kan se vyer

**Acceptanskriterier:**
- **Given** Vykontrakt och arkitektur
- **When** portalen implementeras
- **Then** ska den:
  - Implementera alla tio vyer
  - Läsa data från Git via API
  - Hantera autentisering
  - Vara responsiv (desktop + mobile)
- **And** implementation sker i etapp 2

**Spec-referens:** F.arkitektur.1  
**Dataklass:** 0  
**Beroenden:** F.vy01.1–F.vy10.1, F.arkitektur.1  
**Etapp:** 2  
**Status:** todo

---

## Sammanfattning

**Totalt:** 15 stories  
**Etapp 0:** 14 stories (kontrakt + mock)  
**Etapp 2:** 1 story (implementation)

**Prioritet vecka 3–9 sep:**
- **Torsdag 3 sep:** F.sitemap.1 (1 story)
- **Söndag 6 sep:** F.vy01.1, F.mock.1 (2 stories)
- **Måndag 7 sep:** F.vy06.1, F.vy07.1 (2 stories)

**Status:** Kontrakt pågående
