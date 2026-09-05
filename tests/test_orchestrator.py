"""
Tester för orchestrator.
"""
from pathlib import Path
import tempfile
import shutil

import pytest

from orkestrering.llm_client import LlmClient
from orkestrering.orchestrator import PipelineOrchestrator


@pytest.fixture
def temp_workspace():
    """Skapa temporär workspace för tester."""
    temp_dir = Path(tempfile.mkdtemp())
    
    # Kopiera .smedjan och prompter till temp-dir
    source_root = Path(__file__).parent.parent
    
    shutil.copytree(source_root / ".smedjan", temp_dir / ".smedjan")
    shutil.copytree(source_root / "prompter", temp_dir / "prompter")
    shutil.copytree(source_root / "orkestrering" / "fixtures", temp_dir / "orkestrering" / "fixtures")
    
    yield temp_dir
    
    # Cleanup
    shutil.rmtree(temp_dir)


@pytest.fixture
def orchestrator(temp_workspace):
    """Skapa orchestrator med temporär workspace."""
    client = LlmClient(
        config_path=temp_workspace / ".smedjan" / "agents.yaml",
        backend="mock"
    )
    return PipelineOrchestrator(client, workspace_root=temp_workspace)


def test_ews_demo_creates_artifacts(orchestrator, temp_workspace):
    """Testa att EWS-demo skapar alla förväntade artefakter."""
    orchestrator.run_ews_demo()
    
    korningar_dir = temp_workspace / "korningar" / "ews"
    
    # Steg 0
    assert (korningar_dir / "steg0" / "spec-v1.md").exists()
    assert (korningar_dir / "steg0" / "spec-v1.meta.json").exists()
    assert (korningar_dir / "steg0" / "input.md").exists()
    
    # Steg 1
    assert (korningar_dir / "steg1" / "review-v1.md").exists()
    assert (korningar_dir / "steg1" / "review-v1.meta.json").exists()
    assert (korningar_dir / "steg1" / "input.md").exists()
    
    # G1
    assert (korningar_dir / "G1" / "beslut.md").exists()
    assert (korningar_dir / "G1" / "beslut.meta.json").exists()
    
    # Steg 2
    assert (korningar_dir / "steg2" / "stories-v1.yaml").exists()
    assert (korningar_dir / "steg2" / "stories-v1.meta.json").exists()
    
    # Individuella stories
    assert (korningar_dir / "steg2" / "story-EWS-001.1.md").exists()
    assert (korningar_dir / "steg2" / "story-EWS-001.2.md").exists()
    assert (korningar_dir / "steg2" / "story-EWS-001.3.md").exists()


def test_proveniens_metadata_structure(orchestrator, temp_workspace):
    """Testa att proveniens-metadata har rätt struktur."""
    orchestrator.run_ews_demo()
    
    meta_path = temp_workspace / "korningar" / "ews" / "steg0" / "spec-v1.meta.json"
    
    import json
    with open(meta_path) as f:
        metadata = json.load(f)
    
    # Verifiera att metadata innehåller rätt fält
    assert "agent_id" in metadata
    assert "pool" in metadata
    assert "family" in metadata
    assert "model" in metadata
    assert "is_stub" in metadata
    assert "backend" in metadata
    assert "timestamp" in metadata
    assert "data_class" in metadata
    
    assert metadata["agent_id"] == "A0"
    assert metadata["pool"] == "A"
    assert metadata["family"] == "Anthropic"
    assert metadata["is_stub"] is True
    assert metadata["backend"] == "mock"
    assert metadata["data_class"] == 0


def test_forslagsspec_created_if_missing(orchestrator, temp_workspace):
    """Testa att syntetisk förslagsspec skapas om den saknas."""
    orchestrator.run_ews_demo()
    
    forslagsspec_path = temp_workspace / "korningar" / "ews" / "forslagsspec.md"
    assert forslagsspec_path.exists()
    
    with open(forslagsspec_path) as f:
        content = f.read()
    
    assert "Early Warning Score" in content
    assert "Philips" in content
    assert "Dataklass" in content


def test_artifacts_are_readable(orchestrator, temp_workspace):
    """Testa att artefakter är läsbara och inte bara STUB."""
    orchestrator.run_ews_demo()
    
    spec_path = temp_workspace / "korningar" / "ews" / "steg0" / "spec-v1.md"
    
    with open(spec_path) as f:
        content = f.read()
    
    # Ska vara riktig spec, inte bara "STUB"
    assert "EWS-001" in content
    assert "artifact_type: spec" in content
    assert "Funktionell beskrivning" in content
    assert "NEWS2" in content
    
    # Ska INTE vara generisk stub
    assert "STUB: Mock-svar" not in content


def test_g1_mock_decision(orchestrator, temp_workspace):
    """Testa att G1-mock-beslut skapas korrekt."""
    orchestrator.run_ews_demo()
    
    g1_path = temp_workspace / "korningar" / "ews" / "G1" / "beslut.md"
    
    with open(g1_path) as f:
        content = f.read()
    
    assert "G1" in content
    assert "Godkänn" in content
    assert "Mock Demo" in content
    assert "artifact_type: decision" in content
