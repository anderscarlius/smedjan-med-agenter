# DESIGN.md — Smedjan-portal-demo

Läsvy över repot. Skriver ingenting, anropar ingenting, innehåller ingen skarp data.

## Leverabler

| Fil | Innehåll |
|---|---|
| `index.html` | Skal: tokens-länk, app-boot |
| `app.js` | Hash-routing, alla vyer |
| `mockdata.js` | Exempeldata (`window.SMEDJAN`) |
| `styles.css` | Tokens och komponentstilar |
| `assets/flode-process.png` | Processbild (1532×768) för klickbar flödeskarta |
| `assets/flode-debug.png` | Debug-overlay för hotspot-mätning |

## Flödeskarta (översikt)

Översikten (`#/oversikt`) visar processbilden som klickbar bildkarta:

- SVG-overlay (`viewBox="0 0 1532 768"`) med transparenta länkar över steg 0–11 och G1–G4.
- Statusrad + legend behålls; «Du är här»-badge placeras absolut över aktuell grind/steg via `beraknaFlodeLage`.
- HTML-kedjeraderna är borttagna (bilden ersätter dem).
- Under bilden: loop-chips (L1/L2/L3/sluten cirkel), fas-chips (Forma/Bygga/Leverera/Driva) och story-kö för steg 2 (`EWS-001.1` … `EWS-001.6`).
- Steg 10/11: delade zoner i bottenraden (11 vänster, 10 till höger om 11, vänster om G4). Steg 12 saknar egen ruta i bilden och nås via fas-chip Driva / återföringschip.

Länkexempel: `#/korning/ews-2026-09-03T14-12-08Z?steg=2`, `#/grind/G2`, `#/stories?story=EWS-001.1`.

Formspråk: inga emoji, skuggor eller gradienter. Hover på zoner: 1–2 px teal/sand stroke.
