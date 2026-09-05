"""
Orkestreringslogik för Smedjans pipeline.
"""
import json
import shutil
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional
from uuid import uuid4

import yaml

from orkestrering.llm_client import LlmClient


class PipelineOrchestrator:
    """Orkestrerar Smedjans pipeline för olika PoC-laster."""
    
    def __init__(self, client: LlmClient, workspace_root: Optional[Path] = None, project_slug: str = "ews"):
        """
        Initialisera orchestrator.
        
        Args:
            client: LLM-klient
            workspace_root: Rot för workspace (default: nuvarande katalog)
            project_slug: Projekt-slug (default: "ews")
        """
        self.client = client
        if workspace_root is None:
            workspace_root = Path.cwd()
        self.workspace_root = Path(workspace_root)
        self.project_slug = project_slug
        self.korningar_dir = self.workspace_root / "korningar" / project_slug
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
    
    def run_demo(self, forslagsspec_content: Optional[str] = None) -> None:
        """
        Kör PoC-demo: steg 0 → 1 → G1 → 2.
        
        Args:
            forslagsspec_content: Innehåll i förslagsspec (eller None för att använda befintlig)
        """
        print(f"=== Smedjan {self.project_slug.upper()} Demo (Etapp 0 - Mock) ===\n")
        
        # Om ingen förslagsspec finns, använd syntetisk
        if forslagsspec_content is None:
            forslagsspec_path = self.korningar_dir / "forslagsspec.md"
            if forslagsspec_path.exists():
                with open(forslagsspec_path) as f:
                    forslagsspec_content = f.read()
            else:
                forslagsspec_content = self._get_default_forslagsspec(self.project_slug)
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
        
        print(f"=== {self.project_slug.upper()} Demo slutförd ===")
        print(f"Artefakter skapade under: {self.korningar_dir}")
        
        # Generera korning.json (endast för EWS än så länge)
        if self.project_slug == "ews":
            print("\n--- Genererar korning.json ---")
            self._generate_korning_json()
            print(f"✓ korning.json skapad: {self.korningar_dir / 'korning.json'}\n")
            
            # Exportera portal-bundle
            print("--- Exporterar portal-bundle ---")
            self._export_portal_data()
            print(f"✓ Portal-bundle exporterad: {self.workspace_root / 'portal' / 'demo' / 'data'}\n")
    
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
artifact_id: mock-g1-{project_slug}-001
grind: G1
decision: godkann
created_by: Mock Demo (Etapp 0)
created_at: {timestamp}
input_refs: []
data_class: 0
schema_version: "1.0"
---

# Grindbeslut G1: {project_slug_upper}-001

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
""".format(
            project_slug=self.project_slug,
            project_slug_upper=self.project_slug.upper(),
            timestamp=datetime.now(timezone.utc).isoformat()
        )
        
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
    
    def _generate_korning_json(self) -> None:
        """Generera korning.json från befintliga artefakter."""
        start_time = datetime.now(timezone.utc)
        korning_id = f"ews-{start_time.strftime('%Y-%m-%dT%H-%M-%S')}Z"
        
        # Läs metadata från artefakter
        steg0_meta = self._load_meta_json(self.korningar_dir / "steg0" / "spec-v1.meta.json")
        steg1_meta = self._load_meta_json(self.korningar_dir / "steg1" / "review-v1.meta.json")
        steg2_meta = self._load_meta_json(self.korningar_dir / "steg2" / "stories-v1.meta.json")
        g1_meta = self._load_meta_json(self.korningar_dir / "G1" / "beslut.meta.json")
        
        # Bygg steg-lista
        steg = [
            {
                "id": "steg0",
                "nummer": 0,
                "namn": "Intag",
                "status": "klar",
                "startad": steg0_meta.get("timestamp", start_time.isoformat()),
                "varaktighet_ms": 12,
                "agent": {
                    "id": "A0",
                    "namn": "Intagsagent",
                    "pool": "A",
                    "familj": "Anthropic",
                    "modell": steg0_meta.get("model", "claude-opus"),
                    "ar_stub": steg0_meta.get("is_stub", True)
                },
                "in": [{"roll": "forslagsspec", "path": "korningar/ews/steg0/input.md"}],
                "ut": [{
                    "typ": "spec",
                    "rubrik": "EWS-001",
                    "path": "korningar/ews/steg0/spec-v1.md",
                    "meta_path": "korningar/ews/steg0/spec-v1.meta.json"
                }],
                "kostnad": {
                    "tokens_in": steg0_meta.get("tokens", 0),
                    "tokens_ut": 0,
                    "usd": steg0_meta.get("cost_usd", 0.0)
                },
                "varv": 1,
                "max_varv": 3
            },
            {
                "id": "steg1",
                "nummer": 1,
                "namn": "Specgranskning",
                "status": "klar",
                "startad": steg1_meta.get("timestamp", start_time.isoformat()),
                "varaktighet_ms": 9,
                "agent": {
                    "id": "A1",
                    "namn": "Specgranskare",
                    "pool": "B",
                    "familj": "OpenAI/Google",
                    "modell": steg1_meta.get("model", "gpt-5.6"),
                    "ar_stub": steg1_meta.get("is_stub", True)
                },
                "in": [{"roll": "spec", "path": "korningar/ews/steg0/spec-v1.md"}],
                "ut": [{
                    "typ": "granskningsrapport",
                    "rubrik": "EWS-001 · spec-v1",
                    "path": "korningar/ews/steg1/review-v1.md",
                    "meta_path": "korningar/ews/steg1/review-v1.meta.json"
                }],
                "kostnad": {
                    "tokens_in": steg1_meta.get("tokens", 0),
                    "tokens_ut": 0,
                    "usd": steg1_meta.get("cost_usd", 0.0)
                },
                "varv": 1,
                "max_varv": 3
            },
            {
                "id": "steg2",
                "nummer": 2,
                "namn": "Nedbrytning",
                "status": "klar",
                "startad": steg2_meta.get("timestamp", start_time.isoformat()),
                "varaktighet_ms": 21,
                "agent": {
                    "id": "A2",
                    "namn": "Nedbrytare",
                    "pool": "C",
                    "familj": "öppna vikter",
                    "modell": steg2_meta.get("model", "deepseek-v4"),
                    "ar_stub": steg2_meta.get("is_stub", True)
                },
                "granskare": {
                    "id": "A3",
                    "namn": "Storygranskare",
                    "pool": "B",
                    "familj": "OpenAI/Google",
                    "modell": "gemini-3.7",
                    "ar_stub": True,
                    "varaktighet_ms": 14,
                    "ut": {"typ": "tackningsmatris", "path": "korningar/ews/steg2/tackning.md"}
                },
                "in": [{"roll": "spec", "path": "korningar/ews/steg0/spec-v1.md"}],
                "ut": [{
                    "typ": "stories",
                    "rubrik": "EWS-001",
                    "path": "korningar/ews/steg2/stories-v1.yaml",
                    "meta_path": "korningar/ews/steg2/stories-v1.meta.json"
                }],
                "kostnad": {
                    "tokens_in": steg2_meta.get("tokens", 0),
                    "tokens_ut": 0,
                    "usd": steg2_meta.get("cost_usd", 0.0)
                },
                "varv": 1,
                "max_varv": 3
            }
        ]
        
        # Bygg grindar
        grindar = [
            {
                "id": "G1",
                "namn": "Specgodkännande",
                "efter_steg": 1,
                "status": "godkand_med_villkor",
                "ar_mock": True,
                "beslutsfattare": "Mock Demo (Etapp 0)",
                "tidpunkt": g1_meta.get("timestamp", start_time.isoformat()),
                "path": "korningar/ews/G1/beslut.md",
                "rekommendation": {
                    "fran_agent": "A1",
                    "beslut": "godkann_med_villkor",
                    "citat": "Godkänn med villkor: F1 och F2 åtgärdas före nedbrytning.",
                    "villkor": [
                        "Lägg till felhantering-sektion i specen",
                        "Verifiera och referera Philips API-dokumentation"
                    ]
                },
                "underlag": [
                    {"path": "korningar/ews/steg0/spec-v1.md", "version": "1.0"},
                    {"path": "korningar/ews/steg1/review-v1.md", "version": "1.0"}
                ],
                "historik": [
                    "Underlag sammanställt (A1 klar)",
                    "Rekommendation: godkänn med villkor",
                    "Beslut registrerat i Git (förifyllt för demo)"
                ]
            },
            {
                "id": "G2",
                "namn": "Backloggodkännande",
                "efter_steg": 2,
                "status": "vantar",
                "ar_mock": True,
                "beslutsfattare": None,
                "tidpunkt": None,
                "path": None,
                "rekommendation": None,
                "underlag": [],
                "historik": []
            },
            {
                "id": "G3",
                "namn": "QA-godkännande",
                "efter_steg": 8,
                "status": "ej_nadd",
                "ar_mock": True,
                "rekommendation": None,
                "underlag": [],
                "historik": []
            },
            {
                "id": "G4",
                "namn": "Produktionsgodkännande",
                "efter_steg": 9,
                "status": "ej_nadd",
                "ar_mock": True,
                "rekommendation": None,
                "underlag": [],
                "historik": []
            }
        ]
        
        # Extrahera stories från YAML
        stories = self._extract_stories()
        
        # Separation
        separation = [
            {
                "regel": "S1",
                "text": "Ingen granskar sig själv",
                "galler": ["A0", "A1"],
                "pooler": "pool A → pool B",
                "familjer": "Anthropic → OpenAI/Google",
                "uppfylld": True,
                "motivering": "olika pooler"
            },
            {
                "regel": "S1",
                "text": "Ingen granskar sig själv",
                "galler": ["A2", "A3"],
                "pooler": "pool C → pool B",
                "familjer": "öppna vikter → OpenAI/Google",
                "uppfylld": True,
                "motivering": "olika pooler"
            },
            {
                "regel": "S2",
                "text": "Kontextseparation",
                "galler": ["steg 1"],
                "pooler": "—",
                "familjer": "—",
                "uppfylld": True,
                "motivering": "granskaren fick spec-v1.md och dess referenser, ingen sessionslogg"
            },
            {
                "regel": "S3",
                "text": "Skrivseparation",
                "galler": ["A0", "A1", "A2", "A3"],
                "pooler": "—",
                "familjer": "—",
                "uppfylld": True,
                "motivering": "endast tillåtna artefakttyper skrivna"
            },
            {
                "regel": "S4",
                "text": "Proveniens",
                "galler": ["alla artefakter"],
                "pooler": "—",
                "familjer": "—",
                "uppfylld": True,
                "motivering": "proveniens finns i .meta.json för alla fyra artefakter"
            },
            {
                "regel": "S5",
                "text": "Mänsklig eskalering",
                "galler": ["steg 0–2"],
                "pooler": "—",
                "familjer": "—",
                "uppfylld": True,
                "motivering": "1 varv av max 3 i varje steg"
            },
            {
                "regel": "S6",
                "text": "Ingen tyst degradering",
                "galler": ["alla steg"],
                "pooler": "—",
                "familjer": "—",
                "uppfylld": None,
                "motivering": "mockad motor, ingen modell begärdes"
            }
        ]
        
        # Framtida steg
        framtida_steg = [
            {"nummer": 3, "namn": "Kodning", "status": "vantar"},
            {"nummer": 4, "namn": "Enhetstester", "status": "vantar"},
            {"nummer": 5, "namn": "Integrationstester", "status": "vantar"},
            {"nummer": 6, "namn": "Testdeploy", "status": "vantar"},
            {"nummer": 7, "namn": "Test av testdeploy", "status": "vantar"},
            {"nummer": 8, "namn": "Utfall & triage", "status": "vantar"},
            {"nummer": 9, "namn": "QA & integration", "status": "vantar"},
            {"nummer": 10, "namn": "Produktionsdeploy", "status": "vantar"},
            {"nummer": 11, "namn": "Övervakning & förbättring", "status": "vantar"}
        ]
        
        # Bygg huvudstruktur
        korning = {
            "schema_version": "1.0",
            "korning_id": korning_id,
            "projekt": "ews",
            "titel": "EWS: Philips vitals → NEWS2 → Datahubb",
            "dataklass": 0,
            "backend": "mock",
            "ar_mock": True,
            "startad": start_time.isoformat(),
            "avslutad": start_time.isoformat(),
            "varaktighet": "~1 s",
            "status": "klar",
            "kostnad": {"tokens_in": 0, "tokens_ut": 0, "usd": 0.0},
            "steg_klara": "0–2",
            "steg": steg,
            "grindar": grindar,
            "separation": separation,
            "stories": stories,
            "framtida_steg": framtida_steg
        }
        
        # Skriv korning.json
        korning_json_path = self.korningar_dir / "korning.json"
        with open(korning_json_path, "w", encoding="utf-8") as f:
            json.dump(korning, f, indent=2, ensure_ascii=False)
    
    def _load_meta_json(self, path: Path) -> Dict[str, Any]:
        """Ladda metadata-JSON, returnera tom dict om filen inte finns."""
        if not path.exists():
            return {}
        with open(path, encoding="utf-8") as f:
            return json.load(f)
    
    def _extract_stories(self) -> List[Dict[str, Any]]:
        """Extrahera stories från YAML-fil."""
        stories_yaml_path = self.korningar_dir / "steg2" / "stories-v1.yaml"
        if not stories_yaml_path.exists():
            return []
        
        # Läs YAML frontmatter och innehåll
        # För nu, returnera hårdkodade stories baserat på kända filer
        stories = []
        story_files = [
            "story-EWS-001.1.md",
            "story-EWS-001.2.md",
            "story-EWS-001.3.md",
            "story-EWS-001.4.md",
            "story-EWS-001.5.md"
        ]
        
        story_data = [
            {"id": "EWS-001.1", "titel": "Hämta vitals från Philips-system", "uppskattning": "M", "beroenden": []},
            {"id": "EWS-001.2", "titel": "Normalisera MDC-koder till openEHR-arketyper", "uppskattning": "M", "beroenden": ["EWS-001.1"]},
            {"id": "EWS-001.3", "titel": "Beräkna NEWS2 per mätpunkt", "uppskattning": "L", "beroenden": ["EWS-001.2"]},
            {"id": "EWS-001.4", "titel": "Publicera vitals.aggregated med versionerat schema", "uppskattning": "M", "beroenden": ["EWS-001.3"]},
            {"id": "EWS-001.5", "titel": "Lagra råsignal i tidsserie", "uppskattning": "S", "beroenden": ["EWS-001.1"]}
        ]
        
        for i, story_file in enumerate(story_files):
            story_path = self.korningar_dir / "steg2" / story_file
            if story_path.exists():
                stories.append({
                    "id": story_data[i]["id"],
                    "titel": story_data[i]["titel"],
                    "uppskattning": story_data[i]["uppskattning"],
                    "beroenden": story_data[i]["beroenden"],
                    "spec_krav": f"K{i+1}",
                    "dataklass": 0,
                    "status": "todo",
                    "path": f"korningar/ews/steg2/{story_file}"
                })
        
        return stories
    
    def _export_portal_data(self) -> None:
        """Exportera portal-bundle till portal/demo/data/."""
        portal_data_dir = self.workspace_root / "portal" / "demo" / "data"
        portal_artifacts_dir = portal_data_dir / "artifacts"
        
        # Skapa directories
        portal_data_dir.mkdir(parents=True, exist_ok=True)
        portal_artifacts_dir.mkdir(parents=True, exist_ok=True)
        
        # Kopiera korning.json
        source_korning = self.korningar_dir / "korning.json"
        dest_korning = portal_data_dir / "korning.json"
        shutil.copy2(source_korning, dest_korning)
        
        # Kopiera artefakter (md, yaml, meta.json)
        artifacts_to_copy = [
            "steg0/spec-v1.md",
            "steg0/spec-v1.meta.json",
            "steg0/input.md",
            "steg1/review-v1.md",
            "steg1/review-v1.meta.json",
            "steg1/input.md",
            "steg2/stories-v1.yaml",
            "steg2/stories-v1.meta.json",
            "steg2/story-EWS-001.1.md",
            "steg2/story-EWS-001.1.meta.json",
            "steg2/story-EWS-001.2.md",
            "steg2/story-EWS-001.2.meta.json",
            "steg2/story-EWS-001.3.md",
            "steg2/story-EWS-001.3.meta.json",
            "steg2/story-EWS-001.4.md",
            "steg2/story-EWS-001.4.meta.json",
            "steg2/story-EWS-001.5.md",
            "steg2/story-EWS-001.5.meta.json",
            "G1/beslut.md",
            "G1/beslut.meta.json",
            "forslagsspec.md"
        ]
        
        for artifact_rel_path in artifacts_to_copy:
            source_path = self.korningar_dir / artifact_rel_path
            if source_path.exists():
                dest_path = portal_artifacts_dir / artifact_rel_path
                dest_path.parent.mkdir(parents=True, exist_ok=True)
                shutil.copy2(source_path, dest_path)
        
        # Uppdatera paths i kopierade korning.json
        with open(dest_korning, "r", encoding="utf-8") as f:
            korning_data = json.load(f)
        
        # Omskriv paths till portal-relativa
        self._rewrite_paths_for_portal(korning_data)
        
        with open(dest_korning, "w", encoding="utf-8") as f:
            json.dump(korning_data, f, indent=2, ensure_ascii=False)
    
    def _rewrite_paths_for_portal(self, data: Any) -> None:
        """Omskriv paths från 'korningar/ews/...' till 'data/artifacts/...'."""
        if isinstance(data, dict):
            for key, value in data.items():
                if key == "path" and isinstance(value, str) and value.startswith("korningar/ews/"):
                    # Omskriv path
                    rel_path = value.replace("korningar/ews/", "")
                    data[key] = f"data/artifacts/{rel_path}"
                elif key == "meta_path" and isinstance(value, str) and value.startswith("korningar/ews/"):
                    rel_path = value.replace("korningar/ews/", "")
                    data[key] = f"data/artifacts/{rel_path}"
                else:
                    self._rewrite_paths_for_portal(value)
        elif isinstance(data, list):
            for item in data:
                self._rewrite_paths_for_portal(item)
    
    def run_ews_demo(self, forslagsspec_content: Optional[str] = None) -> None:
        """
        Kör EWS-demo: steg 0 → 1 → G1 → 2.
        Kompatibilitetsmetod som anropar run_demo() med project_slug="ews".
        
        Args:
            forslagsspec_content: Innehåll i förslagsspec (eller None för att använda befintlig)
        """
        # Säkerställ att project_slug är "ews"
        if self.project_slug != "ews":
            # Skapa ny orchestrator med rätt projekt
            ews_orchestrator = PipelineOrchestrator(
                self.client,
                self.workspace_root,
                project_slug="ews"
            )
            ews_orchestrator.run_demo(forslagsspec_content)
        else:
            self.run_demo(forslagsspec_content)
    
    def _get_default_forslagsspec(self, project_slug: str) -> str:
        """Returnera syntetisk förslagsspec baserat på projekt-slug."""
        if project_slug == "ews":
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
        elif project_slug == "patientoversikt":
            return """# Förslagsspec: Patientöversikt

## Beskrivning

Vi vill skapa en patientöversikt som aggregerar data från flera källor (Cosmic, Pascal, journalsystem) och presenterar en enhetlig vy av patientens aktuella status, mediciner, diagnoser och planerade åtgärder.

## Användarnytta

Vårdpersonal får snabb tillgång till relevant patientinformation från olika system på en plats, vilket minskar risk för felbehandling och ökar effektiviteten.

## Funktionella krav

1. Hämta patientdata från Cosmic (mediciner), Pascal (lab-värden), och journalsystem (diagnoser, vårdkontakter)
2. Aggregera och presentera data i enhetlig vy
3. Visa senaste lab-värden med avvikelser markerade
4. Visa aktiv medicinlista med dosering
5. Visa aktiva diagnoser med ICD-10-koder
6. Exponera API för patientöversikt (JSON)

## Tekniska begränsningar

- Integration via REST API mot alla tre system
- Data ska cachas max 5 minuter
- Autentisering via VGR SITHS
- Response-tid max 2 sekunder

## Dataklass

Klass 0 för etapp 0 (syntetisk testdata). Framtida klass 2 i produktion (riktig patientdata).

## Sekretessbedömning

Innehåller patientdata i prod → klass 2. Nu: syntetisk → klass 0.
"""
        elif project_slug == "axel-fhir":
            return """# Förslagsspec: Axel FHIR-integration

## Beskrivning

Vi vill integrera med Axel (nationell infrastruktur för informationsutbyte) för att kunna hämta och skicka FHIR-resurser mellan vårdgivare. Första versionen fokuserar på att hämta patientsammanfattningar (Patient Summary).

## Användarnytta

Vårdgivare kan hämta journalinformation från andra vårdgivare via Axel när patienten ger samtycke, vilket ger bättre beslutsunderlag vid vård.

## Funktionella krav

1. Autentisera mot Axel med SITHS-kort (HSA-id)
2. Söka patient via personnummer
3. Hämta Patient Summary (IPS - International Patient Summary) i FHIR-format
4. Validera FHIR-resurser mot svensk profil
5. Logga alla åtkomster för spårbarhet
6. Exponera API för patientsammanfattning

## Tekniska begränsningar

- Axel använder FHIR R4 (svensk profil)
- Autentisering via SITHS + OAuth2
- PDL-loggning krävs för alla åtkomster
- Max 10 sekunders timeout mot Axel
- Kräver samtycke från patient (kontrolleras via API)

## Dataklass

Klass 0 för etapp 0 (syntetisk testdata, mockat Axel-API). Framtida klass 2 i produktion (riktig patientdata via Axel).

## Sekretessbedömning

Innehåller patientdata i prod → klass 2. Nu: syntetisk → klass 0.
"""
        else:
            raise ValueError(f"Okänt projekt: {project_slug}")
