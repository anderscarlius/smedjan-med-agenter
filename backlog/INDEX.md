# Smedjan Backlog – INDEX

**Version:** 0.1  
**Datum:** 2026-09-02  
**Uppdaterad:** 2026-09-02

Detta är huvudnavigeringen för Smedjans backlog. Alla user stories, epics och arbetspaket finns här.

## Veckoplan 3–9 september 2026 (Etapp 0)

**Mål:** Körbart skelett för manuell exekvering. Process, prompter, mallar, konfiguration.

### Torsdag 3 september
**Fokus:** Hela trädet på plats
- [ ] Alla backlog-sektioner (A–K) skapade med user stories
- [ ] Alla promptfiler (A0–A13) skapade som kontrakt med struktur
- [ ] Portal sitemap och vykontrakt (tom innehåll OK)
- [ ] `.smedjan/` konfigurationsfiler (agents.yaml, dataklass.yaml, pipeline.yaml)
- [ ] Mallar-katalog med alla mallfiler som skelett

**Stories:** A.*, F.portal-sitemap, B.agenter-struktur, C.orkestrator-stub

### Fredag 4 september
**Fokus:** Promptkroppar A0–A3, spec/story-scheman
- [ ] A0 Intag: fullständig v0-prompt med exempel
- [ ] A1 Specgranskare: fullständig v0-prompt med exempel
- [ ] A2 Nedbrytare: fullständig v0-prompt med exempel
- [ ] A3 Storygranskare: fullständig v0-prompt med exempel
- [ ] Spec-mall med alla fält och exempel
- [ ] Story-mall med AC-format (Given/When/Then)
- [ ] G1 och G2 grindkontrakt

**Stories:** B.A0.*, B.A1.*, B.A2.*, B.A3.*, A.spec-mall, A.story-mall, G.G1, G.G2

### Lördag 5 september
**Fokus:** A4–A7, testkontrakt, CI-är-facit
- [ ] A4 Kodare: v0-prompt med kodstandarder
- [ ] A5 Kodgranskare: v0-prompt med granskningskriterier
- [ ] A6 Testförfattare: v0-prompt med testkrav
- [ ] A7 Integrationstestare: v0-prompt med integrationstestmönster
- [ ] Testkontrakt (unit, integration) i mallar
- [ ] CI-facit-dokument (princip P4)

**Stories:** B.A4.*, B.A5.*, B.A6.*, B.A7.*, A.testkontrakt, J.ci-facit

### Söndag 6 september
**Fokus:** Docker-skelett, A8, portal Översikt
- [ ] Docker Compose skelett (kommentarer, inga riktiga images)
- [ ] A8 Deploy: v0-prompt med deploy-procedurer
- [ ] Portal Översikt-vy med mockdata
- [ ] Deploy-manifest-mall (test/QA/prod)

**Stories:** D.docker-skelett, B.A8.*, F.oversikt-vy, E.deploy-manifest

### Måndag 7 september
**Fokus:** A9–A13, grindvy, spårbarhet
- [ ] A9 Systemtestare: v0-prompt med E2E-testmönster
- [ ] A10 Utfallsanalytiker: v0-prompt med riskanalys
- [ ] A11 Driftvakt: v0-prompt med övervakningskriterier
- [ ] A12 Förbättring: v0-prompt med teknisk skuld-identifiering
- [ ] A13 Dokumentatör: v0-prompt med dokumentationskrav
- [ ] Portal Grindvy-kontrakt
- [ ] Spårbarhetsmodell (spec → story → kod → test → deploy)

**Stories:** B.A9.*, B.A10.*, B.A11.*, B.A12.*, B.A13.*, F.grindvy, E.spårbarhet

### Tisdag 8 september
**Fokus:** Första manuella EWS-intag
- [ ] Syntetisk EWS-förslagsspec (dataklass 0)
- [ ] Kör A0 manuellt → strukturerad spec
- [ ] Kör A1 manuellt → granskningsrapport
- [ ] Kör A2 manuellt → user stories
- [ ] Dokumentera körning i `korningar/ews/`

**Stories:** I.ews-forslag, I.ews-steg0, I.ews-steg1, I.ews-steg2

### Onsdag 9 september
**Fokus:** Orkestreringsspec v0.1 utkast + lucklista
- [ ] Orkestreringsspec: tillståndsmaskin (steg 0–11, loopar L1–L3)
- [ ] OpenRouter-klient API-kontrakt (stub)
- [ ] Proveniens-schema (vem, när, vilken pool, input/output)
- [ ] Lucklista: identifierade gap inför etapp 1
- [ ] Vecko-retrospektiv

**Stories:** C.orkestrering-spec, C.openrouter-klient, E.proveniens, K.lucklista

## Epic-karta

Alla user stories är organiserade i elva epics (A–K):

### [A. Processkontrakt](A-processkontrakt.md)
Processdokumentation, mallar, format och kontrakt som ligger till grund för allt arbete.
- **Stories:** 8 stories
- **Etapp:** 0
- **Status:** Pågående

### [B. Agenter](B-agenter.md)
Alla fjorton agenter (A0–A13) med promptkontrakt, v0-prompter, I/O-scheman, exempel.
- **Stories:** 42 stories (3 per agent: kontrakt, prompt, exempel)
- **Etapp:** 0
- **Status:** Pågående

### [C. Orkestrering](C-orkestrering.md)
Tillståndsmaskin, loopar, OpenRouter-klient, proveniens, körningslogik.
- **Stories:** 12 stories
- **Etapp:** 0 (spec), 1–2 (implementation)
- **Status:** Spec pågående

### [D. Docker](D-docker.md)
Test-miljöer, Docker Compose, registry, images, miljövariabler (ej hemligheter).
- **Stories:** 6 stories
- **Etapp:** 0 (skelett), 1 (körbart)
- **Status:** Pågående

### [E. Git-artefakter](E-git-artefakter.md)
Hur specs, stories, testrapporter, grindbeslut, deploy-manifest versionshanteras.
- **Stories:** 10 stories
- **Etapp:** 0
- **Status:** Pågående

### [F. Portal](F-portal.md)
Processportalens tio vyer: arkitektur, sitemap, vykontrakt, dataflöde.
- **Stories:** 15 stories (1–2 per vy + sitemap)
- **Etapp:** 0 (kontrakt), 2 (implementation)
- **Status:** Pågående

### [G. Grindar](G-grindar.md)
G1–G4: beslutsformat, roller, eskalering, historik.
- **Stories:** 8 stories (2 per grind)
- **Etapp:** 0
- **Status:** Pågående

### [H. Dataklass och testdata](H-dataklass-testdata.md)
Dataklass 0/1/2, testdata-generering, pseudonymisering, valideringsregler.
- **Stories:** 8 stories
- **Etapp:** 0
- **Status:** Pågående

### [I. Första last: EWS](I-forsta-last-ews.md)
Early Warning Score från Philips → VGR Datahubb. Syntetisk data, steg 0–2 manuellt.
- **Stories:** 6 stories
- **Etapp:** 0 (steg 0–2), 3 (hela flödet)
- **Status:** Ej påbörjad

### [J. Mätning](J-matning.md)
Metrics, KPI:er, dashboards för processmätning (cykeltid, loopfrekvens, grindtid).
- **Stories:** 5 stories
- **Etapp:** 1–2
- **Status:** Ej påbörjad (etapp 0: definitioner)

### [K. Nimloth OSS](K-nimloth-oss.md)
Open source-förberedelser, licens, dokumentation, separation från VGR-specifikt.
- **Stories:** 4 stories
- **Etapp:** 4–5
- **Status:** Ej påbörjad (etapp 0: dokumentera intention)

## Hur man exekverar en story

### Format för user stories

Alla stories följer detta format:

```markdown
### Story B.A0.2: A0 ska validera dataklass

**Som** processägare  
**vill jag** att A0 validerar dataklass på inkommande förslag  
**så att** ingen känslig data läcker in i fel miljö

**Acceptanskriterier:**
- **Given** en förslagsspec med dataklass 2 (patientdata)
- **When** A0 processar förslaget i etapp 0 (dev-miljö)
- **Then** ska A0 avvisa förslaget med tydligt felmeddelande
- **And** logga försöket (men ej innehållet)

**Spec-referens:** [docs/process.md § Dataklass](../docs/process.md)  
**Dataklass:** 0 (story är syntetisk)  
**Beroenden:** A.kontrakt.1 (processkontrakt klart)  
**Etapp:** 0  
**Status:** todo
```

### Exekvering (etapp 0 – manuellt)

1. **Hitta story:** Öppna relevant epic-fil (t.ex. `B-agenter.md`)
2. **Läs AC:** Förstå Given/When/Then
3. **Hämta promptkontrakt:** Från `prompter/` (t.ex. `A0.md`)
4. **Förbered input:** Enligt promptkontraktets input-schema
5. **Kör agent:** Kopiera prompt + input till LLM-chatt (Claude, GPT-4, etc.)
6. **Validera output:** Kontrollera att output uppfyller AC
7. **Dokumentera:** Spara input + output i `korningar/<funktionsnamn>/`
8. **Uppdatera status:** Märk story som "done" i backlog-filen

### Exekvering (etapp 1+ – automatiskt)

1. **GitHub Actions trigger:** Push till branch → workflow startar
2. **Orkestrator läser story:** Från Git
3. **Orkestrator anropar agent:** Via OpenRouter
4. **Agent producerar output:** Sparas i Git
5. **CI validerar:** Kör tester, kontrollerar AC
6. **Status uppdateras:** Automatiskt i portal

## Sammanfattning av alla stories per epic

| Epic | Antal stories | Etapp 0 | Etapp 1+ | Status |
|------|--------------|---------|----------|--------|
| A. Processkontrakt | 8 | 8 | 0 | Pågående |
| B. Agenter | 42 | 42 | 0 | Pågående |
| C. Orkestrering | 12 | 4 | 8 | Spec pågående |
| D. Docker | 6 | 2 | 4 | Pågående |
| E. Git-artefakter | 10 | 10 | 0 | Pågående |
| F. Portal | 15 | 5 | 10 | Pågående |
| G. Grindar | 8 | 8 | 0 | Pågående |
| H. Dataklass | 8 | 8 | 0 | Pågående |
| I. EWS | 6 | 3 | 3 | Ej påbörjad |
| J. Mätning | 5 | 2 | 3 | Definitioner |
| K. Nimloth OSS | 4 | 1 | 3 | Dokumentera |
| **TOTALT** | **124** | **93** | **31** | |

**Etapp 0 denna vecka:** 93 stories (fokus på de 50 viktigaste)

## Nästa steg

1. Läs igenom epic-filerna (A–K)
2. Prioritera stories enligt veckoplan
3. Börja med A-processkontrakt och B-agenter (A0–A3)
4. Följ formatet ovan för varje story
5. Dokumentera all output i Git

**Frågor?** Se [docs/process.md](../docs/process.md) eller öppna issue.

---

**Senast uppdaterad:** 2026-09-02
