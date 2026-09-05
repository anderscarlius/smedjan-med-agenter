"""
LLM-klient för Smedjan med mock-backend som default.
"""
import json
import logging
import os
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, Optional
from uuid import uuid4

import httpx
import yaml

logger = logging.getLogger(__name__)


class LlmClient:
    """
    Klient för att anropa LLM-agenter.
    
    Default: Mock-backend (ingen nätverkskall, ingen API-nyckel krävs).
    Framtida: OpenRouter-adapter kan läggas till.
    """
    
    def __init__(
        self,
        config_path: Optional[Path] = None,
        backend: str = "mock",
        api_key: Optional[str] = None
    ):
        """
        Initialisera LLM-klienten.
        
        Args:
            config_path: Sökväg till agents.yaml (default: .smedjan/agents.yaml)
            backend: Backend att använda ("mock" eller "openrouter")
            api_key: API-nyckel för externa backends (ej för mock)
        """
        self.backend = backend
        self.api_key = api_key
        
        if config_path is None:
            config_path = Path(__file__).parent.parent / ".smedjan" / "agents.yaml"
        
        self.config_path = Path(config_path)
        self.agents_config = self._load_agents_config()
        self.fixtures_dir = Path(__file__).parent / "fixtures"
        
        if backend == "openrouter" and not api_key:
            raise ValueError(
                "OpenRouter-backend kräver API-nyckel. "
                "Sätt OPENROUTER_API_KEY eller använd mock-backend (default)."
            )
        
        self.openrouter_config = self.agents_config.get("openrouter", {})
    
    def _load_agents_config(self) -> Dict[str, Any]:
        """Ladda agents.yaml."""
        with open(self.config_path) as f:
            return yaml.safe_load(f)
    
    def get_agent_info(self, agent_id: str) -> Dict[str, Any]:
        """Hämta agent-konfiguration."""
        agents = self.agents_config.get("agents", {})
        if agent_id not in agents:
            raise ValueError(f"Agent {agent_id} finns inte i konfiguration")
        return agents[agent_id]
    
    def get_pool_info(self, pool: str) -> Dict[str, Any]:
        """Hämta pool-konfiguration."""
        pools = self.agents_config.get("pools", {})
        if pool not in pools:
            raise ValueError(f"Pool {pool} finns inte i konfiguration")
        return pools[pool]
    
    def call_agent(
        self,
        agent_id: str,
        prompt: str,
        input_data: Dict[str, Any],
        data_class: int = 0
    ) -> Dict[str, Any]:
        """
        Anropa en agent.
        
        Args:
            agent_id: Agent-ID (t.ex. "A0")
            prompt: Systemprompt för agenten
            input_data: Input-data
            data_class: Dataklass (0/1/2)
        
        Returns:
            dict med:
            - output: Agent-response (str eller dict)
            - metadata: tokens, cost, model, family, pool, is_stub
        """
        agent_info = self.get_agent_info(agent_id)
        pool = agent_info["pool"]
        pool_info = self.get_pool_info(pool)
        
        # Pool D: Blockera alltid extern backend
        if pool == "D" and self.backend != "mock":
            raise ValueError(
                f"Pool D (Local) får ALDRIG gå mot extern backend. "
                f"Agent {agent_id} är konfigurerad för pool D och måste köras lokalt."
            )
        
        # Dataklass 2: Blockera alltid extern backend
        if data_class == 2 and self.backend != "mock":
            raise ValueError(
                f"Dataklass 2 (känslig data) får ALDRIG routas till extern backend. "
                f"Data class: {data_class}, Backend: {self.backend}. "
                f"Använd mock-backend eller lokal modell."
            )
        
        # Välj backend
        if self.backend == "mock":
            return self._call_mock(agent_id, agent_info, pool_info, input_data, data_class)
        elif self.backend == "openrouter":
            return self._call_openrouter(agent_id, agent_info, pool_info, prompt, input_data)
        else:
            raise ValueError(f"Okänd backend: {self.backend}")
    
    def _call_mock(
        self,
        agent_id: str,
        agent_info: Dict[str, Any],
        pool_info: Dict[str, Any],
        input_data: Dict[str, Any],
        data_class: int
    ) -> Dict[str, Any]:
        """Mock-backend: Returnera fixture-data."""
        fixture_path = self.fixtures_dir / f"{agent_id}.json"
        
        if fixture_path.exists():
            with open(fixture_path) as f:
                fixture = json.load(f)
                output = fixture.get("output", {})
        else:
            output = {
                "content": f"STUB: Mock-svar från {agent_id}",
                "note": "Ingen fixture hittades"
            }
        
        # Metadata med modellfamilj från pool
        metadata = {
            "agent_id": agent_id,
            "pool": agent_info["pool"],
            "family": pool_info["provider"],
            "model": agent_info["model"],
            "tokens": 0,
            "cost_usd": 0.0,
            "is_stub": True,
            "backend": "mock",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "data_class": data_class
        }
        
        return {
            "output": output,
            "metadata": metadata
        }
    
    def _call_openrouter(
        self,
        agent_id: str,
        agent_info: Dict[str, Any],
        pool_info: Dict[str, Any],
        prompt: str,
        input_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """OpenRouter-backend: Anropa OpenRouter API."""
        pool = agent_info["pool"]
        
        # Hämta model från OpenRouter-config
        models_config = self.openrouter_config.get("models", {})
        pool_models = models_config.get(pool, {})
        model_id = pool_models.get("default")
        fallback_model_id = pool_models.get("fallback")
        
        if not model_id:
            logger.warning(f"Ingen OpenRouter-modell konfigurerad för pool {pool}, fallback till mock")
            return self._call_mock(agent_id, agent_info, pool_info, input_data, 0)
        
        base_url = self.openrouter_config.get("base_url", "https://openrouter.ai/api/v1")
        retry_config = self.openrouter_config.get("retry", {})
        max_attempts = retry_config.get("max_attempts", 3)
        backoff_factor = retry_config.get("backoff_factor", 2)
        
        # Försök primär modell, sedan fallback
        for model_attempt in [model_id, fallback_model_id]:
            if not model_attempt:
                continue
                
            try:
                return self._call_openrouter_with_retry(
                    base_url=base_url,
                    model=model_attempt,
                    prompt=prompt,
                    input_data=input_data,
                    agent_id=agent_id,
                    pool=pool,
                    family=pool_info["provider"],
                    max_attempts=max_attempts,
                    backoff_factor=backoff_factor
                )
            except Exception as e:
                logger.warning(f"OpenRouter-anrop misslyckades för modell {model_attempt}: {e}")
                if model_attempt == fallback_model_id:
                    logger.error(f"Även fallback-modell misslyckades, använder mock")
                    return self._call_mock_with_error_flag(agent_id, agent_info, pool_info, input_data, str(e))
        
        # Om vi når hit, inget fungerade
        return self._call_mock_with_error_flag(agent_id, agent_info, pool_info, input_data, "Ingen modell tillgänglig")
    
    def _call_openrouter_with_retry(
        self,
        base_url: str,
        model: str,
        prompt: str,
        input_data: Dict[str, Any],
        agent_id: str,
        pool: str,
        family: str,
        max_attempts: int,
        backoff_factor: int
    ) -> Dict[str, Any]:
        """Anropa OpenRouter med retry-logik."""
        endpoint = f"{base_url}/chat/completions"
        
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://github.com/anderscarlius/smedjan-med-agenter",
            "X-Title": "Smedjan"
        }
        
        # Bygg meddelanden
        messages = [
            {"role": "system", "content": prompt},
            {"role": "user", "content": json.dumps(input_data, ensure_ascii=False)}
        ]
        
        payload = {
            "model": model,
            "messages": messages
        }
        
        last_error = None
        
        for attempt in range(max_attempts):
            try:
                with httpx.Client(timeout=60.0) as client:
                    response = client.post(endpoint, json=payload, headers=headers)
                    response.raise_for_status()
                    
                    result = response.json()
                    
                    # Extrahera output
                    output_content = result["choices"][0]["message"]["content"]
                    
                    # Extrahera metadata
                    usage = result.get("usage", {})
                    total_tokens = usage.get("total_tokens", 0)
                    
                    # Beräkna kostnad (approximativt)
                    cost_usd = self._estimate_cost(model, total_tokens)
                    
                    metadata = {
                        "agent_id": agent_id,
                        "pool": pool,
                        "family": family,
                        "model": model,
                        "tokens": total_tokens,
                        "cost_usd": cost_usd,
                        "is_stub": False,
                        "backend": "openrouter",
                        "timestamp": datetime.now(timezone.utc).isoformat(),
                        "data_class": 0
                    }
                    
                    logger.info(f"OpenRouter-anrop lyckades: {agent_id} (modell: {model}, tokens: {total_tokens}, kostnad: ${cost_usd:.4f})")
                    
                    return {
                        "output": {"content": output_content},
                        "metadata": metadata
                    }
            
            except httpx.HTTPStatusError as e:
                last_error = e
                if e.response.status_code == 429:
                    logger.warning(f"Rate limit (429), försök {attempt + 1}/{max_attempts}")
                elif e.response.status_code >= 500:
                    logger.warning(f"Server-fel ({e.response.status_code}), försök {attempt + 1}/{max_attempts}")
                else:
                    raise
            
            except (httpx.RequestError, httpx.TimeoutException) as e:
                last_error = e
                logger.warning(f"Nätverksfel: {e}, försök {attempt + 1}/{max_attempts}")
            
            if attempt < max_attempts - 1:
                sleep_time = backoff_factor ** attempt
                logger.info(f"Väntar {sleep_time}s innan retry...")
                time.sleep(sleep_time)
        
        raise Exception(f"OpenRouter-anrop misslyckades efter {max_attempts} försök: {last_error}")
    
    def _estimate_cost(self, model: str, tokens: int) -> float:
        """Uppskatta kostnad baserat på modell och tokens."""
        # Approximativa priser per 1M tokens (input+output genomsnitt)
        cost_per_1m = {
            "deepseek/deepseek-chat": 0.14,
            "openai/gpt-5.6-terra": 2.0,
            "google/gemini-flash-1.5-8b": 0.075,
            "qwen/qwen-2.5-72b-instruct": 0.35,
            "anthropic/claude-3-5-sonnet": 3.0,
            "google/gemini-pro-1.5": 1.25
        }
        
        price = cost_per_1m.get(model, 1.0)
        return (tokens / 1_000_000) * price
    
    def _call_mock_with_error_flag(
        self,
        agent_id: str,
        agent_info: Dict[str, Any],
        pool_info: Dict[str, Any],
        input_data: Dict[str, Any],
        error_msg: str
    ) -> Dict[str, Any]:
        """Mock-fallback med felindikation."""
        result = self._call_mock(agent_id, agent_info, pool_info, input_data, 0)
        result["metadata"]["fallback_reason"] = error_msg
        result["metadata"]["is_stub"] = True
        logger.warning(f"Fallback till mock för {agent_id}: {error_msg}")
        return result
