"""
Tool & MCP Synthesizer Subagent.
Designs specific tools, parameter schemas, access tiers, and MCP server
configurations for each custom agent in the topology.
"""

from typing import Dict, Any, List
from mcp_generator.agents.base import BaseAgent
from mcp_generator.communication import MessageBus
from mcp_generator.models import (
    AgentTopology, ToolDefinition, MCPServerSpec
)
from mcp_generator.profiles import SpecializationProfile, registry


class ToolSynthesizerAgent(BaseAgent):
    """
    Subagent that designs toolsets and external MCP servers tailored for
    the autonomous agents based on the principle of least privilege.
    """

    def __init__(self, message_bus: MessageBus):
        super().__init__(
            agent_id="agent-tool-synthesizer",
            name="Tool & MCP Synthesizer",
            role="Tool Specification, Security Boundaries and MCP Server Architect",
            message_bus=message_bus
        )

    def process_task(self, task_payload: Dict[str, Any]) -> Dict[str, Any]:
        topology_dict = task_payload.get("topology", {})
        profile_id = task_payload.get("profile_id", "generic")
        profile: SpecializationProfile = registry.get_profile(profile_id)

        topology = AgentTopology(**topology_dict)
        updated_topology, mcp_servers = self._synthesize_tools(topology, profile)

        return {
            "topology": updated_topology.model_dump(),
            "mcp_servers": [s.model_dump() for s in mcp_servers]
        }

    def _synthesize_tools(self, topology: AgentTopology, profile: SpecializationProfile) -> tuple[AgentTopology, List[MCPServerSpec]]:
        mcp_servers: List[MCPServerSpec] = []

        # 1. Build MCP Servers from profile recommendations
        for mcp_item in profile.recommended_mcp_integrations:
            spec = MCPServerSpec(
                name=mcp_item["name"],
                description=mcp_item["description"],
                command=mcp_item.get("command", "python"),
                args=mcp_item.get("args", []),
                env={"ENV_MODE": "production", "LOG_LEVEL": "INFO"},
                tools=mcp_item.get("tools", [])
            )
            mcp_servers.append(spec)

        # 2. Add System-level inter-agent communication tool
        inter_agent_mcp = MCPServerSpec(
            name="inter-agent-bus-mcp",
            description="Antigravity subagent delegation and messaging bridge.",
            command="python",
            args=["-m", "mcp_generator.communication"],
            tools=["send_subagent_task", "query_subagent_status", "broadcast_system_event"]
        )
        mcp_servers.append(inter_agent_mcp)

        # 3. Assign specific tools to agents according to their role
        for agent in topology.agents:
            if agent.is_orchestrator:
                agent.assigned_tools = [
                    ToolDefinition(
                        name="delegate_task_to_subagent",
                        description="Dispatches a structured task payload to a target subagent and awaits correlated response.",
                        parameters={
                            "type": "object",
                            "properties": {
                                "target_agent_id": {"type": "string", "enum": agent.subagents},
                                "task_type": {"type": "string"},
                                "payload": {"type": "object"}
                            },
                            "required": ["target_agent_id", "task_type", "payload"]
                        },
                        returns="AgentResponseObject",
                        access_tier="read_only",
                        suggested_mcp_server="inter-agent-bus-mcp"
                    ),
                    ToolDefinition(
                        name="request_human_authorization",
                        description="Pauses the autonomous execution to present high-risk actions to a human operator for sign-off.",
                        parameters={
                            "type": "object",
                            "properties": {
                                "action_summary": {"type": "string"},
                                "risk_assessment": {"type": "string"},
                                "proposed_payload": {"type": "object"}
                            },
                            "required": ["action_summary", "risk_assessment", "proposed_payload"]
                        },
                        returns="ApprovalStatusObject",
                        access_tier="requires_human_approval",
                        suggested_mcp_server="inter-agent-bus-mcp"
                    )
                ]
            else:
                # Assign domain-specific tools to subagents
                role_lower = agent.role.lower()
                if "data" in role_lower or "ingestion" in role_lower or "inventory" in role_lower or "kyc" in role_lower:
                    agent.assigned_tools = [
                        ToolDefinition(
                            name=f"query_{agent.agent_id.replace('-', '_')}_records",
                            description=f"Fetches read-only data relevant to {agent.role}.",
                            parameters={
                                "type": "object",
                                "properties": {
                                    "query_filter": {"type": "string"},
                                    "limit": {"type": "integer", "default": 20}
                                },
                                "required": ["query_filter"]
                            },
                            returns="Array<DomainRecord>",
                            access_tier="read_only",
                            suggested_mcp_server=mcp_servers[0].name
                        )
                    ]
                elif "fraud" in role_lower or "risk" in role_lower or "compliance" in role_lower:
                    agent.assigned_tools = [
                        ToolDefinition(
                            name="evaluate_risk_signals",
                            description="Executes heuristic analysis and statistical anomaly verification.",
                            parameters={
                                "type": "object",
                                "properties": {
                                    "entity_id": {"type": "string"},
                                    "signal_payload": {"type": "object"}
                                },
                                "required": ["entity_id", "signal_payload"]
                            },
                            returns="RiskScoreEvaluation",
                            access_tier="read_only",
                            suggested_mcp_server=mcp_servers[0].name
                        ),
                        ToolDefinition(
                            name="flag_suspicious_entity",
                            description="Applies a temporary hold or security flag to an entity.",
                            parameters={
                                "type": "object",
                                "properties": {
                                    "entity_id": {"type": "string"},
                                    "reason": {"type": "string"},
                                    "severity": {"type": "string", "enum": ["low", "medium", "high", "critical"]}
                                },
                                "required": ["entity_id", "reason", "severity"]
                            },
                            returns="HoldConfirmation",
                            access_tier="write_sandbox",
                            suggested_mcp_server=mcp_servers[0].name
                        )
                    ]
                else:
                    # Operational / Executor
                    agent.assigned_tools = [
                        ToolDefinition(
                            name="execute_state_transition",
                            description=f"Applies operational update for {agent.name}.",
                            parameters={
                                "type": "object",
                                "properties": {
                                    "target_id": {"type": "string"},
                                    "new_state": {"type": "string"},
                                    "idempotency_key": {"type": "string"}
                                },
                                "required": ["target_id", "new_state", "idempotency_key"]
                            },
                            returns="ExecutionResult",
                            access_tier="write_sandbox",
                            suggested_mcp_server=mcp_servers[0].name
                        )
                    ]

        return topology, mcp_servers
