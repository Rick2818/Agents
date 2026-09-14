"""
Master Orchestrator Agent.
Coordinates internal subagents via the MessageBus to synthesize
the complete technical specification of the target multi-agent system.
"""

from typing import Dict, Any, List, Optional
import os
import uuid
from mcp_generator.agents.base import BaseAgent
from mcp_generator.communication import MessageBus
from mcp_generator.models import FullAgentSpecification, AgentMessage
from mcp_generator.agents.domain_miner import DomainMinerAgent
from mcp_generator.agents.topology_designer import TopologyDesignerAgent
from mcp_generator.agents.tool_synthesizer import ToolSynthesizerAgent
from mcp_generator.agents.package_builder import PackageBuilderAgent


class OrchestratorAgent(BaseAgent):
    """
    Master Architect and Pipeline Coordinator.
    Dispatches synthesis tasks to internal subagents, aggregates outputs,
    and runs multi-agent workflow simulations.
    """

    def __init__(self, message_bus: Optional[MessageBus] = None):
        bus = message_bus or MessageBus()
        super().__init__(
            agent_id="agent-generator-orchestrator",
            name="Generator Master Orchestrator",
            role="Synthesis Coordinator and Pipeline Architect",
            message_bus=bus
        )

        # Initialize specialized subagents on the bus
        self.miner = DomainMinerAgent(self.bus)
        self.designer = TopologyDesignerAgent(self.bus)
        self.synthesizer = ToolSynthesizerAgent(self.bus)
        self.builder = PackageBuilderAgent(self.bus)

    def synthesize_agent_system(
        self,
        business_idea: str,
        profile_id: str = "generic",
        ai_model: str = "gemini-2.5-flash",
        unsolved_pain: Optional[str] = None
    ) -> FullAgentSpecification:
        """
        Executes the multi-agent synthesis pipeline:
        1. Orchestrator -> DomainMinerAgent (extracts domain & pains)
        2. Orchestrator -> TopologyDesignerAgent (designs agents, channels, graph)
        3. Orchestrator -> ToolSynthesizerAgent (designs tools & MCP servers)
        4. Orchestrator -> PackageBuilderAgent (compiles Antigravity files & specs)
        """
        effective_idea = unsolved_pain if unsolved_pain else business_idea
        correlation_id = f"pipeline-{uuid.uuid4().hex[:8]}"

        # Step 1: Dispatch to DomainMinerAgent
        self.send_message(
            recipient_id=self.miner.agent_id,
            message_type="task_assignment",
            payload={"business_idea": effective_idea, "profile_id": profile_id},
            correlation_id=correlation_id
        )
        miner_result = self.miner.process_task({
            "business_idea": effective_idea,
            "profile_id": profile_id
        })
        self.send_message(
            recipient_id=self.agent_id,
            message_type="task_result",
            payload=miner_result,
            correlation_id=correlation_id
        )

        # Step 2: Dispatch to TopologyDesignerAgent
        self.send_message(
            recipient_id=self.designer.agent_id,
            message_type="task_assignment",
            payload={"domain_analysis": miner_result["domain_analysis"], "profile_id": profile_id},
            correlation_id=correlation_id
        )
        designer_result = self.designer.process_task({
            "domain_analysis": miner_result["domain_analysis"],
            "profile_id": profile_id
        })

        # Step 3: Dispatch to ToolSynthesizerAgent
        self.send_message(
            recipient_id=self.synthesizer.agent_id,
            message_type="task_assignment",
            payload={"topology": designer_result["topology"], "profile_id": profile_id},
            correlation_id=correlation_id
        )
        synthesizer_result = self.synthesizer.process_task({
            "topology": designer_result["topology"],
            "profile_id": profile_id
        })

        # Assign AI model (Gemini Flash 2.5) to all synthesized agents
        for agent_data in synthesizer_result["topology"]["agents"]:
            agent_data["model"] = ai_model

        # Step 4: Dispatch to PackageBuilderAgent
        builder_input = {
            "business_idea": effective_idea,
            "profile_id": profile_id,
            "domain_analysis": miner_result["domain_analysis"],
            "topology": synthesizer_result["topology"],
            "mcp_servers": synthesizer_result["mcp_servers"]
        }
        self.send_message(
            recipient_id=self.builder.agent_id,
            message_type="task_assignment",
            payload=builder_input,
            correlation_id=correlation_id
        )
        builder_result = self.builder.process_task(builder_input)

        spec_dict = builder_result["specification"]
        spec_dict["ai_model"] = ai_model
        spec_dict["unsolved_pain"] = effective_idea
        spec = FullAgentSpecification(**spec_dict)

        # Broadcast completion event
        self.broadcast_event(
            topic="specification_completed",
            payload={"spec_id": spec.spec_id, "domain": spec.domain_analysis.domain_name}
        )

        return spec

    def simulate_workflow(self, specification: FullAgentSpecification, input_trigger: str) -> Dict[str, Any]:
        """
        Simulates inter-agent communication for the synthesized multi-agent system.
        Shows how the generated orchestrator and subagents exchange tasks and resolve requests.
        """
        sim_bus = MessageBus()
        orch_id = specification.topology.orchestrator_id
        agents = {a.agent_id: a for a in specification.topology.agents}

        for a_id in agents:
            sim_bus.register_agent(a_id)

        transcript: List[Dict[str, Any]] = []

        # 1. External trigger arrives at the Master Orchestrator
        transcript.append({
            "step": 1,
            "sender": "external_user",
            "recipient": orch_id,
            "action": "TRIGGER",
            "content": f"Incoming operational event: {input_trigger}"
        })

        # 2. Orchestrator reasons and delegates to subagents sequentially
        step_idx = 2
        for agent in specification.topology.agents:
            if agent.is_orchestrator:
                continue

            # Orchestrator delegates task
            task_desc = f"Execute phase verification and domain operations for: {agent.name}"
            msg_delegation = AgentMessage(
                sender_id=orch_id,
                recipient_id=agent.agent_id,
                message_type="task_assignment",
                payload={"action": "PROCESS", "directive": task_desc}
            )
            sim_bus.send(msg_delegation)
            transcript.append({
                "step": step_idx,
                "sender": orch_id,
                "recipient": agent.agent_id,
                "action": "DELEGATE_TASK",
                "content": f"Delegating to {agent.name}: '{task_desc}'",
                "assigned_tools": [t.name for t in agent.assigned_tools]
            })
            step_idx += 1

            # Subagent replies
            tool_used = agent.assigned_tools[0].name if agent.assigned_tools else "domain_reasoning"
            msg_reply = AgentMessage(
                sender_id=agent.agent_id,
                recipient_id=orch_id,
                message_type="task_result",
                payload={"status": "SUCCESS", "tool_invoked": tool_used, "summary": f"Completed by {agent.name}"}
            )
            sim_bus.send(msg_reply)
            transcript.append({
                "step": step_idx,
                "sender": agent.agent_id,
                "recipient": orch_id,
                "action": "TASK_RESULT",
                "content": f"{agent.name} executed '{tool_used}' successfully with status=SUCCESS."
            })
            step_idx += 1

        # 3. Orchestrator consolidates and finalizes
        transcript.append({
            "step": step_idx,
            "sender": orch_id,
            "recipient": "external_user",
            "action": "SYNTHESIS_COMPLETE",
            "content": f"Master Orchestrator consolidated responses from all {len(agents)-1} subagents. Process completed within SLA limits."
        })

        return {
            "specification_id": specification.spec_id,
            "domain": specification.domain_analysis.domain_name,
            "total_steps": len(transcript),
            "transcript": transcript
        }

    def export_to_filesystem(self, specification: FullAgentSpecification, base_path: str) -> List[str]:
        """Writes the generated Antigravity files directly to the filesystem."""
        written_paths: List[str] = []
        for file in specification.antigravity_artifacts:
            full_path = os.path.join(base_path, file.path.replace("/", os.sep))
            os.makedirs(os.path.dirname(full_path), exist_ok=True)
            with open(full_path, "w", encoding="utf-8") as f:
                f.write(file.content)
            written_paths.append(full_path)
        return written_paths
