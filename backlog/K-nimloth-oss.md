# Epic K: Nimloth OSS

**Beskrivning:** Open source-förberedelser, licens, dokumentation, separation från VGR-specifikt.

**Mål:** Förbereda för att göra Smedjan-processen open source (Nimloth). Etapp 0: dokumentera intention, etapp 4+: faktisk OSS-release.

**Etapp:** 0 (intention), 4+ (implementation)  
**Ansvarig:** Processägare  
**Status:** Ej påbörjad

---

## Stories

### Story K.intention.1: Dokumentera OSS-intention

**Som** processägare  
**vill jag** dokumentera intentionen att göra Smedjan OSS  
**så att** alla förstår målet

**Acceptanskriterier:**
- **Given** Smedjans process
- **When** OSS-intentionen dokumenteras
- **Then** ska den innehålla:
  - Varför OSS: Transparens, reproducerbarhet, community-bidrag
  - Vad som blir OSS: Process, prompter, mallar, orkestrator
  - Vad som INTE blir OSS: VGR-specifik config, patientdata, nycklar
  - Tidslinje: Etapp 4+ (Q1 2027)
  - Licens: Apache-2.0 (redan valt)
- **And** intentionen ska vara markdown i `docs/nimloth-oss.md`

**Spec-referens:** docs/process.md  
**Dataklass:** 0  
**Beroenden:** Inga  
**Etapp:** 0  
**Status:** todo

---

### Story K.separation.1: Definiera VGR/generell-separation

**Som** systemarkitekt  
**vill jag** veta vad som är VGR-specifikt  
**så att** separation kan göras

**Acceptanskriterier:**
- **Given** Smedjans kod och config
- **When** separation definieras
- **Then** ska den innehålla:
  - **Generellt (OSS):** Process, prompter, mallar, orkestrator, portal
  - **VGR-specifikt (ej OSS):** VGR auth-config, VGR-miljöer, VGR-moduler (EWS, etc.)
  - Struktur: Monorepo med `/core` (OSS) och `/vgr` (privat)
  - Config-injection: VGR-config läses från env-var, ej hårdkodat
- **And** separationen ska vara markdown

**Spec-referens:** K.intention.1  
**Dataklass:** 0  
**Beroenden:** K.intention.1  
**Etapp:** 0  
**Status:** todo

---

### Story K.dokumentation.1: Skapa OSS-dokumentation

**Som** OSS-användare  
**vill jag** ha dokumentation  
**så att** jag kan använda Nimloth/Smedjan

**Acceptanskriterier:**
- **Given** Smedjans process och kod
- **When** OSS-dokumentation skapas
- **Then** ska den innehålla:
  - README.md: Vad Nimloth är, hur man kör det
  - CONTRIBUTING.md: Hur man bidrar
  - CODE_OF_CONDUCT.md: Community-regler
  - docs/installation.md: Installationsinstruktioner
  - docs/configuration.md: Hur man konfigurerar för sin organisation
- **And** dokumentationen skapas i etapp 4

**Spec-referens:** K.intention.1  
**Dataklass:** 0  
**Beroenden:** K.intention.1  
**Etapp:** 4  
**Status:** todo

---

### Story K.release.1: Gör första OSS-release

**Som** processägare  
**vill jag** göra första OSS-release  
**så att** Nimloth blir publikt

**Acceptanskriterier:**
- **Given** Separerad kod och OSS-dokumentation
- **When** första release görs
- **Then** ska den:
  - Publiceras på GitHub (public repo)
  - Ha tag v1.0.0
  - Ha release notes
  - Ha länk till VGR-artikel (om tillåtet)
  - Annonseras i relevant community (t.ex. r/MachineLearning, HN)
- **And** release sker i etapp 4+

**Spec-referens:** K.intention.1  
**Dataklass:** 0  
**Beroenden:** K.dokumentation.1  
**Etapp:** 4  
**Status:** todo

---

## Sammanfattning

**Totalt:** 4 stories  
**Etapp 0:** 2 stories (intention + separation)  
**Etapp 4+:** 2 stories (dokumentation + release)

**Prioritet vecka 3–9 sep:**
- **Onsdag 9 sep:** K.intention.1, K.separation.1 (2 stories, dokumentera intention)

**Status:** Ej påbörjad (startar onsdag 9 sep)
