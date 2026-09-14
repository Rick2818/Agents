"""
Topology & Protocol Designer Subagent.
Designs the multi-agent graph, agent roles, inter-agent communication channels,
and routing tables tailored to the extracted domain.
"""

from typing import Dict, Any, List
import uuid
from mcp_generator.agents.base import BaseAgent
from mcp_generator.communication import MessageBus
from mcp_generator.models import (
    AgentTopology, AgentDefinition, CommunicationChannel, DomainAnalysis
)
from mcp_generator.profiles import SpecializationProfile, registry


class TopologyDesignerAgent(BaseAgent):
    """
    Subagent that synthesizes the custom agent team architecture:
    Orchestrator + Subagents, message topologies, and RACI responsibilities.
    """

    def __init__(self, message_bus: MessageBus):
        super().__init__(
            agent_id="agent-topology-designer",
            name="Topology & Protocol Designer",
            role="Multi-Agent Architecture and Inter-Agent Communication Protocol Engineer",
            message_bus=message_bus
        )

    def process_task(self, task_payload: Dict[str, Any]) -> Dict[str, Any]:
        domain_dict = task_payload.get("domain_analysis", {})
        profile_id = task_payload.get("profile_id", "generic")
        profile: SpecializationProfile = registry.get_profile(profile_id)

        analysis = DomainAnalysis(**domain_dict)
        topology = self._design_topology(analysis, profile)
        return {"topology": topology.model_dump()}

    def _design_topology(self, analysis: DomainAnalysis, profile: SpecializationProfile) -> AgentTopology:
        orchestrator_id = "agent-orchestrator"
        subagent_defs: List[AgentDefinition] = []
        channels: List[CommunicationChannel] = []
        routing_table: Dict[str, List[str]] = {}

        # 1. Create Subagents from recommended roles
        subagent_ids: List[str] = []
        for idx, role_spec in enumerate(profile.recommended_roles):
            role_name = role_spec["role"]
            is_orch = role_spec.get("is_orchestrator", False)

            if is_orch:
                continue

            clean_slug = role_name.lower().replace(" ", "-").replace("&", "and")
            agent_id = f"subagent-{clean_slug}"
            subagent_ids.append(agent_id)

            system_prompt = (
                f"# Role: {role_name}\n\n"
                f"You are a specialized subagent operating within the {analysis.domain_name} ecosystem.\n"
                f"Your specific objective: {role_spec['focus']}\n\n"
                f"## Guidelines & Operational Invariants:\n"
                f"1. You communicate with the Master Orchestrator ({orchestrator_id}) via structured messages.\n"
                f"2. Validate all inputs against domain rules before invoking tools.\n"
                f"3. Emit status updates and explicit success/failure confirmations to the correlation trail.\n"
                f"4. If a critical anomaly or policy violation is detected, escalate immediately to {orchestrator_id}.\n"
            )

            subagent = AgentDefinition(
                agent_id=agent_id,
                name=role_name,
                role=role_name,
                is_orchestrator=False,
                system_prompt=system_prompt,
                can_communicate_with=[orchestrator_id],
                subscribed_events=["domain_event", "system_alert", f"{agent_id}_task"]
            )
            subagent_defs.append(subagent)

        # 2. Create Master Orchestrator
        orchestrator_prompt = (
            f"# Role: Master Orchestrator for {analysis.domain_name}\n\n"
            f"You are the central coordinator for the autonomous agent system.\n"
            f"You receive high-level requests, decompose them into tactical tasks, and delegate to your subagents:\n"
            + "\n".join([f"- **{s.name}** (`{s.agent_id}`): {s.role}" for s in subagent_defs]) +
            f"\n\n## Orchestration Rules:\n"
            f"1. Never attempt to execute specialized tasks directly if a subagent is provisioned for it.\n"
            f"2. Maintain strict correlation tracking across all inter-agent messages.\n"
            f"3. Synthesize the outputs from subagents before formulating final responses or executing state mutations.\n"
            f"4. Always enforce the human-in-the-loop gate for any irreversible or high-severity actions.\n"
        )

        orchestrator_def = AgentDefinition(
            agent_id=orchestrator_id,
            name=f"{analysis.domain_name} Master Orchestrator",
            role="System Orchestrator & Task Dispatcher",
            is_orchestrator=True,
            system_prompt=orchestrator_prompt,
            subagents=subagent_ids,
            can_communicate_with=subagent_ids,
            subscribed_events=["user_request", "escalation_alert", "subagent_status"]
        )

        all_agents = [orchestrator_def] + subagent_defs

        # 3. Define Communication Channels & Routing Table
        routing_table[orchestrator_id] = subagent_ids
        for sub in subagent_defs:
            routing_table[sub.agent_id] = [orchestrator_id]

            # Downstream channel (Orchestrator -> Subagent)
            channels.append(
                CommunicationChannel(
                    channel_id=f"chan-{orchestrator_id}-to-{sub.agent_id}",
                    from_agent=orchestrator_id,
                    to_agent=sub.agent_id,
                    protocol_type="direct_rpc",
                    description=f"Task delegation and query channel from Orchestrator to {sub.name}."
                )
            )

            # Upstream channel (Subagent -> Orchestrator)
            channels.append(
                CommunicationChannel(
                    channel_id=f"chan-{sub.agent_id}-to-{orchestrator_id}",
                    from_agent=sub.agent_id,
                    to_agent=orchestrator_id,
                    protocol_type="escalation",
                    description=f"Results return, status updates, and anomaly escalation from {sub.name}."
                )
            )

        # Broadcast Channel for system-wide sync
        channels.append(
            CommunicationChannel(
                channel_id="chan-system-broadcast",
                from_agent=orchestrator_id,
                to_agent="*",
                protocol_type="pubsub_broadcast",
                description="Global event broadcast bus for lifecycle changes and emergency halts."
            )
        )

        return AgentTopology(
            orchestrator_id=orchestrator_id,
            agents=all_agents,
            channels=channels,
            routing_table=routing_table
        )
