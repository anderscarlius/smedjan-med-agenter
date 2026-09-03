# Orkestrering – OpenRouter Client Stub

**Syfte:** Stub för OpenRouter-klienten. Används i etapp 0 för att simulera agent-anrop utan riktiga API-anrop.

**Version:** 0.1 (stub)  
**Etapp:** 0 (stub), 1 (riktig implementation)

---

## API-kontrakt

```python
class OpenRouterClient:
    """
    Klient för att anropa LLM:er via OpenRouter API.
    Etapp 0: Stub (returnerar mock-svar).
    Etapp 1: Riktig implementation.
    """
    
    def __init__(self, api_key: str = None, base_url: str = "https://openrouter.ai/api/v1"):
        self.api_key = api_key or os.getenv("OPENROUTER_API_KEY")
        self.base_url = base_url
        self.is_stub = (self.api_key is None)  # Om ingen nyckel → stub-läge
    
    def call_agent(
        self,
        agent_id: str,
        prompt: str,
        input_data: dict,
        pool: str
    ) -> dict:
        """
        Anropa en agent.
        
        Args:
            agent_id: Agent-ID (t.ex. "A0")
            prompt: Systemprompt för agenten
            input_data: Input-data (spec, story, etc.)
            pool: Pool (A/B/C/D)
        
        Returns:
            dict med 'output' (agent-response) och 'metadata' (tokens, kostnad)
        """
        if self.is_stub:
            return self._stub_response(agent_id, input_data)
        
        # Riktig implementation (etapp 1)
        model = self._get_model_for_pool(pool)
        response = self._call_openrouter_api(model, prompt, input_data)
        return response
    
    def _stub_response(self, agent_id: str, input_data: dict) -> dict:
        """Returnera mock-svar för stub-läge"""
        # Läs mock-svar från fil om finns
        mock_file = f"orkestrering/mocks/{agent_id}.json"
        if os.path.exists(mock_file):
            with open(mock_file) as f:
                return json.load(f)
        
        # Annars returnera generisk mock
        return {
            "output": f"STUB: Mock-svar från {agent_id}",
            "metadata": {
                "tokens": 0,
                "cost_usd": 0.0,
                "model": "stub",
                "is_stub": True
            }
        }
    
    def _get_model_for_pool(self, pool: str) -> str:
        """Mappa pool till model"""
        mapping = {
            "A": "anthropic/claude-3-opus",
            "B": "openai/gpt-4",
            "C": "mistralai/mistral-large",
            "D": "local/gemma4-9b"  # Lokal, ej via OpenRouter
        }
        return mapping.get(pool, "openai/gpt-3.5-turbo")
    
    def _call_openrouter_api(self, model: str, prompt: str, input_data: dict) -> dict:
        """Anropa faktisk OpenRouter API (etapp 1)"""
        # TODO: Implementera i etapp 1
        # - POST till self.base_url + "/chat/completions"
        # - Headers: Authorization: Bearer {api_key}
        # - Body: {model, messages: [{role: "system", content: prompt}, {role: "user", content: str(input_data)}]}
        # - Retry-logik (exponential backoff)
        # - Rate limiting
        # - Token + cost tracking
        raise NotImplementedError("Riktig OpenRouter-implementation kommer i etapp 1")
```

---

## Mock-svar (exempel)

Spara i `orkestrering/mocks/A0.json`:

```json
{
  "output": "Strukturerad spec enligt mall...",
  "metadata": {
    "tokens": 1500,
    "cost_usd": 0.045,
    "model": "stub",
    "is_stub": true
  }
}
```

---

## Användning i etapp 0

```python
# Skapa stub-klient (utan API-nyckel)
client = OpenRouterClient()

# Anropa A0
response = client.call_agent(
    agent_id="A0",
    prompt=open("prompter/A0.md").read(),
    input_data={"forslagsspec": "..."},
    pool="A"
)

print(response["output"])  # "STUB: Mock-svar från A0"
```

---

**TODO för etapp 1:**
- Implementera `_call_openrouter_api()`
- Retry-logik (3 försök, exponential backoff)
- Rate limiting (60 req/min)
- Token + cost tracking
- Error handling (timeout, 429, 500, etc.)
