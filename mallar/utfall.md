# Mall: Utfallsrapport

**Syfte:** A10 (Utfallsanalytiker) använder denna mall för utfallsanalys efter testning.

**Format:** Markdown med YAML frontmatter

---

```yaml
---
artifact_type: outcome_report
artifact_id: <UUID>
created_by: A10
created_at: <ISO 8601>
input_refs: ["<test-rapport-id:n från steg 4–7>"]
data_class: 0
schema_version: "1.0"
---

# Utfallsrapport: <Funktion-ID>

**Analytiker:** A10 Utfallsanalytiker  
**Datum:** <ISO 8601>  
**Funktion-version:** <version>

## Sammanfattning

**Beslut:** Redo för QA / Ej redo för QA

<Kortfattad sammanfattning (2–3 meningar)>

## Testresultat-översikt

| Teststeg | Typ | Resultat | Coverage | Kommentar |
|----------|-----|----------|----------|-----------|
| Steg 4 | Unit | PASS (95%) | 87% line | Bra täckning |
| Steg 5 | Integration | PASS (100%) | N/A | Alla API-tester gröna |
| Steg 7 | E2E | PASS (90%), 1 minor bug | N/A | Minor bug dokumenterad |

**Sammanfattning:**
- **Unit-tester:** <antal PASS/FAIL>, <coverage %>
- **Integrationstester:** <antal PASS/FAIL>
- **E2E-tester:** <antal PASS/FAIL>
- **Identifierade buggar:** <antal (Critical/Major/Minor)>

## Identifierade risker

### Risk 1: <Risk-namn>

**Allvarlighet:** Critical / Major / Minor  
**Sannolikhet:** Låg / Medium / Hög  
**Riskpoäng:** <Allvarlighet × Sannolikhet>  
**Beskrivning:** <Vad är risken?>  
**Mitigering:** <Hur hanteras risken?>

---

<Fortsätt för alla risker>

---

## Kodkvalitet-mätningar

| Metrik | Värde | Målvärde | Resultat |
|--------|-------|----------|----------|
| Line coverage | 87% | >80% | PASS |
| Branch coverage | 72% | >70% | PASS |
| Cyclomatic complexity (max) | 8 | <10 | PASS |
| Duplicering | 2% | <5% | PASS |

## Prestandabedömning

| Endpoint | P95 | Spec-krav | Resultat |
|----------|-----|-----------|----------|
| GET /ews/{id} | 320ms | <2s | PASS |
| POST /ews | 450ms | <5s | PASS |

**Sammanfattning:** Alla prestanda-krav uppfyllda.

## Säkerhetsbedömning

| Kontroll | Resultat | Kommentar |
|----------|----------|-----------|
| Autentisering | PASS | OAuth2 korrekt implementerad |
| Authorization | PASS | Rollbaserad access control |
| Input validation | PASS | Alla inputs validerade |
| Injection-skydd | PASS | Parametriserade queries |
| XSS-skydd | PASS | Output escaped |
| Secrets-hantering | PASS | Inga secrets i kod |

**Sammanfattning:** Alla säkerhetskontroller godkända.

## Rekommendation för G3

**Beslut:** Redo för QA / Ej redo för QA  
**Motivering:**

<Motivering baserad på testresultat, risker, kodkvalitet, prestanda och säkerhet>

**Åtgärder innan QA (om några):**
1. 
2. 

**Risker som accepteras (med motivering):**
1. 
2. 
```

---

**Riktlinjer:**

- **Objektiv analys:** Baserad på testresultat, inte subjektiva åsikter
- **Riskbedömning:** Allvarlighet × Sannolikhet = Riskpoäng
  - Critical risk → Ej redo för QA
  - Major risk → Bedöm från fall till fall
  - Minor risk → Acceptera med dokumentation
- **Kodkvalitet:** Mätvärden ska vara inom målvärden
- **Prestanda:** Alla spec-krav ska uppfyllas
- **Säkerhet:** Alla kontroller ska passera
