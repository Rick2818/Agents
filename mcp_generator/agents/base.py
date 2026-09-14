"""
Base Agent Class for Multi-Agent Collaboration.
"""

from typing import Dict, Any, Optional
from mcp_generator.communication import MessageBus
from mcp_generator.models import AgentMessage


class BaseAgent:
    """
    Base autonomous custom agent capable of asynchronous messaging,
    task processing, and multi-agent coordination over the MessageBus.
    """

    def __init__(self, agent_id: str, name: str, role: str, message_bus: MessageBus):
        self.agent_id = agent_id
        self.name = name
        self.role = role
        self.bus = message_bus
        self.bus.register_agent(self.agent_id)
        self.bus.register_handler(self.agent_id, self.handle_incoming_message)
        self.memory: Dict[str, Any] = {}

    def send_message(self, recipient_id: str, message_type: str, payload: Dict[str, Any], correlation_id: Optional[str] = None) -> AgentMessage:
        """Sends a message to another agent on the bus."""
        msg = AgentMessage(
            sender_id=self.agent_id,
            recipient_id=recipient_id,
            correlation_id=correlation_id or f"corr-{self.agent_id}",
            message_type=message_type,
            payload=payload
        )
        return self.bus.send(msg)

    def broadcast_event(self, topic: str, payload: Dict[str, Any]):
        """Broadcasts an event to all subscribers."""
        return self.bus.broadcast(self.agent_id, topic, payload)

    def handle_incoming_message(self, message: AgentMessage):
        """Callback invoked when a message arrives in this agent's inbox."""
        # Store in local working memory
        self.memory[f"last_msg_{message.sender_id}"] = message.payload

    def process_task(self, task_payload: Dict[str, Any]) -> Dict[str, Any]:
        """Core execution logic to be implemented by specialized subagents."""
        raise NotImplementedError("Subclasses must implement process_task.")
