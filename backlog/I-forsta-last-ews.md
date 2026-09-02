# Epic I: Första last – EWS

**Beskrivning:** Early Warning Score från Philips → VGR Datahubb. Syntetisk data (klass 0), steg 0–2 manuellt i etapp 0.

**Mål:** Första konkreta funktionalitet som körs genom processen. Används som golden-exempel för alla agenter.

**Etapp:** 0 (steg 0–2), 3 (hela flödet)  
**Ansvarig:** Produktägare  
**Status:** Ej påbörjad

---

## Stories

### Story I.ews-forslag.1: Skapa EWS-förslagsspec

**Som** produktägare  
**vill jag** ha en förslagsspec för EWS  
**så att** A0 kan processa den

**Acceptanskriterier:**
- **Given** EWS-krav från Philips-integration
- **When** förslagsspec skapas
- **Then** ska den innehålla:
  - Titel: "Early Warning Score (EWS) från Philips till VGR Datahubb"
  - Beskrivning: Hämta vitals från Philips-system, beräkna EWS-score, spara i Datahubb
  - Funktionella krav: API för att hämta vitals, EWS-beräkning enligt standard, lagring
  - Tekniska begränsningar: FHIR-format, REST API, autentisering via OAuth2
  - Dataklass: 0 (syntetiskt för etapp 0)
  - Sekretessbedömning: Framtida klass 2 (patientdata i prod), klass 0 nu
- **And** förslagsspec ska vara markdown enligt mall (A.mallar.1)

**Spec-referens:** A.mallar.1  
**Dataklass:** 0  
**Beroenden:** A.mallar.1  
**Etapp:** 0  
**Status:** todo

---

### Story I.ews-steg0.1: Kör A0 manuellt för EWS

**Som** processägare  
**vill jag** köra steg 0 (A0 Intag) manuellt för EWS  
**så att** jag validerar A0-prompten

**Acceptanskriterier:**
- **Given** EWS-förslagsspec (I.ews-forslag.1) och A0-prompt (B.A0.2)
- **When** A0 körs i LLM-chatt (Claude)
- **Then** ska output vara:
  - Strukturerad spec enligt mall (A.mallar.2)
  - JSON-metadata (artifact_id, created_by=A0, data_class=0)
  - Dataklass-validering: Godkänd (klass 0)
- **And** input + output ska sparas i `korningar/ews/steg0/`

**Spec-referens:** B.A0.2  
**Dataklass:** 0  
**Beroenden:** I.ews-forslag.1, B.A0.2  
**Etapp:** 0  
**Status:** todo

---

### Story I.ews-steg1.1: Kör A1 manuellt för EWS

**Som** processägare  
**vill jag** köra steg 1 (A1 Specgranskning) manuellt för EWS  
**så att** jag validerar A1-prompten

**Acceptanskriterier:**
- **Given** EWS-spec från steg 0 och A1-prompt (B.A1.2)
- **When** A1 körs i LLM-chatt (GPT-4)
- **Then** ska output vara:
  - Granskningsrapport enligt mall (A.mallar.3)
  - Rekommendation: Godkänn (eventuellt med minor comments)
  - Dataklass-validering: OK (klass 0)
- **And** input + output ska sparas i `korningar/ews/steg1/`

**Spec-referens:** B.A1.2  
**Dataklass:** 0  
**Beroenden:** I.ews-steg0.1, B.A1.2  
**Etapp:** 0  
**Status:** todo

---

### Story I.ews-G1.1: Simulera G1-beslut för EWS

**Som** beslutsfattare  
**vill jag** fatta ett G1-beslut för EWS  
**så att** jag validerar grindprocessen

**Acceptanskriterier:**
- **Given** EWS-granskningsrapport från A1
- **When** G1-beslut fattas
- **Then** ska beslutet vara:
  - Beslut: Godkänn
  - Beslutsfattare: Anders Carlius
  - Datum: 2026-09-08
  - Format enligt mall (A.mallar.6)
- **And** beslutet ska sparas i `korningar/ews/G1/`

**Spec-referens:** G.G1.1  
**Dataklass:** 0  
**Beroenden:** I.ews-steg1.1, G.G1.1  
**Etapp:** 0  
**Status:** todo

---

### Story I.ews-steg2.1: Kör A2 manuellt för EWS

**Som** processägare  
**vill jag** köra steg 2 (A2 Nedbrytning) manuellt för EWS  
**så att** jag får user stories

**Acceptanskriterier:**
- **Given** EWS-spec (godkänd i G1) och A2-prompt (B.A2.2)
- **When** A2 körs i LLM-chatt (Mistral)
- **Then** ska output vara:
  - 5–10 user stories enligt mall (A.mallar.4)
  - Varje story med Given/When/Then AC
  - Beroenden identifierade
  - Alla stories klass 0
- **And** stories ska sparas i `korningar/ews/steg2/`

**Spec-referens:** B.A2.2  
**Dataklass:** 0  
**Beroenden:** I.ews-G1.1, B.A2.2  
**Etapp:** 0  
**Status:** todo

---

### Story I.ews-hela-flodet.1: Kör EWS genom hela processen (steg 0–11)

**Som** processägare  
**vill jag** köra EWS genom alla steg  
**så att** jag validerar hela processen

**Acceptanskriterier:**
- **Given** EWS-stories från steg 2
- **When** EWS körs genom steg 3–11 (i etapp 3)
- **Then** ska alla steg completeras:
  - Steg 3: Kod implementerad
  - Steg 4–7: Tester gröna
  - Steg 8: Utfallsrapport godkänd (G3)
  - Steg 9: QA godkänd (G4)
  - Steg 10: Deploy till prod (mock)
  - Steg 11: Driftvakt aktiv
- **And** alla artefakter ska finnas i Git

**Spec-referens:** docs/process.md  
**Dataklass:** 0 (etapp 3), 2 (prod)  
**Beroenden:** I.ews-steg2.1, alla B.A*.2 prompter  
**Etapp:** 3  
**Status:** todo

---

## Sammanfattning

**Totalt:** 6 stories  
**Etapp 0:** 5 stories (steg 0–2 manuellt)  
**Etapp 3:** 1 story (hela flödet)

**Prioritet vecka 3–9 sep:**
- **Tisdag 8 sep:** I.ews-forslag.1, I.ews-steg0.1, I.ews-steg1.1, I.ews-G1.1, I.ews-steg2.1 (5 stories)

**Status:** Ej påbörjad (startar tisdag 8 sep)
