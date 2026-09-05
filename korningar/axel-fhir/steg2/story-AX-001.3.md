---
artifact_type: story
artifact_id: 773e8400-e29b-41d4-a716-446655440003
story_id: AX-001.3
created_by: A2
created_at: 2026-09-08T12:00:00Z
input_refs: ["550e8400-e29b-41d4-a716-446655440000"]
data_class: 0
schema_version: "1.0"
---

# Story AX-001.3: Exponera API för att hämta senaste EWS

**Som** sjuksköterska (via patientöversikt-app)  
**vill jag** hämta patientens senaste EWS-score  
**så att** jag kan prioritera mina åtgärder

## Acceptanskriterier

- **Given** EWS-score finns lagrat för patient
- **When** jag anropar `GET /datahubb/ews/{patientId}/latest`
- **Then** ska API returnera FHIR Observation-resource med:
  - `code`: NEWS2-score
  - `valueInteger`: score (0–20)
  - `effectiveDateTime`: timestamp för när score beräknades
  - `subject`: patient-referens
- **And** response-tid ska vara <2 sekunder
- **And** om patient ej finns ska API returnera HTTP 404

## Metadata

**Dataklass:** 0  
**Beroenden:** AX-001.2 (behöver beräknat score), AX-001.4 (behöver lagring)  
**Uppskattning:** S (timmar: enkel REST-endpoint)  
**Status:** todo
