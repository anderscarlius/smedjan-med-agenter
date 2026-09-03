# Vy 1: Översikt

**Syfte:** Sammanfattning av aktiva funktioner, grindstatus, senaste builds.

**Roller:** Alla (filtrerat per roll)

---

## Data

- Specs (från `specs/`) med status
- Grindstatus (från `decisions/`)
- CI-status (från GitHub Actions eller Temporal)
- Senaste events (commits, PR:er, deploys)

---

## Layout

Dashboard med widgets:

### Widget 1: Aktiva funktioner
| Funktion-ID | Titel | Steg | Status | Ansvarig |
|-------------|-------|------|--------|----------|
| EWS-001 | Early Warning Score | 3 (Kodning) | In progress | Anders C. |
| ...

### Widget 2: Väntande grindar
| Grind | Funktion | Väntar sedan | Beslutsfattare |
|-------|----------|--------------|----------------|
| G1 | EWS-001 | 2026-09-02 | Anders C. |

### Widget 3: Senaste events
- **2026-09-02 15:00:** A0 producerade spec för EWS-001
- **2026-09-02 14:30:** PR #123 merged (EWS-001.1)

---

## Interaktion

- Klicka på funktion-ID → Modulvy
- Klicka på grind → Grindvy
- Filter: Status, dataklass, ansvarig

---

**Implementation:** Etapp 2
