# PoC-last: Patientöversikt

**Funktion-ID:** PATÖVS-001  
**Dataklass:** 0 (syntetisk för etapp 0)  
**Status:** Ej påbörjad

---

## Syfte

Andra PoC-last som körs genom Smedjans process. Aggregerar patientdata från flera källor (Cosmic, Pascal, journalsystem) i en enhetlig vy.

---

## Struktur

```
korningar/patientoversikt/
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
│   ├── story-PATÖVS-001.1.md   # Story 1
│   ├── story-PATÖVS-001.2.md   # Story 2
│   └── ...
└── testdata.json            # Syntetiska patientdata för testning
```

---

## Förslagsspec (sammanfattning)

Se `korningar/patientoversikt/forslagsspec.md` för fullständig spec.

**Titel:** Patientöversikt (aggregerad data från Cosmic, Pascal, journalsystem)

**Funktionella krav:**
1. Hämta patientdata från tre källor (Cosmic, Pascal, journalsystem)
2. Aggregera och presentera data i enhetlig vy
3. Visa lab-värden med avvikelser
4. Visa aktiv medicinlista
5. Visa aktiva diagnoser (ICD-10)
6. Exponera API för patientöversikt

**Dataklass:** 0 (syntetisk)

---

## Körning (etapp 0)

**Kommando:**

```bash
python -m orkestrering demo patientoversikt
```

Detta kör:

1. Steg 0: Intag (A0) - strukturera förslagsspec
2. Steg 1: Specgranskning (A1) - granska spec
3. G1: Grindbeslut (mock) - godkänn automatiskt
4. Steg 2: Nedbrytning (A2) - skapa user stories

**Resultat:** Patientöversikt steg 0–2 completerade, redo för steg 3 i etapp 1.

---

**TODO:**
- [ ] Kör steg 0 (A0)
- [ ] Kör steg 1 (A1)
- [ ] Fatta G1-beslut
- [ ] Kör steg 2 (A2)
- [ ] Dokumentera output i Git
