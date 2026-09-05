---
artifact_type: story
artifact_id: 771e8400-e29b-41d4-a716-446655440001
story_id: AX-001.1
created_by: A2
created_at: 2026-09-08T12:00:00Z
input_refs: ["550e8400-e29b-41d4-a716-446655440000"]
data_class: 0
schema_version: "1.0"
---

# Story AX-001.1: Hämta vitals från Philips-system

**Som** systemintegratör  
**vill jag** hämta vitals från Philips IntelliVue API  
**så att** EWS kan beräknas

## Acceptanskriterier

- **Given** Philips-systemet är tillgängligt och autentisering fungerar
- **When** systemet anropar Philips API med patient-ID
- **Then** ska vitals returneras (puls, blodtryck, saturation, temperatur, medvetandegrad)
- **And** response-tid ska vara <3 sekunder
- **And** om Philips är nere ska systemet returnera HTTP 503 med retry-after header

## Metadata

**Dataklass:** 0 (syntetiska patient-ID)  
**Beroenden:** Ingen  
**Uppskattning:** M (1 dag: OAuth2-integration + API-anrop + error handling)  
**Status:** todo
