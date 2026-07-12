from langgraph.graph import StateGraph, END
from langgraph.checkpoint.memory import MemorySaver

from agents.state import CoachState
from agents.nodes import (
    supervisor_node,
    concept_node,
    hint_node,
    review_node,
    general_node
)

def build_graph():
    # 1. Initialize the graph with the state schema
    workflow = StateGraph(CoachState)
    
    # 2. Add nodes
    workflow.add_node("supervisor", supervisor_node)
    workflow.add_node("concept", concept_node)
    workflow.add_node("hint", hint_node)
    workflow.add_node("review", review_node)
    workflow.add_node("general", general_node)
    
    # 3. Define the entry point
    workflow.set_entry_point("supervisor")
    
    # 4. Define the routing logic (conditional edges)
    def route_condition(state: CoachState) -> str:
        route = state.get("route", "general_chat")
        if route == "concept_question":
            return "concept"
        elif route == "hint_request":
            return "hint"
        elif route == "code_review_request":
            return "review"
        else:
            return "general"
            
    workflow.add_conditional_edges(
        "supervisor",
        route_condition,
        {
            "concept": "concept",
            "hint": "hint",
            "review": "review",
            "general": "general"
        }
    )
    
    # 5. Connect all nodes back to END (meaning the conversation turn is over)
    workflow.add_edge("concept", END)
    workflow.add_edge("hint", END)
    workflow.add_edge("review", END)
    workflow.add_edge("general", END)
    
    # 6. Compile the graph with a memory saver (checkpointer)
    memory = MemorySaver()
    app = workflow.compile(checkpointer=memory)
    
    return app

# Initialize the graph globally so it can be imported by the router
graph_app = build_graph()
