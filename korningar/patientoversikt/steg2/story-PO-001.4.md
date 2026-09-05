---
artifact_type: story
artifact_id: 774e8400-e29b-41d4-a716-446655440004
story_id: PO-001.4
created_by: A2
created_at: 2026-09-08T12:00:00Z
input_refs: ["550e8400-e29b-41d4-a716-446655440000"]
data_class: 0
schema_version: "1.0"
---

# Story PO-001.4: Lagra EWS i Datahubb

**Som** system  
**vill jag** lagra beräknade EWS-värden i VGR Datahubb  
**så att** de kan hämtas senare

## Acceptanskriterier

- **Given** ett EWS-värde är beräknat
- **When** systemet sparar värdet
- **Then** ska det lagras som FHIR Observation-resource
- **And** ska innehålla: patient-ID, score, timestamp
- **And** lagring ska ta <500ms

## Metadata

**Dataklass:** 0  
**Beroenden:** PO-001.2  
**Uppskattning:** M (1 dag: FHIR-struktur + Datahubb-integration)  
**Status:** todo
