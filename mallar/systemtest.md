# Mall: Systemtestrapport

**Syfte:** A9 (Systemtestare) använder denna mall för E2E-testrapporter.

**Format:** Markdown med YAML frontmatter

---

```yaml
---
artifact_type: test_report
artifact_id: <UUID>
report_type: system_test
created_by: A9
created_at: <ISO 8601>
input_refs: ["<deployed-environment-id>"]
data_class: 0
schema_version: "1.0"
---

# Systemtestrapport: <Funktion-ID>

**Testare:** A9 Systemtestare  
**Datum:** <ISO 8601>  
**Miljö:** Test / QA  
**Miljö-URL:** <URL till deployed system>

## Testmiljö

**Version:** <Image digest eller version>  
**Konfiguration:** <Beskrivning av miljö (Docker Compose, K8s, etc.)>  
**Dataklass:** 0/1/2

## Testscenarier

### Scenario 1: <Scenario-namn>

**Beskrivning:** <Vad detta scenario testar>

**Steg:**
1. **Given** <förutsättning>
2. **When** <åtgärd>
3. **Then** <förväntat resultat>

**Resultat:** PASS / FAIL  
**Exekveringstid:** <X sekunder>  
**Kommentar:** <Om FAIL: Varför? Reproduktionssteg?>

---

### Scenario 2: <Scenario-namn>

<...fortsätt för alla scenarier...>

---

## Prestanda-mätningar

| Endpoint / Åtgärd | P50 | P95 | P99 | Max | Spec-krav | Resultat |
|-------------------|-----|-----|-----|-----|-----------|----------|
| GET /ews/{id}     | 150ms | 320ms | 450ms | 1200ms | <2s | PASS |
| ...               |     |     |     |     |           |      |

## Säkerhetskontroller

| Kontroll | Resultat | Kommentar |
|----------|----------|-----------|
| Autentisering krävs | PASS | 401 vid felaktig token |
| Authorization kontrollerad | PASS | 403 vid ej auktoriserad |
| Input validation | PASS | 400 vid felaktig input |
| SQL injection-skydd | PASS | Testat med `'; DROP TABLE--` |
| XSS-skydd | PASS | Testat med `<script>alert(1)</script>` |

## Identifierade buggar

<Om inga buggar: "Inga buggar identifierade">

### Bug 1: <Bug-namn>

**Allvarlighet:** Critical / Major / Minor  
**Beskrivning:** <Vad är felet?>  
**Reproduktionssteg:**
1. 
2. 
3. 

**Förväntat:** <Vad skulle hända>  
**Faktiskt:** <Vad hände>

---

## Sammanfattning

**Totalt scenarier:** <antal>  
**PASS:** <antal>  
**FAIL:** <antal>  
**Prestanda:** Alla inom spec / X utanför spec  
**Säkerhet:** Alla kontroller OK / X misslyckades  
**Identifierade buggar:** <antal>

**Rekommendation:** Godkänd för nästa steg / Återremittera (fixa buggar först)
```

---

**Riktlinjer:**

- **Testscenarier** baseras på story-AC
- **Prestanda** mäts för alla kritiska endpoints
- **Säkerhet** är obligatorisk kontroll (auth, authorization, input validation, injection, XSS)
- **Buggar** dokumenteras med reproduktionssteg
- **Allvarlighet:**
  - **Critical:** System fungerar inte, data korrupt, säkerhetsbrist
  - **Major:** Funktionalitet fungerar ej som spec
  - **Minor:** Kosmetiskt, edge case
