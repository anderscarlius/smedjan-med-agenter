# Första last: EWS (Early Warning Score)

**Funktion-ID:** EWS-001  
**Dataklass:** 0 (syntetisk för etapp 0)  
**Status:** Ej påbörjad (startar tisdag 8 sep 2026)

---

## Syfte

Första konkreta funktionalitet som körs genom Smedjans process (steg 0–2 manuellt i etapp 0, hela flödet i etapp 3).

---

## Struktur

```
korningar/ews/
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
│   ├── story-EWS-001-1.md   # Story 1
│   ├── story-EWS-001-2.md   # Story 2
│   └── ...
└── testdata.json            # Syntetiska vitals för testning
```

---

## Förslagsspec (placeholder)

Se `korningar/ews/forslagsspec.md` för fullständig spec. Sammanfattning:

**Titel:** Early Warning Score (EWS) från Philips

**Funktionella krav:**
1. Hämta vitals från Philips-system (puls, blodtryck, saturation, temperatur, medvetandegrad)
2. Beräkna EWS-score enligt NEWS2
3. Lagra i VGR Datahubb (FHIR-format)
4. Exponera API för att hämta senaste EWS

**Dataklass:** 0 (syntetisk)

---

## Testdata (syntetisk)

Se `korningar/ews/testdata.json` för fullständig dataset. Exempel:

```json
{
  "patients": [
    {
      "id": "SYNTH-001",
      "name": "Testpatient Ett",
      "vitals": {
        "heartRate": 75,
        "systolicBP": 120,
        "oxygenSat": 98,
        "temperature": 36.8,
        "consciousness": "Alert"
      },
      "ews_score": 0,
      "timestamp": "2026-09-08T10:00:00Z"
    }
  ]
}
```

---

## Körning (etapp 0)

**Tisdag 8 september:**

1. Produktägare skriver förslagsspec (klar)
2. Kör A0 manuellt (Claude-chatt):
   - Input: förslagsspec.md
   - Output: spec-v1.md (strukturerad spec)
3. Kör A1 manuellt (GPT-4-chatt):
   - Input: spec-v1.md
   - Output: review-v1.md (granskningsrapport)
4. Människa fattar G1-beslut (godkänn)
5. Kör A2 manuellt (Mistral-chatt):
   - Input: spec-v1.md (godkänd)
   - Output: stories-v1.yaml (5–10 user stories)

**Resultat:** EWS steg 0–2 completerade, redo för steg 3 i etapp 1.

---

**TODO:**
- [ ] Skapa förslagsspec.md (tisdag 8 sep)
- [ ] Kör steg 0 (A0)
- [ ] Kör steg 1 (A1)
- [ ] Fatta G1-beslut
- [ ] Kör steg 2 (A2)
- [ ] Dokumentera output i Git
