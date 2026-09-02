# Portal Sitemap

**Version:** 0.1  
**Datum:** 2026-09-02

Smedjans processportal har tio vyer. Portalen är en vy på Git – ingen separat databas (princip P1).

---

## Sitemap

```
/portal
├── /                         → Översikt (vy 1)
├── /inbox                    → Min inkorg (vy 2)
├── /modules/{module-id}      → Modulvy (vy 3)
├── /catalog/functions        → Funktionskatalog (vy 4)
├── /catalog/tests            → Testkatalog (vy 5)
├── /gates                    → Grindvy (vy 6)
│   ├── /G1
│   ├── /G2
│   ├── /G3
│   └── /G4
├── /verification/{spec-id}   → Verifieringsvy (vy 7)
├── /operations               → Driftvy (vy 8)
├── /agents                   → Agentlogg (vy 9)
└── /docs                     → Dokumentation (vy 10)
```

---

## Rollbaserad access

| Vy | Roller | Beskrivning |
|----|--------|-------------|
| Översikt | Alla | Dashboard |
| Min inkorg | Alla | Personliga åtgärder |
| Modulvy | Utvecklare, produktägare | Status per modul |
| Funktionskatalog | Alla | Alla funktioner |
| Testkatalog | QA, utvecklare | Alla tester |
| Grindvy | Alla (read), beslutsfattare (write) | Grindhistorik |
| Verifieringsvy | Auditör, produktägare | Spårbarhet |
| Driftvy | Drift, produktägare | Prod-status |
| Agentlogg | Processägare, auditör | Agent-körningar |
| Dokumentation | Alla | Användar/drift-docs |

---

## Navigation (huvudmeny)

```
┌─────────────────────────────────┐
│ Smedjan                         │
├─────────────────────────────────┤
│ 📊 Översikt                     │
│ 📥 Min inkorg (2)               │  ← Badge med antal väntande åtgärder
│ 📦 Moduler                      │
│ 📚 Kataloger                    │
│   ├── Funktioner               │
│   └── Tester                   │
│ 🚪 Grindar                      │
│ ✅ Verifiering                  │
│ 🔧 Drift                        │
│ 🤖 Agenter                      │
│ 📖 Dokumentation                │
└─────────────────────────────────┘
```

---

## URL-struktur

- Base: `/portal`
- Dynamiska segment: `{module-id}`, `{spec-id}`, `{agent-id}`, `{gate}`
- Query params: `?status=todo`, `?data_class=0`, `?date_from=2026-09-01`

---

## Datakällor

Alla vyer läser från Git (via GitHub API eller lokal clone):

- **specs/**: Strukturerade specs
- **stories/**: User stories
- **reviews/**: Granskningsrapporter
- **tests/**: Testrapporter
- **decisions/**: Grindbeslut
- **deploys/**: Deploy-rapporter
- **incidents/**: Incidentrapporter
- **improvements/**: Teknisk skuld-rapporter

**Metadata:** Proveniens-fält i YAML frontmatter

---

## Implementation (etapp 2)

- **Frontend:** React/Vue/Svelte (TBD)
- **Backend:** API-server som läser Git
- **Auth:** VGR SSO (SAML)
- **Deployment:** Statisk site + API-server

Se `portal/views/*.md` för detaljerade vykontrakt.
