# Epic D: Docker

**Beskrivning:** Test-miljöer, Docker Compose, registry, images, miljövariabler (ej hemligheter).

**Mål:** Skapa skelett för testmiljöer så att A8 kan deploya och A7/A9 kan testa mot faktiska services.

**Etapp:** 0 (skelett), 1 (körbart)  
**Ansvarig:** DevOps/systemarkitekt  
**Status:** Pågående

---

## Stories

### Story D.skelett.1: Skapa Docker Compose skelett

**Som** utvecklare  
**vill jag** ha ett Docker Compose-skelett  
**så att** testmiljöer kan skapas

**Acceptanskriterier:**
- **Given** Smedjans krav på testmiljöer
- **When** Docker Compose-skelettet skapas
- **Then** ska det innehålla:
  - `docker/docker-compose.test.yml` (testmiljö)
  - `docker/docker-compose.qa.yml` (QA-miljö)
  - Services: app, db, redis (kommenterade, inga riktiga images än)
  - Kommentarer som förklarar vilka images som kommer
  - Health checks (kommenterade)
- **And** filen ska vara körbar (tomma services OK för etapp 0)

**Spec-referens:** docs/process.md § Steg 6  
**Dataklass:** 0  
**Beroenden:** Inga  
**Etapp:** 0  
**Status:** todo

---

### Story D.env.1: Dokumentera miljövariabler

**Som** utvecklare  
**vill jag** veta vilka miljövariabler som behövs  
**så att** jag kan konfigurera testmiljöer

**Acceptanskriterier:**
- **Given** Testmiljö-krav
- **When** miljövariabler dokumenteras
- **Then** ska dokumentationen innehålla:
  - Lista över variabler (t.ex. DB_HOST, REDIS_URL)
  - Beskrivning av varje variabel
  - Default-värden för test/QA
  - Vilka som är secrets (ej i repo, använd `.env.example`)
- **And** dokumentationen ska vara markdown i `docker/README.md`

**Spec-referens:** docs/process.md § Dataklass  
**Dataklass:** 0  
**Beroenden:** D.skelett.1  
**Etapp:** 0  
**Status:** todo

---

### Story D.images.1: Dokumentera image-strategi

**Som** DevOps  
**vill jag** ha en image-strategi  
**så att** testmiljöer använder rätt versioner

**Acceptanskriterier:**
- **Given** Docker best practices
- **When** image-strategin dokumenteras
- **Then** ska den innehålla:
  - Var images finns (Docker Hub, GitHub Container Registry, VGR-registry)
  - Tagging-strategi (sha/version för prod, latest för test)
  - Image-säkerhet (vulnerability scanning)
  - Ingen "låtsas-prod" (test != prod i images)
- **And** dokumentationen ska vara markdown i `docker/README.md`

**Spec-referens:** docs/process.md  
**Dataklass:** 0  
**Beroenden:** D.skelett.1  
**Etapp:** 0  
**Status:** todo

---

### Story D.test-module.1: Skapa test-modul-koncept

**Som** systemarkitekt  
**vill jag** ha koncept för test-moduler  
**så att** varje funktionalitet kan testas isolerat

**Acceptanskriterier:**
- **Given** Smedjans modulära approach
- **When** test-modul-konceptet definieras
- **Then** ska det innehålla:
  - En modul = en Docker Compose-fil (t.ex. `test-ews.yml`)
  - Modulen innehåller app + dependencies (db, cache)
  - Modulen kan köras isolerat
  - Moduler kan kombineras för integrationstester
- **And** konceptet ska vara dokumenterat i markdown

**Spec-referens:** docs/process.md  
**Dataklass:** 0  
**Beroenden:** D.skelett.1  
**Etapp:** 0  
**Status:** todo

---

### Story D.implementera.1: Implementera körbar testmiljö

**Som** utvecklare  
**vill jag** ha en körbar testmiljö  
**så att** jag kan testa första modulen (EWS)

**Acceptanskriterier:**
- **Given** Docker Compose-skelett
- **When** testmiljön implementeras
- **Then** ska den:
  - Ha riktiga images (postgres, redis, app-placeholder)
  - Kunna startas med `docker compose up`
  - Ha health checks som funkar
  - Exponera endpoints för tester
- **And** miljön ska köras i etapp 1

**Spec-referens:** D.skelett.1  
**Dataklass:** 0  
**Beroenden:** D.skelett.1, D.env.1  
**Etapp:** 1  
**Status:** todo

---

### Story D.cleanup.1: Dokumentera cleanup-procedur

**Som** utvecklare  
**vill jag** veta hur jag städar testmiljöer  
**så att** resurser inte läcker

**Acceptanskriterier:**
- **Given** Docker Compose-miljöer
- **When** cleanup-proceduren dokumenteras
- **Then** ska den innehålla:
  - Hur man stoppar miljöer (`docker compose down`)
  - Hur man rensar volumes (`-v` flag)
  - Hur man rensar images (policy: behåll senaste, ta bort gamla)
  - CI-integration (cleanup efter test-körningar)
- **And** dokumentationen ska vara markdown i `docker/README.md`

**Spec-referens:** D.skelett.1  
**Dataklass:** 0  
**Beroenden:** D.skelett.1  
**Etapp:** 0  
**Status:** todo

---

## Sammanfattning

**Totalt:** 6 stories  
**Etapp 0:** 5 stories (skelett + dokumentation)  
**Etapp 1:** 1 story (körbar implementation)

**Prioritet vecka 3–9 sep:**
- **Söndag 6 sep:** D.skelett.1, D.env.1, D.images.1, D.test-module.1 (4 stories)

**Status:** Skelett pågående
