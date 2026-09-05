# PoC-last: Axel FHIR-integration

**Funktion-ID:** AXEL-001  
**Dataklass:** 0 (syntetisk för etapp 0)  
**Status:** Ej påbörjad

---

## Syfte

Tredje PoC-last som körs genom Smedjans process. Integrerar med Axel (nationell infrastruktur) för att hämta patientsammanfattningar i FHIR-format mellan vårdgivare.

---

## Struktur

```
korningar/axel-fhir/
├── forslagsspec.md          # Förslagsspec från produktägare
├── steg0/
│   ├── spec-v1.md           # Output från A0
│   ├── spec-v1.meta.json    # Metadata
│   └── input.md             # Input till A0 (samma som forslagsspec.md)
├── steg1/
│   ├── review-v1.md         # Output från A1
│   ├── review-v1.meta.json  # Metadata
│   └── input.md             # Input till A1 (spec från steg0)
├── G1/
│   └── beslut.md            # Grindbeslut G1 (manuellt)
├── steg2/
│   ├── stories-v1.yaml      # Output från A2 (alla stories)
│   ├── story-AXEL-001.1.md   # Story 1
│   ├── story-AXEL-001.2.md   # Story 2
│   └── ...
└── testdata.json            # Syntetiska FHIR-resurser för testning
```

---

## Förslagsspec (sammanfattning)

Se `korningar/axel-fhir/forslagsspec.md` för fullständig spec.

**Titel:** Axel FHIR-integration (hämta patientsammanfattningar)

**Funktionella krav:**
1. Autentisera mot Axel (SITHS + OAuth2)
2. Söka patient via personnummer
3. Hämta Patient Summary (IPS) i FHIR-format
4. Validera FHIR mot svensk profil
5. PDL-loggning av alla åtkomster
6. Exponera API för patientsammanfattning

**Dataklass:** 0 (syntetisk)

---

## Körning (etapp 0)

**Kommando:**

```bash
python -m orkestrering demo axel-fhir
```

Detta kör:

1. Steg 0: Intag (A0) - strukturera förslagsspec
2. Steg 1: Specgranskning (A1) - granska spec
3. G1: Grindbeslut (mock) - godkänn automatiskt
4. Steg 2: Nedbrytning (A2) - skapa user stories

**Resultat:** Axel FHIR steg 0–2 completerade, redo för steg 3 i etapp 1.

---

**TODO:**
- [ ] Kör steg 0 (A0)
- [ ] Kör steg 1 (A1)
- [ ] Fatta G1-beslut
- [ ] Kör steg 2 (A2)
- [ ] Dokumentera output i Git
