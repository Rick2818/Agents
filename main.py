"""
Main Entrypoint for MCP Agent Generator.
Supports:
1. Standard MCP Server mode over stdio (default)
2. Interactive Demo mode (--demo)
3. CLI Generation mode (--cli)
"""

import sys
import argparse
import json

# Ensure UTF-8 output encoding across Windows consoles
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

from mcp_generator.server import mcp, run_server
from mcp_generator.agents.orchestrator import OrchestratorAgent
from mcp_generator.profiles import registry


def run_demo():
    """Runs a complete end-to-end demonstration of the multi-agent generator."""
    print("=" * 70)
    print("🚀 MCP AGENT GENERATOR - AUTONOMOUS MULTI-AGENT PROTOTYPE DEMO")
    print("=" * 70)

    sample_idea = (
        "Plataforma de suscripción de café de especialidad B2B con gestión autónoma de inventario, "
        "detección preventiva de pagos fraudulentos, y atención automatizada de incidencias en entregas."
    )
    industry = "ecommerce"

    print(f"\n💡 IDEA DE NEGOCIO RECIBIDA:\n   \"{sample_idea}\"")
    print(f"🏷️  PERFIL SECTORIAL SELECCIONADO: {industry.upper()}")

    orchestrator = OrchestratorAgent()

    print("\n--- [FASE 1: EJECUCIÓN DEL PIPELINE MULTI-AGENTE] ---")
    print("1. [Orquestador -> DomainMinerAgent]: Extrayendo entidades, dolores y requerimientos...")
    print("2. [Orquestador -> TopologyDesignerAgent]: Diseñando topología de agentes y canales...")
    print("3. [Orquestador -> ToolSynthesizerAgent]: Sintetizando herramientas y servidores MCP...")
    print("4. [Orquestador -> PackageBuilderAgent]: Generando artefactos para Google Antigravity...")

    spec = orchestrator.synthesize_agent_system(sample_idea, industry)

    print("\n✅ ESPECIFICACIÓN TÉCNICA GENERADA CON ÉXITO")
    print(f"   • Dominio Identificado: {spec.domain_analysis.domain_name}")
    print(f"   • Puntos de Dolor Identificados: {len(spec.domain_analysis.pain_points)}")
    for p in spec.domain_analysis.pain_points:
        print(f"     - [{p.severity.upper()}] {p.title}: {p.automation_opportunity}")

    print(f"\n👥 EQUIPO MULTI-AGENTE DISEÑADO ({len(spec.topology.agents)} Agentes):")
    for agent in spec.topology.agents:
        role_tag = "MASTER ORCHESTRATOR" if agent.is_orchestrator else "SUBAGENT"
        tools_list = ", ".join([t.name for t in agent.assigned_tools]) or "Reasoning only"
        print(f"   • [{role_tag}] {agent.name} (`{agent.agent_id}`)")
        print(f"     - Herramientas: {tools_list}")
        if agent.subagents:
            print(f"     - Subagentes gestionados: {', '.join(agent.subagents)}")

    print(f"\n🔌 SERVIDORES MCP REQUERIDOS ({len(spec.mcp_servers)}):")
    for s in spec.mcp_servers:
        print(f"   • {s.name}: {s.description} -> Herramientas: {', '.join(s.tools)}")

    print("\n--- [FASE 2: SIMULACIÓN DE FLUJO INTER-AGENTE] ---")
    sample_trigger = "Alerta: Pedido #9821 recibido con discrepancia de stock y riesgo de fraude medio."
    print(f"🎯 Evento Disparador: \"{sample_trigger}\"\n")

    simulation = orchestrator.simulate_workflow(spec, sample_trigger)
    for step in simulation["transcript"]:
        print(f"   [Paso {step['step']}] {step['sender']} -> {step['recipient']} | Acción: {step['action']}")
        print(f"            Contenido: {step['content']}")

    print("\n--- [FASE 3: EXPORTACIÓN DE ARTEFACTOS ANTIGRAVITY] ---")
    output_dir = "./dist/antigravity_sample_workspace"
    exported_files = orchestrator.export_to_filesystem(spec, output_dir)
    print(f"📁 Artefactos exportados en: {output_dir}")
    for file_path in exported_files:
        print(f"   📄 {file_path}")

    print("\n" + "=" * 70)
    print("✨ DEMOSTRACIÓN FINALIZADA SATISFACTORIAMENTE")
    print("=" * 70)


def run_cli_mode(args):
    """Executes single generation command via CLI."""
    orchestrator = OrchestratorAgent()
    idea = args.pain if args.pain else args.idea
    spec = orchestrator.synthesize_agent_system(
        business_idea=idea,
        profile_id=args.industry,
        ai_model=args.model,
        unsolved_pain=args.pain
    )

    if args.export:
        exported = orchestrator.export_to_filesystem(spec, args.export)
        print(f"✅ Agente generado con {args.model} y exportado a: {args.export} ({len(exported)} archivos)")
        for p in exported:
            print(f"   • {p}")
    else:
        print(json.dumps(spec.model_dump(), indent=2, ensure_ascii=False))


def run_ui_mode():
    """Opens the minimalist Custom Agent Studio in the default web browser."""
    import webbrowser
    import os
    dashboard_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "dashboard.html"))
    print(f"🌐 Abriendo Plataforma Minimalista en el navegador: file://{dashboard_path}")
    webbrowser.open(f"file://{dashboard_path}")


def run_serve_mode(port: int = 8765):
    """Runs a lightweight local web server with API for direct workspace saving."""
    import http.server
    import socketserver
    import urllib.parse
    import os
    import json

    orchestrator = OrchestratorAgent()

    class Handler(http.server.SimpleHTTPRequestHandler):
        def do_POST(self):
            parsed_path = urllib.parse.urlparse(self.path)
            content_length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(content_length).decode("utf-8") if content_length > 0 else "{}"
            try:
                data = json.loads(body)
            except Exception:
                data = {}

            if parsed_path.path == "/api/generate":
                pain = data.get("pain", data.get("idea", "Optimización de procesos operativos"))
                industry = data.get("industry", "generic")
                model = data.get("model", "gemini-2.5-flash")
                spec = orchestrator.synthesize_agent_system(
                    business_idea=pain,
                    profile_id=industry,
                    ai_model=model,
                    unsolved_pain=pain
                )
                self.send_response(200)
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                self.wfile.write(json.dumps(spec.model_dump(), ensure_ascii=False).encode("utf-8"))

            elif parsed_path.path == "/api/save_workspace":
                target_dir = data.get("target_dir", ".")
                files = data.get("files", [])
                saved_paths = []
                for f in files:
                    rel_path = f.get("path", "")
                    content = f.get("content", "")
                    if rel_path:
                        full_p = os.path.join(target_dir, rel_path.replace("/", os.sep))
                        os.makedirs(os.path.dirname(full_p), exist_ok=True)
                        with open(full_p, "w", encoding="utf-8") as out:
                            out.write(content)
                        saved_paths.append(full_p)

                self.send_response(200)
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                self.wfile.write(json.dumps({"status": "SUCCESS", "saved": saved_paths}).encode("utf-8"))
            else:
                self.send_response(404)
                self.end_headers()

        def do_OPTIONS(self):
            self.send_response(200)
            self.send_header("Access-Control-Allow-Origin", "*")
            self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
            self.send_header("Access-Control-Allow-Headers", "Content-Type")
            self.end_headers()

    print(f"🚀 Servidor local iniciado en http://localhost:{port}")
    print(f"📂 Sirviendo archivos estáticos y API de generación...")
    import webbrowser
    webbrowser.open(f"http://localhost:{port}/dashboard.html")
    with socketserver.TCPServer(("", port), Handler) as httpd:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n🛑 Servidor detenido.")


def main():
    parser = argparse.ArgumentParser(description="Creador de Agentes con Gemini Flash 2.5 para Google Antigravity")
    parser.add_argument("--demo", action="store_true", help="Ejecutar demo interactiva")
    parser.add_argument("--ui", action="store_true", help="Abrir la plataforma web minimalista en el navegador")
    parser.add_argument("--serve", action="store_true", help="Iniciar servidor local con API REST en el puerto 8765")
    parser.add_argument("--cli", action="store_true", help="Modo generación por terminal")
    parser.add_argument("--pain", type=str, default=None, help="Descripción del dolor o problema no resuelto del cliente")
    parser.add_argument("--idea", type=str, default="Automatización de soporte técnico y retención de clientes.", help="Idea de negocio o dolor")
    parser.add_argument("--industry", type=str, default="generic", help="Perfil sectorial (generic, ecommerce, fintech)")
    parser.add_argument("--model", type=str, default="gemini-2.5-flash", help="Modelo de IA a utilizar (por defecto: gemini-2.5-flash)")
    parser.add_argument("--export", type=str, default=None, help="Directorio destino para escribir los archivos .agents")
    parser.add_argument("--server", action="store_true", help="Iniciar servidor MCP sobre stdio")

    args = parser.parse_args()

    if args.serve:
        run_serve_mode()
    elif args.ui:
        run_ui_mode()
    elif args.demo:
        run_demo()
    elif args.cli or args.pain:
        run_cli_mode(args)
    else:
        # Modo por defecto sin argumentos: MCP Server sobre stdio
        run_server()


if __name__ == "__main__":
    main()
