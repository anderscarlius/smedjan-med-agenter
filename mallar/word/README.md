# Word-mallar (Smedjan)

Tomma `.docx`-mallar för processens artefakter, plus ett ifyllt intags-exempel under `exempel/intag/`.

Rubrikstilarna är **Rubrik 1–3** så filerna går snabbt till HTML eller Markdown.

| Fil | Används till |
|---|---|
| `01_forslagsspec.docx` | Intag — produktägare före steg 0 |
| `02_spec.docx` | Strukturerad spec (efter A0 / manuell redigering) |
| `03_granskningsrapport.docx` | A1/A3/A5 eller manuell granskning |
| `04_grindbeslut.docx` | G1–G4 — **människan** |
| `05_user_story.docx` | En story (steg 2) |
| `06_systemtestrapport.docx` | Systemtest |
| `07_utfallsrapport.docx` | Utfall inför G3 |

Exempel: `exempel/intag/EWS_forslagsspec_exempel.docx`

Markdown-mallarna i `mallar/*.md` är fortfarande källan för agenter i Git.

## Till HTML (snabbast)

```bash
# En fil
pandoc mallar/word/01_forslagsspec.docx -o /tmp/forslagsspec.html -t html5 --standalone

# Alla mallar
mkdir -p /tmp/smedjan-html
for f in mallar/word/*.docx; do
  pandoc "$f" -o "/tmp/smedjan-html/$(basename "${f%.docx}").html" -t html5 --standalone
done
```

Till Markdown (för commit under `korningar/`):

```bash
pandoc mallar/word/01_forslagsspec.docx -o korningar/ews/forslagsspec.md -t gfm
```

## Uppladdning till portalen (senare)

Portalen i etapp 0 är läsläge. När intag ska ske via UI:

1. Ladda upp `.docx` eller klistra HTML från pandoc.
2. Servern (eller ett litet skript) konverterar till Markdown/HTML och skriver under `korningar/<projekt>/`.
3. Behåll Word som författarformat; Git förblir sanningen i `.md`.

Tills dess: fyll Word → pandoc → committa `.md`.
