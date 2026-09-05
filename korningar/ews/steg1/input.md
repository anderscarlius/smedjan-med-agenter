---
artifact_type: spec
artifact_id: 550e8400-e29b-41d4-a716-446655440000
created_by: A0
created_at: 2026-09-08T10:00:00Z
data_class: 0
schema_version: "1.0"
---

# EWS-001: Early Warning Score (EWS) från Philips

**Version:** 1.0  
**Dataklass:** 0 (syntetisk, etapp 0)  
**Författare:** Produktägare  
**Datum:** 2026-09-08

## Funktionell beskrivning

Funktionen hämtar vital-parametrar (puls, blodtryck, syresaturation, temperatur, medvetandegrad) från Philips-övervakningssystem, beräknar Early Warning Score (EWS) enligt National Early Warning Score 2 (NEWS2)-standard, och lagrar resultatet i VGR Datahubb. EWS-värdet används för att identifiera patienter i riskzonen för försämring.

## Användare och roller

- **Sjukvårdspersonal:** Konsumerar EWS-data via patientöversikter
- **Systemintegratör:** Konfigurerar Philips-integration
- **Driftpersonal:** Övervakar datakvalitet och latens

## Dataflöden

### Input
- Vitals från Philips-system (REST API):
  - Puls (slag/min)
  - Systoliskt blodtryck (mmHg)
  - Syresaturation (%)
  - Temperatur (°C)
  - Medvetandegrad (ACVPU-skala: Alert, Confusion, Voice, Pain, Unresponsive)
- Patient-ID (pseudonymiserad i test, riktig i prod)

### Process
1. Autentisera mot Philips API (OAuth2)
2. Hämta senaste vitals per patient (polling var 30 sek eller push om tillgängligt)
3. Beräkna EWS-score enligt NEWS2:
   - Varje vital får poäng 0–3 baserat på avvikelse från normalvärde
   - Total score = summa av alla poäng
4. Validera score (0–20, högre = värre)

### Output
- EWS-värde (0–20) med timestamp lagrat i VGR Datahubb
- FHIR Observation-resource:
  - `code`: NEWS2-score
  - `value`: integer (0–20)
  - `effectiveDateTime`: timestamp
  - `subject`: patient-referens

## Gränssnitt

### API (Philips → VGR Datahubb)
**Endpoint:** `GET /philips/vitals/{patientId}`  
**Auth:** OAuth2 Bearer token  
**Response:** JSON med vitals

**Exempel:**
```json
{
  "patientId": "SYNTH-001",
  "timestamp": "2026-09-08T10:25:00Z",
  "vitals": {
    "heartRate": 95,
    "systolicBP": 110,
    "oxygenSat": 96,
    "temperature": 37.2,
    "consciousness": "Alert"
  }
}
```

### API (VGR Datahubb → Konsumenter)
**Endpoint:** `GET /datahubb/ews/{patientId}/latest`  
**Auth:** VGR SSO  
**Response:** FHIR Observation med EWS-score

### Integrationer
- **Philips IntelliVue:** Källa för vitals
- **VGR Datahubb:** Lagring av EWS
- **Patientöversikt (framtida):** Konsument av EWS

## Icke-funktionella krav

### Prestanda
- Max 5 sekunder från Philips-uppdatering till EWS lagrat i Datahubb
- Hanterar minst 100 patienter samtidigt (för etapp 0: 10 syntetiska)

### Säkerhet
- OAuth2 för Philips-autentisering
- HTTPS (TLS 1.3) för all kommunikation
- Dataklass-separation: Syntetisk data (klass 0) i dev, riktig data (klass 2) endast i prod
- Audit-logg för all klass 2-access (i prod)

### Skalbarhet
- Arkitektur ska stödja 1000+ patienter i framtiden
- Mikrotjänst-baserad för att skala oberoende

## Beroenden och risker

### Beroenden
- Philips IntelliVue API (extern, VGR har avtal)
- VGR Datahubb (intern, under utveckling parallellt)
- FHIR-bibliotek (använd HAPI FHIR, open source)

### Risker
1. **Philips API-tillgänglighet:** Om Philips-systemet är nere, ingen EWS. *Mitigering:* Caching av senaste värde, varning om data är äldre än 5 min.
2. **EWS-beräkning fel:** Om algoritm är felimplementerad, felaktiga scores. *Mitigering:* Unit-tester mot känd dataset, validering mot Philips egen EWS om tillgänglig.
3. **Latens:** Om Datahubb är långsam, EWS blir försenat. *Mitigering:* Prestandatester, SLA på <5 sekunder.

## Dataklass-motivering

**Etapp 0 (nu):** Klass 0 (syntetisk data). Använder fake patient-ID:n (t.ex. SYNTH-001) och simulerade vitals. Ingen riktig patientdata, inget sekretess-krav.

**Framtida produktion:** Klass 2 (känsligt). Innehåller riktiga patient-ID:n och vitals som kan kopplas till individer. Kräver VGR-miljö, audit-logg, och MDR-dokumentation om det klassas som medicinteknisk produkt.

**Motivering för klass 0 nu:** Processen utvecklas och testas. Syntetisk data räcker för att validera integration, beräkning och prestanda.
