# Epic H: Dataklass och testdata

**Beskrivning:** Dataklass 0/1/2, testdata-generering, pseudonymisering, valideringsregler.

**Mål:** Säkerställa att dataskydd (P5) implementeras korrekt. Ingen patientdata i dev-miljöer.

**Etapp:** 0  
**Ansvarig:** Säkerhetsansvarig + processägare  
**Status:** Pågående

---

## Stories

### Story H.klass.1: Dokumentera dataklass-definition

**Som** processägare  
**vill jag** ha en tydlig definition av dataklass 0/1/2  
**så att** alla förstår vad som tillåts var

**Acceptanskriterier:**
- **Given** Princip P5 (Minimal dataklass)
- **When** definitionen dokumenteras
- **Then** ska den innehålla:
  - **Klass 0 (Syntetiskt):** Ingen skyddad data, får lagras publikt
  - **Klass 1 (Pseudonymiserat):** Ingen PII, får användas i test/QA inom VGR
  - **Klass 2 (Känsligt):** Patientdata, nycklar, endast i prod, full audit-logg
  - Exempel på varje klass
  - Vilka miljöer som tillåter vilken klass
- **And** definitionen ska vara markdown

**Spec-referens:** docs/process.md § Dataklass  
**Dataklass:** 0  
**Beroenden:** Inga  
**Etapp:** 0  
**Status:** todo

---

### Story H.validering.1: Skapa dataklass-valideringsregler

**Som** A0-agent  
**vill jag** ha valideringsregler  
**så att** jag kan avvisa känslig data i fel miljö

**Acceptanskriterier:**
- **Given** Dataklass-definition
- **When** valideringsregler skapas
- **Then** ska de innehålla:
  - Regex-mönster för personnummer (YYYYMMDD-XXXX)
  - Regex för namn (detektera förnamn/efternamn)
  - Regex för adresser
  - Regex för API-nycklar (patterns för olika providers)
  - Kontrollsummor (Luhn för personnummer)
- **And** reglerna ska vara maskinläsbara (JSON)

**Spec-referens:** H.klass.1  
**Dataklass:** 0  
**Beroenden:** H.klass.1  
**Etapp:** 0  
**Status:** todo

---

### Story H.testdata.1: Skapa syntetisk testdata-generator

**Som** utvecklare  
**vill jag** ha en generator för syntetisk testdata  
**så att** jag kan testa utan känslig data

**Acceptanskriterier:**
- **Given** Dataklass 0-krav
- **When** generatorn skapas
- **Then** ska den kunna generera:
  - Syntetiska personnummer (giltiga checksummor men ej riktiga)
  - Syntetiska namn (slumpmässiga, tydligt fake)
  - Syntetiska EWS-värden (vitals inom normala intervall)
  - Syntetiska timestamps
  - JSON-output
- **And** generatorn ska vara Python-script

**Spec-referens:** H.klass.1  
**Dataklass:** 0  
**Beroenden:** H.klass.1  
**Etapp:** 0  
**Status:** todo

---

### Story H.pseudonymisering.1: Dokumentera pseudonymiserings-process

**Som** säkerhetsansvarig  
**vill jag** ha en process för pseudonymisering  
**så att** klass 1-data kan skapas säkert

**Acceptanskriterier:**
- **Given** Dataklass 1-krav
- **When** processen dokumenteras
- **Then** ska den innehålla:
  - Hur personnummer ersätts med UUIDs
  - Hur mapping sparas (krypterat, ej i Git)
  - Hur namn/adresser tas bort
  - Verifiering (kontrollera att ingen PII läcker)
  - Verktyg (t.ex. `anonymize.py`)
- **And** processen ska vara markdown

**Spec-referens:** H.klass.1  
**Dataklass:** 0  
**Beroenden:** H.klass.1  
**Etapp:** 0  
**Status:** todo

---

### Story H.audit.1: Definiera audit-logg för klass 2

**Som** säkerhetsansvarig  
**vill jag** veta hur klass 2-data loggas  
**så att** compliance uppfylls

**Acceptanskriterier:**
- **Given** Dataklass 2-krav
- **When** audit-logg definieras
- **Then** ska den innehålla:
  - Vad som loggas: Alla accesser till patientdata
  - Loggformat: Timestamp, användare, åtgärd, data-id (ej själva datan)
  - Lagring: Append-only, krypterad
  - Retention: Minst 3 år (svensk lag)
  - Access: Endast auditörer
- **And** definitionen ska vara markdown

**Spec-referens:** H.klass.1  
**Dataklass:** 0  
**Beroenden:** H.klass.1  
**Etapp:** 0  
**Status:** todo

---

### Story H.etapp0.1: Verifiera att etapp 0 är dataklass 0

**Som** processägare  
**vill jag** verifiera att allt i etapp 0 är klass 0  
**så att** ingen känslig data läcker

**Acceptanskriterier:**
- **Given** Alla artefakter från vecka 3–9 sep
- **When** verifiering görs
- **Then** ska alla:
  - Specs vara klass 0 (EWS-exempel med syntetisk data)
  - Stories vara klass 0
  - Exempel vara klass 0
  - Git-commits inte innehålla nycklar
- **And** verifieringen ska vara checklist i markdown

**Spec-referens:** H.klass.1  
**Dataklass:** 0  
**Beroenden:** H.validering.1  
**Etapp:** 0  
**Status:** todo

---

### Story H.ews-syntetisk.1: Skapa syntetisk EWS-dataset

**Som** utvecklare  
**vill jag** ha en syntetisk EWS-dataset  
**så att** jag kan testa EWS-funktionalitet

**Acceptanskriterier:**
- **Given** EWS-spec (från B.A0.3)
- **When** dataset skapas
- **Then** ska den innehålla:
  - 10 syntetiska patienter (fake ID:n)
  - EWS-värden (vitals: puls, blodtryck, saturation, temp, medvetande)
  - EWS-score (beräknad enligt Philips-algoritm)
  - Timestamps (syntetiska)
  - JSON-format
- **And** dataset ska sparas i `korningar/ews/testdata.json`

**Spec-referens:** I.ews-forslag.1  
**Dataklass:** 0  
**Beroenden:** H.testdata.1  
**Etapp:** 0  
**Status:** todo

---

### Story H.secrets.1: Dokumentera secrets-hantering

**Som** säkerhetsansvarig  
**vill jag** veta hur secrets hanteras  
**så att** nycklar inte läcker

**Acceptanskriterier:**
- **Given** Dataklass-krav
- **When** secrets-hantering dokumenteras
- **Then** ska den innehålla:
  - Secrets får ALDRIG committas till Git
  - Använd `.env.example` som mall (utan riktiga värden)
  - Secrets i prod: Kubernetes Secrets / AWS Secrets Manager
  - Secrets i CI: GitHub Secrets
  - Rotation: Minst varje 90 dagar
- **And** dokumentationen ska vara markdown

**Spec-referens:** docs/process.md § Dataklass  
**Dataklass:** 0  
**Beroenden:** H.klass.1  
**Etapp:** 0  
**Status:** todo

---

## Sammanfattning

**Totalt:** 8 stories  
**Etapp 0:** Alla 8 stories

**Prioritet vecka 3–9 sep:**
- **Fredag 4 sep:** H.klass.1, H.validering.1, H.testdata.1 (3 stories)
- **Tisdag 8 sep:** H.pseudonymisering.1, H.audit.1, H.etapp0.1, H.ews-syntetisk.1, H.secrets.1 (5 stories)

**Status:** Pågående
