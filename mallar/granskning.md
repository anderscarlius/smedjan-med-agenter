# Mall: Granskningsrapport

**Syfte:** A1, A3, A5 använder denna mall för granskningsrapporter.

**Format:** Markdown med YAML frontmatter

---

```yaml
---
artifact_type: review
artifact_id: <UUID>
created_by: <A1/A3/A5>
created_at: <ISO 8601>
input_refs: ["<granskad-artefakt-id>"]
data_class: 0
schema_version: "1.0"
---

# Granskningsrapport: <Artefakt-ID>

**Granskare:** <A1 Specgranskare / A3 Storygranskare / A5 Kodgranskare>  
**Datum:** <ISO 8601>  
**Artefakt-version:** <version>

## Sammanfattning

**Rekommendation:** Godkänn / Godkänn med villkor / Återremittera / Avslå

<Kortfattad sammanfattning av granskningen (2–3 meningar)>

## Styrkor

<Lista identifierade styrkor, numrerade>

1. 
2. 
3. 

## Brister

<Lista identifierade brister med allvarlighet>

### Kritiska
<Brister som gör artefakten ogenomförbar eller osäker>

### Major
<Signifikanta brister som måste fixas>

### Minor
<Förbättringar önskvärda men inte blockerande>

## [För A1] Dataklass-validering

**Deklarerad klass:** <0/1/2>  
**Validering:** OK / Felaktig  
**Motivering:** <Varför klassen är korrekt eller felaktig>

## [För A1/A5] Riskbedömning

<Identifierade risker med allvarlighet och sannolikhet>

1. **<Risk-namn> (<Allvarlighet: Låg/Medium/Hög>):** <Beskrivning>
   - Sannolikhet: <Låg/Medium/Hög>
   - Mitigering: <Föreslagen åtgärd>

## Rekommendationer

<Konkreta förbättringsförslag, numrerade>

1. 
2. 
3. 

## Grindrekommendation (om tillämpligt)

**Beslut:** Godkänn / Godkänn med villkor / Återremittera / Avslå  
**Motivering:** <Varför detta beslut rekommenderas>  
**Villkor (om godkänn med villkor):** <Specificera villkor>
```

---

**Riktlinjer:**

- **Sammanfattning** ska vara koncis
- **Allvarlighetsgrad:**
  - **Kritisk:** Blockerande, måste fixas → AVSLÅ eller ÅTERREMITTERA
  - **Major:** Signifikant, måste fixas → ÅTERREMITTERA
  - **Minor:** Förbättring, inte blockerande → GODKÄNN med kommentar
- **Rekommendationer** ska vara konkreta och actionable
- **Grindrekommendation** (för A1, A3): Rekommendera beslut, men fatta INTE själv
