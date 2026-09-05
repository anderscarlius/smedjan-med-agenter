---
artifact_type: story
artifact_id: 775e8400-e29b-41d4-a716-446655440005
story_id: PO-001.5
created_by: A2
created_at: 2026-09-08T12:00:00Z
input_refs: ["550e8400-e29b-41d4-a716-446655440000"]
data_class: 0
schema_version: "1.0"
---

# Story PO-001.5: Autentisering OAuth2 mot Philips

**Som** system  
**vill jag** autentisera mot Philips API med OAuth2  
**så att** jag kan hämta vitals säkert

## Acceptanskriterier

- **Given** Philips OAuth2-credentials är konfigurerade
- **When** systemet startar
- **Then** ska det hämta access token från Philips
- **And** ska uppdatera token innan det går ut
- **And** ska hantera token-refresh om token går ut

## Metadata

**Dataklass:** 0  
**Beroenden:** Ingen  
**Uppskattning:** M (1 dag: OAuth2-flow + token management)  
**Status:** todo
