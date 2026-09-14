"""
Specialization Profiles (Domain Packs) for MCP Generator.
Enables generic out-of-the-box operation and subsequent custom specialization.
"""

from typing import Dict, List, Optional
from mcp_generator.models import SpecializationProfile


GENERIC_PROFILE = SpecializationProfile(
    profile_id="generic",
    name="Generic Autonomous System Profile",
    industry="Cross-Industry / General Purpose",
    common_entities=[
        "Customer / End User",
        "Transaction / Order / Request",
        "Product / Service / Asset",
        "Notification / Audit Log",
        "Integration Endpoint / API"
    ],
    standard_pain_points=[
        {
            "title": "Manual Human Triage and Bottlenecks",
            "description": "Repetitive manual evaluations delay execution and cause operational friction.",
            "severity": "high",
            "automation_opportunity": "Autonomous classification and predictive dispatch."
        },
        {
            "title": "Data Fragmentation Across Disparate Tools",
            "description": "Information is siloed in legacy databases, spreadsheets, and external third-party APIs.",
            "severity": "high",
            "automation_opportunity": "Unified MCP-based data retrieval and entity reconciliation."
        },
        {
            "title": "Slow Incident Detection and Response",
            "description": "Failures, anomalies, or compliance deviations are caught only after customer complaints.",
            "severity": "critical",
            "automation_opportunity": "Real-time background monitoring subagents with proactive alert escalation."
        },
        {
            "title": "Human Error in Sensitive State Changes",
            "description": "Mistakes during high-stakes financial, operational, or access-granting actions.",
            "severity": "critical",
            "automation_opportunity": "Two-phase commit workflow with sandbox validation and human-in-the-loop approval gates."
        }
    ],
    recommended_roles=[
        {
            "role": "Master Orchestrator",
            "focus": "Deconstructs business goals, delegates subtasks, aggregates subagent outputs and reports status.",
            "is_orchestrator": True
        },
        {
            "role": "Data Ingestion & Extraction Specialist",
            "focus": "Interacts with external databases, APIs, documents, and sensors to parse structured domain models.",
            "is_orchestrator": False
        },
        {
            "role": "Policy, Risk & Compliance Guard",
            "focus": "Validates every action against security rules, SLA limits, and business invariant constraints.",
            "is_orchestrator": False
        },
        {
            "role": "Operational Executor & Dispatcher",
            "focus": "Carries out write operations, external webhook calls, notifications, and transactions with rollback safety.",
            "is_orchestrator": False
        }
    ],
    recommended_mcp_integrations=[
        {
            "name": "enterprise-db-mcp",
            "description": "Secure read/write gateway to application database with parameter validation.",
            "command": "python",
            "args": ["-m", "mcp_db_gateway"],
            "tools": ["query_records", "update_entity_state", "fetch_audit_history"]
        },
        {
            "name": "communication-channels-mcp",
            "description": "Unified notifications dispatcher (Email, Slack, Webhooks, SMS).",
            "command": "python",
            "args": ["-m", "mcp_notifications"],
            "tools": ["send_alert", "broadcast_event", "request_human_approval"]
        }
    ]
)

ECOMMERCE_PROFILE = SpecializationProfile(
    profile_id="ecommerce",
    name="E-Commerce & Digital Retail Operations",
    industry="E-Commerce / Retail",
    common_entities=[
        "Product SKU",
        "Cart & Checkout",
        "Order & Payment",
        "Inventory Stock",
        "Customer Lifetime Record",
        "Shipping & Tracking"
    ],
    standard_pain_points=[
        {
            "title": "Stockouts and Inaccurate Real-time Inventory",
            "description": "Items sold that are out of stock, leading to cancelled orders and poor NPS.",
            "severity": "high",
            "automation_opportunity": "Autonomous inventory reconciliation and multi-channel stock sync."
        },
        {
            "title": "Payment Fraud & Chargeback Risks",
            "description": "Suspicious transactions slip through basic rule filters, causing financial loss.",
            "severity": "critical",
            "automation_opportunity": "Heuristic fraud scoring subagent inspecting anomaly signals before settlement."
        },
        {
            "title": "Post-Purchase Support Overload (Where is my order?)",
            "description": "Support reps inundated with WISMO inquiries and return requests.",
            "severity": "medium",
            "automation_opportunity": "Autonomous customer fulfillment subagent providing instant tracking and automated returns."
        }
    ],
    recommended_roles=[
        {
            "role": "Commerce Operations Orchestrator",
            "focus": "Orchestrates order lifecycle, inventory allocation, and fulfillment coordination.",
            "is_orchestrator": True
        },
        {
            "role": "Inventory & Stock Synchronizer",
            "focus": "Monitors warehouse levels, predicts reorder dates, updates storefronts.",
            "is_orchestrator": False
        },
        {
            "role": "Fraud & Risk Guard",
            "focus": "Evaluates incoming orders for fraud patterns, carding attacks, and velocity limits.",
            "is_orchestrator": False
        },
        {
            "role": "Fulfillment & Customer Concierge",
            "focus": "Generates labels, interfaces with carrier APIs, sends delivery updates and handles returns.",
            "is_orchestrator": False
        }
    ],
    recommended_mcp_integrations=[
        {
            "name": "shopify-storefront-mcp",
            "description": "Storefront API connector for products, inventory, orders and customers.",
            "command": "python",
            "args": ["-m", "mcp_shopify"],
            "tools": ["get_order_details", "update_inventory_level", "create_refund", "fetch_customer_history"]
        },
        {
            "name": "carrier-shipping-mcp",
            "description": "FedEx/DHL/UPS API connector for label printing and status polling.",
            "command": "python",
            "args": ["-m", "mcp_shipping"],
            "tools": ["create_shipping_label", "track_shipment", "calculate_rates"]
        }
    ]
)

FINTECH_PROFILE = SpecializationProfile(
    profile_id="fintech",
    name="FinTech & Regulatory Compliance",
    industry="Financial Services / Banking",
    common_entities=[
        "User Account & KYC Tier",
        "Transaction Ledger Entry",
        "Suspicious Activity Report (SAR)",
        "Compliance Rule Engine",
        "Audit Trail"
    ],
    standard_pain_points=[
        {
            "title": "Slow KYC Verification and Onboarding Friction",
            "description": "Legitimate customers drop off during cumbersome document verification.",
            "severity": "high",
            "automation_opportunity": "Autonomous KYC document parser with biometric and sanctions list validation."
        },
        {
            "title": "Anti-Money Laundering (AML) Evasion",
            "description": "Smurfing and rapid transfer patterns evade simple threshold triggers.",
            "severity": "critical",
            "automation_opportunity": "Graph-based anomaly detection subagent checking cross-account velocity."
        }
    ],
    recommended_roles=[
        {
            "role": "FinTech Compliance Orchestrator",
            "focus": "Coordinates AML, ledger integrity, regulatory filings, and user tier transitions.",
            "is_orchestrator": True
        },
        {
            "role": "KYC & Identity Verification Agent",
            "focus": "Parses identity documents, verifies PEP/Sanction lists, assigns risk tiers.",
            "is_orchestrator": False
        },
        {
            "role": "Transaction Anomaly & Fraud Sentinel",
            "focus": "Continuous monitoring of transaction streams, holds risky transfers for review.",
            "is_orchestrator": False
        },
        {
            "role": "Audit & Regulatory Reporting Agent",
            "focus": "Maintains immutable tamper-evident logs and drafts SAR reports for human compliance officers.",
            "is_orchestrator": False
        }
    ],
    recommended_mcp_integrations=[
        {
            "name": "banking-ledger-mcp",
            "description": "Core banking ledger access with cryptographic signature verification.",
            "command": "python",
            "args": ["-m", "mcp_banking_ledger"],
            "tools": ["verify_balance", "freeze_account", "query_ledger_audit", "execute_transfer"]
        },
        {
            "name": "sanctions-watchlist-mcp",
            "description": "OFAC, Interpol, and PEP global watchlist verification tool.",
            "command": "python",
            "args": ["-m", "mcp_sanctions"],
            "tools": ["check_pep_status", "search_ofac_list", "calculate_country_risk"]
        }
    ]
)


class ProfileRegistry:
    """Registry maintaining both built-in and user-specialized domain packs."""

    def __init__(self):
        self._profiles: Dict[str, SpecializationProfile] = {
            GENERIC_PROFILE.profile_id: GENERIC_PROFILE,
            ECOMMERCE_PROFILE.profile_id: ECOMMERCE_PROFILE,
            FINTECH_PROFILE.profile_id: FINTECH_PROFILE,
        }

    def list_profiles(self) -> List[Dict[str, str]]:
        return [
            {
                "profile_id": p.profile_id,
                "name": p.name,
                "industry": p.industry,
                "pain_points_count": str(len(p.standard_pain_points)),
                "recommended_roles_count": str(len(p.recommended_roles))
            }
            for p in self._profiles.values()
        ]

    def get_profile(self, profile_id: Optional[str]) -> SpecializationProfile:
        if not profile_id:
            return self._profiles["generic"]
        return self._profiles.get(profile_id.lower(), self._profiles["generic"])

    def register_profile(self, profile: SpecializationProfile):
        self._profiles[profile.profile_id.lower()] = profile


# Global shared registry instance
registry = ProfileRegistry()
