"""
Tester för LLM-klienten.
"""
import json
from pathlib import Path

import pytest

from orkestrering.llm_client import LlmClient


@pytest.fixture
def config_path():
    """Returnera sökväg till agents.yaml."""
    return Path(__file__).parent.parent / ".smedjan" / "agents.yaml"


@pytest.fixture
def mock_client(config_path):
    """Skapa mock-klient."""
    return LlmClient(config_path=config_path, backend="mock")


def test_mock_client_no_network(mock_client):
    """Testa att mock-klienten inte gör nätverksanrop."""
    result = mock_client.call_agent("A0", "test prompt", {"test": "data"}, data_class=0)
    
    assert result["metadata"]["is_stub"] is True
    assert result["metadata"]["backend"] == "mock"
    assert result["metadata"]["tokens"] == 0
    assert result["metadata"]["cost_usd"] == 0.0


def test_separation_rule_s1_different_families(mock_client):
    """Testa S1: A0 och A1 ska ha olika modellfamiljer."""
    a0_result = mock_client.call_agent("A0", "test", {}, data_class=0)
    a1_result = mock_client.call_agent("A1", "test", {}, data_class=0)
    
    a0_family = a0_result["metadata"]["family"]
    a1_family = a1_result["metadata"]["family"]
    
    # A0 är pool A (Anthropic), A1 är pool B (OpenAI)
    assert a0_family != a1_family, f"S1 violation: A0 och A1 har samma family ({a0_family})"
    assert a0_family == "Anthropic"
    assert a1_family == "OpenAI"


def test_pool_d_blocks_external_backend(config_path):
    """Testa att pool D blockeras mot extern backend."""
    client = LlmClient(config_path=config_path, backend="openrouter", api_key="test-key")
    
    # A11 är i pool D (Local)
    with pytest.raises(ValueError, match="Pool D.*får ALDRIG gå mot extern backend"):
        client.call_agent("A11", "test", {}, data_class=0)


def test_openrouter_requires_api_key(config_path):
    """Testa att OpenRouter-backend kräver API-nyckel."""
    with pytest.raises(ValueError, match="OpenRouter-backend kräver API-nyckel"):
        LlmClient(config_path=config_path, backend="openrouter")


def test_fixtures_are_loaded(mock_client):
    """Testa att fixtures laddas korrekt."""
    result = mock_client.call_agent("A0", "test", {}, data_class=0)
    
    # Fixture ska finnas och innehålla riktig spec
    assert "output" in result
    assert "content" in result["output"]
    assert "EWS-001" in result["output"]["content"]


def test_agent_metadata_structure(mock_client):
    """Testa att metadata har rätt struktur."""
    result = mock_client.call_agent("A0", "test", {}, data_class=0)
    
    metadata = result["metadata"]
    required_fields = ["agent_id", "pool", "family", "model", "tokens", "cost_usd", "is_stub", "backend", "timestamp", "data_class"]
    
    for field in required_fields:
        assert field in metadata, f"Metadata saknar fält: {field}"


def test_pool_info_is_loaded(mock_client):
    """Testa att pool-information laddas korrekt."""
    pool_a = mock_client.get_pool_info("A")
    pool_b = mock_client.get_pool_info("B")
    pool_c = mock_client.get_pool_info("C")
    pool_d = mock_client.get_pool_info("D")
    
    assert pool_a["provider"] == "Anthropic"
    assert pool_b["provider"] == "OpenAI"
    assert pool_c["provider"] == "Mistral"
    assert pool_d["provider"] == "Local"


def test_agent_pool_assignment(mock_client):
    """Testa att agenter är korrekt assignade till pooler."""
    a0_info = mock_client.get_agent_info("A0")
    a1_info = mock_client.get_agent_info("A1")
    a2_info = mock_client.get_agent_info("A2")
    
    assert a0_info["pool"] == "A"
    assert a1_info["pool"] == "B"
    assert a2_info["pool"] == "C"
