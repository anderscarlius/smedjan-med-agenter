# Orkestreringsspec v0.1 – Utkast

**Titel:** Orkestrering av Smedjans agentbaserade utvecklingsprocess  
**Version:** 0.1 (utkast)  
**Datum:** 2026-09-09  
**Författare:** Anders Carlius  
**För:** VGR Datahubb utvecklingsprocess

---

## Sammanfattning

Detta dokument specif icerar hur Smedjans 12 steg (0–11), 14 agenter (A0–A13), 4 grindar (G1–G4) och 3 loopar (L1–L3) orkestreras. Etapp 0 (nu): Manuell körning. Etapp 1: GitHub Actions. Etapp 2+: Temporal.

---

## 1. Översikt

### 1.1 Mål

Orkestrering ska:
- Automatisera processteg enligt `pipeline.yaml`
- Hantera loopar (L1–L3) med max-varv och eskalering
- Integrera grindar (G1–G4) med mänsklig beslutfattning
- Spåra proveniens för alla artefakter
- Logga tokens och kostnad per agent-anrop

### 1.2 Etapper

| Etapp | Automation | Verktyg | Tidplan |
|-------|-----------|---------|---------|
| 0 | Ingen (manuellt i LLM-chatt) | Inga | Vecka 36 (3–9 sep 2026) |
| 1 | Steg 0–3 + CI för steg 4–7 | GitHub Actions + OpenRouter | Vecka 37–38 |
| 2 | Full orkestrering med loopar | Temporal | Vecka 39–42 |
| 3+ | Produktion med QA/prod-deploy | Temporal + prod-miljö | Vecka 43+ |

---

## 2. Tillståndsmaskin

### 2.1 Steg och övergångar

```
    [0: Intag]
        ↓ (A0 → spec)
    [1: Specgranskning]
        ↓ (A1 → granskningsrapport)
    [G1: Beslut]
        ├─ Godkänd → [2]
        ├─ Återremitterad → [0] (L3-loop, max 3 varv)
        └─ Avslagen → [Arkiv]
    [2: Nedbrytning]
        ↓ (A2 → stories, A3 → granskning)
    [G2: Beslut]
        ├─ Godkänd → [3]
        └─ Återremitterad → [2]
    [3: Kodning]
        ↓ (A4 → kod, A5 → granskning, människa → PR-signatur)
        ↻ (L1-loop: A4 ↔ A5, max 3 varv)
        ↓ (PR merged)
    [4: Enhetstester]
        ↓ (A6 → tester, CI kör)
        ↓ (om fail → [3], L2-loop, max 3 varv)
    [5: Integrationstester]
        ↓ (A7 → integrationstester, CI kör)
        ↓ (om fail → [3], L2-loop)
    [6: Testdeploy]
        ↓ (A8 → deploy till test)
        ↓ (om fail → [3], L2-loop)
    [7: Test av testdeploy]
        ↓ (A9 → E2E-tester)
        ↓ (om fail → [3], L2-loop)
    [8: Utfall/triage]
        ↓ (A10 → utfallsrapport)
    [G3: Beslut]
        ├─ Till QA → [9]
        ├─ Återremitterad → [3]
        └─ Avslagen → [Arkiv]
    [9: QA+verksamhetsverifiering]
        ↓ (A7/A8/A9 i QA-miljö, verksamheten testar)
    [G4: Beslut]
        ├─ Godkänd för prod → [10]
        └─ Återremitterad → [9]
    [10: Prod-deploy]
        ↓ (A8 → deploy till prod)
    [11: Övervakning]
        (A11 + A12 + A13 kontinuerligt)
```

### 2.2 Tillstånds-representation

**Etapp 0 (manuell):** Ingen formell tillståndsmaskin. Användare håller koll på vilket steg som är näst.

**Etapp 1 (GitHub Actions):** State i Git (branches, tags, commits). Workflow-status i GitHub Actions.

**Etapp 2 (Temporal):** State i Temporal-workflow. Persistens automatisk.

---

## 3. Loopar (L1–L3)

### 3.1 L1: Kodloop (steg 3)

**Beskrivning:** A4 kodar → A5 granskar. Om problem → tillbaka till A4.

**Max-varv:** 3

**Eskalering:** Efter 3 varv → människa beslutar (override A5 eller be A4 börja om).

**Implementation:**
- Etapp 0: Manuell iteration (användare kopierar A5-feedback till A4)
- Etapp 1: GitHub Actions job kör A4 → A5 i loop
- Etapp 2: Temporal activity loop

**Tillstånd:**
```python
loop_L1_state = {
    "current_round": 1,
    "max_rounds": 3,
    "a4_output": "<kod>",
    "a5_feedback": "<granskningskommentarer>",
    "status": "in_progress" / "completed" / "escalated"
}
```

### 3.2 L2: Testloop (steg 3–7)

**Beskrivning:** Om tester (steg 4–7) felar → tillbaka till kodning (steg 3).

**Max-varv:** 3

**Eskalering:** Efter 3 varv → G3-blockering (A10 rapporterar "ej fixbart", människa beslutar).

**Implementation:**
- Etapp 1: CI-trigger på push → kör steg 4–7 → om fail, branch märks som "needs-fix"
- Etapp 2: Temporal-signal vid test-fail → trigger steg 3 igen

**Tillstånd:**
```python
loop_L2_state = {
    "current_round": 1,
    "max_rounds": 3,
    "failed_step": 4/5/6/7,
    "failure_reason": "<CI-logg>",
    "status": "in_progress" / "completed" / "escalated"
}
```

### 3.3 L3: Specloop (steg 0–1)

**Beskrivning:** Om A1 vill ha förtydligande → tillbaka till specförfattare (steg 0).

**Max-varv:** 3

**Eskalering:** Efter 3 varv → G1-avslag (spec är för oklar).

**Implementation:**
- Etapp 0: Manuell iteration
- Etapp 1: GitHub Actions → om A1 säger "återremittera" → notifiera specförfattare
- Etapp 2: Temporal human-task för specförfattare

**Tillstånd:**
```python
loop_L3_state = {
    "current_round": 1,
    "max_rounds": 3,
    "a1_feedback": "<förtydliganden behövs>",
    "status": "in_progress" / "completed" / "escalated"
}
```

---

## 4. Agent-anrop via OpenRouter

### 4.1 API-kontrakt

**Endpoint:** `POST /chat/completions` (OpenRouter)

**Request:**
```json
{
  "model": "anthropic/claude-3-opus",  // Beroende på pool
  "messages": [
    {
      "role": "system",
      "content": "<systemprompt från prompter/A0.md>"
    },
    {
      "role": "user",
      "content": "<input-data som JSON eller markdown>"
    }
  ],
  "temperature": 0.7,
  "max_tokens": 4000
}
```

**Response:**
```json
{
  "id": "chatcmpl-...",
  "model": "anthropic/claude-3-opus",
  "choices": [
    {
      "message": {
        "role": "assistant",
        "content": "<agent-output>"
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 1500,
    "completion_tokens": 2000,
    "total_tokens": 3500
  }
}
```

### 4.2 Pool-mapping

| Pool | Provider | Default Model | Fallback |
|------|----------|---------------|----------|
| A | Anthropic | claude-3-opus | claude-3-sonnet |
| B | OpenAI | gpt-4 | gpt-3.5-turbo |
| C | Mistral | mistral-large | mistral-medium |
| D | Local | gemma4-9b | (ingen, lokal) |

Pool D (Gemma4) körs lokalt via Ollama eller liknande, ej via OpenRouter.

### 4.3 Retry-logik

**Max försök:** 3  
**Backoff:** Exponential (2s, 4s, 8s)

**Retry-villkor:**
- HTTP 429 (rate limit) → retry
- HTTP 500/502/503 (server error) → retry
- Timeout → retry
- HTTP 400/401/403 → ej retry (konfigurationsfel)

### 4.4 Rate limiting

**Max requests/minut:** 60 (enligt OpenRouter free tier)

**Implementation:** Token bucket-algoritm eller enkel counter med 1-minuts-fönster.

### 4.5 Cost tracking

**Per agent-anrop:**
- Logga `prompt_tokens`, `completion_tokens`, `total_tokens`
- Beräkna kostnad baserat på OpenRouter pricing (t.ex. $0.03/1k tokens för GPT-4)
- Spara i metadata-fil + aggregerad rapport

**Exempel:**
```json
{
  "agent_id": "A0",
  "timestamp": "2026-09-02T14:30:00Z",
  "model": "anthropic/claude-3-opus",
  "tokens": {
    "prompt": 1500,
    "completion": 2000,
    "total": 3500
  },
  "cost_usd": 0.105
}
```

---

## 5. Grindar (G1–G4)

### 5.1 Grind-integration

**Etapp 0:** Manuell. Människa läser granskningsrapport, fattar beslut, sparar grindbeslut i Git.

**Etapp 1:** GitHub Actions pausar vid grind. Workflow kräver "manual approve" från beslutsfattare.

**Etapp 2:** Temporal human-task. Workflow pausar, skickar notis, väntar på beslut.

### 5.2 Besluts-format

Se `mallar/grindbeslut.md`. Varje grind har:
- Input (granskningsrapport eller utfallsrapport)
- Beslutsfattare (roll specificerad i `pipeline.yaml`)
- Beslut (godkänn/återremittera/avslå)
- Motivering
- Signatur (GPG-signerad commit)

### 5.3 Timeout

**Vad händer om beslutsfattare inte svarar?**

**Etapp 0–1:** Ingen timeout (manuellt, beslutsfattare ansvarar).

**Etapp 2:** Timeout efter 7 dagar → eskalering (notifiera chef/produktägare). Ej auto-beslut.

---

## 6. Proveniens och spårbarhet

### 6.1 Proveniens-schema

Varje artefakt har metadata (YAML frontmatter eller separat JSON-fil):

```yaml
artifact_type: spec / story / review / test_report / decision / etc.
artifact_id: <UUID>
created_by: <agent-id eller human-id>
created_at: <ISO 8601 timestamp>
input_refs: [<lista av artifact-id:n som input>]
git_commit: <commit SHA>
data_class: 0 / 1 / 2
pool: A / B / C / D (om agent)
schema_version: "1.0"
```

### 6.2 Spårbarhet

**Spec → Story → Kod → Test → Deploy:**

Genom att följa `input_refs` kan man spåra:
- Vilken spec motiverade vilken story?
- Vilken kod implementerade vilken story?
- Vilka tester täcker vilken kod?
- Vilken deploy deployade vilken kod?

**Portalen (vy 7: Verifieringsvy)** visualiserar denna kedja.

---

## 7. CI-är-facit (Princip P4)

### 7.1 Vad betyder "CI är facit"?

Automatiska tester avgör om kod är korrekt. Inga manuella "det fungerar på min maskin"-godkännanden.

**Bindande tester:**
- Unit-tester (steg 4) → coverage >80%
- Integrationstester (steg 5) → alla gröna
- E2E-tester (steg 7) → alla gröna

**Ej bindande:**
- Manuella tester utan AC
- Subjektiva bedömningar ("koden ser bra ut")

### 7.2 Vad händer om CI är fel?

**Om testet är fel (false positive/negative):**
1. Fixa testet (ej override:a resultatet)
2. Committa fix
3. CI kör igen

**Exempel:** Om unit-test förväntar fel beteende, ändra testet, inte produktionskoden.

---

## 8. OpenRouter-klient (implementation)

### 8.1 Etapp 0: Stub

Se `orkestrering/openrouter_client_stub.md`.

**Funktionalitet:**
- Returnerar mock-svar från `orkestrering/mocks/<agent-id>.json`
- Loggar alla anrop
- Inga riktiga API-anrop

### 8.2 Etapp 1: Riktig klient

**Funktionalitet:**
- Anropar OpenRouter API
- Retry + rate limiting
- Token + cost tracking
- Error handling

**Pseudo-kod:**
```python
class OpenRouterClient:
    def call_agent(self, agent_id, prompt, input_data, pool):
        model = self._get_model_for_pool(pool)
        
        # Rate limiting
        self._wait_for_rate_limit()
        
        # Retry loop
        for attempt in range(3):
            try:
                response = requests.post(
                    f"{self.base_url}/chat/completions",
                    headers={"Authorization": f"Bearer {self.api_key}"},
                    json={
                        "model": model,
                        "messages": [
                            {"role": "system", "content": prompt},
                            {"role": "user", "content": str(input_data)}
                        ]
                    },
                    timeout=60
                )
                response.raise_for_status()
                
                # Parse response
                data = response.json()
                output = data["choices"][0]["message"]["content"]
                tokens = data["usage"]
                cost = self._calculate_cost(model, tokens)
                
                # Log
                self._log_call(agent_id, model, tokens, cost)
                
                return {
                    "output": output,
                    "metadata": {
                        "tokens": tokens,
                        "cost_usd": cost,
                        "model": model
                    }
                }
            except (Timeout, HTTPError) as e:
                if attempt < 2:
                    time.sleep(2 ** attempt)  # Exponential backoff
                    continue
                raise
```

---

## 9. GitHub Actions-implementation (etapp 1)

### 9.1 Workflow-struktur

**Fil:** `.github/workflows/smedjan.yml`

**Triggers:**
- `push` till branch med pattern `feature/*`
- `workflow_dispatch` (manuell trigger)

**Jobs:**

```yaml
name: Smedjan Process

on:
  push:
    branches:
      - 'feature/**'
  workflow_dispatch:

jobs:
  step0_intake:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run A0 Intag
        run: |
          python orkestrering/run_agent.py --agent A0 --input specs/input.md
      - name: Upload spec
        uses: actions/upload-artifact@v3
        with:
          name: spec
          path: specs/output.md

  step1_review:
    needs: step0_intake
    runs-on: ubuntu-latest
    steps:
      - uses: actions/download-artifact@v3
        with:
          name: spec
      - name: Run A1 Specgranskning
        run: |
          python orkestrering/run_agent.py --agent A1 --input specs/output.md
      - name: Upload review
        uses: actions/upload-artifact@v3
        with:
          name: review
          path: reviews/output.md

  gate_G1:
    needs: step1_review
    runs-on: ubuntu-latest
    environment: approval-required  # Kräver manuellt godkännande
    steps:
      - name: Wait for G1 decision
        run: echo "Waiting for human decision at G1"

  # ...fortsätt för steg 2–10
```

### 9.2 Manual approve (grindar)

GitHub Actions "environment protection rules" → kräver godkännande från specifierad användare/team.

**Konfiguration:**
1. Skapa environment `approval-required`
2. Lägg till "Required reviewers" (t.ex. @produktägare)
3. Job väntar på godkännande innan fortsättning

---

## 10. Temporal-implementation (etapp 2)

### 10.1 Workflow-struktur

**Temporal Workflow:** `SmedjanWorkflow`

**Activities:**
- `RunAgentActivity(agent_id, prompt, input)`
- `WaitForGateDecisionActivity(gate, report)`
- `DeployActivity(environment, manifest)`

**Workflow-kod (pseudo):**
```python
@workflow.defn
class SmedjanWorkflow:
    @workflow.run
    async def run(self, spec_input):
        # Steg 0
        spec = await workflow.execute_activity(
            RunAgentActivity,
            args=["A0", prompt_A0, spec_input],
            start_to_close_timeout=timedelta(minutes=10)
        )
        
        # Steg 1
        review = await workflow.execute_activity(
            RunAgentActivity,
            args=["A1", prompt_A1, spec]
        )
        
        # G1
        g1_decision = await workflow.execute_activity(
            WaitForGateDecisionActivity,
            args=["G1", review],
            start_to_close_timeout=timedelta(days=7)  # 7 dagars timeout
        )
        
        if g1_decision == "godkänn":
            # Steg 2
            stories = await workflow.execute_activity(
                RunAgentActivity,
                args=["A2", prompt_A2, spec]
            )
            # ...fortsätt
        elif g1_decision == "återremittera":
            # L3-loop
            await workflow.sleep(timedelta(hours=1))  # Vänta på spec-uppdatering
            # Rekursiv eller loop
        else:
            # Avslagen
            return "archived"
```

### 10.2 Human-task för grindar

**Implementation:** Temporal signal.

**Workflow väntar:**
```python
decision = await workflow.wait_condition(lambda: self.gate_decision is not None)
```

**Extern trigger (t.ex. från portal):**
```python
# När människa fattar beslut i portal
temporal_client.signal_workflow(
    workflow_id="smedjan-ews-001",
    signal_name="gate_decision",
    input={"gate": "G1", "decision": "godkänn"}
)
```

---

## 11. Lucklista (identifierade gap)

### 11.1 Tekniska gap

1. **Philips API-mock:** Behövs för integrationstester (steg 5). Ingen implementation än.
2. **Prestandatest-verktyg:** k6 eller JMeter för att mäta response time. Ej specificerat.
3. **Säkerhetstest-verktyg:** OWASP ZAP eller liknande för att testa SQL injection, XSS. Ej specificerat.
4. **Audit-logg-lagring:** För klass 2-data. Vart lagras audit-loggen? (Kanske AWS CloudWatch eller VGR-intern lösning.)
5. **Backup och disaster recovery:** Vad händer om Git/GitHub går ner? Backup-strategi saknas.

### 11.2 Process-gap

1. **Konfliktlösning:** Vad händer om A4 och A5 har fundamentalt oenighet efter 3 varv L1? Eskalering till människa, men ingen tydlig process för vem som beslutar.
2. **Verksamhetsverifieringens format:** Hur dokumenteras verksamhetsverifiering i G4? Ska det vara en formell rapport eller muntlig feedback?
3. **MDR-dokumentation:** När och hur skapas MDR-dokumentation (om tillämpligt)? Är det A13:s ansvar?
4. **Driftvaktens mandat (A11):** Öppen fråga. Hur mycket får A11 ändra autonomt?
5. **Kostnadsbudget:** Ingen budget för OpenRouter API-anrop. Vad är max-kostnad per månad?

### 11.3 Etapp 1-gap

1. **GitHub Actions secrets:** Hur injiceras `OPENROUTER_API_KEY` säkert? (Använd GitHub Secrets, men dokumentera.)
2. **Artifact-retention:** Hur länge sparas GitHub Actions-artifacts? (Standard 90 dagar, men behöver vi längre?)
3. **CI-timeout:** Max 6 timmar per GitHub Actions job. Är det tillräckligt för alla steg?

### 11.4 Etapp 2-gap

1. **Temporal hosting:** Var körs Temporal? (Temporal Cloud eller self-hosted i VGR?)
2. **Temporal-kostnad:** Temporal Cloud-kostnader? (Alternativt: self-host.)
3. **Temporal-säkerhet:** mTLS, autentisering för Temporal workers?

---

## 12. Rekommendationer

### 12.1 Kortsiktigt (etapp 0–1)

1. **Börja med GitHub Actions** för etapp 1. Temporal kan vänta till etapp 2.
2. **Tunn OpenRouter-klient** (se `orkestrering/openrouter_client_stub.md`). Inga stora ramverk.
3. **Fokusera på EWS** som första last. Få den genom steg 0–2 i etapp 0.
4. **Dokumentera öppna frågor** tydligt (QA-ägande, verksamhetsverifiering, MDR, A11-mandat).

### 12.2 Långsiktigt (etapp 2+)

1. **Migrera till Temporal** när GitHub Actions blir för begränsande (loopar, human-tasks).
2. **Implementera metrics-dashboard** (se epic J: Mätning) för att följa cykeltid, loopfrekvens, etc.
3. **Skalning:** När fler team använder Smedjan, implementera multi-tenancy (separata Temporal namespaces per team).
4. **MDR-compliance:** Om komponenter klassas som medicinteknisk produkt, lägg till MDR-dokumentations-steg.

---

## 13. Slutsats

Orkestreringsspec v0.1 definierar:
- Tillståndsmaskin för steg 0–11
- Loopar L1–L3 med max-varv och eskalering
- Grind-integration (G1–G4) med mänsklig beslutfattning
- Agent-anrop via OpenRouter
- Proveniens och spårbarhet
- CI-är-facit-princip (P4)
- Implementation-strategi för etapp 0 (manuellt), etapp 1 (GitHub Actions), etapp 2 (Temporal)
- Identifierade luckor och rekommendationer

**Nästa steg:**
1. Review av denna spec (av Anders Carlius)
2. Revision baserat på feedback
3. Implementation i etapp 1 (vecka 37–38)

---

**Version:** 0.1 (utkast)  
**Senast uppdaterad:** 2026-09-09  
**Nästa review:** 2026-09-10
