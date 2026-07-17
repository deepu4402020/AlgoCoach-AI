from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import List, Optional
from agents.graph import graph_app
from langchain_core.messages import HumanMessage, AIMessage
from models import User, ProblemAttempt
from dependencies import get_current_user
from database import get_db
from sqlalchemy.ext.asyncio import AsyncSession
import uuid

router = APIRouter()

# Global variable to store last route for debugging
LAST_ROUTE = "general_chat"

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    history: List[ChatMessage] = []

class ChatResponse(BaseModel):
    reply: Optional[str] = None
    error: Optional[str] = None

# A simple helper to guess pattern from text
def infer_pattern(text: str) -> str:
    text = text.lower()
    patterns = {
        "two pointers": "two-pointers",
        "sliding window": "sliding-window",
        "binary search": "binary-search",
        "knapsack": "dp-knapsack",
        "bfs": "graph-bfs-dfs",
        "dfs": "graph-bfs-dfs",
        "backtracking": "backtracking",
        "heap": "heaps",
        "trie": "tries"
    }
    for key, val in patterns.items():
        if key in text:
            return val
    return "unknown"

@router.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    global LAST_ROUTE
    
    # Use the user's ID as the thread ID to keep their session state
    config = {"configurable": {"thread_id": current_user.id}}
    
    input_message = HumanMessage(content=request.message)
    final_reply = ""
    final_state = None
    
    try:
        async for event in graph_app.astream({"messages": [input_message], "user_id": current_user.id}, config, stream_mode="values"):
            final_state = event
            if "route" in event:
                LAST_ROUTE = event["route"]
                
            if "messages" in event and event["messages"]:
                last_msg = event["messages"][-1]
                if isinstance(last_msg, AIMessage):
                    final_reply = last_msg.content
                    
        # Stage 4: Log problem attempt if routed to hint or review
        if final_state and LAST_ROUTE in ["hint_request", "code_review_request", "hint", "review"]:
            hint_level = final_state.get("hint_level", 0)
            pattern_tag = infer_pattern(request.message + " " + final_reply)
            
            outcome = "in_progress"
            if LAST_ROUTE in ["code_review_request", "review"] and "correct" in final_reply.lower():
                outcome = "solved"
                
            attempt = ProblemAttempt(
                user_id=current_user.id,
                problem_name="unknown",
                pattern_tag=pattern_tag,
                hint_level_reached=hint_level,
                outcome=outcome
            )
            db.add(attempt)
            await db.commit()

        return ChatResponse(reply=final_reply)
        
    except Exception as e:
        print(f"Error in chat endpoint: {e}")
        import traceback
        traceback.print_exc()
        return ChatResponse(error="Oops! AlgoCoach is having trouble connecting to its brain right now. Please try again later.")
