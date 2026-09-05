# Smedjan Orkestrering

Orkestreringsmodul för Smedjan-processen: stegmaskin, LLM-klient och körlogik.

## Översikt

Denna modul innehåller:
- **LlmClient**: Adapter för LLM-anrop med mock och OpenRouter-backend
- **PipelineOrchestrator**: Tillståndsmaskin för steg 0-11
- **Fixtures**: Mock-data för offline-körning

## Användning

### Mock-backend (offline, default)

Ingen API-nyckel krävs. Använder förinspelad fixture-data.

```bash
python -m orkestrering demo ews
```

**Resultat:** Artefakter skapas under `korningar/ews/` med mock-data.

### OpenRouter-backend (riktiga LLM-anrop)

**Steg 1: Skaffa API-nyckel**

1. Gå till [OpenRouter](https://openrouter.ai/)
2. Skapa konto och generera API-nyckel
3. Sätt environment variable:

```bash
export OPENROUTER_API_KEY=sk-or-v1-...
```

Alternativt, skapa `.env` fil (kopieras från `.env.example`):

```bash
cp .env.example .env
# Redigera .env och sätt din nyckel
```

**Steg 2: Kör med OpenRouter**

```bash
export OPENROUTER_API_KEY=sk-or-v1-...
python -m orkestrering demo ews
```

Klienten detekterar automatiskt om API-nyckel finns och väljer backend.

**Output:**
- `🔑 OPENROUTER_API_KEY hittad, använder OpenRouter API` → OpenRouter
- `📦 Ingen OPENROUTER_API_KEY, använder mock-backend (offline)` → Mock

## Kostnader (EWS demo steg 0-2)

Med OpenRouter API (approximativt):

| Agent | Modell | Tokens | Kostnad |
|-------|--------|--------|---------|
| A0 (Intag) | DeepSeek V4 Flash | ~1500 | $0.0002 |
| A1 (Granskning) | Gemini Flash 8B | ~1000 | $0.0001 |
| A2 (Nedbrytning) | Claude 3.5 Sonnet | ~2500 | $0.0075 |
| **Total** | | ~5000 | **~$0.01** |

**Etapp 0 demo = ca 1 cent per körning.**

För 100 körningar: ~$1. För utveckling/test rekommenderas mock-backend.

## Modellval

Konfigureras i `.smedjan/agents.yaml` under `openrouter.models`:

- **Pool A** (Intag, Kodning): DeepSeek V4 Flash → GPT-5.6 Terra
- **Pool B** (Granskning): Gemini Flash 8B → Qwen 72B
- **Pool C** (Strukturerat): Claude 3.5 Sonnet → Gemini Pro 1.5
- **Pool D** (Lokal): **ALDRIG OpenRouter** (hård spärr)

Prioritet: låg kostnad, hög kvalitet för dataklass 0-1.

## Fallback-beteende

Om OpenRouter API misslyckas (timeout, rate limit, server-fel):
1. **Retry:** 3 försök med exponential backoff (2s, 4s, 8s)
2. **Fallback modell:** Försök sekundär modell per pool
3. **Mock fallback:** Om allt misslyckas, använd mock-fixtures med varning i logg

Mock-fallback garanterar att demo alltid går att köra, även vid API-problem.

## Tester

Köra alla tester (offline):

```bash
pytest
```

Tester för OpenRouter-path använder mocked HTTP (ingen riktig API-nyckel i CI).

### Test-coverage

- Mock-backend: 100% offline
- OpenRouter success/retry/fallback: Mocked med `respx`
- Pool D-spärr: Testad
- Kostnad/token-räkning: Testad

## Dataklass-säkerhet

**Pool D / Dataklass 2:** Hård spärr mot externa backends.

```python
# Pool D (A11: Driftvakt)
client = LlmClient(backend="openrouter", api_key="...")
client.call_agent("A11", ...)  # → ValueError: Pool D får ALDRIG gå mot extern backend
```

Detta garanterar att känslig data (klass 2) aldrig routas till OpenRouter.

## Utveckling

### Lägg till ny mock-fixture

Skapa `orkestrering/fixtures/<AGENT_ID>.json`:

```json
{
  "output": {
    "content": "Mock-svar för agenten..."
  }
}
```

### Lägg till ny modell

Uppdatera `.smedjan/agents.yaml`:

```yaml
openrouter:
  models:
    A:
      default: "deepseek/deepseek-chat"
      fallback: "openai/gpt-5.6-terra"
```

OpenRouter model IDs: [https://openrouter.ai/docs#models](https://openrouter.ai/docs#models)

## Felsökning

**Problem:** `OpenRouter-backend kräver API-nyckel`

**Lösning:** Sätt `OPENROUTER_API_KEY` eller använd mock (default).

---

**Problem:** `Pool D får ALDRIG gå mot extern backend`

**Lösning:** Pool D (lokal) är designad för känslig data. Använd lokal modell eller mock.

---

**Problem:** API-anrop timeout

**Lösning:** Automatisk retry med exponential backoff. Fallback till mock efter 3 försök.

---

**Problem:** Rate limit (429)

**Lösning:** Automatisk retry. Konfigurera `openrouter.rate_limit.requests_per_minute` i agents.yaml.

## Framtida arbete

- [ ] Temporal-integration för steg 3-11 (etapp 2)
- [ ] Lokal vLLM för pool D (etapp 2)
- [ ] GitHub Actions integration (etapp 1)
- [ ] Kostnadsgränser per körning
- [ ] Streaming responses
