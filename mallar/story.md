# Mall: User Story

**Syfte:** A2 (Nedbrytare) använder denna mall för att skapa user stories från specs.

**Format:** YAML med markdown

---

```yaml
---
artifact_type: story
artifact_id: <UUID (generera med uuid4)>
story_id: <FUNC-ID>.<number>  # t.ex. EWS-001.1
created_by: A2
created_at: <ISO 8601 timestamp>
input_refs: ["<spec-artifact-id>"]
data_class: 0/1/2
schema_version: "1.0"
---

# Story <story_id>: <Titel i "Som X vill jag Y så att Z"-format>

**Som** <roll (t.ex. "sjuksköterska", "systemintegratör")>  
**vill jag** <funktion (t.ex. "hämta patientens senaste EWS-score")>  
**så att** <nytta (t.ex. "jag kan prioritera mina åtgärder")>

## Acceptanskriterier

- **Given** <förutsättning (t.ex. "patienten har vitals uppmätta för <5 minuter sedan")>
- **When** <åtgärd (t.ex. "systemet hämtar EWS")>
- **Then** <förväntat resultat (t.ex. "ska EWS-score beräknas korrekt enligt NEWS2")>
- **And** <ytterligare förväntat resultat> (valfritt, kan ha flera)

## Metadata

**Dataklass:** 0/1/2  
**Beroenden:** <lista story-id:n som denna beror på, eller "Ingen">  
**Uppskattning:** S (timmar) / M (1 dag) / L (2–3 dagar)  
**Status:** todo
```

---

**Riktlinjer:**

- **Som X vill jag Y så att Z** är obligatoriskt format
- **Acceptanskriterier** ska vara testbara (Given/When/Then)
- **Beroenden** ska vara explicita (lista story-id:n)
- **Uppskattning:**
  - S (Small): Timmar, enkel implementation
  - M (Medium): 1 dag, moderat komplexitet
  - L (Large): 2–3 dagar, komplex (undvik, bryt ner mer)
- **Dataklass** ärver från spec
