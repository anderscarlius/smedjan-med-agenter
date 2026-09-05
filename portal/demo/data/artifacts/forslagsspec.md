# Förslagsspec: Early Warning Score (EWS) från Philips

## Beskrivning

Vi vill hämta vital-parametrar från Philips-övervakningssystem och beräkna Early Warning Score (EWS) enligt NEWS2-standard. EWS-värdet ska sedan lagras i VGR Datahubb för användning i patientöversikter.

## Användarnytta

Sjukvårdspersonal kan snabbt identifiera patienter som försämras genom att se EWS-score i realtid.

## Funktionella krav

1. Hämta vitals från Philips-system via API (puls, blodtryck, saturation, temperatur, medvetandegrad)
2. Beräkna EWS-score enligt National Early Warning Score 2 (NEWS2)
3. Lagra EWS-värde med timestamp i VGR Datahubb
4. Exponera API för att hämta senaste EWS per patient

## Tekniska begränsningar

- Philips-API använder REST + OAuth2
- Data ska lagras i FHIR-format (Observation-resource)
- Max 5 sekunders latens från Philips till Datahubb

## Dataklass

Klass 0 för etapp 0 (syntetisk testdata). Framtida klass 2 i produktion (riktig patientdata).

## Sekretessbedömning

Innehåller patientdata i prod → klass 2. Nu: syntetisk → klass 0.
