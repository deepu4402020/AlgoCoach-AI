from typing import TypedDict, Annotated, Optional
from langchain_core.messages import BaseMessage
import operator

def add_messages(left: list[BaseMessage], right: list[BaseMessage]):
    # This is a simple reducer to append new messages to the existing list.
    # LangGraph has a built-in add_messages reducer, but we can just do this or use theirs.
    # Actually, using operator.add or the built-in is better.
    return left + right

class CoachState(TypedDict):
    # The messages in the conversation
    messages: Annotated[list[BaseMessage], operator.add]
    
    # User session/ID
    user_id: str
    
    # The current problem they are working on (if any)
    current_problem: Optional[str]
    
    # How much help we've given them (0 = clarifying, 1 = nudge, 2 = pseudocode, 3+ = walkthrough)
    hint_level: int
    
    # RAG context retrieved for this turn
    retrieved_context: list[str]
    
    # The route decided by the supervisor
    route: str
