"""
Orkestreringslogik för Smedjans pipeline.
"""
import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, Optional
from uuid import uuid4

import yaml

from orkestrering.llm_client import LlmClient


class PipelineOrchestrator:
    """Orkestrerar Smedjans pipeline för EWS-demo."""
    
    def __init__(self, client: LlmClient, workspace_root: Optional[Path] = None):
        """
        Initialisera orchestrator.
        
        Args:
            client: LLM-klient
            workspace_root: Rot för workspace (default: nuvarande katalog)
        """
        self.client = client
        if workspace_root is None:
            workspace_root = Path.cwd()
        self.workspace_root = Path(workspace_root)
        self.korningar_dir = self.workspace_root / "korningar" / "ews"
        self.prompter_dir = self.workspace_root / "prompter"
    
    def _save_artifact(
        self,
        output_dir: Path,
        filename: str,
        content: str,
        metadata: Dict[str, Any]
    ) -> None:
        """
        Spara artefakt med proveniens-metadata.
        
        Args:
            output_dir: Output-katalog
            filename: Filnamn (utan .meta.json)
            content: Innehåll att spara
            metadata: Metadata från LLM-anrop
        """
        output_dir.mkdir(parents=True, exist_ok=True)
        
        # Spara huvudfil
        artifact_path = output_dir / filename
        with open(artifact_path, "w") as f:
            f.write(content)
        
        # Spara proveniens-metadata
        meta_filename = filename.replace(".md", ".meta.json").replace(".yaml", ".meta.json")
        if not meta_filename.endswith(".meta.json"):
            meta_filename = filename + ".meta.json"
        
        meta_path = output_dir / meta_filename
        with open(meta_path, "w") as f:
            json.dump(metadata, f, indent=2, ensure_ascii=False)
    
    def _load_prompt(self, agent_id: str) -> str:
        """Ladda prompt för agent."""
        prompt_path = self.prompter_dir / f"{agent_id}.md"
        if not prompt_path.exists():
            return f"Systemprompt för {agent_id}"
        with open(prompt_path) as f:
            return f.read()
    
    def run_ews_demo(self, forslagsspec_content: Optional[str] = None) -> None:
        """
        Kör EWS-demo: steg 0 → 1 → G1 → 2.
        
        Args:
            forslagsspec_content: Innehåll i förslagsspec (eller None för att använda befintlig)
        """
        print("=== Smedjan EWS Demo (Etapp 0 - Mock) ===\n")
        
        # Om ingen förslagsspec finns, använd syntetisk
        if forslagsspec_content is None:
            forslagsspec_path = self.korningar_dir / "forslagsspec.md"
            if forslagsspec_path.exists():
                with open(forslagsspec_path) as f:
                    forslagsspec_content = f.read()
            else:
                forslagsspec_content = self._get_default_forslagsspec()
                # Spara den syntetiska förslagsspecen
                forslagsspec_path.parent.mkdir(parents=True, exist_ok=True)
                with open(forslagsspec_path, "w") as f:
                    f.write(forslagsspec_content)
                print(f"✓ Skapade syntetisk förslagsspec: {forslagsspec_path}\n")
        
        # Steg 0: Intag (A0)
        print("--- Steg 0: Intag (A0) ---")
        spec_result = self._run_step0(forslagsspec_content)
        print(f"✓ A0 klar. Output: {self.korningar_dir / 'steg0' / 'spec-v1.md'}\n")
        
        # Steg 1: Specgranskning (A1)
        print("--- Steg 1: Specgranskning (A1) ---")
        review_result = self._run_step1(spec_result)
        print(f"✓ A1 klar. Output: {self.korningar_dir / 'steg1' / 'review-v1.md'}\n")
        
        # G1: Grindbeslut (mock - förifyllt godkännande)
        print("--- G1: Grindbeslut (Mock) ---")
        self._run_g1_mock()
        print(f"✓ G1 beslut (mock): Godkänn. Output: {self.korningar_dir / 'G1' / 'beslut.md'}\n")
        
        # Steg 2: Nedbrytning (A2)
        print("--- Steg 2: Nedbrytning (A2) ---")
        stories_result = self._run_step2(spec_result)
        print(f"✓ A2 klar. Output: {self.korningar_dir / 'steg2' / 'stories-v1.yaml'}\n")
        
        print("=== EWS Demo slutförd ===")
        print(f"Artefakter skapade under: {self.korningar_dir}")
    
    def _run_step0(self, forslagsspec: str) -> Dict[str, Any]:
        """Kör steg 0: Intag (A0)."""
        prompt = self._load_prompt("A0")
        input_data = {"forslagsspec": forslagsspec}
        
        result = self.client.call_agent("A0", prompt, input_data, data_class=0)
        
        # Spara spec
        self._save_artifact(
            self.korningar_dir / "steg0",
            "spec-v1.md",
            result["output"]["content"],
            result["metadata"]
        )
        
        # Spara input-referens
        with open(self.korningar_dir / "steg0" / "input.md", "w") as f:
            f.write(forslagsspec)
        
        return result
    
    def _run_step1(self, spec_result: Dict[str, Any]) -> Dict[str, Any]:
        """Kör steg 1: Specgranskning (A1)."""
        prompt = self._load_prompt("A1")
        spec_content = spec_result["output"]["content"]
        input_data = {"spec": spec_content}
        
        result = self.client.call_agent("A1", prompt, input_data, data_class=0)
        
        # Spara review
        self._save_artifact(
            self.korningar_dir / "steg1",
            "review-v1.md",
            result["output"]["content"],
            result["metadata"]
        )
        
        # Spara input-referens
        with open(self.korningar_dir / "steg1" / "input.md", "w") as f:
            f.write(spec_content)
        
        return result
    
    def _run_g1_mock(self) -> None:
        """Skapa mock G1-beslut (förifyllt godkännande)."""
        beslut_content = """---
artifact_type: decision
artifact_id: mock-g1-ews-001
grind: G1
decision: godkann
created_by: Mock Demo (Etapp 0)
created_at: {timestamp}
input_refs: []
data_class: 0
schema_version: "1.0"
---

# Grindbeslut G1: EWS-001

**Grind:** G1 (Specgodkännande)  
**Beslut:** Godkänn  
**Beslutsfattare:** Mock Demo (Etapp 0)  
**Datum:** {timestamp}  
**Signatur:** N/A (Mock)

## Motivering

Detta är ett mock-beslut för demo-syfte i etapp 0. I en riktig körning skulle en människa (produktägare eller systemarkitekt) granska A1:s rapport och fatta beslut.

För demo-syfte: Specen godkänns automatiskt för att demonstrera steg 2 (Nedbrytning).

## Nästa steg

- **Om godkänd:** Steg 2 (Nedbrytning) fortsätter
""".format(timestamp=datetime.now(timezone.utc).isoformat())
        
        g1_dir = self.korningar_dir / "G1"
        g1_dir.mkdir(parents=True, exist_ok=True)
        
        with open(g1_dir / "beslut.md", "w") as f:
            f.write(beslut_content)
        
        # Metadata
        metadata = {
            "artifact_type": "decision",
            "grind": "G1",
            "decision": "godkann",
            "created_by": "Mock Demo",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "is_mock": True
        }
        with open(g1_dir / "beslut.meta.json", "w") as f:
            json.dump(metadata, f, indent=2)
    
    def _run_step2(self, spec_result: Dict[str, Any]) -> Dict[str, Any]:
        """Kör steg 2: Nedbrytning (A2)."""
        prompt = self._load_prompt("A2")
        spec_content = spec_result["output"]["content"]
        input_data = {"spec": spec_content}
        
        result = self.client.call_agent("A2", prompt, input_data, data_class=0)
        
        # Spara stories
        self._save_artifact(
            self.korningar_dir / "steg2",
            "stories-v1.yaml",
            result["output"]["stories_yaml"],
            result["metadata"]
        )
        
        # Spara individuella stories
        for story in result["output"]["stories"]:
            story_filename = f"story-{story['story_id']}.md"
            self._save_artifact(
                self.korningar_dir / "steg2",
                story_filename,
                story["content"],
                result["metadata"]
            )
        
        return result
    
    def _get_default_forslagsspec(self) -> str:
        """Returnera syntetisk EWS-förslagsspec."""
        return """# Förslagsspec: Early Warning Score (EWS) från Philips

## Beskrivning

Vi vill hämta vital-parametrar från Philips-övervakningssystem och beräkna Early Warning Score (EWS) enligt NEWS2-standard. EWS-värdet ska sedan lagras i VGR Datahubb för användning i patientöversikter.

## Användarnytta

Sjukvårdspersonal kan snabbt identifiera patienter som försämras genom att se EWS-score i realtid.

## Funktionella krav

1. Hämta vitals från Philips-system via API (puls, blodtryck, saturation, temperatur, medvetandegrad)
2. Beräkna EWS-score enligt National Early Warning Score 2 (NEWS2)
3. Lagra EWS-värde med timestamp i VGR Datahubb
4. Exponera API för att hämta senaste EWS per patient

## Tekniska begränsningar

- Philips-API använder REST + OAuth2
- Data ska lagras i FHIR-format (Observation-resource)
- Max 5 sekunders latens från Philips till Datahubb

## Dataklass

Klass 0 för etapp 0 (syntetisk testdata). Framtida klass 2 i produktion (riktig patientdata).

## Sekretessbedömning

Innehåller patientdata i prod → klass 2. Nu: syntetisk → klass 0.
"""
