from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional
from services.llm import generate_chat_reply

router = APIRouter()

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
def chat_endpoint(request: ChatRequest):
    history_dicts = [{"role": msg.role, "content": msg.content} for msg in request.history]
    
    result = generate_chat_reply(request.message, history_dicts)
    
    if "error" in result:
        return ChatResponse(error=result["error"])
        
    return ChatResponse(reply=result["reply"])
