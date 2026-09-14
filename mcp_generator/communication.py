"""
Inter-Agent Communication Bus and Event Routing for Multi-Agent Systems.
"""

from typing import Dict, List, Optional, Callable, Any
from collections import defaultdict
import asyncio
from mcp_generator.models import AgentMessage


class MessageBus:
    """
    In-memory message bus and event broker facilitating inter-agent communication,
    task delegation, and multi-agent coordination transcripts.
    """

    def __init__(self):
        self._inboxes: Dict[str, List[AgentMessage]] = defaultdict(list)
        self._handlers: Dict[str, List[Callable[[AgentMessage], Any]]] = defaultdict(list)
        self._event_subscriptions: Dict[str, List[str]] = defaultdict(list)
        self._history: List[AgentMessage] = []

    def register_agent(self, agent_id: str):
        """Ensures an agent has an allocated inbox."""
        if agent_id not in self._inboxes:
            self._inboxes[agent_id] = []

    def subscribe_event(self, agent_id: str, event_topic: str):
        """Subscribes an agent to a broadcast event topic."""
        self._event_subscriptions[event_topic].append(agent_id)

    def register_handler(self, agent_id: str, handler: Callable[[AgentMessage], Any]):
        """Registers a callback handler for an agent."""
        self._handlers[agent_id].append(handler)

    def send(self, message: AgentMessage) -> AgentMessage:
        """
        Routes a point-to-point message directly to the recipient's inbox
        and invokes registered handlers if any.
        """
        self._history.append(message)
        self._inboxes[message.recipient_id].append(message)

        # Trigger synchronous handlers
        if message.recipient_id in self._handlers:
            for handler in self._handlers[message.recipient_id]:
                try:
                    handler(message)
                except Exception as e:
                    # Log error but don't break message delivery
                    pass

        return message

    def broadcast(self, sender_id: str, topic: str, payload: Dict[str, Any]) -> List[AgentMessage]:
        """
        Broadcasts an event message to all agents subscribed to the given topic.
        """
        subscribers = self._event_subscriptions.get(topic, [])
        dispatched: List[AgentMessage] = []

        for sub_id in subscribers:
            if sub_id == sender_id:
                continue
            msg = AgentMessage(
                sender_id=sender_id,
                recipient_id=sub_id,
                message_type="broadcast",
                payload={"topic": topic, **payload}
            )
            self.send(msg)
            dispatched.append(msg)

        return dispatched

    def fetch_inbox(self, agent_id: str, clear: bool = True) -> List[AgentMessage]:
        """Retrieves messages currently waiting in the agent's inbox."""
        messages = list(self._inboxes[agent_id])
        if clear:
            self._inboxes[agent_id].clear()
        return messages

    def get_transcript(self, correlation_id: Optional[str] = None) -> List[AgentMessage]:
        """Returns the full chronological transcript or filtered by correlation_id."""
        if correlation_id:
            return [m for m in self._history if m.correlation_id == correlation_id]
        return list(self._history)

    def clear(self):
        """Clears inboxes and history."""
        self._inboxes.clear()
        self._handlers.clear()
        self._event_subscriptions.clear()
        self._history.clear()
