"""
Tester för LLM-klienten.
"""
import json
from pathlib import Path

import pytest
import respx
from httpx import Response

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


def test_data_class_2_blocks_external_backend(config_path):
    """Testa att dataklass 2 blockeras mot extern backend."""
    client = LlmClient(config_path=config_path, backend="openrouter", api_key="test-key")
    
    # Dataklass 2 får aldrig gå till extern backend
    with pytest.raises(ValueError, match="Dataklass 2.*får ALDRIG routas till extern backend"):
        client.call_agent("A0", "test", {}, data_class=2)


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


@respx.mock
def test_openrouter_successful_call(config_path):
    """Testa lyckad OpenRouter API-anrop."""
    # Mock OpenRouter API response
    respx.post("https://openrouter.ai/api/v1/chat/completions").mock(
        return_value=Response(
            200,
            json={
                "id": "test-id",
                "choices": [
                    {
                        "message": {
                            "content": "Test response från OpenRouter"
                        }
                    }
                ],
                "usage": {
                    "total_tokens": 150
                }
            }
        )
    )
    
    client = LlmClient(config_path=config_path, backend="openrouter", api_key="test-key")
    result = client.call_agent("A0", "Test prompt", {"test": "data"}, data_class=0)
    
    assert result["metadata"]["is_stub"] is False
    assert result["metadata"]["backend"] == "openrouter"
    assert result["metadata"]["tokens"] == 150
    assert result["metadata"]["cost_usd"] > 0
    assert "Test response från OpenRouter" in result["output"]["content"]


@respx.mock
def test_openrouter_retry_on_rate_limit(config_path):
    """Testa retry vid rate limit (429)."""
    # Första anropet: 429, andra: success
    respx.post("https://openrouter.ai/api/v1/chat/completions").mock(
        side_effect=[
            Response(429, json={"error": "Rate limit"}),
            Response(
                200,
                json={
                    "choices": [{"message": {"content": "Success efter retry"}}],
                    "usage": {"total_tokens": 100}
                }
            )
        ]
    )
    
    client = LlmClient(config_path=config_path, backend="openrouter", api_key="test-key")
    result = client.call_agent("A0", "Test", {"test": "data"}, data_class=0)
    
    assert result["metadata"]["is_stub"] is False
    assert "Success efter retry" in result["output"]["content"]


@respx.mock
def test_openrouter_fallback_to_mock_on_failure(config_path):
    """Testa fallback till mock vid API-fel."""
    # Alla försök misslyckas
    respx.post("https://openrouter.ai/api/v1/chat/completions").mock(
        side_effect=[
            Response(500, json={"error": "Server error"}),
            Response(500, json={"error": "Server error"}),
            Response(500, json={"error": "Server error"})
        ]
    )
    
    client = LlmClient(config_path=config_path, backend="openrouter", api_key="test-key")
    result = client.call_agent("A0", "Test", {"test": "data"}, data_class=0)
    
    # Ska fallback till mock
    assert result["metadata"]["is_stub"] is True
    assert "fallback_reason" in result["metadata"]


def test_openrouter_model_mapping(config_path):
    """Testa att modellmappningar finns för alla pooler utom D."""
    client = LlmClient(config_path=config_path, backend="mock")
    
    models_config = client.openrouter_config.get("models", {})
    
    # Pool A, B, C ska ha modeller
    assert models_config.get("A", {}).get("default") is not None
    assert models_config.get("B", {}).get("default") is not None
    assert models_config.get("C", {}).get("default") is not None
    
    # Pool D ska vara None (lokal)
    assert models_config.get("D", {}).get("default") is None
