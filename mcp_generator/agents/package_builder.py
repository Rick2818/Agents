"""
Antigravity Package Builder Subagent.
Compiles the multi-agent topology, tools, and domain model into ready-to-run
Google Antigravity workspace artifacts (.agents/rules/AGENTS.md, skills/, mcp_config.json).
"""

from typing import Dict, Any, List
import json
from mcp_generator.agents.base import BaseAgent
from mcp_generator.communication import MessageBus
from mcp_generator.models import (
    FullAgentSpecification, DomainAnalysis, AgentTopology, MCPServerSpec, AntigravityFile
)


class PackageBuilderAgent(BaseAgent):
    """
    Subagent that writes deployable Antigravity configuration files,
    skills, rules, and documentation.
    """

    def __init__(self, message_bus: MessageBus):
        super().__init__(
            agent_id="agent-package-builder",
            name="Antigravity Package Builder",
            role="Antigravity Workspace & Custom Agent Artifact Compiler",
            message_bus=message_bus
        )

    def process_task(self, task_payload: Dict[str, Any]) -> Dict[str, Any]:
        idea = task_payload.get("business_idea", "")
        industry_profile = task_payload.get("profile_id", "generic")
        domain_analysis = DomainAnalysis(**task_payload.get("domain_analysis", {}))
        topology = AgentTopology(**task_payload.get("topology", {}))
        mcp_servers = [MCPServerSpec(**s) for s in task_payload.get("mcp_servers", [])]

        artifacts = self._compile_artifacts(idea, industry_profile, domain_analysis, topology, mcp_servers)

        # Build simulation scenarios
        sim_scenarios = [
            {
                "scenario_id": "sim-01-standard-flow",
                "title": f"Standard {domain_analysis.domain_name} Request Fulfillment",
                "input_trigger": f"New incoming request requiring triage and execution in {domain_analysis.domain_name}.",
                "expected_path": [topology.orchestrator_id] + [a.agent_id for a in topology.agents if not a.is_orchestrator] + [topology.orchestrator_id]
            },
            {
                "scenario_id": "sim-02-anomaly-escalation",
                "title": "Anomaly & Policy Breach Escalation",
                "input_trigger": "High-risk transaction detected exceeding tolerance thresholds.",
                "expected_path": [topology.orchestrator_id, topology.agents[-1].agent_id, topology.orchestrator_id]
            }
        ]

        full_spec = FullAgentSpecification(
            business_idea=idea,
            industry_profile=industry_profile,
            domain_analysis=domain_analysis,
            topology=topology,
            mcp_servers=mcp_servers,
            antigravity_artifacts=artifacts,
            simulation_scenarios=sim_scenarios
        )

        return {
            "specification": full_spec.model_dump(),
            "artifacts_count": len(artifacts)
        }

    def _compile_artifacts(
        self,
        idea: str,
        industry: str,
        domain: DomainAnalysis,
        topology: AgentTopology,
        mcp_servers: List[MCPServerSpec]
    ) -> List[AntigravityFile]:
        files: List[AntigravityFile] = []

        # 1. Custom Agent Profiles: .agents/agents/<slug>.md
        for agent in topology.agents:
            slug = agent.agent_id.replace("subagent-", "").replace("agent-", "")
            is_sub = not agent.is_orchestrator
            agent_md_content = (
                f"---\n"
                f"name: {slug}\n"
                f"description: {agent.role}. Diseñado específicamente para resolver dolores en {domain.domain_name} utilizando Gemini Flash 2.5.\n"
                f"model: {getattr(agent, 'model', 'gemini-2.5-flash')}\n"
                f"subagent: {str(is_sub).lower()}\n"
                f"inheritCustomizations: true\n"
                f"---\n\n"
                f"# {agent.name} — ({agent.role})\n\n"
                f"{agent.system_prompt}\n\n"
                f"---\n\n"
                f"## 🎯 Misión Ejecutiva y Operativa\n"
                f"1. **Resolución Directa del Dolor:** Resolver de forma autónoma y sin fricción los cuellos de botella del negocio.\n"
                f"2. **Velocidad y Precisión con Gemini Flash 2.5:** Respuestas ultrarrápidas, análisis fiduciario en milisegundos y cero consumo redundante.\n"
                f"3. **Gobernanza Inmutable:** Ninguna operación de riesgo o borrado de datos se ejecuta sin validación previa.\n\n"
                f"---\n\n"
                f"## 🛡️ Reglas Inmutables y de Gobernanza\n"
                f"> **REGLA 1 — CERO SIMULACIÓN (MODO REAL INMUTABLE):** Operación en producción real, cero mocks o datos falsificados.\n"
                f">\n"
                f"> **REGLA 2 — SÍNTESIS EJECUTIVA (REDUCCIÓN DEL 50%):** Comunicación concisa, directa al grano y con viñetas accionables.\n"
                f">\n"
                f"> **REGLA 3 — AUDITORÍA Y TRAZABILIDAD:** Cada acción, resultado o decisión queda registrada en la bitácora fiduciaria.\n\n"
                f"---\n\n"
                f"## ⚙️ Áreas de Dominio Técnico y Herramientas\n"
            )
            if agent.assigned_tools:
                for t in agent.assigned_tools:
                    agent_md_content += f"- **`{t.name}`**: {t.description} (Nivel: `{t.access_tier}`)\n"
            else:
                agent_md_content += "- *Opera principalmente mediante razonamiento fiduciario, análisis de datos y despacho de directivas.*\n"

            files.append(
                AntigravityFile(
                    path=f".agents/agents/{slug}.md",
                    content=agent_md_content,
                    file_type="agent"
                )
            )

        # 2. Operating Rules: .agents/rules/
        rules_content = (
            f"# {domain.domain_name} - Multi-Agent Operating Rules\n\n"
            f"> Sistema auto-generado con Gemini Flash 2.5 para Google Antigravity.\n"
            f"> Dominio Objetivo: {domain.domain_name} ({industry})\n\n"
            f"## Arquitectura del Sistema & Directivas de Orquestación\n\n"
            f"Este entorno de trabajo está gobernado por una topología multi-agente centrada en "
            f"**{topology.agents[0].name}** (`{topology.orchestrator_id}`) y agentes especializados.\n\n"
            f"### Agentes Activos en este Entorno:\n"
        )
        for agent in topology.agents:
            agent_type = "Master Orchestrator" if agent.is_orchestrator else "Especialista"
            rules_content += f"- **{agent.name}** (`{agent.agent_id}`) [{agent_type}]: {agent.role}\n"

        rules_content += (
            f"\n## Invariantes de Comunicación Inter-Agente:\n"
            f"1. **Delegación de Tareas**: El orquestador delega tareas con contratos estructurados.\n"
            f"2. **Principio de Menor Privilegio**: Cada agente sólo accede a sus herramientas autorizadas.\n"
            f"3. **Human Gate**: Operaciones críticas requieren confirmación explícita.\n"
            f"4. **Trazabilidad Inmutable**: Toda interacción se escribe en el transcript fiduciario.\n\n"
            f"## Dolores Operativos Mitigados:\n"
        )
        for p in domain.pain_points:
            rules_content += f"- **{p.title}** ({p.severity.upper()}): {p.description} -> *{p.automation_opportunity}*\n"

        files.append(
            AntigravityFile(
                path=".agents/rules/AGENTS.md",
                content=rules_content,
                file_type="rule"
            )
        )

        # Zero simulation rule
        zero_sim_rule = (
            f"# 🛡️ Regla de Oro Inmutable: Cero Simulación y Operación en Modo Real\n\n"
            f"## Directiva Fiduciaria Obligatoria:\n"
            f"Queda estrictamente prohibido el uso de clientes sintéticos, llamadas falsas, mocks o simulaciones.\n\n"
            f"1. **CERO CLIENTES SINTÉTICOS:** Todos los leads, órdenes o registros deben provenir de fuentes verificables.\n"
            f"2. **CERO ENTREGAS FINGIDAS:** Cada acción debe contar con un identificador de transacción verificable.\n"
            f"3. **CERO MODO SIMULACIÓN:** Erradicación total de `dryRun` o mocks sin autorización explícita.\n"
        )
        files.append(
            AntigravityFile(
                path=".agents/rules/cero_simulacion_modo_real_inmutable.md",
                content=zero_sim_rule,
                file_type="rule"
            )
        )

        # Executive brevity rule
        brevity_rule = (
            f"# 🛡️ Regla de Oro Inmutable: Síntesis Ejecutiva y Reducción del 50% en Respuestas\n\n"
            f"## Directiva Obligatoria Universal:\n"
            f"Todas las respuestas, análisis e informes emitidos por los agentes deben aplicar la reducción de longitud al 50%:\n\n"
            f"1. **Longitud:** Reducir la extensión de cada respuesta a la mitad sin perder valor.\n"
            f"2. **Legibilidad Inmediata:** Estructura en viñetas directas y cifras accionables.\n"
            f"3. **Cero Relleno Técnico:** Evitar preámbulos teóricos innecesarios.\n"
        )
        files.append(
            AntigravityFile(
                path=".agents/rules/executive_communication_brevity_rule.md",
                content=brevity_rule,
                file_type="rule"
            )
        )

        # 3. Knowledge Base: .agents/knowledge/
        knowledge_content = (
            f"# Diagnóstico de Negocio y Plan Operativo — {domain.domain_name}\n\n"
            f"## 📋 Dolor Principal Planteado\n"
            f"{idea}\n\n"
            f"## 🎯 Resumen Ejecutivo de la Solución\n"
            f"{domain.executive_summary}\n\n"
            f"## 👥 Usuarios y Stakeholders Afectados\n"
        )
        for u in domain.target_users:
            knowledge_content += f"- {u}\n"

        knowledge_content += f"\n## ⚠️ Dolores Específicos Identificados\n"
        for p in domain.pain_points:
            knowledge_content += f"### {p.title} (Prioridad: {p.severity.upper()})\n- **Causa:** {p.description}\n- **Oportunidad de Automatización:** {p.automation_opportunity}\n\n"

        files.append(
            AntigravityFile(
                path=".agents/knowledge/corporate_pain_diagnostic.md",
                content=knowledge_content,
                file_type="knowledge"
            )
        )

        # 4. Skills: .agents/skills/<subagent_name>/SKILL.md
        for agent in topology.agents:
            if agent.is_orchestrator:
                continue

            slug = agent.agent_id.replace("subagent-", "").replace("agent-", "")
            skill_path = f".agents/skills/{slug}/SKILL.md"

            tools_summary = "\n".join([f"- `{t.name}`: {t.description} (Acceso: {t.access_tier})" for t in agent.assigned_tools])
            skill_content = (
                f"---\n"
                f"name: {slug}\n"
                f"description: Habilidad operativa para {agent.name}. {agent.role}.\n"
                f"---\n\n"
                f"# Skill: {agent.name}\n\n"
                f"{agent.system_prompt}\n\n"
                f"## Herramientas Asignadas:\n"
                f"{tools_summary if tools_summary else 'Opera mediante razonamiento guiado y despacho de mensajes.'}\n\n"
                f"## Contrato Operativo:\n"
                f"- **Agente Coordinador**: `{topology.orchestrator_id}`\n"
                f"- **Eventos Suscritos**: {', '.join(agent.subscribed_events)}\n"
            )

            files.append(
                AntigravityFile(
                    path=skill_path,
                    content=skill_content,
                    file_type="skill"
                )
            )

        # 5. MCP Config: .agents/mcp_config.json
        mcp_dict: Dict[str, Any] = {"mcpServers": {}}
        for server in mcp_servers:
            mcp_dict["mcpServers"][server.name] = {
                "command": server.command,
                "args": server.args,
                "env": server.env,
                "description": server.description
            }

        files.append(
            AntigravityFile(
                path=".agents/mcp_config.json",
                content=json.dumps(mcp_dict, indent=2),
                file_type="mcp_config"
            )
        )

        # 4. Architecture Blueprint: docs/ARCHITECTURE.md
        arch_content = (
            f"# {domain.domain_name} Autonomous Multi-Agent Specification\n\n"
            f"## 1. Executive Summary\n"
            f"{domain.executive_summary}\n\n"
            f"## 2. Multi-Agent Topology & Communication Graph\n\n"
            f"```mermaid\n"
            f"graph TD\n"
            f"    User([External Request / Trigger]) --> {topology.orchestrator_id}[{topology.agents[0].name}]\n"
        )
        for sub in topology.agents[1:]:
            arch_content += f"    {topology.orchestrator_id} <-->|Delegation / Response| {sub.agent_id}[{sub.name}]\n"

        arch_content += (
            f"```\n\n"
            f"## 3. Communication Channels\n\n"
            f"| Channel ID | From | To | Protocol | Description |\n"
            f"| :--- | :--- | :--- | :--- | :--- |\n"
        )
        for ch in topology.channels:
            arch_content += f"| `{ch.channel_id}` | `{ch.from_agent}` | `{ch.to_agent}` | `{ch.protocol_type}` | {ch.description} |\n"

        arch_content += (
            f"\n## 4. Domain Data Entities\n\n"
        )
        for ent in domain.entities:
            arch_content += f"- **{ent.name}**: {ent.description} (Attributes: `{', '.join(ent.key_attributes)}`)\n"

        arch_content += (
            f"\n## 5. Security and Compliance Policies\n\n"
        )
        for pol in domain.compliance_and_security:
            arch_content += f"- {pol}\n"

        files.append(
            AntigravityFile(
                path="docs/ARCHITECTURE.md",
                content=arch_content,
                file_type="doc"
            )
        )

        return files
