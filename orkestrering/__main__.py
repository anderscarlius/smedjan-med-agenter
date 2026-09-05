"""
Smedjan CLI - Kommandoradsgränssnitt för Smedjan-orkestrering.
"""
import sys
from pathlib import Path

from orkestrering.llm_client import LlmClient
from orkestrering.orchestrator import PipelineOrchestrator


def main():
    """Huvudfunktion för CLI."""
    if len(sys.argv) < 2:
        print("Användning: python -m orkestrering <kommando>")
        print("Kommandon:")
        print("  demo ews    Kör EWS-demo (steg 0-2)")
        sys.exit(1)
    
    command = sys.argv[1]
    
    if command == "demo":
        if len(sys.argv) < 3:
            print("Användning: python -m orkestrering demo <projekt>")
            print("Tillgängliga projekt: ews")
            sys.exit(1)
        
        projekt = sys.argv[2]
        
        if projekt == "ews":
            run_ews_demo()
        else:
            print(f"Okänt projekt: {projekt}")
            print("Tillgängliga projekt: ews")
            sys.exit(1)
    else:
        print(f"Okänt kommando: {command}")
        print("Tillgängliga kommandon: demo")
        sys.exit(1)


def run_ews_demo():
    """Kör EWS-demo."""
    import os
    
    workspace_root = Path.cwd()
    
    # Automatisk backend-val: OpenRouter om nyckel finns, annars mock
    api_key = os.getenv("OPENROUTER_API_KEY")
    
    if api_key:
        print("🔑 OPENROUTER_API_KEY hittad, använder OpenRouter API")
        backend = "openrouter"
    else:
        print("📦 Ingen OPENROUTER_API_KEY, använder mock-backend (offline)")
        backend = "mock"
    
    # Skapa LLM-klient
    client = LlmClient(backend=backend, api_key=api_key)
    
    # Skapa orchestrator
    orchestrator = PipelineOrchestrator(client, workspace_root)
    
    # Kör demo
    try:
        orchestrator.run_ews_demo()
    except Exception as e:
        print(f"\nFel vid körning av EWS-demo: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
