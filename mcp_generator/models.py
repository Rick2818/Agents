"""
Domain models and schemas for MCP Generator and Multi-Agent Orchestration.
"""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
import uuid
from datetime import datetime, timezone


class PainPoint(BaseModel):
    id: str = Field(default_factory=lambda: f"pain-{uuid.uuid4().hex[:6]}")
    title: str
    description: str
    severity: str = "medium"  # low, medium, high, critical
    affected_stakeholders: List[str] = Field(default_factory=list)
    automation_opportunity: str


class DomainEntity(BaseModel):
    name: str
    description: str
    key_attributes: List[str] = Field(default_factory=list)


class DomainAnalysis(BaseModel):
    domain_name: str
    executive_summary: str
    target_users: List[str] = Field(default_factory=list)
    entities: List[DomainEntity] = Field(default_factory=list)
    pain_points: List[PainPoint] = Field(default_factory=list)
    critical_workflows: List[str] = Field(default_factory=list)
    compliance_and_security: List[str] = Field(default_factory=list)


class ToolDefinition(BaseModel):
    name: str
    description: str
    parameters: Dict[str, Any] = Field(default_factory=dict)
    returns: str = "string"
    access_tier: str = "read_only"  # read_only, write_sandbox, requires_human_approval
    suggested_mcp_server: Optional[str] = None


class MCPServerSpec(BaseModel):
    name: str
    description: str
    command: str = "python"
    args: List[str] = Field(default_factory=list)
    env: Dict[str, str] = Field(default_factory=dict)
    tools: List[str] = Field(default_factory=list)


class AgentDefinition(BaseModel):
    agent_id: str
    name: str
    role: str
    is_orchestrator: bool = False
    system_prompt: str
    model: str = "gemini-2.5-flash"
    assigned_tools: List[ToolDefinition] = Field(default_factory=list)
    subagents: List[str] = Field(default_factory=list)
    can_communicate_with: List[str] = Field(default_factory=list)
    subscribed_events: List[str] = Field(default_factory=list)


class CommunicationChannel(BaseModel):
    channel_id: str
    from_agent: str
    to_agent: str
    protocol_type: str = "direct_rpc"  # direct_rpc, async_queue, pubsub_broadcast, escalation
    description: str


class AgentTopology(BaseModel):
    orchestrator_id: str
    agents: List[AgentDefinition]
    channels: List[CommunicationChannel]
    routing_table: Dict[str, List[str]] = Field(default_factory=dict)


class AntigravityFile(BaseModel):
    path: str
    content: str
    file_type: str  # rule, skill, mcp_config, plugin, doc


class AgentMessage(BaseModel):
    message_id: str = Field(default_factory=lambda: f"msg-{uuid.uuid4().hex[:8]}")
    sender_id: str
    recipient_id: str
    correlation_id: str = Field(default_factory=lambda: f"corr-{uuid.uuid4().hex[:8]}")
    message_type: str  # task_assignment, task_result, query, broadcast, status
    payload: Dict[str, Any] = Field(default_factory=dict)
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class SpecializationProfile(BaseModel):
    profile_id: str
    name: str
    industry: str
    common_entities: List[str] = Field(default_factory=list)
    standard_pain_points: List[Dict[str, str]] = Field(default_factory=list)
    recommended_roles: List[Dict[str, Any]] = Field(default_factory=list)
    recommended_mcp_integrations: List[Dict[str, Any]] = Field(default_factory=list)


class FullAgentSpecification(BaseModel):
    spec_id: str = Field(default_factory=lambda: f"spec-{uuid.uuid4().hex[:8]}")
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    business_idea: str
    unsolved_pain: Optional[str] = None
    ai_model: str = "gemini-2.5-flash"
    industry_profile: str
    domain_analysis: DomainAnalysis
    topology: AgentTopology
    mcp_servers: List[MCPServerSpec]
    antigravity_artifacts: List[AntigravityFile]
    simulation_scenarios: List[Dict[str, Any]] = Field(default_factory=list)
