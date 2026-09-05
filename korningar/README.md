# Körningar - PoC-laster i Smedjan

Denna katalog innehåller PoC-laster som körs genom Smedjans process (steg 0–2 i etapp 0, hela flödet i etapp 3).

---

## Tillgängliga laster

### 1. EWS (Early Warning Score från Philips)

**Katalog:** `korningar/ews/`  
**Funktion-ID:** EWS-001  
**Status:** Första last, fullständig struktur

**Beskrivning:** Hämtar vital-parametrar från Philips-övervakningssystem, beräknar EWS-score enligt NEWS2, lagrar i VGR Datahubb.

**Kör demo:**
```bash
python -m orkestrering demo ews
```

**Se:** [korningar/ews/README.md](ews/README.md)

---

### 2. Patientöversikt

**Katalog:** `korningar/patientoversikt/`  
**Funktion-ID:** PATÖVS-001  
**Status:** Andra last, redo för demo

**Beskrivning:** Aggregerar patientdata från flera källor (Cosmic, Pascal, journalsystem) och presenterar enhetlig vy.

**Kör demo:**
```bash
python -m orkestrering demo patientoversikt
```

**Se:** [korningar/patientoversikt/README.md](patientoversikt/README.md)

---

### 3. Axel FHIR-integration

**Katalog:** `korningar/axel-fhir/`  
**Funktion-ID:** AXEL-001  
**Status:** Tredje last, redo för demo

**Beskrivning:** Integrerar med Axel (nationell infrastruktur) för att hämta patientsammanfattningar i FHIR-format mellan vårdgivare.

**Kör demo:**
```bash
python -m orkestrering demo axel-fhir
```

**Se:** [korningar/axel-fhir/README.md](axel-fhir/README.md)

---

## Struktur per last

Varje last har samma grundstruktur:

```
korningar/<projekt>/
├── forslagsspec.md          # Förslagsspec från produktägare
├── README.md                # Översikt och instruktioner
├── steg0/                   # Output från A0 (Intag)
│   ├── spec-v1.md
│   ├── spec-v1.meta.json
│   └── input.md
├── steg1/                   # Output från A1 (Specgranskning)
│   ├── review-v1.md
│   ├── review-v1.meta.json
│   └── input.md
├── G1/                      # Grindbeslut G1
│   ├── beslut.md
│   └── beslut.meta.json
├── steg2/                   # Output från A2 (Nedbrytning)
│   ├── stories-v1.yaml
│   ├── story-<ID>.1.md
│   ├── story-<ID>.2.md
│   └── ...
└── testdata.json           # Syntetiska testdata (klass 0)
```

---

## Byta aktiv portal-demo

Portal-demon (`portal/demo/`) kan visa olika laster. För att byta aktiv last:

### Alternativ 1: Regenerera korning.json med CLI-flagga (ej implementerat ännu)

```bash
python -m orkestrering demo <projekt> --portal-output
```

Detta skulle generera `portal/demo/data/korning-<projekt>.json`.

### Alternativ 2: Manuell kopiering (nuvarande)

Efter att ha kört demo för en last:

```bash
# Kopiera artefakter till portal
cp korningar/<projekt>/steg0/spec-v1.md portal/demo/data/
cp korningar/<projekt>/steg2/stories-v1.yaml portal/demo/data/
```

**Obs:** Portal-integration är inte färdig i etapp 0. Denna sektion uppdateras när portalen stödjer multi-projekt-väljare.

---

## Dataklass

Alla laster är **klass 0** (syntetisk data) i etapp 0. Ingen riktig patientdata används.

---

## Körning

**Kör demo för specifik last:**
```bash
python -m orkestrering demo <projekt>
```

**Tillgängliga projekt:**
- `ews`
- `patientoversikt`
- `axel-fhir`

**Exempel:**
```bash
# Kör EWS-demo
python -m orkestrering demo ews

# Kör Patientöversikt-demo
python -m orkestrering demo patientoversikt

# Kör Axel FHIR-demo
python -m orkestrering demo axel-fhir
```

---

## Se även

- [docs/process.md](../docs/process.md) - Processspecifikation
- [backlog/I-forsta-last-ews.md](../backlog/I-forsta-last-ews.md) - Epic för EWS
- [backlog/I-poc-laster.md](../backlog/I-poc-laster.md) - Epic för Patientöversikt och Axel FHIR
