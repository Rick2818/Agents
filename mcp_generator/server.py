"""
MCP Server Implementation for Autonomous Multi-Agent Generator.
Exposes tools via FastMCP over standard stdio transport for Google Antigravity,
Claude Desktop, Cursor, and any standard MCP client.
"""

from typing import Dict, Any, List, Optional
import os
import json
from mcp.server.fastmcp import FastMCP
from mcp_generator.agents.orchestrator import OrchestratorAgent
from mcp_generator.profiles import registry, SpecializationProfile
from mcp_generator.models import FullAgentSpecification

# Initialize FastMCP server
mcp = FastMCP("mcp-agent-generator")
orchestrator = OrchestratorAgent()


@mcp.tool()
def list_specialization_profiles() -> List[Dict[str, str]]:
    """
    Lists all available industry specialization profiles (Domain Packs)
    supported by the generator (e.g. generic, ecommerce, fintech).
    """
    return registry.list_profiles()


@mcp.tool()
def register_specialization_profile(
    profile_id: str,
    name: str,
    industry: str,
    common_entities: List[str],
    standard_pain_points: List[Dict[str, str]],
    recommended_roles: List[Dict[str, Any]],
    recommended_mcp_integrations: List[Dict[str, Any]]
) -> Dict[str, Any]:
    """
    Dynamically registers a new industry specialization profile (Domain Pack)
    to tailor agent roles, pains, and tools to a specific vertical.
    """
    profile = SpecializationProfile(
        profile_id=profile_id,
        name=name,
        industry=industry,
        common_entities=common_entities,
        standard_pain_points=standard_pain_points,
        recommended_roles=recommended_roles,
        recommended_mcp_integrations=recommended_mcp_integrations
    )
    registry.register_profile(profile)
    return {
        "status": "SUCCESS",
        "message": f"Specialization profile '{profile_id}' successfully registered.",
        "profile": profile.model_dump()
    }


@mcp.tool()
def analyze_business_idea(
    business_idea: str,
    industry_focus: str = "generic"
) -> Dict[str, Any]:
    """
    Extracts domain entities, operational friction, stakeholder personas,
    and prioritized pain points from a raw business idea.
    """
    result = orchestrator.miner.process_task({
        "business_idea": business_idea,
        "profile_id": industry_focus
    })
    return result["domain_analysis"]


@mcp.tool()
def design_agent_topology(
    business_idea: str,
    industry_focus: str = "generic"
) -> Dict[str, Any]:
    """
    Designs the multi-agent system architecture: Master Orchestrator,
    specialized subagents, inter-agent communication channels, and routing table.
    """
    miner_result = orchestrator.miner.process_task({
        "business_idea": business_idea,
        "profile_id": industry_focus
    })
    designer_result = orchestrator.designer.process_task({
        "domain_analysis": miner_result["domain_analysis"],
        "profile_id": industry_focus
    })
    return designer_result["topology"]


@mcp.tool()
def synthesize_agent_tools(
    business_idea: str,
    industry_focus: str = "generic"
) -> Dict[str, Any]:
    """
    Designs toolsets, parameter schemas, access tiers (least privilege),
    and external MCP server requirements for each agent in the system.
    """
    miner_result = orchestrator.miner.process_task({
        "business_idea": business_idea,
        "profile_id": industry_focus
    })
    designer_result = orchestrator.designer.process_task({
        "domain_analysis": miner_result["domain_analysis"],
        "profile_id": industry_focus
    })
    synthesizer_result = orchestrator.synthesizer.process_task({
        "topology": designer_result["topology"],
        "profile_id": industry_focus
    })
    return {
        "topology_with_tools": synthesizer_result["topology"],
        "required_mcp_servers": synthesizer_result["mcp_servers"]
    }


@mcp.tool()
def generate_full_agent_specification(
    business_idea: str,
    industry_focus: str = "generic",
    ai_model: str = "gemini-2.5-flash"
) -> Dict[str, Any]:
    """
    Transforms any business idea into the complete technical specification
    of an autonomous multi-agent system, including Antigravity artifacts.
    """
    spec = orchestrator.synthesize_agent_system(
        business_idea=business_idea,
        profile_id=industry_focus,
        ai_model=ai_model
    )
    return spec.model_dump()


@mcp.tool()
def create_agent_from_pain(
    unsolved_pain: str,
    industry_focus: str = "generic",
    ai_model: str = "gemini-2.5-flash"
) -> Dict[str, Any]:
    """
    Creates a customized Antigravity Custom Agent tailored to solve a specific,
    unsolved business pain point using Gemini Flash 2.5 architecture.
    """
    spec = orchestrator.synthesize_agent_system(
        business_idea=unsolved_pain,
        profile_id=industry_focus,
        ai_model=ai_model,
        unsolved_pain=unsolved_pain
    )
    return spec.model_dump()


@mcp.tool()
def simulate_multiagent_workflow(
    business_idea: str,
    sample_input: str,
    industry_focus: str = "generic"
) -> Dict[str, Any]:
    """
    Simulates step-by-step communication between the generated Master Orchestrator
    and Subagents when handling a sample business trigger or request.
    """
    spec = orchestrator.synthesize_agent_system(business_idea, industry_focus)
    simulation_result = orchestrator.simulate_workflow(spec, sample_input)
    return simulation_result


@mcp.tool()
def export_antigravity_workspace(
    business_idea: str,
    output_directory: str,
    industry_focus: str = "generic"
) -> Dict[str, Any]:
    """
    Compiles and writes the complete Antigravity workspace structure
    (.agents/rules/AGENTS.md, skills/, mcp_config.json, docs/ARCHITECTURE.md)
    directly to the specified output folder.
    """
    spec = orchestrator.synthesize_agent_system(business_idea, industry_focus)
    abs_output = os.path.abspath(output_directory)
    written_files = orchestrator.export_to_filesystem(spec, abs_output)
    return {
        "status": "SUCCESS",
        "output_directory": abs_output,
        "files_created_count": len(written_files),
        "files": written_files,
        "specification_id": spec.spec_id
    }


def run_server():
    """Runs the FastMCP server over stdio transport."""
    mcp.run()


if __name__ == "__main__":
    run_server()
