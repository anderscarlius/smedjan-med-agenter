# Epic G: Grindar

**Beskrivning:** G1–G4: beslutsformat, roller, eskalering, historik.

**Mål:** Definiera hur grindbeslut fattas, dokumenteras och spåras. Människan beslutar (P2).

**Etapp:** 0  
**Ansvarig:** Processägare  
**Status:** Pågående

---

## Stories

### Story G.G1.1: Definiera G1 (Specgodkännande)

**Som** beslutsfattare  
**vill jag** veta hur G1 fungerar  
**så att** jag kan fatta rätt beslut

**Acceptanskriterier:**
- **Given** Steg 1 (Specgranskning)
- **When** G1 definieras
- **Then** ska definitionen innehålla:
  - Input: Granskningsrapport från A1
  - Beslutsfattare: Produktägare eller systemarkitekt
  - Beslut: Godkänn / Återremittera / Avslå
  - Villkor: Godkänn med villkor (förtydliganden)
  - Dokumentation: Grindbeslut enligt mall (A.mallar.6)
  - Nästa steg: Om godkänd → steg 2, om återremitterad → L3-loop, om avslagen → arkivera
- **And** definitionen ska vara markdown

**Spec-referens:** docs/process.md § G1  
**Dataklass:** 0  
**Beroenden:** A.mallar.6  
**Etapp:** 0  
**Status:** todo

---

### Story G.G1.2: Skapa G1-exempel

**Som** beslutsfattare  
**vill jag** ha ett exempel på G1-beslut  
**så att** jag förstår formatet

**Acceptanskriterier:**
- **Given** G1-definition och EWS-spec
- **When** G1-exempel skapas
- **Then** ska det innehålla:
  - Granskningsrapport från A1 (mock)
  - Grindbeslut: Godkänd med villkor (förtydliga dataklass-hantering)
  - Beslutsfattare: Anders Carlius
  - Datum: 2026-09-04
  - Signatur: (mock, GPG-signerad i riktiga fall)
- **And** exemplet ska vara markdown

**Spec-referens:** G.G1.1  
**Dataklass:** 0  
**Beroenden:** G.G1.1  
**Etapp:** 0  
**Status:** todo

---

### Story G.G2.1: Definiera G2 (Storygodkännande)

**Som** beslutsfattare  
**vill jag** veta hur G2 fungerar  
**så att** stories blir godkända innan kodning

**Acceptanskriterier:**
- **Given** Steg 2 (Nedbrytning)
- **When** G2 definieras
- **Then** ska definitionen innehålla:
  - Input: Stories från A2 + granskningsrapport från A3
  - Beslutsfattare: Produktägare
  - Beslut: Godkänn / Återremittera
  - Kontrollpunkter: Stories är INVEST, AC är testbara, beroenden är tydliga
  - Dokumentation: Grindbeslut enligt mall
  - Nästa steg: Om godkänd → steg 3, om återremitterad → A2 igen
- **And** definitionen ska vara markdown

**Spec-referens:** docs/process.md § G2  
**Dataklass:** 0  
**Beroenden:** A.mallar.6  
**Etapp:** 0  
**Status:** todo

---

### Story G.G2.2: Skapa G2-exempel

**Som** beslutsfattare  
**vill jag** ha ett exempel på G2-beslut  
**så att** jag förstår formatet

**Acceptanskriterier:**
- **Given** G2-definition och EWS-stories
- **When** G2-exempel skapas
- **Then** ska det innehålla:
  - Stories från A2 (mock)
  - Granskningsrapport från A3 (mock)
  - Grindbeslut: Godkänd
  - Beslutsfattare: Anders Carlius
  - Datum: 2026-09-05
- **And** exemplet ska vara markdown

**Spec-referens:** G.G2.1  
**Dataklass:** 0  
**Beroenden:** G.G2.1  
**Etapp:** 0  
**Status:** todo

---

### Story G.G3.1: Definiera G3 (Utfallsgodkännande)

**Som** beslutsfattare  
**vill jag** veta hur G3 fungerar  
**så att** jag kan bedöma om funktionen är redo för QA

**Acceptanskriterier:**
- **Given** Steg 8 (Utfall/triage)
- **When** G3 definieras
- **Then** ska definitionen innehålla:
  - Input: Utfallsrapport från A10
  - Beslutsfattare: Teknisk ledare eller QA-ansvarig
  - Beslut: Till QA / Återremittera / Avslå
  - Kontrollpunkter: Tester gröna, inga kritiska risker, kodkvalitet OK
  - Dokumentation: Grindbeslut enligt mall
  - Nästa steg: Om till QA → steg 9, om återremitterad → L2-loop, om avslagen → arkivera
- **And** definitionen ska vara markdown

**Spec-referens:** docs/process.md § G3  
**Dataklass:** 0  
**Beroenden:** A.mallar.6  
**Etapp:** 0  
**Status:** todo

---

### Story G.G3.2: Skapa G3-exempel

**Som** beslutsfattare  
**vill jag** ha ett exempel på G3-beslut  
**så att** jag förstår formatet

**Acceptanskriterier:**
- **Given** G3-definition och EWS-utfallsrapport
- **When** G3-exempel skapas
- **Then** ska det innehålla:
  - Utfallsrapport från A10 (mock)
  - Grindbeslut: Till QA
  - Beslutsfattare: Anders Carlius
  - Datum: 2026-09-06
- **And** exemplet ska vara markdown

**Spec-referens:** G.G3.1  
**Dataklass:** 0  
**Beroenden:** G.G3.1  
**Etapp:** 0  
**Status:** todo

---

### Story G.G4.1: Definiera G4 (Produktionsgodkännande)

**Som** beslutsfattare  
**vill jag** veta hur G4 fungerar  
**så att** prod-deploy är formellt godkänt

**Acceptanskriterier:**
- **Given** Steg 9 (QA+verksamhetsverifiering)
- **When** G4 definieras
- **Then** ska definitionen innehålla:
  - Input: QA-rapport + verksamhetsverifiering
  - Beslutsfattare: Produktägare + verksamhetsrepresentant (båda krävs)
  - Beslut: Godkänn för prod / Återremittera / Avslå
  - Kontrollpunkter: QA-tester gröna, verksamheten nöjd, dokumentation klar
  - Dokumentation: Grindbeslut enligt mall (dubbelsignerat)
  - Nästa steg: Om godkänd → steg 10 (prod-deploy), om återremitterad → fixa i QA
- **And** definitionen ska vara markdown

**Spec-referens:** docs/process.md § G4  
**Dataklass:** 0  
**Beroenden:** A.mallar.6  
**Etapp:** 0  
**Status:** todo

---

### Story G.G4.2: Skapa G4-exempel

**Som** beslutsfattare  
**vill jag** ha ett exempel på G4-beslut  
**så att** jag förstår formatet

**Acceptanskriterier:**
- **Given** G4-definition och EWS-QA-rapport
- **When** G4-exempel skapas
- **Then** ska det innehålla:
  - QA-rapport (mock)
  - Verksamhetsverifiering (mock)
  - Grindbeslut: Godkänd för prod
  - Beslutsfattare: Anders Carlius (produktägare) + Verksamhetsrepresentant (mock)
  - Datum: 2026-09-07
- **And** exemplet ska vara markdown med två signaturer

**Spec-referens:** G.G4.1  
**Dataklass:** 0  
**Beroenden:** G.G4.1  
**Etapp:** 0  
**Status:** todo

---

## Sammanfattning

**Totalt:** 8 stories (2 per grind)  
**Etapp 0:** Alla 8 stories

**Prioritet vecka 3–9 sep:**
- **Fredag 4 sep:** G.G1.1, G.G1.2, G.G2.1, G.G2.2 (4 stories)
- **Måndag 7 sep:** G.G3.1, G.G3.2, G.G4.1, G.G4.2 (4 stories)

**Status:** Pågående
