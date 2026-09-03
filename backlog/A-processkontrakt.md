# Epic A: Processkontrakt

**Beskrivning:** Processdokumentation, mallar, format och kontrakt som ligger till grund för allt arbete i Smedjan.

**Mål:** Skapa en komplett uppsättning mallar och kontrakt så att alla agenter och människor vet exakt vilket format som förväntas för specs, stories, granskningar, grindbeslut, etc.

**Etapp:** 0  
**Ansvarig:** Processägare  
**Status:** Pågående

---

## Stories

### Story A.kontrakt.1: Skapa processkontrakt-dokument

**Som** processägare  
**vill jag** ha ett centralt kontrakt-dokument  
**så att** alla agenter och människor vet vilka format som gäller

**Acceptanskriterier:**
- **Given** processen är definierad i docs/process.md
- **When** en användare behöver veta vilket format som gäller för en artefakt
- **Then** ska hen hitta det i ett kontrakt-dokument
- **And** dokumentet ska länka till relevanta mallar

**Spec-referens:** docs/process.md  
**Dataklass:** 0  
**Beroenden:** Inga  
**Etapp:** 0  
**Status:** todo

---

### Story A.mallar.1: Skapa förslagsspec-mall

**Som** product owner  
**vill jag** ha en mall för att skriva förslagsspecar  
**så att** A0 kan processa dem korrekt

**Acceptanskriterier:**
- **Given** en ny funktionsidé
- **When** jag ska skriva en förslagsspec
- **Then** ska det finnas en mall med:
  - Titel, beskrivning, användarnytta
  - Funktionella krav
  - Tekniska begränsningar
  - Dataklass-märkning
  - Sekretessbedömning
- **And** mallen ska ha ett konkret exempel (EWS)

**Spec-referens:** docs/process.md § Steg 0  
**Dataklass:** 0  
**Beroenden:** A.kontrakt.1  
**Etapp:** 0  
**Status:** todo

---

### Story A.mallar.2: Skapa spec-mall

**Som** A0-agent  
**vill jag** ha en mall för strukturerade specs  
**så att** A1 kan granska dem konsekvent

**Acceptanskriterier:**
- **Given** en godkänd förslagsspec
- **When** A0 strukturerar den
- **Then** ska output följa spec-mallen med:
  - Metadata (id, version, dataklass, författare, datum)
  - Funktionell beskrivning
  - Användare och roller
  - Dataflöden
  - Gränssnitt (API, UI, integrationer)
  - Icke-funktionella krav (prestanda, säkerhet)
  - Beroenden och risker
- **And** mallen ska vara markdown med YAML frontmatter

**Spec-referens:** docs/process.md § Steg 0  
**Dataklass:** 0  
**Beroenden:** A.mallar.1  
**Etapp:** 0  
**Status:** todo

---

### Story A.mallar.3: Skapa gransknings-mall

**Som** A1-agent  
**vill jag** ha en mall för granskningsrapporter  
**så att** G1-beslutsfattare får konsekvent information

**Acceptanskriterier:**
- **Given** en spec att granska
- **When** A1 granskar den
- **Then** ska output följa gransknings-mallen med:
  - Sammanfattning (godkänn/återremittera/avslå)
  - Identifierade styrkor
  - Identifierade brister
  - Dataklass-validering
  - Riskbedömning
  - Rekommendationer
  - Grindrekommendation (G1)
- **And** varje punkt ska ha motivering

**Spec-referens:** docs/process.md § Steg 1  
**Dataklass:** 0  
**Beroenden:** A.mallar.2  
**Etapp:** 0  
**Status:** todo

---

### Story A.mallar.4: Skapa story-mall

**Som** A2-agent  
**vill jag** ha en mall för user stories  
**så att** A3 och utvecklare kan arbeta konsekvent

**Acceptanskriterier:**
- **Given** en godkänd spec
- **When** A2 bryter ner den i stories
- **Then** ska varje story följa mallen:
  - Story-id (t.ex. FUNC-123.1)
  - Titel: "Som [roll] vill jag [funktion] så att [nytta]"
  - Acceptanskriterier (Given/When/Then)
  - Dataklass
  - Beroenden (andra stories)
  - Uppskattning (S/M/L)
  - Status (todo/in-progress/done)
- **And** stories ska vara YAML eller markdown med frontmatter

**Spec-referens:** docs/process.md § Steg 2  
**Dataklass:** 0  
**Beroenden:** A.mallar.2  
**Etapp:** 0  
**Status:** todo

---

### Story A.mallar.5: Skapa systemtest-mall

**Som** A9-agent  
**vill jag** ha en mall för systemtestrapporter  
**så att** A10 och G3-beslutsfattare kan utvärdera kvalitet

**Acceptanskriterier:**
- **Given** en körande test-deploy
- **When** A9 kör E2E-tester
- **Then** ska testrapporten följa mallen:
  - Testmiljö (version, konfiguration)
  - Testscenarier (lista med Given/When/Then)
  - Resultat per scenario (pass/fail)
  - Prestanda-mätningar
  - Säkerhetskontroller
  - Identifierade buggar
  - Sammanfattande rekommendation
- **And** varje fail ska ha reproduktionssteg

**Spec-referens:** docs/process.md § Steg 7  
**Dataklass:** 0  
**Beroenden:** A.mallar.4  
**Etapp:** 0  
**Status:** todo

---

### Story A.mallar.6: Skapa grindbeslut-mall

**Som** G1-beslutsfattare  
**vill jag** ha en mall för grindbeslut  
**så att** beslut blir spårbara och konsistenta

**Acceptanskriterier:**
- **Given** en granskningsrapport från A1
- **When** jag fattar ett G1-beslut
- **Then** ska beslutet följa mallen:
  - Grind (G1/G2/G3/G4)
  - Beslut (godkänn/återremittera/avslå)
  - Beslutsfattare (namn, datum, signatur)
  - Motivering
  - Villkor (om godkänn med villkor)
  - Nästa steg
- **And** beslutet ska versionshanteras i Git

**Spec-referens:** docs/process.md § Grindar  
**Dataklass:** 0  
**Beroenden:** A.mallar.3  
**Etapp:** 0  
**Status:** todo

---

### Story A.mallar.7: Skapa utfallsrapport-mall

**Som** A10-agent  
**vill jag** ha en mall för utfallsrapporter  
**så att** G3-beslutsfattare kan bedöma produktionslämphet

**Acceptanskriterier:**
- **Given** testrapporter från steg 4–7
- **When** A10 analyserar utfallet
- **Then** ska utfallsrapporten följa mallen:
  - Sammanfattning (redo/ej redo för QA)
  - Testresultat-översikt (unit, integration, E2E)
  - Identifierade risker (kategoriserade efter allvarlighet)
  - Kodkvalitet-mätningar (täckning, komplexitet)
  - Prestandabedömning
  - Säkerhetsbedömning
  - Rekommendation för G3
- **And** risker ska ha rekommenderade åtgärder

**Spec-referens:** docs/process.md § Steg 8  
**Dataklass:** 0  
**Beroenden:** A.mallar.5  
**Etapp:** 0  
**Status:** todo

---

### Story A.format.1: Definiera JSON-metadata-schema

**Som** systemarkitekt  
**vill jag** ha ett JSON-schema för metadata  
**så att** alla artefakter har maskinläsbar proveniens

**Acceptanskriterier:**
- **Given** en artefakt (spec, story, testrapport, etc.)
- **When** den skapas av en agent
- **Then** ska den ha JSON-metadata:
  - `artifact_type` (spec/story/test/deploy/etc.)
  - `artifact_id` (unik identifierare)
  - `created_by` (agent-id, t.ex. A0)
  - `created_at` (ISO 8601 timestamp)
  - `input_refs` (lista av input-artefakt-id:n)
  - `data_class` (0/1/2)
  - `schema_version` (t.ex. "1.0")
- **And** schemat ska vara versionshanterat

**Spec-referens:** docs/process.md § Git-struktur  
**Dataklass:** 0  
**Beroenden:** A.kontrakt.1  
**Etapp:** 0  
**Status:** todo

---

## Sammanfattning

**Totalt:** 8 stories  
**Etapp 0:** 8 stories  
**Status:** Alla todo, kan startas parallellt efter A.kontrakt.1
