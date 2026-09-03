# Smedjan – Agentbaserad utvecklingsprocess för VGR Datahubb

**Version:** 0.1  
**Datum:** 2026-09-02  
**Författare:** Anders Carlius  
**Licens:** Apache-2.0

## Vad är Smedjan?

Smedjan är en systematisk, agentbaserad utvecklingsprocess där **människan beslutar och LLM-agenter utför**. Processen garanterar spårbarhet, kvalitet och separation genom 12 steg, 4 grindar, 14 specialiserade agenter och tydliga separationsregler.

**Kärnprincip:** Git är sanningen. Processportalen är vyn för alla utom utvecklare.

## Process i korthet

**12 steg** (0–11) i **4 faser**:
- **Forma** (0–2): Intag → Specgranskning → Nedbrytning
- **Bygga** (3–7): Kodning → Enhetstester → Integrationstester → Testdeploy → Test av testdeploy
- **Leverera** (8–9): Utfall/triage → QA+verksamhetsverifiering
- **Driva** (10–11): Prod-deploy → Övervakning

**4 grindar**: G1 (spec), G2 (stories), G3 (utfall), G4 (godkännande)  
**3 loopar**: L1 (kod), L2 (test), L3 (spec)  
**14 agenter**: A0–A13 i 4 pooler (A: Anthropic Claude, B: OpenAI GPT-4, C: Mistral/diverse, D: Gemma4 lokal)

## Veckan i tio rader

**3–9 september 2026 – Etapp 0: Process, mallar och körbart skelett**

- **Tor 3:** Hela trädet på plats (avsnitt, promptfiler som kontrakt, portal sitemap)
- **Fre 4:** Promptkroppar A0–A3, G1/G2, spec/story-scheman
- **Lör 5:** A4–A7, testkontrakt, CI-är-facit
- **Sön 6:** Docker-skelett, A8, portal Översikt som mock
- **Mån 7:** A9–A13, grindvy-kontrakt, spårbarhetsmodell
- **Tis 8:** Första manuella EWS-intag steg 0–2 (syntetiskt, klass 0)
- **Ons 9:** Orkestreringsspec v0.1 utkast + lucklista

**Resultat:** Körbar process för manuell exekvering. Inget produktionssystem än.

## Navigering i repot

```
├── backlog/              # Epics, user stories, veckoplan
│   ├── INDEX.md          # BÖRJA HÄR – epic-karta, veckoplan, instruktioner
│   ├── A-processkontrakt.md
│   ├── B-agenter.md
│   ├── C-orkestrering.md
│   ├── D-docker.md
│   ├── E-git-artefakter.md
│   ├── F-portal.md
│   ├── G-grindar.md
│   ├── H-dataklass-testdata.md
│   ├── I-forsta-last-ews.md
│   ├── J-matning.md
│   └── K-nimloth-oss.md
├── prompter/             # Agentpromptkontrakt A0–A13
├── mallar/               # Dokumentmallar (spec, story, granskning, grindbeslut...)
├── .smedjan/             # Konfiguration (agents.yaml, dataklass.yaml, pipeline.yaml)
├── orkestrering/         # Orkestratorn (stegmaskin, OpenRouter-klient stub)
├── docker/               # Docker Compose skelett för testmiljöer
├── portal/               # Processportalens sitemap och vykontrakt
├── korningar/ews/        # Första last: EWS (Early Warning Score)
└── docs/                 # Processdokumentation
    └── process.md        # Processbeskrivning med principer och flöde
```

## Hur man kör en story manuellt (etapp 0)

1. Öppna `backlog/INDEX.md` och välj en story
2. Läs acceptanskriterier (AC) och beroenden
3. Hämta relevant promptkontrakt från `prompter/`
4. Kör agenten i en LLM-chatt med prompten + input enligt kontraktet
5. Validera output mot AC
6. Dokumentera i Git enligt `docs/process.md`

**Exempel:** Story B.A0.2 (Intag av EWS-förslag)
- Prompt: `prompter/A0.md`
- Input: syntestisk förslagsspec från `korningar/ews/`
- Output: validerad spec + JSON-metadata
- Validering: Spec uppfyller dataklass 0, inga nycklar/patientdata

## Vad Smedjan INTE är

- **Inte ett produktionssystem än** – etapp 0 är manuellt körbar process
- **Inte PoC:erna** – Patientöversikt, MTP/EWS Philips och Axel FHIR är *last* som körs *genom* processen, inte plattformen själv
- **Inte automatisk orkestrering än** – det kommer i etapp 2–3

## Dataklass och sekretess

**Dataklass 0:** Syntetiskt, inget skydd. Används för utveckling av processen.  
**Dataklass 1:** Pseudonymiserat. Ingen PII.  
**Dataklass 2:** Känsligt. Kräver VGR-miljö, loggar allt.

**Denna vecka:** Endast klass 0. Inga nycklar, inga patientdata i repot.

## Öppna frågor (dokumenterade, ej låsta)

1. **Orkestrator:** GitHub Actions (etapp 1) vs Temporal (etapp 2+)?
2. **LLM-klient:** Tunn OpenRouter-klient (rekommenderat) vs ramverk?
3. **QA-miljö:** Vem äger test-miljöer?
4. **Verksamhetsverifiering:** Formell del av G4 eller rådgivande?
5. **MDR-gräns:** Var går gränsen för medicinteknisk dokumentation?
6. **Driftvaktens mandat:** Hur mycket får A11 ändra utan människa?

## Bidra

Detta repo är processrepot. Modulrepon (själva mjukvaran för VGR Datahubb) kommer senare.

Följ processen i `docs/process.md`. Alla dokument på svenska. Inga hemligheter i Git.

## Kontakt

Anders Carlius, VGR, 2026.
