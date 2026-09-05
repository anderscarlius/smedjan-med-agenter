---
artifact_type: story
artifact_id: 772e8400-e29b-41d4-a716-446655440002
story_id: AX-001.2
created_by: A2
created_at: 2026-09-08T12:00:00Z
input_refs: ["550e8400-e29b-41d4-a716-446655440000"]
data_class: 0
schema_version: "1.0"
---

# Story AX-001.2: Beräkna EWS-score enligt NEWS2

**Som** system  
**vill jag** beräkna EWS-score från vitals  
**så att** sjukvårdspersonal kan bedöma patientstatus

## Acceptanskriterier

- **Given** vitals är hämtade (puls, blodtryck, saturation, temperatur, medvetandegrad)
- **When** systemet beräknar EWS-score
- **Then** ska score beräknas enligt NEWS2-algoritm:
  - Puls: 0p (51–90), 1p (91–110 eller 41–50), 2p (111–130), 3p (≥131 eller ≤40)
  - Saturation: 0p (≥96), 1p (94–95), 2p (92–93), 3p (≤91)
  - Temperatur: 0p (36.1–38.0), 1p (35.1–36.0 eller 38.1–39.0), 2p (≥39.1), 3p (≤35.0)
  - Systoliskt BP: 0p (111–219), 1p (101–110), 2p (91–100), 3p (≤90 eller ≥220)
  - Medvetandegrad: 0p (Alert), 3p (något annat)
- **And** total score ska vara summa av alla delscore (0–20)
- **And** beräkning ska ta <100ms

## Metadata

**Dataklass:** 0  
**Beroenden:** AX-001.1 (behöver vitals)  
**Uppskattning:** S (timmar: algoritm är väldefinierad, bara implementera)  
**Status:** todo
