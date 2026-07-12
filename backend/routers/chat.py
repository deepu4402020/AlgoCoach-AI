from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional
from agents.graph import graph_app
from langchain_core.messages import HumanMessage, AIMessage

router = APIRouter()

# Global variable to store last route for debugging
LAST_ROUTE = "general_chat"

# Define models directly here to keep things simple for Stage 1
class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    history: List[ChatMessage] = []

class ChatResponse(BaseModel):
    reply: Optional[str] = None
    error: Optional[str] = None

@router.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    global LAST_ROUTE
    
    # We ignore the frontend history and rely on LangGraph's checkpointer
    # For now, we use a single hardcoded thread_id
    config = {"configurable": {"thread_id": "default_thread"}}
    
    # Convert user message to LangChain format
    input_message = HumanMessage(content=request.message)
    
    final_reply = ""
    
    try:
        # We collect all chunks from astream
        async for event in graph_app.astream({"messages": [input_message]}, config, stream_mode="values"):
            # astream with stream_mode="values" yields the full state after each node
            
            # Keep track of the route for debugging
            if "route" in event:
                LAST_ROUTE = event["route"]
                
            # We want the last message in the state
            if "messages" in event and event["messages"]:
                last_msg = event["messages"][-1]
                if isinstance(last_msg, AIMessage):
                    final_reply = last_msg.content
                    
        return ChatResponse(reply=final_reply)
        
    except Exception as e:
        print(f"Error in chat endpoint: {e}")
        import traceback
        traceback.print_exc()
        return ChatResponse(error="Oops! AlgoCoach is having trouble connecting to its brain right now. Please try again later.")
