# Förslagsspec: Patientöversikt

## Beskrivning

Vi vill skapa en patientöversikt som aggregerar data från flera källor (Cosmic, Pascal, journalsystem) och presenterar en enhetlig vy av patientens aktuella status, mediciner, diagnoser och planerade åtgärder.

## Användarnytta

Vårdpersonal får snabb tillgång till relevant patientinformation från olika system på en plats, vilket minskar risk för felbehandling och ökar effektiviteten.

## Funktionella krav

1. Hämta patientdata från Cosmic (mediciner), Pascal (lab-värden), och journalsystem (diagnoser, vårdkontakter)
2. Aggregera och presentera data i enhetlig vy
3. Visa senaste lab-värden med avvikelser markerade
4. Visa aktiv medicinlista med dosering
5. Visa aktiva diagnoser med ICD-10-koder
6. Exponera API för patientöversikt (JSON)

## Tekniska begränsningar

- Integration via REST API mot alla tre system
- Data ska cachas max 5 minuter
- Autentisering via VGR SITHS
- Response-tid max 2 sekunder

## Dataklass

Klass 0 för etapp 0 (syntetisk testdata). Framtida klass 2 i produktion (riktig patientdata).

## Sekretessbedömning

Innehåller patientdata i prod → klass 2. Nu: syntetisk → klass 0.
