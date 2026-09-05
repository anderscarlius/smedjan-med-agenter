"""
LLM-klient för Smedjan med mock-backend som default.
"""
import json
import os
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, Optional
from uuid import uuid4

import yaml


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
                "Sätt SMEDJAN_LLM_API_KEY eller använd mock-backend (default)."
            )
    
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
        
        # Pool D / klass 2: Blockera alltid extern backend
        if pool == "D" and self.backend != "mock":
            raise ValueError(
                f"Pool D (Local) får ALDRIG gå mot extern backend. "
                f"Agent {agent_id} är konfigurerad för pool D och måste köras lokalt."
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
        """OpenRouter-backend (ej implementerad i etapp 0)."""
        raise NotImplementedError(
            "OpenRouter-integration kommer i etapp 1. "
            "Använd mock-backend (default) för etapp 0."
        )
