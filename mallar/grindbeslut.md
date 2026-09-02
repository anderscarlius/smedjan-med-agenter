# Mall: Grindbeslut

**Syfte:** Beslutsfattare (människa) använder denna mall för grindbeslut (G1–G4).

**Format:** Markdown med YAML frontmatter, GPG-signerad commit

---

```yaml
---
artifact_type: decision
artifact_id: <UUID>
grind: G1/G2/G3/G4
decision: godkann / godkann_med_villkor / återremittera / avslå
created_by: <Beslutsfattarens namn>
created_at: <ISO 8601>
input_refs: ["<granskningsrapport-id eller artefakt-id>"]
data_class: 0
schema_version: "1.0"
---

# Grindbeslut <Grind>: <Artefakt-ID>

**Grind:** G1 (Specgodkännande) / G2 (Storygodkännande) / G3 (Utfallsgodkännande) / G4 (Produktionsgodkännande)  
**Beslut:** Godkänn / Godkänn med villkor / Återremittera / Avslå  
**Beslutsfattare:** <Namn, roll>  
**Datum:** <ISO 8601>  
**Signatur:** <GPG-signatur (commit signeras)>

## Motivering

<Varför detta beslut fattas. Referera till granskningsrapport om tillämpligt.>

## Villkor (om godkänn med villkor)

<Specificera villkor som måste uppfyllas>

1. 
2. 

## Nästa steg

<Vad som händer nu>

- **Om godkänd:** Steg X fortsätter
- **Om återremitterad:** <Vem fixar vad>
- **Om avslagen:** Artefakt arkiveras

## Kommentarer

<Eventuella ytterligare kommentarer till team>
```

---

**Riktlinjer för olika grindar:**

### G1 (Specgodkännande)
- **Input:** Granskningsrapport från A1
- **Beslutsfattare:** Produktägare eller systemarkitekt
- **Beslut:** Godkänn / Återremittera / Avslå
- **Nästa steg:** Om godkänd → Steg 2 (Nedbrytning)

### G2 (Storygodkännande)
- **Input:** Stories från A2 + granskningsrapport från A3
- **Beslutsfattare:** Produktägare
- **Beslut:** Godkänn / Återremittera
- **Kontrollpunkter:** Stories är INVEST, AC är testbara
- **Nästa steg:** Om godkänd → Steg 3 (Kodning)

### G3 (Utfallsgodkännande)
- **Input:** Utfallsrapport från A10
- **Beslutsfattare:** Teknisk ledare eller QA-ansvarig
- **Beslut:** Till QA / Återremittera / Avslå
- **Kontrollpunkter:** Tester gröna, inga kritiska risker
- **Nästa steg:** Om till QA → Steg 9

### G4 (Produktionsgodkännande)
- **Input:** QA-rapport + verksamhetsverifiering
- **Beslutsfattare:** Produktägare + verksamhetsrepresentant (båda krävs)
- **Beslut:** Godkänn för prod / Återremittera
- **Kontrollpunkter:** QA-tester gröna, verksamheten nöjd
- **Nästa steg:** Om godkänd → Steg 10 (Prod-deploy)
- **Signaturer:** Två signaturer krävs (produktägare + verksamhet)
