"""
Domain & Pain Miner Agent.
Deconstructs raw business ideas into domain entities, critical workflows,
stakeholder personas, and prioritized operational pain points.
"""

from typing import Dict, Any, List
import re
from mcp_generator.agents.base import BaseAgent
from mcp_generator.communication import MessageBus
from mcp_generator.models import DomainAnalysis, DomainEntity, PainPoint
from mcp_generator.profiles import SpecializationProfile, registry


class DomainMinerAgent(BaseAgent):
    """
    Specialized subagent that identifies core entities, frictional pain points,
    and business invariants from unstructured business ideas.
    """

    def __init__(self, message_bus: MessageBus):
        super().__init__(
            agent_id="agent-domain-miner",
            name="Domain & Pain Miner",
            role="Domain Knowledge and Pain Point Extraction Specialist",
            message_bus=message_bus
        )

    def process_task(self, task_payload: Dict[str, Any]) -> Dict[str, Any]:
        idea = task_payload.get("business_idea", "").strip()
        profile_id = task_payload.get("profile_id", "generic")
        profile: SpecializationProfile = registry.get_profile(profile_id)

        analysis = self._mine_domain(idea, profile)
        return {"domain_analysis": analysis.model_dump()}

    def _mine_domain(self, idea: str, profile: SpecializationProfile) -> DomainAnalysis:
        # Extract title / domain name with Unicode support for international languages
        words = re.findall(r"[^\W\d_]+", idea, re.UNICODE)
        domain_name = " ".join(words[:5]).title() if words else "Autonomous Business Domain"

        # Generate entities from idea and profile
        entities: List[DomainEntity] = []
        for ent_name in profile.common_entities:
            entities.append(
                DomainEntity(
                    name=ent_name,
                    description=f"Primary domain resource representing {ent_name.lower()} in the system.",
                    key_attributes=["id", "status", "created_at", "metadata"]
                )
            )

        # Dynamic entity detection from idea keywords
        keywords = set(w.lower() for w in words)
        candidate_terms = [
            ("ticket", "Support Ticket", ["ticket_id", "urgency", "customer_id"]),
            ("invoice", "Billing Invoice", ["invoice_id", "amount", "due_date", "status"]),
            ("inventory", "Warehouse Stock Item", ["sku", "available_quantity", "location"]),
            ("payment", "Financial Settlement", ["transaction_id", "gateway", "currency"]),
            ("patient", "Medical Patient Record", ["patient_id", "triage_score", "doctor_id"]),
            ("user", "User Account & Role", ["user_id", "tier", "email", "permissions"]),
        ]
        for term, label, attrs in candidate_terms:
            if term in keywords and not any(e.name == label for e in entities):
                entities.append(
                    DomainEntity(
                        name=label,
                        description=f"Extracted dynamic entity for {label.lower()}.",
                        key_attributes=attrs
                    )
                )

        # Compile pain points
        pain_points: List[PainPoint] = []
        for p in profile.standard_pain_points:
            pain_points.append(
                PainPoint(
                    title=p["title"],
                    description=p["description"],
                    severity=p.get("severity", "medium"),
                    affected_stakeholders=["Operations Team", "End Customers"],
                    automation_opportunity=p["automation_opportunity"]
                )
            )

        # Workflows
        workflows = [
            f"End-to-end ingestion and triage of incoming {domain_name} requests",
            "Multi-subagent validation against security, policy and compliance constraints",
            "Autonomous execution of approved actions with rollback and fallback hooks",
            "Continuous anomaly detection and automated audit trail generation"
        ]

        # Compliance & Security
        compliance = [
            "Principle of Least Privilege: Subagents only hold tools matching their exact scope.",
            "Two-Phase Commit for High Stakes: Irreversible write operations require approval or sandbox checks.",
            "Immutable Audit Logging: All inter-agent message exchanges and tool calls are recorded."
        ]

        return DomainAnalysis(
            domain_name=domain_name,
            executive_summary=(
                f"Autonomous agent system tailored for {profile.industry}. "
                f"Addresses primary operational friction in '{idea[:120]}...' through specialized multi-agent collaboration."
            ),
            target_users=["Operations Leads", "Domain Experts", "End Customers"],
            entities=entities,
            pain_points=pain_points,
            critical_workflows=workflows,
            compliance_and_security=compliance
        )
