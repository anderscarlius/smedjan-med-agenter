# Epic I: Ytterligare PoC-laster (Patientöversikt + Axel FHIR)

**Beskrivning:** Två ytterligare PoC-laster (utöver EWS) för att Anders ska kunna testa dem genom processen (steg 0–2 mock först).

**Mål:** Generalisera orkestrering för flera projekt. Skapa två nya laster med samma mönster som `korningar/ews/`.

**Etapp:** 0 (steg 0–2 mock)  
**Ansvarig:** Utvecklare  
**Status:** Ready (färdiga för demo)

---

## Bakgrund

EWS-lasten (`korningar/ews/`) är första PoC-lasten. Nu utökar vi med två till för att:
1. Validera att orkestreringslogiken är generell (inte hårdkodad för EWS)
2. Ge Anders fler exempel att testa processen med
3. Täcka olika typer av integrationer (aggregering + nationell infrastruktur)

**Dataklass:** Alla laster är klass 0 (syntetisk data, inga patientuppgifter).

---

## Stories

### Story I.poc-laster.1: Generalisera orchestrator för projekt-slug

**Som** utvecklare  
**vill jag** generalisera `orchestrator.py` från hårdkodad `ews`-path till projekt-slug  
**så att** samma kod kan köra flera PoC-laster

**Acceptanskriterier:**
- **Given** `orchestrator.py` är hårdkodad för `korningar/ews/`
- **When** generalisering görs
- **Then** ska orchestrator acceptera `project_slug` som parameter
- **And** `self.korningar_dir = workspace / "korningar" / project_slug`
- **And** `run_demo()` ska fungera för alla projekt
- **And** `run_ews_demo()` ska finnas kvar för bakåtkompatibilitet (anropar `run_demo()`)
- **And** `_get_default_forslagsspec(project_slug)` ska returnera rätt spec per projekt

**Spec-referens:** `orkestrering/orchestrator.py`  
**Dataklass:** 0  
**Beroenden:** Ingen  
**Etapp:** 0  
**Status:** completed

---

### Story I.poc-laster.2: Uppdatera CLI för flera projekt

**Som** användare  
**vill jag** kunna köra `python -m orkestrering demo <projekt>`  
**så att** jag kan välja vilken PoC-last jag vill köra

**Acceptanskriterier:**
- **Given** CLI stöder bara `demo ews`
- **When** CLI uppdateras
- **Then** ska följande kommandon fungera:
  - `python -m orkestrering demo ews`
  - `python -m orkestrering demo patientoversikt`
  - `python -m orkestrering demo axel-fhir`
- **And** felmeddelande ska lista alla tillgängliga projekt om okänt projekt anges

**Spec-referens:** `orkestrering/__main__.py`  
**Dataklass:** 0  
**Beroenden:** I.poc-laster.1  
**Etapp:** 0  
**Status:** completed

---

### Story I.poc-laster.3: Skapa Patientöversikt-last

**Som** produktägare  
**vill jag** ha en PoC-last för Patientöversikt  
**så att** jag kan testa den genom processen

**Acceptanskriterier:**
- **Given** EWS-last finns som mall
- **When** Patientöversikt-last skapas
- **Then** ska `korningar/patientoversikt/` skapas med:
  - `forslagsspec.md` (dataklass 0, realistisk men syntetisk)
  - `README.md` (struktur, syfte, körning)
- **And** `forslagsspec.md` ska innehålla:
  - Titel: "Patientöversikt"
  - Beskrivning: Aggregera data från Cosmic, Pascal, journalsystem
  - Funktionella krav: 6 punkter (hämta data, aggregera, visa lab/mediciner/diagnoser, API)
  - Tekniska begränsningar: REST API, cache 5 min, SITHS, max 2 sek
  - Dataklass: 0 (syntetisk)
  - Sekretessbedömning: Klass 2 i prod, klass 0 nu
- **And** `python -m orkestrering demo patientoversikt` ska fungera

**Spec-referens:** `korningar/patientoversikt/forslagsspec.md`  
**Dataklass:** 0  
**Beroenden:** I.poc-laster.2  
**Etapp:** 0  
**Status:** completed

---

### Story I.poc-laster.4: Skapa Axel FHIR-last

**Som** produktägare  
**vill jag** ha en PoC-last för Axel FHIR-integration  
**så att** jag kan testa den genom processen

**Acceptanskriterier:**
- **Given** EWS-last finns som mall
- **When** Axel FHIR-last skapas
- **Then** ska `korningar/axel-fhir/` skapas med:
  - `forslagsspec.md` (dataklass 0, realistisk men syntetisk)
  - `README.md` (struktur, syfte, körning)
- **And** `forslagsspec.md` ska innehålla:
  - Titel: "Axel FHIR-integration"
  - Beskrivning: Integration med Axel (nationell infrastruktur) för patientsammanfattningar
  - Funktionella krav: 6 punkter (autentisera SITHS, söka patient, hämta IPS, validera FHIR, PDL-logga, API)
  - Tekniska begränsningar: FHIR R4 svensk profil, SITHS+OAuth2, PDL-loggning, 10 sek timeout, samtycke
  - Dataklass: 0 (syntetisk, mockat Axel-API)
  - Sekretessbedömning: Klass 2 i prod, klass 0 nu
- **And** `python -m orkestrering demo axel-fhir` ska fungera

**Spec-referens:** `korningar/axel-fhir/forslagsspec.md`  
**Dataklass:** 0  
**Beroenden:** I.poc-laster.2  
**Etapp:** 0  
**Status:** completed

---

### Story I.poc-laster.5: Skapa korningar/README.md

**Som** användare  
**vill jag** ha en översikt över alla tillgängliga PoC-laster  
**så att** jag vet vilka projekt jag kan köra

**Acceptanskriterier:**
- **Given** tre laster finns (ews, patientoversikt, axel-fhir)
- **When** `korningar/README.md` skapas
- **Then** ska den innehålla:
  - Översikt över alla tre laster
  - Kommando för att köra varje last
  - Länk till varje lasts README
  - Förklaring av gemensam struktur
  - Instruktion för hur man byter aktiv portal-demo (TODO i framtiden)
- **And** alla tre laster ska listas med status och beskrivning

**Spec-referens:** `korningar/README.md`  
**Dataklass:** 0  
**Beroenden:** I.poc-laster.3, I.poc-laster.4  
**Etapp:** 0  
**Status:** completed

---

### Story I.poc-laster.6: Uppdatera backlog INDEX

**Som** projektledare  
**vill jag** att backlog INDEX.md refererar till nya laster  
**så att** det är lätt att hitta dokumentation

**Acceptanskriterier:**
- **Given** `backlog/INDEX.md` finns
- **When** den uppdateras
- **Then** ska den innehålla referens till:
  - `backlog/I-forsta-last-ews.md` (befintlig)
  - `backlog/I-poc-laster.md` (ny)
- **And** beskriva att det nu finns tre PoC-laster

**Spec-referens:** `backlog/INDEX.md`  
**Dataklass:** 0  
**Beroenden:** I.poc-laster.5  
**Etapp:** 0  
**Status:** ready (ej implementerad ännu)

---

## Sammanfattning

**Totalt:** 6 stories  
**Completed:** 5 stories (generalisering, CLI, två nya laster, README)  
**Ready:** 1 story (uppdatera backlog INDEX)

**Resultat:**
- ✅ Orchestrator generaliserad för projekt-slug
- ✅ CLI stöder `demo ews | patientoversikt | axel-fhir`
- ✅ Patientöversikt-last skapad och körbar
- ✅ Axel FHIR-last skapad och körbar
- ✅ `korningar/README.md` dokumenterar alla tre laster
- ⏳ Backlog INDEX.md behöver uppdateras (optional)

**Nästa steg:**
- Anders kan nu köra alla tre laster med mock-demo
- Portal-integration kan utökas senare för att välja aktiv last
- I etapp 1: Kör lastarna genom hela processen (steg 3–11)

---

**Status:** Ready (färdiga för testning)
