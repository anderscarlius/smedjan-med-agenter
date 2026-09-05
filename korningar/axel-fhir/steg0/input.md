# Förslagsspec: Axel FHIR-integration

## Beskrivning

Vi vill integrera med Axel (nationell infrastruktur för informationsutbyte) för att kunna hämta och skicka FHIR-resurser mellan vårdgivare. Första versionen fokuserar på att hämta patientsammanfattningar (Patient Summary).

## Användarnytta

Vårdgivare kan hämta journalinformation från andra vårdgivare via Axel när patienten ger samtycke, vilket ger bättre beslutsunderlag vid vård.

## Funktionella krav

1. Autentisera mot Axel med SITHS-kort (HSA-id)
2. Söka patient via personnummer
3. Hämta Patient Summary (IPS - International Patient Summary) i FHIR-format
4. Validera FHIR-resurser mot svensk profil
5. Logga alla åtkomster för spårbarhet
6. Exponera API för patientsammanfattning

## Tekniska begränsningar

- Axel använder FHIR R4 (svensk profil)
- Autentisering via SITHS + OAuth2
- PDL-loggning krävs för alla åtkomster
- Max 10 sekunders timeout mot Axel
- Kräver samtycke från patient (kontrolleras via API)

## Dataklass

Klass 0 för etapp 0 (syntetisk testdata, mockat Axel-API). Framtida klass 2 i produktion (riktig patientdata via Axel).

## Sekretessbedömning

Innehåller patientdata i prod → klass 2. Nu: syntetisk → klass 0.
